import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';
import Product from '../product/model.js';

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
			required: true
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
			type: String,
			required: true,
			default: 'new'
		},

		user: {
			type: ObjectId,
			ref: 'User',
			required: false
		},

		items: [
			{
				product: {
					_id: {
						type: ObjectId,
						required: true
					},

					name: {
						type: String,
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

					code: {
						type: String,
						required: false,
						unique: true
					},

					key: {
						type: String,
						required: true,
						unique: true
					},

					price: {
						type: Number,
						required: true,
						min: 0
					},

					image: {
						type: String,
						required: true
					}
				},

				quantity: {
					type: Number,
					required: true
				}
			}
		],

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

orderSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Order = model('Order', orderSchema);

export default Order;
