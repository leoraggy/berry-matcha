const CART_API_URL = "/api/cart";

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        `Request failed with status ${response.status}`,
    );
  }

  return data;
};

export const getCart = () => request(CART_API_URL);

export const addCartItem = (item) =>
  request(`${CART_API_URL}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });

export const removeCartItem = (cartItemId) =>
  request(`${CART_API_URL}/items/${encodeURIComponent(cartItemId)}`, {
    method: "DELETE",
  });

export const getAvailableToppings = () => request("/api/toppings");

export const formatOrderDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
