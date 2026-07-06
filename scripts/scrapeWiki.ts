import https from 'https';
import fs from 'fs';
import path from 'path';

function fetchAllItems(): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const url = 'https://tibiawiki.dev/api/items?expand=true';
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function scrapeAll() {
    console.log('Starting massive TibiaWiki scrape...');
    
    try {
        const allItems = await fetchAllItems();
        console.log(`Fetched a total of ${allItems.length} items from TibiaWiki.`);

        const db: Record<string, any> = {};

        allItems.forEach(item => {
            if (!item.name || !item.primarytype) return;
            
            const pt = item.primarytype.toLowerCase();
            const validTypes = ['weapons', 'armors', 'helmets', 'legs', 'boots', 'shields', 'amulets', 'rings', 'spellbooks'];
            if (!validTypes.includes(pt)) return;
            
            const id = item.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
            
            let slot = 'BACKPACK';
            
            if (pt === 'weapons') slot = 'WEAPON';
            else if (pt === 'armors') slot = 'ARMOR';
            else if (pt === 'helmets') slot = 'HELMET';
            else if (pt === 'legs') slot = 'LEGS';
            else if (pt === 'boots') slot = 'BOOTS';
            else if (pt === 'amulets') slot = 'AMULET';
            else if (pt === 'rings') slot = 'RING';
            else if (pt === 'shields' || pt === 'spellbooks') slot = 'SHIELD';
            
            const damageElement = 'PHYSICAL'; // Simplification for now
            const combatType = 'MELEE'; // Simplification for now
            
            let reqVocations = undefined;
            if (item.vocation) {
                reqVocations = [];
                const v = item.vocation.toLowerCase();
                if (v.includes('knight')) reqVocations.push('KNIGHT');
                if (v.includes('paladin')) reqVocations.push('PALADIN');
                if (v.includes('sorcerer')) reqVocations.push('SORCERER');
                if (v.includes('druid')) reqVocations.push('DRUID');
            }

            let bonusSkill = undefined;
            let critMultiplier = undefined;
            if (item.attrib) {
                bonusSkill = {};
                const attrs = item.attrib.toLowerCase();
                if (attrs.includes('magic level +')) {
                    const match = attrs.match(/magic level \+(\d+)/);
                    if (match) (bonusSkill as any)['magic'] = parseInt(match[1]);
                }
                if (attrs.includes('sword fighting +')) {
                    const match = attrs.match(/sword fighting \+(\d+)/);
                    if (match) (bonusSkill as any)['sword'] = parseInt(match[1]);
                }
                if (attrs.includes('axe fighting +')) {
                    const match = attrs.match(/axe fighting \+(\d+)/);
                    if (match) (bonusSkill as any)['axe'] = parseInt(match[1]);
                }
                if (attrs.includes('club fighting +')) {
                    const match = attrs.match(/club fighting \+(\d+)/);
                    if (match) (bonusSkill as any)['club'] = parseInt(match[1]);
                }
                if (attrs.includes('distance fighting +')) {
                    const match = attrs.match(/distance fighting \+(\d+)/);
                    if (match) (bonusSkill as any)['distance'] = parseInt(match[1]);
                }
                if (attrs.includes('critical hit damage')) {
                    critMultiplier = 0.10;
                }
                if (Object.keys(bonusSkill).length === 0) {
                    bonusSkill = undefined;
                }
            }

            db[id] = {
                id,
                name: item.name,
                slot,
                imbuementSlots: parseInt(item.imbuements) || 0,
                armor: parseInt(item.armor) || 0,
                defense: parseInt(item.defense) || 0,
                attack: parseInt(item.attack) || 0,
                weaponType: pt === 'weapons' ? 'SWORD' : undefined,
                combatType: pt === 'weapons' ? combatType : undefined,
                damageElement: pt === 'weapons' ? damageElement : undefined,
                vocations: reqVocations,
                bonusSkill,
                critMultiplier
            };
        });

        const outPath = path.join(__dirname, '..', 'src', 'database', 'massive_items.json');
        fs.writeFileSync(outPath, JSON.stringify(db, null, 2));
        console.log(`Saved database with ${Object.keys(db).length} items to ${outPath}`);
    } catch (e: any) {
        console.error('Failed to scrape:', e.message);
    }
}

scrapeAll();
