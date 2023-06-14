import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId } = Schema.Types;

const deliveryInfoSchema = new Schema(
	{
		country: {
			type: ObjectId,
			ref: 'Country',
			required: true
		},

		city: {
			type: String,
			required: true
		},

		type: {
			type: ObjectId,
			ref: 'DeliveryType',
			required: true
		},

		addressInfo: {
			type: ObjectId,
			ref: 'AddressInfo',
			required: true
		},

		contactInfo: {
			type: ObjectId,
			ref: 'ContactInfo',
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

deliveryInfoSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const DeliveryInfo = model('DeliveryInfo', deliveryInfoSchema);

export default DeliveryInfo;
