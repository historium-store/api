import { Schema, model } from 'mongoose';

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
		}
	},
	{
		versionKey: false
	}
);

const Publisher = model('Publisher', publisherSchema);

export default Publisher;
