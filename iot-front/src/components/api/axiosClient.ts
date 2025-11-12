// src/components/api/axiosClient.ts
import axios, { AxiosInstance } from "axios";
import {getToken} from "@/lib/auth.ts";

const BASE_URL = "http://localhost:3000";

export const axiosClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 5000,
});

// ✅ Intercepteur pour ajouter automatiquement le JWT
axiosClient.interceptors.request.use((config) => {
    const token = getToken()
    console.log(token);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;
