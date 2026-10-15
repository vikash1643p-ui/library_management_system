
import axios from "axios";

const authApi = axios.create({
  baseURL: "http://localhost:3002/api"
});

authApi.interceptors.request.use(config => {
  const token = localStorage.getItem("libraryToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

authApi.interceptors.response.use(
  response => response,
  error => {
    if (
      error.response?.status === 401 &&
      localStorage.getItem("libraryToken")
    ) {
      localStorage.removeItem("libraryToken");
      localStorage.removeItem("libraryUser");
      window.dispatchEvent(new Event("library-auth-expired"));
    }

    return Promise.reject(error);
  }
);

export default authApi;
