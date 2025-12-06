import axios from "axios";

export const api = axios.create({
  baseURL: "https://xenoshopifystore-production.up.railway.app/",
});