import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export function Post() {
    const { postId } = useParams(); // Extract post ID from URL parameter
    const [post, setPost] = useState({}); // Store data of current blog post
    const [user, setUser] = useState({}); // Store user that made the current blog post
    const [comments, setComments] = useState([]); // Stores array of comment objects, each containing the comment's data
    const [commentUsers, setCommentUsers] = useState({}); // Stores key-value pairs of user IDs (key) and username (value)
    const [newComment, setNewComment] = useState("");
    const [numComments, setNumComments] = useState(0);
    const [postIsLiked, setPostIsLiked] = useState(false);

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
        if (post.user) {
            fetchUser();
        }
    }, [post]);

    useEffect(() => {
        async function fetchComments() {
            const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}/comments?$expand=user`); // Fetch list of comments for the post
            const commentIds = await response.json();
            const commentRequests = commentIds.map(commentId => fetch(`https://blog-production-10b2.up.railway.app/comments/${commentId}`)); // Create an array of HTTP requests to fetch comment data for each comment using its ID
            const commentResponses = await Promise.all(commentRequests); // Store an array of all the responses from the HTTP requests to fetch comment data for each comment
            const comments = await Promise.all(commentResponses.map(response => response.json())); // Store an array of comment objects
            setNumComments(comments.length);
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
        fetchComments();
    }, [postId, numComments]);

    function formatDate(dateString) {
        const date = new Date(dateString); // Create new date object out of input date string
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} at ${date.getHours() % 12}:${date.getMinutes()} ${date.getHours() >= 12 ? "PM" : "AM"}`; // Format the date and store it in formattedDate
        return formattedDate;
    }

    async function handleCommentSubmit(event) {
        event.preventDefault(); // Prevents page from refreshing after new comment gets submitted
        const response = await fetch("https://blog-production-10b2.up.railway.app/comments", {
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

    async function likeButtonHandler(event) {

    }

    if(localStorage.getItem("token") !== null) { // User is logged in
        return (
            <div>
                <span>{post.title}</span>
                <span>{post.content}</span>
                <span>Posted by {user.username}</span>
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
                        <span>{comment.content}</span>
                        <span>Posted by {commentUsers[comment.user]} on {formatDate(comment.date)}</span>
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
