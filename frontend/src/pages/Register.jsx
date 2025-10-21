import React from "react";
import { useState , useEffect} from "react";
import api from "../services/api.js";

const Register = () =>{
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        try{
            const response = await api.post("/register",{
                username: username,
                email: email,
                password: password
            });
            console.log("Registration successful:", response.data);
            alert("Registration successful! Please log in.");
        }catch(error){
            console.error("Registration failed:", error.response.data);
        }
        
    }
    return(
        <div>
            <h1> Registration page</h1>
            <form>
                <input type="text" placeholder="username" onChange={(e)=> setUsername(e.target.value)} />
                <input type="email" placeholder="email" onChange={(e)=> setEmail(e.target.value)} />
                <input type="password" placeholder="password" onChange={e => setPassword(e.target.value)} />
                <button onClick={handleRegister}>Register</button>
            </form>
        </div>
    )
}

export default Register;
