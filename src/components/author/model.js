import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/deleteDocument.js';

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

authorSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Author = model('Author', authorSchema);

export default Author;
