import { useEffect, useState } from "react";
import axios from "axios";


const useFetchProject = () => {
    const [projectData, setProjectData] = useState();
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


    const fetchProject = async () => {
        try {
            const email = localStorage.getItem("user_email");


            if (!email) {
                setError("Email không được tìm thấy trong localStorage.");
                return;
            }

            const response = await userapi.get(`/project?email= ${email}`);

            setProjectData(response.data);

            setError("");

        } catch (err) {
            console.error("Lỗi khi lấy dữ liệu từ API:", err);
            setError("Không tìm thấy thông tin người dùng.");
        }
    };

    useEffect(() => {
        fetchProject();
    }, []);


    return { projectData, error, refetch: fetchProject };
};

export default useFetchProject;

