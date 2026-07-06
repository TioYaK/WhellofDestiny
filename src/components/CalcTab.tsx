import React from 'react';
import { useEngineStore } from '../store/engineStore';

const CalcTab: React.FC = () => {
  const { partySynergy, setPartySynergy } = useEngineStore();

  return (
    <div id="panel-calc" className="tab-panel">
      <div className="tab-header">
        <h2>Calculations & Party Synergy</h2>
        <p className="help-text">See the raw mathematical output of your current build and enable cross-vocation buffs.</p>
      </div>

      <div style={{display: 'flex', gap: '20px'}}>
        <div style={{flex: '1'}}>
          <div className="config-card">
            <h3 style={{marginBottom: '15px'}}>Party Mode (Multiplayer Hub)</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  id="party-expose-flaw" 
                  checked={partySynergy.exposeFlaw}
                  onChange={(e) => setPartySynergy({ exposeFlaw: e.target.checked })}
                />
                <span className="checkmark"></span>
                Master Sorcerer: Expose Flaw (Increases all damage taken by monsters by 5%)
              </label>

              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  id="party-sap-strength" 
                  checked={partySynergy.sapStrength}
                  onChange={(e) => setPartySynergy({ sapStrength: e.target.checked })}
                />
                <span className="checkmark"></span>
                Master Sorcerer: Sap Strength (Reduces monster base damage by 10%)
              </label>

              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  id="party-sio" 
                  checked={partySynergy.sioHeal > 0}
                  onChange={(e) => setPartySynergy({ sioHeal: e.target.checked ? 1000 : 0 })}
                />
                <span className="checkmark"></span>
                Elder Druid: Heal Friend (Sio) (Simulates massive incoming HPS, boosting EHP)
              </label>

              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  id="party-dazzle" 
                  checked={partySynergy.divineDazzle}
                  onChange={(e) => setPartySynergy({ divineDazzle: e.target.checked })}
                />
                <span className="checkmark"></span>
                Royal Paladin: Divine Dazzle (Mitigates damage taken by the Knight)
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="config-card" style={{marginTop: '20px'}}>
        <h3>Global Math State</h3>
        <div className="calc-sheet" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', 
            background: 'var(--bg-darker)', padding: '15px', borderRadius: '6px',
            fontSize: '13px', color: 'var(--text-muted)'
        }}>
           <div>Total Physical Armor: <strong style={{color: '#fff'}}>0</strong></div>
           <div>Global Damage Mult: <strong style={{color: '#fff'}}>1.00x</strong></div>
           <div>Life Leech %: <strong style={{color: '#ef4444'}}>0%</strong></div>
           <div>Mana Leech %: <strong style={{color: '#3b82f6'}}>0%</strong></div>
        </div>
      </div>
    </div>
  );
};

export default CalcTab;
