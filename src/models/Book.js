import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

const bookSchema = new Schema(
	{
		product: {
			type: ObjectId,
			ref: 'Product',
			required: true
		},
		publisher: {
			type: ObjectId,
			ref: 'Publisher',
			required: true
		},
		language: [
			{
				type: String,
				required: true
			}
		],
		publishedIn: {
			type: Number,
			required: true
		}
	},
	{
		versionKey: false
	}
);

export default model('Book', bookSchema);
