import CompanyInfo from './model.js';

const updateOne = async (id, changes) => {
	try {
		const companyInfoToUpdate = await CompanyInfo.findById(id);

		if (!companyInfoToUpdate) {
			throw {
				status: 404,
				message: `Company info with id '${id}' not found`
			};
		}

		Object.keys(changes).forEach(
			key => (companyInfoToUpdate[key] = changes[key])
		);

		return await companyInfoToUpdate.save();
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
