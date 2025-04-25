import Medusa from "@medusajs/medusa-js"

// Defaults to standard port for Medusa server
let BACKEND_URL = "http://localhost:9000"

if (process.env.NEXT_PUBLIC_BACKEND_URL) {
  BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
}

export const medusaClient = new Medusa({
  baseUrl: BACKEND_URL,
  maxRetries: 3,
	// apiKey: "123"
})
