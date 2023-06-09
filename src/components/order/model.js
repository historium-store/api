import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

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
			require: true
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
			required: true
		},

		user: {
			type: ObjectId,
			ref: 'User',
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

orderSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Order = model('Order', orderSchema);

export default Order;
