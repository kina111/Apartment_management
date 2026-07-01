import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000, // 5 seconds timeout
});

export default axiosClient;
