import mongoose from 'mongoose';
const db = require('./mongo-utils/mongo-connect');

const authorSchema = new mongoose.Schema(
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

export default db.model('Author', authorSchema);
