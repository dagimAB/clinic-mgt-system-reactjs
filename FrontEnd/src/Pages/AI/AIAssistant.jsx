import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Dashboard/Main-Dashboard/GlobalFiles/Sidebar";
import {
  sendChatMessage,
  getConversations,
  getConversationMessages,
} from "../../services/aiChatApi";
import "./AIAssistant.css";

const welcomeTips = [
  "Ask for role-specific help (doctor, nurse, admin, patient)",
  "Summarize a patient workflow from registration to certificate",
  "Get guidance for queue, appointments, reports, or lab operations",
];

const AIAssistant = () => {
  const navigate = useNavigate();
  const {
    data: { token, user },
  } = useSelector((state) => state.auth);

  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");

  const userRoleLabel = useMemo(() => {
    return (user?.userType || user?.role || "Guest").toString();
  }, [user]);

  const refreshConversations = async () => {
    try {
      const rows = await getConversations(token);
      setConversations(rows || []);
    } catch (e) {
      // Conversation list is optional for guests.
    }
  };

  useEffect(() => {
    refreshConversations();
  }, []);

  const loadConversation = async (id) => {
    if (!id) return;
    try {
      setLoadingHistory(true);
      setError("");
      const rows = await getConversationMessages(id, token);
      setConversationId(id);
      setMessages((rows || []).map((m) => ({ role: m.role, content: m.content })));
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load conversation");
    } finally {
      setLoadingHistory(false);
    }
  };

  const onSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const optimisticUserMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, optimisticUserMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await sendChatMessage({
        message: trimmed,
        conversationId,
        token,
      });

      if (!conversationId && response?.conversationId) {
        setConversationId(response.conversationId);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response?.message || "No response received." },
      ]);

      refreshConversations();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to get AI response");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I could not process that right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(e);
    }
  };

  const startNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setError("");
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="AfterSideBar ai-shell">
        <div className="ai-header">
          <div>
            <h1>AI Assistant</h1>
            <p>
              Role-aware guidance for SHMS workflows. Current role: <strong>{userRoleLabel}</strong>
            </p>
          </div>
          <div className="ai-header-actions">
            <button className="ai-secondary-btn" onClick={() => navigate("/dashboard")}>
              Back Dashboard
            </button>
            <button className="ai-primary-btn" onClick={startNewChat}>
              New Chat
            </button>
          </div>
        </div>

        <div className="ai-content-grid">
          <aside className="ai-sidebar">
            <h3>Recent Conversations</h3>
            <div className="ai-conversation-list">
              {conversations.length === 0 ? (
                <p className="ai-muted">No saved conversations yet.</p>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.conversation_id}
                    className={`ai-conv-item ${conversationId === conv.conversation_id ? "active" : ""}`}
                    onClick={() => loadConversation(conv.conversation_id)}
                  >
                    <span>{conv.title || "Untitled"}</span>
                    <small>{new Date(conv.updated_at).toLocaleString()}</small>
                  </button>
                ))
              )}
            </div>

            <div className="ai-tips">
              <h4>Try Asking</h4>
              <ul>
                {welcomeTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          </aside>

          <section className="ai-chat-panel">
            <div className="ai-message-list">
              {loadingHistory ? <p className="ai-muted">Loading conversation...</p> : null}

              {!loadingHistory && messages.length === 0 ? (
                <div className="ai-empty-state">
                  <h2>Start a conversation</h2>
                  <p>
                    Ask anything about appointments, queue management, reports, certificates, labs, or role-based workflows.
                  </p>
                </div>
              ) : null}

              {messages.map((m, idx) => (
                <div key={`${m.role}-${idx}`} className={`ai-message ${m.role}`}>
                  <div className="ai-message-role">{m.role === "assistant" ? "AI" : "You"}</div>
                  <div className="ai-message-content">{m.content}</div>
                </div>
              ))}

              {loading ? (
                <div className="ai-message assistant">
                  <div className="ai-message-role">AI</div>
                  <div className="ai-message-content">Thinking...</div>
                </div>
              ) : null}
            </div>

            <form className="ai-input-row" onSubmit={onSend}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Ask SHMS AI Assistant..."
                rows={3}
              />
              <button type="submit" className="ai-primary-btn" disabled={loading}>
                Send
              </button>
            </form>
            {error ? <p className="ai-error">{error}</p> : null}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
