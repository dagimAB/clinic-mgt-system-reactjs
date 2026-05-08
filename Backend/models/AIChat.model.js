const dbhelper = require("../configs/dbhelper");

const createConversationsTableQuery = `
  CREATE TABLE IF NOT EXISTS ai_conversations (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(80) UNIQUE NOT NULL,
    user_id VARCHAR(80),
    user_role VARCHAR(50),
    title VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const createMessagesTableQuery = `
  CREATE TABLE IF NOT EXISTS ai_messages (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(80) NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    model VARCHAR(120),
    -- type indicates whether this row is a request/request_message/response
    message_type VARCHAR(30) DEFAULT 'message',
    -- status of the response (success, error, failed, partial)
    status VARCHAR(30),
    -- any error details if status indicates an error
    error JSONB DEFAULT NULL,
    -- raw request and response payloads for richer debugging
    request_payload JSONB DEFAULT '{}'::jsonb,
    response_payload JSONB DEFAULT '{}'::jsonb,
    provider VARCHAR(120),
    response_time_ms INTEGER,
    token_usage JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_conversation
      FOREIGN KEY (conversation_id)
      REFERENCES ai_conversations(conversation_id)
      ON DELETE CASCADE
  );
`;

const createMessagesIndexQuery = `
  CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_created
  ON ai_messages(conversation_id, created_at DESC);
`;

const initialize = async () => {
  try {
    await dbhelper.query(createConversationsTableQuery);
    await dbhelper.query(createMessagesTableQuery);
    await dbhelper.query(createMessagesIndexQuery);
    // Add missing columns for existing installations (safe migrations)
    const alterQueries = [
      `ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(30) DEFAULT 'message';`,
      `ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS status VARCHAR(30);`,
      `ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS error JSONB DEFAULT NULL;`,
      `ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS request_payload JSONB DEFAULT '{}'::jsonb;`,
      `ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS response_payload JSONB DEFAULT '{}'::jsonb;`,
      `ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS provider VARCHAR(120);`,
      `ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS response_time_ms INTEGER;`
    ];
    for (const q of alterQueries) {
      await dbhelper.query(q);
    }
    console.log("AI chat tables initialized successfully");
  } catch (error) {
    console.error("Failed to initialize AI chat tables:", error.message);
    throw error;
  }
};

const createConversation = async ({ conversationId, userId, userRole, title, metadata }) => {
  const sql = `
    INSERT INTO ai_conversations (conversation_id, user_id, user_role, title, metadata)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const rows = await dbhelper.query(sql, [
    conversationId,
    userId || null,
    userRole || null,
    title || null,
    metadata ? JSON.stringify(metadata) : JSON.stringify({}),
  ]);
  return rows[0];
};

const touchConversation = async (conversationId) => {
  const sql = `
    UPDATE ai_conversations
    SET updated_at = CURRENT_TIMESTAMP
    WHERE conversation_id = $1;
  `;
  await dbhelper.query(sql, [conversationId]);
};

const getConversationById = async (conversationId) => {
  const sql = `
    SELECT * FROM ai_conversations
    WHERE conversation_id = $1
    LIMIT 1;
  `;
  const rows = await dbhelper.query(sql, [conversationId]);
  return rows[0] || null;
};

const listConversationsByUser = async (userId, limit = 20) => {
  const sql = `
    SELECT conversation_id, user_role, title, metadata, created_at, updated_at
    FROM ai_conversations
    WHERE user_id = $1
    ORDER BY updated_at DESC
    LIMIT $2;
  `;
  return dbhelper.query(sql, [userId, limit]);
};

const insertMessage = async ({ conversationId, role, content, model, tokenUsage }) => {
  const sql = `
    INSERT INTO ai_messages (conversation_id, role, content, model, token_usage)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const rows = await dbhelper.query(sql, [
    conversationId,
    role,
    content,
    model || null,
    tokenUsage ? JSON.stringify(tokenUsage) : JSON.stringify({}),
  ]);
  return rows[0];
};

const listMessages = async (conversationId, limit = 40) => {
  const sql = `
    SELECT role, content, model, token_usage, status, message_type, request_payload, response_payload, provider, response_time_ms, created_at
    FROM ai_messages
    WHERE conversation_id = $1
    ORDER BY created_at ASC
    LIMIT $2;
  `;
  return dbhelper.query(sql, [conversationId, limit]);
};

// Insert a request (from the user / caller) with optional request payload
const insertRequest = async ({ conversationId, role = 'user', content, model, provider, requestPayload }) => {
  const sql = `
    INSERT INTO ai_messages (conversation_id, role, content, model, provider, message_type, request_payload)
    VALUES ($1, $2, $3, $4, $5, 'request', $6)
    RETURNING *;
  `;
  const rows = await dbhelper.query(sql, [
    conversationId,
    role,
    content,
    model || null,
    provider || null,
    requestPayload ? JSON.stringify(requestPayload) : JSON.stringify({}),
  ]);
  return rows[0];
};

// Insert a response (from the AI) with status, any error details, token usage and payload
const insertResponse = async ({ conversationId, role = 'assistant', content, model, tokenUsage, status, error, responsePayload, responseTimeMs, provider }) => {
  const sql = `
    INSERT INTO ai_messages (conversation_id, role, content, model, token_usage, status, error, response_payload, response_time_ms, provider, message_type)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'response')
    RETURNING *;
  `;
  const rows = await dbhelper.query(sql, [
    conversationId,
    role,
    content,
    model || null,
    tokenUsage ? JSON.stringify(tokenUsage) : JSON.stringify({}),
    status || null,
    error ? JSON.stringify(error) : null,
    responsePayload ? JSON.stringify(responsePayload) : JSON.stringify({}),
    responseTimeMs || null,
    provider || null,
  ]);
  return rows[0];
};

// Convenience helper to record a request + response together (best-effort, no DB transaction)
const recordExchange = async ({ conversationId, userId, userRole, title, request, response }) => {
  if (!conversationId) throw new Error('conversationId is required');
  const conv = await getConversationById(conversationId);
  if (!conv) {
    await createConversation({ conversationId, userId, userRole, title });
  } else {
    await touchConversation(conversationId);
  }

  const reqRow = await insertRequest({
    conversationId,
    role: request.role || 'user',
    content: request.content || null,
    model: request.model || null,
    provider: request.provider || null,
    requestPayload: request.payload || {},
  });

  const resRow = await insertResponse({
    conversationId,
    role: response.role || 'assistant',
    content: response.content || null,
    model: response.model || null,
    tokenUsage: response.tokenUsage || {},
    status: response.status || null,
    error: response.error || null,
    responsePayload: response.payload || {},
    responseTimeMs: response.responseTimeMs || null,
    provider: response.provider || null,
  });

  return { request: reqRow, response: resRow };
};

module.exports = {
  initialize,
  createConversation,
  getConversationById,
  listConversationsByUser,
  insertMessage,
  listMessages,
  touchConversation,
  insertRequest,
  insertResponse,
  recordExchange,
};
