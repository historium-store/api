import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId } = Schema.Types;

const illustratorSchema = new Schema(
	{
		fullName: {
			type: String,
			required: true
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

illustratorSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Illustrator = model('Illustrator', illustratorSchema);

export default Illustrator;
