import { Router } from 'express';
import { checkRole, validateQueryParams } from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const bookRouter = Router();

bookRouter
	.route('/')
	.get(validateQueryParams, controller.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

bookRouter.get('/filters', controller.getFilters);

bookRouter
	.route('/:id')
	.get(controller.getOne)
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
 *     responses:
 *       '201':
 *         description: Created book
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
 *             example:
 *               _id: 6474dd030472d62ed62f451c
 *               product:
 *                 _id: 6474dd020472d62ed62f4513
 *                 name: Бетмен. Книга 1. Суд сов
 *                 price: 468
 *                 quantity: 0
 *                 type:
 *                   _id: 64737fee4adab164082714b6
 *                   name: Книга
 *                   key: book
 *                 sections:
 *                 - _id: 64745d4afd6b8e660ca42dd3
 *                   name: Супергерої
 *                   key: superheroyi
 *                 description: 'Пропонуємо вашій увазі книгу Зака Снайдера «Бетмен. Книга 1. Суд сов»
 *                   українською мовою від видавництва «Рідна Мова»! Про книгу: Сови — загадкові нічні
 *                   птахи. І це вони насправді правлять Ґотемом. Раніше Брюс Вейн чув історії про
 *                   загадкових «сов» — таємну організацію, яка підпорядкувала собі ціле місто. Він
 *                   був упевнений, що це всього лише місця легенда, яких повно... Але після серії
 *                   жорстоких вбивств небезпечних та впливових людей міста, головний герой починає
 *                   розуміти, що їх причина криється куди глибше, ніж він думав. У графічному романі
 *                   «Бетмен. Книга 1. Суд сов» Бетмену доведеться кинути виклик загадкового Суду Сов
 *                   та дізнатися, хто ховається за образом нічних хижаків.'
 *                 reviews: []
 *                 images:
 *                 - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/cbdd4b36-50e5-47c6-b516-a3632476ee7e.webp
 *                 - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/63812d90-cb5d-4ba2-8154-73c0c45bcb83.webp
 *                 createdAt: 1685380354460
 *                 updatedAt: 1688731469377
 *                 code: '116012'
 *                 key: betmen-kniga-1-sud-sov
 *                 requiresDelivery: true
 *                 creators:
 *                 - Скотт Снайдер
 *               publisher:
 *                 _id: 64734714f82f3873394f3d7e
 *                 name: Рідна Мова
 *               languages:
 *               - Українська
 *               publishedIn: 2017
 *               authors:
 *               - _id: 647381c8baf7acc39da67a32
 *                 fullName: Скотт Снайдер
 *                 pictures: []
 *               compilers: []
 *               translators:
 *               - _id: 64745fe9fd6b8e660ca42ddf
 *                 fullName: Олена Оксенич
 *               illustrators:
 *               - _id: 64745feefd6b8e660ca42de6
 *                 fullName: Грег Капулло
 *               editors: []
 *               series:
 *                 _id: 64745ff3fd6b8e660ca42dee
 *                 name: Комікси DC та Vertigo
 *               isbns:
 *               - 978-966-917-203-7
 *               originalName: Batman. Volume 1. The Court of Owls
 *               format: 165х250 мм
 *               pages: 176
 *               weight: 380
 *               paperType: Крейдований
 *               bindingType: Тверда
 *               illustrationsType:
 *               - Кольорові
 *               literaturePeriod: []
 *               suitableAge: []
 *               occasion: []
 *               style: []
 *               suitableFor: []
 *               literatureCountry: []
 *               timePeriod: []
 *               type: Паперова
 *               excerpts:
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/6a372fb1-780b-4cec-9217-8ac548af5e44.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/642b7103-efd2-4bdd-8d9f-71bcef53049f.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/943b4b73-247c-417c-a22b-4ca2a6c940e7.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/e9e70f54-27ef-49c4-8055-3dfacb4a3717.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/0d6e9d13-2a20-444a-8504-3f034f94d032.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/7b288fcb-a23e-4f27-8dd8-5a541a78c6f7.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/a63ab5a8-751f-40e1-8ae0-ffefefe710ad.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/0f2abdbd-dec4-481f-9fb8-34138be1bd86.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/1288d90b-f27f-43d4-9ad6-2e7f61577087.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/4bbe02bf-0804-445c-a340-a6b467b9114e.jpg
 *               updatedAt: 1688419336609
 * /book/{id}:
 *   get:
 *     summary: Get one book
 *     tags:
 *       - book
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested book
 *         content:
 *           applicaiton/json:
 *             example:
 *               _id: 6474dd030472d62ed62f451c
 *               product:
 *                 _id: 6474dd020472d62ed62f4513
 *                 name: Бетмен. Книга 1. Суд сов
 *                 price: 468
 *                 quantity: 0
 *                 type:
 *                   _id: 64737fee4adab164082714b6
 *                   name: Книга
 *                   key: book
 *                 sections:
 *                 - _id: 64745d4afd6b8e660ca42dd3
 *                   name: Супергерої
 *                   key: superheroyi
 *                 description: 'Пропонуємо вашій увазі книгу Зака Снайдера «Бетмен. Книга 1. Суд сов»
 *                   українською мовою від видавництва «Рідна Мова»! Про книгу: Сови — загадкові нічні
 *                   птахи. І це вони насправді правлять Ґотемом. Раніше Брюс Вейн чув історії про
 *                   загадкових «сов» — таємну організацію, яка підпорядкувала собі ціле місто. Він
 *                   був упевнений, що це всього лише місця легенда, яких повно... Але після серії
 *                   жорстоких вбивств небезпечних та впливових людей міста, головний герой починає
 *                   розуміти, що їх причина криється куди глибше, ніж він думав. У графічному романі
 *                   «Бетмен. Книга 1. Суд сов» Бетмену доведеться кинути виклик загадкового Суду Сов
 *                   та дізнатися, хто ховається за образом нічних хижаків.'
 *                 reviews: []
 *                 images:
 *                 - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/cbdd4b36-50e5-47c6-b516-a3632476ee7e.webp
 *                 - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/63812d90-cb5d-4ba2-8154-73c0c45bcb83.webp
 *                 createdAt: 1685380354460
 *                 updatedAt: 1688731469377
 *                 code: '116012'
 *                 key: betmen-kniga-1-sud-sov
 *                 requiresDelivery: true
 *                 creators:
 *                 - Скотт Снайдер
 *               publisher:
 *                 _id: 64734714f82f3873394f3d7e
 *                 name: Рідна Мова
 *               languages:
 *               - Українська
 *               publishedIn: 2017
 *               authors:
 *               - _id: 647381c8baf7acc39da67a32
 *                 fullName: Скотт Снайдер
 *                 pictures: []
 *               compilers: []
 *               translators:
 *               - _id: 64745fe9fd6b8e660ca42ddf
 *                 fullName: Олена Оксенич
 *               illustrators:
 *               - _id: 64745feefd6b8e660ca42de6
 *                 fullName: Грег Капулло
 *               editors: []
 *               series:
 *                 _id: 64745ff3fd6b8e660ca42dee
 *                 name: Комікси DC та Vertigo
 *               isbns:
 *               - 978-966-917-203-7
 *               originalName: Batman. Volume 1. The Court of Owls
 *               format: 165х250 мм
 *               pages: 176
 *               weight: 380
 *               paperType: Крейдований
 *               bindingType: Тверда
 *               illustrationsType:
 *               - Кольорові
 *               literaturePeriod: []
 *               suitableAge: []
 *               occasion: []
 *               style: []
 *               suitableFor: []
 *               literatureCountry: []
 *               timePeriod: []
 *               type: Паперова
 *               excerpts:
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/6a372fb1-780b-4cec-9217-8ac548af5e44.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/642b7103-efd2-4bdd-8d9f-71bcef53049f.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/943b4b73-247c-417c-a22b-4ca2a6c940e7.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/e9e70f54-27ef-49c4-8055-3dfacb4a3717.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/0d6e9d13-2a20-444a-8504-3f034f94d032.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/7b288fcb-a23e-4f27-8dd8-5a541a78c6f7.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/a63ab5a8-751f-40e1-8ae0-ffefefe710ad.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/0f2abdbd-dec4-481f-9fb8-34138be1bd86.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/1288d90b-f27f-43d4-9ad6-2e7f61577087.jpg
 *               - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/4bbe02bf-0804-445c-a340-a6b467b9114e.jpg
 *               updatedAt: 1688419336609
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book not found
 *   patch:
 *     summary: Update one existing book
 *     security:
 *       - api_auth: []
 *     tags:
 *       - book
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested book
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book not found
 *   delete:
 *     summary: Delete one book
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
 */
