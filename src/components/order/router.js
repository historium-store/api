import { Router } from 'express';
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
 *               comment:
 *                 type: string
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
 *                         name:
 *                           type: string
 *                         type:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             key:
 *                               type: string
 *                         key:
 *                           type: string
 *                         image:
 *                           type: string
 *                         price:
 *                           type: number
 *                         code:
 *                           type: string
 *                     quantity:
 *                       type: integer
 *                       format: int32
 *             required:
 *               - contactInfo
 *               - deliveryInfo
 *               - paymentType
 *               - products
 *     responses:
 *       '201':
 *         description: Order created successfully
 */
orderRouter.post('/', validator.validateCreate, controller.createOne);

export default orderRouter;
