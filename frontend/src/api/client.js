import axios from 'axios';

// Creating an Axios instance — similar to creating a RestTemplate bean in Spring
const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api', // Note: backend port is 3001
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor — Similar to ClientHttpRequestInterceptor in Spring
// This attaches the JWT token to every outgoing request automatically.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor — automatically handles 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is 401 Unauthorized and we aren't on the login page...
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        // Clear local storage and send user to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
