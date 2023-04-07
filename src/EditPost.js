import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export function EditPost() {
    const { postId } = useParams(); // Extract post ID from URL parameter
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [published, setPublished] = useState(false);

    useEffect(() => {
        fetchPostData();
    }, []) // Leave dependency array empty to only run the hook when the component mounts

    async function fetchPostData() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`);
        console.log(response);
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
    )
}