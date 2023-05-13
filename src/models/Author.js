import { Schema, model } from 'mongoose';

const authorSchema = new Schema(
	{
		fullName: {
			type: String,
			required: true
		}
	},
	{
		versionKey: false
	}
);

export default model('Author', authorSchema);
