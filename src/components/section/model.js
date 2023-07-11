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

		image: {
			type: String,
			requried: false
		},

		root: {
			type: Boolean,
			required: true,
			default: false
		},

		createdAt: {
			type: Number
		},

		updatedAt: {
			type: Number
		},

		deletedAt: {
			type: Number,
			required: false
		}
	},
	{
		versionKey: false,
		timestamps: true
	}
);

sectionSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Section = model('Section', sectionSchema);

export default Section;
