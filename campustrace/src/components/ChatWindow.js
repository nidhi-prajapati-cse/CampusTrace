import React, { useEffect, useState, useRef } from "react";
import { useChat } from "../context/ChatContext";
import "./chatwindow.css";
import { v4 as uuidv4 } from "uuid";
import defaultimg from '../assets/defaultprofile.jpg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const ChatWindow = ({ loggedInUserId }) => {
  const {
    socket,
    messages,
    setMessages,
    contacts,
    activeChatUser,
    setActiveChatUser,
    closeChat,
  } = useChat();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [zoomedUserImage, setZoomedUserImage] = useState(null);

  //  Filtered contacts excluding current user
  const filteredContacts = contacts.filter((user) => user._id !== loggedInUserId);


  useEffect(() => {
    if (!activeChatUser && filteredContacts.length > 0) {
      setActiveChatUser(filteredContacts[0]);
    }
  }, [filteredContacts, activeChatUser, setActiveChatUser]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Join room and fetch messages
  useEffect(() => {
    if (!socket || !activeChatUser || !loggedInUserId) return;

    const roomId = [loggedInUserId, activeChatUser._id].sort().join("_");
    setMessages([]);

    socket.emit("joinRoom", roomId);

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/messages/${roomId}`);
        const data = await res.json();
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [socket, activeChatUser?._id, loggedInUserId, setMessages]);

  // Listen for messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => {
        const isDuplicate = prev.some(
          (m) =>
            m._id === msg._id ||
            (m.senderId === msg.senderId &&
              m.message === msg.message &&
              m.roomId === msg.roomId)
        );
        return isDuplicate ? prev : [...prev, msg];
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, setMessages]);

  // Send message
  const sendMessage = () => {
    if (!input.trim() || !activeChatUser || !socket) return;

    const newMsg = {
      _id: uuidv4(),
      senderId: loggedInUserId,
      receiverId: activeChatUser._id,
      message: input.trim(),
      roomId: [loggedInUserId, activeChatUser._id].sort().join("_"),
    };

    socket.emit("sendMessage", newMsg);
    setInput("");
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <span>Chat</span>
        <span className="chat-close" onClick={closeChat}>❌</span>
      </div>

      <div className="chat-body">
        {/* Left Panel - Contact List */}
        <div className="chat-left-panel">
          {filteredContacts.length === 0 ? (
            <p className="empty-msg">No chats yet</p>
          ) : (
            filteredContacts.map((user) => {
              const isActive = activeChatUser?._id === user._id;
              const profileImage = user.image
                ? `http://localhost:5000${user.image}`
                : defaultimg;

              return (
                <div
                  key={user._id}
                  className={`chat-user ${isActive ? "active" : ""}`}
                  onClick={() => setActiveChatUser(user)}
                >
                  <img
                    src={profileImage}
                    alt="User"
                    className="chat-user-avatar"
                    onError={(e) => (e.target.src = defaultimg)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomedUserImage(profileImage);
                    }}
                  />
                  <span className="chat-user-name">{user.name}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Right Panel - Chat Area */}
        <div className="chat-right-panel">
          {activeChatUser ? (
            <>
              <div className="messages-list">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.senderId === loggedInUserId ? "sent" : "received"}`}
                  >
                    {msg.message}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div className="no-chat">Select a user to start chatting</div>
          )}
        </div>
      </div>

      {/* Zoomed Image Overlay */}
      {zoomedUserImage && (
        <div className="zoom-overlay" onClick={() => setZoomedUserImage(null)}>
          <div className="zoom-container" onClick={(e) => e.stopPropagation()}>
            <img
              src={zoomedUserImage}
              alt="Zoomed Profile"
              className="zoomed-image"
              onError={(e) => { e.target.src = defaultimg; }}
            />
            <span className="close-zoom" onClick={() => setZoomedUserImage(null)}>
              <FontAwesomeIcon icon={faTimes} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
