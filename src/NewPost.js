import React, { useState } from "react";
import { ErrorPopup } from "./ErrorPopup";

export function NewPost() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [published, setPublished] = useState(true);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    
    async function handleSubmit(event) {
        event.preventDefault(); // Prevent default form submission behavior
        const response = await fetch("https://blog-production-10b2.up.railway.app/posts", {
            method: "POST",
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
        if(response.ok) { // If response is within the range of 200-299 (successful request), then new blog post was successfully created and redirect to home page
            setShowErrorPopup(false);
            window.location.href = "/";
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

    return (
        <div>
            {showErrorPopup && (<ErrorPopup message={errorMessage} />)}
            <span>Create a New Post</span>
            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Enter title</label>
                <input id="title" type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}></input>
                <label htmlFor="content">Enter text</label>
                <input id="content" type="text" placeholder="Text" value={content} onChange={(e) => setContent(e.target.value)}></input>
                <label htmlFor="published">Do you want to make the post public?</label>
                <input id="published" checked={published} type="checkbox" onChange={(e) => setPublished(e.target.checked)}></input>
                <button type="submit">Create New Post</button>
            </form>
        </div>
    );
}