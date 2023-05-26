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
		timestamps: true
	}
);

const Author = model('Author', authorSchema);

export default Author;
