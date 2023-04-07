import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export function User() {
    const { userId } = useParams(); // Get userId from URL
    const [posts, setPosts] = useState([]);
    const [username, setUsername] = useState("");

    useEffect(() => {
        async function fetchPosts() {
            const response = await fetch("https://blog-production-10b2.up.railway.app/posts");
            const data = await response.json();
            const filteredData = data.filter((post) => post.user === userId); // Only get posts that were made by the user with the userId from the URL
            setPosts(filteredData);
        }
        fetchPosts();
    }, [userId]);

    useEffect(() => {
        async function fetchUsername() {
            const response = await fetch(`https://blog-production-10b2.up.railway.app/users/${userId}`);
            const user = await response.json();
            setUsername(user.username);
        }
        fetchUsername();
    }, []);
    
    return (
        <div>
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
