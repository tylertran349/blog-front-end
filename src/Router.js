import React, { Component } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Homepage } from "./Homepage";
import { Post } from "./Post";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { Logout } from "./Logout";
import { NewPost } from "./NewPost";
import { User } from "./User";
import { EditPost } from "./EditPost";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />}></Route>
        <Route path="/posts/:postId" element={<Post />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/sign-up" element={<Signup />}></Route>
        <Route path="/logout" element={<Logout />}></Route>
        <Route path="/new-post" element={<NewPost />}></Route>
        <Route path="/users/:userId" element={<User />}></Route>\
        <Route path="/posts/:postId/edit" element={<EditPost />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default Router;
