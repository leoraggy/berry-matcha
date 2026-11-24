import dotenv from "dotenv";
import Stripe from "stripe";
import Drink from "../model/drink.model.js";
import Order from "../model/order.model.js";
import Topping from "../model/topping.model.js";
import Hours from "../model/hours.model.js";
dotenv.config();

const stripePrivateKey = process.env.STRIPE_PRIVATE_KEY?.trim();
if (!stripePrivateKey) {
  throw new Error("STRIPE_PRIVATE_KEY must be configured.");
}
if (!/^sk_(?:test|live)_/.test(stripePrivateKey)) {
  throw new Error("STRIPE_PRIVATE_KEY must be a valid Stripe secret key.");
}
if (
  process.env.NODE_ENV === "production" &&
  stripePrivateKey.startsWith("sk_test_")
) {
  throw new Error(
    "A live Stripe private key (sk_live_) is required in production.",
  );
}

const stripeClient = new Stripe(stripePrivateKey);

export const postCheckout = async (req, res) => {
  try {
    const { name, phone, email, pickupDate, pickupTime, location } =
      req.body ?? {};
    const cart = req.session?.cart;
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof email !== "string" ||
      !isValidEmail(email.trim()) ||
      typeof pickupDate !== "string" ||
      !isValidPickupDate(pickupDate) ||
      typeof pickupTime !== "string" ||
      !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(pickupTime) ||
      typeof location !== "string" ||
      !location.trim() ||
      !Array.isArray(cart) ||
      cart.length === 0
    ) {
      return res.status(400).json({
        error:
          "Provide valid customer and pickup details and a non-empty cart.",
      });
    }

    const pickupLocation = await Hours.findOne({ name: location.trim() });
    if (
      !pickupLocation ||
      !isAvailablePickupSlot(pickupDate, pickupTime, pickupLocation.hours)
    ) {
      return res.status(400).json({
        error: "The selected pickup location, date, or time is unavailable.",
      });
    }

    const totalDrinks = cart.reduce(
      (total, drink) => total + Number(drink.quantity),
      0,
    );
    if (
      cart.some(
        (drink) =>
          !Number.isInteger(Number(drink.quantity)) ||
          Number(drink.quantity) < 1,
      ) ||
      totalDrinks > 5
    ) {
      return res
        .status(400)
        .json({ error: "Order must contain between 1 and 5 drinks." });
    }

    const drinkIds = cart.map((drink) => drink.drinkId);
    const storedDrinks = await Drink.find({ _id: { $in: drinkIds } });
    const drinksById = new Map(
      storedDrinks.map((drink) => [drink._id.toString(), drink]),
    );
    if (
      cart.some((item) => {
        const drink = drinksById.get(String(item.drinkId));
        return !drink || !drink.isAvailable;
      })
    ) {
      return res.status(400).json({
        error: "One or more drinks in your cart are no longer available.",
      });
    }

    const orderDrinks = cart.map((drink) => {
      const storedDrink = drinksById.get(String(drink.drinkId));
      const toppingIds = drink.toppingIds ?? [];
      return {
        drinkId: storedDrink._id,
        name: storedDrink.name,
        price: storedDrink.price,
        quantity: Number(drink.quantity),
        sugar: drink.sugar,
        ice: drink.ice,
        toppingIds,
      };
    });
    const selectedToppingIds = [
      ...new Set(orderDrinks.flatMap((drink) => drink.toppingIds)),
    ];
    const selectedToppings = await Topping.find({
      _id: { $in: selectedToppingIds },
      isAvailable: true,
    });
    if (selectedToppings.length !== selectedToppingIds.length) {
      return res.status(400).json({
        error: "One or more toppings in your cart are no longer available.",
      });
    }
    const toppingsById = new Map(
      selectedToppings.map((topping) => [topping._id.toString(), topping.name]),
    );
    const orderDrinksWithToppings = orderDrinks.map((drink) => ({
      ...drink,
      toppings: drink.toppingIds.map((toppingId) =>
        toppingsById.get(toppingId.toString()),
      ),
    }));

    const order = await new Order({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      location: location.trim(),
      totalPrice: orderDrinks.reduce(
        (total, drink) => total + drink.price * drink.quantity,
        0,
      ),
      pickupDate,
      pickupTime,
      drinks: orderDrinksWithToppings,
    }).save();

    const line_items = orderDrinksWithToppings.map((drink) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: drink.name,
        },
        unit_amount: addSurchargeFee(drink.price),
      },
      quantity: drink.quantity,
    }));

    let session;
    try {
      session = await stripeClient.checkout.sessions.create({
        mode: "payment",
        line_items,
        customer_email: email.trim(),
        success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/order`,
        metadata: {
          orderId: order._id.toString(),
        },
      });
    } catch (error) {
      await Order.findByIdAndDelete(order._id);
      throw error;
    }

    if (!session.url) {
      await Order.findByIdAndDelete(order._id);
      throw new Error("Stripe did not return a checkout URL.");
    }

    req.session.checkout = {
      stripeSessionId: session.id,
      orderId: order._id.toString(),
    };

    await new Promise((resolve, reject) => {
      req.session.save((error) => (error ? reject(error) : resolve()));
    });

    res.status(201).json({ url: session.url });
  } catch (error) {
    console.error("Checkout session creation failed:", error);
    const isInvalidOrder =
      error.name === "ValidationError" || error.name === "CastError";
    res.status(isInvalidOrder ? 400 : 500).json({ error: error.message });
  }
};

export const getOrderDetails = async (req, res) => {
  const { session_id } = req.query;

  try {
    if (!session_id || typeof session_id !== "string") {
      return res.status(400).json({ error: "Missing checkout session ID." });
    }

    const checkout = req.session?.checkout;
    if (
      !checkout?.stripeSessionId ||
      !checkout.orderId ||
      session_id !== checkout.stripeSessionId
    ) {
      return res
        .status(403)
        .json({ error: "Checkout session not associated with this browser." });
    }

    const stripeSession =
      await stripeClient.checkout.sessions.retrieve(session_id);

    if (stripeSession.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed." });
    }

    if (stripeSession.metadata?.orderId !== checkout.orderId) {
      return res.status(403).json({ error: "Checkout order mismatch." });
    }

    const order = await Order.findByIdAndUpdate(
      checkout.orderId,
      { status: "paid" },
      { new: true },
    );
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (req.session?.cart?.length) {
      req.session.cart = [];
      await new Promise((resolve, reject) => {
        req.session.save((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    res.json({
      order: {
        _id: order._id.toString(),
        createdAt: order.createdAt,
        name: order.name,
        email: order.email,
        phone: order.phone,
        pickupDate: order.pickupDate,
        pickupTime: order.pickupTime,
        location: order.location,
        drinks: order.drinks.map((drink) => ({
          drinkId: drink.drinkId.toString(),
          name: drink.name,
          price: drink.price,
          quantity: drink.quantity,
          sugar: drink.sugar,
          ice: drink.ice,
          toppings: drink.toppings,
        })),
      },
    });
  } catch (error) {
    console.error("Unable to verify checkout session:", error);
    res.status(500).json({ error: "Unable to verify checkout session." });
  }
};

export const handleStripeWebhook = async (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers["stripe-signature"];

  if (!webhookSecret) {
    console.error("Stripe webhook secret is not configured.");
    return res.status(500).json({ error: "Webhook is not configured." });
  }
  if (!Buffer.isBuffer(req.body) || typeof signature !== "string") {
    return res.status(400).json({ error: "Invalid webhook request." });
  }

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret,
    );
  } catch {
    return res.status(400).json({ error: "Invalid webhook signature." });
  }

  if (
    !["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(
      event.type,
    )
  ) {
    return res.json({ received: true });
  }

  const checkoutSession = event.data.object;
  if (checkoutSession.payment_status !== "paid") {
    return res.json({ received: true });
  }

  const orderId = checkoutSession.metadata?.orderId;
  if (!orderId) {
    console.error("Paid Stripe Checkout Session is missing its order ID.");
    return res.status(400).json({ error: "Checkout session has no order ID." });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: "paid" },
      { new: false, runValidators: true },
    );
    if (!order) {
      console.error(`Paid Stripe Checkout Session references missing order ${orderId}.`);
      return res.status(500).json({ error: "Order could not be updated." });
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Unable to apply Stripe payment webhook:", error);
    return res.status(500).json({ error: "Unable to update order payment." });
  }
};

const addSurchargeFee = (totalPrice) => {
  totalPrice *= 100;
  return Math.ceil(totalPrice + totalPrice * 0.029 + 30);
};

const isValidEmail = (email) =>
  email.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const pickupTimeZone = "America/Los_Angeles";
const pickupDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: pickupTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const getPickupDateTimeParts = () =>
  Object.fromEntries(
    pickupDateTimeFormatter
      .formatToParts(new Date())
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );

const isValidPickupDate = (dateValue) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return false;
  }

  const date = new Date(`${dateValue}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateValue
  ) {
    return false;
  }

  const { year, month, day } = getPickupDateTimeParts();
  const todayValue = `${year}-${month}-${day}`;
  const latestPickupDate = new Date(`${todayValue}T00:00:00.000Z`);
  latestPickupDate.setUTCDate(latestPickupDate.getUTCDate() + 14);
  const latestPickupDateValue = latestPickupDate.toISOString().slice(0, 10);
  return dateValue >= todayValue && dateValue <= latestPickupDateValue;
};

const isAvailablePickupSlot = (dateValue, timeValue, hours) => {
  if (!Array.isArray(hours)) {
    return false;
  }

  const date = new Date(`${dateValue}T00:00:00.000Z`);
  const dayLabels = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
  const dayHours = hours.find(
    (entry) => entry.dayOfTheWeek === dayLabels[date.getUTCDay()],
  )?.hours;
  if (typeof dayHours !== "string" || dayHours.toLowerCase() === "closed") {
    return false;
  }

  const [hour, minute] = timeValue.split(":").map(Number);
  const requestedMinutes = hour * 60 + minute;
  const { year, month, day, hour: currentHour, minute: currentMinute } =
    getPickupDateTimeParts();
  const todayValue = `${year}-${month}-${day}`;
  if (
    dateValue === todayValue &&
    requestedMinutes <= Number(currentHour) * 60 + Number(currentMinute)
  ) {
    return false;
  }

  const timeRangePattern =
    /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i;

  return dayHours.split(",").some((range) => {
    const match = range.trim().match(timeRangePattern);
    if (!match) {
      return false;
    }

    const toMinutes = (rangeHour, rangeMinute, meridiem) => {
      const hour = Number(rangeHour);
      const minute = Number(rangeMinute ?? 0);
      if (hour < 1 || hour > 12 || minute > 59) {
        return null;
      }

      return (
        ((hour % 12) + (meridiem.toLowerCase() === "pm" ? 12 : 0)) * 60 +
        minute
      );
    };
    const start = toMinutes(match[1], match[2], match[3]);
    const end = toMinutes(match[4], match[5], match[6]);
    if (start === null || end === null || end <= start) {
      return false;
    }

    return (
      requestedMinutes >= start &&
      requestedMinutes < end &&
      (requestedMinutes - start) % 30 === 0
    );
  });
};
