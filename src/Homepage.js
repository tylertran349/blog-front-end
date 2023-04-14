import React, { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import { ErrorPopup } from "./ErrorPopup";
import { NavBar } from "./NavBar";

export function Homepage() {
    const [posts, setPosts] = useState([]); // An array that stores every post
    const [usernames, setUsernames] = useState({}); // A JavaScript object that stores key-value pairs of user IDs (key) and their associated usernames (value)
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchPosts(); // Get posts by making API call
    }, []); // Empty dependency array means this hook only runs one time when the component mounts (is inserted in the DOM tree)

    useEffect(() => {
        fetchUsernames();
    }, [posts]); // This hook will run anytime the "posts" dependency changes

    async function fetchUsernames() {
        const userIds = posts.map(post => post.user); // Create an array named userIds with all the user IDs from each post object in the posts array
        const usernameMap = {}; // JavaScript object (similar to hashmap) - userId is key, user.username is value
        for(const userId of userIds) {
            const response = await fetch(`https://blog-production-10b2.up.railway.app/users/${userId}`); // For each userId in the userIds array, fetch the user from the API
            const user = await response.json();
            if(!response.ok) {
                setErrorMessage(user.error);
                setShowErrorPopup(true);
            } else {
                setShowErrorPopup(false);
            }
            usernameMap[userId] = user.username; // Add new key-value pair to usernameMap object
        }
        setUsernames(usernameMap); // Update usernames state with updated usernameMap object
    }

    async function fetchPosts() {
        const response = await fetch("https://blog-production-10b2.up.railway.app/posts");
        const data = await response.json();
        if(!response.ok) {
            setErrorMessage(data.error);
            setShowErrorPopup(true);
        } else {
            setShowErrorPopup(false);
        }
        setPosts(data);
    }

    async function fetchPosts() {
        const response = await fetch("https://blog-production-10b2.up.railway.app/posts");
        const data = await response.json();
        if(!response.ok) {
            setErrorMessage(data.error);
            setShowErrorPopup(true);
        } else {
            setShowErrorPopup(false);
        }
        setPosts(data);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const hours = date.getHours() % 12;
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const period = date.getHours() >= 12 ? "PM" : "AM";
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} at ${hours}:${minutes} ${period}`;
        return formattedDate;
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

    if(localStorage.getItem("token") !== null) { // User is logged in
        return (
            <div id="content">
                <NavBar loggedInUserId={getLoggedInUser() ? getLoggedInUser()._id : null} />
                {showErrorPopup && (<ErrorPopup message={errorMessage} onClick={(e) => setShowErrorPopup(false)} />)}
                <a href={"/new-post"}><button id="new-post-button">Create a New Post</button></a>
                {posts.length === 0 && (<span>There are no blog posts.</span>)}
                {posts.map((post) => {
                    if(post.published || (getLoggedInUser() && getLoggedInUser()._id === post.user)) { // Also show all unpublished posts if logged in user is the author of the unpublished post(s)
                        return (
                            <div id="post">
                                <a href={`/posts/${post._id}`} id="title">{post.published ? post.title : `${post.title} (UNPUBLISHED)`}</a> {/* Add "(UNPUBLISHED)" at end of post title if post is unpublished */}
                                <span>{post.content}</span>
                                <span>Posted by <a href={`/users/${post.user}`} id="user-link">{usernames[post.user]}</a> on {formatDate(post.date)}</span>
                                <div id="post-like-counter">
                                    <span class="material-symbols-outlined">thumb_up</span>
                                    <span>{post.liked_by.length}</span>
                                </div>
                            </div>
                        );
                    } else {
                        return null;
                    }
                })}
            </div>
        );    
    } else { // User is not logged in
        return (
            <div id="content">
                <NavBar loggedInUserId={getLoggedInUser() ? getLoggedInUser()._id : null} />
                {showErrorPopup && (<ErrorPopup message={errorMessage} onClick={(e) => setShowErrorPopup(false)} />)}
                {posts.length === 0 && (<span>There are no blog posts.</span>)}
                {posts.filter((post) => post.published).map((post) => (
                    <div id="post">
                        <a href={`/posts/${post._id}`}>{post.title}</a>
                        <span>{post.content}</span>
                        <span>Posted by <a href={`/users/${post.user}`} id="user-link">{usernames[post.user]}</a> on {formatDate(post.date)}</span>
                        <div id="post-like-counter">
                            <span class="material-symbols-outlined">thumb_up</span>
                            <span>{post.liked_by.length}</span>
                        </div>
                    </div>
                ))}
            </div>
        );    
    }
}