import React, { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";

export function Homepage() {
    const [posts, setPosts] = useState([]); // An array that stores every post
    const [usernames, setUsernames] = useState({}); // A JavaScript object that stores key-value pairs of user IDs (key) and their associated usernames (value)

    useEffect(() => {
        async function fetchPosts() {
            const response = await fetch("https://blog-production-10b2.up.railway.app/posts");
            const data = await response.json();
            setPosts(data);
        }
        fetchPosts(); // Get posts by making API call
    }, []); // Empty dependency array means this hook only runs one time when the component mounts (is inserted in the DOM tree)

    useEffect(() => {
        async function fetchUsernames() {
            const userIds = posts.map(post => post.user); // Create an array named userIds with all the user IDs from each post object in the posts array
            const usernameMap = {}; // JavaScript object (similar to hashmap) - userId is key, user.username is value
            for(const userId of userIds) {
                const response = await fetch(`https://blog-production-10b2.up.railway.app/users/${userId}`); // For each userId in the userIds array, fetch the user from the API
                const user = await response.json();
                usernameMap[userId] = user.username; // Add new key-value pair to usernameMap object
            }
            setUsernames(usernameMap); // Update usernames state with updated usernameMap object
        }
        fetchUsernames();
    }, [posts]); // This hook will run anytime the "posts" dependency changes

    function formatDate(dateString) {
        const date = new Date(dateString); // Create new date object out of input date string
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} at ${date.getHours() % 12}:${date.getMinutes()} ${date.getHours() >= 12 ? "PM" : "AM"}`; // Format the date and store it in formattedDate
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
            console.error("Error decoding token: " + err);
            return null;
        }
    }

    if(localStorage.getItem("token") !== null) {
        return (
            <div>
                <a href={"/logout"}>Logout</a>
                <a href={`/users/${getLoggedInUser()._id}/settings`}>Settings</a>
                <a href={"/new-post"}>Create a New Post</a>
                {posts.filter((post) => post.published).map((post) => (
                    <div key={post._id}>
                        <a href={`/posts/${post._id}`}>{post.title}</a>
                        <span>{post.content}</span>
                        <span>Posted by <a href={`/users/${post.user}`}>{usernames[post.user]}</a> on {formatDate(post.date)}</span>
                        <span>Likes: {post.likes}</span>
                    </div>
                ))}
            </div>
        );    
    } else {
        return (
            <div>
                <a href={"/login"}>Login</a>
                <a href={"/sign-up"}>Sign Up</a>
                <a href={"/new-post"}>Create a New Post</a>
                {posts.filter((post) => post.published).map((post) => (
                    <div key={post._id}>
                        <a href={`/posts/${post._id}`}>{post.title}</a>
                        <span>{post.content}</span>
                        <span>Posted by <a href={`/users/${post.user}`}>{usernames[post.user]}</a> on {formatDate(post.date)}</span>
                        <span>Likes: {post.likes}</span>
                    </div>
                ))}
            </div>
        );    
    }
}