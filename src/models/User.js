import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

const userSchema = new Schema(
	{
		firstName: {
			type: String,
			required: true
		},
		lastName: {
			type: String,
			required: true
		},
		phoneNumber: {
			type: String,
			required: true,
			unique: true
		},
		email: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true
		},
		salt: {
			type: String,
			required: true
		},
		role: {
			type: String,
			required: true
		},
		reviews: [
			{
				type: ObjectId,
				ref: 'Review',
				required: false
			}
		],
		restorationToken: {
			type: String,
			required: false
		}
	},
	{
		versionKey: false
	}
);

export default model('User', userSchema);
