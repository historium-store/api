import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

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

		pictures: {
			type: [
				{
					type: String
				}
			],
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

authorSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Author = model('Author', authorSchema);

export default Author;
