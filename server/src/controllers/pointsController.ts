import {Request, Response} from 'express';
import kness from "../database/connection"


class PointController{
    async create(req : Request, res : Response){
    
        const {
            name,
            email,
            whatsapp,
            city,
            uf,
            latitude,
            longitude,
            itens
        } = req.body;
        
        const point = {
            image: "https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=40",
            name,
            email,
            whatsapp,
            city,
            uf,
            latitude,
            longitude,
        }
        
        kness.transaction(
            async (trx)=>{

                // DOING INSERT INTO TABLE POINTS IN ECOLETA
                const insertedIds = await kness('points').insert(point).transacting(trx);
                const point_id = insertedIds[0];

                const pointItens = itens.map(
                    (item_id : Number) => {
                        return {
                            item_id,
                            point_id,
                        };
                    }
                )
                
                await kness('point_itens').insert(pointItens).transacting(trx);

            }
        ).then(()=>{
            
            return res.json(
                {   
                    "messagem": "Point added",
                }
            );

        }).catch(()=>{
            
            return res.json(
                {   
                    "messagem": "Point didn't added"
                }
            );

        })
    }

    async show(req: Request, resp: Response){
        
        const idPoint = req.params.id
        const resultPoint = await kness('points').where('id', idPoint).first();

        if(!resultPoint){
            return resp.status(400).json({
                "message": "Point not found"
            });
        }else{

            const itens = await kness('itens').join('point_itens', 'itens.id', '=','point_itens.item_id')
            .where('point_itens.point_id', idPoint);

            return resp.json({resultPoint, itens});
        }

    }

    async index(req: Request , res: Response){
        
        const {city, uf, itens} = req.query;

        
        const parseItens = String(itens)
            .split(',')
            .map( item => Number(item.trim()))
        
        
        const points = await kness('points')
            .join('point_itens','points.id', '=', 'point_itens.point_id' )
            .whereIn('point_itens.item_id', parseItens)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');
        
        return res.json(points);
    }

    // Teste
    async deleteAll(req: Request, res: Response){

        const del = await kness("points").del();
        const delPivo = await kness('point_itens').del();
        const delItens = await kness('itens').del();
        return res.send("Deletado");
    }

}


export default PointController;