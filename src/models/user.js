import { randomUUID } from 'crypto';

const users = [];

const create = async data =>
	new Promise(resolve => {
		const userExists = users.find(u => u.email === data.email);
		if (!userExists) {
			const newUser = { id: randomUUID(), ...data };
			users.push(newUser);
			resolve(newUser.id);
		}
	});

const findOne = async criteria =>
	new Promise(resolve => {
		const user = users.find(u =>
			Object.keys(criteria).every(key => u[key] === criteria[key])
		);

		resolve(user);
	});

export default { create, findOne };
