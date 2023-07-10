import { Schema, model } from 'mongoose';
import { updateOrderNumber } from '../../triggers/order-number.js';

const { ObjectId } = Schema.Types;

const orderSchema = new Schema(
	{
		contactInfo: {
			firstName: {
				type: String,
				required: true
			},
			lastName: {
				type: String,
				required: true
			},
			phoneNumber: {
				type: String,
				required: true
			},
			email: {
				type: String,
				required: true
			}
		},

		receiverInfo: {
			firstName: {
				type: String,
				required: false
			},
			lastName: {
				type: String,
				required: false
			},
			phoneNumber: {
				type: String,
				required: false
			}
		},

		gift: {
			type: Boolean,
			required: true
		},

		companyInfo: {
			name: {
				type: String,
				required: false
			},
			identificationNumber: {
				type: String,
				required: false
			},
			address: {
				type: String,
				required: false
			}
		},

		callback: {
			type: Boolean,
			required: true
		},

		deliveryInfo: {
			country: {
				type: String,
				required: false
			},
			city: {
				type: String,
				required: false
			},
			type: {
				type: String,
				required: false
			},
			address: {
				type: String,
				required: false
			},
			street: {
				type: String,
				required: false
			},
			house: {
				type: String,
				required: false
			},
			apartment: {
				type: Number,
				required: false
			}
		},

		paymentType: {
			type: String,
			required: true
		},

		comment: {
			type: String,
			maxLength: 500,
			required: false
		},

		status: {
			name: {
				type: String,
				required: true,
				default: 'Поточний'
			},
			key: {
				type: String,
				required: true,
				default: 'active'
			}
		},

		user: {
			type: ObjectId,
			ref: 'User',
			required: true
		},

		items: {
			type: [],
			required: true
		},

		totalPrice: {
			type: Number,
			required: true
		},

		totalQuantity: {
			type: Number,
			required: true
		},

		deliveryPrice: {
			type: Number,
			required: true
		},

		number: {
			type: String,
			required: false
		},

		createdAt: {
			type: Number
		},

		updatedAt: {
			type: Number
		}
	},
	{
		versionKey: false,
		timestamps: true
	}
);

orderSchema.pre('save', async function (next) {
	await updateOrderNumber(this);
	next();
});

const Order = model('Order', orderSchema);

export default Order;
