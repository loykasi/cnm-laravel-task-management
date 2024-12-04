import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import KanbanBoard from "./KanbanBoard";

import { useParams } from "react-router-dom";
import useFetchProfile from "../api/getProfile.js";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
    const [showMembers, setShowMembers] = useState(false); // Controls showing members list
    const [showAddMemberModal, setShowAddMemberModal] = useState(false); // Controls modal visibility
    const [members, setMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const { profileData, error, refetch } = useFetchProfile();
    const [avatarUrl, setAvatarUrl] = useState("");
    const { id } = useParams();


    useEffect(() => {
        if (profileData?.avatar) {
            setAvatarUrl(`http://localhost:8000/storage/${profileData.avatar}`);
        }
    }, [profileData]);

    // Fetch project members
    useEffect(() => {
        fetchProjectMembers();
    }, []);

    const fetchProjectMembers = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`http://localhost:8000/api/projects/${id}/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching project members:', error);
        }
    };

    const searchUsers = async (email) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`http://localhost:8000/api/search-users?email=${email}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const addMember = async (userId) => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.post(
                `http://localhost:8000/api/projects/${id}/members`,
                { user_id: userId },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            fetchProjectMembers(); // Refresh members list
            setShowAddMemberModal(false); // Close the modal
        } catch (error) {
            console.error('Error adding member:', error);
        }
    };





    return (
        <div className="App">
            <div className={"h-screen flex"}>
                <div className={"w-64 px-8 py-4 bg-gray-100 border-r overflow-auto"}>
                    <Link to="/home/profile">
                        <img
                            className={"h-8 w-8 rounded-full"}
                            src={avatarUrl || "path/to/default/avatar.png"}
                            alt="logo"
                        />
                    </Link>

                    <nav className={"mt-8"}>
                        <h3 className={"text-xs font-semibold text-gray-600 uppercase tracking-wide text-left"}>Issues</h3>
                        <div className={"mt-2 -mx-3"}>
                            <Link to="/home" className={"flex justify-between items-center px-3 py-2 bg-gray-200 rounded-lg"}>
                                <span className={"text-sm font-medium text-gray-900 "}>Project</span>
                                <span className={"text-xs font-semibold text-gray-700 "}>36</span>
                            </Link>
                            <a href="#" className={"flex justify-between items-center px-3 py-2 rounded-lg"}>
                                <span className={"text-sm font-medium text-gray-700 "}>Assigned to me</span>
                                <span className={"text-xs font-semibold text-gray-700 "}>2</span>
                            </a>
                            <a href="#" className={"flex justify-between items-center px-3 py-2 rounded-lg"}>
                                <span className={"text-sm font-medium text-gray-700 "}>Created by me</span>
                                <span className={"text-xs font-semibold text-gray-700 "}>2</span>
                            </a>
                            <a href="#" className={"flex justify-between items-center px-3 py-2 rounded-lg"}>
                                <span className={"text-sm font-medium text-gray-700 "}>Archived</span>
                                <span className={"text-xs font-semibold text-gray-700 "}>1</span>
                            </a>







                        </div>
                        <h3 className={"mt-8 text-xs font-semibold text-gray-600 uppercase tracking-wide text-left"}>Tags</h3>
                        <div className={"mt-2 -mx-3"}>

                        </div>
                        <button className={" mt-4 -ml-1 flex items-center text-sm font-medium text-gray-600"}>
                            <svg className={"h-5 w-5 text-gray-500"} viewBox="0 0 24 24" fill="none">
                                <path
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    d="M12 7v10m5-5H7"
                                />
                            </svg>
                            <span className={"ml-1"}>New Project</span>
                        </button>
                    </nav>
                </div>
                <div className={"flex-1 min-w-0 bg-white flex flex-col"}>
                    <div className={"flex-shrink-0 border-b-2 border-gray-200"}>
                        <header className={"px-6"}>
                            <div className={"flex justify-between items-center border-gray-200 py-2"}>
                                {/* right */}
                                <div className={"flex-1"}>
                                    <div className={"relative w-64"}>

                                    </div>
                                </div>
                                {/* right end */}
                                <div className={"flex items-center"}>
                                    <button className={""}>
                                        <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                            <path stroke="currentColor" d="M468 392h-20c-10.384 0-18.709-3.609-24.745-10.728-7.363-8.684-11.255-22.386-11.255-39.626V204c0-78.818-59.543-144.777-136-154.699V0h-40v49.301C159.543 59.223 100 125.181 100 204v144c0 14.175-3.734 25.775-10.799 33.546C82.984 388.385 74.27 392 64 392H44v56h161.413A51.888 51.888 0 00204 460c0 28.673 23.327 52 52 52s52-23.327 52-52c0-4.131-.499-8.145-1.413-12H468v-56zm-212 80c-6.617 0-12-5.383-12-12s5.383-12 12-12 12 5.383 12 12-5.383 12-12 12zm-136.792-64C132.813 392.784 140 372.052 140 348V204c0-63.067 51.263-115.072 114.302-115.987h3.396C320.737 88.928 372 140.933 372 204v137.646c0 26.84 7.174 49.488 20.745 65.494.245.289.492.576.741.86H119.208z" />
                                        </svg>
                                    </button>
                                    <button className={"ml-6"}>
                                        <Link to='/home/profile'>

                                            <img className={"h-8 w-8 rounded-full object-cover"} src={avatarUrl || "path/to/default/avatar.png"} alt="avatar" />

                                        </Link>
                                    </button>
                                </div>
                            </div>
                        </header>
                    </div>

                    {/* component */}
                    <div className={"flex-1 overflow-auto"}>
                        {/* <Routes>
                    <Route path="/project" element={<KanbanBoard />} />
                </Routes> */}
                        <Outlet />
                    </div>


                </div>
            </div>
        </div>
    );
}

export default Home;