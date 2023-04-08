import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export function Settings() {
    const { userId } = useParams();
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    useEffect(() => {
        fetchUserData();
    }, []);

    async function fetchUserData() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/users/${userId}`);
        const userData = await response.json();
        setUsername(userData.username);
        setFirstName(userData.first_name);
        setLastName(userData.last_name);
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
        if(response.ok) { // If response is within the range of 200-299 (successful request), then redirect user back to the dedicated page for their account
            window.location.href = `/users/${userId}`;
        } else {
            window.location.href = `/users/${userId}/edit`; // If user could not be updated, redirect user back to same page
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
        if(response.ok) { // If response is within the range of 200-299 (successful request), then redirect user back to the dedicated page for their account
            window.location.href = `/users/${userId}`;
        } else {
            window.location.href = `/users/${userId}/edit`; // If user could not be updated, redirect user back to same page
        }
    }

    // TODO: Finish form, handler, and delete user button
    return (
        <div>
            <span>Change User Settings</span>
            <form onSubmit={handleSettingsChange}>
                <label htmlFor="username">Enter username</label>
                <input id="username" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}></input>
                <label htmlFor="firstName">Enter first name</label>
                <input id="firstName" type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)}></input>
                <label htmlFor="lastName">Enter last name</label>
                <input id="lastName" type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)}></input>
                <button type="submit">Save</button>
            </form>
            <span>Change Password</span>
            <form onSubmit={handlePasswordChange}>
                <label htmlFor="oldPassword">Enter current password</label>
                <input id="oldPassword" type="password" placeholder="Current pasword" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}></input>
                <label htmlFor="newPassword">Enter new password</label>
                <input id="newPassword" type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}></input>
                <label htmlFor="confirmNewPassword">Confirm new password</label>
                <input id="confirmNewPassword" type="password" placeholder="Re-enter new password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}></input>
                <button type="submit">Save</button>
            </form>
        </div>
    );
}

/*
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export function EditPost() {
    const { postId } = useParams(); // Extract post ID from URL parameter
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [published, setPublished] = useState(false);

    useEffect(() => {
        fetchPostData();
    }, []); // Leave dependency array empty to only run the hook when the component mounts

    async function fetchPostData() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`);
        const postData = await response.json();
        setTitle(postData.title);
        setContent(postData.content);
        setPublished(postData.published);
    }

    async function handleSubmit(event) {
        event.preventDefault(); // Prevent page from refreshing on form submission
        const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ 
                title, 
                content,
                published,
            }),
        });
        if(response.ok) { // If response is within the range of 200-299 (successful request), then redirect user back to the dedicated page for the post
            window.location.href = `/posts/${postId}`;
        } else {
            window.location.href = `/posts/${postId}/edit`; // If blog post could not be updated, redirect user back to same page
        }
    }

    return (
        <div>
            <span>Edit Post</span>
            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Enter title</label>
                <input id="title" type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}></input>
                <label htmlFor="content">Enter text</label>
                <input id="content" type="text" placeholder="Text" value={content} onChange={(e) => setContent(e.target.value)}></input>
                <label htmlFor="published">Do you want to make the post public?</label>
                <input id="published" checked={published} type="checkbox" onChange={(e) => setPublished(e.target.checked)}></input>
                <button type="submit">Save</button>
            </form>
        </div>
    );
}
*/