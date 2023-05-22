import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

const authorSchema = new Schema(
	{
		fullName: {
			type: String,
			required: true
		},
		biography: {
			type: String,
			required: false
		},
		books: [
			{
				type: ObjectId,
				ref: 'Book',
				required: false
			}
		],
		pictures: [
			{
				type: String,
				required: false
			}
		]
	},
	{
		versionKey: false
	}
);

export default model('Author', authorSchema);
