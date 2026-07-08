import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function AutoLogout() {
    const navigate = useNavigate();

    useEffect(() => {
        let timeoutId;
        const INACTIVITY_TIME = 30 * 60 * 1000; // 15 นาที

        const logoutUser = () => {
            if (localStorage.getItem('token')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                Swal.fire({
                    icon: 'warning',
                    title: 'เซสชั่นหมดอายุ',
                    text: 'คุณไม่ได้ใช้งานระบบเป็นเวลานาน กรุณาเข้าสู่ระบบใหม่เพื่อความปลอดภัย',
                    customClass: {
                        confirmButton: 'bg-primary hover:bg-secondary text-black font-semibold py-2 px-6 rounded-lg'
                    },
                    confirmButtonText: 'ตกลง'
                }).then(() => {
                    navigate('/login');
                    window.location.reload();
                });
            }
        };

        const resetTimer = () => {
            if (localStorage.getItem('token')) {
                timeoutId = setTimeout(logoutUser, INACTIVITY_TIME);
            }
        };

        // ดักจับดารเคลื่อนไหว
        const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));

        resetTimer();

        return () => {
            events.forEach(event => window.removeEventListener(event, resetTimer));
            clearTimeout(timeoutId)
        }
    }, [navigate]);

    return null;
};