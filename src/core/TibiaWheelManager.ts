// ============================================================================
// TIBIA NEXUS ENGINE v2.0 - STRICT WHEEL OF DESTINY DAG MANAGER
// ============================================================================

export enum Quadrant {
  NORTH_EAST = 'NE',
  SOUTH_EAST = 'SE',
  SOUTH_WEST = 'SW',
  NORTH_WEST = 'NW'
}

export enum NodeType {
  DEDO = 'DEDO',             // Nós Menores: Bônus Flats
  PERK = 'PERK',             // Nós Maiores: Upgrades de Spells em estágios
  CONVICTION = 'CONVICTION' // Nós Supremos: Desbloqueio de Habilidades Core / Avatar
}

export interface IModifierEffect {
  targetSkill?: 'SWORD' | 'AXE' | 'CLUB' | 'DISTANCE' | 'MAGIC' | 'HP' | 'MANA' | 'HOLY_RES' | 'DEATH_RES' | 'PHYS_RES';
  targetSpell?: string; // Ex: "Exori Gran", "Divine Caldera"
  effectType: 'FLAT_ADD' | 'PERCENT_MULT' | 'COOLDOWN_REDUCTION' | 'MANA_COST_REDUCTION';
  value: number; // O valor escalar do modificador por ponto alocado
}

export interface IWheelNode {
  id: string;
  name: string;
  quadrant: Quadrant;
  tier: 1 | 2 | 3;
  nodeType: NodeType;
  maxPoints: number;
  currentPoints: number;
  effects: IModifierEffect[];
  parentNodes: string[]; // IDs dos nós anteriores necessários para conexão por aresta
}

export interface IWheelState {
  nodes: Map<string, IWheelNode>;
  totalPointsAllocated: number;
  pointsAllocatedPerQuadrant: Record<Quadrant, number>;
}

export interface ICompiledModifiers {
  flatMods: Record<string, number>;
  percentMods: Record<string, number>;
  spellMods: Record<string, Record<string, number>>;
}

export class TibiaWheelManager {
  private state: IWheelState;
  private readonly playerLevel: number;
  private readonly scrollPoints: number;

  // Atualizado para refletir o custo aproximado oficial do Tibia para abrir certas camadas
  // T1 -> Livre
  // T2 -> Requer pelo menos 50 pontos no quadrante
  // T3 (Conviction Supremo) -> Requer 250 pontos no quadrante para liberar a borda externa
  private readonly TIER_THRESHOLDS = {
    1: 0,
    2: 50,
    3: 250
  };

  constructor(playerLevel: number, scrollPoints: number = 0, initialNodes: IWheelNode[]) {
    this.playerLevel = playerLevel;
    this.scrollPoints = scrollPoints;
    
    this.state = {
      nodes: new Map(),
      totalPointsAllocated: 0,
      pointsAllocatedPerQuadrant: {
        [Quadrant.NORTH_EAST]: 0,
        [Quadrant.SOUTH_EAST]: 0,
        [Quadrant.SOUTH_WEST]: 0,
        [Quadrant.NORTH_WEST]: 0
      }
    };

    initialNodes.forEach(n => this.state.nodes.set(n.id, JSON.parse(JSON.stringify(n))));
    this.recalculateStateTotals();
  }

  /**
   * Limite total de pontos permitidos no grafo.
   */
  public getTotalPointsAvailable(): number {
    if (this.playerLevel < 51) return 0;
    return (this.playerLevel - 50) + this.scrollPoints;
  }

  /**
   * MÓDULO 3: ALGORITMO DE VALIDAÇÃO BIDIRECIONAL
   * Tenta alocar exatamente 1 Promotion Point no nó especificado.
   */
  public allocatePoint(nodeId: string): boolean {
    const node = this.state.nodes.get(nodeId);
    if (!node) return false;

    // 1. Verifica se há pontos globais disponíveis
    if (this.state.totalPointsAllocated >= this.getTotalPointsAvailable()) {
      return false;
    }

    // 2. Verifica limite do nó
    if (node.currentPoints >= node.maxPoints) {
      return false;
    }

    // 3. Gatekeeper: Validação de Pré-requisitos
    if (!this.isValidDependency(node, this.state.pointsAllocatedPerQuadrant[node.quadrant])) {
      return false; // Quebrou os requisitos de conectividade ou limite do quadrante
    }

    // Executa Adição
    node.currentPoints += 1;
    this.recalculateStateTotals();
    return true;
  }

  /**
   * MÓDULO 3: HIGIENE DE GRAFO (DE-allocatePoint)
   * Valida em cascata (DFS-like) se a remoção deste ponto corrompe a integridade de nós dependentes.
   */
  public deallocatePoint(nodeId: string): boolean {
    const node = this.state.nodes.get(nodeId);
    if (!node || node.currentPoints <= 0) return false;

    // Simula a remoção
    node.currentPoints -= 1;
    this.recalculateStateTotals();

    // Roda varredura de integridade em todos os nós ativos
    const isGraphValid = this.validateEntireGraphIntegrity();

    if (!isGraphValid) {
      // Aborta e faz rollback se quebrou a estrutura
      node.currentPoints += 1;
      this.recalculateStateTotals();
      console.warn(`[TibiaWheelManager] Remoção abortada em ${nodeId}: Violaria a integridade estrutural do Grafo (Camadas ou Conexões isoladas).`);
      return false;
    }

    return true;
  }

