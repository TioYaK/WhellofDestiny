import React, { useState } from 'react';
import { useEngineStore } from '../store/engineStore';
import { EquipmentSlot } from '../types/combat';
import { ITEM_DATABASE, IMBUEMENT_DATABASE } from '../core/itemDatabase';
import { useSimulation } from '../hooks/useSimulation';

const EquipTab: React.FC = () => {
  const { vocation, activeGear, setGearSlot, setImbuement } = useEngineStore();
  const { runAI } = useSimulation();

  const slots = [
    EquipmentSlot.HELMET,
    EquipmentSlot.ARMOR,
    EquipmentSlot.LEGS,
    EquipmentSlot.BOOTS,
    EquipmentSlot.WEAPON
  ];

  return (
    <div className="tab-panel" id="tab-equipment">
      <div className="config-card" style={{gridColumn: '1 / -1', background: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.2)'}}>
         <h3 style={{color: '#eab308'}}>🤖 AI Gear Advisor</h3>
         <p style={{fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px'}}>Scan the entire item database to find the highest DPS upgrade for your current box setup.</p>
         <button className="btn" style={{background: '#eab308', color: '#000'}} onClick={() => (window as any).runAIAdvisor && (window as any).runAIAdvisor()}>Scan Armor Upgrades</button>
      </div>

      <div className="equip-grid" style={{marginTop: '20px'}}>
        <div id="paperdoll-react" style={{display: 'flex', flexDirection: 'column', gap: '10px', width: '100%'}}>
          {slots.map(slotType => {
            const availableItems = Object.values(ITEM_DATABASE).filter(item => 
              item.slot === slotType && item.vocations.includes(vocation)
            );
            
            const activeItem = activeGear[slotType.toLowerCase() as keyof typeof activeGear]?.item;
            const imbuements = activeGear[slotType.toLowerCase() as keyof typeof activeGear]?.activeImbuements || [];

            return (
              <div key={slotType} style={{display: 'flex', flexDirection: 'column', gap: '5px', background: '#1e293b', padding: '8px', borderRadius: '6px', border: '1px solid #334155'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <label style={{fontSize: '11px', color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase'}}>{slotType}</label>
                  {activeItem && (
                    <img 
                      src={`https://tibia.fandom.com/wiki/Special:Filepath/${encodeURIComponent(activeItem.name)}.gif`} 
                      alt={activeItem.name} 
                      style={{width: '24px', height: '24px', objectFit: 'contain'}} 
                      onError={(e) => { (e.target as any).style.display = 'none'; }}
                    />
                  )}
                </div>
                <input 
                  type="text" 
                  list={`dl-${slotType}`} 
                  className="gear-input" 
                  placeholder={`Search ${slotType}...`}
                  value={activeItem ? activeItem.name : ''}
                  onChange={(e) => {
                    const typedName = e.target.value;
                    const foundItem = availableItems.find(i => i.name === typedName);
                    if (foundItem) setGearSlot(slotType, foundItem);
                    else if (typedName === '') setGearSlot(slotType, undefined);
                  }}
                  onFocus={(e) => { e.target.value = ''; }}
                  style={{background: '#0f172a', color: '#f8fafc', border: '1px solid #475569', padding: '4px', borderRadius: '4px', width: '100%', boxSizing: 'border-box', fontSize: '11px'}}
                />
                <datalist id={`dl-${slotType}`}>
                  {availableItems.map(item => <option key={item.id} value={item.name} />)}
                </datalist>

                {activeItem && activeItem.imbuementSlots > 0 && (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px'}}>
                    {Array.from({ length: activeItem.imbuementSlots }).map((_, i) => (
                      <select 
                        key={i}
                        value={imbuements[i]?.id || 'none'}
                        onChange={(e) => {
                          const imbId = e.target.value;
                          const imb = Object.values(IMBUEMENT_DATABASE).find(im => im.id === imbId);
                          setImbuement(slotType, i, imbId === 'none' ? undefined : imb);
                        }}
                        style={{fontSize: '10px', background: '#020617', color: '#94a3b8', border: '1px dashed #475569', padding: '2px', borderRadius: '3px'}}
                      >
                        <option value="none">- No Imbuement -</option>
                        {Object.values(IMBUEMENT_DATABASE).map(imb => (
                          <option key={imb.id} value={imb.id}>{imb.name}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
        <button 
          onClick={runAI}
          style={{
            background: 'linear-gradient(45deg, #eab308, #ca8a04)',
            color: '#000',
            fontWeight: 'bold',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(234, 179, 8, 0.3)'
          }}
        >
          ✨ Scan Armor Upgrades (AI)
        </button>
      </div>
    </div>
  );
};

export default EquipTab;