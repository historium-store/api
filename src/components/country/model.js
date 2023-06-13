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

countrySchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Country = model('Country', countrySchema);

export default Country;
