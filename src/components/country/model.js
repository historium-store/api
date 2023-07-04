import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const countrySchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},

		cities: [
			{
				type: String,
				required: false
			}
		],

		key: {
			type: String,
			required: true
		},

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

countrySchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Country = model('Country', countrySchema);

export default Country;
