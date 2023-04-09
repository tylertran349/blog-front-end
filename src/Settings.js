import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DeleteConfirmation } from "./DeleteConfirmation";

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

    useEffect(() => {
        fetchUserData();
    }, []);

    async function fetchUserData() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/users/${userId}`);
        const userData = await response.json();
        setUsername(userData.username);
        setFirstName(userData.first_name);
        setLastName(userData.last_name);
        setIsAdmin(userData.is_admin);
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
        window.location.href = `/users/${userId}/settings`;
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
        window.location.href = `/users/${userId}/settings`;
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
            window.location.href = "/logout";
        } else {
            window.location.href = `/users/${userId}/settings`; // If user could not be deleted, redirect user back to settings page
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
        window.location.href = `/users/${userId}/settings`;
    }

    return (
        <div>
            {showDeleteConfirmation && (<DeleteConfirmation type="account" onConfirm={deleteAccount} onCancel={() => setShowDeleteConfirmation(false)} />)}
            <form onSubmit={handleSettingsChange}>
                <span>Change User Settings</span>
                <label htmlFor="username">Enter username</label>
                <input id="username" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}></input>
                <label htmlFor="firstName">Enter first name</label>
                <input id="firstName" type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)}></input>
                <label htmlFor="lastName">Enter last name</label>
                <input id="lastName" type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)}></input>
                <button type="submit">Save</button>
            </form>
            <form onSubmit={handlePasswordChange}>
                <span>Change Password</span>
                <label htmlFor="oldPassword">Enter current password</label>
                <input id="oldPassword" type="password" placeholder="Current pasword" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}></input>
                <label htmlFor="newPassword">Enter new password</label>
                <input id="newPassword" type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}></input>
                <label htmlFor="confirmNewPassword">Confirm new password</label>
                <input id="confirmNewPassword" type="password" placeholder="Re-enter new password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}></input>
                <button type="submit">Save</button>
            </form>
            {isAdmin && (<span>You are already an admin.</span>)}
            {!isAdmin && (
                <form onSubmit={changeAdminStatus}>
                    <span>Become an Admin</span>
                    <label htmlFor="adminPasscode">Enter admin passcode</label>
                    <input id="adminPasscode" type="password" placeholder="Admin passcode" value={adminPasscode} onChange={(e) => setAdminPasscode(e.target.value)}></input>
                    <button type="submit">Submit passcode</button>
                </form>
            )}
            <button onClick={() => setShowDeleteConfirmation(true)}>Delete Account</button>
        </div>
    );
}