import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'https://c0de-front.onrender.com',
    withCredentials: true, //browser will attach cookies when true
    headers:{
        'Content-Type': 'application/json'
    }
});

export default axiosClient;
