import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const addressInfoSchema = new Schema(
	{
		region: {
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
		},

		postcode: {
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

addressInfoSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const AddressInfo = model('AddressInfo', addressInfoSchema);

export default AddressInfo;
