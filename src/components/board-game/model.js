import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId } = Schema.Types;

const boardGameSchema = new Schema(
	{
		product: {
			type: ObjectId,
			ref: 'Product',
			required: true
		},

		brand: {
			type: ObjectId,
			ref: 'Brand',
			required: true
		},

		article: {
			type: String,
			required: true,
			index: true
		},

		type: {
			type: String,
			required: true
		},

		kind: {
			type: String,
			required: true
		},

		playersCount: {
			type: String,
			required: true
		},

		packaging: {
			type: String,
			required: true
		},

		packageSize: {
			type: String,
			required: false
		},

		languages: [
			{
				type: String,
				required: true
			}
		],

		ages: [
			{
				type: String,
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

boardGameSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const BoardGame = model('BoardGame', boardGameSchema);

export default BoardGame;
