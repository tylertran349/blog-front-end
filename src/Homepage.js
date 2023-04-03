import React, { useEffect, useState } from "react";

export function Homepage() {
    const [posts, setPosts] = useState([]); // Initialize posts to be an empty array
    const [usernames, setUsernames] = useState({});

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
            const userIds = posts.map(post => post.user); // Create an array named userIds with all the user values from each post object in the posts array
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
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`; // Format the date and store it in formattedDate
        return formattedDate;
    }

    return (
        <div>
            {posts.map((post) => (
                <div key={post._id}>
                    <span>{post.title}</span>
                    <span>{post.content}</span>
                    <span>Posted by {usernames[post.user]} on {formatDate(post.date)}</span>
                    <span>Likes: {post.likes}</span>
                </div>
            ))}
        </div>
    );    
}