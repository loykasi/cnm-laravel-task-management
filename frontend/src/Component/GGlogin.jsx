import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function App() {
    const navigate = useNavigate();
    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const response = await axios.post(
                "http://localhost:8000/api/auth/google", // Laravel API endpoint
                { token: credentialResponse.credential }, // Token từ Google
                { headers: { "Content-Type": "application/json" } }
            );

            console.log("Login Success:", response.data);
            // Lưu token trả về từ backend nếu cần
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user_email', response.data.email);
            navigate("/home");

        } catch (error) {
            console.error("Login Error:", error.response?.data || error.message);
        }
    };
    return (
        <GoogleOAuthProvider clientId="828271513963-kj25tt51gmkp0iehboh10ougfm7d143q.apps.googleusercontent.com">
            <div>
                <h1>Login with Google</h1>
                <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => {
                        console.log("Google Login Failed");
                    }}
                />
            </div>
        </GoogleOAuthProvider>
    );
}

export default App;
