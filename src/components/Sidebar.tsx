import React from 'react';
import { useEngineStore } from '../store/engineStore';
import { Vocation } from '../types/combat';
import { useSimulation } from '../hooks/useSimulation';
import { BuildCodec } from '../core/buildCodec';
import BoxConfig from './BoxConfig';

const Sidebar: React.FC = () => {
  const store = useEngineStore();
  const { 
    vocation, setVocation, 
    level, setLevel, 
    baseSkills, setBaseSkill,
    partySynergy, setPartySynergy
  } = store;
  const { run, runAutoOptimize } = useSimulation();

  const handleExport = () => {
    // Generate Base64 Build String
    const buildState = {
      vocation: store.vocation,
      level: store.level,
      skills: store.baseSkills,
      gear: Object.fromEntries(
        Object.entries(store.activeGear).map(([slot, itemData]) => [
          slot, 
          { id: itemData?.item?.id, imbuements: itemData?.activeImbuements }
        ])
      ),
      wheel: Array.from(store.wheelManager['state'].nodes.values()).map(n => ({ id: n.id, pts: n.currentPoints }))
    };
    
    const base64 = btoa(JSON.stringify(buildState));
    const url = new URL(window.location.href);
    url.searchParams.set('build', base64);
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      alert('Build URL copied to clipboard!');
    });
  };

  const handleImport = () => {
    const code = prompt('Paste your Build code here:');
    if (code) {
      const imported = BuildCodec.importBuild(code);
      if (imported) {
        useEngineStore.setState(imported);
        alert('Build imported successfully!');
      } else {
        alert('Invalid build code.');
      }
    }
  };

  return (
    <aside className="pob-sidebar">
      <header className="pob-header">
        <h1>TIBIA OF BUILDING</h1>
        <div className="header-actions" style={{display: 'flex', gap: '8px', marginTop: '10px'}}>
          <button onClick={handleExport} id="btn-export" style={{background: '#3b82f6', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold'}}>Export Build</button>
          <button onClick={handleImport} id="btn-import" style={{background: '#10b981', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold'}}>Import Build</button>
        </div>
        <p className="subtitle">Path of Building for Tibia</p>
      </header>

      {/* 1. Character Config */}
      <section className="sidebar-section panel-config">
        <h2>Character Setup</h2>
        <div className="form-grid">
           <label>Vocation</label>
           <select 
              id="vocation" 
              value={vocation} 
              onChange={(e) => setVocation(e.target.value as Vocation)}
           >
            <option value="KNIGHT">Knight</option>
            <option value="PALADIN">Paladin</option>
            <option value="SORCERER">Sorcerer</option>
            <option value="DRUID">Druid</option>
           </select>

           <label>Level</label>
           <input 
              type="number" 
              id="level" 
              value={level} 
              onChange={(e) => setLevel(parseInt(e.target.value) || 1)}
              min="1" 
              max="2500" 
           />
        </div>
      </section>

      {/* 2. Base Skills & Combat Stats */}
      <section className="sidebar-section panel-skills">
        <h2>Base Skills (No Equip)</h2>
        <div className="form-grid">
          <label>Sword Fighting</label>
          <input type="number" id="skill-sword" value={baseSkills.sword} onChange={(e) => setBaseSkill('sword', parseInt(e.target.value) || 10)} min="10" max="160" />

          <label>Axe Fighting</label>
          <input type="number" id="skill-axe" value={baseSkills.axe} onChange={(e) => setBaseSkill('axe', parseInt(e.target.value) || 10)} min="10" max="160" />

          <label>Club Fighting</label>
          <input type="number" id="skill-club" value={baseSkills.club} onChange={(e) => setBaseSkill('club', parseInt(e.target.value) || 10)} min="10" max="160" />

          <label>Distance</label>
          <input type="number" id="skill-distance" value={baseSkills.distance} onChange={(e) => setBaseSkill('distance', parseInt(e.target.value) || 10)} min="10" max="160" />

          <label>Magic Level</label>
          <input type="number" id="skill-magic" value={baseSkills.magic} onChange={(e) => setBaseSkill('magic', parseInt(e.target.value) || 10)} min="0" max="150" />
        </div>
      </section>

      {/* 2.5 Party Synergy */}
      <section className="sidebar-section panel-synergy">
        <h2>Party Synergy</h2>
        <p className="help-text" style={{marginBottom: '10px'}}>Enable active party buffs</p>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer'}}>
            <input type="checkbox" checked={partySynergy.exposeFlaw} onChange={(e) => setPartySynergy({ exposeFlaw: e.target.checked })} />
            <span>Expose Flaw (MS +5% Dmg)</span>
          </label>
          <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer'}}>
            <input type="checkbox" checked={partySynergy.sapStrength} onChange={(e) => setPartySynergy({ sapStrength: e.target.checked })} />
            <span>Sap Strength (ED -10% Mob Dmg)</span>
          </label>
          <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer'}}>
            <input type="checkbox" checked={partySynergy.divineDazzle} onChange={(e) => setPartySynergy({ divineDazzle: e.target.checked })} />
            <span>Divine Dazzle (RP +2% Dmg)</span>
          </label>
          <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px'}}>
            <span style={{width: '90px'}}>Druid Sio (HP):</span>
            <input type="number" style={{width: '60px'}} value={partySynergy.sioHeal || 0} onChange={(e) => setPartySynergy({ sioHeal: parseInt(e.target.value) || 0 })} />
          </label>
        </div>
      </section>

      {/* 3. Global Engine Controls */}
      <section className="sidebar-section panel-engine">
        <h2>Simulator Controls</h2>
        <p className="help-text">Select your target Hunt Box below to calculate DPS vs Armor & Resistances.</p>
        
        <BoxConfig />
        
        <div className="engine-actions">
          <button id="btn-run-simulation" className="btn btn-primary" onClick={run}>Run Simulation</button>
          <button id="btn-auto-optimize" className="btn btn-primary" onClick={runAutoOptimize} style={{marginTop: '10px', background: 'var(--accent-secondary)'}}>Auto-Optimize Rotation</button>
        </div>
        
        <div id="ehp-analytics-container" style={{marginTop: '20px'}}></div>
      </section>
    </aside>
  );
};

export default Sidebar;
