import mongoose from 'mongoose';
const db = require('./mongo-utils/mongo-connect');

const productSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true
		},
		code: {
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
			required: true,
			min: 0
		},
		type: {
			type: String,
			enum: ['book', 'other'],
			default: 'other'
		},
		description: {
			type: String,
			required: false
		}
	},
	{
		versionKey: false
	}
);
export const Product = db.model('Product', productSchema);
