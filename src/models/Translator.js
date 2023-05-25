import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

const translatorSchema = new Schema(
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
		]
	},
	{
		versionKey: false
	}
);

const Translator = model('Translator', translatorSchema);

export default Translator;
