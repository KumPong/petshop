import { useState, useEffect } from "react";
import CustomerSidebar from "../../components/customerSidebar";
import { getUserAddresses, updateUserAddresses } from '../../services/auth.service';
import Swal from "sweetalert2";

function Address() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAddress, setNewAddress] = useState({ fullName: '', street: '', city: '', postalCode: '', phone: ''})

    const [editingId, setEditingId] = useState(null);

    // ดึงข้อมูลจาก Backend ตอนเปิดหน้า
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }
                const data = await getUserAddresses(token);
                setAddresses(data);
            } catch (error) {
                console.error("Failed to fetch addresses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, []);

    // ฟังก์ชันซิงค์ข้อมูลกับ Backend
    const syncAddressesToBackend = async (updatedAddresses) => {
        try {
            const token = sessionStorage.getItem('token');
            await updateUserAddresses(token, updatedAddresses)
            setAddresses(updatedAddresses);
        } catch (error) {
            console.error(error);
            Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
        }
    };

    // ฟังก์ชันสำหรับเปิด Pop-up เพื่อ "เพิ่มที่อยู่ใหม่"
    const handleAddNewClick = () => {
        setEditingId(null);
        setNewAddress({ fullName: '', street: '', city: '', postalCode: '', phone: '' });
        setIsModalOpen(true);
    };

    // ฟังก์ชันสำหรับเปิด Pop-up เพื่อ "แก้ไขที่อยู่เดิม"
    const handleEditClick = (addr) => {
        setEditingId(addr.id);
        setNewAddress(addr);
        setIsModalOpen(true);
    };

    // ฟังก์ชันสำหรับเซฟข้อมูลจากฟอร์ม
    const handleSaveAddress = async (e) => {
        e.preventDefault();

        if (!newAddress.fullName.trim() || !newAddress.street.trim() || !newAddress.city.trim() || !newAddress.postalCode.trim() || !newAddress.phone.trim()) {
            Swal.fire({ icon: 'warning', title: 'ข้อมูลไม่ครบถ้วน', text: 'กรุณากรอกข้อมูลที่อยู่ให้ครบทุกช่อง', confirmButtonColor: '#4A5D23', confirmButtonText: 'ตกลง' });
            return;
        }

        let updatedStored = [...addresses];

        if (editingId) {
            updatedStored = updatedStored.map(addr => 
                addr.id === editingId ? { ...newAddress, id: editingId, isDefault: addr.isDefault } : addr
            );
            await syncAddressesToBackend(updatedStored);
            Swal.fire('สำเร็จ', 'อัปเดตที่อยู่เรียบร้อย', 'success');
        } else {
            const newEntry = { ...newAddress, id: Date.now(), isDefault: updatedStored.length === 0 };
            updatedStored.push(newEntry);
            await syncAddressesToBackend(updatedStored);
            Swal.fire('สำเร็จ', 'เพิ่มที่อยู่ใหม่เรียบร้อย', 'success');
        }

        setIsModalOpen(false);
        setNewAddress({ fullName: '', street: '', city: '', postalCode: '', phone: '' });
        setEditingId(null);
    }

    const handleDeleteAddress = (idToDelete) => {
        Swal.fire({
            title: 'ยืนยันการลบ',
            text: 'คุณแน่ใจหรือไม่ว่าต้องการลบที่อยู่นี้?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบเลย',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                let updatedAddresses = addresses.filter(addr => addr.id !== idToDelete);
                if (updatedAddresses.length > 0 && !updatedAddresses.some(addr => addr.isDefault)) {
                    updatedAddresses[0].isDefault = true;
                }

                await syncAddressesToBackend(updatedAddresses);
                Swal.fire('ลบแล้ว!', 'ที่อยู่ถูกลบเรียบร้อย', 'success');
            }
        })
    };

    const handleSetDefault = async (idToDefault) => {
        const updatedAddresses = addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === idToDefault
        }));
        await syncAddressesToBackend(updatedAddresses);
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex justify-center items-center text-gray-500">
                กำลังโหลดข้อมูลที่อยู่...
            </div>
        );
    }

    return(
        <div className="max-w-7xl mx-auto px-4 py-4 w-full flex gap-8 min-h-[70vh]">
            <div className="w-1/4">
                <CustomerSidebar/>
            </div>

            <div className="w-3/4">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-black mb-1">ที่อยู่ของฉัน</h2>
                        <p className="text-gray-600">จัดการที่อยู่สำหรับการจัดส่งของคุณ</p>
                    </div>
                    <button onClick={handleAddNewClick} className="bg-primary hover:bg-secondary text-black font-medium py-2 px-4 rounded-lg transition">
                        + เพิ่มที่อยู่ใหม่
                    </button>
                </div>

                <div className="space-y-4">
                    {addresses.length === 0 ? (
                        <div className="bg-other p-10 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
                            คุณยังไม่ได้เพิ่มที่อยู่จัดส่งสินค้า
                        </div>
                    ) : (
                        addresses.map((addr) => (
                            <div key={addr.id} className={`bg-other p-6 rounded-2xl shadow-sm border flex flex-col gap-4 ${addr.isDefault ? 'border-primary' : 'border-gray-100'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg text-black">{addr.fullName}</h3>
                                            <span className="text-gray-700">{addr.phone}</span>
                                            {addr.isDefault && <span className="px-2 py-0.5 bg-primary text-gray-black text-sm rounded-full font-medium">ค่าเริ่มต้น</span>}
                                        </div>
                                        <p className="text-gray-600 text-sm max-w-2xl">{addr.street} {addr.city} {addr.postalCode}</p>
                                    </div>
                                    <div className="text-sm">
                                        <button onClick={() => handleEditClick(addr)} className="text-gray-700 hover:text-black hover:underline">แก้ไข</button>
                                        {!addr.isDefault && (
                                            <>
                                                <span className="mx-2 text-gray-300">|</span>
                                                <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 hover:text-red-700">ลบ</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end mt-2">
                                    <button onClick={() => handleSetDefault(addr.id)} className={`px-4 py-2 text-sm rounded-lg border transition-colors ${addr.isDefault ? 'border-gray-200 text-gray-700 cursor-not-allowed' : 'border-gray-200 text-gray-700 hover:bg-background'}`} disabled={addr.isDefault}>
                                        ตั้งเป็นค่าเริ่มต้น
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-other p-6 rounded-2xl shadow-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">{editingId ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}</h3>
                        <form onSubmit={handleSaveAddress} className="space-y-4">
                            <input required placeholder="ชื่อ-นามสกุล" value={newAddress.fullName} onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})} className="w-full px-4 py-2 border border-gray-100 rounded-lg bg-background" />
                            <input required placeholder="ที่อยู่ (บ้านเลขที่, ถนน)" value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} className="w-full px-4 py-2 border border-gray-100 rounded-lg bg-background" />
                            <input required placeholder="จังหวัด" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="w-full px-4 py-2 border border-gray-100 rounded-lg bg-background" />
                            <input required placeholder="รหัสไปรษณีย์" value={newAddress.postalCode} onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})} className="w-full px-4 py-2 border border-gray-100 rounded-lg bg-background" />
                            <input required placeholder="เบอร์โทรศัพท์" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-100 rounded-lg bg-background" />
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => {setIsModalOpen(false); setNewAddress({ fullName: '', street: '', city: '', postalCode: '', phone: '' }); setEditingId(null);}} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">ยกเลิก</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-black rounded-lg">บันทึก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Address;