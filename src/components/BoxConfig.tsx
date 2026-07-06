import React, { useState } from 'react';
import { useEngineStore } from '../store/engineStore';
import { BESTIARY_DATABASE } from '../core/bestiaryDatabase';
import { CharmType } from '../types/combat';

const BoxConfig: React.FC = () => {
  const { activeBoxConfig, addBoxMob, removeBoxMob, updateBoxConfig } = useEngineStore();
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddMob = () => {
    if (!searchTerm) return;
    const mobId = Object.keys(BESTIARY_DATABASE).find(k => BESTIARY_DATABASE[k].name?.toLowerCase() === searchTerm.toLowerCase() || k === searchTerm);
    if (mobId) {
      addBoxMob(mobId);
      setSearchTerm('');
    } else {
      alert("Monster not found in database.");
    }
  };

  return (
    <div className="sidebar-section panel-config" style={{marginTop: '10px'}}>
      <h2>Active Hunt Box ({activeBoxConfig.length}/8)</h2>
      
      <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
        <input 
          type="text" 
          list="mob-datalist"
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          onFocus={(e) => { e.target.value = ''; }}
          placeholder="Search monster..." 
          style={{flex: 1, padding: '4px', background: '#0f172a', color: 'white', border: '1px solid #475569', borderRadius: '4px', fontSize: '11px'}}
        />
        <datalist id="mob-datalist">
          {Object.entries(BESTIARY_DATABASE).map(([id, mob]) => (
            <option key={id} value={mob.name || id} />
          ))}
        </datalist>
        <button onClick={handleAddMob} style={{background: '#10b981', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px'}} disabled={activeBoxConfig.length >= 8}>Add</button>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
        {activeBoxConfig.map((slot, idx) => {
          const mob = BESTIARY_DATABASE[slot.monsterId];
          return (
            <div key={idx} style={{background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', padding: '6px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                <span style={{color: '#f8fafc', fontWeight: 'bold'}}>{mob?.name || slot.monsterId}</span>
                <select 
                  value={slot.charm} 
                  onChange={(e) => updateBoxConfig(idx, { charm: e.target.value as CharmType })}
                  style={{background: '#020617', color: '#94a3b8', border: '1px dashed #475569', padding: '2px', borderRadius: '2px', fontSize: '10px'}}
                >
                  {['NONE', 'WOUND', 'FREEZE', 'ZAP', 'CURSE', 'POISON', 'ENFLAME', 'DIVINE', 'VAMPIRIC', 'VOID', 'PARRY', 'DODGE', 'LOW_BLOW'].map(charm => (
                    <option key={charm} value={charm}>{charm}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => removeBoxMob(idx)} style={{background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '14px'}}>&times;</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BoxConfig;
