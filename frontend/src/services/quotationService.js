function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL?.trim();

  if (!envUrl) {
    console.warn("VITE_API_URL is missing. Using Railway fallback.");
    return "https://ebitscatering.onrender.com/api";
  }

  const cleaned = envUrl.replace(/\/+$/, "");
  return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
}

const API_BASE_URL = getApiBaseUrl();

console.log("Quotation API Base URL:", API_BASE_URL);

function getStoredToken() {
  try {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("clientToken") ||
      ""
    );
  } catch {
    return "";
  }
}

function buildHeaders(extraHeaders = {}) {
  const token = getStoredToken();

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

async function handleResponse(response) {
  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.error
        ? `${data.message}: ${data.error}`
        : data?.message || `Request failed with status ${response.status}`
    );
  }

  return data;
}

export const quotationService = {
  async createQuotation(payload) {
    const response = await fetch(`${API_BASE_URL}/quotations`, {
      method: "POST",
      headers: buildHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  },

  async getQuotations() {
    const response = await fetch(`${API_BASE_URL}/quotations`, {
      method: "GET",
      headers: buildHeaders(),
      credentials: "include",
    });

    return handleResponse(response);
  },

  async getQuotationById(id) {
    const response = await fetch(`${API_BASE_URL}/quotations/${id}`, {
      method: "GET",
      headers: buildHeaders(),
      credentials: "include",
    });

    return handleResponse(response);
  },

  async updateQuotation(id, payload) {
    const response = await fetch(`${API_BASE_URL}/quotations/${id}`, {
      method: "PUT",
      headers: buildHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  },

  async updateQuotationStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/quotations/${id}/status`, {
      method: "PUT",
      headers: buildHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify({ status }),
    });

    return handleResponse(response);
  },

  async deleteQuotation(id) {
    const response = await fetch(`${API_BASE_URL}/quotations/${id}`, {
      method: "DELETE",
      headers: buildHeaders(),
      credentials: "include",
    });

    return handleResponse(response);
  },
};

export { API_BASE_URL };