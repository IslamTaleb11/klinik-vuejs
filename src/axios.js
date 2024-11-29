import axios from "axios";

// axios.defaults.baseURL = "http://localhost:8000/api/v1";
axios.interceptors.request.use(config => {
    // Check if the request is for the CSRF cookie endpoint
    if (config.url === '/sanctum/csrf-cookie') {
      // Use the specific URL for fetching the CSRF cookie
      config.url = 'http://localhost:8000/sanctum/csrf-cookie';
      //config.url = 'https://klinik-system.com/sanctum/csrf-cookie'; // Change to your actual domain if needed
      return config;
    }
      //config.baseURL = 'https://klinik-system.com/backend/api/v1'; // Change to your actual domain if needed

    // If not the CSRF cookie endpoint, use the default base URL
    config.baseURL = 'http://localhost:8000/api/v1'; // Change to your actual domain if needed
    return config;
  });

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;



export default axios;
