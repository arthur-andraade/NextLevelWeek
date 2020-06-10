import express from 'express';
import path from "path";
import routes from "./routes";
import cors from 'cors';
import {errors} from 'celebrate'

const app = express();
app.use(cors())
app.use(express.json());
app.use(routes)

// Images
app.use('/uploads', express.static(
    path.resolve(__dirname, '..', 'uploads')
));

app.use(errors());

app.listen(3050, ()=>{
    console.log("Server rodando");
});