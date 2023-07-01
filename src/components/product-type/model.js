import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const productTypeSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},

		key: {
			type: String,
			required: true,
			unique: true
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

const ProductType = model('ProductType', productTypeSchema);

export default ProductType;
