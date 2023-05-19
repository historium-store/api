import { Schema, model } from 'mongoose';

const illustratorSchema = new Schema({
	fullName: {
		type: String,
		required: true
	}
});

export default model('Illustrator', illustratorSchema);
