import { Outlet, Navigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default function CustomerLayout() {
    const userString = localStorage.getItem('user');

    if (userString) {
        const user = JSON.parse(userString);

        if (user.role === 'Manager') {
            return <Navigate to='/manager' replace />
        }

        if (user.role === 'Staff') {
            return <Navigate to='/staff' replace />
        }
    }
    
    return (
        <div>
            <Navbar />

            <main className="flex-1 p-4">
                <Outlet />
            </main>

            <Footer/>
        </div>
    )
}