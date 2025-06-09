import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { UserDataContext } from "../context/UserDataContext.jsx";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const { user, setUser } = useContext(UserDataContext);

  const [authState, setAuthState] = useState({
    user: user ? user : null,
    token: localStorage.getItem("token"),
    isAuthenticated: localStorage.getItem("token") ? true : false,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));


        return;
      }

      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        if (userData && userData.id) {
          setAuthState({
            user: userData,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Authentication failed. Please log in again.",
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const userData = {
        email,
        password,
      };
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/login`,
        userData
      );
      let data;
      if (response.status == 200) {
        data = response.data;
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      toast({
        title: "Login successful",
        description: `Welcome back,! ${data.user.fullname}`,
      });
    } catch (error) {
      console.error("Login failed:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Invalid email or password. Please try again.",
      }));

      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
      });
    }
  };

  const signup = async (
    username,
    email,
    password,
    role,
    fullname,
    specialization
  ) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        {
          username,
          email,
          password,
          role,
          fullname,
          specialization,
        }
      );
      let data;
      if (response.status == 201) {
        data = response.data;

        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      toast({
        title: "Signup successful",
        description: `Welcome, ${data.user.fullname}!`,
      });
    } catch (error) {
      console.error("Signup failed:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Signup failed. Please try again with different credentials.",
      }));

      toast({
        variant: "destructive",
        title: "Signup failed",
        description: "Please try again with different credentials.",
      });
    }
  };

  const logout = async () => {
    const token = localStorage.getItem("token");
    const response = await axios
      .get(`${import.meta.env.VITE_BASE_URL}/users/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          toast({
            title: "Logged out",
            description: "You have been successfully logged out.",
          });
        }
      });
    return response;
  };

  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{ authState, login, signup, logout, clearError, setAuthState }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
