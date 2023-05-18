import { Schema, model } from 'mongoose';

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
		]
	},
	{
		versionKey: false
	}
);

export default model('BookSeries', bookSeriesSchema);
