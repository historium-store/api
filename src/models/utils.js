import { pbkdf2 } from 'crypto';
import { writeFileSync } from 'fs';
import { verify } from 'jsonwebtoken';
import { promisify } from 'util';

export const saveDatabase = db =>
	writeFileSync('./src/models/db.json', JSON.stringify(db, null, 4));

export const hashPassword = promisify(pbkdf2);

export const verifyJWT = promisify(verify);
