const API_BASE_URL = "/api/drinks";

class DrinkRepository {
  async request(url, options) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Error requesting drinks:", error);
      throw error;
    }
  }

  async getAllDrinks() {
    return this.request(API_BASE_URL);
  }

  async getDrinkSales() {
    return this.request(`${API_BASE_URL}/sales`);
  }

  async getDrinkById(id) {
    return this.request(`${API_BASE_URL}/${encodeURIComponent(id)}`);
  }

  async uploadDrinkImage(file) {
    const body = new FormData();
    body.append("image", file);

    return this.request(`${API_BASE_URL}/image`, {
      method: "POST",
      body,
    });
  }

  async createDrink(drink) {
    return this.request(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(drink),
    });
  }

  async updateDrink(id, drink) {
    return this.request(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(drink),
    });
  }

  async deleteDrink(id) {
    return this.request(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }
}

export default DrinkRepository;
