import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId, Map } = Schema.Types;

const deliveryTypeSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},

		variablePrice: {
			type: Boolean,
			required: true
		},

		price: {
			type: Number,
			required: false
		},

		countries: [
			{
				type: ObjectId,
				ref: 'Country',
				required: false
			}
		],

		countryPrices: {
			type: Map,
			required: false
		},

		freeDeliveryFrom: {
			type: Number,
			required: false
		},

		contactInfoRequired: {
			type: Boolean,
			required: true
		},

		key: {
			type: String,
			required: true
		},

		fullAddressRequired: {
			type: Boolean,
			required: true
		},

		paymentTypes: [
			{
				type: String,
				required: false
			}
		],

		createdAt: {
			type: Number
		},

		updatedAt: {
			type: Number
		},

		deletedAt: {
			type: Number,
			requried: false
		}
	},
	{
		versionKey: false,
		timestamps: true
	}
);

deliveryTypeSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const DeliveryType = model('DeliveryType', deliveryTypeSchema);

export default DeliveryType;
