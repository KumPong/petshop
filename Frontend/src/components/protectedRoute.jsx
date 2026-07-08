import { Navigate, useLocation } from "react-router-dom";

// Component สำหรับป้องกัน Route
export default function ProtectedRoute ({ children }) {
    // ฟังก์ชันการเช็ก Login 
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;
    const location = useLocation();

    if (!isAuthenticated) {
        // ถ้ายังไม่ได้ล็อกอิน ให้เด้งไปหน้า Login พร้อมส่ง State
        return <Navigate to="/login" state={{ isEmployeeRoute: true }} replace />;
    }
    
    return children;
};