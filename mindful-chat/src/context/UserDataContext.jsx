import React, { createContext, useState } from "react";
export const UserDataContext = createContext();
const UserContext = ({ children }) => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    specialization: "",
    fullname: "",
  });

  /** 
* Paste one or more documents here
*/
// {
//   username: "vikas@12",
//   email: "vikashjoshi187@gmail.com",
//   password: "$2b$10$XTLZ4J3jRpaq4GADoONiUOeYKYiiaC/XzN0Aq0xb1dwS1trgUpZfi",
//   role: "doctor",
//   specialization: "Psychiatrist",

// }
  const value = {
    user,
    setUser,
  };
  return (
    <div>
      <UserDataContext.Provider value={value}>
        {children}
      </UserDataContext.Provider>
    </div>
  );
};

export default UserContext;
