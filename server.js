import mongoose from 'mongoose';
import importData from './db-init.js';
import app from './src/app.js';
// import Product from './src/components/product/model.js';

importData().then(() => {
	const PORT = process.env.PORT || 3000;
	mongoose
		.connect(process.env.CONNECTION_STRING, {
			dbName: 'historium-db'
		})
		// .then(async () => {
		// 	const products = await Product.find().populate({
		// 		path: 'specificProduct',
		// 		model: 'Book',
		// 		populate: 'authors'
		// 	});

		// 	for (let product of products) {
		// 		product.creators = product.specificProduct.authors.map(
		// 			a => a.fullName
		// 		);
		// 		product.url = `/book/${product.specificProduct._id}`;

		// 		product.set('specificProduct');
		// 		product.set('model');

		// 		await product.save();
		// 	}

		// })
		.then(() =>
			app.listen(PORT, () =>
				console.log(`API is listening on port ${PORT}`)
			)
		)
		.catch(err => {
			console.log(`Failed to connect to database: ${err.message}`);
		});

	process.on('unhandledRejection', event => {
		console.log(event);
	});
});
