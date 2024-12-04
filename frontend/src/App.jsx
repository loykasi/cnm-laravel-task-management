import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";
import ForgetPass from "./ForgetPass";
import Navbar from "./Component/Navbar";

import HomePage from "./HomePage";

import ResetPassPage from "./ResetPassPage";
import OTPInput from "./OTPInput";

import AdminLayout from "./Component/Admin/AdminLayout";
import Login from "./Component/Admin/Login";
import Dashboard from "./Component/Admin/Dashboard";
import ChangePassword from "./Component/Admin/ChangePassword";
import ForgotPassword from "./Component/Admin/ForgotPassword";
import UsersList from "./Component/Admin/Users/UsersList";
import RoomsList from "./Component/Admin/Rooms/RoomsList";


import KanbanBoard from "./pages/KanbanBoard";
import ProfilePage from "./pages/ProfilePage";
import ProjectPage from "./pages/ProjectPage";

import Home from "./pages/Home";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forget" element={<ForgetPass />} />
        <Route path="/reset-password" element={<ResetPassPage />} />
        <Route path="/test" element={<Navbar />} />
        <Route path="/OTP" element={<OTPInput />} />




        <Route path="/home" element={<Home />} >
          <Route path="project/:id" element={<KanbanBoard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="/home" element={<ProjectPage />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="changepass" element={<ChangePassword />} />
          {/* Quản lý Người Dùng */}
          <Route path="users">
            <Route index element={<UsersList />} />
          </Route>
          {/* Quản lý Phòng */}
          <Route path="rooms">
            <Route index element={<RoomsList />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
