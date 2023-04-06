import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";

export function Post() {
    const { postId } = useParams(); // Extract post ID from URL parameter
    const [post, setPost] = useState({}); // Store data of current blog post
    const [user, setUser] = useState({}); // Store user that made the current blog post
    const [comments, setComments] = useState([]); // Stores array of comment objects, each containing the comment's data
    const [commentUsers, setCommentUsers] = useState({}); // Stores key-value pairs of user IDs (key) and username (value) for every comment
    const [newComment, setNewComment] = useState("");
    const [numComments, setNumComments] = useState(0);

    useEffect(() => {
        async function fetchPost() {
            const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`);
            const post = await response.json();
            setPost(post);
        }
        fetchPost();
    }, [postId]);

    useEffect(() => {
        async function fetchUser() {
            const response = await fetch(`https://blog-production-10b2.up.railway.app/users/${post.user}`);
            const user = await response.json();
            setUser(user);
        }
    }, [post]);

    useEffect(() => {
        fetchComments();
    }, [postId, numComments]);

    useEffect(() => {
        fetchPostIsLikedBy();
    }, [])

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
        setNumComments(comments.length);
        setComments(comments); // Set the comments state to be the array of comment objects

        console.log(comments);
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
            event.target.reset(); // Reset form values after new comment gets submitted
            setNumComments(numComments + 1); // Increment numComments by 1 to force fetchComments() to run again
        }
    }

    async function fetchPostIsLikedBy() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`);
        const postData = await response.json();
    }

    async function likeButtonHandler() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`);
        const postData = await response.json();
        if(postData.liked_by.includes(getLoggedInUser())) { // If post is already liked by user
            let updatedLikedByList = postData.liked_by.filter(item => item !== getLoggedInUser());
            await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`, {
                method: "PUT",
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
            let updatedLikedByList = postData.liked_by.concat(getLoggedInUser());
            await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`, {
                method: "PUT",
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

    function getLoggedInUser() {
        const token = localStorage.getItem("token");
        if(!token) {
            return null;
        } 

        try {
            const decodedToken = jwt_decode(token);
            const user = decodedToken.user._id;
            return user;
        } catch(err) {
            console.error("Error decoding token: " + err);
            return null;
        }
    }

    async function deleteCommentHandler(event) {
        await fetch(`https://blog-production-10b2.up.railway.app/comments/${event.target.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
        });
        fetchComments();
    }

    // TODO: Fix delete comment button and its handler
    if(localStorage.getItem("token") !== null) { // User is logged in
        return (
            <div>
                <span>{post.title}</span>
                <span>{post.content}</span>
                <span>Posted by {user.username}</span>
                <button id="post-like-button" type="button" onClick={likeButtonHandler}>Like Post</button>
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
                        <span>Posted by {commentUsers[comment.user]} on {formatDate(comment.date)}</span>
                        {(comment.user === getLoggedInUser()) && (<button onClick={deleteCommentHandler} id={comment._id} type="button">Delete Comment</button>)}
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
                        <span>Posted by {commentUsers[comment.user]} on {formatDate(comment.date)}</span>
                    </div>
                    )
                })}
            </div>
        );
    }
}
