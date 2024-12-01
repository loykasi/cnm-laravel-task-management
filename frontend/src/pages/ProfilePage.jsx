import React, { useState, useEffect } from "react";
import { FiEdit2, FiCheck, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import useFetchProfile from "../api/getProfile.js";
import { editprofile } from "../api/editProfile.js";
const ProfilePage = () => {
    const { profileData, error, refetch } = useFetchProfile();
    const [selectedImage, setSelectedImage] = useState(null);  // Lấy dữ liệu và lỗi từ hook
    const [editedUserInfo, setEditedUserInfo] = useState({
        name: "",
        job: "",
        bio: "",
        address: "",
        email: "",
        avatar: "",
    });
    useEffect(() => {

        if (profileData) {
            setEditedUserInfo({
                name: profileData.name,
                address: profileData.address || "",
                bio: profileData.bio || "",
                job: profileData.job || "",
                email: profileData.email,
                avatar: profileData.avatar || "",
            });
        }

    }, [profileData]);
    const [tasks, setTasks] = useState([
        { id: "1", content: "Complete project documentation", completed: false },
        { id: "2", content: "Review pull requests", completed: true },
        { id: "3", content: "Update dependencies", completed: false },
    ]);

    const [activities] = useState([
        {
            id: 1,
            action: "Updated task status",
            timestamp: "2 hours ago",
            description: "Marked 'Review pull requests' as complete",
        },
        {
            id: 2,
            action: "Added new task",
            timestamp: "5 hours ago",
            description: "Created task 'Update dependencies'",
        },
    ]);

    const [newTask, setNewTask] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const handleTaskComplete = (taskId) => {
        setTasks(tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        const newTaskItem = {
            id: String(tasks.length + 1),
            content: newTask,
            completed: false,
        };
        setTasks([...tasks, newTaskItem]);
        setNewTask("");
    };

    const handleDeleteTask = (taskId) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(tasks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setTasks(items);
    };
    const handleSaveProfile = async () => {
        try {

            const response = await editprofile(
                editedUserInfo.email,
                editedUserInfo.name,
                editedUserInfo.job,
                editedUserInfo.address,
                editedUserInfo.bio,
                editedUserInfo.avatar
            );
            console.log("Profile updated:", response);

            const updatedProfileData = await refetch();


            if (updatedProfileData) {
                setEditedUserInfo({
                    name: updatedProfileData.name,
                    address: updatedProfileData.address || "",
                    bio: updatedProfileData.bio || "",
                    job: updatedProfileData.job || "",
                    email: updatedProfileData.email,
                    avatar: updatedProfileData.avatar || "",
                });
            }


            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
                setEditedUserInfo({
                    ...editedUserInfo,
                    avatar: reader.result,
                });
            };
            reader.readAsDataURL(file);
        }
    };
    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* User Profile Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    {isEditing && profileData ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <button
                                    className="w-32 h-32 rounded-full overflow-hidden"
                                    onClick={() => document.getElementById("fileInput").click()}
                                >
                                    <img
                                        src={selectedImage || editedUserInfo.avatar}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e";
                                        }}
                                    />
                                </button>
                                {/* Nút Change Image sẽ chỉ hiển thị khi hover */}
                                <input
                                    id="fileInput"
                                    type="file"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>


                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={editedUserInfo.name}
                                    onChange={(e) => setEditedUserInfo({ ...editedUserInfo, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                                <input
                                    type="text"
                                    value={editedUserInfo.job}
                                    onChange={(e) => setEditedUserInfo({ ...editedUserInfo, job: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                                <textarea
                                    value={editedUserInfo.address}
                                    onChange={(e) => setEditedUserInfo({ ...editedUserInfo, address: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    rows="3"
                                />
                                <textarea
                                    value={editedUserInfo.bio}
                                    onChange={(e) => setEditedUserInfo({ ...editedUserInfo, bio: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    rows="3"
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    >
                                        <FiX className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        <FiCheck className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : profileData ? (
                        <div className="flex flex-col md:flex-row items-center">
                            <img
                                src={`https://${profileData.avatar}`}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover"
                                onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e";
                                }}
                            />
                            <div className="md:ml-8 mt-4 md:mt-0 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start">
                                    <h1 className="text-3xl font-bold text-gray-900">{profileData.name}</h1>
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <FiEdit2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-gray-600 mt-1">{profileData.job}</p>
                                <p className="text-gray-500 mt-2">{profileData.bio}</p>
                                <div className="mt-4 space-y-2">
                                    <p className="text-gray-600">
                                        <span className="font-medium">Đại chỉ:</span> {profileData.address || "Unknown"}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Email:</span> {profileData.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : (
                        <div>Loading...</div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Task Management Section */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tasks</h2>
                        <form onSubmit={handleAddTask} className="mb-6">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    placeholder="Add a new task"
                                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                >
                                    <FiPlus className="w-5 h-5" />
                                </button>
                            </div>
                        </form>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="tasks">
                                {(provided) => (
                                    <ul
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-3"
                                    >
                                        {tasks.map((task, index) => (
                                            <Draggable
                                                key={task.id}
                                                draggableId={task.id}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <li
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <button
                                                                onClick={() => handleTaskComplete(task.id)}
                                                                className={`p-1 rounded-full ${task.completed ? "bg-green-500" : "bg-gray-200"}`}
                                                            >
                                                                {task.completed ? (
                                                                    <FiCheck className="w-5 h-5 text-white" />
                                                                ) : (
                                                                    <FiX className="w-5 h-5 text-gray-500" />
                                                                )}
                                                            </button>
                                                            <p className={`text-gray-900 ${task.completed ? "line-through" : ""}`}>
                                                                {task.content}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteTask(task.id)}
                                                            className="p-1 text-red-500 hover:text-red-600"
                                                        >
                                                            <FiTrash2 className="w-5 h-5" />
                                                        </button>
                                                    </li>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </ul>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>

                    {/* Activity Section */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activities</h2>
                        <div className="space-y-4">
                            {activities.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="text-sm font-semibold text-gray-700">{activity.action}</div>
                                        <div className="text-xs text-gray-400">{activity.timestamp}</div>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">{activity.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
