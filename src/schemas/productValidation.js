export const creationSchema = {
	name: {
		notEmpty: {
			errorMessage: 'Product name is required',
			bail: true
		},
		isString: {
			errorMessage: 'Product name must be a string'
		}
	},
	code: {
		notEmpty: {
			errorMessage: 'Product code is required',
			bail: true
		},
		isString: {
			errorMessage: 'Product code must be a string'
		}
	},
	price: {
		notEmpty: {
			errorMessage: 'Product price is required',
			bail: true
		},
		isDecimal: {
			errorMessage: 'Product price must be a number'
		}
	},
	quantity: {
		notEmpty: {
			errorMessage: 'Product quantity is required',
			bail: true
		},
		isDecimal: {
			errorMessage: 'Product quantity must be a number'
		}
	}
};

export const updateSchema = {
	name: {
		optional: true,
		notEmpty: {
			errorMessage: 'Product name is required',
			bail: true
		},
		isString: {
			errorMessage: 'Product name must be a string'
		}
	},
	code: {
		optional: true,
		notEmpty: {
			errorMessage: 'Product code is required',
			bail: true
		},
		isString: {
			errorMessage: 'Product code must be a string'
		}
	},
	price: {
		optional: true,
		notEmpty: {
			errorMessage: 'Product price is required',
			bail: true
		},
		isDecimal: {
			errorMessage: 'Product price must be a number'
		}
	},
	quantity: {
		optional: true,
		notEmpty: {
			errorMessage: 'Product quantity is required',
			bail: true
		},
		isDecimal: {
			errorMessage: 'Product quantity must be a number'
		}
	}
};
