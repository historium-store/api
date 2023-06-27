import { Schema, model } from 'mongoose';
import { updateOrderNumber } from '../../triggers/order-number.js';

const { ObjectId } = Schema.Types;

const orderSchema = new Schema(
	{
		contactInfo: {
			type: ObjectId,
			ref: 'ContactInfo',
			required: true
		},

		receiverInfo: {
			type: ObjectId,
			ref: 'ContactInfo',
			required: false
		},

		gift: {
			type: Boolean,
			required: true
		},

		companyInfo: {
			type: ObjectId,
			ref: 'CompanyInfo',
			required: false
		},

		callback: {
			type: Boolean,
			required: true
		},

		deliveryInfo: {
			type: ObjectId,
			ref: 'DeliveryInfo',
			required: false
		},

		paymentType: {
			type: String,
			required: true
		},

		comment: {
			type: String,
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
			required: false
		},

		items: [
			{
				product: {
					name: {
						type: String,
						required: true
					},
					key: {
						type: String,
						required: true
					},
					price: {
						type: Number,
						required: true
					},
					quantity: {
						type: Number,
						required: true
					},
					type: {
						name: {
							type: String,
							required: true
						},
						key: {
							type: String,
							required: true
						}
					},
					createdAt: {
						type: Number
					},
					code: {
						type: String,
						required: true
					},
					image: {
						type: String,
						required: true
					}
				},
				quantity: {
					type: Number,
					required: true
				},
				createdAt: {
					type: Number
				}
			}
		],

		totalPrice: {
			type: Number,
			required: true
		},

		totalCount: {
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
		timestamps: true,
		strict: false
	}
);

orderSchema.pre('save', async function (next) {
	await updateOrderNumber(this);
	next();
});

orderSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Order = model('Order', orderSchema);

export default Order;
