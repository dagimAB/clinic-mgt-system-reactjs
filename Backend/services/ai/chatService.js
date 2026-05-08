const {
  createConversation,
  getConversationById,
  listConversationsByUser,
  insertMessage,
  listMessages,
  touchConversation,
  insertRequest,
  insertResponse,
} = require("../../models/AIChat.model");
const { createChatCompletion } = require("./providers/openrouterClient");
const { buildSystemPrompt, buildDashboardHelpPrompt } = require("./platformContextBuilder");

const DEFAULT_MODEL = "openrouter/owl-alpha";

const generateConversationId = () => {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const ensureConversation = async ({ conversationId, userId, userRole, initialMessage }) => {
  if (conversationId) {
    const existing = await getConversationById(conversationId);
    if (existing) return existing;
  }

  const nextConversationId = generateConversationId();
  const title = initialMessage ? initialMessage.slice(0, 80) : "New conversation";

  return createConversation({
    conversationId: nextConversationId,
    userId,
    userRole,
    title,
    metadata: { source: "shms-web" },
  });
};

const buildMessagesForProvider = ({ systemPrompt, history }) => {
  return [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];
};

const sendMessage = async ({ message, conversationId, user }) => {
  if (!message || !message.trim()) {
    throw new Error("Message is required");
  }

  const userId = user?.id || null;
  const userRole = user?.userType || user?.role || "guest";

  const conversation = await ensureConversation({
    conversationId,
    userId,
    userRole,
    initialMessage: message,
  });

  await insertMessage({
    conversationId: conversation.conversation_id,
    role: "user",
    content: message.trim(),
  });

  // record a structured request row for richer debugging/audit
  try {
    await insertRequest({
      conversationId: conversation.conversation_id,
      role: "user",
      content: message.trim(),
      model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
      provider: "openrouter",
      requestPayload: { source: "shms-web" },
    });
  } catch (err) {
    // non-fatal: keep going if audit insert fails
    console.warn("Failed to insert AI request record:", err.message);
  }

  const history = await listMessages(conversation.conversation_id, 30);
  const systemPrompt = buildSystemPrompt({ userRole, userId });

  let completion;
  try {
    completion = await createChatCompletion({
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
      messages: buildMessagesForProvider({ systemPrompt, history }),
    });

    const assistantMessage = completion?.choices?.[0]?.message?.content || "I could not generate a response.";

    // record structured response
    try {
      await insertResponse({
        conversationId: conversation.conversation_id,
        role: "assistant",
        content: assistantMessage,
        model: completion?.model || process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        tokenUsage: completion?.usage || {},
        status: "success",
        responsePayload: completion || {},
        provider: "openrouter",
      });
    } catch (err) {
      console.warn("Failed to insert AI response record:", err.message);
    }

    await touchConversation(conversation.conversation_id);

    return {
      conversationId: conversation.conversation_id,
      model: completion?.model || process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
      message: assistantMessage,
      usage: completion?.usage || {},
    };
  } catch (err) {
    // record failure response
    try {
      await insertResponse({
        conversationId: conversation.conversation_id,
        role: "assistant",
        content: null,
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        tokenUsage: {},
        status: "error",
        error: { message: err.message },
        responsePayload: {},
        provider: "openrouter",
      });
    } catch (e) {
      console.warn("Failed to insert AI error record:", e.message);
    }

    await touchConversation(conversation.conversation_id);
    throw err;
  }
};

const listUserConversations = async (user) => {
  if (!user?.id) return [];
  return listConversationsByUser(user.id, 25);
};

const getConversationMessages = async (conversationId) => {
  return listMessages(conversationId, 100);
};

const getDashboardHelp = async ({ user, pageName, actionName, contextSummary }) => {
  const userId = user?.id || null;
  const userRole = user?.userType || user?.role || "guest";

  const systemPrompt = buildDashboardHelpPrompt({
    userRole,
    userId,
    pageName,
    actionName,
    contextSummary,
  });

  const completion = await createChatCompletion({
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: JSON.stringify(
          {
            pageName: pageName || "unknown",
            actionName: actionName || "unknown",
            contextSummary: contextSummary || "none provided",
          },
          null,
          2,
        ),
      },
    ],
  });

  return {
    model: completion?.model || process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
    message: completion?.choices?.[0]?.message?.content || "I could not generate dashboard help.",
    usage: completion?.usage || {},
  };
};

module.exports = {
  sendMessage,
  listUserConversations,
  getConversationMessages,
  getDashboardHelp,
};
