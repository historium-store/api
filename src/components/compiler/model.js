import { Schema, model } from 'mongoose';

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
		timestamps: true
	}
);

const Compiler = model('Compiler', compilerSchema);

export default Compiler;
