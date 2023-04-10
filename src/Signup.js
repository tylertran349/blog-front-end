import React, { useState } from "react";
import { ErrorPopup } from "./ErrorPopup";
import jwt_decode from "jwt-decode";
import { NavBar } from "./NavBar";

export function Signup() {
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        const response = await fetch("https://blog-production-10b2.up.railway.app/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                username, 
                first_name: firstName,
                last_name: lastName, 
                password,
                confirm_password: confirmPassword,
            }),
        });
        if(response.ok) { // If response is within the range of 200-299 (successful request), then sign up was successful so redirect user to login page
            window.location.href = "/login";
        } else {
            const result = await response.json();
            let errorText = "";
            if(result.errors) {
                for(let i = 0; i < result.errors.length; i++) {
                    errorText += (result.errors[i].msg + " "); // If API responds with an array of messages, concatenate each array element to errorText
                }
            } else {
                errorText = result.error;
            }
            setErrorMessage(errorText);
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
        <div>
            {showErrorPopup && (<ErrorPopup message={errorMessage} />)}
            <NavBar loggedInUserId={getLoggedInUser() ? getLoggedInUser()._id : null} />
            <span>Sign Up</span>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Enter username</label>
                <input id="username" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}></input>
                <label htmlFor="first-name">Enter first name</label>
                <input id="first-name" type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)}></input>
                <label htmlFor="last-name">Enter last name</label>
                <input id="last-name" type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)}></input>
                <label htmlFor="password">Enter password</label>
                <input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}></input>
                <label htmlFor="confirm-password">Confirm password</label>
                <input id="confirm-password" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}></input>
                <button type="submit">Sign Up</button>
                <span>Have an account? <a href="/login">Login</a></span>
            </form>
        </div>
    );
}