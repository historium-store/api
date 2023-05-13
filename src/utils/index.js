import { pbkdf2 } from 'crypto';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

export const hashPassword = promisify(pbkdf2);

export const verifyJWT = promisify(jwt.verify);
