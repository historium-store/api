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
 *                   firstName: John
 *                   lastName: Williams
 *                   phoneNumber: '+380442138972'
 *                   email: john.williams@gmail.com
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
 *                   firstName: Michael
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
 *                   - address
 *               callback:
 *                 type: boolean
 *                 default: false
 *               deliveryInfo:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                     example: 60c17a9f8d6a95001e62aaf5
 *                   city:
 *                     type: string
 *                     example: Kyoto
 *                   type:
 *                     type: string
 *                     example: 609c8d6e6f7cd4c30c862ee8
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
 *                     example:
 *                       street: Stolbovaya
 *                       house: 5a
 *                       apartment: 19
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
 *               paymentType:
 *                 type: string
 *               comment:
 *                 type: string
 *             required:
 *               - contactInfo
 *               - deliveryInfo
 *               - paymentType
 *     responses:
 *       '201':
 *         description: Order created successfully
 */
orderRouter.post('/', validator.validateCreate, controller.createOne);

export default orderRouter;
