import axios from 'axios';
import React from 'react'

function EditCardModal({ isOpen, card, onClose, onSave }) {
    const [localCard, setLocalCard] = React.useState(card);
    const [newComment, setNewComment] = React.useState("");
    const [comments, setComments] = React.useState([]);
    const [userCard, setUserCard] = React.useState([]);
    const [newUserEmail, setNewUserEmail] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [isLoadingComments, setIsLoadingComments] = React.useState(false);

    React.useEffect(() => {
        setLocalCard(card);
    }, [card]);

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const handUserCardChange = (e) => {
        setUserCard(e.target.value);
    };

    const handleChange = (field, value) => {
        setLocalCard({ ...localCard, [field]: value });
    };

    const handleSave = () => {
        onSave(localCard);
        onClose();
    };

    React.useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (isOpen && card) {
            setLocalCard({ ...card, users: card.users || [] }); // Đảm bảo users luôn là mảng
            setIsLoadingComments(true);
            // Lấy bình luận của card từ API
            axios.get(`http://localhost:8000/api/cards/${card.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Socket-ID": window.Echo.socketId()
                },
            })
                .then(response => {
                    setComments(response.data.comments || []);  // Cập nhật danh sách bình luận
                    // setUserCard({...response.data.users, users: response.data.users});
                    setUserCard({ users: response.data.users || [] });
                    console.log('user card: ', userCard);
                    // setLocalCard({
                    //     ...response.data,
                    //     users: response.data.users || [], // Đảm bảo users luôn tồn tại
                    // });
                    setIsLoadingComments(false); // Kết thúc tải dữ liệu
                })
                .catch(error => {
                    console.error('Error fetching comments:', error);
                    setIsLoadingComments(false); // Kết thúc tải dữ liệu, dù có lỗi
                });
        }
    }, [isOpen, card]);

    const addUserToCard = async (email) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("auth_token");
            const response = await axios.post(
                `http://localhost:8000/api/cards/${localCard.id}/users`,
                { email },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            console.log("API Response:", response.data);

            // Kiểm tra nếu API trả về danh sách người dùng hợp lệ
            if (response.data && response.data.users && response.data.users.length > 0) {
                const newUser = response.data.users[0].user;  // Lấy user từ user field
                console.log("New User:", newUser);  // Debug user object

                // // Cập nhật lại state của card với người dùng mới
                // setLocalCard((prev) => {
                //     const updatedUsers = [...prev.users, newUser];
                //     console.log("Updated Users:", updatedUsers);  // Debug updated users
                //     return { ...prev, users: updatedUsers }; // Thêm user vào danh sách người dùng
                // });
                // setUserCard({...userCard, users: newUser});
                setUserCard((prev) => ({
                    ...prev,
                    users: [...(prev.users || []), { user: newUser }],
                }));
                console.log("vừa thêm vô", userCard);
                setNewUserEmail("");
            } else {
                console.error("API response does not contain valid user data.");
            }
        } catch (error) {
            console.error("Error adding user:", error);
        } finally {
            setLoading(false);
        }
    };

    const removeUserFromCard = async (userId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("auth_token");
            await axios.delete(
                `http://localhost:8000/api/cards/${localCard.id}/users/${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            // setLocalCard((prev) => ({
            //     ...prev,
            //     users: prev.users.filter((user) => user.id !== userId),
            // }));
            // setUserCard((prev) => ({
            //     ...prev,
            //     users: prev.users.filter((userObj) => userObj.user.id !== userId), // Lọc theo user.id
            // }));
            setUserCard((prev) => ({
                ...prev,
                users: prev.users.filter((userObj) => userObj.user.id !== userId),
            }));
        } catch (error) {
            console.error("Error removing user:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = () => {
        const token = localStorage.getItem("auth_token");
        const newCommentObj = {
            id: Date.now(),  // Tạo ID tạm thời cho bình luận
            content: newComment,
            author: localStorage.getItem("user_email") || "Anonymous",  // Lấy email từ localStorage
            timestamp: new Date().toISOString()
        };

        // setLocalCard({
        //     ...localCard,
        //     comments: [...localCard.comments, newCommentObj]
        // });

        // Thêm bình luận vào state
        setComments([...comments, newCommentObj]);

        // Gửi yêu cầu POST API để lưu bình luận (tùy thuộc vào API của bạn)
        if (localCard.id) {
            axios.post(`http://localhost:8000/api/cards/${localCard.id}/comments`, newCommentObj, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(response => {
                    console.log('Comment added:', response.data);
                })
                .catch(error => {
                    console.error('Error adding comment:', error);
                });
        }

        setNewComment("");  // Reset input
    };

    if (!isOpen || !card || isLoadingComments) return null;

    return (

        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">
            <div className="bg-white top-10 bottom-10  rounded-lg shadow-lg w-3/5  h-[96vh] p-6 overflow-y-auto m-4 scrollbar-hidden">
                <div className="flex justify-between items-center mb-4 ">
                    <h2 className="text-lg font-semibold">Edit Card</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        ✖
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            value={localCard.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={localCard.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* User Management */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Users</label>
                        {/* <ul className="space-y-2">
                            {localCard?.users?.map((user) => (
                                <li key={user.id} className="flex justify-between items-center">
                                    <span>{user.email}</span>
                                    <button
                                        onClick={() => removeUserFromCard(user.id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul> */}
                        <ul>
                            {/* {userCard?.users?.length > 0 ? (
                                userCard.users.map((userObject, index) => (
                                    userObject?.user?.email ? (
                                    <li key={userObject.user.id} className="flex justify-between items-center">
                                        <span>{userObject.user.email}</span>
                                        <button
                                            onClick={() => removeUserFromCard(userObject.user.id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                    ) : (
                                        <p key={index}>Add success</p>//Invalid user data
                                    )
                                ))
                            ) : (
                                <p>No users assigned to this card.</p>
                            )} */}
                            {userCard?.users?.length > 0 ? (
                                userCard.users.map((userObject, index) => {
                                    if (userObject?.user) {
                                        // Kiểm tra nếu user tồn tại
                                        return (
                                            <li key={userObject.user.id} className="flex justify-between items-center">
                                                <span>{userObject.user.email}</span>
                                                <button
                                                    onClick={() => removeUserFromCard(userObject.user.id)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        );
                                    } else {
                                        // Trường hợp user không hợp lệ
                                        return (
                                            <p key={index} className="text-red-500">
                                                Invalid user data
                                            </p>
                                        );
                                    }
                                })
                            ) : (
                                <p>No users assigned to this card.</p>
                            )}

                        </ul>
                        <div className="flex mt-2">
                            <input
                                type="email"
                                placeholder="Add user by email"
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                            <button
                                onClick={() => addUserToCard(newUserEmail)}
                                disabled={loading || !newUserEmail}
                                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md"
                            >
                                {loading ? "Adding..." : "Add"}
                            </button>
                        </div>
                    </div>

                    {/* Hiển thị bình luận */}
                    <div className="mt-6">
                        <h3 className="text-sm font-semibold">Comments</h3>
                        <div className="h-72 space-y-4 mt-4 overflow-scroll overflow-x-hidden scrollbar-hidden">
                            {comments?.map((comment) => (
                                <div key={comment.id} className="p-2 border-b">
                                    <p className="font-medium">{comment.author}</p>
                                    <p>{comment.content}</p>
                                    <p className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>

                        {/* Form thêm bình luận */}
                        <div className="mt-4">
                            <textarea
                                value={newComment}
                                onChange={handleCommentChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Add a comment..."
                            />
                            <button
                                onClick={handleAddComment}
                                className="mt-2 px-4 py-2 bg-gray-800 rounded-md text-white hover:bg-gray-600"
                            >
                                Add Comment
                            </button>
                        </div>
                    </div>

                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-gray-900 rounded-md text-white hover:bg-gray-700"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>

    );
}

export default EditCardModal;