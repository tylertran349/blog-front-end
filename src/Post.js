import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { ErrorPopup } from "./ErrorPopup";
import { NavBar } from "./NavBar";

export function Post() {
    const { postId } = useParams(); // Extract post ID from URL parameter
    const [post, setPost] = useState({}); // Store data of current blog post
    const [user, setUser] = useState({}); // Store user that made the current blog post
    const [comments, setComments] = useState([]); // Stores array of comment objects, each containing the comment's data
    const [commentUsers, setCommentUsers] = useState({}); // Stores key-value pairs of user IDs (key) and username (value) for every comment
    const [newComment, setNewComment] = useState("");
    const [showDeletePostConfirmation, setShowDeletePostConfirmation] = useState(false);
    const [showDeleteCommentConfirmation, setShowDeleteCommentConfirmation] = useState(false);
    const [commentToBeDeleted, setCommentToBeDeleted] = useState("");
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchPost();
    }, []);

    useEffect(() => {
        if(post.user) {
            fetchUser();
        }
    }, [post]);

    useEffect(() => {
        fetchComments();
    }, []);

    async function fetchUser() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/users/${post.user}`);
        if(response.ok) {
            const user = await response.json();
            setUser(user);
            setShowErrorPopup(false);
        } else {
            const result = await response.json();
            setErrorMessage(result.error);
            setShowErrorPopup(true);
        }
    }

    async function fetchPost() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`);
        if(response.ok) {
            const post = await response.json();
            setPost(post);
            setShowErrorPopup(false);
        } else {
            const result = await response.json();
            setErrorMessage(result.error);
            setShowErrorPopup(true);
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const hours = date.getHours() % 12;
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const period = date.getHours() >= 12 ? "PM" : "AM";
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} at ${hours}:${minutes} ${period}`;
        return formattedDate;
    }

    async function fetchComments() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}/comments?$expand=user`); // Fetch list of comments for the post
        if(response.ok) {
            const commentIds = await response.json();
            const commentRequests = commentIds.map(commentId => fetch(`https://blog-production-10b2.up.railway.app/comments/${commentId}`)); // Create an array of HTTP requests to fetch comment data for each comment using its ID
            const commentResponses = await Promise.all(commentRequests); // Store an array of all the responses from the HTTP requests to fetch comment data for each comment
            const comments = await Promise.all(commentResponses.map(response => response.json())); // Store an array of comment objects
            setComments(comments); // Set the comments state to be the array of comment objects
            setShowErrorPopup(false);
        } else {
            const result = await response.json();
            setErrorMessage(result.error);
            setShowErrorPopup(true);
        }

        // Fetch usernames for all comments
        const userIds = comments.map(comment => comment.user); // Create an array of all the user IDs for the entire list of comments
        const userRequests = userIds.map(userId => fetch(`https://blog-production-10b2.up.railway.app/users/${userId}`)); // For each user ID, create an array of HTTP requests to fetch user data for each user using their ID
        const userResponses = await Promise.all(userRequests); // Store an array of all the user API call responses
        const users = await Promise.all(userResponses.map(response => response.json())); // Store an array of user objects
        const userMap = {}; // Create a JavaScript object that maps user IDs to usernames
        users.forEach(user => userMap[user._id] = user.username); // For each user object in the users array, create a new map entry that maps the user ID to its corresponding username
        setCommentUsers(userMap);
    }

    async function handleCommentSubmit(event) {
        event.preventDefault(); // Prevents page from refreshing after new comment gets submitted
        const response = await fetch("https://blog-production-10b2.up.railway.app/comments/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ 
                content: newComment,
                post: postId,
            }),
        });
        if(response.ok) {
            setNewComment(""); // Set newComment to blank string in order to reset text input after form submission
            fetchComments();
            setShowErrorPopup(false);
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

    async function likeButtonHandler() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`);
        if(response.ok) {
            const postData = await response.json();
            setShowErrorPopup(false);
            if(postData.liked_by.includes(getLoggedInUser()._id)) { // If post is already liked by user
                let updatedLikedByList = postData.liked_by.filter(item => item !== getLoggedInUser()._id);
                const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ 
                        liked_by: updatedLikedByList,
                    }),
                });
                if(response.ok) {
                    document.querySelector('#post-like-button').style.fontVariationSettings = `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48`;
                    setShowErrorPopup(false);
                    fetchPost();
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
            } else { // If post is not already liked by user
                let updatedLikedByList = postData.liked_by.concat(getLoggedInUser()._id);
                const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ 
                        liked_by: updatedLikedByList,
                    }),
                });
                if(response.ok) {
                    document.querySelector('#post-like-button').style.fontVariationSettings = `'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48`;
                    setShowErrorPopup(false);
                    fetchPost();
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
        } else {
            const result = await response.json();
            setErrorMessage(result.error);
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

    function deleteCommentHandler(event) {
        setCommentToBeDeleted(event.target.id);
        setShowDeleteCommentConfirmation(true);
    }

    async function deleteComment(commentId) {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/comments/${commentId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
        });
        if(response.ok) {
            fetchComments();
            setShowDeleteCommentConfirmation(false);
            setCommentToBeDeleted("");
            setShowErrorPopup(false);
        } else {
            const result = await response.json();
            setErrorMessage(result.error);
            setShowErrorPopup(true);
        }
    }

    async function likeCommentHandler(event) {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/comments/${event.target.id}`);
        const commentData = await response.json();
        if(response.ok) {
            setShowErrorPopup(false);
            if(commentData.liked_by.includes(getLoggedInUser()._id)) { // If post is already liked by user
                let updatedLikedByList = commentData.liked_by.filter(item => item !== getLoggedInUser()._id);
                const response = await fetch(`https://blog-production-10b2.up.railway.app/comments/${event.target.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ 
                        liked_by: updatedLikedByList,
                    }),
                });
                if(response.ok) {
                    event.target.textContent = "Like Comment";
                    setShowErrorPopup(false);
                    fetchComments();
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
            } else {
                let updatedLikedByList = commentData.liked_by.concat(getLoggedInUser()._id);
                const response = await fetch(`https://blog-production-10b2.up.railway.app/comments/${event.target.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ 
                        content: commentData.content,
                        liked_by: updatedLikedByList,
                    }),
                });
                if(response.ok) {
                    event.target.textContent = "Comment Liked";
                    setShowErrorPopup(false);
                    fetchComments();
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
        } else {
            const result = await response.json();
            setErrorMessage(result.error);
            setShowErrorPopup(true);
        }
    }

    async function deletePost(event) {
        console.log(post._id);
        const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${post._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
        });
        setShowDeletePostConfirmation(false);
        setShowErrorPopup(false);
        window.location.href = "/"; // Redirect user back to home page after they delete the post
    }

    if(localStorage.getItem("token") !== null) { // User is logged in
        console.log(post.liked_by);
        return (
            <div id="content">
                {showErrorPopup && (<ErrorPopup message={errorMessage} />)}
                <NavBar loggedInUserId={getLoggedInUser() ? getLoggedInUser()._id : null} />
                {showDeletePostConfirmation && (<DeleteConfirmation type="post" onConfirm={deletePost} onCancel={() => setShowDeletePostConfirmation(false)} />)}
                {showDeleteCommentConfirmation && (<DeleteConfirmation type="comment" onConfirm={() => deleteComment(commentToBeDeleted)} onCancel={() => setShowDeleteCommentConfirmation(false)} />)}
                <div id="post">
                    <span id="title">{post.title}</span>
                    <span>{post.content}</span>
                    <span>Posted by <a href={`/users/${user._id}`} id="user-link">{user.username}</a>  on {formatDate(post.date)}</span>
                    <div id="post-like-counter">
                        <button id="post-like-button" type="button" onClick={() => likeButtonHandler()} className="material-symbols-outlined">thumb_up</button>
                        {!post.liked_by ? (<span>0</span>) : (<span>{post.liked_by.length}</span>)}
                    </div>
                    <div id="modify-post-actions">
                        {(post.user === getLoggedInUser()._id || getLoggedInUser().is_admin === true) && (<button onClick={() => {window.location.href=`/posts/${postId}/edit`}} className="material-symbols-outlined" id="edit-post-button">edit</button>)}
                        {(post.user === getLoggedInUser()._id || getLoggedInUser().is_admin === true) && (<button id="delete-post-button" type="button" onClick={() => setShowDeletePostConfirmation(true)} className="material-symbols-outlined">delete</button>)}
                    </div>
                    <span id="title">Comments</span>
                    <form onSubmit={handleCommentSubmit} id="comment-form">
                        <input id="comment-input" type="textarea" placeholder="Add a comment" value={newComment} onChange={(e) => setNewComment(e.target.value)}></input>
                        <button type="submit">Send Comment</button>
                    </form>
                    <div>
                        {comments.length === 0 && (<span>There are no comments.</span>)}
                    </div>
                    {comments.map((comment) => {
                        return (
                        <div>
                            {comment && (<span>{comment.content}</span>)}
                            <span>Posted by <a href={`/users/${comment.user}`} id="user-link">{commentUsers[comment.user]}</a> on {formatDate(comment.date)}</span>
                            {(comment.user === getLoggedInUser()._id || getLoggedInUser().is_admin === true) && (<button onClick={() => {window.location.href=`/comments/${comment._id}/edit`}}>Edit Comment</button>)}
                            {(comment.user === getLoggedInUser()._id || getLoggedInUser().is_admin === true) && (<button onClick={deleteCommentHandler} id={comment._id} type="button">Delete Comment</button>)}
                            <button type="button" onClick={likeCommentHandler} id={comment._id} className="material-symbols-outlined">thumb_up</button>
                        </div>
                        )
                    })}
                </div>
            </div>
        );
    } else { // User is not logged in
        return (
            <div id="content">
                <NavBar loggedInUserId={getLoggedInUser() ? getLoggedInUser()._id : null} />
                {showErrorPopup && (<ErrorPopup message={errorMessage} onClick={(e) => setShowErrorPopup(false)} />)}
                <div id="post">
                    <span id="title">{post.title}</span>
                    <span>{post.content}</span>
                    <span>Posted by <a href={`/users/${user._id}`} id="user-link">{user.username}</a> on {formatDate(post.date)}</span>
                    <div id="post-like-counter">
                        <span className="material-symbols-outlined">thumb_up</span>
                        
                    </div>
                    <span id="title">Comments</span>
                    <span><a href="/login">Login</a> to comment.</span>
                    <div>
                        {comments.length === 0 && (<span>There are no comments.</span>)}
                    </div>
                    {comments.map((comment) => {
                        return (
                        <div>
                            <span>{comment.content}</span>
                            <span>Posted by <a href={`/users/${comment.user}`} id="user-link">{commentUsers[comment.user]}</a> on {formatDate(comment.date)}</span>
                        </div>
                        )
                    })}
                </div>
            </div>
        );
    }
}
