import React, { useState } from 'react';
import { useEngineStore } from '../store/engineStore';

const WheelTab: React.FC = () => {
  const { wheelManager, forceUpdateWheel } = useEngineStore();
  const [hoveredNode, setHoveredNode] = useState<any>(null);

  const handleAllocate = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const isShift = e.shiftKey;
    const isCtrl = e.ctrlKey;
    const node = wheelManager['state'].nodes.get(id);
    if (!node) return;
    
    let pts = 1;
    if (isShift) pts = node.maxPoints;
    if (isCtrl) pts = 50;

    for (let i = 0; i < pts; i++) wheelManager.allocatePoint(id);
    forceUpdateWheel();
        // and re-render gems just in case
    if ((window as any).renderGemSockets) {
       (window as any).renderGemSockets();
    }
  };

  const handleDeallocate = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const isShift = e.shiftKey;
    const isCtrl = e.ctrlKey;
    const node = wheelManager['state'].nodes.get(id);
    if (!node) return;
    
    let pts = 1;
    if (isShift) pts = node.maxPoints;
    if (isCtrl) pts = 50;

    for (let i = 0; i < pts; i++) wheelManager.deallocatePoint(id);
    forceUpdateWheel();
    if ((window as any).globalWheelManager) {
       for (let i = 0; i < pts; i++) (window as any).globalWheelManager.deallocatePoint(id);
    }
    if ((window as any).renderGemSockets) {
       (window as any).renderGemSockets();
    }
  };

  const nodesMap = wheelManager['state'].nodes;
  const nodes = Array.from(nodesMap.values());

  const getCoords = (node: any) => {
    if (node.uiPosition) {
      const rad = node.uiPosition.angle * (Math.PI / 180);
      return {
        x: 250 + node.uiPosition.radius * Math.cos(rad),
        y: 250 + node.uiPosition.radius * Math.sin(rad)
      };
    }
    return { x: 250, y: 250 };
  };

  const nodeCoords: Record<string, {x: number, y: number}> = {};
  nodes.forEach(node => {
    nodeCoords[node.id] = getCoords(node);
  });

  return (
    <div className="tab-panel active" id="tab-wheel">
      <div className="wheel-workspace">
        {/* SVG Wheel */}
        <div className="wheel-svg-container" style={{ position: 'relative' }}>
          <svg viewBox="0 0 500 500" width="500" height="500">
            {/* Draw Edges */}
            <g id="wheel-connections-react">
              {nodes.map(node => {
                const coords = nodeCoords[node.id];
                const isAllocated = node.currentPoints > 0;
                const color = isAllocated ? '#eab308' : '#334155';
                const strokeWidth = isAllocated ? 4 : 2;
                const lines = [];

                if (node.parentNodes && node.parentNodes.length > 0) {
                  node.parentNodes.forEach(parentId => {
                    const parentCoords = nodeCoords[parentId];
                    if (parentCoords) {
                      lines.push(
                        <line key={`${node.id}-${parentId}`} x1={parentCoords.x} y1={parentCoords.y} x2={coords.x} y2={coords.y} stroke={color} strokeWidth={strokeWidth} opacity="0.6" />
                      );
                    }
                  });
                } else {
                  lines.push(
                    <line key={`${node.id}-root`} x1="250" y1="250" x2={coords.x} y2={coords.y} stroke={color} strokeWidth={strokeWidth} opacity="0.6" />
                  );
                }
                return lines;
              })}
            </g>

            {/* Concentric circles */}
            <circle cx="250" cy="250" r="230" className="wheel-outer-border" />
            <circle cx="250" cy="250" r="180" className="wheel-ring-1" />
            <circle cx="250" cy="250" r="130" className="wheel-ring-2" />
            <circle cx="250" cy="250" r="80" className="wheel-ring-3" />
            
            {/* Draw Nodes */}
            <g id="wheel-nodes-group-react">
              {nodes.map(node => {
                const coords = nodeCoords[node.id];
                const isAllocated = node.currentPoints > 0;
                const isMaxed = node.currentPoints >= node.maxPoints;
                const fillColor = isAllocated ? (isMaxed ? '#eab308' : '#fde047') : '#0f172a';
                const strokeColor = isAllocated ? '#ca8a04' : '#334155';
                const tooltipText = `${node.name} (${node.currentPoints}/${node.maxPoints})`;

                if (node.nodeType === 'DEDO') {
                  return (
                    <circle 
                      key={node.id} 
                      cx={coords.x} cy={coords.y} r="12" fill={fillColor} stroke={strokeColor} strokeWidth="2" style={{cursor: 'pointer'}}
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={(e) => handleAllocate(e, node.id)}
                      onContextMenu={(e) => handleDeallocate(e, node.id)}
                    >
                      <title>{tooltipText}</title>
                    </circle>
                  );
                } else {
                  const size = 18;
                  const points = `${coords.x},${coords.y - size} ${coords.x + size},${coords.y} ${coords.x},${coords.y + size} ${coords.x - size},${coords.y}`;
                  return (
                    <polygon 
                      key={node.id}
                      points={points} fill={fillColor} stroke={strokeColor} strokeWidth="2" style={{cursor: 'pointer'}}
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={(e) => handleAllocate(e, node.id)}
                      onContextMenu={(e) => handleDeallocate(e, node.id)}
                    >
                      <title>{tooltipText}</title>
                    </polygon>
                  );
                }
              })}
            </g>

            <circle cx="250" cy="250" r="25" className="wheel-center-core" />
            <text x="250" y="255" textAnchor="middle" className="wheel-center-text">CORE</text>
          </svg>
        </div>
        
        {/* Wheel Sidebar Info */}
        <div className="wheel-sidebar">
          <div className="config-card">
            <h3>Destiny Points</h3>
            <div className="wheel-points-hud">
              <div className="point-box">
                <span className="point-label">Available</span>
                <span className="point-value">{wheelManager.getTotalPointsAvailable()}</span>
              </div>
              <div className="point-box">
                <span className="point-label">Allocated</span>
                <span className="point-value">{wheelManager['state'].totalPointsAllocated}</span>
              </div>
            </div>
          </div>
          
          {hoveredNode && (
            <div className="config-card" style={{borderColor: '#eab308'}}>
              <h3 style={{color: '#fef08a'}}>{hoveredNode.name}</h3>
              
              <div style={{marginTop: '10px', background: '#0f172a', padding: '10px', borderRadius: '4px', border: '1px solid #334155'}}>
                <span style={{fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px'}}>Per Point Gained:</span>
                <ul style={{margin: '5px 0 0 0', paddingLeft: '15px', color: '#38bdf8', fontSize: '12px', listStyleType: 'circle'}}>
                  {hoveredNode.effects.map((eff: any, idx: number) => {
                    let desc = '';
                    if (eff.effectType === 'FLAT_ADD') desc = `+${eff.value} ${eff.targetSkill}`;
                    if (eff.effectType === 'PERCENT_MULT') desc = `+${(eff.value * 100).toFixed(2)}% Power`;
                    if (eff.effectType === 'SPELL_AUG') desc = `+${(eff.value * 100).toFixed(0)}% Damage/Heal (${eff.targetSpell})`;
                    return <li key={idx}>{desc}</li>;
                  })}
                </ul>
              </div>
              
              <div style={{marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <div style={{fontSize: '12px', color: '#10b981', fontWeight: 'bold'}}>
                  Points: {hoveredNode.currentPoints} / {hoveredNode.maxPoints}
                </div>
                <div style={{flex: 1, height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden'}}>
                  <div style={{height: '100%', background: '#10b981', width: `${(hoveredNode.currentPoints / hoveredNode.maxPoints) * 100}%`}}></div>
                </div>
              </div>
              
              <p style={{fontSize: '11px', color: 'var(--border-accent)', marginTop: '15px', lineHeight: '1.4'}}>
                <strong>Click</strong> to Add Point<br/>
                <strong>Right-Click</strong> to Remove Point<br/>
                <strong>Shift+Click</strong> to Maximize
              </p>
            </div>
          )}
          
          <div className="config-card">
            <h3>Quadrant Gem Sockets (WIP)</h3>
            <p style={{fontSize: '12px', color: 'var(--text-muted)'}}>Unlock with 50 points per quadrant.</p>
            <div className="gem-socket locked" id="gem-socket-1-container">NW Socket (Locked)</div>
            <div className="gem-socket locked" id="gem-socket-2-container">NE Socket (Locked)</div>
            <div className="gem-socket locked" id="gem-socket-3-container">SW Socket (Locked)</div>
            <div className="gem-socket locked" id="gem-socket-4-container">SE Socket (Locked)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelTab;