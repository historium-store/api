import CompanyInfo from './model.js';

const updateOne = async (id, changes) => {
	try {
		const exists = await CompanyInfo.exists({ _id: id });

		if (!exists) {
			throw {
				status: 404,
				message: `Company info with id '${id}' not found`
			};
		}

		return await CompanyInfo.findByIdAndUpdate(id, changes, {
			new: true
		});
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
