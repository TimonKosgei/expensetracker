//axiom is like fetch api but better

import axios from 'axios';

const api = axios.create({
    baseURL:'http://localhost:5000/api',
})

//automatically attach a token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // or from context/state
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default api;
