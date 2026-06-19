import axios from "axios";

const BASE_URL = "http://localhost:8080";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000, // 5 seconds timeout
});

export default axiosClient;
