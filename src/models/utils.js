import fs from 'fs';

export const saveDatabase = db => {
	fs.writeFileSync('./src/models/db.json', JSON.stringify(db, null, 4));
};
