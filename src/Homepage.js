import React, { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import { ErrorPopup } from "./ErrorPopup";
import { NavBar } from "./NavBar";

export function Homepage() {
    const [posts, setPosts] = useState([]); // An array that stores every post
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchPosts(); // Get posts by making API call
    }, []); // Empty dependency array means this hook only runs one time when the component mounts (is inserted in the DOM tree)

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

    console.log(posts);

    async function likePostHandler(event) {
        console.log(posts);
        setShowErrorPopup(false);
        if(posts.find(post => post._id === event.target.id).liked_by.some(user => user._id === getLoggedInUser()._id)) { // If post is already liked by user
            let updatedLikedByList = posts.find(post => post._id === event.target.id).liked_by.filter(user => user._id !== getLoggedInUser()._id);
            const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${event.target.id}`, {
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
                event.target.style.fontVariationSettings = `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48`; // Unfilled thumbs up = not currently liked
                setShowErrorPopup(false);
                fetchPosts();
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
            let updatedLikedByList = posts.find(post => post._id === event.target.id).liked_by.concat(getLoggedInUser());
            const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${event.target.id}`, {
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
                event.target.style.fontVariationSettings = `'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48`; // Filled thumbs up = currently liked
                setShowErrorPopup(false);
                fetchPosts();
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
    }

    // TODO: Rewrite to remove if/else statement and clean up logic
    return (
        <div id="content">
            <NavBar loggedInUserId={getLoggedInUser() ? getLoggedInUser()._id : null} />
            {showErrorPopup && (<ErrorPopup message={errorMessage} onClick={(e) => setShowErrorPopup(false)} />)}
            {(localStorage.getItem("token") !== null) && (<a href={"/new-post"}><button id="new-post-button">Create a New Post</button></a>)}
            {posts.length === 0 && (<span>There are no blog posts.</span>)}
            {posts.slice().reverse().map((post) => {
                if(post.published || (getLoggedInUser() && (getLoggedInUser()?._id === post.user._id))) { // Also show all unpublished posts if logged in user is the author of the unpublished post(s)
                    return (
                        <div id="post">
                            <a href={`/posts/${post._id}`} id="title">{post.published ? post.title : `${post.title} (UNPUBLISHED)`}</a> {/* Add "(UNPUBLISHED)" at end of post title if post is unpublished */}
                            <span id="post-content">{post.content}</span>
                            <span>Posted by <a href={`/users/${post.user._id}`} id="user-link">{post.user.username}</a> on {formatDate(post.date)}</span>
                            <div id="post-like-counter">
                            {(localStorage.getItem("token") !== null) && (<button type="button" onClick={likePostHandler} id={post._id} className="material-symbols-outlined">thumb_up</button>)}
                            {(localStorage.getItem("token") === null) && (<span id={post._id} className="material-symbols-outlined">thumb_up</span>)}
                            {!post.liked_by ? (<span>0</span>) : (<span>{post.liked_by.length}</span>)}
                            </div>
                        </div>
                    );
                } else {
                    return null;
                }
            })}
        </div>
    );    
}