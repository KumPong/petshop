import { Navigate, Outlet, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

// Component สำหรับป้องกัน Route
export default function ProtectedRoute ({ children, allowedRoles }) {
    // ฟังก์ชันการเช็ก Login 
    const token = sessionStorage.getItem('token');
    const userString = sessionStorage.getItem('user');
    const isAuthenticated = !!token;
    const location = useLocation();

    // ถ้ายังไม่ได้ล็อกอิน ให้เด้งไปหน้า Login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ isEmployeeRoute: true }} replace />;
    }

    // 2. ถ้ามี Token ให้เช็ก Role เพิ่มเติม
    if (allowedRoles && userString) {
        const user = JSON.parse(userString);
        
        // ถ้า Role ของคนที่ล็อกอิน ไม่ตรงกับ Role ที่อนุญาตให้เข้าหน้านี้
        if (!allowedRoles.includes(user.role)) {
            // เตะออก ลบข้อมูลทิ้ง
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            
            Swal.fire({
                icon: 'error',
                title: 'ไม่มีสิทธิ์เข้าถึง',
                text: 'กรุณาเข้าสู่ระบบด้วยบัญชีที่ถูกต้อง',
                timer: 2000,
                showConfirmButton: false
            });
            
            return <Navigate to="/login" replace />;
        }
    }
    return children ? children : <Outlet />;
};