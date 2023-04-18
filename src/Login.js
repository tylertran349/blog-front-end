import React, { useState } from "react";
import { ErrorPopup } from "./ErrorPopup";
import jwt_decode from "jwt-decode";
import { NavBar } from "./NavBar";

export function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        const response = await fetch("https://blog-production-10b2.up.railway.app/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });
        if(response.ok) { // If response is within the range of 200-299 (successful request), then login was successful - res.json() has a default status code of 200
            const data = await response.json();
            localStorage.setItem('token', data.token); // Stores key-value pair in local storage (token = key, data.token = JSON web token received from API response)
            window.location.href = "/";
            setShowErrorPopup(false);
        } else {
            const result = await response.json();
            setErrorMessage(result.error);
            setShowErrorPopup(true);
        }
    }

    // Returns user object of currently logged in user
    function getLoggedInUser() {
        const token = localStorage.getItem("token");
        if(!token) {
            return null;
        } 
        try {
            const decodedToken = jwt_decode(token);
            return decodedToken.user;
        } catch(err) {
            setErrorMessage("Error decoding token: " + err);
            setShowErrorPopup(true);
            return null;
        }
    }

    return (
        <div id="content">
            <NavBar loggedInUserId={getLoggedInUser() ? getLoggedInUser()._id : null} />
            {showErrorPopup && (<ErrorPopup message={errorMessage} onClick={(e) => setShowErrorPopup(false)} />)}
            <div id="login-form-container">
                <span id="form-title">Login</span>
                {(getLoggedInUser()) && (<span>You are already logged in.</span>)}
                {(!getLoggedInUser()) && (<form id="login-form" onSubmit={handleSubmit}>
                    <div id="label-input-pair">
                        <label htmlFor="username">Enter username</label>
                        <input id="username" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}></input>
                    </div>
                    <div id="label-input-pair">
                        <label htmlFor="password">Enter password</label>
                        <input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}></input>
                    </div>
                    <button type="submit">Sign In</button>
                    {(!getLoggedInUser()) && (<span>Don't have an account? <a href="/sign-up" id="sign-up-link">Sign Up</a></span>)}
                </form>)}
            </div>
        </div>
    );
}