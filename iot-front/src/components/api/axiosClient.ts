// @ts-ignore
import axios, { AxiosInstance } from "axios";

// @ts-ignore
const BASE_URL = "http://localhost:3000";

export const axiosClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 5000,
});
