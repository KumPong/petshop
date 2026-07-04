import { Outlet } from "react-router-dom";
import StaffSidebar from "../components/staffSidebar";

export default function StaffLayout() {
    return(
        <div className="flex h-screen">
            <StaffSidebar />
            <main className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    )
}