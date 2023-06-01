import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';
import { setProductCode } from '../../triggers/product-code.js';
import {
	decreaseProductsQuantity,
	increaseProductsQuantity
} from '../../triggers/products-quantity.js';

const { ObjectId } = Schema.Types;

const productSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},
		specificProduct: {
			type: ObjectId,
			required: false
		},
		code: {
			type: String,
			required: false,
			unique: true
		},
		key: {
			type: String,
			required: true,
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
	await increaseProductsQuantity();
	next();
});

productSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
	await decreaseProductsQuantity();
};

const Product = model('Product', productSchema);

export default Product;
