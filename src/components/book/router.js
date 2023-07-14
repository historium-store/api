import { Router } from 'express';
import {
	cache,
	checkRole,
	validateQueryParams
} from '../../middleware.js';
import { CACHE_DURATION } from '../../utils.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const bookRouter = Router();

bookRouter
	.route('/')
	.get(validateQueryParams, cache(CACHE_DURATION), controller.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

bookRouter.get('/filters', controller.getFilters);

bookRouter
	.route('/:id')
	.get(cache(CACHE_DURATION), controller.getOne)
	.patch(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateUpdate,
		controller.updateOne
	)
	.delete(
		authenticate,
		checkRole(['admin', 'seller']),
		controller.deleteOne
	);

export default bookRouter;

/**
 * @swagger
 * /book:
 *   post:
 *     summary: Create new book
 *     security:
 *       - api_auth: []
 *     tags:
 *       - book
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *               type:
 *                 type: string
 *               publisher:
 *                 type: string
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               publishedIn:
 *                 type: integer
 *               authors:
 *                 type: array
 *                 items:
 *                   type: string
 *               compilers:
 *                 type: array
 *                 items:
 *                   type: string
 *               translators:
 *                 type: array
 *                 items:
 *                   type: string
 *               illustrators:
 *                 type: array
 *                 items:
 *                   type: string
 *               editors:
 *                 type: array
 *                 items:
 *                   type: string
 *               series:
 *                 type: string
 *               copies:
 *                 type: integer
 *               isbns:
 *                 type: array
 *                 items:
 *                   type: string
 *               firstPublishedIn:
 *                 type: number
 *               originalName:
 *                 type: string
 *               font:
 *                 type: string
 *               format:
 *                 type: string
 *               pages:
 *                 type: integer
 *               weight:
 *                 type: integer
 *               paperType:
 *                 type: string
 *               bindingType:
 *                 type: string
 *               illustrationsType:
 *                 type: string
 *               literaturePeriod:
 *                 type: array
 *                 items:
 *                   type: string
 *               literatureCountry:
 *                 type: array
 *                 items:
 *                   type: string
 *               foreignLiterature:
 *                 type: boolean
 *               timePeriod:
 *                 type: array
 *                 items:
 *                   type: string
 *               grade:
 *                 type: string
 *               suitableAge:
 *                 type: array
 *                 items:
 *                   type: string
 *               packaging:
 *                 type: string
 *               occasion:
 *                 type: array
 *                 items:
 *                   type: string
 *               style:
 *                 type: array
 *                 items:
 *                   type: string
 *               suitableFor:
 *                 type: array
 *                 items:
 *                   type: string
 *               excerpts:
 *                 type: array
 *                 items:
 *                   type: string
 *               files:
 *                 type: object
 *                 example:
 *                   pdf: url
 *             required:
 *               - product
 *               - type
 *               - publisher
 *               - languages
 *               - publishedIn
 *             example:
 *               product: 64b0584f0d1da9c6b4a13dd2
 *               languages:
 *                 - Українська
 *               authors:
 *                 - 6473aa0ec9dd40d6f991c587
 *               type: Електронна
 *               publisher: 64734a3b9d7e69643faf5ecb
 *               literaturePeriod:
 *                 - Сучасна література
 *               isbns:
 *                 - 978-617-679-832-3
 *               pages: 664
 *               translators:
 *                 - 6473ab64c9dd40d6f991c5bc
 *               publishedIn: 2020
 *               excerpts:
 *                 - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/4575ec8d-deba-4b32-b172-04b93818b73a.png
 *                 - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/b24d7246-97e0-44f6-8491-a1e1ad3ec8d8.png
 *                 - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/fe35e9a5-eeb9-46d8-894d-7e1a0e733ca2.png
 *                 - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/37434458-06c9-416b-9e25-931e35132959.png
 *                 - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/5899a2c4-1a35-4641-882a-c4f66b9c277f.png
 *                 - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/190b49f0-d6c6-40db-9d94-b7d0bb517dda.png
 *                 - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/85d6e925-5a33-4c09-8e02-e7950b9b90ab.png
 *                 - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/46954a9a-0f90-4c11-a36b-f79862b19ecb.png
 *                 - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/60d3a9f4-aeb1-4a36-bc3f-1a3e2840d85f.png
 *                 - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/138b4749-5a0e-487d-bb0c-b18fed02d32a.png
 *                 - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/5fffdd0f-48cd-47ab-8bf5-8de230c22dad.png
 *               files:
 *                 pdf: https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/bf082a80-0d0f-46dd-be63-b2623c612310.pdf
 *     responses:
 *       '201':
 *         description: Created book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *   get:
 *     summary: Get all books
 *     tags:
 *       - book
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookResponse'
 * /book/filters:
 *   get:
 *     summary: Get filters for existing books
 *     tags:
 *       - book
 *     responses:
 *       '200':
 *         description: All filters for existing books
 * /book/{id}:
 *   get:
 *     summary: Get one book by id
 *     tags:
 *       - book
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book not found
 *   patch:
 *     summary: Update one existing book by id
 *     security:
 *       - api_auth: []
 *     tags:
 *       - book
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *               type:
 *                 type: string
 *               publisher:
 *                 type: string
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               publishedIn:
 *                 type: integer
 *               authors:
 *                 type: array
 *                 items:
 *                   type: string
 *               compilers:
 *                 type: array
 *                 items:
 *                   type: string
 *               translators:
 *                 type: array
 *                 items:
 *                   type: string
 *               illustrators:
 *                 type: array
 *                 items:
 *                   type: string
 *               editors:
 *                 type: array
 *                 items:
 *                   type: string
 *               series:
 *                 type: string
 *               copies:
 *                 type: integer
 *               isbns:
 *                 type: array
 *                 items:
 *                   type: string
 *               firstPublishedIn:
 *                 type: number
 *               originalName:
 *                 type: string
 *               font:
 *                 type: string
 *               format:
 *                 type: string
 *               pages:
 *                 type: integer
 *               weight:
 *                 type: integer
 *               paperType:
 *                 type: string
 *               bindingType:
 *                 type: string
 *               illustrationsType:
 *                 type: string
 *               literaturePeriod:
 *                 type: array
 *                 items:
 *                   type: string
 *               literatureCountry:
 *                 type: array
 *                 items:
 *                   type: string
 *               foreignLiterature:
 *                 type: boolean
 *               timePeriod:
 *                 type: array
 *                 items:
 *                   type: string
 *               grade:
 *                 type: string
 *               suitableAge:
 *                 type: array
 *                 items:
 *                   type: string
 *               packaging:
 *                 type: string
 *               occasion:
 *                 type: array
 *                 items:
 *                   type: string
 *               style:
 *                 type: array
 *                 items:
 *                   type: string
 *               suitableFor:
 *                 type: array
 *                 items:
 *                   type: string
 *               excerpts:
 *                 type: array
 *                 items:
 *                   type: string
 *               files:
 *                 type: object
 *                 example:
 *                   pdf: url
 *             example:
 *               pages: 667
 *     responses:
 *       '200':
 *         description: Updated book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book not found
 *   delete:
 *     summary: Delete one book by id
 *     security:
 *       - api_auth: []
 *     tags:
 *       - book
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: Book deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book not found
 * /book/{key}:
 *   get:
 *     summary: Get one book by key
 *     tags:
 *       - book
 *     parameters:
 *       - $ref: '#/components/parameters/key'
 *     responses:
 *       '200':
 *         description: Requested book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book not found
 *   patch:
 *     summary: Update one existing book by key
 *     security:
 *       - api_auth: []
 *     tags:
 *       - book
 *     parameters:
 *       - $ref: '#/components/parameters/key'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *               type:
 *                 type: string
 *               publisher:
 *                 type: string
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               publishedIn:
 *                 type: integer
 *               authors:
 *                 type: array
 *                 items:
 *                   type: string
 *               compilers:
 *                 type: array
 *                 items:
 *                   type: string
 *               translators:
 *                 type: array
 *                 items:
 *                   type: string
 *               illustrators:
 *                 type: array
 *                 items:
 *                   type: string
 *               editors:
 *                 type: array
 *                 items:
 *                   type: string
 *               series:
 *                 type: string
 *               copies:
 *                 type: integer
 *               isbns:
 *                 type: array
 *                 items:
 *                   type: string
 *               firstPublishedIn:
 *                 type: number
 *               originalName:
 *                 type: string
 *               font:
 *                 type: string
 *               format:
 *                 type: string
 *               pages:
 *                 type: integer
 *               weight:
 *                 type: integer
 *               paperType:
 *                 type: string
 *               bindingType:
 *                 type: string
 *               illustrationsType:
 *                 type: string
 *               literaturePeriod:
 *                 type: array
 *                 items:
 *                   type: string
 *               literatureCountry:
 *                 type: array
 *                 items:
 *                   type: string
 *               foreignLiterature:
 *                 type: boolean
 *               timePeriod:
 *                 type: array
 *                 items:
 *                   type: string
 *               grade:
 *                 type: string
 *               suitableAge:
 *                 type: array
 *                 items:
 *                   type: string
 *               packaging:
 *                 type: string
 *               occasion:
 *                 type: array
 *                 items:
 *                   type: string
 *               style:
 *                 type: array
 *                 items:
 *                   type: string
 *               suitableFor:
 *                 type: array
 *                 items:
 *                   type: string
 *               excerpts:
 *                 type: array
 *                 items:
 *                   type: string
 *               files:
 *                 type: object
 *                 example:
 *                   pdf: url
 *             example:
 *               pages: 667
 *     responses:
 *       '200':
 *         description: Updated book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book not found
 *   delete:
 *     summary: Delete one book by key
 *     security:
 *       - api_auth: []
 *     tags:
 *       - book
 *     parameters:
 *       - $ref: '#/components/parameters/key'
 *     responses:
 *       '204':
 *         description: Book deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book not found
 * components:
 *   schemas:
 *     BookResponse:
 *       type: object
 *       example:
 *         _id: 6473b4da569debe2438c787a
 *         product:
 *           _id: 6473b4d9569debe2438c7871
 *           name: Триста поезій
 *           price: 350
 *           quantity: 1
 *           type:
 *             name: Книга
 *             key: book
 *           sections:
 *             - _id: 6473a4e6c9dd40d6f991c4da
 *               name: Поезія
 *               key: poeziya
 *           description: До книги Ліни Костенко — улюбленої української поетеси кінця другого–початку третього тисячоліття — увійшли найвідоміші її вірші з різних періодів творчості — від ранньої поезії до сьогодні, а також уривки з романів та поем. Це найповніше вибране поетеси за часів Незалежності. Книга у подарунковій твердій обкладинці під тканину з жовтим шовковим ляссе.
 *           reviews: []
 *           images:
 *             - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/012d3d49-1d11-481b-bbcb-e604450111f7.webp
 *             - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/59702e85-3df8-417d-9cc9-3aa25f0fa072.webp
 *             - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/82047686-87e7-4e1e-8079-09a22a450213.webp
 *           createdAt: 1685304537739
 *           updatedAt: 1688825062030
 *           code: '116012'
 *           key: trista-poeziy
 *           requiresDelivery: true
 *           creators:
 *             - Ліна Костенко
 *         publisher:
 *           _id: 64734ad09d7e69643faf5ef1
 *           name: А-ба-ба-га-ла-ма-га
 *         languages:
 *           - Українська
 *         publishedIn: 2019
 *         authors:
 *           - _id: 64738172baf7acc39da67a08
 *             fullName: Ліна Костенко
 *             pictures: []
 *         compilers:
 *           - _id: 6473ab2cc9dd40d6f991c5a6
 *             fullName: Іван Малкович
 *           - _id: 6473ab32c9dd40d6f991c5ad
 *             fullName: Оксана Пахльовська
 *         translators: []
 *         illustrators: []
 *         editors: []
 *         series:
 *           _id: 6473a950c9dd40d6f991c557
 *           name: Українська Поетична Антологія
 *         isbns:
 *           - 978-617-585-035-0
 *         format: 120x165 мм
 *         pages: 416
 *         weight: 400
 *         paperType: Офсетний
 *         bindingType: Тверда
 *         illustrationsType:
 *           - Немає ілюстрацій
 *         literaturePeriod:
 *           - Сучасна література
 *         literatureCountry:
 *           - Українська література
 *         foreignLiterature: false
 *         grade: 11-й клас
 *         suitableAge: []
 *         occasion: []
 *         style: []
 *         suitableFor: []
 *         timePeriod: []
 *         type: Паперова
 *         excerpts:
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/3fa0aa84-9d9c-4b11-8147-21795e4a0836.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/ef62a9bf-720f-41ae-bef2-9e396a246092.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/25cffad3-3c06-4a1e-9d14-da1c7b49e73d.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/0f0e6505-3681-4ae8-aace-b88ae72f3730.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/ddf29d72-795d-4da1-aa2c-293382897b2f.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/b7710ca8-3f98-4268-b2d4-d80127cc43b6.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/92be0c3a-4a07-4383-ad8e-84a77ab97d11.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/e5dc55d4-30d4-4cf6-b51f-e93902a5a90e.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/5b75e800-3a4a-437d-99ce-2f4df542e0c9.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/f84b5360-e64d-4154-9333-150179218c12.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/3ef3fe0f-8448-4130-9757-c0bf74348e77.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/035d6a4d-20fc-4f9b-a544-9eaae43b5288.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/86701df9-1cf3-48cb-a4f1-2d9203cec3c3.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/452f7f09-1df7-42d8-a90f-3799f432f1bc.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/389d9fa7-9d8b-410d-8919-e4e8f539682c.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/8cd5397a-31cf-4611-973f-2fc08eaa8e35.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/a87f8428-52bd-4518-aedc-d1655aeab609.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/c5b2c30f-7c91-4ce1-bf53-f66d5982abd1.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/2293a4a8-76aa-4922-a5e8-ebb65295d642.jpg
 *           - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/3d452448-1cab-4f92-90ad-e4c163e9ad47.jpg
 *         updatedAt: 1688419611844
 */
