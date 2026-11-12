
import { useState } from "react";
import { Send, Bot, UserRound } from "lucide-react";
import { sendMessage } from "../services/api";

function CustomerChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! Welcome to ResolveAI. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();

    setMessages((previous) => [
      ...previous,
      { role: "user", text: userMessage },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await sendMessage(userMessage);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: response.reply,
          status: response.status,
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-bot-icon">
          <Bot size={22} />
        </div>

        <div>
          <h2>ResolveAI Assistant</h2>
          <p>AI-powered customer support</p>
        </div>

        <span className="online-indicator">Online</span>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.role}`}
          >
            <div className="chat-message-icon">
              {message.role === "assistant" ? (
                <Bot size={17} />
              ) : (
                <UserRound size={17} />
              )}
            </div>

            <div className="chat-bubble">
              <p>{message.text}</p>

              {message.status === "escalated" && (
                <span className="escalation-label">
                  Human support requested
                </span>
              )}
            </div>
          </div>
        ))}

        {loading && <p className="typing-indicator">AI is typing...</p>}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSend();
          }}
        />

        <button onClick={handleSend} disabled={loading || !input.trim()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default CustomerChat;
