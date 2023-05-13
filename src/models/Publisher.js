import mongoose from 'mongoose';
const db = require('./mongo-utils/mongo-connect');

const publisherSchema = mongoose.Schema(
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
export const Publisher = db.model('Publisher', publisherSchema);
