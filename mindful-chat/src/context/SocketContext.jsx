import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { io } from "socket.io-client";
import axios from "axios";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { authState } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);

  useEffect(() => {
    async function fetchDoctors() {
      const token = localStorage.getItem("token"); // ✅ Add this

      if (authState.isAuthenticated && authState.user) {
        if (authState.user?.role === "patient") {
          const userData = localStorage.getItem("user");

          try {
            const response = await axios.get(
              `${import.meta.env.VITE_BASE_URL}/users/doctors-list`,
              {
                params: JSON.parse(userData),
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            setAvailableDoctors(response.data.doctors || []);
          } catch (error) {
            console.error("Failed to fetch doctors:", error);
          }
        }
      }
    }

    fetchDoctors();
  }, [authState.isAuthenticated, authState.user]);

  const socket = io("http://127.0.0.1:4001"); // Initialize socket here

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to socket server", socket.id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from socket server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = (eventName, data) => {
    socket.emit(eventName, data);
  };

  const reciveMessage = (eventName, callback) => {
    socket.on(eventName, callback);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        messages,
        availableDoctors,
        sendMessage,
        setMessages,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
