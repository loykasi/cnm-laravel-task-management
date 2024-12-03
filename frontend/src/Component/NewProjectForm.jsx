import React, { useState } from "react";
import { FaTimes } from "react-icons/fa"; // Import icon "X" từ react-icons
import axios from "axios"; // Import axios
import { createproject } from "../api/createproject.js"
const NewProjectForm = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [showForm, setShowForm] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const projectData = { name, description, status, dueDate };

        try {
            // Gửi dữ liệu lên backend Laravel bằng Axios
            const response = await createproject(projectData.name, projectData.description, projectData.status, projectData.dueDate);
            if (response.success) {
                alert("Project created successfully");
                setShowForm(false); // Ẩn form sau khi tạo thành công
            } else {
                alert("Error creating project");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error creating project");
        }
    };

    const handleCloseForm = () => {
        setShowForm(false); // Đóng form
    };

    if (!showForm) return null; // Không hiển thị form khi đóng

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="relative max-w-lg w-full p-6 bg-white rounded-lg shadow-md">
                <button
                    onClick={handleCloseForm}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                >
                    <FaTimes className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-semibold text-center mb-6">Create New Project</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Project Name:
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description:
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Status:
                        </label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            required
                            className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                            Due Date:
                        </label>
                        <input
                            type="date"
                            id="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                            className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full p-3 mt-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewProjectForm;
