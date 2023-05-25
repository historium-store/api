import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

const composerSchema = new Schema(
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

const Composer = model('Composer', composerSchema);

export default Composer;
