import axios from 'axios';


const api = axios.create({
    baseURL: 'http://localhost:3050'
})

export default api;