import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/deleteDocument.js';

const productTypeSchema = new Schema(
	{
		name: {
			type: String,
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

productTypeSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const ProductType = model('ProductType', productTypeSchema);

export default ProductType;
