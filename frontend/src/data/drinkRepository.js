const API_BASE_URL = `${import.meta.env.VITE_API_URL}/drinks`;

class DrinkRepository {
  async getAllDrinks() {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error("Network response was no ok");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching drinks:", error);
      throw error;
    }
  }

  async getDrinkById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching drink with id ${id}:`, error);
      throw error;
    }
  }
}

export default DrinkRepository;
