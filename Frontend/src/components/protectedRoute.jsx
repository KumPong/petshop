import { Navigate, useLocation } from "react-router-dom";

// Component สำหรับป้องกัน Route
export default function ProtectedRoute ({ children }) {
    // ฟังก์ชันจำลองการเช็ก Login (เดี๋ยวค่อยมาเปลี่ยนตอนต่อ API)
    const isAuthenticated = true; 
    const location = useLocation();

    if (!isAuthenticated) {
        // ถ้ายังไม่ได้ล็อกอิน ให้เด้งไปหน้า Login พร้อมส่ง State
        return <Navigate to="/login" state={{ isEmployeeRoute: true }} replace />;
    }
    
    return children;
};