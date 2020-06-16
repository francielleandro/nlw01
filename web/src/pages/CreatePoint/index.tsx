import React, { useEffect,useState,ChangeEvent,FormEvent, HtmlHTMLAttributes } from 'react';

import { Link , useHistory} from 'react-router-dom';
import {FiArrowDownLeft} from 'react-icons/fi';
import './styles.css';
import { Map,TileLayer, Marker} from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import {LeafletMouseEvent} from 'leaflet';
import logo from '../../assets/logo.svg';
import DropZone from '../../components/Dropzone';


interface Item {
    id:number;
    title:string;
    image_url:string;
}

interface IBGEUFResponse {
    sigla:string;
    nome:string;
}

interface IBGECidadeResponse {
    nome:string;
}


const CreatePoint = () =>{
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<IBGEUFResponse[]>([]);
    const [cidades, setCidades] = useState<IBGECidadeResponse[]>();

    const [initialPosition, setInitialPosition] = useState<[number,number]>([0,0]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });
    const [selectedUF, setSelectedUf] = useState('0');
    const [selectedCity,setSelectedCity] = useState("0");
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0]);
    const [seletedFile, setSelectedFile] = useState<File>();

    const history = useHistory();

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    },[]);

    useEffect(() => {
        axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
        .then(response => {
            setUfs(response.data);
        });
    },[])

    useEffect(() =>{

        if(selectedUF == '0'){
            return;
        }
        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
        .then(response => {
            setCidades(response.data);
        });
    },[selectedUF])

    useEffect(() =>{
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude} = position.coords;
            setInitialPosition([latitude,longitude]);
        })
    },[])

    function handleSelectUf(event:ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        setSelectedUf(uf);
    }

    function handleSelectCity(event:ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city);
    }

    function handleMapClick(event:LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }

    function handleImputChange(event:ChangeEvent<HTMLInputElement>){
        const { name, value} = event.target;

        setFormData({...formData, [name]:value})
    }

    function handeSelectItem(id:number){ 
        const alreadySelected = selectedItems.findIndex(item => item == id);

        if(alreadySelected >=0){
            const filtredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filtredItems);
        }else{
            setSelectedItems([...selectedItems,id]);
        }
    }

    async function handleSubmit(event:FormEvent){
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUF;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();
        

        
        data.append('name',name);
        data.append('email',email);
        data.append('whatsapp',whatsapp);
        data.append('uf',uf);
        data.append('city',city);
        data.append('latitude',String(latitude));
        data.append('longitude',String(longitude));
        data.append('items',items.join(','));

        if(seletedFile){
            data.append('image',seletedFile);
        }

       await api.post('points',data);
       alert('Ponto de coleta criado');

       history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"></img>
                <Link to="/">
                    <FiArrowDownLeft/>
                    Voltar para home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do<br /> ponto de coleta</h1>

                <DropZone onFileUploaded = {setSelectedFile}/>

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
                            onChange={handleImputChange}   
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleImputChange}      
                            />
                        </div>
                        <div className="field">
                        <label htmlFor="whatsapp">Whatsapp</label>
                        <input 
                            type="text"
                            name="whatsapp"
                            id="whatsapp"
                            onChange={handleImputChange}      
                        />
                    </div>

                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer 
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition}></Marker> 
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                value = {selectedUF} 
                                onChange={handleSelectUf} 
                                name="uf" id="uf">
                                    <option 
                                        value="0">Selecione uma UF
                                    </option>
                                    {ufs.map(itemUf => (
                                    <option 
                                        key={itemUf.sigla} 
                                        value={itemUf.sigla}>{itemUf.nome} - {itemUf.sigla}
                                    </option>))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                value={selectedCity}
                                onChange={handleSelectCity}
                                name="city" id="city">
                                <option value="0">Selecione uma cidade</option>
                                {cidades?.map(cidade => (
                                    <option 
                                    key={cidade.nome}
                                    value={cidade.nome} > {cidade.nome} 
                                    </option>

                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Ítems de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} 
                            onClick={() => handeSelectItem(item.id)}
                            className={selectedItems.includes(item.id)?"selected":""}
                            >
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>

    );
}

export default CreatePoint;