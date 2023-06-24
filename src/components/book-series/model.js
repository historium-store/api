import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId } = Schema.Types;

const bookSeriesSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},

		publisher: {
			type: ObjectId,
			ref: 'Publisher',
			required: true
		},

		books: [
			{
				type: ObjectId,
				ref: 'Book',
				required: false
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
		timestamps: true,
		strict: false
	}
);

const BookSeries = model('BookSeries', bookSeriesSchema);

export default BookSeries;
