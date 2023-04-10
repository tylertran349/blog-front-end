import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorPopup } from "./ErrorPopup";

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
    
    return (
        <div>
            {showErrorPopup && (<ErrorPopup message={errorMessage} />)}
            <span>{username}</span>
            {posts.length === 0 && (<span>This user has no posts.</span>)}
            {posts.filter((post) => post.published).map((post) => (
                <div key={post._id}>
                    <span>{post.title}</span>
                </div>
            ))}
        </div>
    );
}
