import { Schema, model } from 'mongoose';
import productCodeTrigger from '../../triggers/productCodeTrigger.js';

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
		]
	},
	{
		versionKey: false
	}
);

productSchema.pre('save', async function (next) {
	try {
		await productCodeTrigger(this);
	} catch (err) {
		console.log(err);
	}

	next();
});

const Product = model('Product', productSchema);

export default Product;
