import React, { useState } from 'react';
import { useEngineStore } from '../store/engineStore';
import { BESTIARY_DATABASE } from '../core/bestiaryDatabase';
// I will just use a generic 'demon' if I can't find it.

const BestiaryTab: React.FC = () => {
  const { activeBoxConfig, addBoxMob, removeBoxMob } = useEngineStore();
  const [selectedMob, setSelectedMob] = useState('demon');

  return (
    <div className="tab-panel" id="tab-bestiary">
      <h2>Hunt Arena Simulator</h2>
      <p style={{fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px'}}>Create a custom scenario to see how your rotation performs against specific mob densities and mitigation.</p>
      
      <div className="equip-grid">
        <div className="config-card">
          <h3>Custom Mob Spawner</h3>
          <div className="form-grid">
            <label>Lure & Walk Time (s)</label>
            <input 
              type="number" 
              title="Time spent walking between pulls. Used to calculate real XP/H and Profit/H."
              value={useEngineStore.getState().lureTime}
              onChange={(e) => useEngineStore.getState().setLureTime(Number(e.target.value))}
            />
            
            <label>Template</label>
            <select id="hunt-template-select" value={selectedMob} onChange={e => setSelectedMob(e.target.value)}>
              <optgroup label="Soul War">
                <option value="brachiodemon">Brachiodemon</option>
                <option value="infernal_demon">Infernal Demon</option>
                <option value="magma_crawler">Magma Crawler</option>
                <option value="cloak_of_terror">Cloak of Terror</option>
              </optgroup>
              <optgroup label="Rotten Blood">
                <option value="bloodjaw">Bloodjaw</option>
                <option value="chagall">Chagall</option>
              </optgroup>
              <optgroup label="Secret Library">
                <option value="biting_book">Biting Book</option>
                <option value="ink_blob">Ink Blob</option>
              </optgroup>
              <optgroup label="Issavi">
                <option value="sphinx">Sphinx</option>
                <option value="lamassu">Lamassu</option>
                <option value="crypt_warden">Crypt Warden</option>
              </optgroup>
              <optgroup label="Classic Endgame">
                <option value="demon">Demon</option>
                <option value="hellflayer">Hellflayer</option>
                <option value="juggernaut">Juggernaut</option>
              </optgroup>
              <optgroup label="Endgame Bosses">
                <option value="king_zelos">King Zelos</option>
                <option value="magma_bubble">Magma Bubble</option>
                <option value="ferumbras_mortal_shell">Ferumbras Mortal Shell</option>
              </optgroup>
            </select>

            <label>Mob Name</label>
            <input type="text" id="mob-name" defaultValue="Custom Monster" />

            <label>Max HP</label>
            <input type="number" id="mob-hp" defaultValue={10000} />

            <label>Armor</label>
            <input type="number" id="mob-armor" defaultValue={80} />
            
            <label>Damage Type</label>
            <select id="mob-dmg-type">
              <option value="PHYSICAL">Physical</option>
              <option value="FIRE">Fire</option>
              <option value="DEATH">Death</option>
              <option value="EARTH">Earth</option>
            </select>

            <button 
              className="btn" 
              id="btn-spawn-monster" 
              style={{gridColumn: '1 / -1', marginTop: '10px'}}
              onClick={() => {
                if (activeBoxConfig.length < 8) addBoxMob(selectedMob);
              }}
            >
              Spawn into Arena
            </button>
          </div>
        </div>

        <div className="config-card">
          <h3>Active Hunt Setup (The Box)</h3>
          <p style={{fontSize: '11px', color: 'var(--text-muted)'}}>Click a slot to remove the monster.</p>
          <div id="arena-box-visualizer" style={{
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '5px', 
            background: 'var(--bg-darker)',
            padding: '10px',
            borderRadius: '6px',
            marginTop: '10px'
          }}>
            {Array.from({ length: 8 }).map((_, i) => {
               // Adjust index because center (index 4) is the Player
               let mobIndex = i;
               if (i >= 4) mobIndex = i - 1;

               if (i === 4) {
                  return (
                    <div key="player" style={{height: '60px', background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.5)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#60a5fa', fontWeight: 'bold'}}>YOU</div>
                  );
               }

               const mob = activeBoxConfig[mobIndex];
               if (mob) {
                  return (
                    <div key={i} onClick={() => removeBoxMob(mobIndex)} style={{cursor: 'pointer', height: '60px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fca5a5', fontWeight: 'bold'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                        <img 
                          src={`https://tibia.fandom.com/wiki/Special:Filepath/${mob.monsterId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_')}.gif`} 
                          alt={mob.monsterId} 
                          style={{width: '24px', height: '24px', objectFit: 'contain'}} 
                          onError={(e) => { (e.target as any).style.display = 'none'; }}
                        />
                        <span>{mob.monsterId.toUpperCase()}</span>
                      </div>
                      <span style={{fontSize: '9px', color: '#ef4444'}}>Click to Remove</span>
                    </div>
                  );
               } else {
                  return (
                    <div key={i} style={{height: '60px', background: 'rgba(239,68,68,0.05)', border: '1px dashed rgba(239,68,68,0.2)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'rgba(239,68,68,0.4)'}}>Empty</div>
                  );
               }
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestiaryTab;
