import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export function EditComment() {
    const { commentId } = useParams();
    const [content, setContent] = useState("");
    const [postId, setPostId] = useState(null);

    useEffect(() => {
        fetchCommentData();
    }, []); // Leave dependency array empty to only run the hook when the component mounts

    async function fetchCommentData() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/comments/${commentId}`);
        const commentData = await response.json();
        setContent(commentData.content);
        setPostId(commentData.post);
    }

    async function handleSubmit(event) {
        event.preventDefault(); // Prevent page from refreshing on form submission
        const response = await fetch(`https://blog-production-10b2.up.railway.app/comments/${commentId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ 
                content,
            }),
        });
        console.log(postId);
        if(response.ok) { // If response is within the range of 200-299 (successful request), then redirect user back to the page of the blog post that the comment was made on
            window.location.href = `/posts/${postId}`;
        } else {
            window.location.href = `/comments/${commentId}/edit`; // If comment could not be updated, redirect user back to same page
        }
    }

    return (
        <div>
            <span>Edit Comment</span>
            <form onSubmit={handleSubmit}>
                <label htmlFor="content">Enter text</label>
                <input id="content" type="text" placeholder="Text" value={content} onChange={(e) => setContent(e.target.value)}></input>
                <button type="submit">Save</button>
            </form>
        </div>
    )
}