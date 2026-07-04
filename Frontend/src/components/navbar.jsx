import { Link } from "react-router-dom";
import { useState } from "react";

function Navbar() {


    return (
        <nav className="p-4 bg-secondary mb-2 flex justify-between items-center">
            <div className="flex gap-2">
                <Link to='/'>หน้าแรก</Link>
                <Link to='/products'>รายการสินค้า</Link>
                <Link to='/tracking'>ติดตามสินค้า</Link>
            </div>
        </nav>
    )
}

export default Navbar;