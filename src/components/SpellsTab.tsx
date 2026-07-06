import React from 'react';
import { useEngineStore } from '../store/engineStore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SpellsTab: React.FC = () => {
  const { simulationLogs, aiUpgrades, spellPriority, reorderSpell, dpsTimeline } = useEngineStore();

  return (
    <div id="panel-spells" className="tab-panel active">
      <div className="tab-header">
        <h2>Rotation & Spells</h2>
        <p className="help-text">Define the priority list of your spells. The engine will cast the highest priority spell off-cooldown.</p>
      </div>

      <div style={{display: 'flex', gap: '20px'}}>
        <div style={{flex: '1'}}>
          <h3 style={{marginBottom: '10px'}}>Spell Priority List</h3>
          <div id="spells-pool" style={{background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', minHeight: '300px'}}>
            {spellPriority && spellPriority.length > 0 ? (
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                {spellPriority.map((spell, index) => (
                  <div key={spell} style={{display: 'flex', alignItems: 'center', background: '#1e293b', padding: '8px', borderRadius: '4px', border: '1px solid #334155'}}>
                    <div style={{flex: '1', fontWeight: 'bold', textTransform: 'capitalize'}}>{spell}</div>
                    <div style={{display: 'flex', gap: '4px'}}>
                      <button 
                        onClick={() => reorderSpell(index, 'UP')}
                        disabled={index === 0}
                        style={{background: '#3b82f6', border: 'none', color: '#fff', cursor: index === 0 ? 'not-allowed' : 'pointer', padding: '4px 8px', borderRadius: '3px', opacity: index === 0 ? 0.3 : 1}}
                      >▲</button>
                      <button 
                        onClick={() => reorderSpell(index, 'DOWN')}
                        disabled={index === spellPriority.length - 1}
                        style={{background: '#3b82f6', border: 'none', color: '#fff', cursor: index === spellPriority.length - 1 ? 'not-allowed' : 'pointer', padding: '4px 8px', borderRadius: '3px', opacity: index === spellPriority.length - 1 ? 0.3 : 1}}
                      >▼</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{color: 'var(--color-text-dim)', fontStyle: 'italic', fontSize: '12px'}}>
                (Select your vocation in the Sidebar to populate this list)
              </p>
            )}
          </div>
        </div>
        
        <div style={{flex: '1', display: 'flex', flexDirection: 'column', gap: '15px'}}>
          <h3 style={{marginBottom: '0px'}}>Combat Analytics</h3>
          
          {dpsTimeline && dpsTimeline.length > 0 && (
            <div style={{width: '100%', height: '200px', background: '#0a0a0a', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)'}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dpsTimeline}>
                  <defs>
                    <linearGradient id="colorDps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="timeMs" tickFormatter={(tick) => `${(tick / 1000).toFixed(0)}s`} stroke="#475569" fontSize={10} />
                  <YAxis stroke="#475569" fontSize={10} width={40} />
                  <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155'}} itemStyle={{color: '#8b5cf6'}} labelFormatter={(label) => `${(label / 1000).toFixed(1)}s`} />
                  <Area type="monotone" dataKey="dps" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorDps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div id="events-feed" style={{flex: 1, background: '#0a0a0a', padding: '15px', borderRadius: '4px', minHeight: '200px', maxHeight: '350px', overflowY: 'auto', border: '1px solid var(--border-light)'}}>
            {simulationLogs.length === 0 && aiUpgrades.length === 0 ? (
              <p style={{color: 'var(--color-text-dim)', fontStyle: 'italic', fontSize: '12px'}}>
                Run a simulation to see the results here.
              </p>
            ) : null}

            {aiUpgrades.length > 0 && (
              <div style={{fontFamily: 'monospace', fontSize: '13px'}}>
                <h3 style={{color: '#eab308', marginBottom: '10px'}}>🤖 AI Advisor: Best Armor Upgrades</h3>
                {aiUpgrades.slice(0, 5).map((up, i) => (
                  <div key={i} style={{marginBottom: '8px', padding: '5px', background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid #eab308'}}>
                    <b>{up.item}</b> <br/>
                    <span style={{color: '#22c55e'}}>+{Math.round(up.delta)} Damage (+{up.pct.toFixed(2)}%)</span>
                  </div>
                ))}
              </div>
            )}

            {simulationLogs.length > 0 ? (
              <div style={{fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-text)'}}>
                {simulationLogs.map((log, index) => {
                  if (log.type === 'HEADER') return <h3 key={index} style={{color: '#60a5fa', marginBottom: '10px'}}>{log.message}</h3>;
                  if (log.type === 'HEADER_SMALL') return <h4 key={index} style={{margin: '10px 0'}}>{log.message}</h4>;
                  if (log.type === 'DIVIDER') return <hr key={index} style={{borderColor: '#333'}} />;
                  if (log.type === 'STAT') return <p key={index}><b>{log.label}:</b> <span style={{color: log.good === undefined ? 'inherit' : log.good ? '#22c55e' : '#ef4444'}}>{log.value}</span></p>;
                  if (log.type === 'EVENT') return <div key={index}><span style={{color: '#fbbf24'}}>[{log.ts}s]</span> {log.name}</div>;
                  return null;
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpellsTab;
