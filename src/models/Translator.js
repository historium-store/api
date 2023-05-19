import { Schema, model } from 'mongoose';

const translatorSchema = new Schema({
	fullName: {
		type: String,
		required: true
	}
});

export default model('Translator', translatorSchema);
