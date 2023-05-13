import mongoose from 'mongoose';
const db = require('./mongo-utils/mongo-connect')

const BookSchema = mongoose.Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product',
			required: true
		},
		publisher: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Publisher',
			required: true
		},
		language: {
			type: String,
			required: true
		},
		publishedIn: {
			type: Number,
			required: true
		}
	},
	{
		versionKey: false
	}
);
export const Book = db.model('Book', BookSchema);
