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

function getStoredToken() {
  return (
    localStorage.getItem("clientToken") ||
    localStorage.getItem("token") ||
    ""
  );
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function clearStoredAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("clientToken");
  localStorage.removeItem("authToken");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("user");
  localStorage.removeItem("clientUser");
  localStorage.removeItem("adminUser");
  localStorage.removeItem("currentClientEmail");
  localStorage.removeItem("clientEmail");
  localStorage.removeItem("currentClientName");
  localStorage.removeItem("clientName");
  localStorage.removeItem("adminAuth");
  localStorage.removeItem("isClientLoggedIn");
}

function saveClientAuth(data) {
  if (data?.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("clientToken", data.token);
    localStorage.setItem("authToken", data.token);
  }

  if (data?.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("clientUser", JSON.stringify(data.user));
    localStorage.setItem("currentClientEmail", data.user.email || "");
    localStorage.setItem("clientEmail", data.user.email || "");
    localStorage.setItem("currentClientName", data.user.name || "");
    localStorage.setItem("clientName", data.user.name || "");
    localStorage.setItem("isClientLoggedIn", "true");
  }
}

function saveAdminAuth(data) {
  if (data?.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("authToken", data.token);
  }

  if (data?.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("adminUser", JSON.stringify(data.user));
    localStorage.setItem("adminAuth", "true");
  }
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

    const data = await handleResponse(response);

    clearStoredAuth();

    if (data?.user?.role === "admin") {
      saveAdminAuth(data);
      return data;
    }

    saveClientAuth(data);
    return data;
  },

  async googleLogin({ email, name, photo }) {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: String(email || "").trim().toLowerCase(),
        name: String(name || "").trim(),
        photo: photo || "",
      }),
    });

    const data = await handleResponse(response);

    clearStoredAuth();
    saveClientAuth(data);

    return data;
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
    const token = getStoredToken();

    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await handleResponse(response);
    clearStoredAuth();

    return data;
  },

  async me() {
    const token = getStoredToken();

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return handleResponse(response);
  },
};

export { API_BASE_URL };