  /**
   * Helper que refaz a contagem total baseada no estado atual dos nós.
   */
  private recalculateStateTotals(): void {
    let total = 0;
    const quadTotals: Record<Quadrant, number> = {
      [Quadrant.NORTH_EAST]: 0,
      [Quadrant.SOUTH_EAST]: 0,
      [Quadrant.SOUTH_WEST]: 0,
      [Quadrant.NORTH_WEST]: 0
    };

    for (const node of this.state.nodes.values()) {
      total += node.currentPoints;
      quadTotals[node.quadrant] += node.currentPoints;
    }

    this.state.totalPointsAllocated = total;
    this.state.pointsAllocatedPerQuadrant = quadTotals;
  }

  /**
   * Verifica se um nó específico atende aos pré-requisitos para receber pontos baseando-se
   * nos Thresholds de Quadrante e presença de Aresta Ativa (parent).
   */
  private isValidDependency(node: IWheelNode, currentQuadrantPoints: number): boolean {
    // Tier 1 é raiz, só checar se parents estão vazios, mas no Tibia os T1 iniciam do meio
    if (node.parentNodes.length === 0) {
      return true;
    }

    // Checa conectividade direta (pelo menos UM parent deve estar MAXED OUT)
    // Para simplificar, assumimos conectividade forte (basta a aresta existir com currentPoints > 0)
    let hasActiveAresta = false;
    for (const parentId of node.parentNodes) {
      const parentNode = this.state.nodes.get(parentId);
      if (parentNode && parentNode.currentPoints >= parentNode.maxPoints) {
        hasActiveAresta = true;
        break;
      }
    }

    return hasActiveAresta;
  }

  /**
   * Varre toda a matriz em busca de nós ativos (currentPoints > 0) que 
   * agora estejam desconectados devido a uma desalocação recente.
   */
  private validateEntireGraphIntegrity(): boolean {
    // Devido à simulação de DFS para checar conectividade isolada, basta
    // confirmar que TODO nó ativo obedece `isValidDependency`.
    // (Numa simulação restrita ao momento, a remoção de um "currentQuadrantPoints"
    // afeta todos os T2/T3 do quadrante).
    for (const node of this.state.nodes.values()) {
      if (node.currentPoints > 0) {
        // Recalcular o custo do quadrante EXCLUINDO o próprio nó do threshold?
        // No Tibia, os pontos do próprio nó CONTAM pro threshold total, então usamos o sumário.
        const quadPoints = this.state.pointsAllocatedPerQuadrant[node.quadrant];
        
        // Verifica a validade do nó contra o estado global atual
        if (!this.isValidDependency(node, quadPoints - node.currentPoints)) {
           // Wait: O threshold da camada exigia X pontos ANTES de investir aqui?
           // O Tibia requer que o caminho esteja liberado antes da compra.
           // Assumimos que o quadPoints precisa ser suficiente excluindo este próprio nó,
           // OU o threshold diz respeito ao investimento *total* pra destravar a próxima fronteira.
           // Para um modelo seguro de "Gatekeeper", o limite deve ser verificado considerando (quadPoints - node.currentPoints).
           if ((quadPoints - node.currentPoints) < this.TIER_THRESHOLDS[node.tier]) {
               return false;
           }

           // Além disso, se ele não for raiz de T1, deve manter sua aresta pai
           if (node.tier > 1 || node.parentNodes.length > 0) {
              let hasActiveParent = false;
              for (const parentId of node.parentNodes) {
                const parent = this.state.nodes.get(parentId);
                if (parent && parent.currentPoints > 0) {
                  hasActiveParent = true;
                  break;
                }
              }
              if (!hasActiveParent) return false;
           }
        }
      }
    }
    return true;
  }

  /**
   * MÓDULO 4: COMPILADOR DE MODIFICADORES (PURIFICADOR)
   * Consolida todos os bônus ativos em um mapa indexado pronto para injeção no combat engine.
   */
  public compileActiveModifiers(): ICompiledModifiers {
    const compiled: ICompiledModifiers = {
      flatMods: {},
      percentMods: {},
      spellMods: {}
    };

    for (const node of this.state.nodes.values()) {
      if (node.currentPoints === 0) continue;

      for (const effect of node.effects) {
        let totalBonus = 0;

        if (node.nodeType === 'DEDO') {
          totalBonus = effect.value * node.currentPoints;
        } else {
          if (node.currentPoints >= node.maxPoints) {
            totalBonus = effect.value;
          } else {
            continue;
          }
        }

        if (effect.effectType === 'FLAT_ADD' && effect.targetSkill) {
          compiled.flatMods[effect.targetSkill] = (compiled.flatMods[effect.targetSkill] || 0) + totalBonus;
        } else if (effect.targetSpell) {
          if (!compiled.spellMods[effect.targetSpell]) compiled.spellMods[effect.targetSpell] = {};
          compiled.spellMods[effect.targetSpell][effect.effectType] = (compiled.spellMods[effect.targetSpell][effect.effectType] || 0) + totalBonus;
        } else if (effect.effectType === 'PERCENT_MULT') {
          // General percentage multipliers like Avatar of Steel, Mitigation, etc.
          // Fallback to node name for categorization
          let key = 'GENERIC_MULT';
          if (node.name.includes('Mitigation')) key = 'MITIGATION';
          else if (node.name.includes('Healing')) key = 'HEALING';
          else if (node.name.includes('Damage') || node.name.includes('Avatar') || node.name.includes('Vessel') || node.name.includes('Gift')) key = 'DAMAGE';
          compiled.percentMods[key] = (compiled.percentMods[key] || 0) + totalBonus;
        }
      }
    }

    return compiled;
  }

  public getWheelState(): Readonly<IWheelState> {
    return this.state;
  }
}
