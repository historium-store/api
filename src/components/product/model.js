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
			required: true,
			index: true
		},

		code: {
			type: String,
			required: false,
			index: true
		},

		key: {
			type: String,
			required: true,
			index: true
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
			required: true
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

		creators: {
			type: [
				{
					type: String,
					required: true
				}
			]
		},

		requiresDelivery: {
			type: Boolean,
			default: true
		},

		createdAt: {
			type: Number
		},

		updatedAt: {
			type: Number
		},

		deletedAt: {
			type: Number,
			required: false
		}
	},
	{
		versionKey: false,
		timestamps: true
	}
);

productSchema.pre('save', async function (next) {
	if (this.isNew) {
		await setProductCode(this);
		await increaseProductsQuantity();
	}
	next();
});

productSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
	await decreaseProductsQuantity();
};

productSchema.statics.deleteOne = async function (productId) {
	await deleteDocument(await this.findOne(productId));
	await decreaseProductsQuantity();
};

const Product = model('Product', productSchema);

export default Product;
