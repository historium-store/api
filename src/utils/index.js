import { pbkdf2 } from 'crypto';
import { verify } from 'jsonwebtoken';
import { promisify } from 'util';

export const hashPassword = promisify(pbkdf2);

export const verifyJWT = promisify(verify);
