import axios from 'axios';
import { API_URL } from 'react-native-dotenv';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export default api; 