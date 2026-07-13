import { useState, useEffect, useRef } from "react";
import { Search, UserPlus, X, Edit, Save, Eye, ImagePlus, EyeOff, UserMinus } from 'lucide-react';
import Swal from 'sweetalert2';
import { getUsers, createUser, updateUser, uploadUserImage, deleteUser } from "../../services/user.service";

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ทั้งหมด');

    const [searchQuery, setSearchQuery] = useState('');

    const [showEditPassword, setShowEditPassword] = useState(false); 
    const [showAddPassword, setShowAddPassword] = useState(false);

    // ดึงข้อมูลคนที่กำลังล็อกอินอยู่จาก LocalStorage
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};

    // State about Pop-up
    const [isAddModalOpen, setIsAddModelOpen] = useState(false);
    const [isDetailModelOpen, setIsDetailModelOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // 🚨 แก้ firstname เป็น firstName, lastname เป็น lastName ให้ตรงกับ Data
    const initialUserState = {
        prefix: '', firstName: '', lastName: '', email: '', 
        phone: '', idCard: '', role: 'Staff', status: 'ACTIVE', 
        bloodGroup: '', password: '', profileImage: '',
        emergencyContact: { name: '', phone: '', relationship: '' }
    };
    const [newUser, setNewUser] = useState(initialUserState);

    // State สำหรับรูปภาพ
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    // โหลดข้อมูล
    const fetchUsersData = async () => {
        try {
            const data = await getUsers();
            // กรองเอาเฉพาะ Manager กับ Staff มาแสดง (ไม่เอา Customer)
            const staffUsers = data.filter(u => u.role === 'Manager' || u.role === 'Staff');
            setUsers(staffUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersData();
    }, []);

    // ---------------- จัดการรูปภาพ ----------------
    const handleImageClick = () => {
        if (isEditMode || isAddModalOpen) {
            fileInputRef.current.click(); 
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            setImagePreview(URL.createObjectURL(file)); 
        }
    };

    const resetImageState = () => {
        setSelectedImageFile(null);
        setImagePreview(null);
    };

    // ---------------- จัดการ Modal ----------------
    const handleViewDetail = (user) => {
        setSelectedUser({...user});
        setImagePreview(user.profileImage || null);
        setIsDetailModelOpen(true);
        setIsEditMode(false);
        resetImageState();
    };

    const openAddModal = () => {
        setNewUser(initialUserState);
        resetImageState();
        setIsAddModelOpen(true);
    };

    // ---------------- ส่งข้อมูลไป Backend ----------------
    const handleUpdateUser = async () => {
        Swal.showLoading();
        try {
            let finalImageUrl = selectedUser.profileImage;
            
            if (selectedImageFile) {
                const uploadRes = await uploadUserImage(selectedImageFile);
                finalImageUrl = uploadRes.imageUrl;
            }

            const updatedData = { ...selectedUser, profileImage: finalImageUrl };
            await updateUser(selectedUser.id, updatedData);
            
            Swal.fire('สำเร็จ', 'อัปเดตข้อมูลพนักงานเรียบร้อย', 'success');
            setIsEditMode(false);
            fetchUsersData(); 
        } catch (error) {
            console.error(error);
            Swal.fire('ผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลได้', 'error');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        Swal.showLoading();
        try {
            let finalImageUrl = '';
            
            if (selectedImageFile) {
                const uploadRes = await uploadUserImage(selectedImageFile);
                finalImageUrl = uploadRes.imageUrl;
            }

            const passwordToSave = newUser.password || newUser.phone;
            const userDataToSave = { ...newUser, profileImage: finalImageUrl, password: passwordToSave };
            await createUser(userDataToSave);
            
            Swal.fire('สำเร็จ', 'เพิ่มพนักงานใหม่เรียบร้อย', 'success');
            setIsAddModelOpen(false);
            fetchUsersData();
        } catch (error) {
            console.error(error);
            Swal.fire('ผิดพลาด', error.response?.data?.message || 'ไม่สามารถเพิ่มพนักงานได้', 'error');
        }
    };

    const handleFireUser = (user) => {
        Swal.fire({
            title: 'ยืนยันการพ้นสภาพ?',
            html: `คุณแน่ใจหรือไม่ที่จะเปลี่ยนสถานะของ <b>${user.firstName} ${user.lastName}</b> เป็นพ้นสภาพพนักงาน (LEAVE)?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, เปลี่ยนสถานะ!',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.showLoading();
                try {
                    await deleteUser(user.id);
                    Swal.fire('สำเร็จ!', 'พนักงานถูกเปลี่ยนสถานะเรียบร้อยแล้ว', 'success');
                    fetchUsersData();
                } catch (error) {
                    console.error(error);
                    Swal.fire('ผิดพลาด', 'ไม่สามารถเปลี่ยนสถานะได้', 'error');
                }
            }
        });
    };

    return(
        <div className="min-h-screen p-8">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

            {/* --- HEADER --- */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
                <button 
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-primary hover:bg-secondary text-black px-4 py-2 rounded-lg transition-colors shadow-sm"
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
                        placeholder="ค้นหาชื่อ นามสกุล อีเมล รหัสพนักงาน หรือตำแหน่ง..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-background rounded-lg focus:outline-none focus:border-primary" 
                    />
                </div>
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg px-4 py-2 bg-background focus:outline-none"
                >
                    <option value="ทั้งหมด">สถานะ: ทั้งหมด</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="LEAVE">LEAVE</option>
                </select>
            </div>

            {/* --- USER TABLE/LIST --- */}
            <div className="bg-other rounded-2xl p-6 shadow-sm mb-8">
                <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-sm font-semibold text-gray-600">
                    <div className="col-span-4">ชื่อ-นามสกุล</div>
                    <div className="col-span-3">รหัสพนักงาน</div>
                    <div className="col-span-2">ตำแหน่ง</div>
                    <div className="col-span-2">สถานะ</div>
                    <div className="col-span-1 text-center">จัดการ</div>
                </div>

                <div className="space-y-2 mt-4">
                    {loading ? (
                        <div className="text-center text-gray-400 py-10">กำลังโหลดข้อมูล...</div>
                    ) : (users || [])
                        .filter(user => {
                            // เช็กสถานะ (ACTIVE/LEAVE)
                            const matchStatus = statusFilter === 'ทั้งหมด' || user.status === statusFilter;

                            // แปลงคำค้นหาเป็นพิมพ์เล็กทั้งหมดเพื่อไม่ให้สนใจตัวพิมพ์เล็ก/ใหญ่
                            const q = searchQuery.toLowerCase();

                            // เช็กว่าคำค้นหาตรงกับฟิลด์ไหนบ้าง
                            const matchSearch =
                                (user.firstName && user.firstName.toLowerCase().includes(q)) ||
                                (user.lastName && user.lastName.toLowerCase().includes(q)) ||
                                (user.email && user.email.toLowerCase().includes(q)) ||
                                (user.id && user.id.toLowerCase().includes(q)) ||
                                (user.role && user.role.toLowerCase().includes(q));

                                // ต้องผ่านทั้งเงื่อนไขสถานะ และเงื่อนไขการค้นหา
                                return matchStatus && matchSearch
                        })
                        .map(user => (
                            <div key={user.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-50 last:border-0 hover:bg-background transition-colors">
                                <div className="col-span-4 flex items-center gap-3">
                                    <img src={user.profileImage || "https://via.placeholder.com/40"} alt="profile" className="w-10 h-10 bg-gray-200 rounded-full object-cover shrink-0 border border-gray-200" />
                                    <div>
                                        <div className="font-medium text-gray-800">{user.firstName} {user.lastName}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                                <div className="col-span-3 text-gray-600">{user.id}</div>
                                <div className="col-span-2 text-gray-600">{user.role}</div>
                                <div className="col-span-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.status}
                                    </span>
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <button onClick={() => handleViewDetail(user)} className="p-2 bg-background hover:bg-white rounded-lg text-gray-600 shadow-sm transition-colors border border-gray-100">
                                        <Eye size={18} />
                                    </button>
                                    {user.id !== currentUser.id && user.status !== 'LEAVE' && (
                                        <button
                                            onClick={() => handleFireUser(user)}
                                            className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 shadow-sm transition-colors border border-red-100" 
                                            title="ไล่ออก"
                                        >
                                            <UserMinus size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                    ))}
                </div>
            </div>

            {/* --- POPUP ดูรายละเอียด & แก้ไข (User Details) --- */}
            {isDetailModelOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-background rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-other shrink-0">
                            <h2 className="text-xl font-bold text-gray-800">รายละเอียดพนักงาน</h2>
                            <div className="flex gap-2">
                                {!isEditMode ? (
                                    <button onClick={() => setIsEditMode(true)} className="px-4 py-2 flex gap-2 items-center text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                        <Edit size={16} /> แก้ไขข้อมูล
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        {/* 🚨 เพิ่มปุ่มยกเลิกตรงนี้ */}
                                        <button 
                                            onClick={() => {
                                                setIsEditMode(false);
                                                // คืนค่าข้อมูลกลับเป็นตัวออริจินัลก่อนแก้
                                                const originalUser = users.find(u => u.id === selectedUser.id);
                                                setSelectedUser({...originalUser});
                                                resetImageState();
                                            }} 
                                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                        >
                                            ยกเลิก
                                        </button>
                                        <button onClick={handleUpdateUser} className="px-4 py-2 flex gap-2 items-center text-sm font-medium text-black bg-primary rounded-lg hover:bg-secondary transition">
                                            <Save size={16} /> บันทึกการแก้ไข
                                        </button>
                                    </div>
                                )}
                                <button onClick={() => setIsDetailModelOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-auto flex-1 space-y-8">
                            <div className="flex gap-6 items-start">
                                <div className="flex flex-col items-center gap-3 shrink-0">
                                    <div onClick={handleImageClick} className={`relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 ${isEditMode ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity flex items-center justify-center group`}>
                                        <img src={imagePreview || selectedUser.profileImage || "https://via.placeholder.com/150"} alt="Profile" className="w-full h-full object-cover" />
                                        {isEditMode && (
                                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ImagePlus size={24} />
                                                <span className="text-xs mt-1">เปลี่ยนรูป</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-2 gap-4 bg-other p-5 rounded-xl border border-gray-100">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">รหัสพนักงาน</label>
                                        <div className="font-medium text-gray-900">{selectedUser.id}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">ชื่อ-นามสกุล</label>
                                        <div className="font-medium text-gray-900">{selectedUser.prefix}{selectedUser.firstName} {selectedUser.lastName}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">อีเมล</label>
                                        <div className="font-medium text-gray-900">{selectedUser.email}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">กรุ๊ปเลือด</label>
                                        <div className="font-medium text-gray-900">{selectedUser.bloodGroup || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">ตั้งค่าระบบ & ติดต่อ</h3>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท (Role)</label>
                                        <select 
                                            /* ปิดการแก้ไข Role ถ้าคนที่ถูกแก้เป็น Manager (ป้องกันตัวเองหรือแก้แอดมินคนอื่น) */
                                            disabled={!isEditMode || selectedUser.role === 'Manager'} 
                                            value={selectedUser.role}
                                            onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                                            className={`w-full p-2.5 border rounded-lg outline-none ${(!isEditMode || selectedUser.role === 'Manager') ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary'}`}
                                        >
                                            <option value="Staff">Staff</option>
                                            {/* พิ่มบรรทัดนี้กลับมา เพื่อให้มันแสดงผลและเลือกได้ */}
                                            <option value="Manager">Manager</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                                        <select disabled={!isEditMode} value={selectedUser.status} onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})} className={`w-full p-2.5 border rounded-lg outline-none ${isEditMode ? 'bg-white border-gray-300 focus:border-primary' : 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'}`}>
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="LEAVE">LEAVE</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่ (ทิ้งว่างหากไม่ต้องการเปลี่ยน)</label>
                                        <div className="relative">
                                            <input 
                                                type={showEditPassword ? "text" : "password"}
                                                disabled={!isEditMode}
                                                onChange={(e) => setSelectedUser({...selectedUser, password: e.target.value})}
                                                placeholder={isEditMode ? "กรอกรหัสผ่านใหม่เพื่อทำการเปลี่ยน" : "********"}
                                                className={`w-full p-2.5 pr-10 border rounded-lg outline-none ${isEditMode ? 'bg-white border-gray-300 focus:border-primary' : 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed' }`}
                                            />
                                            {/* ปุ่มสลับรหัสผ่าน (จะกดได้ก็ต่อเมื่ออยู่ในโหมดแก้ไข) */}
                                            <button 
                                                type="button" 
                                                onClick={() => setShowEditPassword(!showEditPassword)} 
                                                disabled={!isEditMode}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isEditMode ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
                                            >
                                                {showEditPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-5 bg-other rounded-xl border border-gray-200">
                                    <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">ผู้ติดต่อฉุกเฉิน</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">ชื่อ-นามสกุล</label>
                                            <input type="text" disabled={!isEditMode} value={selectedUser.emergencyContact?.name || ''} onChange={(e) => setSelectedUser({...selectedUser, emergencyContact: {...selectedUser.emergencyContact, name: e.target.value}})} className={`w-full p-2.5 text-sm border rounded-lg outline-none ${isEditMode ? 'bg-white border-gray-300 focus:border-primary'  : 'bg-transparent border-gray-200 text-gray-500 cursor-not-allowed' }`} />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">เบอร์โทรศัพท์</label>
                                            <input type="text" disabled={!isEditMode} value={selectedUser.emergencyContact?.phone || ''} onChange={(e) => setSelectedUser({...selectedUser, emergencyContact: {...selectedUser.emergencyContact, phone: e.target.value}})} className={`w-full p-2.5 text-sm border rounded-lg outline-none ${isEditMode ? 'bg-white border-gray-300 focus:border-primary' : 'bg-transparent border-gray-200 text-gray-500 cursor-not-allowed'}`} />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">เบอร์โทรศัพท์</label>
                                            <input type="text" disabled={!isEditMode} value={selectedUser.emergencyContact?.relationship || ''} onChange={(e) => setSelectedUser({...selectedUser, emergencyContact: {...selectedUser.emergencyContact, relationship: e.target.value}})} className={`w-full p-2.5 text-sm border rounded-lg outline-none ${isEditMode ? 'bg-white border-gray-300 focus:border-primary' : 'bg-transparent border-gray-200 text-gray-500 cursor-not-allowed'}`} />
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
                    <div className="bg-background rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
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

                        <div className="p-6 overflow-auto flex-1">
                            <form id="addUserForm" onSubmit={handleCreateUser} className="space-y-6">
                                
                                <div className="flex flex-col items-center justify-center mb-6">
                                    <div onClick={handleImageClick} className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 cursor-pointer hover:border-primary transition-colors flex items-center justify-center group shadow-sm">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-gray-400 flex flex-col items-center">
                                                <ImagePlus size={32} />
                                                <span className="text-xs mt-2 font-medium">เพิ่มรูปภาพ</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ImagePlus size={24} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-32 shrink-0">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า <span className="text-red-500">*</span></label>
                                        <select value={newUser.prefix} onChange={(e) => setNewUser({...newUser, prefix: e.target.value})} required className="w-full p-2.5 border bg-other border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                                            <option value="" disabled>เลือก</option>
                                            <option value="นาย">นาย</option>
                                            <option value="นาง">นาง</option>
                                            <option value="นางสาว">นางสาว</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อจริง <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="ชื่อจริง" required value={newUser.firstName} onChange={(e) => setNewUser({...newUser, firstName: e.target.value})} className="w-full p-2.5 border bg-other border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="นามสกุล" required value={newUser.lastName} onChange={(e) => setNewUser({...newUser, lastName: e.target.value})} className="w-full p-2.5 border bg-other border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล <span className="text-red-500">*</span></label>
                                        <input type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} placeholder="example@company.com" className="w-full bg-other p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน (ตั้งต้น)</label>
                                        <div className="relative">
                                            <input 
                                                type={showAddPassword ? "text" : "password"}
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                                placeholder="หากเว้นว่าง จะใช้เบอร์โทรเป็นรหัสผ่าน"
                                                className="w-full bg-other p-2.5 pr-10 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowAddPassword(!showAddPassword)} 
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showAddPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                                        <input type="tel" required value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} placeholder="0812345678" className="w-full p-2.5 bg-other border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">เลขบัตรประชาชน <span className="text-red-500">*</span></label>
                                        <input type="text" required value={newUser.idCard} onChange={(e) => setNewUser({...newUser, idCard: e.target.value})} placeholder="1234567890123" className="w-full p-2.5 bg-other border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท <span className="text-red-500">*</span></label>
                                        <select 
                                            value={newUser.role} 
                                            onChange={(e) => setNewUser({...newUser, role: e.target.value})} 
                                            className="w-full p-2.5 border border-gray-300 rounded-lg bg-other outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="Staff">Staff</option>
                                            <option value="Manager">Manager</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">กรุ๊ปเลือด</label>
                                        <select value={newUser.bloodGroup} onChange={(e) => setNewUser({...newUser, bloodGroup: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg bg-other outline-none focus:ring-2 focus:ring-primary">
                                            <option value="">เลือกกรุ๊ปเลือด</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="AB">AB</option>
                                            <option value="O">O</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-other p-5 rounded-xl border border-gray-200 mt-2">
                                    <h3 className="font-semibold text-gray-800 mb-4">ข้อมูลผู้ติดต่อฉุกเฉิน</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-700 font-medium mb-1">ชื่อ-นามสกุล</label>
                                            <input type="text" value={newUser.emergencyContact.name} onChange={(e) => setNewUser({...newUser, emergencyContact: {...newUser.emergencyContact, name: e.target.value}})} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-700 font-medium mb-1">เบอร์โทรศัพท์</label>
                                            <input type="text" value={newUser.emergencyContact.phone} onChange={(e) => setNewUser({...newUser, emergencyContact: {...newUser.emergencyContact, phone: e.target.value}})} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-700 font-medium mb-1">ความสัมพันธ์</label>
                                            <input type="text" value={newUser.emergencyContact.relationship} onChange={(e) => setNewUser({...newUser, emergencyContact: {...newUser.emergencyContact, relationship: e.target.value}})} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-primary" />
                                        </div>
                                    </div>
                                </div>

                            </form>
                        </div>

                        <div className="p-4 bg-other border-t border-gray-200 flex justify-end gap-3 shrink-0">
                            <button type="button" onClick={() => setIsAddModelOpen(false)} className="px-6 py-2.5 rounded-lg font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition">
                                ยกเลิก
                            </button>
                            <button type="submit" form="addUserForm" className="px-6 py-2.5 rounded-lg font-medium text-black bg-primary hover:bg-secondary transition shadow-sm">
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