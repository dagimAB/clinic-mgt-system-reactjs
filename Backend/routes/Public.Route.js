const express = require("express");
const router = express.Router();
const { getPublicQueue } = require("../models/Queue.model");

/**
 * @route   GET /public/queue
 * @desc    Get the current public patient queue
 */
router.get("/queue", async (req, res) => {
  try {
    const queue = await getPublicQueue();
    res.status(200).json(queue);
  } catch (err) {
    console.error("Public Queue Fetch Error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
