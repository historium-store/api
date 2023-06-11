import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId } = Schema.Types;

const deliveryTypeSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},

		price: {
			type: Number,
			required: true
		},

		countries: [
			{
				type: ObjectId,
				ref: 'Country',
				required: false
			}
		],

		contactInfoRequired: {
			type: Boolean,
			required: true
		},

		fullAddressRequired: {
			type: Boolean,
			required: true
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

deliveryTypeSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const DeliveryType = model('DeliveryType', deliveryTypeSchema);

export default DeliveryType;
