import kness from '../database/connection';
import {Response, Request} from 'express'

class ItensController {

    async index(req : Request, res : Response){

        const itens = await kness('itens').select('*')
        const serialized = itens.map( (item)=>{
            return {
                id: item.id,
                title: item.title,
                image_url: `http://192.168.0.107:3050/uploads/${item.image}`
            }
        });
        return res.json(serialized);
    }

}

export default ItensController;