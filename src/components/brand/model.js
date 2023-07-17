import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId } = Schema.Types;

const brandSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			index: true
		},

		products: [
			{
				type: ObjectId,
				ref: 'Product',
				required: false
			}
		],

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

brandSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Brand = model('Brand', brandSchema);

export default Brand;
