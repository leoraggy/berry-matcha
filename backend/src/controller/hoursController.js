import Hours from "../model/hours.js";

export const getHours = async (req, res) => {
  try {
    const hours = await Hours.find();
    res.json(hours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHours = async (req, res) => {
  try {
    const hours = await Hours.findbyIdAndUpdate(req.params.id, req.body);
    res.json(hours);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
