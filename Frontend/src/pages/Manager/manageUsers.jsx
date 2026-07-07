import { useState } from "react";
import { Search, SlidersHorizontal, Eye, UserPlus, X, Edit, Save } from 'lucide-react';

function ManageUsers() {
    const [users, setUsers] = useState([
        {
            id: 'PS0001',
            prefix: 'นาง',
            firstname: 'เจน',
            lastname: 'โด',
            email: 'jane.doe@example.com',
            role: 'Manager',
            status: 'ACTIVE',
            password: 'Stop0012',
            emergencyContact: { name: 'ซู หยาง', phone: '0811234567', relationship: 'มารดา' },
            bloodGroup: 'O'
        },
        {
            id: 'PS0002',
            prefix: 'นาย',
            firstname: 'เซธ',
            lastname: 'โลเวลล์',
            email: 'seth.lowell@example.com',
            role: 'Staff',
            status: 'ACTIVE',
            password: 'Pet0012',
            emergencyContact: { name: 'ซิง อี้', phone: '0898765432', relationship: 'มารดา' },
            bloodGroup: 'B'
        }
    ]);

    // State about Pop-uop
    const [isAddModalOpen, setIsAddModelOpen] = useState(false);
    const [isDetailModelOpen, setIsDetailModelOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // State Form Staff
    const [newUser, setNewUser] = useState({
        prefix: '', firstname: '', lastname: '', province: '', email: '', 
        phone: '', idCard: '', role: 'Staff', status: 'Active', 
        birthDate: '', bloodGroup: '', startDate: '', salary: '', address: '',
        emergencyContact: { name: '', phone: '', relationship: '' }
    });

    // Heandle
    const handleViewDetail = (user) => {
        setSelectedUser({...user});
        setIsDetailModelOpen(true);
        setIsEditMode(false);
    };

    const handleUpdateUser = () => {
        // add Request put to backend
        console.log("update User Data:", selectedUser);
        setIsEditMode(false);
    };

    const handleCreateUser = (e) => {
        e.preventDefault();
        // add Request Post to backend
        console.log("Create New User Payload:", newUser)
        setIsAddModelOpen(false);
    };

    return(
        <div className="min-h-screen p-8">
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Manager Users</h1>
                <button 
                    onClick={() => setIsAddModelOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-secondary text-black px-4 py-2 rounded-lg transition-colors"
                >
                    <UserPlus size={20} />
                    เพิ่มพนักงานใหม่
                </button>
            </div>

            {/* --- SEARCH & FILTER --- */}
            <div className="bg-other rounded-2xl p-4 flex gap-4 items-center mb-8 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Search bg name, email or staff ID..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-background rounded-lg focus:outline-none focus:border-primary"
                    />
                </div>
                <select className="border border-gray-200 rounded-lg px-4 py-2 bg-background focus:outline-none">
                    <option>สถานะ: ทั้งหมด</option>
                    <option>ACTIVE</option>
                    <option>LEAVE</option>
                </select>
            </div>

            {/* --- USER TABLE/LIST --- */}
            <div className="bg-other rounded-2xl p-6 shadow-sm mb-8">
                <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-sm font-semibold text-gray-600">
                    <div className="col-span-4">ชื่อ-นามสกุล</div>
                    <div className="col-span-3">รหัสพนักงาน</div>
                    <div className="col-span-2">ตำแหน่ง</div>
                    <div className="col-span-2">สถานะ</div>
                    <div className="col-span-1">จัดการ</div>
                </div>

                <div className="space-y-2 mt-4">
                    {users.map(user => (
                        <div key={user.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-50 last:border-0 hover:bg-background transition-colors">
                            <div className="col-span-4 flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
                                <div>
                                    <div className="font-medium text-gray-800">{user.firstname} {user.lastname}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                            </div>
                            <div className="col-span-3 text-gray-600">{user.id}</div>
                            <div className="col-span-2 text-gray-600">{user.role}</div>
                            <div className="col-span-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    {user.status}
                                </span>
                            </div>
                            <div className="col-span-1 flex justify-center">
                                <button
                                    onClick={() => handleViewDetail(user)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-background hover:bg-other rounded-lg text-sm text-gray-700 transition-colors"
                                >
                                    <Eye size={16} /> ดูรายละเอียด
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- POPUP ดูรายละเอียด & แก้ไข (User Details) --- */}
            {isDetailModelOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-other z-10">
                            <h2 className="text-xl font-bold text-gray-800">รายละเอียดพนักงาน</h2>
                            <div className="flex gap-2">
                                {!isEditMode ? (
                                    <button onClick={() => setIsEditMode(true)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                                        <Edit size={20} />
                                    </button>
                                ) : (
                                    <button onClick={handleUpdateUser} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100">
                                        <Save size={20} />
                                    </button>
                                )}
                                <button onClick={() => setIsDetailModelOpen(false)} className="p-2 text-gray-500 hover:text-gray-700 bg-background rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* ข้อมูลทั่วไป (ดูได้อย่างเดียว) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">รหัสพนักงาน</label>
                                    <div className="font-medium">{selectedUser.id}</div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">ชื่อ-นามสกุล</label>
                                    <div className="font-medium">{selectedUser.prefix}{selectedUser.firstname} {selectedUser.lastname}</div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">อีเมล</label>
                                    <div className="font-medium">{selectedUser.email}</div>
                                </div>
                            </div>

                            <hr />

                            {/* ส่วนที่แก้ไขได้: รหัสผ่าน, สิทธิ์ผู้ใช้งาน, ผู้ติดต่อฉุกเฉิน */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-700">ข้อมูลที่สามารถแก้ไขได้</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">บทบาท (Role)</label>
                                        <select 
                                            disabled={!isEditMode} 
                                            value={selectedUser.role}
                                            onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                                            className={`w-full p-2 border border-lg rounded-lg ${isEditMode ? 'bg-other border-secondary' : 'bg-other border-gray-200'}`}
                                        >
                                            <option value="Staff">Staff</option>
                                            <option value="Manager">Manager</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">รหัสผ่านใหม่ (ทิ้งว่างหากไม่เปลี่ยน)</label>
                                        <input 
                                            type="password"
                                            disabled={!isEditMode}
                                            placeholder={isEditMode ? "กรอกรหัสผ่านใหม่" : "**********"}
                                            className={`w-full p-2 border rounded-lg ${isEditMode ? 'bg-other border-secondary' : 'bg-other border-gray-200' }`}
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-other rounded-lg space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-700">ผู้ติดต่อฉุกเฉิน</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">ชื่อ-นามสกุล</label>
                                            <input 
                                                type="text" disabled={!isEditMode}
                                                value={selectedUser.emergencyContact.name}
                                                onChange={(e) => setSelectedUser({...selectedUser, emergencyContact: {...selectedUser.emergencyContact, name: e.target.value}})}
                                                className={`w-full p-2 text-sm border rounded-lg ${isEditMode ? 'bg-background border-secondary'  : 'bg-transparent border-gray-200' }`} 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-1">เบอร์โทรศัพท์</label>
                                            <input 
                                                type="text" disabled={!isEditMode}
                                                value={selectedUser.emergencyContact.phone}
                                                onChange={(e) => setSelectedUser({...selectedUser, emergencyContact: {...selectedUser.emergencyContact, phone: e.target.value}})}
                                                className={`w-full p-2 text-sm border rounded-lg ${isEditMode ? 'bg-background border-secondary' : 'bg-transparent border-gray-200'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* --- POPUP เพิ่มพนักงานใหม่ (Add User) --- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
                        {/* Header ของ Modal */}
                        <div className="bg-primary p-6 flex justify-between items-center text-black shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <UserPlus size={24} /> เพิ่มผู้ใช้ใหม่
                                </h2>
                                <p className="text-sm opacity-90 mt-1">เพิ่มข้อมูลพนักงานเข้าสู่ระบบ</p>
                            </div>
                            <button onClick={() => setIsAddModelOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition">
                                <X size={24} />
                            </button>
                        </div>

                        {/* ส่วนของ Form */}
                        <div className="p-6 overflow-auto flex-1 bg-background">
                            <form id="addUserForm" onSubmit={handleCreateUser} className="space-y-6">

                                {/* คำนำหน้า & ชื่อ */}
                                <div className="flex gap-4">
                                    <div className="w-32 shrink-0">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">คำนำหน้า <span className="text-red-500">*</span></label>
                                        <select 
                                            className="w-full p-2 border bg-other border-gray-400 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                            value={newUser.prefix}
                                            onChange={(e) => setNewUser({...newUser, prefix: e.target.value})}
                                            required
                                        >
                                            <option value="" disabled>เลือก</option>
                                            <option value="นาย">นาย</option>
                                            <option value="นาง">นาง</option>
                                            <option value="นางสาว">นางสาว</option>
                                        </select>
                                    </div>

                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            placeholder="ชื่อ-นามสกุล" 
                                            className="w-full p-3 border bg-other border-gray-400 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="example@company.com" className="w-full bg-other p-3 border border-gray-400 rounded-lg outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                                        <input type="tel" placeholder="0812345678" className="w-full p-3 bg-other border border-gray-400 rounded-lg outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">เลขบัตรประชาชน <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="1234567890123" className="w-full p-3 bg-other border border-gray-400 rounded-lg outline-none" required />
                                    </div>

                                    {/* บทบาท - ให้มีแค่ Staff กับ Manager */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท <span className="text-red-500">*</span></label>
                                        <select 
                                            className="w-full p-3 border border-gray-400 rounded-lg bg-other outline-none"
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                        >
                                            <option value="Staff">Staff</option>
                                            <option value="Manager">Manager</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                                        <select className="w-full p-3 border border-gray-400 rounded-lg bg-other outline-none">
                                            <option value="Staff">กำลังทำงานอยู่ (Active)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">วันเกิด</label>
                                        <input type="date" className="w-full p-3 border bg-other border-gray-400 rounded-lg outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">อายุ</label>
                                        <input type="text" placeholder="อายุจะคำนวนตามวันเกิด" disabled className="w-full p-3 border bg-other border-gray-400 rounded-lg" />
                                    </div>

                                    {/* กรุ๊ปเลือด - Dropdown */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">กรุ๊ปเลือด</label>
                                        <select 
                                            className="w-full p-3 border border-gray-400 rounded-lg bg-other outline-none"
                                            value={newUser.bloodGroup}
                                            onChange={(e) => setNewUser({...newUser, bloodGroup: e.target.value})}
                                        >
                                            <option value="">เลือกกรุ๊ปเลือด</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="AB">AB</option>
                                            <option value="O">O</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">เงินเดือน</label>
                                        <input type="number" placeholder="0" className="w-full p-3 border bg-other border-gray-400 rounded-lg outline-none" />
                                    </div>
                                </div>

                                {/* ผู้ติดต่อฉุกเฉิน */}
                                <div className="bg-other p-4 rounded-xl border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">ข้อมูลผู้ติดต่อฉุกเฉิน</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-700 font-medium mb-1">ชื่อ-นามสกุล</label>
                                            <input type="text" className="w-full p-2 border border-gray-400 rounded-lg outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-700 font-medium mb-1">เบอร์โทรศัพท์</label>
                                            <input type="text" className="w-full p-2 border border-gray-400 rounded-lg outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-700 font-medium mb-1">ความสัมพันธ์</label>
                                            <input type="text" className="w-full p-2 border border-gray-400 rounded-lg outline-none" />
                                        </div>
                                    </div>
                                </div>

                            </form>
                        </div>

                        {/* Footer ของ Modal */}
                        <div className="p-4 bg-other border-t border-gray-400 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsAddModelOpen(false)}
                                className="px-6 py-2 rounded-lg font-medium text-gray-600 bg-background hover:bg-other transition"
                            >
                                ยกเลิก
                            </button>
                            <button 
                                type="submit"
                                form="addUserForm"
                                className="px-6 py-2 rounded-lg font-medium text-black bg-primary hover:bg-secondary transition"
                            >
                                บันทึกข้อมูล
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;