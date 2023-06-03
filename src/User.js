import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorPopup } from "./ErrorPopup";
import jwt_decode from "jwt-decode";
import { NavBar } from "./NavBar";

export function User() {
    const { userId } = useParams(); // Get userId from URL
    const [user, setUser] = useState({});
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchUser();
    }, []);

    async function fetchUser() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/users/${userId}`);
        if(response.ok) {
            const data = await response.json();
            setUser(data);
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
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const period = date.getHours() >= 12 ? "PM" : "AM";
        if(hours === 0) { // If it's midnight (special case)
            hours = 12;
        } else if(hours > 12) {
            hours -= 12;
        }
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} at ${hours}:${minutes} ${period}`;
        return formattedDate;
    }

    console.log(user);
    
    return (
        <div id="content">
            <NavBar loggedInUserId={getLoggedInUser() ? getLoggedInUser()._id : null} />
            {showErrorPopup && (<ErrorPopup message={errorMessage} onClick={(e) => setShowErrorPopup(false)} />)}
            <span id="title">{user.username}</span>
            {(!user.posts || user.posts.length === 0) ? (<span>This user has no posts.</span>) : 
            (user.posts.filter((post) => post.published || (getLoggedInUser() && post.user._id === getLoggedInUser()._id)).slice().reverse().map((post) => ( // Also show all unpublished posts if logged in user is the author of the unpublished post(s)
                <div id="post">
                    <a id="title" href={`/posts/${post._id}`}>{post.published ? post.title : `${post.title} (PRIVATE)`}</a>
                    <span>{post.content}</span>
                    <span>Posted by <a href={`/users/${post.user._id}`} id="user-link">{post.user.username}</a> on {formatDate(post.date)}</span>
                </div>
            )))}
        </div>
    );
}
