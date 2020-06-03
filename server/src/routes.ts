import express from 'express';
import ItensController from "./controllers/itensController";
import PointsController from "./controllers/pointsController";

const routes = express.Router();
const pointsControler = new PointsController();
const itensController = new ItensController();

routes.get('/itens', itensController.index) ;

routes.post('/points', pointsControler.create);
routes.get('/points', pointsControler.index);
routes.get('/points/:id', pointsControler.show);

// TESTE
routes.delete('/points', pointsControler.deleteAll);

export default routes;