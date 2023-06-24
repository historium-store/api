import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId } = Schema.Types;

const sectionSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},

		key: {
			type: String,
			required: true,
			unique: true
		},

		products: [
			{
				type: ObjectId,
				ref: 'Product',
				required: false
			}
		],

		sections: [
			{
				type: ObjectId,
				ref: 'Section',
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
		timestamps: true,
		strict: false
	}
);

const Section = model('Section', sectionSchema);

export default Section;
