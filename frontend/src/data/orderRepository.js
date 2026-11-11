const API_BASE_URL = "/api/orders";

class OrderRepository {
  async request(url, options) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Error requesting orders:", error);
      throw error;
    }
  }

  async getAllOrders() {
    return this.request(API_BASE_URL);
  }

  async getOrderById(id) {
    return this.request(`${API_BASE_URL}/${encodeURIComponent(id)}`);
  }

  async createOrder(order) {
    return this.request(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
  }

  async updateOrder(id, order) {
    return this.request(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
  }

  async deleteOrder(id) {
    return this.request(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }
}

export default OrderRepository;
