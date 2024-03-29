import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId } = Schema.Types;

const compilerSchema = new Schema(
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

compilerSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Compiler = model('Compiler', compilerSchema);

export default Compiler;
