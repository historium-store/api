import { Router } from 'express';
import {
	checkRole,
	checkSameIdOrRole,
	validateQueryParams
} from '../../middleware.js';
import authController from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const orderRouter = Router();

/**
 * @swagger
 * /order:
 *   post:
 *     tags:
 *       - order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contactInfo:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                 required:
 *                   - firstName
 *                   - lastName
 *                   - phoneNumber
 *                   - email
 *                 example:
 *                   firstName: Michael
 *                   lastName: Wheat
 *                   phoneNumber: '+380445294771'
 *                   email: michael.wheat@ukr.net
 *               receiverInfo:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                 required:
 *                   - firstName
 *                   - lastName
 *                   - phoneNumber
 *                 example:
 *                   firstName: Judy
 *                   lastName: Alvares
 *                   phoneNumber: '+380971123752'
 *               gift:
 *                 type: boolean
 *                 default: false
 *               companyInfo:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Gigasoft
 *                   identificationNumber:
 *                     type: string
 *                     description: EDRPOU/ITIN code
 *                     example: '38492456'
 *                   addressInfo:
 *                     type: object
 *                     properties:
 *                       address:
 *                         type: string
 *                     required:
 *                       - address
 *                     example:
 *                       address: Sigma Rd. 25
 *                 required:
 *                   - name
 *                   - identificationNumber
 *                   - addressInfo
 *               callback:
 *                 type: boolean
 *                 default: false
 *               deliveryInfo:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                     example: 6485a3c27f77c14cc954680e
 *                   city:
 *                     type: string
 *                     example: Полтава
 *                   type:
 *                     type: string
 *                     example: 6485ac70c1aa743f45c89a42
 *                   addressInfo:
 *                     type: object
 *                     oneOf:
 *                       - properties:
 *                           address:
 *                             type: string
 *                         required:
 *                           - address
 *                       - properties:
 *                           street:
 *                             type: string
 *                           house:
 *                             type: string
 *                           apartment:
 *                             type: string
 *                         required:
 *                           - street
 *                           - house
 *                           - apartment
 *                       - properties:
 *                           region:
 *                             type: string
 *                           postcode:
 *                             type: string
 *                           street:
 *                             type: string
 *                         required:
 *                           - region
 *                           - postcode
 *                           - street
 *                     example:
 *                       street: Фруктова
 *                       house: '28'
 *                       apartment: 74
 *                   contactInfo:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       middleName:
 *                         type: string
 *                     required:
 *                       - firstName
 *                       - lastName
 *                       - middleName
 *                     example:
 *                       firstName: Vitalii
 *                       lastName: Vitaliev
 *                       middleName: Vitalievich
 *                 required:
 *                   - country
 *                   - city
 *                   - type
 *                   - addressInfo
 *               paymentType:
 *                 type: string
 *                 example: Оплата карткою On-line
 *               comment:
 *                 type: string
 *                 example: not required
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 6473b317569debe2438c784d
 *                         name:
 *                           type: string
 *                           example: Я бачу, вас цікавить пітьма
 *                         type:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: Книга
 *                             key:
 *                               type: string
 *                               example: book
 *                         key:
 *                           type: string
 *                           example: ya-bachu-vas-cikavit-pitma
 *                         image:
 *                           type: string
 *                           example: https://historium-bucket-eu.s3.eu-central-1.amazonaws.com/5fd2d6a8-f84a-4bda-b86e-c524a2fb7feb.webp
 *                         price:
 *                           type: number
 *                           example: 500
 *                         code:
 *                           type: string
 *                           example: '115968'
 *                     quantity:
 *                       type: integer
 *                       format: int32
 *                       example: 3
 *             required:
 *               - contactInfo
 *               - deliveryInfo
 *               - paymentType
 *               - items
 *     responses:
 *       '201':
 *         description: Order created successfully
 */
orderRouter
	.route('/')
	.get(checkRole(['admin']), validateQueryParams, controller.getAll)
	.post(validator.validateCreate, controller.createOne);

orderRouter
	.route('/:id')
	.get(
		authController.authenticate,
		checkSameIdOrRole(['admin']),
		validator.validateId,
		controller.getOne
	);

export default orderRouter;
