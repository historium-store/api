import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe('Publisher requests test', () => {
	before(() => {
		const PORT = process.env.PORT || 3000;

		mongoose
			.connect(process.env.CONNECTION_STRING, {
				dbName: 'historium-db'
			})
			.then(() =>
				app.listen(PORT, () =>
					console.log(`API is listening on port ${PORT}`)
				)
			)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});
	});

	after(() => {
		mongoose.connection.close();
	});

	describe('Get all publishers', () => {
		it('Should return a json object with an array of publishers', async () => {
			await request(app)
				.get('/publisher')
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.be.an('array');
				});
		});
	});

	describe('Get publisher by id', () => {
		it('Should return a json object with information about the publisher', async () => {
			await request(app)
				.get('/publisher/64734714f82f3873394f3d7e')
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
				});
		});

		it('Should return a json object with information about the publisher', async () => {
			await request(app)
				.get('/publisher/64734714sf82f3873394f3d7e')
				.then(response => {
					expect(response.status).to.equal(400);
				});
		});
	});
});
