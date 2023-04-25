import { randomUUID } from 'crypto';

const users = [];

const create = async data =>
	new Promise(resolve => {
		const userExists = users.find(u => u.email === data.email);
		if (!userExists) {
			const newUser = { id: randomUUID(), ...data };
			users.push(newUser);
			resolve(newUser);
		}
	});

const findOneByEmail = async email =>
	new Promise(resolve => {
		const user = users.find(u => u.email === email);
		resolve(user ?? false);
	});

export default { create, findOneByEmail };
