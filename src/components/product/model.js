import { Schema, model } from 'mongoose';
import deleteProduct from '../../triggers/deleteProduct.js';
import setProductCode from '../../triggers/setProductCode.js';

const { ObjectId } = Schema.Types;

const productSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},
		code: {
			type: String,
			required: false,
			unique: true
		},
		price: {
			type: Number,
			required: true,
			min: 0
		},
		quantity: {
			type: Number,
			required: false,
			min: 0
		},
		type: {
			type: ObjectId,
			ref: 'ProductType',
			required: true
		},
		sections: [
			{
				type: ObjectId,
				ref: 'Section',
				required: true
			}
		],
		description: {
			type: String,
			required: false
		},
		reviews: [
			{
				type: ObjectId,
				ref: 'Review',
				required: false
			}
		],
		images: [
			{
				type: String,
				required: true
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
		strict: false,
		timestamps: true
	}
);

productSchema.pre('save', async function (next) {
	await setProductCode(this);
	next();
});

productSchema.methods.deleteOne = async function () {
	await deleteProduct(this);
};

const Product = model('Product', productSchema);

export default Product;
