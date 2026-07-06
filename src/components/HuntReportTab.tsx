import React from 'react';
import { useEngineStore } from '../store/engineStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function HuntReportTab() {
  const { huntReport, vitalsTimeline, dpsTimeline } = useEngineStore();

  if (!huntReport) {
    return (
      <div className="tab-panel active" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-dim)' }}>
        <p>Run a simulation to generate the 1-Hour Hunt Economy Report.</p>
      </div>
    );
  }

  const isProfit = huntReport.balancePerHour >= 0;

  return (
    <div className="tab-panel active" style={{ padding: '20px' }}>
      <div className="tab-header" style={{ marginBottom: '20px' }}>
        <h2>Economy & Hunt Analyzer</h2>
        <p className="help-text">
          Extrapolates your 20-second burst simulation into a full 1-hour sustained hunt to calculate Profit or Waste.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
        
        {/* Supplies Cost Card */}
        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '6px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '10px' }}>Supplies Spent (1h)</h3>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>
            <span>Potions: </span>
            <b style={{ color: '#e2e8f0' }}>{huntReport.potionsUsedPerHour.toLocaleString()}x</b>
            <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '5px' }}>({huntReport.potionCostPerHour.toLocaleString()} gp)</span>
          </div>
          <div style={{ fontSize: '14px' }}>
            <span>Runes: </span>
            <b style={{ color: '#e2e8f0' }}>{huntReport.runesUsedPerHour.toLocaleString()}x</b>
            <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '5px' }}>({huntReport.runeCostPerHour.toLocaleString()} gp)</span>
          </div>
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #334155', fontWeight: 'bold' }}>
            Total Waste: <span style={{ color: '#ef4444' }}>{(huntReport.potionCostPerHour + huntReport.runeCostPerHour).toLocaleString()} gp</span>
          </div>
        </div>

        {/* Loot Estimator Card */}
        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '6px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#eab308', marginBottom: '10px' }}>Estimated Loot (1h)</h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
            Based on damage dealt and loot multiplier.
          </p>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#eab308' }}>
            {Math.round(huntReport.estimatedLootPerHour).toLocaleString()} gp
          </div>
        </div>

        {/* Balance Card */}
        <div style={{ background: isProfit ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '6px', border: `1px solid ${isProfit ? '#22c55e' : '#ef4444'}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h3 style={{ color: isProfit ? '#22c55e' : '#ef4444', marginBottom: '10px' }}>
            {isProfit ? 'PROFIT' : 'WASTE'}
          </h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: isProfit ? '#22c55e' : '#ef4444' }}>
            {isProfit ? '+' : ''}{Math.round(huntReport.balancePerHour).toLocaleString()} gp
          </div>
        </div>

      </div>

      {vitalsTimeline && vitalsTimeline.length > 0 && (
        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '6px', border: '1px solid #334155', marginTop: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#e2e8f0' }}>Vitals Timeline (Burst Window)</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalsTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="tickMs" tickFormatter={(tick) => `${tick / 1000}s`} stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  labelFormatter={(label) => `${Number(label) / 1000}s`}
                />
                <Legend />
                <Line type="monotone" dataKey="hp" stroke="#ef4444" strokeWidth={2} dot={false} name="Health" />
                <Line type="monotone" dataKey="mana" stroke="#3b82f6" strokeWidth={2} dot={false} name="Mana" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {dpsTimeline && dpsTimeline.length > 0 && (
        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '6px', border: '1px solid #334155', marginTop: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#e2e8f0' }}>DPS Timeline</h3>
          <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dpsTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="timeMs" tickFormatter={(tick) => `${tick / 1000}s`} stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  labelFormatter={(label) => `${Number(label) / 1000}s`}
                />
                <Legend />
                <Line type="monotone" dataKey="dps" stroke="#eab308" strokeWidth={2} dot={false} name="Damage Per Second" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
