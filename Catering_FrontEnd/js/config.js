// Single source of truth for the backend URL.
// Local development (VS Code Live Server) keeps hitting localhost.
// Once deployed, this becomes your live Render backend URL.
const API_BASE_URL =
  window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://royalcaterers.onrender.com";