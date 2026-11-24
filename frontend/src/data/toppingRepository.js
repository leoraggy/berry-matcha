const API_BASE_URL = "/api/toppings";

class ToppingRepository {
  async request(url, options) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Request failed with status ${response.status}`,
        );
      }

      return data;
    } catch (error) {
      console.error("Error requesting toppings:", error);
      throw error;
    }
  }

  async getAllToppings() {
    return this.request(API_BASE_URL);
  }

  async getToppingById(id) {
    return this.request(`${API_BASE_URL}/${encodeURIComponent(id)}`);
  }

  async createTopping(topping) {
    return this.request(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(topping),
    });
  }

  async deleteTopping(id) {
    return this.request(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }
}

export default ToppingRepository;
