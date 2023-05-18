import { Schema, model } from 'mongoose';

const productTypeSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		}
	},
	{
		versionKey: false
	}
);

export default model('ProdcutType', productTypeSchema);
