import React, { useState, useEffect } from "react";
import { FiSearch, FiUserPlus, FiTrash2, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa"; // Import icon "X" từ react-icons
import axios from 'axios';
const UserGroupDisplay = ({ id, onClose }) => {
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
  const [showForm, setShowForm] = useState(true);
  const handleCloseForm = () => {
    setShowForm(false); // Đóng form
  };


  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    role: "Member",
    avatar: ""
  });






  const deleteMember = async (userId) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`http://localhost:8000/api/projects/${id}/members/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update members list after successful deletion
      setMembers((prevMembers) => prevMembers.filter((member) => member.id !== userId));
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };



  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="relative max-w-lg w-full p-6 bg-white rounded-lg shadow-md">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          <FaTimes className="h-6 w-6" />

        </button>
        <div className="p-6">

          {/* <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Group Members</h1>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Add new user"
            >
              <FiUserPlus className="mr-2" />
              Add User
            </button>
          </div> */}



          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            <AnimatePresence>
              {members.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={`http://localhost:8000/storage/${user.avatar}`}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e";
                      }}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMember(user.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Remove ${user.name}`}
                  >
                    <FiTrash2 />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>



    </div>
  );
};

export default UserGroupDisplay;