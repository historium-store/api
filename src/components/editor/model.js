import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId } = Schema.Types;

const editorSchema = new Schema(
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

editorSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Editor = model('Editor', editorSchema);

export default Editor;
