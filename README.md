Markdown
# PetStop (เพ็ทสต็อป)
**Domain:** e-Commerce (ระบบร้านค้าออนไลน์สำหรับสัตว์เลี้ยงแบบครบวงจร)

## 📑 สารบัญ (Table of Contents)
1. [สมาชิกในกลุ่ม (Group Members)](#-สมาชิกในกลุ่ม-group-members)
2. [หลักการและเหตุผล (Rationale)](#-หลักการและเหตุผล-rationale)
3. [วัตถุประสงค์ของโครงงาน (Objectives)](#-วัตถุประสงค์ของโครงงาน-objectives)
4. [ขอบเขตของระบบ (System Scope)](#-ขอบเขตของระบบ-system-scope)
5. [User Personas (กลุ่มผู้ใช้งานเป้าหมาย)](#-user-personas-กลุ่มผู้ใช้งานเป้าหมาย)
6. [UI/UX Design & Prototype](#-uiux-design--prototype)
7. [Tech Stack (เครื่องมือและเทคโนโลยีที่ใช้)](#-tech-stack-เครื่องมือและเทคโนโลยีที่ใช้)
8. [แผนการดำเนินงาน (Work Plan)](#-แผนการดำเนินงาน-work-plan)
9. [Use Case Diagram](#️-use-case-diagram)
10. [Class Diagram](#️-class-diagram)
11. [Sequence Diagrams](#️-sequence-diagrams)
12. [System Architecture](#️-system-architecture)

---

## 👥 สมาชิกในกลุ่ม (Group Members)
* **67097950** อนันยศ ชัยชนะ (ปลานัย) - Project Manager, Infrastructure
* **67107433** ณัชพล วงศาจันทร์ (บอน) - Frontend, Backend
* **67115588** ธนกฤต เพ็ชรกำจัด (พี่นอร์ท) - Frontend, Backend

---

## 💡 หลักการและเหตุผล (Rationale)
ในปัจจุบัน ผู้คนนิยมเลี้ยงสัตว์เลี้ยงเพื่อเป็นเพื่อนคลายเหงามากขึ้น อย่างไรก็ตามผู้เลี้ยงสัตว์จำนวนมากมักประสบปัญหาข้อจำกัดด้านเวลาในการเดินทางไปซื้อสินค้าที่ร้านค้าโดยตรง หรือร้านค้าในพื้นที่อาจมีสินค้าไม่ครอบคลุมความต้องการ จากปัญหาดังกล่าว จึงมีแนวคิดที่จะพัฒนาเว็บไซต์สำหรับสินค้าพื้นฐานแบบครบวงจร

---

## 🎯 วัตถุประสงค์ของโครงงาน (Objectives)
1. เพื่อพัฒนาเว็บไซต์ที่เป็นศูนย์รวมสินค้าและอุปกรณ์สำหรับสัตว์เลี้ยงครบวงจร
2. เพื่อพัฒนาระบบจัดการข้อมูลสินค้าและระบบค้นหาที่ช่วยให้ผู้ใช้งานสามารถหาสินค้าที่ต้องการได้อย่างรวดเร็ว
3. เพื่ออำนวยความสะดวกและเพิ่มช่องทางในการเลือกสินค้าสำหรับสัตว์เลี้ยงให้แก่ผู้บริโภค

---

## ⚙️ ขอบเขตของระบบ (System Scope)

### ผู้ใช้งาน (Actors)
* ลูกค้า (Customer)
* พนักงาน (Staff)
* ผู้จัดการ (Manager / Admin)

### ความสามารถหลักของระบบ (Main Functions)
1. การจัดการสมาชิก (Register / Login)
2. การจัดการข้อมูลสินค้า (Product Management)
3. การค้นหาและแสดงรายละเอียดสินค้า (Search & View Products)
4. ระบบตะกร้าสินค้า (Shopping Cart)
5. ระบบสั่งซื้อสินค้า (Order Management)

---

## 🧑‍🤝‍🧑 User Personas (กลุ่มผู้ใช้งานเป้าหมาย)

### 1. ลูกค้า (Customer) - คุณสมชาย ใจดี
* **อายุ:** 32 ปี | **อาชีพ:** พนักงานบริษัท | **รายได้:** 35,000 บาท/เดือน
* **ความสนใจ:** สุขภาพสัตว์เลี้ยง, ของเล่นและเสื้อผ้าตามเทรนด์, ความสะดวกสบายในการช้อปปิ้ง
* **เป้าหมาย:** ต้องการซื้อของให้สัตว์เลี้ยงครบจบในเว็บเดียว ไม่ต้องแยกซื้อหลายร้าน และหาสินค้าที่ตรงกับสายพันธุ์/ช่วงวัยได้อย่างรวดเร็ว
* **ความต้องการ:** ระบบค้นหาที่ใช้งานง่าย (แยกหมวดหมา-แมวชัดเจน), ข้อมูลสินค้าละเอียด, ระบบชำระเงินที่ปลอดภัยและรวดเร็ว
* **Pain Point:** หาสินค้าเฉพาะเจาะจงยาก (เช่น อาหารแมวแต่มีอาหารหมาปนมา), ไม่มั่นใจไซส์เสื้อผ้า/ปลอกคอ, เสียเวลาเข้าหลายเว็บเพื่อซื้อของให้สัตว์หลายชนิด

### 2. พนักงาน (Staff) - คุณหญิง ใจดี
* **อายุ:** 25 ปี | **อาชีพ:** พนักงานรับออเดอร์ | **รายได้:** 18,000 บาท/เดือน
* **ความสนใจ:** การจัดระเบียบสินค้า, การบริการลูกค้า
* **เป้าหมาย:** จัดเตรียมสินค้าตามออเดอร์ให้รวดเร็ว ถูกต้อง (ไม่ผิดไซส์/รสชาติ) และให้คำแนะนำลูกค้าได้อย่างแม่นยำ
* **ความต้องการ:** ระบบจัดการออเดอร์ที่ใช้งานง่าย แสดงรายการแพ็กชัดเจน และระบบค้นหาสต็อกที่รวดเร็ว
* **Pain Point:** สินค้ามีรายละเอียดจุกจิกเยอะทำให้หยิบผิดง่าย, ลูกค้าทักมาถามหาสินค้าที่หมดไปแล้วทำให้เสียเวลาเช็ก

### 3. ผู้จัดการ (Admin) - คุณเดชา วิสัยทัศน์
* **อายุ:** 45 ปี | **อาชีพ:** เจ้าของร้าน All-in-one Pet Store | **รายได้:** 70,000 บาท/เดือน
* **ความสนใจ:** การบริหารคลังสินค้า, การวิเคราะห์ยอดขาย, พฤติกรรมคนรักสัตว์
* **เป้าหมาย:** บริหารจัดการสต็อกให้มีประสิทธิภาพสูงสุด และวิเคราะห์ข้อมูลเพื่อดูว่าสินค้าหมวดหมู่ไหนขายดีกว่ากัน
* **ความต้องการ:** ระบบจัดการสินค้าครบวงจร (เพิ่ม/แก้ไข/ลบ), ระบบรายงานสรุปยอดขายแยกตามหมวดหมู่ และรายงานสินค้าคงเหลือ
* **Pain Point:** จัดการสินค้าที่มีวันหมดอายุยาก (อาหารเปียก, ขนม), จำนวน SKU เยอะมากทำให้คุมสต็อกด้วยมือ (Manual) ได้ยาก

---

## 🎨 UI/UX Design & Prototype

🔗 **Figma Prototype:** [คลิกเพื่อดูการออกแบบ PetStop บน Figma](https://www.figma.com/design/By0aa0Ia9NAwNOilaYCD85/PetStop?node-id=135-411&t=6x1Jdpxown9icMEu-1)

### Color Palette (โทนสีที่ใช้)
* 🟩 `#CCD5AE` (สีเขียวอ่อน)
* 🟨 `#E0E5B6` (สีเหลืองมะนาวอ่อน)
* 🟧 `#FAEDCE` (สีครีมอ่อน)
* 🟨 `#FEFAE0` (สีเหลืองพาสเทล)

### Typography (แบบอักษร)
* **Font Family:** Promt

---

## 🧰 Tech Stack (เครื่องมือและเทคโนโลยีที่ใช้)

| หมวด | เทคโนโลยี | รายละเอียด |
| :--- | :--- | :--- |
| **Frontend** | React, HTML/CSS/JavaScript | พัฒนาส่วนแสดงผลและโต้ตอบกับผู้ใช้งาน |
| **Backend** | Node.js (Express.js) | จัดการระบบหลังบ้านและสร้าง API |
| **Database** | Local Storage (JSON) | ใช้เป็นที่จัดเก็บข้อมูลจำลองของระบบ |
| **Design** | Figma | ออกแบบ UI/UX และ Prototype |
| **Version Control** | Git, GitHub | จัดการการเปลี่ยนแปลงของโค้ดและทำงานร่วมกัน |

---

## 📅 แผนการดำเนินงาน (Work Plan: 4 Weeks)
| สัปดาห์ที่ (Week) | กิจกรรม (Activities) | รายละเอียดโดยย่อ (Brief Description) |
| :---: | :--- | :--- |
| **1** | **วิเคราะห์และออกแบบระบบ (Analysis & Design)** | รวบรวมความต้องการ วิเคราะห์ระบบและออกแบบโดยอิงจาก Persona, Usecase & Class Diagram ผ่านทาง Figma และตัว Wireframe |
| **2** | **พัฒนา Frontend (Frontend Development)** | UI/UX ที่ผู้ใช้สามารถเข้าใจและใช้งานง่าย ไปรับเชื่อมโดยจะมีพื้นฐานอย่าง Login, Product, Product Detail และ Payment |
| **3** | **พัฒนา Backend และฐานข้อมูล (Backend & Database Development)** | เชื่อมต่อ API ให้ตรงกับตัวของ Frontend แล้วก็เชื่อมโดยใช้ CORS และ Express.js |
| **4** | **ทดสอบระบบและนำเสนอผลงาน (Testing & Presentation)** | ตรวจสอบหาข้อผิดพลาดของระบบ (Bugs) ปรับปรุงแก้ไข และเตรียมเอกสารสำหรับนำเสนอโครงงาน |

---

## 🗝️ Use Case Diagram
flowchart LR
    %% Actors
    Customer([ลูกค้า - Customer])
    Staff([พนักงาน - Staff])
    Manager([ผู้จัดการ - Manager])

    %% Use Cases
    subgraph PetStop System Functions
        direction TB
        UC1(สมัครสมาชิก / เข้าสู่ระบบ)
        UC2(ค้นหาและดูรายละเอียดสินค้า)
        UC3(จัดการตะกร้าสินค้าและสั่งซื้อ)
        UC4(ชำระเงินและติดตามสถานะ)
        
        US1(ดูรายการและอัปเดตสถานะคำสั่งซื้อ)
        US2(จัดการสต็อกสินค้า)
        
        UM1(ดูแดชบอร์ดภาพรวมยอดขาย)
        UM2(จัดการสินค้าและหมวดหมู่)
        UM3(ดูรายงานผลประกอบการ)
    end

    %% Customer Links
    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4

    %% Staff Links
    Staff --> UC1
    Staff --> US1
    Staff --> US2

    %% Manager Links
    Manager --> UC1
    Manager --> UM1
    Manager --> UM2
    Manager --> UM3

---

## ⚙️ Class Diagram
classDiagram
    class User {
        +String id
        +String username
        +String password
        +String email
        +String role
        +login()
        +logout()
    }
    class Customer {
        +String address
        +String phone
        +viewProfile()
    }
    class Staff {
        +String position
        +manageOrder()
    }
    class Manager {
        +String department
        +viewDashboard()
    }
    User <|-- Customer
    User <|-- Staff
    User <|-- Manager

    class Product {
        +String productId
        +String name
        +Number price
        +String status
        +updateStock()
    }
    class Category {
        +String categoryId
        +String name
    }
    Product --> Category : belongs to

    class Order {
        +String orderId
        +String customerId
        +Number totalAmount
        +String status
        +calculateTotal()
    }
    class OrderItem {
        +String productId
        +Number quantity
        +Number unitPrice
    }
    Order *-- OrderItem : contains
    Customer "1" --> "0..*" Order : places

---

## 🔧 Sequence Diagrams
1. Customer
    sequenceDiagram
    actor Customer as ลูกค้า (Customer)
    participant UI as หน้าเว็บ React (Web UI)
    participant US as User Service (Node.js)
    participant PS as Product Service
    participant CS as Cart Service
    participant OS as Order Service
    participant DB as ฐานข้อมูล (JSON)

    %% เฟส 1: เข้าสู่ระบบ
    rect rgb(240, 248, 255)
        Customer->>UI: กรอก Email & Password
        UI->>US: login(email, password)
        US->>DB: ตรวจสอบข้อมูลใน users.json
        DB-->>US: คืนค่าข้อมูล User
        US-->>UI: ส่งสถานะ boolean (True) และข้อมูล Profile
        UI-->>Customer: เปลี่ยนหน้าจอเข้าสู่ระบบสำเร็จ
    end

    %% เฟส 2: ค้นหาสินค้า
    rect rgb(255, 250, 240)
        Customer->>UI: พิมพ์คำค้นหา (เช่น "อาหารแมว")
        UI->>PS: search(keyword, minPrice, maxPrice)
        PS->>DB: ดึงข้อมูลจาก products.json
        DB-->>PS: คืนค่าข้อมูลสินค้า
        PS-->>UI: คืนค่ากลับเป็น Array ของสินค้า
        UI-->>Customer: แสดงการ์ดสินค้าบนหน้าจอ
    end

    %% เฟส 3: หยิบใส่ตะกร้า
    rect rgb(240, 255, 240)
        Customer->>UI: กดปุ่ม "เพิ่มลงตะกร้า"
        UI->>CS: addItem(productId, qty)
        CS->>DB: บันทึกข้อมูลลง carts.json
        DB-->>CS: อัปเดตสำเร็จ
        CS-->>UI: คืนค่า boolean (True)
        UI-->>Customer: แสดง Popup แจ้งเตือน "เพิ่มสำเร็จ!"
    end

    %% เฟส 4: สั่งซื้อและชำระเงิน
    rect rgb(255, 240, 245)
        Customer->>UI: กดปุ่ม "ชำระเงิน" ในตะกร้า
        UI->>OS: calculateTotal()
        OS->>DB: ดึงราคาจากตะกร้ามาคำนวณ
        DB-->>OS: ยอดรวม
        OS-->>UI: คืนค่าราคาสุทธิเป็น Number
        UI-->>Customer: แสดงหน้าสรุปยอดและช่องทางจ่ายเงิน
        Customer->>UI: กดยืนยันการจ่ายเงิน (จำลอง)
        UI->>OS: confirmPayment(method, amount)
        OS-->>UI: คืนค่า boolean (True) ยืนยันว่าตัดเงินผ่าน
        UI->>OS: confirmOrder()
        OS->>DB: สร้างออเดอร์ใหม่ลง orders.json
        DB-->>OS: บันทึกสำเร็จ
        OS-->>UI: คืนค่า boolean (True)
        UI->>CS: clear() ตะกร้าสินค้า
        CS-->>UI: ล้างตะกร้าสำเร็จ
        UI-->>Customer: แสดงหน้า "ขอบคุณที่สั่งซื้อสินค้า"
    end

2. Staff
    sequenceDiagram
    actor Staff as พนักงาน (Staff)
    participant UI as หน้า Dashboard (React)
    participant US as User Service
    participant IS as Inventory Service
    participant OS as Order Service
    participant DB as ฐานข้อมูล (JSON)

    %% เฟส 1: การเข้าสู่ระบบ
    rect rgb(240, 248, 255)
        Staff->>UI: กรอก Email & Password
        UI->>US: login(email, password)
        US->>DB: ตรวจสอบสิทธิ์ใน users.json
        DB-->>US: คืนค่าข้อมูล (Role: Staff)
        US-->>UI: ส่งสถานะ boolean (True) และ Token
        UI-->>Staff: พาเข้าสู่หน้า Dashboard การจัดการ
    end

    %% เฟส 2: ตรวจสอบและอัปเดตสต็อก
    rect rgb(255, 250, 240)
        Staff->>UI: พิมพ์รหัสสินค้าเพื่อดูจำนวนคงเหลือ
        UI->>IS: ขอดูข้อมูลสต็อกปัจจุบัน
        IS->>DB: ดึงข้อมูลจาก inventory.json
        DB-->>IS: คืนค่าจำนวนสินค้า
        IS-->>UI: ส่งกลับเป็น Number (qtyOnHand)
        UI-->>Staff: แสดงตัวเลขสต็อกบนหน้าจอ
        Staff->>UI: กรอกจำนวนสินค้าที่รับเข้าโกดัง และกดบันทึก
        UI->>IS: adjustStock(qtyChange)
        IS->>DB: อัปเดตตัวเลขลง inventory.json
        DB-->>IS: บันทึกข้อมูลสำเร็จ
        IS-->>UI: คืนค่า boolean (True)
        UI-->>Staff: แสดง Popup แจ้งเตือน "อัปเดตสต็อกเรียบร้อย!"
    end

    %% เฟส 3: อัปเดตสถานะคำสั่งซื้อ
    rect rgb(240, 255, 240)
        Staff->>UI: กดเข้าเมนู "ออเดอร์ที่รอจัดส่ง"
        UI->>OS: ขอดึงรายการออเดอร์ทั้งหมด
        OS->>DB: กวาดข้อมูลจาก orders.json
        DB-->>OS: คืนค่าข้อมูลดิบ
        OS-->>UI: ส่งข้อมูลกลับเป็น Array ของออเดอร์
        UI-->>Staff: วาดตารางรายการสั่งซื้อของลูกค้า
        Staff->>UI: นำของใส่กล่อง และกดเปลี่ยนสถานะเป็น "จัดส่งแล้ว"
        UI->>OS: changeStatus(status)
        OS->>DB: อัปเดตสถานะออเดอร์ใน orders.json
        DB-->>OS: บันทึกสำเร็จ
        OS-->>UI: คืนค่า boolean (True)
        UI-->>Staff: แจ้งเตือน "อัปเดตสถานะออเดอร์เรียบร้อย"
    end

3. Manager
    sequenceDiagram
    actor Manager as ผู้จัดการ (Manager)
    participant UI as หน้า Dashboard (React)
    participant US as User Service
    participant PS as Product Service
    participant RS as Report Service
    participant DB as ฐานข้อมูล (JSON)

    %% เฟส 1: การเข้าสู่ระบบ
    rect rgb(240, 248, 255)
        Manager->>UI: กรอก Email & Password
        UI->>US: login(email, password)
        US->>DB: ตรวจสอบสิทธิ์ระดับบริหารใน users.json
        DB-->>US: คืนค่าข้อมูล (Role: Manager)
        US-->>UI: ส่งสถานะ boolean (True) และ Token
        UI-->>Manager: พาเข้าสู่หน้า Admin Dashboard
    end

    %% เฟส 2: การจัดการสินค้า
    rect rgb(255, 250, 240)
        Manager->>UI: กรอกข้อมูลสินค้าใหม่ (เช่น อาหารแมวสูตรใหม่)
        UI->>PS: มัดรวมข้อมูลส่งไปบันทึก
        PS->>DB: เพิ่มข้อมูลลง products.json
        DB-->>PS: บันทึกสำเร็จ
        PS-->>UI: คืนค่า boolean (True)
        UI-->>Manager: แจ้งเตือน "เพิ่มสินค้าใหม่ลงระบบเรียบร้อย"
    end

    %% เฟส 3: การสร้างรายงาน
    rect rgb(245, 240, 255)
        Manager->>UI: กดเมนู "ดูรายงานยอดขายและกำไร"
        UI->>RS: เรียกคำสั่ง generate() [คลาส SalesReport]
        RS->>DB: กวาดข้อมูลจาก orders.json
        DB-->>RS: ข้อมูลรายการสั่งซื้อทั้งหมด
        RS-->>UI: คืนค่าสถิติยอดขายเป็น Object
        
        UI->>RS: เรียกคำสั่ง generate() [คลาส InventoryReport]
        RS->>DB: กวาดข้อมูลจาก inventory.json
        DB-->>RS: ข้อมูลสต็อกสินค้าทั้งหมด
        RS-->>UI: คืนค่าสถิติสินค้าคงคลังเป็น Object
        
        UI-->>Manager: นำ Object มาวาดเป็นกราฟแท่งและกราฟวงกลมบน Dashboard
    end

---