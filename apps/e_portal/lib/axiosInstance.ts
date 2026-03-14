// src/lib/axiosInstance.ts
import axios from 'axios'

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1/public"; 

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://113.166.209.162/api/v1/public/";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Optional: interceptor để log lỗi
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('Axios error:', error?.response || error.message)
    return Promise.reject(error)
  }
)

export default axiosInstance
