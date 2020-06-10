import React,{useEffect, useState, ChangeEvent, FormEvent} from "react";
import {Link, useHistory} from 'react-router-dom';
import { FiArrowLeft} from 'react-icons/fi'
import {Map, TileLayer, Marker} from 'react-leaflet'
import api from '../../services/api';
import axios from 'axios';
import './style.css'
import logo from'../../assets/logo.svg'
import {LeafletMouseEvent} from 'leaflet'
import Dropzone from '../../components/Dropzone/index';
// Interfaces bellow
interface Item {
    id: number,
    title: string,
    image_url: string
}
interface IBGEResponse{
    sigla : string
}
interface IBGECityResponse{
    nome : string
}
const CreatePoint = () =>{

    // States
    /*
        When We have array or object, we must declare 
        the type of them
    */
    const [itens, setItens] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });
    const [initialPositon, setInitialPositon] = useState<[number, number]>([0,0]);
    const [selectedUf, setSelectedUf] = useState('0'); 
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectItens, setSelectedItens] = useState<number[]>([])
    const [selectedPositon, setSelectedPositon] = useState<[number, number]>([0,0]);
    const [selectedFile, setSelectedFile] = useState<File>();
    const history = useHistory();
    
    //UseEffects
    useEffect( ()=>{
        navigator.geolocation.getCurrentPosition(position =>{
            const {latitude, longitude} = position.coords;
            setInitialPositon([latitude,longitude]);
        })
    }, [])

    useEffect(()=>{
        // Acessing api for route /itens to get datas about itens
        api.get('itens').then(
            response => {
                setItens(response.data)
            }
        )
    }, []);

    useEffect( ()=>{
        // Acessing the Api of IBGE to get data about states and city
        axios.get<IBGEResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados").then(
            res => {
                const ufInitials = res.data.map(
                    uf => uf.sigla
                );
                setUfs(ufInitials);
            }
        );
    }, [])
    
    useEffect(()=>{
        if(selectedUf === '0'){
            return;
        }else{
            axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(
                res => {
                    const cityNames = res.data.map(
                        city => city.nome
                    );
                    setCities(cityNames);
                }
            );
        }
        /*
            This state depend the selectedUf state 
            to get datas about cities
        */
    }, [selectedUf])

    // FUNCTIONS
    /*
        Functions created to be call when 
        same events are emit
    */

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
        const ufValue = event.target.value
        setSelectedUf(ufValue);
    }


    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
        const cityValue = event.target.value
        setSelectedCity(cityValue);
    }

    function handleMapClick(event: LeafletMouseEvent){  
        setSelectedPositon([
            event.latlng.lat,
            event.latlng.lng
        ]);
    } 

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target;
        setFormData(
            {
                ...formData,
                [name]: value
            }
        )
    }

    function handleSelectItem(id: number){
        
        const alreadySelected = selectItens.findIndex(
            item => item === id
        )
        
        if(alreadySelected >= 0){
            const filteredItens = selectItens.filter(
                item => item !== id
            )
            setSelectedItens(filteredItens);
        }else{
            setSelectedItens([...selectItens, id]);
        }
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault();
        const {name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPositon;
        const itens = selectItens;

        const data = new FormData();   
        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('city', city);
        data.append('uf', uf);
        data.append('itens', itens.join(','));
        data.append('longitude', String(longitude));
        data.append('latitude', String(latitude));
        
        if(selectedFile){
            data.append('image', selectedFile);
        }

        await api.post('points', data);
        history.push('/');
    }

    // Component
    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt=""/>
                
                <Link to="/">
                    <FiArrowLeft/>
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de coleta</h1>
                
                <Dropzone onFileUploaded={setSelectedFile}/>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name" 
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">

                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email" 
                                onChange = {handleInputChange}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp" 
                                onChange = {handleInputChange}
                            />
                        </div>


                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPositon} zoom={15} onclick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPositon} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf"
                                id="uf"
                                onChange={handleSelectedUf} 
                                value={selectedUf}
                            >
                                <option value="0">Selecione Estado</option>
                                {   
                                    // Send datas about Brazil's states to frontend, they are refleted by React
                                    ufs.map(
                                        uf => (
                                            <option key={uf} value={uf}>{uf}</option>
                                        )
                                    )
                                }
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                onChange={handleSelectedCity}
                                value={selectedCity}
                            >
                                <option value="0">Selecione sua cidade</option>
                                {   
                                    // Send datas about city to frontend, they are refleted by React
                                    cities.map(
                                        city => (
                                            <option key={city} value={city}>{city}</option>
                                        )
                                    )
                                }
                            </select>
                        </div>

                    </div>
                    
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {   
                             // Send datas about iamges to frontend, they are refleted by React
                            itens.map(
                                item =>(
                                    <li key={item.id} 
                                        onClick={()=> handleSelectItem(item.id)}
                                        className = {selectItens.includes(item.id) ? 'selected' : ' '}
                                    >
                                        <img src={item.image_url} alt={item.title} />
                                        <span>{item.title}</span>
                                    </li>
                                )
                            )
                        }
                    </ul>

                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
}

export default CreatePoint;