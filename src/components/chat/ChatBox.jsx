import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useUser } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import { Send, User } from "lucide-react";
import { Button, Input } from "antd";
import useSupabaseClient from "@/backend/supabase/supabase";
import { useTheme } from "@/context/ThemeContext";

const ChatBox = ({ propertyId, sellerId, propertyTitle }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { user } = useUser();
  const supabase = useSupabaseClient();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [activeChannel, setActiveChannel] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to real-time broadcast channel
  useEffect(() => {
    if (!supabase || !propertyId || !user) return;

    // Use a unique room name for the property
    const channelName = `room:${propertyId}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true }, // receive own broadcast messages
      },
    });

    channel
      .on("broadcast", { event: "message" }, (response) => {
        const newMessage = response.payload;
        setMessages((prev) => [...prev, newMessage]);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to real-time chat room: ${channelName}`);
        }
      });

    setActiveChannel(channel);

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, propertyId, user]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChannel || !user) return;

    const messagePayload = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: user.id,
      senderName: user.fullName || user.username || "Anonymous User",
      senderAvatar: user.imageUrl,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      // Dispatch payload across Supabase realtime websockets
      await activeChannel.send({
        type: "broadcast",
        event: "message",
        payload: messagePayload,
      });
      setInputText("");
    } catch (err) {
      console.error("Failed to send message over channel:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div
      className={`flex flex-col h-[450px] w-full rounded-2xl border shadow-lg overflow-hidden transition-all duration-300 ${
        isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-800"
      }`}
    >
      {/* Chat Box Header */}
      <div className="bg-violet-700 text-white p-4 flex items-center justify-between shadow-sm">
        <div>
          <h3 className="font-bold text-sm truncate max-w-[250px]">
            {propertyTitle || "Property Inquiry"}
          </h3>
          <p className="text-xs text-violet-200">
            {user.id === sellerId ? "Client Discussion Room" : "Contact Host/Seller"}
          </p>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" title="Connected Live" />
      </div>

      {/* Message Stream area */}
      <div
        className={`flex-1 p-4 overflow-y-auto space-y-4 ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-6">
            <User size={36} className="mb-2 opacity-50" />
            <p className="text-xs">No live messages. Type below to initiate a live conversation.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.senderId === user.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  isSelf ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* User Avatar */}
                {msg.senderAvatar ? (
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-300"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                    {msg.senderName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Bubble Container */}
                <div>
                  <div className={`text-[10px] mb-0.5 text-gray-400 ${isSelf ? "text-right" : ""}`}>
                    {msg.senderName}
                  </div>
                  <div
                    className={`p-3 rounded-2xl shadow-sm text-sm break-all ${
                      isSelf
                        ? "bg-violet-600 text-white rounded-tr-none"
                        : isDarkMode
                        ? "bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700"
                        : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className={`text-[9px] mt-0.5 text-gray-400 ${isSelf ? "text-right" : ""}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input controls */}
      <div
        className={`p-3 flex gap-2 border-t items-center ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <Input
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`flex-1 border-none focus:ring-0 ${
            isDarkMode ? "bg-gray-800 text-white placeholder-gray-500" : "bg-white text-gray-800"
          }`}
        />
        <Button
          type="primary"
          icon={<Send size={16} />}
          onClick={handleSendMessage}
          className="bg-violet-700 hover:bg-violet-600 border-none flex items-center justify-center rounded-xl h-10 w-10 shadow-md"
        />
      </div>
    </div>
  );
};

ChatBox.propTypes = {
  propertyId: PropTypes.string.isRequired,
  sellerId: PropTypes.string.isRequired,
  propertyTitle: PropTypes.string,
};

export default ChatBox;
