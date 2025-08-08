import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faMessage } from "@fortawesome/free-solid-svg-icons";
import { useChat } from "../context/ChatContext";
import ChatWindow from "./ChatWindow";
import { useAuth } from "../context/AuthContext";
import "./chatfloatingbutton.css";

const ChatFloatingButton = () => {
  const { isChatOpen, openChatWindow, contacts, setActiveChatUser } = useChat();
  const { user } = useAuth();
  if (!user) return null; 

  const handleOpenChat = () => {
    openChatWindow(user._id);
    if (contacts.length > 0) {
      setActiveChatUser(contacts[contacts.length - 1]);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button className="chat-floating-button" onClick={handleOpenChat}>
          <FontAwesomeIcon icon={faMessage} />
        </button>
      )}

      {/* Chat Window */}
      {isChatOpen && <ChatWindow loggedInUserId={user._id} />}
    </>
  );
};

export default ChatFloatingButton;
