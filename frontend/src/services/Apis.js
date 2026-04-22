import axios from "axios";
import { API_URL } from "../services/config";

export const endpoints = {
    'course': '/api/courses/'
}

export default axios.create({
    baseURL: API_URL
})