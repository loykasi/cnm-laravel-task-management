import React, { useState, useEffect } from "react";
import { FiSearch, FiUserPlus, FiTrash2, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa"; // Import icon "X" từ react-icons
import axios from 'axios';
const Addmember = ({ id, onClose }) => {
    const [members, setMembers] = useState([]);
    useEffect(() => {
        fetchProjectMembers();
        console.log(id);
    }, [id]);

    const fetchProjectMembers = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`http://localhost:8000/api/projects/${id}/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMembers(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching project members:', error);
        }
    };
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
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
            onClose();
        } catch (error) {
            console.error('Error adding member:', error);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Add Member</h3>
                <input
                    type="email"
                    className="border border-gray-300 p-2 rounded w-full"
                    placeholder="Search by email"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchUsers(e.target.value);
                    }}
                />
                <ul className="mt-2">
                    {searchResults.map((user) => (
                        <li
                            key={user.id}
                            onClick={() => addMember(user.id)}
                            className="cursor-pointer text-blue-500 hover:underline"
                        >
                            {user.name} ({user.email})
                        </li>
                    ))}
                </ul>
                <button
                    onClick={onClose}
                    className="mt-4 bg-gray-500 text-white p-2 rounded"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default Addmember;