/* eslint-disable no-useless-catch */
import { createContext, useState, useContext } from "react";
import axios from "axios";
import servers from "../enviroment";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${servers}/api/v1/users`
});

export const AuthProvider = ({ children }) => {
  const authContext = useContext(AuthContext);

  const [userData, setUserData] = useState(authContext);

  
  const handleRegister = async (name, username, password) => {
    // eslint-disable-next-line no-useless-catch
    try {
      let request = await client.post("/register", {
        name,
        username,
        password
      });

      if (request.status === 201) {
        return request.data.message;
      }
    } catch (err) {
      throw err;
    }
  };
const handleLogin = async (username, password) => {
  try {
    const response = await client.post("/login", {
      username,
      password
    });

    if (response.status === 200) {
      localStorage.setItem("token", response.data.token);
      return response.data; // optional,  user data ya message 
    } else {
      throw new Error("Login failed");
    }
  } catch (err) {
    console.error("Login error:", err);
    throw err; // propagate error
  }
};

const getHistoryOfUser = async () =>{
  try{
    let request = await client.get("/get_all_activity", {
      params:{
        token: localStorage.getItem("token")
      }
    });
    return request.data
  }catch(err){
throw err;
  }
}

const addtoUserHistory = async (meetingCode)=>{
try{
  let request = await client.post("/add_to_activity",{
    token: localStorage.getItem("token"),
    meeting_code: meetingCode
  });
  return request;
}catch(err){
  throw err;
}
}

  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    addtoUserHistory,
    getHistoryOfUser
  };

  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  );
};
