import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

const editorSchema = new Schema(
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
		timestamps: true
	}
);

const Editor = model('Editor', editorSchema);

export default Editor;
