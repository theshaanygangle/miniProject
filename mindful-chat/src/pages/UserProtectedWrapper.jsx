import React, { useContext, useEffect } from "react";
import { UserDataContext } from "../context/UserDataContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

const UserProtectedWrapper = ({ children }) => {
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserDataContext);

  useEffect(() => {
    if (!token) {
      
      navigate("/auth");
    }
    // axios
    //   .get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //   })
    //   .then((response) => {
    //     if (response.status === 200) {
    //       setUser(response.data.user);
    //       setIsLoading(false);
    //     }
    //   });
  }, [token]);

  if (isLoading) {
    return <>Loading</>;
  }
  return <>{children}</>;
};

export default UserProtectedWrapper;
