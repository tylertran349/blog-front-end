import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { DeleteConfirmation } from "./DeleteConfirmation";

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

    useEffect(() => {
        fetchPost();
    }, [postId]);

    useEffect(() => {
        fetchUser();
    }, [user]);

    async function fetchUser() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/users/${post.user}`);
        const user = await response.json();
        setUser(user);
    }

    useEffect(() => {
        fetchComments();
    }, [postId]);

    async function fetchPost() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`);
        const post = await response.json();
        setPost(post);
    }

    function formatDate(dateString) {
        const date = new Date(dateString); // Create new date object out of input date string
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} at ${date.getHours() % 12}:${date.getMinutes()} ${date.getHours() >= 12 ? "PM" : "AM"}`; // Format the date and store it in formattedDate
        return formattedDate;
    }

    async function fetchComments() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}/comments?$expand=user`); // Fetch list of comments for the post
        const commentIds = await response.json();
        const commentRequests = commentIds.map(commentId => fetch(`https://blog-production-10b2.up.railway.app/comments/${commentId}`)); // Create an array of HTTP requests to fetch comment data for each comment using its ID
        const commentResponses = await Promise.all(commentRequests); // Store an array of all the responses from the HTTP requests to fetch comment data for each comment
        const comments = await Promise.all(commentResponses.map(response => response.json())); // Store an array of comment objects
        setComments(comments); // Set the comments state to be the array of comment objects

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
        }
    }

    // TODO: Fix post's like button causing post's title and content to be blank after being clicked on
    async function likeButtonHandler() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`);
        const postData = await response.json();
        if(postData.liked_by.includes(getLoggedInUser()._id)) { // If post is already liked by user
            let updatedLikedByList = postData.liked_by.filter(item => item !== getLoggedInUser()._id);
            await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ 
                    liked_by: updatedLikedByList,
                }),
            });
            document.querySelector('#post-like-button').textContent = "Like Post";
        } else {
            let updatedLikedByList = postData.liked_by.concat(getLoggedInUser()._id);
            await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ 
                    liked_by: updatedLikedByList,
                }),
            });
            document.querySelector('#post-like-button').textContent = "Liked";
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
            console.error("Error decoding token: " + err);
            return null;
        }
    }

    function deleteCommentHandler(event) {
        setCommentToBeDeleted(event.target.id);
        setShowDeleteCommentConfirmation(true);
    }

    async function deleteComment(commentId) {
        await fetch(`https://blog-production-10b2.up.railway.app/comments/${commentId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
        });
        fetchComments();
        setShowDeleteCommentConfirmation(false);
        setCommentToBeDeleted("");
    }

    async function likeCommentHandler(event) {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/comments/${event.target.id}`);
        const commentData = await response.json();
        if(commentData.liked_by.includes(getLoggedInUser()._id)) { // If post is already liked by user
            let updatedLikedByList = commentData.liked_by.filter(item => item !== getLoggedInUser()._id);
            await fetch(`https://blog-production-10b2.up.railway.app/comments/${event.target.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ 
                    liked_by: updatedLikedByList,
                }),
            });
            event.target.textContent = "Like Comment";
        } else {
            let updatedLikedByList = commentData.liked_by.concat(getLoggedInUser()._id);
            await fetch(`https://blog-production-10b2.up.railway.app/comments/${event.target.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ 
                    liked_by: updatedLikedByList,
                }),
            });
            event.target.textContent = "Comment Liked";
        }
    }

    async function deletePost(event) {
        await fetch(`https://blog-production-10b2.up.railway.app/posts/${post._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
        });
        setShowDeletePostConfirmation(false);
        window.location.href = "/"; // Redirect user back to home page after they delete the post
    }

    if(localStorage.getItem("token") !== null) { // User is logged in
        return (
            <div>
                {showDeletePostConfirmation && (<DeleteConfirmation type="post" onConfirm={deletePost} onCancel={() => setShowDeletePostConfirmation(false)} />)}
                {showDeleteCommentConfirmation && (<DeleteConfirmation type="comment" onConfirm={() => deleteComment(commentToBeDeleted)} onCancel={() => setShowDeleteCommentConfirmation(false)} />)}
                <span>{post.title}</span>
                <span>{post.content}</span>
                <span>Posted by <a href={`/users/${user._id}`}>{user.username}</a></span>
                {(post.user === getLoggedInUser()._id || getLoggedInUser().is_admin === true) && (<button onClick={() => {window.location.href=`/posts/${postId}/edit`}}>Edit Post</button>)}
                <button id="post-like-button" type="button" onClick={() => setShowDeletePostConfirmation(true)}>Delete Post</button>
                <span>Comments</span>
                <form onSubmit={handleCommentSubmit}>
                    <input id="comment-form" type="text" placeholder="Add a comment" value={newComment} onChange={(e) => setNewComment(e.target.value)}></input>
                    <button type="submit">Send Comment</button>
                </form>
                <div>
                    {comments.length === 0 && (<span>There are no comments.</span>)}
                </div>
                {comments.map((comment) => {
                    return (
                    <div>
                        {comment && (<span>{comment.content}</span>)}
                        <span>Posted by <a href={`/users/${comment.user}`}>{commentUsers[comment.user]}</a> on {formatDate(comment.date)}</span>
                        {(comment.user === getLoggedInUser()._id || getLoggedInUser().is_admin === true) && (<button onClick={() => {window.location.href=`/comments/${comment._id}/edit`}}>Edit Comment</button>)}
                        {(comment.user === getLoggedInUser()._id || getLoggedInUser().is_admin === true) && (<button onClick={deleteCommentHandler} id={comment._id} type="button">Delete Comment</button>)}
                        <button type="button" onClick={likeCommentHandler} id={comment._id}>Like Comment</button>
                    </div>
                    )
                })}
            </div>
        );
    } else { // User is not logged in
        return (
            <div>
                <span>{post.title}</span>
                <span>{post.content}</span>
                <span>Posted by {user.username}</span>
                <span>Comments</span>
                <span><a href="/login">Login</a> to comment.</span>
                <div>
                    {comments.length === 0 && (<span>There are no comments.</span>)}
                </div>
                {comments.map((comment) => {
                    return (
                    <div>
                        <span>{comment.content}</span>
                        <span>Posted by <a href={`/users/${comment.user}`}>{commentUsers[comment.user]}</a> on {formatDate(comment.date)}</span>
                    </div>
                    )
                })}
            </div>
        );
    }
}
