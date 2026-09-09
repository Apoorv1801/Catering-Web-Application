// Single source of truth for the backend URL.
// Local development (VS Code Live Server) keeps hitting localhost.
const API_BASE_URL =
  window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://royalcaterers.onrender.com";

// Menu item images come from two different places:
// - Freshly admin-uploaded images are saved on the BACKEND (Render) and
//   stored in the database as "uploads/filename.jpg" — these must be
//   loaded from API_BASE_URL.
// - The original stock menu photos were re-pointed at the FRONTEND's own
//   images/ folder (bare filenames, no "uploads/" prefix) after the
//   backend's old uploaded copies of them went missing — these load
//   directly from the frontend.
function getMenuImageUrl(imagePath) {
  if (!imagePath) return "images/default-food.jpg";
  return imagePath.startsWith("uploads/")
    ? `${API_BASE_URL}/${imagePath}`
    : `images/${imagePath}`;
}