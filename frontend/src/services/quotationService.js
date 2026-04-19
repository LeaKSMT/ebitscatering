function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL?.trim();

  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  return "http://localhost:5000/api";
}

const API_BASE_URL = getApiBaseUrl();

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? {
      Authorization: `Bearer ${token}`,
    }
    : {};
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const quotationService = {
  async createQuotation(payload) {
    const response = await fetch(`${API_BASE_URL}/quotations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  },

  async getQuotations() {
    const response = await fetch(`${API_BASE_URL}/quotations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    return handleResponse(response);
  },

  async getQuotationById(id) {
    const response = await fetch(`${API_BASE_URL}/quotations/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    return handleResponse(response);
  },

  async updateQuotationStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/quotations/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status }),
    });

    return handleResponse(response);
  },

  async deleteQuotation(id) {
    const response = await fetch(`${API_BASE_URL}/quotations/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    return handleResponse(response);
  },
};

export { API_BASE_URL };