import React, { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import { ErrorPopup } from "./ErrorPopup";
import { NavBar } from "./NavBar";
import { DeleteConfirmation } from "./DeleteConfirmation";

export function Homepage() {
    const [posts, setPosts] = useState([]); // An array that stores every post
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showDeletePostConfirmation, setShowDeletePostConfirmation] = useState(false);
    const [postToBeDeleted, setPostToBeDeleted] = useState("");
    const [filterPostsOption, setFilterPostsOption] = useState("Most recent");

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
        let hours = date.getHours();
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

    async function likePostHandler(event) {
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

    function deletePostHandler(event) {
        setPostToBeDeleted(event.target.id.toString());
        setShowDeletePostConfirmation(true);
    }

    async function deletePost() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postToBeDeleted}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
        });
        if(response.ok) {
            fetchPosts();
            setShowDeletePostConfirmation(false);
            setPostToBeDeleted("");
            setShowErrorPopup(false);
        } else {
            const result = await response.json();
            setErrorMessage(result.error);
            setShowErrorPopup(true);
        }
    }

    function toggleDropdown() {
        var dropdownOptions = document.getElementById("dropdown-options");
        var dropbtn = document.getElementById("dropbtn");
      
        dropdownOptions.classList.toggle("show");
        
        if (dropdownOptions.classList.contains("show")) {
            dropbtn.style.borderRadius = '0.5rem 0.5rem 0 0'; // Only make top left and top right corners rounded
        } else {
            dropbtn.style.borderRadius = '0.5rem'; // Make all corners rounded
        }
    }
      
    // Close the dropdown if the user clicks outside of it
    window.onclick = function(event) {
        if (!event.target.matches('#dropbtn')) {
            var dropdowns = document.getElementsByClassName("dropdown-content");
            for (let i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if(openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                    document.getElementById("dropbtn").style.borderRadius = '0.5rem';
                }
            }
        }
    }

    return (
        <div id="content">
            <NavBar loggedInUserId={getLoggedInUser() ? getLoggedInUser()._id : null} />
            {showErrorPopup && (<ErrorPopup message={errorMessage} onClick={(e) => setShowErrorPopup(false)} />)}
            {showDeletePostConfirmation && (<DeleteConfirmation type="post" onConfirm={deletePost} onCancel={() => setShowDeletePostConfirmation(false)} />)}
            <span id="title">Posts</span>
            {(localStorage.getItem("token") !== null) && (<a href={"/new-post"}><button id="new-post-button">New post</button></a>)}
            {((localStorage.getItem("token") !== null && (posts.filter(post => post.published || (post.user._id === getLoggedInUser()?._id)).length > 0)) || (localStorage.getItem("token") === null && posts.filter(post => post.published).length > 0)) && (<div id="dropdown">
                <button onClick={() => toggleDropdown()} id="dropbtn">Sort posts</button>
                <div id="dropdown-options" className="dropdown-content">
                    <a onClick={() => setFilterPostsOption("Most recent")}>Most recent</a>
                    <a onClick={() => setFilterPostsOption("Oldest")}>Oldest</a>
                    <a onClick={() => setFilterPostsOption("Most liked")}>Most liked</a>
                    <a onClick={() => setFilterPostsOption("Alphabetical")}>A-Z</a>
                    <a onClick={() => setFilterPostsOption("Reverse alphabetical")}>Z-A</a>
                </div>
            </div>)}
            {((localStorage.getItem("token") !== null && posts.filter(post => post.published || (post.user._id === getLoggedInUser()?._id)).length === 0) || (localStorage.getItem("token") === null && posts.filter(post => post.published).length === 0)) && (<span>There are no blog posts.</span>)} {/* Only if the user is logged in and there are no published or unpublished posts at all */}
            {filterPostsOption === "Most recent" && posts.slice().reverse().map((post) => { // Sort by most recent
                if(post.published || (getLoggedInUser() && (getLoggedInUser()?._id === post.user._id))) { // Also show all unpublished posts if logged in user is the author of the unpublished post(s)
                    return (
                        <div id="post">
                            <a href={`/posts/${post._id}`} id="title">{post.published ? post.title : `${post.title} (UNPUBLISHED)`}</a> {/* Add "(UNPUBLISHED)" at end of post title if post is unpublished */}
                            <span id="post-content">{post.content}</span>
                            <span>Posted by <a href={`/users/${post.user._id}`} id="user-link">{post.user.username}</a> on {formatDate(post.date)}</span>
                            <div id="post-like-counter">
                                {(localStorage.getItem("token") !== null) && (<button type="button" onClick={likePostHandler} id={post._id} className="material-symbols-outlined" style={{fontVariationSettings: (post.liked_by.some(user => user._id === getLoggedInUser()._id)) ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48' : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 48'}}>thumb_up</button>)}
                                {(localStorage.getItem("token") === null) && (<span id={post._id} className="material-symbols-outlined">thumb_up</span>)}
                                {!post.liked_by ? (<span>0</span>) : (<span>{post.liked_by.length}</span>)}
                            </div>
                            <div id="modify-post-actions">
                                {(post.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={() => {window.location.href=`/posts/${post._id}/edit`}} className="material-symbols-outlined" id="edit-post-button">edit</button>)}
                                {(post.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={deletePostHandler} id={post._id} type="button" className="material-symbols-outlined">delete</button>)}
                            </div>
                        </div>
                    );
                } else {
                    return null;
                }
            })}

            {filterPostsOption === "Oldest" && posts.slice().map((post) => { // Sort by oldest
                if(post.published || (getLoggedInUser() && (getLoggedInUser()?._id === post.user._id))) { // Also show all unpublished posts if logged in user is the author of the unpublished post(s)
                    return (
                        <div id="post">
                            <a href={`/posts/${post._id}`} id="title">{post.published ? post.title : `${post.title} (UNPUBLISHED)`}</a> {/* Add "(UNPUBLISHED)" at end of post title if post is unpublished */}
                            <span id="post-content">{post.content}</span>
                            <span>Posted by <a href={`/users/${post.user._id}`} id="user-link">{post.user.username}</a> on {formatDate(post.date)}</span>
                            <div id="post-like-counter">
                                {(localStorage.getItem("token") !== null) && (<button type="button" onClick={likePostHandler} id={post._id} className="material-symbols-outlined" style={{fontVariationSettings: (post.liked_by.some(user => user._id === getLoggedInUser()._id)) ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48' : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 48'}}>thumb_up</button>)}
                                {(localStorage.getItem("token") === null) && (<span id={post._id} className="material-symbols-outlined">thumb_up</span>)}
                                {!post.liked_by ? (<span>0</span>) : (<span>{post.liked_by.length}</span>)}
                            </div>
                            <div id="modify-post-actions">
                                {(post.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={() => {window.location.href=`/posts/${post._id}/edit`}} className="material-symbols-outlined" id="edit-post-button">edit</button>)}
                                {(post.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={deletePostHandler} id={post._id} type="button" className="material-symbols-outlined">delete</button>)}
                            </div>
                        </div>
                    );
                } else {
                    return null;
                }
            })}

            {filterPostsOption === "Most liked" && posts.slice().sort((a, b) => {
                const aLikes = a.liked_by ? a.liked_by.length : 0;
                const bLikes = b.liked_by ? b.liked_by.length : 0;
                return bLikes - aLikes;
            }).map((post) => { // Sort by most liked
                if(post.published || (getLoggedInUser() && (getLoggedInUser()?._id === post.user._id))) { // Also show all unpublished posts if logged in user is the author of the unpublished post(s)
                    return (
                        <div id="post">
                            <a href={`/posts/${post._id}`} id="title">{post.published ? post.title : `${post.title} (UNPUBLISHED)`}</a> {/* Add "(UNPUBLISHED)" at end of post title if post is unpublished */}
                            <span id="post-content">{post.content}</span>
                            <span>Posted by <a href={`/users/${post.user._id}`} id="user-link">{post.user.username}</a> on {formatDate(post.date)}</span>
                            <div id="post-like-counter">
                                {(localStorage.getItem("token") !== null) && (<button type="button" onClick={likePostHandler} id={post._id} className="material-symbols-outlined" style={{fontVariationSettings: (post.liked_by.some(user => user._id === getLoggedInUser()._id)) ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48' : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 48'}}>thumb_up</button>)}
                                {(localStorage.getItem("token") === null) && (<span id={post._id} className="material-symbols-outlined">thumb_up</span>)}
                                {!post.liked_by ? (<span>0</span>) : (<span>{post.liked_by.length}</span>)}
                            </div>
                            <div id="modify-post-actions">
                                {(post.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={() => {window.location.href=`/posts/${post._id}/edit`}} className="material-symbols-outlined" id="edit-post-button">edit</button>)}
                                {(post.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={deletePostHandler} id={post._id} type="button" className="material-symbols-outlined">delete</button>)}
                            </div>
                        </div>
                    );
                } else {
                    return null;
                }
            })}

            {filterPostsOption === "Alphabetical" && posts.slice().sort((a, b) => {
                const titleA = a.title.toLowerCase();
                const titleB = b.title.toLowerCase();
                if (titleA < titleB) return -1;
                if (titleA > titleB) return 1;
                return 0;
            }).map((post) => { // Sort by alphabetical order (A to Z)
                if(post.published || (getLoggedInUser() && (getLoggedInUser()?._id === post.user._id))) { // Also show all unpublished posts if logged in user is the author of the unpublished post(s)
                    return (
                        <div id="post">
                            <a href={`/posts/${post._id}`} id="title">{post.published ? post.title : `${post.title} (UNPUBLISHED)`}</a> {/* Add "(UNPUBLISHED)" at end of post title if post is unpublished */}
                            <span id="post-content">{post.content}</span>
                            <span>Posted by <a href={`/users/${post.user._id}`} id="user-link">{post.user.username}</a> on {formatDate(post.date)}</span>
                            <div id="post-like-counter">
                                {(localStorage.getItem("token") !== null) && (<button type="button" onClick={likePostHandler} id={post._id} className="material-symbols-outlined" style={{fontVariationSettings: (post.liked_by.some(user => user._id === getLoggedInUser()._id)) ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48' : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 48'}}>thumb_up</button>)}
                                {(localStorage.getItem("token") === null) && (<span id={post._id} className="material-symbols-outlined">thumb_up</span>)}
                                {!post.liked_by ? (<span>0</span>) : (<span>{post.liked_by.length}</span>)}
                            </div>
                            <div id="modify-post-actions">
                                {(post.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={() => {window.location.href=`/posts/${post._id}/edit`}} className="material-symbols-outlined" id="edit-post-button">edit</button>)}
                                {(post.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={deletePostHandler} id={post._id} type="button" className="material-symbols-outlined">delete</button>)}
                            </div>
                        </div>
                    );
                } else {
                    return null;
                }
            })}
            
            {filterPostsOption === "Reverse alphabetical" && posts.slice().sort((a, b) => {
                const titleA = a.title.toLowerCase();
                const titleB = b.title.toLowerCase();
                if (titleA > titleB) return -1;
                if (titleA < titleB) return 1;
                return 0;
            }).map((post) => { // Sort by reverse alphabetical order (Z to A)
                if(post.published || (getLoggedInUser() && (getLoggedInUser()?._id === post.user._id))) { // Also show all unpublished posts if logged in user is the author of the unpublished post(s)
                    return (
                        <div id="post">
                            <a href={`/posts/${post._id}`} id="title">{post.published ? post.title : `${post.title} (UNPUBLISHED)`}</a> {/* Add "(UNPUBLISHED)" at end of post title if post is unpublished */}
                            <span id="post-content">{post.content}</span>
                            <span>Posted by <a href={`/users/${post.user._id}`} id="user-link">{post.user.username}</a> on {formatDate(post.date)}</span>
                            <div id="post-like-counter">
                                {(localStorage.getItem("token") !== null) && (<button type="button" onClick={likePostHandler} id={post._id} className="material-symbols-outlined" style={{fontVariationSettings: (post.liked_by.some(user => user._id === getLoggedInUser()._id)) ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48' : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 48'}}>thumb_up</button>)}
                                {(localStorage.getItem("token") === null) && (<span id={post._id} className="material-symbols-outlined">thumb_up</span>)}
                                {!post.liked_by ? (<span>0</span>) : (<span>{post.liked_by.length}</span>)}
                            </div>
                            <div id="modify-post-actions">
                                {(post.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={() => {window.location.href=`/posts/${post._id}/edit`}} className="material-symbols-outlined" id="edit-post-button">edit</button>)}
                                {(post.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={deletePostHandler} id={post._id} type="button" className="material-symbols-outlined">delete</button>)}
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