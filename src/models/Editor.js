import { Schema, model } from 'mongoose';

const editorSchema = new Schema({
	fullName: {
		type: String,
		required: true
	}
});

export default model('Editor', editorSchema);
