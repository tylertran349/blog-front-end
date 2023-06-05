import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { ErrorPopup } from "./ErrorPopup";
import { NavBar } from "./NavBar";

export function Post() {
    const { postId } = useParams(); // Extract post ID from URL parameter
    const [post, setPost] = useState({}); // Store data of current blog post
    const [newComment, setNewComment] = useState("");
    const [showDeletePostConfirmation, setShowDeletePostConfirmation] = useState(false);
    const [showDeleteCommentConfirmation, setShowDeleteCommentConfirmation] = useState(false);
    const [commentToBeDeleted, setCommentToBeDeleted] = useState("");
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loadingStatus, setLoadingStatus] = useState("true"); // Set to true of API request to fetch blog post is not done yet, false otherwise
    const [filterCommentsOption, setFilterCommentsOption] = useState("Most recent");

    useEffect(() => {
        fetchPost();
    }, []);

    async function fetchPost() {
        const response = await fetch(`https://blog-production-10b2.up.railway.app/posts/${postId}`);
        if(response.ok) {
            const post = await response.json();
            setPost(post);
            setLoadingStatus(false);
            setShowErrorPopup(false);
        } else {
            const result = await response.json();
            setErrorMessage(result.error);
            setShowErrorPopup(true);
        }
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
            fetchPost();
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

    async function likePostHandler() {
        setShowErrorPopup(false);
        if(post.liked_by.some(user => user._id === getLoggedInUser()._id)) { // If post is already liked by user
            let updatedLikedByList = post.liked_by.filter(user => user._id !== getLoggedInUser()._id);
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
            let updatedLikedByList = post.liked_by.concat(getLoggedInUser());
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
            fetchPost();
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
        setShowErrorPopup(false);
        if(post.comments.find(comment => comment._id === event.target.id).liked_by.some(user => user._id === getLoggedInUser()._id)) { // If comment is already liked by user
            let updatedLikedByList = post.comments.find(comment => comment._id === event.target.id).liked_by.filter(user => user._id !== getLoggedInUser()._id);
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
        } else {
            let updatedLikedByList = post.comments.find(comment => comment._id === event.target.id).liked_by.concat(getLoggedInUser());
            const response = await fetch(`https://blog-production-10b2.up.railway.app/comments/${event.target.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ 
                    content: post.comments.find(comment => comment._id === event.target.id).content,
                    liked_by: updatedLikedByList,
                }),
            });
            if(response.ok) {
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
    }

    async function deletePost(event) {
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
            var i;
            for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if(openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
            document.getElementById("dropbtn").style.borderRadius = '0.5rem 0.5rem 0.5rem 0.5rem';
        }
    }

    return (
        <div id="content">
            <NavBar loggedInUserId={getLoggedInUser() ? getLoggedInUser()._id : null} />
            {showErrorPopup && (<ErrorPopup message={errorMessage} onClick={(e) => setShowErrorPopup(false)} />)}
            {showDeletePostConfirmation && (<DeleteConfirmation type="post" onConfirm={deletePost} onCancel={() => setShowDeletePostConfirmation(false)} />)}
            {showDeleteCommentConfirmation && (<DeleteConfirmation type="comment" onConfirm={() => deleteComment(commentToBeDeleted)} onCancel={() => setShowDeleteCommentConfirmation(false)} />)}
            {!loadingStatus && (<div id="post">
                <span id="title">{post.title}</span>
                <span id="post-content">{post.content}</span>
                <span>Posted by <a href={`/users/${post.user._id}`} id="user-link">{post.user.username}</a> on {formatDate(post.date)}</span>
                <div id="post-like-counter">
                    {(localStorage.getItem("token") !== null) && (<button id="post-like-button" type="button" onClick={() => likePostHandler()} className="material-symbols-outlined" style={{fontVariationSettings: (post.liked_by.some(user => user._id === getLoggedInUser()._id)) ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48' : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 48'}}>thumb_up</button>)}
                    {(localStorage.getItem("token") === null) && (<span id="post-like-button" className="material-symbols-outlined">thumb_up</span>)}
                    {!post.liked_by ? (<span>0</span>) : (<span>{post.liked_by.length}</span>)}
                </div>
                <div id="modify-post-actions">
                    {(post.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={() => {window.location.href=`/posts/${postId}/edit`}} className="material-symbols-outlined" id="edit-post-button">edit</button>)}
                    {(post.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button id="delete-post-button" type="button" onClick={() => setShowDeletePostConfirmation(true)} className="material-symbols-outlined">delete</button>)}
                </div>
                <form onSubmit={handleCommentSubmit} id="comment-form">
                    <div id="label-input-pair">
                        <label htmlFor="comment-input">Comments</label>
                        <textarea id="comment-input" placeholder="Add a comment" value={newComment} onChange={(e) => setNewComment(e.target.value)}></textarea>
                    </div>
                    <button type="submit">Send Comment</button>
                </form>
                <div>
                    {(localStorage.getItem("token") === null) && (<span><a href="/login" id="login-link">Login</a> to comment.</span>)}
                    {post.comments.length === 0 && (<span>There are no comments.</span>)}
                </div>
            </div>)}
            {!loadingStatus && (<div id="dropdown">
                <button onClick={() => toggleDropdown()} id="dropbtn">Sort Comments</button>
                <div id="dropdown-options" class="dropdown-content">
                    <a onClick={() => setFilterCommentsOption("Most recent")}>Most recent</a>
                    <a onClick={() => setFilterCommentsOption("Oldest")}>Oldest</a>
                    <a onClick={() => setFilterCommentsOption("Most liked")}>Most liked</a>
                    <a onClick={() => setFilterCommentsOption("Alphabetical")}>A-Z</a>
                    <a onClick={() => setFilterCommentsOption("Reverse alphabetical")}>Z-A</a>
                </div>
            </div>)}
            {!loadingStatus && (filterCommentsOption === "Most recent") && (post.comments.slice().reverse().map((comment) => { // Sort by most recent
                return (
                    <div id="comment">
                        {comment && (<span>{comment.content}</span>)}
                        <span>Posted by <a href={`/users/${comment.user._id}`} id="user-link">{comment.user.username}</a> on {formatDate(comment.date)}</span>
                        <div id="comment-like-counter">
                            {(localStorage.getItem("token") !== null) && (<button type="button" onClick={likeCommentHandler} id={comment._id} className="material-symbols-outlined" style={{fontVariationSettings: (comment.liked_by.some(user => user._id === getLoggedInUser()._id)) ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48' : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 48'}}>thumb_up</button>)}
                            {(localStorage.getItem("token") === null) && (<span id={comment._id} className="material-symbols-outlined">thumb_up</span>)}
                            {!comment.liked_by ? (<span>0</span>) : (<span>{comment.liked_by.length}</span>)}
                        </div>
                        <div id="modify-comment-actions">
                            {(comment.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={() => {window.location.href=`/comments/${comment._id}/edit`}} className="material-symbols-outlined" id="edit-comment-button">edit</button>)}
                            {(comment.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={deleteCommentHandler} id={comment._id} type="button" className="material-symbols-outlined">delete</button>)}
                        </div>
                    </div>
                )
            }))}
            {!loadingStatus && (filterCommentsOption === "Oldest") && (post.comments.slice().map((comment) => { // Sort by oldest
                return (
                    <div id="comment">
                        {comment && (<span>{comment.content}</span>)}
                        <span>Posted by <a href={`/users/${comment.user._id}`} id="user-link">{comment.user.username}</a> on {formatDate(comment.date)}</span>
                        <div id="comment-like-counter">
                            {(localStorage.getItem("token") !== null) && (<button type="button" onClick={likeCommentHandler} id={comment._id} className="material-symbols-outlined" style={{fontVariationSettings: (comment.liked_by.some(user => user._id === getLoggedInUser()._id)) ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48' : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 48'}}>thumb_up</button>)}
                            {(localStorage.getItem("token") === null) && (<span id={comment._id} className="material-symbols-outlined">thumb_up</span>)}
                            {!comment.liked_by ? (<span>0</span>) : (<span>{comment.liked_by.length}</span>)}
                        </div>
                        <div id="modify-comment-actions">
                            {(comment.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={() => {window.location.href=`/comments/${comment._id}/edit`}} className="material-symbols-outlined" id="edit-comment-button">edit</button>)}
                            {(comment.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={deleteCommentHandler} id={comment._id} type="button" className="material-symbols-outlined">delete</button>)}
                        </div>
                    </div>
                )
            }))}
            {!loadingStatus && (filterCommentsOption === "Most liked") && (post.comments.slice().sort((a, b) => {
                const aLikes = a.liked_by ? a.liked_by.length : 0;
                const bLikes = b.liked_by ? b.liked_by.length : 0;
                return bLikes - aLikes; 
            }).map((comment) => { // Sort by most liked
                return (
                    <div id="comment">
                        {comment && (<span>{comment.content}</span>)}
                        <span>Posted by <a href={`/users/${comment.user._id}`} id="user-link">{comment.user.username}</a> on {formatDate(comment.date)}</span>
                        <div id="comment-like-counter">
                            {(localStorage.getItem("token") !== null) && (<button type="button" onClick={likeCommentHandler} id={comment._id} className="material-symbols-outlined" style={{fontVariationSettings: (comment.liked_by.some(user => user._id === getLoggedInUser()._id)) ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48' : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 48'}}>thumb_up</button>)}
                            {(localStorage.getItem("token") === null) && (<span id={comment._id} className="material-symbols-outlined">thumb_up</span>)}
                            {!comment.liked_by ? (<span>0</span>) : (<span>{comment.liked_by.length}</span>)}
                        </div>
                        <div id="modify-comment-actions">
                            {(comment.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={() => {window.location.href=`/comments/${comment._id}/edit`}} className="material-symbols-outlined" id="edit-comment-button">edit</button>)}
                            {(comment.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={deleteCommentHandler} id={comment._id} type="button" className="material-symbols-outlined">delete</button>)}
                        </div>
                    </div>
                )
            }))}
            {!loadingStatus && (filterCommentsOption === "Oldest") && (post.comments.slice().sort((a, b) => {
                const titleA = a.title.toLowerCase();
                const titleB = b.title.toLowerCase();
                if (titleA < titleB) return -1;
                if (titleA > titleB) return 1;
                return 0;
            }).map((comment) => { // Sort by alphabetical order (A to Z)
                return (
                    <div id="comment">
                        {comment && (<span>{comment.content}</span>)}
                        <span>Posted by <a href={`/users/${comment.user._id}`} id="user-link">{comment.user.username}</a> on {formatDate(comment.date)}</span>
                        <div id="comment-like-counter">
                            {(localStorage.getItem("token") !== null) && (<button type="button" onClick={likeCommentHandler} id={comment._id} className="material-symbols-outlined" style={{fontVariationSettings: (comment.liked_by.some(user => user._id === getLoggedInUser()._id)) ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48' : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 48'}}>thumb_up</button>)}
                            {(localStorage.getItem("token") === null) && (<span id={comment._id} className="material-symbols-outlined">thumb_up</span>)}
                            {!comment.liked_by ? (<span>0</span>) : (<span>{comment.liked_by.length}</span>)}
                        </div>
                        <div id="modify-comment-actions">
                            {(comment.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={() => {window.location.href=`/comments/${comment._id}/edit`}} className="material-symbols-outlined" id="edit-comment-button">edit</button>)}
                            {(comment.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={deleteCommentHandler} id={comment._id} type="button" className="material-symbols-outlined">delete</button>)}
                        </div>
                    </div>
                )
            }))}
            {!loadingStatus && (filterCommentsOption === "Oldest") && (post.comments.slice().sort((a, b) => {
                const titleA = a.title.toLowerCase();
                const titleB = b.title.toLowerCase();
                if (titleA > titleB) return -1;
                if (titleA < titleB) return 1;
                return 0;
            }).map((comment) => { // Sort by reverse alphabetical order (Z to A)
                return (
                    <div id="comment">
                        {comment && (<span>{comment.content}</span>)}
                        <span>Posted by <a href={`/users/${comment.user._id}`} id="user-link">{comment.user.username}</a> on {formatDate(comment.date)}</span>
                        <div id="comment-like-counter">
                            {(localStorage.getItem("token") !== null) && (<button type="button" onClick={likeCommentHandler} id={comment._id} className="material-symbols-outlined" style={{fontVariationSettings: (comment.liked_by.some(user => user._id === getLoggedInUser()._id)) ? '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48' : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 48'}}>thumb_up</button>)}
                            {(localStorage.getItem("token") === null) && (<span id={comment._id} className="material-symbols-outlined">thumb_up</span>)}
                            {!comment.liked_by ? (<span>0</span>) : (<span>{comment.liked_by.length}</span>)}
                        </div>
                        <div id="modify-comment-actions">
                            {(comment.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={() => {window.location.href=`/comments/${comment._id}/edit`}} className="material-symbols-outlined" id="edit-comment-button">edit</button>)}
                            {(comment.user._id === getLoggedInUser()?._id || getLoggedInUser()?.is_admin === true) && (<button onClick={deleteCommentHandler} id={comment._id} type="button" className="material-symbols-outlined">delete</button>)}
                        </div>
                    </div>
                )
            }))}
        </div>
    );
}
