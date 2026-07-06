import React, { useState } from 'react';
import { useEngineStore } from '../store/engineStore';
import { SPELL_DATABASE } from '../core/spellDatabase';

const SpellsTab: React.FC = () => {
  const { spellPriority, setSpellPriority, reorderSpell, vocation } = useEngineStore();
  const [selectedSpell, setSelectedSpell] = useState<string>('');

  const handleAddSpell = () => {
    if (selectedSpell && !spellPriority.includes(selectedSpell)) {
      setSpellPriority([...spellPriority, selectedSpell]);
      setSelectedSpell('');
    }
  };

  const handleRemoveSpell = (idx: number) => {
    const arr = [...spellPriority];
    arr.splice(idx, 1);
    setSpellPriority(arr);
  };

  const handleClear = () => {
    setSpellPriority([]);
  };

  return (
    <div className="tab-panel active" id="tab-spells" style={{padding: '20px'}}>
      <div className="tab-header" style={{marginBottom: '20px'}}>
        <h2>Combat Rotation & Timeline Feed</h2>
        <p className="help-text">
          Configure the priority order of your spells. The simulator enforces strict parallel GCD tracks (Combat GCD: 2.0s, Support GCD: 1.0s) and individual spell cooldowns.
        </p>
      </div>

      <div style={{display: 'flex', gap: '20px'}}>
        {/* Left Side: Priority List */}
        <div style={{flex: '1', minWidth: '300px'}}>
          <div className="config-card">
            <h3>Rotation Actions (Weaved Sequence)</h3>
            
            <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
              <select 
                value={selectedSpell} 
                onChange={(e) => setSelectedSpell(e.target.value)}
                style={{flex: 1, padding: '6px', background: '#0f172a', color: 'white', border: '1px solid #475569', borderRadius: '4px'}}
              >
                <option value="">-- Select Spell to Add --</option>
                {Object.keys(SPELL_DATABASE).map(spellName => (
                  <option key={spellName} value={spellName}>{spellName}</option>
                ))}
              </select>
              <button 
                onClick={handleAddSpell} 
                style={{background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}
              >
                Add
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px'}}>
              {spellPriority.length === 0 ? (
                <div style={{color: '#64748b', fontStyle: 'italic', fontSize: '13px', textAlign: 'center', padding: '20px 0'}}>
                  No spells in rotation. Your character will only use basic attacks.
                </div>
              ) : (
                spellPriority.map((spellName, idx) => (
                  <div key={spellName} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', padding: '8px 12px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <span style={{color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', minWidth: '20px'}}>{idx + 1}.</span>
                      <span style={{color: '#f8fafc', fontSize: '13px', fontWeight: '500'}}>{spellName}</span>
                    </div>
                    <div style={{display: 'flex', gap: '4px'}}>
                      <button onClick={() => reorderSpell(idx, 'UP')} disabled={idx === 0} style={{background: '#334155', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.5 : 1}}>↑</button>
                      <button onClick={() => reorderSpell(idx, 'DOWN')} disabled={idx === spellPriority.length - 1} style={{background: '#334155', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: idx === spellPriority.length - 1 ? 'default' : 'pointer', opacity: idx === spellPriority.length - 1 ? 0.5 : 1}}>↓</button>
                      <button onClick={() => handleRemoveSpell(idx)} style={{background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px'}}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button onClick={handleClear} style={{background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', width: '100%'}}>
              Clear Full Rotation
            </button>
          </div>
        </div>

        {/* Right Side: Log Info */}
        <div style={{flex: '1'}}>
          <div className="config-card" style={{height: '100%'}}>
            <h3>Simulated Combat Timeline Log</h3>
            <p style={{fontSize: '13px', color: '#94a3b8', marginTop: '15px'}}>
              Note: A full interactive timeline rendering feature is planned for a future update. For now, check the <strong>Hunt Economy</strong> tab for your DPS report!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpellsTab;
