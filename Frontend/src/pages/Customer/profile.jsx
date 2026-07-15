import { useState, useEffect } from "react";
import CustomerSidebar from "../../components/customerSidebar";
import { getUserProfile, updateUserProfile, uploadProfileImage } from "../../services/auth.service";
import Swal from "sweetalert2";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // State Edit
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = sessionStorage.getItem('token')
                if (!token) {
                    setLoading(false);
                    return;
                }

                // API User
                const data = await getUserProfile(token);

                const profileData = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email, // ดึง email มา
                    phone: data.phone || 'ยังไม่ได้ระบุ',
                    profileImage: data.profileImage
                };

                setProfile(profileData);
                setFormData(profileData);

            } catch (error) {
                console.error("Error fetching profile", error);
                const localUser = JSON.parse(sessionStorage.getItem('user')) || {};
                const fallbackData = {
                    firstName: localUser.firstName || 'ผู้ใช้งาน',
                    lastName: localUser.lastName || 'ทั่วไป',
                    email: localUser.email || 'ไม่ระบุอีเมล',
                    phone: localUser.phone || 'ยังไม่ได้ระบุ',
                    profileImage: localUser.profileImage
                };
                setProfile(fallbackData);
                setFormData(fallbackData);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // ฟังก์ชันจัดการการพิมพ์ข้อมูล
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    // ฟังก์ชันบันทึกข้อมูล
    const handleSave = async () => {
        // เพิ่ม Validation เช็กว่าชื่อและนามสกุลว่างเปล่า (หรือพิมพ์แค่ Spacebar) หรือไม่
        if(!formData.firstName?.trim() || !formData.lastName?.trim()) {
            Swal.fire({
                icon: 'warning',
                tile: 'ข้อม๔ลไม่ครบถ้วน',
                text: 'กรุณากรอกชื่อและนามสกุลให้เรียบร้อยก่อนบันทึก',
                confirmButtonColor: '#4A5D23',
                confirmButtonText: 'ตกลง'
            });
            return; // สั่ง return เพื่อหยุดการทำงานตรงนี้ ระบบจะไม่บันทึกข้อมูลข้างล่างต่อ
        }

        try {
            const token = sessionStorage.getItem('token');
            if (!token) return;

            await updateUserProfile(token, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone
            });

            setProfile(formData);
            setIsEditing(false);

            // อัปเดตข้อมูลลง LocalStorage เผื่อหน้าอื่นดึงไปใช้
            const localUser = JSON.parse(sessionStorage.getItem('user')) || {};
            sessionStorage.setItem('user', JSON.stringify({ ...localUser, ...formData }));

            Swal.fire({
                icon: 'success',
                title: 'อัปเดตข้อมูลสำเร็จ',
                showConfirmButton: false,
                timer: 1500

            });
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
            });
        }
    };

    const handleCancel = () => {
        setFormData(profile); // คืนค่าเดิม
        setIsEditing(false);
    };

    const handleEditProfileImage = () => {
        Swal.fire({
            title: 'เปลี่ยนรูปโปรไฟล์',
            text: 'คุณต้องการอัปโหลดรูปจากเครื่อง หรือใส่ลิงก์รูปภาพ?',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'อัปโหลดรูป',
            denyButtonText: 'ใส่ลิงก์',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            try {
                const token = sessionStorage.getItem('token');
                if (result.isConfirmed) {
                    // เลือกไฟล์จากเครื่อง
                    const { value: file } = await Swal.fire({
                        title: 'เลือกรูปภาพ',
                    input: 'file',
                    inputAttributes: { accept: 'image/*', 'aria-label': 'Upload your profile picture' }
                    });

                    if (file) {
                        Swal.showLoading();
                        const data = await uploadProfileImage(file);
                        await updateUserProfile(token, { profileImage: data.imageUrl });
                        setProfile(prev => ({...prev, profileImage: data.imageUrl}));
                        
                        // เซฟลง LocalStorage และตะโกนบอก Navbar ให้เปลี่ยนรูป!
                        const localUser = JSON.parse(sessionStorage.getItem('user')) || {};
                        localUser.profileImage = data.imageUrl;
                        sessionStorage.setItem('user', JSON.stringify(localUser));
                        window.dispatchEvent(new Event('profileUpdated'));

                        Swal.fire('สำเร็จ', 'อัปเดตอัปโหลดรูปภาพแล้ว', 'success');
                    }
                } else if (result.isDenied) {
                    // ใส่เป็น url
                    const { value: url } = await Swal.fire({
                        input: 'url',
                        inputLabel: 'ลิงก์รูปภาพ',
                        inputPlaceholder: 'https://example.com/image.png'
                    });

                    if (url) {
                        Swal.showLoading();
                        await updateUserProfile(token, { profileImage: url });
                        setProfile(prev => ({...prev, profileImage: url}));
                        
                        const localUser = JSON.parse(sessionStorage.getItem('user')) || {};
                        localUser.profileImage = url;
                        sessionStorage.setItem('user', JSON.stringify(localUser));
                        window.dispatchEvent(new Event('profileUpdated'));

                        Swal.fire('สำเร็จ', 'อัปเดตรูปภาพจากลิงก์แล้ว', 'success');
                    }
                }
            } catch (error) {
                console.error(error);
                Swal.fire('ผิดพลาด', 'ไม่สามารถเปลี่ยนรูปได้', 'error');
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex justify-center items-center text-gray-500">
                กำลังโหลดข้อมูล...
            </div>
        );
    }
    if (!profile) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                ไม่พบข้อมูลผู้ใช้
            </div>
        ) 
    } 

    return(
        <div className="max-w-7xl mx-auto px-4 py-4 w-full flex gap-8 min-h-[70vh]">
            <div className="w-1/4">
                <CustomerSidebar />
            </div>
            
            <div className="grow max-w-7xl mx-auto px-4 py-8 w-full flex gap-8">
                <div className="w-3/4 space-y-6">
                    {/* Head Card */}
                    <div className="bg-other p-6 rounded-2xl shadow-sm flex items-center gap-6 border border-gray-100">
                        <div className="relative">
                            <img 
                                src={profile.profileImage || "https://placehold.co/100"}
                                alt="Profile" 
                                className="w-24 h-24 rounded-full object-cover border-4 border-secondary" 
                            />
                            <button onClick={handleEditProfileImage} className="absolute bottom-0 right-0 bg-primary text-black p-1.5 rounded-full hover:bg-secondary transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-black">{profile.firstName} {profile.lastName}</h2>
                            <p className="text-gray-600">{profile.email}</p>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-other p-8 rounded-2xl shadow border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-black">ข้อมูลส่วนตัว</h3>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-black hover:text-gray-600 underline transition">แก้ไข</button>
                            ) : (
                                <div className="flex gap-3">
                                    <button onClick={handleCancel} className="text-sm font-medium text-gray-700 hover:text-gray-700 transition">ยกเลิก</button>
                                    <button onClick={handleSave} className="text-sm font-medium bg-primary text-black px-4 py-1.5 rounded-lg hover:bg-secondary transition">บันทึก</button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-gray-700 mb-2">ชื่อ</label>
                                {isEditing ? (
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-background border border-gray-200 px-4 py-2.5 rounded-lg text-black focus:ring-2 focus:ring-primary outline-none" />
                                ) : (
                                    <div className="w-full bg-background px-4 py-3 rounded-lg text-black">{profile.firstName}</div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-2">นามสกุล</label>
                                {isEditing ? (
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-background border border-gray-200 px-4 py-2.5 rounded-lg text-black focus:ring-2 focus:ring-primary outline-none" />
                                ) : (
                                    <div className="w-full bg-background px-4 py-3 rounded-lg text-black">{profile.lastName}</div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                                {isEditing ? (
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-background border border-gray-200 px-4 py-2.5 rounded-lg text-black focus:ring-2 focus:ring-primary outline-none" />
                                ) : (
                                    <div className="w-full bg-background px-4 py-3 rounded-lg text-black">{profile.phone}</div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-2">อีเมล</label>
                                {isEditing ? (
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-background border border-gray-200 px-4 py-2.5 rounded-lg text-black focus:ring-2 focus:ring-primary outline-none" />
                                ) : (
                                    <div className="w-full bg-background px-4 py-3 rounded-lg text-black">{profile.email}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;