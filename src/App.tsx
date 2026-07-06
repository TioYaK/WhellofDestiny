import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainArea from './components/MainArea';
import { useEngineStore } from './store/engineStore';
import { ITEM_DATABASE } from './core/itemDatabase';

export default function App() {
  const store = useEngineStore();

  useEffect(() => {
    const url = new URL(window.location.href);
    const buildData = url.searchParams.get('build');
    if (buildData) {
      try {
        const state = JSON.parse(atob(buildData));
        if (state.vocation) store.setVocation(state.vocation);
        if (state.level) store.setLevel(state.level);
        if (state.skills) {
          useEngineStore.setState({ baseSkills: { sword: state.skills.SWORD || 10, axe: state.skills.AXE || 10, club: state.skills.CLUB || 10, distance: state.skills.DISTANCE || 10, magic: state.skills.MAGIC || 0 } });
        }
        if (state.gear) {
          Object.entries(state.gear).forEach(([slot, data]: [string, any]) => {
            if (data && data.id && ITEM_DATABASE[data.id]) {
              store.setGearSlot(slot as any, ITEM_DATABASE[data.id]);
            }
          });
        }
        // Removing build from URL to avoid clutter
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch(e) {
        console.error("Failed to parse build URL", e);
      }
    }
  }, []);

  return (
    <div className="pob-app-container" style={{display: 'flex', height: '100vh'}}>
      <Sidebar />
      <MainArea />
    </div>
  );
}