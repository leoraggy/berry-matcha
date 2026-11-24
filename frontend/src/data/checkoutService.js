export const createCheckoutSession = async (order) => {
  const response = await fetch("/api/create-checkout-session", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || data.message || `Request failed with status ${response.status}`,
    );
  }

  if (!data.url) {
    throw new Error("Checkout session URL was not returned.");
  }

  return data;
};

export const getOrderDetails = async (sessionId) => {
  if (!sessionId) {
    throw new Error("Missing checkout session ID.");
  }

  const response = await fetch(
    `/api/order-details?session_id=${encodeURIComponent(sessionId)}`,
    { credentials: "include" },
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || data.message || `Request failed with status ${response.status}`,
    );
  }

  return data;
};
