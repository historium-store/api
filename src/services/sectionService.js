import { Section } from '../models/index.js';

const createOne = async sectionData => {
	const exists =
		(await Section.findOne({ name: sectionData.name })) !== null;

	if (exists) {
		throw {
			status: 409,
			message: `Section with name '${sectionData.name}' already exists`
		};
	}

	sectionData.products = [];

	try {
		return await Section.create(sectionData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const section = await Section.findById(id);

		if (!section) {
			throw {
				status: 404,
				message: `Section with id '${id}' not found`
			};
		}

		return section;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await Section.find({});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const exists =
		(await Section.findOne({ name: changes.name })) !== null;

	if (exists) {
		throw {
			status: 409,
			message: `Section with name '${changes.name}' already exists`
		};
	}

	try {
		const section = await Section.findByIdAndUpdate(id, changes, {
			new: true
		});

		if (!section) {
			throw {
				status: 404,
				message: `Section with id '${id}' not found`
			};
		}

		return section;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const section = await Section.findByIdAndDelete(id);

		if (!section) {
			throw {
				status: 404,
				message: `Section with id '${id}' not found`
			};
		}

		return section;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
