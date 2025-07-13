import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User, MessageSquare } from "lucide-react";
import ChatWindow from "@/components/chat/ChatWindow";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";

const DoctorDashboard = () => {
  const { authState, logout } = useAuth();
  const { socket } = useSocket();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const navigate = useNavigate();
  const doctor = JSON.parse(localStorage.getItem("user"));

  // 🔒 Redirect if not authenticated or not a doctor
  useEffect(() => {
    if (!authState.isLoading) {
      if (!authState.isAuthenticated) {
        navigate("/auth");
      } else if (authState.user?.role !== "doctor") {
        navigate("/patient-quiz");
      }
    }
  }, [authState.isAuthenticated, authState.isLoading, authState.user?.role, navigate]);

  // 📥 Fetch chat partners initially
  const fetchChatPartners = async (userId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/chat/chat-partners/${userId}`
      );
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching chat partners:", error);
    }
  };

  useEffect(() => {
    if (authState.user?._id) {
      fetchChatPartners(authState.user._id);
    }
  }, [authState.user]);

  // ✅ Emit join to socket
  useEffect(() => {
    if (socket && doctor?._id) {
      socket.emit("join", { userId: doctor._id, userType: doctor.role });
    }
  }, [socket, doctor]);

  // ✅ Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      console.log("Doctor received:", data);

      // If new sender not in patient list, add them
      setPatients((prev) => {
        const exists = prev.some((p) => p._id === data.senderId);
        if (!exists) {
          return [...prev, { _id: data.senderId, fullname: "New Patient" }];
        }
        return prev;
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket]);

  // 🔁 Handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // 👆 Handle selecting a patient
  const handleSelectPatient = (selected) => {
    setSelectedPatient(selected);
  };

  // 📋 Render patient list
  const renderPatientList = (patientList) => {
    if (patientList.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No patients in this category</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {patientList.map((patient) => (
          <Button
            key={patient._id}
            variant="ghost"
            className={`w-full justify-start p-3 h-auto ${
              selectedPatient?.id === patient._id ? "bg-blue-50" : ""
            }`}
            onClick={() => handleSelectPatient(patient)}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="bg-blue-100 rounded-full p-2">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium">
                  {patient.fullname || "Unnamed Patient"}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    );
  };

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-teal-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-teal-600">
            MindfulChat Connect
          </h1>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="bg-teal-100 rounded-full p-2 mr-2">
                <User className="h-5 w-5 text-teal-600" />
              </div>
              <span className="font-medium">{authState.user?.name}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center"
            >
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-grow container mx-auto p-4 flex flex-col md:flex-row md:space-x-4">
        {/* Patient Sidebar */}
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <h2 className="text-lg font-medium mb-4">Patient Messages</h2>

          <Tabs defaultValue="all">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="urgent" className="flex-1">
                Urgent
              </TabsTrigger>
              <TabsTrigger value="new" className="flex-1">
                New
              </TabsTrigger>
            </TabsList>

            <div className="bg-white p-4 rounded-lg mt-2">
              <TabsContent value="all">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  {renderPatientList(patients)}
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Chat Area */}
        <Separator orientation="vertical" className="hidden md:block" />

        <div className="w-full md:w-2/3">
          {selectedPatient ? (
            <ChatWindow partner={selectedPatient} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="mx-auto h-12 w-12 mb-2" />
                <h2 className="text-xl font-medium mb-2">
                  Select a patient to view their conversation
                </h2>
                <p>
                  Choose from the list on the left to view and respond to
                  patient messages.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t p-4 text-center text-gray-500 text-sm">
        <p>
          &copy; {new Date().getFullYear()} MindfulChat Connect. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default DoctorDashboard;
