import mongoose from "mongoose";
import DB from '.env';	
import connectToDatabase from './mongo-connect.js';

connectToDatabase(DB);

const UserSchema = mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
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
  }
}, 
{ 
  timestamps: true, 
  versionKey: false 
});
export const User = mongoose.model('User', UserSchema);

const ProductSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  type: {
    type: String,
    enum: ['book', 'other'],
    default: 'other',
  },
  description: {
    type: String,
    required: false,
  }
},
{
  versionKey: false 
});
export const Product = mongoose.model('Product', ProductSchema);

const PublisherSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  }
},
{
  versionKey: false 
})
export const Publisher = mongoose.model('Publisher', PublisherSchema);

const AuthorSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  }
},
{
  versionKey: false 
})
export const Author = mongoose.model('Author', AuthorSchema);

const BookSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publisher',
    required: true
  },
  language: {
    type: String,
    required: true
  },
  publishedIn: {
    type: Number,
    required: true
  }
},
{
  versionKey: false 
})
export const Book = mongoose.model('Book', BookSchema);