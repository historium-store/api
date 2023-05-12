import { Product } from './mongo-utils/schemas.js';

export const createOne = async (product) => {
	try
	{
		const newProduct = new Product(product);

		const validationError = newProduct.validateSync();
		if(validationError){
			throw new Error(validationError.message);
		}

		await newProduct.save()
			.then( savedProduct => {
				console.log( `${savedProduct.name} added to db.`);
			})
	}
	catch(err)
	{
		console.error(err);
    	throw err;
	}
}

export const getOne = async (filter) => {
	try 
	{
		const product = await Product.findOne(filter).exec();
		return product;
	} 
	catch(err) 
	{
		console.error(err);
    	throw err;
	}
}

export const updateOne = async (filter, update) => {
	try
	{
		const result = await Product.updateOne(filter, update);
		return result;
	}
	catch(err)
	{
		console.error(err);
    	throw err;
	}
}

export const deleteOne = async (filter) => {
	try
	{
		const result = await Product.deleteOne(filter);
		return result;
	}
	catch(err)
	{
		console.error(err);
    	throw err;
	}
}