import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default function CustomerLayout() {
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