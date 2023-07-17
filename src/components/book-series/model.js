import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId } = Schema.Types;

const bookSeriesSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			index: true
		},

		publisher: {
			type: ObjectId,
			ref: 'Publisher',
			required: true
		},

		books: {
			type: [
				{
					type: ObjectId,
					ref: 'Book',
					required: false
				}
			],
			default: []
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

bookSeriesSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const BookSeries = model('BookSeries', bookSeriesSchema);

export default BookSeries;
