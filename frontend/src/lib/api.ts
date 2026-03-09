import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add the token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authAPI = {
    adminRegister: (data: any) => api.post("/admin/register", data),
    adminLogin: (data: any) => api.post("/admin/login", data),
    studentRegister: (data: any) => api.post("/user/register", data),
    studentLogin: (data: any) => api.post("/user/login", data),
};

export const userAPI = {
    getStaff: () => api.get("/admin/staff"),
    createTPO: (data: any) => api.post("/admin/create-tpo", data),
    createHOD: (data: any) => api.post("/admin/create-hod", data),
    getDashboardStats: () => api.get("/admin/dashboard-stats"),
};

export const complaintAPI = {
    create: (data: any) => api.post("/complaints", data),
    getMy: () => api.get("/complaints/my"),
    getAssigned: () => api.get("/complaints/assigned"),
    getById: (id: string) => api.get(`/complaints/${id}`),
    getAll: () => api.get("/complaints"), // Admin only
    assign: (data: { complaintId: string; assignedToId: string }) => api.put("/complaints/assign", data),
    respond: (id: string, data: { response: string; status?: string }) => api.put(`/complaints/respond/${id}`, data),
    close: (id: string) => api.put(`/complaints/close/${id}`),
    delete: (id: string) => api.delete(`/complaints/${id}`),
};

export const debugAPI = {
    checkToken: () => api.get("/debug/token"),
};

export default api;
