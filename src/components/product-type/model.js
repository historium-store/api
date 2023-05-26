import { Schema, model } from 'mongoose';

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

const ProductType = model('ProductType', productTypeSchema);

export default ProductType;
