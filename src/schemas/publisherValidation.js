export const creationSchema = {
	name: {
		notEmpty: {
			errorMessage: "Publisher's name is required",
			bail: true
		},
		isString: { errorMessage: "Publisher's name must be a string" }
	}
};
