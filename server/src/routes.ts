import express from 'express';
import ItensController from "./controllers/itensController";
import PointsController from "./controllers/pointsController";

import multer from 'multer';
import multerConfig from './config/multer';
import { celebrate, Joi } from 'celebrate';

const routes = express.Router();
const upload = multer(multerConfig);

const pointsControler = new PointsController();
const itensController = new ItensController();

routes.get('/itens', itensController.index) ;

routes.get('/points', pointsControler.index);
routes.get('/points/:id', pointsControler.show);

// TESTE
routes.delete('/points', pointsControler.deleteAll);

// Route with uplods of images
routes.post(
    '/points', 
    upload.single('image') ,
    celebrate({
        body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required().email(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.string().required().max(2),
            itens: Joi.string().required()
        })
    }),
    pointsControler.create);

export default routes;