import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorPopup } from "./ErrorPopup";
import jwt_decode from "jwt-decode";
import { NavBar } from "./NavBar";

export function User() {
    const { userId } = useParams(); // Get userId from URL
    const [posts, setPosts] = useState([]);
    const [username, setUsername] = useState("");
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchPosts();
    }, [userId]);

    useEffect(() => {
        fetchUsername();
    }, []);

    async function fetchPosts() {
        const response = await fetch("https://blog-production-10b2.up.railway.app/posts");
        if(response.ok) {
            const data = await response.json();
            const filteredData = data.filter((post) => post.user === userId); // Only get posts that were made by the user with the userId from the URL
            setPosts(filteredData);
            setShowErrorPopup(false);
        } else {
            const result = await response.json();
            setErrorMessage(result.error);
            setShowErrorPopup(true);
        }
    }

    async function fetchUsername() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/users/${userId}`);
        if(response.ok) {
            const user = await response.json();
            setUsername(user.username);
            setShowErrorPopup(false);
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

    function formatDate(dateString) {
        const date = new Date(dateString);
        const hours = date.getHours() % 12;
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const period = date.getHours() >= 12 ? "PM" : "AM";
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} at ${hours}:${minutes} ${period}`;
        return formattedDate;
    }
    
    return (
        <div>
            <NavBar loggedInUserId={getLoggedInUser() ? getLoggedInUser()._id : null} />
            {showErrorPopup && (<ErrorPopup message={errorMessage} onClick={(e) => setShowErrorPopup(false)} />)}
            <span>{username}</span>
            {posts.length === 0 && (<span>This user has no posts.</span>)}
            {posts.filter((post) => post.published || (getLoggedInUser() && post.user === getLoggedInUser()._id)).map((post) => ( // Also show all unpublished posts if logged in user is the author of the unpublished post(s)
                <div key={post._id}>
                    <a href={`/posts/${post._id}`}>{post.published ? post.title : `${post.title} (PRIVATE)`}</a>
                    <span>{post.content}</span>
                    <span>Posted on {formatDate(post.date)}</span>
                </div>
            ))}
        </div>
    );
}
