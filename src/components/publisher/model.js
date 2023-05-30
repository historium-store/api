import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/deleteDocument.js';

const { ObjectId } = Schema.Types;

const publisherSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},
		bookSeries: [
			{
				type: ObjectId,
				ref: 'BookSeries',
				required: false
			}
		],
		books: [
			{
				type: ObjectId,
				ref: 'Book',
				required: false
			}
		],
		description: {
			type: String,
			required: false
		},
		logo: {
			type: String,
			required: false
		},
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

publisherSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Publisher = model('Publisher', publisherSchema);

export default Publisher;
