import React from "react";

export function NavBar(props) {
    if(!props.loggedInUserId) { // Only if props.loggedInUserId is falsy (e.g. user is not logged in)
        return (
            <div>
                <a href={"/"}>Home</a>
                <a href={"/login"}>Login</a>
                <a href={"/sign-up"}>Sign Up</a>
            </div>
        );
    } else {
        return (
            <div>
                <a href={"/"}>Home</a>
                <a href={`/users/${props.loggedInUserId}/settings`}>Settings</a>
                <a href={"/logout"}>Logout</a>
            </div>
        );
    }
}