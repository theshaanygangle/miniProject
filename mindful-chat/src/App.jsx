import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext.jsx";
import { TooltipProvider } from "@/components/ui/tooltip";
import Auth from "./pages/Auth";
import PatientQuiz from "./pages/PatientQuiz";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import UserProtectedWrapper from "./pages/UserProtectedWrapper";
import UserContext from "./context/UserDataContext";

const queryClient = new QueryClient();

const App = () => (
  // <QueryClientProvider client={queryClient}>
    <UserContext>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            {/* Move TooltipProvider here inside the React component tree */}
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/patient-quiz"
                  element={
                    <UserProtectedWrapper>
                      <PatientQuiz />
                    </UserProtectedWrapper>
                  }
                />
                <Route
                  path="/patient-dashboard"
                  element={
                    <UserProtectedWrapper>
                      <PatientDashboard />
                    </UserProtectedWrapper>
                  }
                />
                <Route
                  path="/doctor-dashboard"
                  element={
                    <UserProtectedWrapper>
                      <DoctorDashboard />
                    </UserProtectedWrapper>
                  }
                />
                <Route
                  path="*"
                  element={
                    <UserProtectedWrapper>
                      <NotFound />
                    </UserProtectedWrapper>
                  }
                />
              </Routes>
            </TooltipProvider>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </UserContext>
  // </QueryClientProvider>
);

export default App;
