import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId } = Schema.Types;

const companyInfoSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},

		identificationNumber: {
			type: String,
			required: true
		},

		addressInfo: {
			type: ObjectId,
			ref: 'AddressInfo',
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
		timestamps: true,
		strict: false
	}
);

const CompanyInfo = model('CompanyInfo', companyInfoSchema);

export default CompanyInfo;
