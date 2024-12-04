import { useEffect, useState } from "react";
import axios from "axios";


const useFetchProfile = () => {
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState("");

    const userapi = axios.create({
        baseURL: 'http://localhost:8000/api',
    });


    userapi.interceptors.request.use((config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });


    const fetchProfile = async () => {
        try {
            const email = localStorage.getItem("user_email");


            // Kiểm tra nếu không có email trong localStorage
            if (!email) {
                setError("Email không được tìm thấy trong localStorage.");
                return;
            }

            const response = await userapi.post("/profile", { email });


            const data = response.data;

            console.log("Profile data:", data);


            // Cập nhật thông tin người dùng
            setProfileData({
                name: data.name,
                email: data.email,
                phone: data.phone,
                avatar: data.avatar,
                address: data.address,
                job: data.job,
                bio: data.bio,
            });

            setError("");

        } catch (err) {
            console.error("Lỗi khi lấy dữ liệu từ API:", err);
            setError("Không tìm thấy thông tin người dùng.");
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);


    return { profileData, error, refetch: fetchProfile };
};

export default useFetchProfile;

