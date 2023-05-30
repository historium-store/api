import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/deleteDocument.js';

const { ObjectId } = Schema.Types;

const illustratorSchema = new Schema(
	{
		fullName: {
			type: String,
			required: true
		},
		books: [
			{
				type: ObjectId,
				ref: 'Book',
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
		timestamps: true,
		strict: false
	}
);

illustratorSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Illustrator = model('Illustrator', illustratorSchema);

export default Illustrator;
