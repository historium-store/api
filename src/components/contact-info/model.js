import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const contactInfoSchema = new Schema(
	{
		firstName: {
			type: String,
			required: true
		},

		lastName: {
			type: String,
			required: true
		},

		middleName: {
			type: String,
			required: false
		},

		phoneNumber: {
			type: String,
			required: false
		},

		email: {
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
		timestamps: true
	}
);

contactInfoSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const ContactInfo = model('ContactInfo', contactInfoSchema);

export default ContactInfo;