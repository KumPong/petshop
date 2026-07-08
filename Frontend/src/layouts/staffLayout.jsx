import { Outlet } from "react-router-dom";
import StaffSidebar from "../components/staffSidebar";
import AutoLogout from "../components/autoLogout";

export default function StaffLayout() {
    return(
        <div className="flex h-screen">
            <AutoLogout />
            <StaffSidebar />
            <main className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    )
}