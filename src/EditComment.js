import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorPopup } from "./ErrorPopup";

export function EditComment() {
    const { commentId } = useParams();
    const [content, setContent] = useState("");
    const [postId, setPostId] = useState(null);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchCommentData();
    }, []); // Leave dependency array empty to only run the hook when the component mounts

    async function fetchCommentData() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/comments/${commentId}`);
        if(response.ok) {
            const commentData = await response.json();
            setContent(commentData.content);
            setPostId(commentData.post);
            setShowErrorPopup(false);
        } else {
            const result = await response.json();
            setErrorMessage(result.error);
            setShowErrorPopup(true);
        }
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

    return (
        <div>
            {showErrorPopup && (<ErrorPopup message={errorMessage} />)}
            <span>Edit Comment</span>
            <form onSubmit={handleSubmit}>
                <label htmlFor="content">Enter text</label>
                <input id="content" type="text" placeholder="Text" value={content} onChange={(e) => setContent(e.target.value)}></input>
                <button type="submit">Save</button>
            </form>
        </div>
    )
}