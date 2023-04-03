import React, { Component } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Homepage } from "./Homepage";
import { Post } from "./Post";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default Router;
