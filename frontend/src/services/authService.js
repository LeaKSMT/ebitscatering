function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL?.trim();

  if (!envUrl) {
    console.warn("VITE_API_URL is missing. Using Railway fallback.");
    return "https://ebitscatering-production.up.railway.app/api";
  }

  const cleaned = envUrl.replace(/\/+$/, "");
  return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
}

const API_BASE_URL = getApiBaseUrl();

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const authService = {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    return handleResponse(response);
  },

  async register({ name, email, password, contactNumber }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name,
        email,
        password,
        contactNumber,
      }),
    });

    return handleResponse(response);
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    return handleResponse(response);
  },

  async me() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
    });

    return handleResponse(response);
  },
};

export { API_BASE_URL };