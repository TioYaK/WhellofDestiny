import https from 'https';

const LIMIT = 10;
const fields = 'name,itemclass,primarytype,armor,attack,defense,imbuementslots,vocation,levelrequired,attrib';
const where = `itemclass IN ('Weapons','Armors','Helmets','Legs','Boots','Shields','Amulets','Rings','Spellbooks')`;
const url = `https://tibia.fandom.com/api.php?action=cargoquery&tables=Items&fields=${fields}&where=${encodeURIComponent(where)}&limit=${LIMIT}&offset=0&format=json`;

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(data);
    });
});
