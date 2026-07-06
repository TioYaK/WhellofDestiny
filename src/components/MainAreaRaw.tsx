import React, { useEffect } from 'react';
import WheelTab from './WheelTab';
import EquipTab from './EquipTab';
import SpellsTab from './SpellsTab';
import BestiaryTab from './BestiaryTab';
import CalcTab from './CalcTab';

const MainAreaRaw: React.FC = () => {
  // Simple script to handle tab switching
  useEffect(() => {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(t => {
      t.addEventListener('click', (e) => {
        tabs.forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        const target = e.target as HTMLElement;
        target.classList.add('active');
        const panelId = target.getAttribute('data-target');
        if (panelId) {
          const panel = document.getElementById(panelId);
          if (panel) panel.classList.add('active');
        }
      });
    });
  }, []);

  return (
    <div className="pob-main">
      <div className="pob-tabs">
        <button className="tab-btn active" data-target="tab-wheel">Wheel of Destiny</button>
        <button className="tab-btn" data-target="tab-equipment">Equipment & Items</button>
        <button className="tab-btn" data-target="tab-spells">Spells & Rotation</button>
        <button className="tab-btn" data-target="tab-bestiary">Hunt Setup</button>
        <button className="tab-btn" data-target="tab-calculations">Calculations Sheet</button>
      </div>

      <div className="pob-workspace">
        <WheelTab />
        <EquipTab />
        <SpellsTab />
        <BestiaryTab />
        <CalcTab />
      </div>
    </div>
  );
};

export default MainAreaRaw;
