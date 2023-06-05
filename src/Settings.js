import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { ErrorPopup } from "./ErrorPopup";
import jwt_decode from "jwt-decode";
import { NavBar } from "./NavBar";

export function Settings() {
    const { userId } = useParams();
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [adminPasscode, setAdminPasscode] = useState("");
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchUserData();
    }, []);

    async function fetchUserData() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/users/${userId}`);
        if(response.ok) {
            const userData = await response.json();
            setUsername(userData.username);
            setFirstName(userData.first_name);
            setLastName(userData.last_name);
            setIsAdmin(userData.is_admin);
            setShowErrorPopup(false);
        } else {
            const result = await response.json();
            setErrorMessage(result.error);
            setShowErrorPopup(true);
        }
    }

    async function handleSettingsChange(event) {
        event.preventDefault(); // Prevent page from refreshing on form submission
        const response = await fetch(`https://blog-production-10b2.up.railway.app/users/${userId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ 
                username,
                first_name: firstName,
                last_name: lastName, 
            }),
        });
        if(response.ok) {
            setShowErrorPopup(false);
            window.location.href = `/users/${userId}/settings`;
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

    async function handlePasswordChange(event) {
        event.preventDefault();
        const response = await fetch(`https://blog-production-10b2.up.railway.app/users/${userId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ 
                old_password: oldPassword,
                password: newPassword,
                confirm_password: confirmNewPassword,
            }),
        });
        if(response.ok) {
            setShowErrorPopup(false);
            console.log("Success")
            window.location.href = `/users/${userId}/settings`;
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

    async function deleteAccount() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/users/${userId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
        });
        if(response.ok) { // If account was successfully deleted, logout the user by redirecting them to logout page
            setShowErrorPopup(false);
            window.location.href = "/logout";
        } else {
            const result = await response.json();
            setErrorMessage(result.error);
            setShowErrorPopup(true);
        }
        setShowDeleteConfirmation(false);
    }

    async function changeAdminStatus(event) {
        event.preventDefault();
        const response = await fetch(`https://blog-production-10b2.up.railway.app/users/${userId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ 
                admin_passcode: adminPasscode,
            }),
        });
        if(response.ok) {
            setShowErrorPopup(false);
            window.location.href = "/logout"; // Log out user once they become admin so that they are forced to log in again, creating a new updated JWT with the correct admin status
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
        <div id="content">
            <NavBar loggedInUserId={getLoggedInUser() ? getLoggedInUser()._id : null} />
            {showErrorPopup && (<ErrorPopup message={errorMessage} onClick={(e) => setShowErrorPopup(false)} />)}
            {showDeleteConfirmation && (<DeleteConfirmation type="account" onConfirm={deleteAccount} onCancel={() => setShowDeleteConfirmation(false)} />)}
            <div id="form-container">
                <span id="form-title">Change User Settings</span>
                <form id="edit-settings-form" onSubmit={handleSettingsChange}>
                    <div id="label-input-pair">
                        <label htmlFor="username">Enter username</label>
                        <input id="username" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}></input>
                    </div>
                    <div id="label-input-pair">
                        <label htmlFor="firstName">Enter first name</label>
                        <input id="firstName" type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)}></input>
                    </div>
                    <div id="label-input-pair">
                        <label htmlFor="lastName">Enter last name</label>
                        <input id="lastName" type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)}></input>
                    </div>
                    <button type="submit">Save</button>
                </form>
            </div>
            <div id="form-container">
                <span id="form-title">Change Password</span>
                <form id="edit-settings-form" onSubmit={handlePasswordChange}>
                    <div id="label-input-pair">
                        <label htmlFor="oldPassword">Enter current password</label>
                        <input id="oldPassword" type="password" placeholder="Current pasword" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}></input>
                    </div>
                    <div id="label-input-pair">
                        <label htmlFor="newPassword">Enter new password</label>
                        <input id="newPassword" type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}></input>
                    </div>
                    <div id="label-input-pair">
                        <label htmlFor="confirmNewPassword">Confirm new password</label>
                        <input id="confirmNewPassword" type="password" placeholder="Re-enter new password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}></input>
                    </div>
                    <button type="submit">Save</button>
                </form>
            </div>
            <div id="form-container">
                <span id="form-title">Become an Admin</span>
                {isAdmin && (<span>You are already an admin.</span>)}
                {!isAdmin && (
                    <form id="edit-settings-form" onSubmit={changeAdminStatus}>
                        <div id="label-input-pair">
                            <label htmlFor="adminPasscode">Enter admin passcode</label>
                            <input id="adminPasscode" type="password" placeholder="Admin passcode" value={adminPasscode} onChange={(e) => setAdminPasscode(e.target.value)}></input>
                        </div>
                        <button type="submit">Submit passcode</button>
                    </form>
                )}
            </div>
            <button id="warning-button" onClick={() => setShowDeleteConfirmation(true)}>Delete account</button>
        </div>
    );
}