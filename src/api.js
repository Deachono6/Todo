import axios from 'axios';

const api = axios.create({
  baseURL: 'https://todo-server-gules.vercel.app/api/todos', 
});

export default api;