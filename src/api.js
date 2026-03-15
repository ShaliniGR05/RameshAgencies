// Central API base URL
// Set VITE_API_URL in your Vercel project's environment variables
// pointing to your Render backend URL, e.g. https://ramesh-agencies-api.onrender.com
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE_URL;
