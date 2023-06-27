import { normalizePhoneNumber } from '../../utils.js';
import ContactInfo from './model.js';

const updateOne = async (id, changes) => {
	try {
		const contactInfoToUpdate = await ContactInfo.findById(id);

		if (!contactInfoToUpdate) {
			throw {
				status: 404,
				message: `Contact info with id '${id}' not found`
			};
		}

		if (changes.phoneNumber) {
			changes.phoneNumber = normalizePhoneNumber(changes.phoneNumber);
		}

		Object.keys(changes).forEach(
			key => (contactInfoToUpdate[key] = changes[key])
		);

		return await contactInfoToUpdate.save();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default {
	updateOne
};
