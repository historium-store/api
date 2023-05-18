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

export default model('Publisher', publisherSchema);
