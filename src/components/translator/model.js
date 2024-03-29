import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId } = Schema.Types;

const translatorSchema = new Schema(
	{
		fullName: {
			type: String,
			required: true,
			index: true
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

translatorSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Translator = model('Translator', translatorSchema);

export default Translator;
