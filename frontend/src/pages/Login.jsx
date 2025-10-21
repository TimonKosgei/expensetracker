import React,{useState}from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

const Login = () => {   
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) =>{
        e.preventDefault();
        try{
            const response = await api.post("/login",{
                email: email,
                password: password
            });
            
            alert("Login successful!");
            // backend returns { access_token: <token> }
            if (response?.data?.access_token) {
                console.log("Received access token:", response.data.access_token);
                localStorage.setItem("token", response.data.access_token);
            } else {
                // unexpected response shape — log it for debugging
                console.warn('Login response missing access_token:', response.data);
            }
            navigate("/dashboard");
        }catch(error){
            console.error("Login failed:", error.response.data);
            alert("Login failed. Please check your credentials.");
        }
    }
    return (
        <div>
            <h1>Login Page</h1>
            <form>
                <input type="email" placeholder="email" onChange={(e)=> setEmail(e.target.value)} />
                <input type="password" placeholder="password" onChange={e => setPassword(e.target.value)} />
                <button onClick={handleLogin}>Login</button>
            </form>
        </div>
    );
}   


export default Login;   