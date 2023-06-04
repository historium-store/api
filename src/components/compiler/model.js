import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId } = Schema.Types;

const compilerSchema = new Schema(
	{
		fullName: {
			type: String,
			require: true
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

compilerSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Compiler = model('Compiler', compilerSchema);

export default Compiler;
