import { Schema, model } from 'mongoose';
import deleteDocument from '../../triggers/delete-document.js';

const { ObjectId } = Schema.Types;

const bookSchema = new Schema(
	{
		product: {
			type: ObjectId,
			ref: 'Product',
			required: true
		},

		publisher: {
			type: ObjectId,
			ref: 'Publisher',
			required: true
		},

		languages: [
			{
				type: String,
				required: true
			}
		],

		type: {
			type: String,
			required: true
		},

		publishedIn: {
			type: Number,
			required: true
		},

		authors: {
			type: [
				{
					type: ObjectId,
					ref: 'Author'
					// required: false
				}
			],
			requried: false
		},

		compilers: {
			type: [
				{
					type: ObjectId,
					ref: 'Compiler'
					// required: false
				}
			],
			requried: false
		},

		translators: {
			type: [
				{
					type: ObjectId,
					ref: 'Translator'
					// required: false
				}
			]
			// required: false
		},

		illustrators: {
			type: [
				{
					type: ObjectId,
					ref: 'Illustrator'
					// required: false
				}
			]
			// required: false
		},

		editors: {
			type: [
				{
					type: ObjectId,
					ref: 'Editor'
					// required: false
				}
			]
			// required: false
		},

		series: {
			type: ObjectId,
			ref: 'BookSeries'
			// required: false
		},

		copies: {
			type: Number
			// required: false
		},

		isbns: {
			type: [
				{
					type: String
					// required: false
				}
			]
			// required: false
		},

		firstPublishedIn: {
			type: Number
			// required: false
		},

		originalName: {
			type: String
			// required: false
		},

		font: {
			type: String
			// required: false
		},

		format: {
			type: String
			// required: false
		},

		pages: {
			type: Number
			// required: false
		},

		weight: {
			type: Number
			// required: false
		},

		paperType: {
			type: String
			// required: false
		},

		bindingType: {
			type: String
			// required: false
		},

		illustrationsType: {
			type: [
				{
					type: String
					// required: false
				}
			]
			// required: false
		},

		literaturePeriod: {
			type: [
				{
					type: String
					// required: false
				}
			]
			// required: false
		},

		literatureCountry: {
			type: [
				{
					type: String
					// required: false
				}
			]
			// required: false
		},

		foreignLiterature: {
			type: Boolean
			// required: false
		},

		timePeriod: {
			type: [
				{
					type: String
					// required: false
				}
			]
			// required: false
		},

		grade: {
			type: String
			// required: false
		},

		suitableAge: {
			type: [
				{
					type: String,
					reqired: false
				}
			]
			// required: false
		},

		packaging: {
			type: String
			// required: false
		},

		occasion: {
			tupe: [
				{
					type: String
					// required: false
				}
			]
			// required: false
		},

		style: {
			type: [
				{
					type: String,
					reqired: false
				}
			]
			// required: false
		},

		excerpts: {
			type: [
				{
					type: String
					// required: false
				}
			]
			// required: false
		},

		suitableFor: {
			type: [
				{
					type: String
					// required: false
				}
			]
			// required: false
		},

		createdAt: {
			type: Number
		},

		updatedAt: {
			type: Number
		},

		deletedAt: {
			type: Number
			// required: false
		}
	},
	{
		versionKey: false,
		timestamps: true
	}
);

bookSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

bookSchema.statics.deleteOne = async function (bookId) {
	await deleteDocument(await this.findOne(bookId));
};

const Book = model('Book', bookSchema);

export default Book;
