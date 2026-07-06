import React from 'react';
import { useEngineStore } from '../store/engineStore';
import { PlayerStance } from '../types/combat';

const TacticsConfig: React.FC = () => {
  const { 
    playerStance, setPlayerStance,
    harmonyActive, setHarmonyActive,
    weaponProficiency, setWeaponProficiency,
    staticBuffs, setStaticBuffs,
    lureTime, setLureTime
  } = useEngineStore();

  return (
    <div className="sidebar-section panel-config" style={{marginTop: '10px'}}>
      <h2>Tactics & Static Buffs</h2>
      
      <div className="form-grid">
        <label>Player Stance</label>
        <select 
          value={playerStance} 
          onChange={(e) => setPlayerStance(e.target.value as PlayerStance)}
          style={{background: '#0f172a', color: 'white', border: '1px solid #475569', padding: '4px', borderRadius: '4px', fontSize: '11px'}}
        >
          <option value={PlayerStance.OPEN_FIELD}>Open Field (Max 8 Box)</option>
          <option value={PlayerStance.WALL_BACK}>Wall Back (Max 5 Box)</option>
          <option value={PlayerStance.CORNER_TRAP}>Corner Trap (Max 3 Box)</option>
        </select>

        <label>Lure Time (Sec)</label>
        <input 
          type="number" 
          value={lureTime} 
          onChange={(e) => setLureTime(parseInt(e.target.value) || 0)}
          min="0" max="30"
          style={{background: '#0f172a', color: 'white', border: '1px solid #475569', padding: '4px', borderRadius: '4px', fontSize: '11px'}}
        />

        <label>Weapon Mastery</label>
        <input 
          type="number" 
          value={weaponProficiency} 
          onChange={(e) => setWeaponProficiency(parseInt(e.target.value) || 0)}
          min="0" max="5"
          style={{background: '#0f172a', color: 'white', border: '1px solid #475569', padding: '4px', borderRadius: '4px', fontSize: '11px'}}
        />

        <label>Podium Renown (Flat)</label>
        <input 
          type="number" 
          value={staticBuffs.renown} 
          onChange={(e) => setStaticBuffs({ renown: parseInt(e.target.value) || 0 })}
          min="0" max="15"
          style={{background: '#0f172a', color: 'white', border: '1px solid #475569', padding: '4px', borderRadius: '4px', fontSize: '11px'}}
        />
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px'}}>
        <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', cursor: 'pointer', color: '#cbd5e1'}}>
          <input type="checkbox" checked={harmonyActive} onChange={(e) => setHarmonyActive(e.target.checked)} />
          <span>Harmony Active (Less Dmg taken near walls)</span>
        </label>
        
        <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', cursor: 'pointer', color: '#cbd5e1'}}>
          <input type="checkbox" checked={staticBuffs.mastermind} onChange={(e) => setStaticBuffs({ mastermind: e.target.checked })} />
          <span>Mastermind Potion (+3 Magic, Mage only)</span>
        </label>

        <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', cursor: 'pointer', color: '#cbd5e1'}}>
          <input type="checkbox" checked={staticBuffs.bullseye} onChange={(e) => setStaticBuffs({ bullseye: e.target.checked })} />
          <span>Bullseye Potion (+5 Dist, Paladin only)</span>
        </label>

        <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', cursor: 'pointer', color: '#cbd5e1'}}>
          <input type="checkbox" checked={staticBuffs.cupcake} onChange={(e) => setStaticBuffs({ cupcake: e.target.checked })} />
          <span>Event Cupcake / Food (+5 All Skills)</span>
        </label>
      </div>
    </div>
  );
};

export default TacticsConfig;
