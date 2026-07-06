import { IEngineStateData } from './EngineBridge';
import { Vocation } from '../types/combat';
import { TibiaWheelManager } from './TibiaWheelManager';
import { getVocationDefaultWheelNodes } from './wheelDatabase';

/**
 * Serializes and deserializes the Engine State into a Base64 string for easy sharing.
 */
export class BuildCodec {
  public static exportBuild(state: IEngineStateData & { spellPriority?: string[] }): string {
    try {
      const payload = {
        v: state.vocation,
        l: state.level,
        s: state.baseSkills,
        g: state.activeGear,
        b: state.activeBoxConfig,
        w: Array.from(state.wheelManager.getWheelState().nodes.values()).filter(n => n.currentPoints > 0).map(n => n.id),
        sp: state.spellPriority || []
      };
      
      const jsonStr = JSON.stringify(payload);
      return btoa(jsonStr);
    } catch (e) {
      console.error("Failed to export build:", e);
      return "";
    }
  }

  public static importBuild(encodedStr: string): Partial<IEngineStateData & { spellPriority: string[] }> | null {
    try {
      const jsonStr = atob(encodedStr);
      const payload = JSON.parse(jsonStr);
      
      const importedVocation = payload.v as Vocation;
      const importedLevel = payload.l || 1000;
      
      const manager = new TibiaWheelManager(importedLevel, 0, getVocationDefaultWheelNodes(importedVocation));
      if (payload.w && Array.isArray(payload.w)) {
        payload.w.forEach((nodeId: string) => {
          manager.allocatePoint(nodeId); // approximation to just add it back
        });
      }

      return {
        vocation: importedVocation,
        level: importedLevel,
        baseSkills: payload.s,
        activeGear: payload.g,
        activeBoxConfig: payload.b,
        wheelManager: manager,
        spellPriority: payload.sp || []
      };
    } catch (e) {
      console.error("Failed to import build:", e);
      return null;
    }
  }
}
