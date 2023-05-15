import { Schema, model } from 'mongoose';

const productSchema = new Schema(
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
			type: String
		},
		description: {
			type: String,
			required: false
		},
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

export default model('Product', productSchema);
