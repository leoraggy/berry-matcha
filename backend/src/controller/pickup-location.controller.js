import PickupLocation from "../model/pickup-location.model.js";

export const getPickupLocations = async (_req, res, next) => {
  try {
    const locations = await PickupLocation.find({ isAvailable: true }).sort({
      name: 1,
    });
    res.json(locations);
  } catch (error) {
    next(error);
  }
};
