const express = require("express");
const router = express.Router();
const {
  postChat,
  getConversations,
  getMessages,
  getDashboardAssist,
} = require("../controllers/AI.controller");

router.post("/chat", postChat);
router.post("/dashboard-help", getDashboardAssist);
router.get("/conversations", getConversations);
router.get("/conversations/:conversationId/messages", getMessages);

module.exports = router;
