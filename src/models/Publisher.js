import { Schema, model } from 'mongoose';

const publisherSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		}
	},
	{
		versionKey: false
	}
);

export default model('Publisher', publisherSchema);
