import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export function User() {
    const { userId } = useParams(); // Get userId from URL
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        async function fetchPosts() {
            const response = await fetch("https://blog-production-10b2.up.railway.app/posts");
            const data = await response.json();
            const filteredData = data.filter((post) => post.user === userId); // Only get posts that were made by the user with the userId from the URL
            setPosts(filteredData);
        }
        fetchPosts();
    }, [userId]);

    return (
        <div>
            {posts.length === 0 && (<span>This user has no posts.</span>)}
            {posts.filter((post) => post.published).map((post) => (
                <div key={post._id}>
                    <span>{post.title}</span>
                </div>
            ))}
        </div>
    );
}
