import { useEngineStore } from '../store/engineStore';
import { EngineBridge } from '../core/EngineBridge';

export const useSimulation = () => {
  const store = useEngineStore();

  const run = () => {
    const result = EngineBridge.runSimulation(store, store.partySynergy);
    
    // Format the logs for the UI
    const logs = [];
    logs.push({ type: 'HEADER', message: 'Predictive Simulation Finished (20s)' });
    logs.push({ type: 'STAT', label: 'Fitness Score', value: Math.round(result.fitnessScore) });
    logs.push({ type: 'STAT', label: 'Total Damage', value: `${Math.round(result.totalDamageDealt)} (approx ${Math.round(result.totalDamageDealt/20)} DPS)` });
    logs.push({ type: 'STAT', label: 'Damage Taken', value: Math.round(result.totalDamageReceived) });
    logs.push({ type: 'STAT', label: 'Net Mana Flow', value: Math.round(result.netManaFlow), good: result.netManaFlow >= 0 });
    logs.push({ type: 'STAT', label: 'Net HP Flow (Leech - Dmg Taken)', value: Math.round(result.netHpFlow), good: result.netHpFlow >= 0 });
    logs.push({ type: 'STAT', label: 'Valid Rotation', value: result.validRotation ? 'YES' : 'NO (Mana Bankruptcy)' });
    
    logs.push({ type: 'DIVIDER' });
    logs.push({ type: 'HEADER_SMALL', message: 'Optimal Timeline:' });
    
    result.timeline.forEach(event => {
      const ts = (event.tickMs / 1000).toFixed(1);
      logs.push({ type: 'EVENT', ts, name: event.name });
    });

    store.setSimulationLogs(logs);
    store.setAiUpgrades([]); // Clear AI upgrades when standard simulation runs
    if (result.dpsTimeline) store.setDpsTimeline(result.dpsTimeline);
    if (result.vitalsTimeline) store.setVitalsTimeline(result.vitalsTimeline);
    if (result.economy) store.setHuntReport(result.economy);
  };

  const runAI = () => {
    store.setSimulationLogs([{ type: 'HEADER', message: '🤖 AI Advisor is calculating thousands of permutations... Please wait.' }]);
    
    setTimeout(() => {
      const upgrades = EngineBridge.runAIAdvisor(store, store.partySynergy);
      store.setAiUpgrades(upgrades);
      store.setSimulationLogs([]); // Clear standard logs
    }, 100);
  };


  const runAutoOptimize = () => {
    store.setSimulationLogs([{ type: 'HEADER', message: '🤖 AI Advisor is calculating permutations of your spells...' }]);
    
    setTimeout(() => {
      // Helper to generate permutations (max 5 items)
      const permute = (arr: string[]): string[][] => {
        if (arr.length <= 1) return [arr];
        const result = [];
        for (let i = 0; i < arr.length; i++) {
          const current = arr[i];
          const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
          const remainingPermuted = permute(remaining);
          for (let j = 0; j < remainingPermuted.length; j++) {
            result.push([current, ...remainingPermuted[j]]);
          }
        }
        return result;
      };

      const topSpells = store.spellPriority.slice(0, 5); // Limit to top 5 to prevent browser freeze (120 perms)
      const otherSpells = store.spellPriority.slice(5);
      const permutations = permute(topSpells);

      let bestScore = -1;
      let bestSequence: string[] = [];

      permutations.forEach(perm => {
        const testPriority = [...perm, ...otherSpells];
        const testStore = { ...store, spellPriority: testPriority };
        const result = EngineBridge.runSimulation(testStore, store.partySynergy);
        if (result.fitnessScore > bestScore) {
          bestScore = result.fitnessScore;
          bestSequence = testPriority;
        }
      });

      // Apply winning sequence
      store.setSpellPriority(bestSequence);
      
      setTimeout(() => {
        // Run standard simulation with new sequence to render logs
        run();
      }, 50);

    }, 100);
  };

  return { run, runAI, runAutoOptimize };
};
