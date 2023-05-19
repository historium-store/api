import { Schema, model } from 'mongoose';

const composerSchema = new Schema({
	fullName: {
		type: String,
		require: true
	}
});

export default model('Composer', composerSchema);
