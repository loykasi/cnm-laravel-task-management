import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiCheck, FiClock, FiFilter } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import useFetchProject from "../api/getProject.js";
import NewProjectForm from "../Component/NewProjectForm.jsx";
const ProjectPage = () => {
    const { projectData, error, refetch } = useFetchProject();
    const [projects, setProjects] = useState([]);

    // Log dữ liệu projectData để kiểm tra cấu trúc
    useEffect(() => {
        console.log("Project Data:", projectData);

        // Kiểm tra xem projectData có phải là mảng không
        if (projectData && Array.isArray(projectData.data)) {
            setProjects(projectData.data); // Nếu là mảng, set projects
        } else if (projectData) {
            setProjects([projectData]); // Nếu không phải mảng, chuyển thành mảng chứa một đối tượng
        } else {
            console.error("Dữ liệu không hợp lệ:", projectData);
        }
    }, [projectData]);

    useEffect(() => {
        console.log("Projects updated:", projects);
    }, [projects]);

    const [sortCriteria, setSortCriteria] = useState("name");
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const handleSort = (criteria) => {
        setSortCriteria(criteria);
        const sortedProjects = [...projects].sort((a, b) => {
            if (criteria === "name") return a.name.localeCompare(b.name);
            if (criteria === "dueDate") return new Date(a.dueDate) - new Date(b.dueDate);
            if (criteria === "priority") {
                const priorityOrder = { high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return 0;
        });
        setProjects(sortedProjects);
    };

    const handleFilter = (status) => {
        setFilterStatus(status);
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "ongoing": return "bg-blue-500";
            case "completed": return "bg-green-500";
            case "upcoming": return "bg-yellow-500";
            default: return "bg-gray-500";
        }
    };
    const [showForm, setShowForm] = useState(false);
    const toggleForm = () => {
        setShowForm(!showForm);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8" role="main">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">Projects Dashboard</h1>
                    <button
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        aria-label="Add new project"
                        onClick={toggleForm}
                    >
                        <FiPlus className="mr-2" /> New Project
                    </button>

                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search projects..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchQuery}
                                onChange={handleSearch}
                                aria-label="Search projects"
                            />
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={sortCriteria}
                                onChange={(e) => handleSort(e.target.value)}
                                aria-label="Sort projects"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="dueDate">Sort by Due Date</option>
                                <option value="priority">Sort by Priority</option>
                            </select>
                            <div className="flex items-center gap-2">
                                <FiFilter className="text-gray-500" />
                                <select
                                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filterStatus}
                                    onChange={(e) => handleFilter(e.target.value)}
                                    aria-label="Filter by status"
                                >
                                    <option value="all">All Status</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="upcoming">Upcoming</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                    role="article"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(project.status)}`}
                                            >
                                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                            </span>
                                            <button
                                                className="text-gray-400 hover:text-gray-600"
                                                aria-label="More options"
                                            >
                                                <BsThreeDotsVertical />
                                            </button>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h3>
                                        <p className="text-gray-600 mb-4">{project.description}</p>
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                                                <span>Progress</span>
                                                <span>{project.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${getStatusColor(project.status)}`}
                                                    style={{ width: `${project.progress}%` }}
                                                    role="progressbar"
                                                    aria-valuenow={project.progress}
                                                    aria-valuemin="0"
                                                    aria-valuemax="100"
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                <FiClock className="text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-500">{project.due_date}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {project.tags && project.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                aria-label="Edit project"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                aria-label="Delete project"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No projects available</p>
                        )}
                    </div>
                </div>
            </div>
            {showForm && <NewProjectForm />}
        </div>
    );
};

export default ProjectPage;
