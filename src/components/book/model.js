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

		authors: [
			{
				type: ObjectId,
				ref: 'Author',
				required: false
			}
		],

		compilers: [
			{
				type: ObjectId,
				ref: 'Compiler',
				required: false
			}
		],

		translators: [
			{
				type: ObjectId,
				ref: 'Translator',
				required: false
			}
		],

		illustrators: [
			{
				type: ObjectId,
				ref: 'Illustrator',
				required: false
			}
		],

		editors: [
			{
				type: ObjectId,
				ref: 'Editor',
				required: false
			}
		],

		series: {
			type: ObjectId,
			ref: 'BookSeries',
			required: false
		},

		copies: {
			type: Number,
			required: false
		},

		isbns: [
			{
				type: String,
				required: false
			}
		],

		firstPublishedIn: {
			type: Number,
			required: false
		},

		originalName: {
			type: String,
			required: false
		},

		font: {
			type: String,
			required: false
		},

		format: {
			type: String,
			required: false
		},

		pages: {
			type: Number,
			required: false
		},

		weight: {
			type: Number,
			required: false
		},

		paperType: {
			type: String,
			required: false
		},

		bindingType: {
			type: String,
			required: false
		},

		illustrationsType: [
			{
				type: String,
				required: false
			}
		],

		literaturePeriod: [
			{
				type: String,
				required: false
			}
		],

		literatureCountry: [
			{
				type: String,
				required: false
			}
		],

		foreignLiterature: {
			type: Boolean,
			required: false
		},

		timePeriod: [
			{
				type: String,
				required: false
			}
		],

		grade: {
			type: String,
			required: false
		},

		suitableAge: [
			{
				type: String,
				reqired: false
			}
		],

		packaging: {
			type: String,
			required: false
		},

		occasion: [
			{
				type: String,
				required: false
			}
		],

		style: [
			{
				type: String,
				reqired: false
			}
		],

		excerpts: [
			{
				type: String,
				required: true
			}
		],

		suitableFor: [
			{
				type: String,
				required: false
			}
		]
	},
	{
		versionKey: false
	}
);

bookSchema.methods.deleteOne = async function () {
	await deleteDocument(this);
};

const Book = model('Book', bookSchema);

export default Book;
