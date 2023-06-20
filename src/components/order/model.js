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

		cart: {
			type: ObjectId,
			require: false
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

const Order = model('Order', orderSchema);

export default Order;
