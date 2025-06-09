import React, { useState, useEffect, useRef } from "react";

import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Send } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { ScrollArea,ScrollBar } from "@/components/ui/scroll-area";
import { useSocket } from "@/context/SocketContext";
import axios from "axios";
import { set } from "date-fns";
import { promise } from "zod";

const ChatWindow = ({ partner }) => {
  const { authState } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const scrollAreaRef = useRef(null);
  const { socket, messages, setMessages } = useSocket();
  const [conversationMessages, setConversationMessages] = useState([]);



  useEffect(() => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        scrollAreaRef.current.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: "smooth", // for smooth animation
        });
      }, 100);
    }
  }, [conversationMessages]);
  

  const getMessagesBetweenUsers = async (senderId, receiverId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/chat/messages`,
        {
          params: {
            senderId,
            receiverId,
          },
        }
      );

      return response.data[0].messages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const responseMessages = await getMessagesBetweenUsers(
          authState.user?._id,
          partner._id
        );
        setMessages(responseMessages);
        setConversationMessages(responseMessages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [partner]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    setConversationMessages((prevMessages) => [
      ...prevMessages,
      {
        senderId: authState.user?._id,
        text: messageInput,
        timestamp: new Date().toISOString(),
      },
    ]);

    socket.emit("send_message", {
      senderId: authState.user?._id,
      receiverId: partner._id,
      text: messageInput,
      timestamp: new Date().toISOString(),
    });

    messages.push({
      senderId: authState.user?._id,
      text: messageInput,
      timestamp: new Date().toISOString(),
    });
    setMessageInput("");
  };

  socket.on("receive_message", (data) => {
    setConversationMessages((prevMessages) => [...prevMessages, data]);
  });

  return (
    <Card className="flex flex-col h-full border-0 shadow-none">
      <CardHeader className="bg-teal-50 rounded-t-xl p-4 border-b">
        <CardTitle className="text-xl font-medium text-teal-800">
          Chat with {partner.fullname}
        </CardTitle>
      </CardHeader>

      {/* <CardContent className="flex-grow h-[500px] overflow-scroll p-4 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          {conversationMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <p className="text-center">No messages yet.</p>
              <p className="text-center">
                Send a message to start the conversation.
              </p>
            </div>
          ) : (
            <div className="space-y-4 bg-red-500">
              {conversationMessages.map((message) => (
                <ChatMessage
                  key={message.timestamp}
                  message={message}
                  partnerName={partner.fullname}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent> */}

      <CardContent className="flex-grow h-[500px] overflow-hidden p-4">
        <ScrollArea className="h-full pr-4">
          <div ref={scrollAreaRef} className="h-full overflow-y-auto pr-4">
            {conversationMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <p className="text-center">No messages yet.</p>
                <p className="text-center">
                  Send a message to start the conversation.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversationMessages.map((message) => (
                  <ChatMessage
                    key={message.timestamp}
                    message={message}
                    partnerName={partner.fullname}
                  />
                ))}
              </div>
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow input-focus-effect"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-teal-500 hover:bg-teal-600 text-white"
            disabled={!messageInput.trim()}
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatWindow;
