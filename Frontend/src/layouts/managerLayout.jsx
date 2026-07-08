import { Outlet } from "react-router-dom";
import ManagerSidebar from "../components/managerSidebar";
import AutoLogout from "../components/autoLogout";

export default function ManagerLayout() {
    return(
        <div className="flex h-screen">
            <AutoLogout />
            <ManagerSidebar />
            <main className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    )
}