import { Schema, model } from 'mongoose';

const authorSchema = new Schema(
	{
		fullName: {
			type: String,
			required: true
		},
		biography: {
			type: String,
			required: false
		},
		pictures: [
			{
				type: String,
				required: false
			}
		]
	},
	{
		versionKey: false
	}
);

export default model('Author', authorSchema);
