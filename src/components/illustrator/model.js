import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

const illustratorSchema = new Schema(
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
		],
		createdAt: {
			type: Number
		},
		updatedAt: {
			type: Number
		}
	},
	{
		versionKey: false,
		timestamps: true
	}
);

const Illustrator = model('Illustrator', illustratorSchema);

export default Illustrator;
