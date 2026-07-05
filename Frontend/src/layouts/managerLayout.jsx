import { Outlet } from "react-router-dom";
import ManagerSidebar from "../components/managerSidebar";

export default function ManagerLayout() {
    return(
        <div className="flex h-screen">
            <ManagerSidebar />
            <main className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    )
}