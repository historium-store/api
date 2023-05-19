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
		languages: [
			{
				type: String,
				required: true
			}
		],
		publishedIn: {
			type: Number,
			required: true
		},
		authors: [
			{
				type: ObjectId,
				ref: 'Author',
				required: false
			}
		],
		composers: [
			{
				type: ObjectId,
				ref: 'Composer',
				required: false
			}
		],
		translators: [
			{
				type: ObjectId,
				ref: 'Translator',
				required: false
			}
		],
		illustrators: [
			{
				type: ObjectId,
				ref: 'Illustrator',
				required: false
			}
		],
		editors: [
			{
				type: ObjectId,
				ref: 'Editor',
				required: false
			}
		]
	},
	{
		versionKey: false
	}
);

export default model('Book', bookSchema);
