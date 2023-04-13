import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorPopup } from "./ErrorPopup";
import jwt_decode from "jwt-decode";
import { NavBar } from "./NavBar";

export function EditPost() {
    const { postId } = useParams(); // Extract post ID from URL parameter
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [published, setPublished] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchPostData();
    }, []); // Leave dependency array empty to only run the hook when the component mounts

    async function fetchPostData() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`);
        if(response.ok) {
            const postData = await response.json();
            setTitle(postData.title);
            setContent(postData.content);
            setPublished(postData.published);
        } else {
            const result = await response.json();
            setErrorMessage(result.error);
            setShowErrorPopup(true);
        }
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
            setShowErrorPopup(false);
            window.location.href = `/posts/${postId}`;
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
            <span>Edit Post</span>
            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Enter title</label>
                <input id="title" type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if(e.key === "Enter") { e.preventDefault() }}}></input>
                <label htmlFor="content">Enter text</label>
                <input id="content" type="textarea" placeholder="Text" value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={(e) => { if(e.key === "Enter") { e.preventDefault() }}}></input>
                <label htmlFor="published">Do you want to make the post public?</label>
                <input id="published" checked={published} type="checkbox" onChange={(e) => setPublished(e.target.checked)} onKeyDown={(e) => { if(e.key === "Enter") { e.preventDefault() }}}></input>
                <button type="submit">Save</button>
            </form>
        </div>
    );
}