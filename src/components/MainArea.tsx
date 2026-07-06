import React, { useState } from 'react';
import WheelTab from './WheelTab';
import EquipTab from './EquipTab';
import HuntReportTab from './HuntReportTab';
import SpellsTab from './SpellsTab';

export default function MainArea() {
  const [activeTab, setActiveTab] = useState('wheel');

  return (
    <main className="pob-main">
      <nav className="pob-tabs-nav">
        <button className={`tab-btn ${activeTab === 'wheel' ? 'active' : ''}`} onClick={() => setActiveTab('wheel')}>Wheel of Destiny</button>
        <button className={`tab-btn ${activeTab === 'equip' ? 'active' : ''}`} onClick={() => setActiveTab('equip')}>Equipment</button>
        <button className={`tab-btn ${activeTab === 'spells' ? 'active' : ''}`} onClick={() => setActiveTab('spells')}>Spells & Rotation</button>
        <button className={`tab-btn ${activeTab === 'economy' ? 'active' : ''}`} onClick={() => setActiveTab('economy')}>Hunt Economy</button>
        <img src="https://tibia.fandom.com/wiki/Special:Filepath/Plate_Armor.gif" alt="Test Sprite" style={{width: 32, height: 32}} />
      </nav>
      <div className="pob-tab-content">
        {activeTab === 'wheel' && <WheelTab />}
        {activeTab === 'equip' && <EquipTab />}
        {activeTab === 'spells' && <SpellsTab />}
        {activeTab === 'economy' && <HuntReportTab />}
      </div>
    </main>
  );
}