const deleteDocument = async doc => {
	try {
		if (!doc.hasOwnProperty('deletedAt')) {
			doc.set('deletedAt', Date.now());

			await doc.save();
		} else
			throw new Error(
				'Error while uninstalling product. Product already removed.'
			);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default deleteDocument;
