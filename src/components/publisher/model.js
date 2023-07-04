import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

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

publisherSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Publisher = model('Publisher', publisherSchema);

export default Publisher;
