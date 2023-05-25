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
		]
	},
	{
		versionKey: false
	}
);

const Compiler = model('Compiler', compilerSchema);

export default Compiler;
