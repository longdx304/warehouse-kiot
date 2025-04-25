import axios from "axios"
import { BACKEND_URL } from "@/lib/constants/medusa-backend-url"

const client = axios.create({ baseURL: BACKEND_URL })

export default function medusaRequest(method, path = "", payload = {}) {
  const options = {
    method,
    withCredentials: true,
    url: path,
    data: payload,
    json: true,
  }
  return client(options)
}
