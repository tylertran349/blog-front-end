import React from "react";

export function Logout() {
    localStorage.removeItem("token"); // Remove JWT from LocalStorage
    window.location.href = "/"; // Redirect user back to home page after log out is successful

    return (
        <div id="content">
            <span>Logging out...</span>
        </div>
    );
}