export const creationSchema = {
	fullName: {
		notEmpty: {
			errorMessage: "Author's full name is required",
			bail: true
		},
		isString: { errorMessage: "Author's name must be a string" }
	}
};
