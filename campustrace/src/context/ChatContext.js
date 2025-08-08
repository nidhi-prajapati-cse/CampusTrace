import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const newSocket = io("https://campustrace-backend.onrender.com");
    setSocket(newSocket);

    newSocket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      const loggedInUserId = localStorage.getItem("userId");
      if (msg.senderId === loggedInUserId) {

        return;
      }
      setContacts((prevContacts) => {
        let updatedContacts = [...prevContacts];
        const index = updatedContacts.findIndex((c) => c._id === msg.senderId);

        if (index !== -1) {
          const contact = updatedContacts[index];
          updatedContacts.splice(index, 1);
          updatedContacts.unshift({ ...contact, lastMessageTime: Date.now() });
        } else {
          updatedContacts.unshift({
            _id: msg.senderId,
            name: "Unknown",
            image: "",
            loading: true,
            lastMessageTime: Date.now(),
          });

          fetch(`https://campustrace-backend.onrender.com/api/users/${msg.senderId}`)
            .then((res) => res.json())
            .then((userData) => {
              setContacts((prev) =>
                prev.map((c) =>
                  c._id === msg.senderId
                    ? { ...c, ...userData, loading: false }
                    : c
                )
              );
            })
            .catch((err) => {
              console.error("Error fetching user:", err);
            });
        }

        return updatedContacts;
      });
    });

    return () => newSocket.disconnect();
  }, []);


  const openChatWindow = async (loggedInUserId) => {
    setIsChatOpen(true);

    try {
      const res = await fetch(
        `https://campustrace-backend.onrender.com/api/messages/contacts/${loggedInUserId}`
      );
      const data = await res.json();

      let contactsArray = [];

      if (Array.isArray(data)) {
        contactsArray = data;
      } else if (Array.isArray(data.contacts)) {
        contactsArray = data.contacts;
      }

      const sorted = contactsArray.sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );

      const userIds = sorted.map((c) => c._id).join(",");

      let enrichedContacts = [];

      if (userIds.length > 0) {
        const userDetailsRes = await fetch(
          `https://campustrace-backend.onrender.com/api/users/bulk?ids=${userIds}`
        );
        const userDetailsData = await userDetailsRes.json();

        enrichedContacts = sorted.map((contact) => {
          const userInfo = userDetailsData.userDetails.find(
            (u) => u._id === contact._id
          );
          return {
            ...contact,
            name: userInfo?.name || contact.name || "Unknown",
            image: userInfo?.image || "",
          };
        });
      }

      // Include self user if not already in list
      const selfIndex = enrichedContacts.findIndex(
        (c) => c._id === loggedInUserId
      );
      if (selfIndex === -1) {
        const selfRes = await fetch(
          `https://campustrace-backend.onrender.com/api/users/${loggedInUserId}`
        );
        const selfUser = await selfRes.json();
        enrichedContacts.unshift({
          _id: loggedInUserId,
          name: selfUser.name,
          image: selfUser.image,
        });
      }

      setContacts(enrichedContacts);

      if (enrichedContacts.length > 0 && !activeChatUser) {
        setActiveChatUser(enrichedContacts[0]);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    }
  };


  const openChatWithUser = (user) => {
    if (!user || !user._id) return;
    setIsChatOpen(true);
    setActiveChatUser(user);

    setContacts((prev) => {
      const exists = prev.find((c) => c._id === user._id);
      if (exists) return prev;
      return [user, ...prev];
    });
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setActiveChatUser(null);
  };

  return (
    <ChatContext.Provider
      value={{
        socket,
        messages,
        setMessages,
        isChatOpen,
        activeChatUser,
        setActiveChatUser,
        contacts,
        setContacts,
        openChatWithUser,
        openChatWindow,
        closeChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
