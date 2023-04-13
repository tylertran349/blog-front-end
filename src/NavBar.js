import React from "react";

export function NavBar(props) {
    if(!props.loggedInUserId) { // Only if props.loggedInUserId is falsy (e.g. user is not logged in)
        return (
            <div id="nav-bar">
                <a href={"/"} id="title">Blog</a>
                <div id="nav-bar-right-links">
                    <a href={"/"}>Home</a>
                    <a href={"/login"}>Login</a>
                    <a href={"/sign-up"}>Sign Up</a>
                </div>
            </div>
        );
    } else {
        return (
            <div id="nav-bar">
                <a href={"/"} id="title">Blog</a>
                <div id="nav-bar-right-links">
                    <a href={"/"}>Home</a>
                    <a href={`/users/${props.loggedInUserId}/settings`}>Settings</a>
                    <a href={"/logout"}>Logout</a>
                </div>
            </div>
        );
    }
}