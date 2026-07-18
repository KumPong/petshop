# PetStop (เพ็ทสต็อป)
**Domain:** e-Commerce (ระบบร้านค้าออนไลน์สำหรับสัตว์เลี้ยงแบบครบวงจร)

## 📑 สารบัญ (Table of Contents)
1. [สมาชิกในกลุ่ม (Group Members)](#group-members)
2. [หลักการและเหตุผล (Rationale)](#rationale)
3. [วัตถุประสงค์ของโครงงาน (Objectives)](#objectives)
4. [ขอบเขตของระบบ (System Scope)](#system-scope)
5. [แนวทางของการพัฒนาตาม SDLC (System Development Life Cycle)](#system-development-life-cycle)
6. [User Personas (กลุ่มผู้ใช้งานเป้าหมาย)](#user-personas)
7. [UI/UX Design & Prototype](#ui-ux)
8. [Tech Stack (เครื่องมือและเทคโนโลยีที่ใช้)](#tech-stack)
9. [แผนการดำเนินงาน (Work Plan)](#work-plan)
10. [Use Case Diagram](#use-case)
11. [Class Diagram](#class-diagram)
12. [Sequence Diagrams](#sequence-diagrams)
13. [System Architecture](#system-architecture)
14. [Wireframe](#wireframe)
15. [Data Schema](#data-schema)

---

## <a id="group-members"></a>👥 สมาชิกในกลุ่ม (Group Members)
* **67097950** อนันยศ ชัยชนะ (ปลานัย) - Project Manager, Infrastructure
* **67107433** ณัชพล วงศาจันทร์ (นอร์ท) - Frontend, Backend
* **67115588** ธนกฤต เพ็ชรกำจัด (บอน) - Frontend, Backend

---

## <a id="rationale"></a>💡 หลักการและเหตุผล (Rationale)
ในปัจจุบัน ผู้คนนิยมเลี้ยงสัตว์เลี้ยงเพื่อเป็นเพื่อนคลายเหงามากขึ้น อย่างไรก็ตามผู้เลี้ยงสัตว์จำนวนมากมักประสบปัญหาข้อจำกัดด้านเวลาในการเดินทางไปซื้อสินค้าที่ร้านค้าโดยตรง หรือร้านค้าในพื้นที่อาจมีสินค้าไม่ครอบคลุมความต้องการ จากปัญหาดังกล่าว จึงมีแนวคิดที่จะพัฒนาเว็บไซต์สำหรับสินค้าพื้นฐานแบบครบวงจร

---

## <a id="objectives"></a>🎯 วัตถุประสงค์ของโครงงาน (Objectives)
1. เพื่อพัฒนาเว็บไซต์ที่เป็นศูนย์รวมสินค้าและอุปกรณ์สำหรับสัตว์เลี้ยงครบวงจร
2. เพื่อพัฒนาระบบจัดการข้อมูลสินค้าและระบบค้นหาที่ช่วยให้ผู้ใช้งานสามารถหาสินค้าที่ต้องการได้อย่างรวดเร็ว
3. เพื่ออำนวยความสะดวกและเพิ่มช่องทางในการเลือกสินค้าสำหรับสัตว์เลี้ยงให้แก่ผู้บริโภค

---

## <a id="system-scope"></a>⚙️ ขอบเขตของระบบ (System Scope)

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
6. ระบบชำระเงิน (Simulation หรือ Mockup ได้)
7. ระบบติดตามสถานะคำสั่งซื้อ 
8. ระบบจัดการสินค้าและคำสั่งซื้อสำหรับผู้ดูแลระบบ
9. รานงานหรือ Dashboard สรุปข้อมูลเบื้องต้น

---

## <a id="system-development-life-cycle"></a>🧑‍💻 แนวทางของการพัฒนาตาม SDLC (System Development Life Cycle)

| ขั้นตอน (Phase) | รายละเอียดโดยย่อ (Brief Description) |
| :--- | :--- |
| **1. Planning** | กำหนดเป้าหมาย ขอบเขตการทำงานของเว็บ วางแผนระยะเวลา และแบ่งหน้าที่ในทีม |
| **2. Analysis** | วิเคราะห์ความต้องการโดยอิงจาก Persona, Usecase & Class Diagram |
| **3. Design** | ออกแบบ Frontend ด้วย Figma ออกแบบ Backend ด้วย System Architecture |
| **4. Development** | เขียนโค้ดสร้างระบบ ฐานข้อมูล ตามที่วิเคราะห์ |
| **5. Testing** | ทดสอบเครื่องมือต่างๆ และ ทดสอบด้วยมือ |
| **6. Deployment** | นำโค้ดขึ้น Production เพื่อเปิดให้ผู้ใช้งานจริงสามารถเข้าถึงได้ |
| **7. Maintenance** | ติดตามดูแลระบบ แก้ไขปัญหาที่เกิดขึ้นหลังจากการเปิดใช้งาน |

---

## <a id="user-personas"></a>🧑‍🤝‍🧑 User Personas (กลุ่มผู้ใช้งานเป้าหมาย)

### 1. ลูกค้า (Customer) - คุณ มิยาบิ 
* **อายุ:** 32 ปี | **อาชีพ:** พนักงานบริษัท | **รายได้:** 35,000 บาท/เดือน
* **ความสนใจ:** สุขภาพสัตว์เลี้ยง, ของเล่นและเสื้อผ้าตามเทรนด์, ความสะดวกสบายในการช้อปปิ้ง
* **เป้าหมาย:** ต้องการซื้อของให้สัตว์เลี้ยงครบจบในเว็บเดียว และสามารถค้นหาสินค้าที่ตรงกับความต้องการได้อย่างรวดเร็วผ่านตัวกรอง ราคา, ประเภท และสินค้าขายดี
* **ความต้องการ:** ระบบค้นหาสินค้าที่แม่นยำและแสดงรายละเอียดสินค้าชัดเจน, ช่องทางการชำระเงินที่สะดวกรองรับทั้งระบบออนไลน์ (Credit card / PromptPay),  สามารถติดตามสถานะคำสั่งซื้อและดูประวัติการสั่งซื้อย้อนหลังได้ด้วยตัวเอง
* **Pain Point:** หาสินค้าเฉพาะเจาะจงยาก เสียเวลาเข้าหลายเว็บ, ไม่มั่นใจรายละเอียดสินค้าก่อนซื้อ, และเว็บทั่วไปมักมีช่องทางการชำระเงินที่จำกัดหรือยุ่งยาก

### 2. พนักงาน (Staff) - คุณ ชาย
* **อายุ:** 25 ปี | **อาชีพ:** พนักงานรับออเดอร์ | **รายได้:** 23,000 บาท/เดือน
* **ความสนใจ:** ารจัดระเบียบสินค้า, การบริการลูกค้า, ความรวดเร็วในการทำงาน
* **เป้าหมาย:** จัดเตรียมสินค้าและแพ็กตามออเดอร์ได้อย่างถูกต้อง รวดเร็ว พร้อมทั้งอัปเดตสถานะให้ลูกค้าทราบได้ทันที
* **ความต้องการ:** ระบบที่สามารถดึงรายการออเดอร์ทั้งหมดมาดูเพื่อตรวจสอบและยืนยันคำสั่งซื้อได้ง่าย, สามารถกดยืนยันการอัปเดตสถานะเป็น "จัดส่งแล้ว" เข้าสู่ระบบฐานข้อมูล (orders.json) ได้ทันที, ระบบตรวจสอบและปรับปรุงสต็อก ที่ใช้งานง่ายและอัปเดตจำนวนสินค้าลงฐานข้อมูลได้รวดเร็ว
* **Pain Point:** ลูกค้าสั่งของที่หมดไปแล้วเพราะระบบตัดสต็อกไม่ทัน, สับสนกับรายการออเดอร์ที่ต้องจัดส่งเพราะไม่มีระบบจัดการสถานะที่ชัดเจน

### 3. ผู้จัดการ (Admin) - คุณ เดโช
* **อายุ:** 45 ปี | **อาชีพ:** เจ้าของร้าน All-in-one Pet Store | **รายได้:** 50,000 บาท/เดือน
* **ความสนใจ:** การบริหารคลังสินค้า, การวิเคราะห์ยอดขายเพื่อทำกำไร, พฤติกรรมคนรักสัตว์
* **เป้าหมาย:** บริหารจัดการสต็อกให้มีประสิทธิภาพสูงสุด และวิเคราะห์ข้อมูลภาพรวมของร้านเพื่อประกอบการตัดสินใจทางธุรกิจ
* **ความต้องการ:** หน้า Dashboard ที่แสดงภาพรวมทั้งหมด เช่น ยอดขายรวม, สินค้าขายดี, คำสั่งซื้อรอจัดส่ง และแจ้งเตือนสินค้าสต็อกใกล้หมด, ระบบจัดการแคตตาล็อกสินค้าที่สามารถ เพิ่ม แก้ไข และลบข้อมูลหมวดหมู่หรือตัวสินค้าได้ด้วยตนเอง, ระบบที่สามารถดึงข้อมูลมาสร้างรายงาน ทั้งรายงานยอดขาย (รายวัน/รายเดือน/รายไตรมาส), รายงานสินค้าคงเหลือ และรายงานผลประกอบการ โดยแสดงผลเป็นกราฟแท่งหรือกราฟวงกลมบนหน้าเว็บได้
* **Pain Point:** จำนวน SKU สินค้าเยอะมากทำให้คุมสต็อกด้วยมือยากและเกิดข้อผิดพลาด, ขาดข้อมูลสรุปยอดขายและกำไรที่เป็นรูปธรรมทำให้วางแผนธุรกิจได้ลำบาก
---

## <a id="ui-ux"></a>🎨 UI/UX Design & Prototype

### Color Palette (โทนสีที่ใช้)
* 🟩 `#CCD5AE` (สีเขียวอ่อน)
* 🟨 `#E0E5B6` (สีเหลืองมะนาวอ่อน)
* 🟧 `#FAEDCE` (สีครีมอ่อน)
* 🟨 `#FEFAE0` (สีเหลืองพาสเทล)

### Typography (แบบอักษร)
* **Font Family:** Promt

---

## <a id="tech-stack"></a>🧰 Tech Stack (เครื่องมือและเทคโนโลยีที่ใช้)

| หมวด | เทคโนโลยี | รายละเอียด |
| :--- | :--- | :--- |
| **Frontend** | React, HTML/CSS/JavaScript | พัฒนาส่วนแสดงผลและโต้ตอบกับผู้ใช้งาน |
| **Backend** | Node.js (Express.js) | จัดการระบบหลังบ้านและสร้าง API |
| **Database** | Local Storage (JSON) | ใช้เป็นที่จัดเก็บข้อมูลจำลองของระบบ |
| **Design** | Figma | ออกแบบ UI/UX และ Prototype |
| **Version Control** | Git, GitHub | จัดการการเปลี่ยนแปลงของโค้ดและทำงานร่วมกัน |

---

## <a id="work-plan"></a>📅 แผนการดำเนินงาน (Work Plan: 4 Weeks)
| สัปดาห์ที่ (Week) | กิจกรรม (Activities) | รายละเอียดโดยย่อ (Brief Description) |
| :---: | :--- | :--- |
| **1** | **วิเคราะห์และออกแบบระบบ (Analysis & Design)** | รวบรวมความต้องการ วิเคราะห์ระบบและออกแบบโดยอิงจาก Persona, Usecase & Class Diagram ผ่านทาง Figma และตัว Wireframe |
| **2** | **พัฒนา Frontend (Frontend Development)** | UI/UX ที่ผู้ใช้สามารถเข้าใจและใช้งานง่าย ไปรับเชื่อมโดยจะมีพื้นฐานอย่าง Login, Product, Product Detail และ Payment |
| **3** | **พัฒนา Backend และฐานข้อมูล (Backend & Database Development)** | เชื่อมต่อ API ให้ตรงกับตัวของ Frontend แล้วก็เชื่อมโดยใช้ CORS และ Express.js |
| **4** | **ทดสอบระบบและนำเสนอผลงาน (Testing & Presentation)** | ตรวจสอบหาข้อผิดพลาดของระบบ (Bugs) ปรับปรุงแก้ไข และเตรียมเอกสารสำหรับนำเสนอโครงงาน |

---

## <a id="use-case"></a>🗝️ Use Case Diagram

```mermaid
flowchart LR
    %% Actors
    Customer([Customer])
    Staff([Staff])
    Manager([Manager])

    %% Customer Subgraph
    subgraph Customer_Functions [ฟังก์ชั่นสำหรับลูกค้า]
        direction TB
        C1(สมัครสมาชิก)
        C2(เข้าสู่ระบบ)
        C3(ค้นหาสินค้า)
        C4(ดูรายละเอียดสินค้า)
        C5(เพิ่มสินค้าลงตะกร้า)
        C6("จัดการตะกร้าสินค้า<br/>(แก้ไข/ลบ/ดูรายการ)")
        C7(สั่งซื้อสินค้า)
        C8(ชำระเงิน)
        C9(ติดตามสถานะคำสั่งซื้อ)
        C10(ประวัติการสั่งซื้อ)
        
        C_Ext1("ตัวกรองการค้นหา<br/>- แบรนด์<br/>- ราคา<br/>- ประเภท")
        C_Ext2(ยืนยันคำสั่งซื้อ)
        C_Ext3(เลือกช่องทางชำระเงิน)
        
        C3 -.-> C_Ext1
        C7 -.-> C_Ext2
        C8 -.-> C_Ext3
    end

    %% External Services
    subgraph External_Services [บริการภายนอก]
        direction TB
        E1("ระบบชำระเงินออนไลน์<br/>(เช่น Credit card / PromptPay)")
        E2("ระบบขนส่ง<br/>(เช่น EMS / Kerry / Flash)")
    end
        
    C8 -.-> E1
    C9 -.-> E2

    %% Staff Subgraph
    subgraph Staff_Functions [ฟังก์ชั่นสำหรับพนักงาน]
        direction TB
        S1(เข้าสู่ระบบ)
        S2(ดูรายการคำสั่งซื้อ)
        S3(ตรวจสอบและยืนยันคำสั่งซื้อ)
        S4(จัดเตรียมสินค้า / แพ็คสินค้า)
        S5(อัพเดตสถานะคำสั่งซื้อ)
        S6(จัดการสต๊อกสินค้า)
    end

    %% Manager Subgraph
    subgraph Manager_Functions [ฟังก์ชั่นสำหรับเมเนเจอร์]
        direction TB
        M0(เข้าสู่ระบบ)
        M1("ดูแดชบอร์ดภาพรวม<br/>(Dashboard)<br/><br/>ยอดขายรวม<br/>สินค้าขายดี<br/>คำสั่งซื้อรอจัดส่ง<br/>สต๊อกใกล้หมด")
        M2("จัดการสินค้า<br/>(เพิ่ม / แก้ไข / ลบ)")
        M3("จัดการหมวดหมู่สินค้า<br/>(เพิ่ม / แก้ไข / ลบ)")
        M4("จัดการผู้ใช้ระบบ<br/>(เพิ่ม / แก้ไข / ลบ)")
        M5("รายงานยอดขาย<br/>(รายวัน / รายเดือน / รายไตรมาส)")
        M6(รายงานสินค้าคงเหลือ)
        
        M1 -.-> M2
        M1 -.-> M3
        M1 -.-> M4
        M1 -.-> M5
        M1 -.-> M6
    end

    %% Actor Connections
    Customer --> C1 & C2 & C3 & C4 & C5 & C6 & C7 & C8 & C9 & C10
    Staff --> S1 & S2 & S3 & S4 & S5 & S6
    Manager --> M1 & M0
```

---

## <a id="class-diagram"></a>⚙️ Class Diagram

```mermaid
---
config:
  layout: elk
---
classDiagram
    direction TB
    %% ระบบจัดเก็บเป็นไฟล์ JSON (Backend/data) — ไม่มี "คลาส" จริงในโค้ด
    %% ไดอะแกรมนี้จำลองโครงสร้างข้อมูล (entity/DTO) ตามไฟล์จริง ส่วนตรรกะ (login/สร้างออเดอร์/รายงาน)
    %% อยู่ใน Express controllers ไม่ใช่ method ของ entity

    class User {
        +String id
        +String role
        +String firstName
        +String lastName
        +String email
        +String phone
        +String password
        +String status
        +String profileImage
        +String prefix
        +String idCard
        +String bloodGroup
        +EmergencyContact emergencyContact
        +List~Address~ addresses
        +register(userData) User
        +login(email, password) token
        +getProfile() User
        +updateProfile(newData) User
        +changePassword(oldPass, newPass) boolean
        +getAddresses() List~Address~
        +updateAddresses(addresses) List~Address~
        +getAllUsers() List~User~
        +createUser(userData) User
        +updateUser(id, data) User
        +deleteUser(id) boolean
    }

    class EmergencyContact {
        +String name
        +String phone
        +String relationship
    }
    class Address {
        +Number id
        +String fullName
        +String street
        +String city
        +String postalCode
        +String phone
        +Boolean isDefault
    }
    User "1" *-- "0..1" EmergencyContact : embeds
    User "1" *-- "0..*" Address : embeds

    class Product {
        +String productId
        +String name
        +String description
        +Number price
        +String category
        +String status
        +String imageUrl
        +getProducts() List~Product~
        +getProduct(id) Product
        +getBestSellers() List~Product~
        +createProduct(data) Product
        +updateProduct(id, data) Product
        +deleteProduct(id) boolean
    }

    class Inventory {
        +String id
        +String sku
        +String productId
        +String name
        +String subtitle
        +String unitLabel
        +String category
        +String supplier
        +Number stock
        +Number threshold
        +Number unitCost
        +String lastUpdated
        +String id_type
        +Object specifications
        +String image
        +List~String~ careInstructions
        +StockAdjustment lastAdjustment
        +getInventory() List~Inventory~
        +getLowStockInventory() List~Inventory~
        +adjustStock(id, type, amount, reason) Inventory
    }

    class StockAdjustment {
        +String type
        +Number amount
        +String reason
    }
    Inventory "1" *-- "0..1" StockAdjustment : embeds
    Inventory "1" --> "1" Product : linked by productId

    class Order {
        +String orderId
        +String orderNo
        +String customerId
        +String orderDate
        +String status
        +String courierNotes
        +String flagReason
        +String statusBeforeFlag
        +Number subtotal
        +Number shippingAmount
        +Number taxAmount
        +Number totalAmount
        +List~StatusEntry~ statusHistory
        +List~OrderItem~ items
        +ShippingAddress shippingAddress
        +Shipping shipping
        +Payment payment
        +getOrders() List~Order~
        +getOrderById(id) Order
        +createOrder(items, paymentMethod, shippingAddress, shippingMethod) Order
        +updateOrderStatus(id, payload) Order
    }
    class StatusEntry {
        +String status
        +String at
    }
    class OrderItem {
        +String orderItemId
        +String productId
        +String name
        +Number quantity
        +Number unitPrice
        +Number subTotal
        +Boolean picked
        +String imageUrl
    }
    class ShippingAddress {
        +String fullName
        +String street
        +String city
        +String postalCode
        +String phone
    }
    class Shipping {
        +String method
        +String methodLabel
        +Number cost
        +String carrier
        +String trackingNumber
        +String estimatedDeliveryStart
        +String estimatedDeliveryEnd
    }
    class Payment {
        +String paymentId
        +String method
        +Number amount
        +String status
        +String paymentDate
        +String transactionId
    }

    User "1" --> "0..*" Order : places (customerId)
    Order "1" *-- "1..*" OrderItem : contains
    Order "1" *-- "0..*" StatusEntry : history
    Order "1" *-- "1" ShippingAddress : embeds
    Order "1" *-- "1" Shipping : embeds
    Order "1" *-- "1" Payment : embeds
    OrderItem "0..*" --> "1" Product : references (productId)

    class PurchaseOrder {
        +String id
        +String createdAt
        +String status
        +String receivedAt
        +List~PurchaseOrderItem~ items
        +getPurchaseOrders() List~PurchaseOrder~
        +createPurchaseOrder(items) PurchaseOrder
        +receivePurchaseOrder(id) PurchaseOrder
    }
    class PurchaseOrderItem {
        +String id
        +String name
        +Number qty
        +Number unitCost
    }
    PurchaseOrder "1" *-- "1..*" PurchaseOrderItem : contains
    PurchaseOrderItem "0..*" --> "1" Inventory : restocks

    class Cart {
        +String storageKey
        +List~CartItem~ items
        +getCart() List~CartItem~
        +saveCart(cart) List~CartItem~
        +addToCart(product, quantity) List~CartItem~
        +clearCart() void
        +mergeCartAfterLogin(userId) void
    }
    class CartItem {
        +String productId
        +String name
        +Number price
        +String image
        +Number quantity
    }
    Cart "1" *-- "0..*" CartItem : holds
    CartItem "0..*" --> "1" Product : references

    class SalesReport {
        +Number totalOrders
        +Number totalSales
        +Number averageOrderValue
        +List topProducts
        +List chart
        +getSalesReport(periodType) SalesReport
    }
    class InventoryReport {
        +Number totalItems
        +Number totalValue
        +Number lowStockCount
        +Number outOfStockCount
        +List lowStockItems
        +List outOfStockItems
        +getInventoryReport() InventoryReport
    }
    class ProfitReport {
        +Number totalRevenue
        +Number totalCost
        +Number grossProfit
        +Number netProfit
        +List chart
        +getProfitReport(periodType) ProfitReport
    }
    SalesReport ..> Order : analyzes
    InventoryReport ..> Inventory : analyzes
    ProfitReport ..> Order : analyzes
    ProfitReport ..> Inventory : uses unitCost
```

---

## <a id="sequence-diagrams"></a>🔧 Sequence Diagrams

1.Customer
```mermaid
    sequenceDiagram
    autoNumber
    actor Customer as ลูกค้า (Customer)
    participant UI as หน้าเว็บ React (Web UI)
    participant LS as Local Storage (ฝั่งเบราว์เซอร์)
    participant API as Backend (Express.js)
    participant DB as ฐานข้อมูล (JSON)

    %% เฟส 1: การเข้าสู่ระบบ (Login)
    rect
        Customer->>UI: กรอก Email & Password
        UI->>API: POST /api/auth/login
        API->>DB: ตรวจสอบข้อมูลใน user.json
        DB-->>API: คืนค่าข้อมูล User
        API-->>UI: คืน JWT token + ข้อมูล Profile
        UI-->>Customer: เข้าสู่ระบบสำเร็จ
    end

    %% เฟส 2: ค้นหา/ดูสินค้า (Browse & Search)
    rect
        Customer->>UI: เปิดหน้าสินค้า / พิมพ์คำค้นหา
        UI->>API: GET /api/products
        API->>DB: ดึงข้อมูลจาก product.json
        DB-->>API: คืนค่ารายการสินค้า
        API-->>UI: คืนค่ากลับเป็น Array ของสินค้า
        UI->>UI: กรอง/ค้นหาฝั่ง Client (แบรนด์ / ราคา / ประเภท)
        UI-->>Customer: แสดงการ์ดสินค้าบนหน้าจอ
    end

    %% เฟส 3: หยิบใส่ตะกร้า (เก็บฝั่ง Client — ไม่มี backend / ไม่มีไฟล์ carts)
    rect
        Customer->>UI: กดปุ่ม "เพิ่มลงตะกร้า"
        UI->>LS: บันทึกตะกร้าใน localStorage (key: cart_[userId])
        LS-->>UI: บันทึกสำเร็จ
        UI-->>Customer: แสดง Popup "เพิ่มลงตะกร้าสำเร็จ!"
    end

    %% เฟส 4: สั่งซื้อและชำระเงิน (Checkout)
    rect
        Customer->>UI: เปิดหน้าชำระเงิน
        UI->>LS: อ่านตะกร้าจาก localStorage
        LS-->>UI: คืนค่ารายการสินค้าในตะกร้า
        UI->>UI: คำนวณ subtotal + ภาษี + ค่าจัดส่ง (ฝั่ง Client)
        UI-->>Customer: แสดงสรุปยอดและช่องทางชำระเงิน
        Customer->>UI: กดยืนยันการชำระเงิน (จำลอง)
        UI->>API: POST /api/orders {items, paymentMethod, shippingAddress, shippingMethod}
        API->>DB: อ่านราคาจาก product.json + เช็ค/ตัดสต็อกใน inventory.json
        API->>API: จำลองชำระเงิน (สร้าง transactionId + tracking number)
        API->>DB: สร้างออเดอร์ใหม่ลง order.json
        DB-->>API: บันทึกสำเร็จ
        API-->>UI: คืนค่าออเดอร์ที่สร้าง (orderId)
        UI->>LS: ล้างตะกร้า (clearCart)
        UI-->>Customer: ไปหน้า "ยืนยันคำสั่งซื้อ (Confirmation)"
    end
```
2.Staff
```mermaid
    sequenceDiagram
    autoNumber
    actor Staff as พนักงาน (Staff)
    participant UI as หน้า Dashboard (React)
    participant API as Backend (Express.js)
    participant DB as ฐานข้อมูล (JSON)

    %% เฟส 1: การเข้าสู่ระบบ (Staff Login)
    rect
        Staff->>UI: กรอก Email & Password
        UI->>API: POST /api/auth/login
        API->>DB: ตรวจสอบสิทธิ์ใน user.json
        DB-->>API: คืนค่าข้อมูล (Role: Staff)
        API-->>UI: คืน JWT token (มี role) + Profile
        UI-->>Staff: พาเข้าสู่หน้า Dashboard การจัดการ
    end

    %% เฟส 2: ตรวจสอบและอัปเดตสต็อก (Manage Inventory)
    rect
        Staff->>UI: เปิดหน้าคลังสินค้า
        UI->>API: GET /api/inventory
        API->>DB: ดึงข้อมูลจาก inventory.json
        DB-->>API: คืนค่ารายการสต็อก
        API-->>UI: คืนค่าเป็น Array ของสินค้า
        UI-->>Staff: แสดงจำนวนสต็อกบนหน้าจอ
        Staff->>UI: กรอกจำนวนที่ปรับ และกดบันทึก
        UI->>API: PATCH /api/inventory/:id/adjust
        API->>DB: อัปเดต stock ใน inventory.json
        DB-->>API: บันทึกข้อมูลสำเร็จ
        API-->>UI: คืนค่ารายการที่อัปเดตแล้ว
        UI-->>Staff: แสดง Popup "อัปเดตสต็อกเรียบร้อย!"
    end

    %% เฟส 3: อัปเดตสถานะคำสั่งซื้อ (Update Order Status)
    rect
        Staff->>UI: กดเข้าเมนู "จัดการออเดอร์"
        UI->>API: GET /api/orders
        API->>DB: ดึงข้อมูลจาก order.json
        DB-->>API: คืนค่ารายการออเดอร์
        API-->>UI: ส่งข้อมูลกลับเป็น Array ของออเดอร์
        UI-->>Staff: วาดตารางรายการสั่งซื้อของลูกค้า
        Staff->>UI: แพ็คของและกดเปลี่ยนสถานะ (เช่น "จัดส่งแล้ว")
        UI->>API: PATCH /api/orders/:id/status
        API->>DB: อัปเดต status + statusHistory ใน order.json
        DB-->>API: บันทึกสำเร็จ
        API-->>UI: คืนค่าออเดอร์ที่อัปเดตแล้ว
        UI-->>Staff: แจ้งเตือน "อัปเดตสถานะออเดอร์เรียบร้อย"
    end
```

3.Manager
```mermaid
    sequenceDiagram
    autoNumber
    actor Manager as ผู้จัดการ (Manager)
    participant UI as หน้า Dashboard (React)
    participant API as Backend (Express.js)
    participant DB as ฐานข้อมูล (JSON)

    %% เฟส 1: การเข้าสู่ระบบ (Manager Login)
    rect
        Manager->>UI: กรอก Email & Password
        UI->>API: POST /api/auth/login
        API->>DB: ตรวจสอบสิทธิ์ใน user.json
        DB-->>API: คืนค่าข้อมูล (Role: Manager)
        API-->>UI: คืน JWT token (มี role) + Profile
        UI-->>Manager: พาเข้าสู่หน้า Admin Dashboard
    end

    %% เฟส 2: การจัดการสินค้า (Manage Products)
    rect
        Manager->>UI: กรอกข้อมูลสินค้าใหม่
        UI->>API: POST /api/products
        API->>DB: เพิ่มข้อมูลลง product.json
        DB-->>API: บันทึกสำเร็จ
        API-->>UI: คืนค่าสินค้าที่สร้าง
        UI-->>Manager: แจ้งเตือน "เพิ่มสินค้าใหม่ลงระบบเรียบร้อย"
    end

    %% เฟส 3: การสร้างรายงาน (Generate Reports)
    rect
        Manager->>UI: กดเมนู "ดูรายงาน"
        UI->>API: GET /api/reports/sales
        API->>DB: อ่านข้อมูลจาก order.json + product.json
        DB-->>API: ข้อมูลรายการสั่งซื้อทั้งหมด
        API-->>UI: คืนค่าสถิติยอดขายเป็น Object

        UI->>API: GET /api/reports/inventory
        API->>DB: อ่านข้อมูลจาก inventory.json
        DB-->>API: ข้อมูลสต็อกสินค้าทั้งหมด
        API-->>UI: คืนค่าสถิติสินค้าคงคลังเป็น Object

        UI->>API: GET /api/reports/profit
        API->>DB: อ่านข้อมูลจาก order.json + inventory.json
        DB-->>API: ข้อมูลยอดขายและต้นทุน
        API-->>UI: คืนค่าสถิติกำไรเป็น Object

        UI-->>Manager: วาดกราฟแท่ง / กราฟวงกลมบน Dashboard (recharts)
    end
```

---

## <a id="system-architecture"></a>🏗 System Architecture

```mermaid
    graph LR
    A[React Web UI] -->|HTTP Requests| B(Node.js Backend / Express.js)
    B -->|Read/Write Data| C[(Local Storage / JSON Files)]
```

---

### <a id="wireframe"></a>🎯 Wireframe / Prototype - [Click to inspect](https://www.figma.com/design/By0aa0Ia9NAwNOilaYCD85/PetStop?node-id=87-393&p=f&t=l2h7526gFYC8L37D-0)

---

## <a id="data-schema"></a>🗄️ Data Schema (JSON Database)

ระบบ PetStop ใช้การจัดเก็บข้อมูลในรูปแบบไฟล์ JSON (Local Storage) โดยแบ่ง Collection หลักๆ ออกตาม Entity ดังนี้:

#### 1. `inventory.json` (ข้อมูลคลังสินค้า)
ไฟล์นี้ใช้สำหรับเก็บข้อมูลเชิงลึกและจำนวนสต็อกของสินค้าแต่ละรายการ

```json
{
  "id": "DG-DRY-001",
  "sku": "DG-DRY-001",
  "productId": "PD-001",
  "name": "Royal Canin Mini Adult",
  "subtitle": "อาหารสุนัขชนิดแห้ง • 2 กก.",
  "unitLabel": "1 ถุง บรรจุ 2 กก.",
  "category": "อาหารแห้ง",
  "supplier": "Wholesome Pet Foods",
  "stock": 64,
  "threshold": 20,
  "unitCost": 520,
  "lastUpdated": "2026-07-16T14:25:06.872Z",
  "id-type": "dogs",
  "specifications": {
    "ingredients": "Chicken",
    "type": "อาหารแห้ง",
    "proteinContent": "27%"
  },
  "image": "https://www.feedmeplease.com/images/pdimg/24/1.webp",
  "careInstructions": ["เก็บในที่แห้ง"],
  "lastAdjustment": {
    "type": "add",
    "amount": 0,
    "reason": "ปรับแก้ยอดสต็อก"
  }
}
```
> **หมายเหตุ:** `subtitle`, `unitLabel`, `supplier`, `specifications`, `careInstructions` อาจไม่มีในบางรายการ ส่วน `lastAdjustment` จะปรากฏหลังมีการปรับสต็อกครั้งแรกเท่านั้น

#### 2. `order.json` (ข้อมูลคำสั่งซื้อ)
ไฟล์นี้เก็บข้อมูลธุรกรรมการสั่งซื้อของลูกค้า การจัดส่ง และการชำระเงิน

```json
{
  "orderId": "ORD-1001",
  "orderNo": "ORD-1001",
  "customerId": "CPS0002",
  "orderDate": "2026-07-14T14:59:23.705Z",
  "status": "Delivered",
  "statusHistory": [
    { "status": "Confirmed", "at": "2026-07-14T14:59:23.705Z" },
    { "status": "Delivered", "at": "2026-07-15T03:00:07.424Z" }
  ],
  "courierNotes": "",
  "flagReason": "",
  "statusBeforeFlag": null,
  "subtotal": 500,
  "shippingAmount": 0,
  "taxAmount": 35,
  "totalAmount": 535,
  "items": [
    {
      "orderItemId": "OI-PD-004-1784041163703",
      "productId": "PD-004",
      "name": "Kong Classic",
      "quantity": 1,
      "unitPrice": 500,
      "subTotal": 500,
      "picked": false,
      "imageUrl": "https://m.media-amazon.com/images/I/61eVAqrR7uL.jpg"
    }
  ],
  "shippingAddress": {
    "fullName": "Dora",
    "street": "1234",
    "city": "Pluto",
    "postalCode": "99999",
    "phone": "1234567890"
  },
  "shipping": {
    "method": "standard",
    "methodLabel": "จัดส่งมาตรฐาน",
    "cost": 0,
    "carrier": "Kerry Express",
    "trackingNumber": "KER-687567400",
    "estimatedDeliveryStart": "2026-07-17T14:59:23.705Z",
    "estimatedDeliveryEnd": "2026-07-19T14:59:23.705Z"
  },
  "payment": {
    "paymentId": "PAY-ORD-1001",
    "method": "พร้อมเพย์",
    "amount": 535,
    "status": "Paid",
    "paymentDate": "2026-07-14T14:59:23.705Z",
    "transactionId": "TXN-1784041163705-1910"
  }
}
```
> **หมายเหตุ:** `courierNotes`, `flagReason`, `statusBeforeFlag` ใช้สำหรับการจัดการปัญหา/ตีกลับคำสั่งซื้อ (ค่าเริ่มต้นเป็นค่าว่างหรือ `null`)

#### 3. `product.json` (ข้อมูลหลักของสินค้า)
ไฟล์นี้เป็น Master Data เก็บข้อมูลเบื้องต้นของสินค้าสำหรับใช้แสดงหน้าร้าน

```json
{
  "productId": "PD-001",
  "name": "Royal Canin Mini Adult",
  "description": "อาหารสุนัขชนิดแห้ง • 2 กก.",
  "price": 800,
  "category": "อาหารแห้ง",
  "status": "Active",
  "imageUrl": "https://www.feedmeplease.com/images/pdimg/24/1.webp"
}
```
> **หมายเหตุ:** `imageUrl` มีเฉพาะบางรายการ (ถ้ามี)

#### 4. `purchaseOrders.json` (ใบสั่งซื้อสินค้าเข้าสต็อก)
ไฟล์นี้ใช้บันทึกข้อมูลการสั่งซื้อของเข้ามาเติมในคลังสินค้า

```json
{
  "id": "PO-8821",
  "createdAt": "2026-07-15T04:39:12.698Z",
  "status": "Received",
  "items": [
    {
      "id": "PD-031",
      "name": "ปืนหายาก",
      "qty": 1,
      "unitCost": 100
    }
  ],
  "receivedAt": "2026-07-15T04:39:19.009Z"
}
```

#### 5. `user.json` (ข้อมูลผู้ใช้งานระบบ)
ไฟล์นี้เก็บข้อมูลของผู้ใช้งานทั้งหมด ทั้งลูกค้า (Customer), พนักงาน (Staff) และผู้จัดการ (Manager)

**ตัวอย่างพนักงาน / ผู้จัดการ (Staff / Manager):**
```json
{
  "id": "PS0003",
  "prefix": "นางสาว",
  "firstName": "เบอร์นิส",
  "lastName": "ไวท์",
  "email": "staff2@petstop.com",
  "phone": "0879551123",
  "idCard": "1234567890234",
  "role": "Staff",
  "status": "ACTIVE",
  "bloodGroup": "A",
  "password": "Pet0034",
  "profileImage": "http://localhost:4000/uploads/Profile/User-1783952929600.jpg",
  "emergencyContact": {
    "name": "ซีซาร์ คิง",
    "phone": "0869511112",
    "relationship": "พี่สาว"
  }
}
```

**ตัวอย่างลูกค้า (Customer):**
```json
{
  "id": "CPS0001",
  "firstName": "เจน",
  "lastName": "โด",
  "email": "jane.doe@example.com",
  "phone": "ยังไม่ได้ระบุ",
  "password": "jane1122",
  "role": "Customer",
  "status": "ACTIVE",
  "profileImage": "http://localhost:4000/uploads/Profile/Profile-1783848529667.jpg",
  "addresses": [
    {
      "fullName": "เจน โด",
      "street": "67 Goon Mar Solar system",
      "city": "Galaxy",
      "postalCode": "10101",
      "phone": "0981234569",
      "id": 1783846422411,
      "isDefault": false
    }
  ]
}
```
> **หมายเหตุ:** `prefix`, `idCard`, `bloodGroup`, `emergencyContact` มีเฉพาะพนักงานและผู้จัดการ ส่วน `addresses` มีเฉพาะลูกค้า

---
