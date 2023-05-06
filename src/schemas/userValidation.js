export const signupSchema = {
	firstName: {
		notEmpty: { errorMessage: 'First name is required', bail: true },
		isLength: {
			options: { min: 2, max: 50 },
			errorMessage: 'First name must be between 2 and 50 characters'
		}
	},
	lastName: {
		notEmpty: { errorMessage: 'Last name is required', bail: true },
		isLength: {
			options: { min: 2, max: 50 },
			errorMessage: 'Last name must be between 2 and 50 characters'
		}
	},
	phoneNumber: {
		notEmpty: {
			errorMessage: 'Phone number is required',
			bail: true
		},
		isMobilePhone: {
			locale: 'uk-UA',
			errorMessage: 'Invalid phone number format'
		}
	},
	email: {
		notEmpty: { errorMessage: 'Email is required', bail: true },
		isEmail: { errorMessage: 'Invalid email format' }
	},
	password: {
		notEmpty: { errorMessage: 'Password is required', bail: true },
		isLength: {
			options: { min: 8, max: 50 },
			errorMessage: 'Password must be between 8 and 50 characters'
		}
	}
};

export const loginSchema = {
	login: {
		notEmpty: {
			errorMessage: 'Phone number or email is required',
			bail: true
		},
		isEmail: { errorMessage: 'Invalid email format' },
		isMobilePhone: {
			locale: 'uk-UA',
			errorMessage: 'Invalid phone number format'
		}
	},
	password: {
		notEmpty: { errorMessage: 'Password is required', bail: true },
		isLength: {
			options: { min: 8, max: 50 },
			errorMessage: 'Password must be between 8 and 50 characters'
		}
	}
};

export const updateSchema = {
	firstName: {
		optional: true,
		isLength: {
			options: { min: 2, max: 50 },
			errorMessage: 'First name must be between 2 and 50 characters'
		}
	},
	lastName: {
		optional: true,
		isLength: {
			options: { min: 2, max: 50 },
			errorMessage: 'Last name must be between 2 and 50 characters'
		}
	},
	phoneNumber: {
		optional: true,
		isMobilePhone: {
			locale: 'uk-UA',
			errorMessage: 'Invalid phone number format'
		}
	},
	email: {
		optional: true,
		isEmail: { errorMessage: 'Invalid email format' }
	},
	password: {
		optional: true,
		isLength: {
			options: { min: 8, max: 50 },
			errorMessage: 'Password must be between 8 and 50 characters'
		}
	}
};
