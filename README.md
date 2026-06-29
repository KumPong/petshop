# PetStop (เพ็ทสต็อป)
**Domain:** e-Commerce (ระบบร้านค้าออนไลน์สำหรับสัตว์เลี้ยงแบบครบวงจร)

## 📑 สารบัญ (Table of Contents)
1. [สมาชิกในกลุ่ม (Group Members)](#group-members)
2. [หลักการและเหตุผล (Rationale)](#rationale)
3. [วัตถุประสงค์ของโครงงาน (Objectives)](#objectives)
4. [ขอบเขตของระบบ (System Scope)](#system-scope)
5. [User Personas (กลุ่มผู้ใช้งานเป้าหมาย)](#user-personas)
6. [UI/UX Design & Prototype](#ui-ux)
7. [Tech Stack (เครื่องมือและเทคโนโลยีที่ใช้)](#tech-stack)
8. [แผนการดำเนินงาน (Work Plan)](#work-plan)
9. [Use Case Diagram](#use-case)
10. [Class Diagram](#class-diagram)
11. [Sequence Diagrams](#sequence-diagrams)
12. [System Architecture](#system-architecture)

---

## <a id="group-members"></a>👥 สมาชิกในกลุ่ม (Group Members)
* **67097950** อนันยศ ชัยชนะ (ปลานัย) - Project Manager, Infrastructure
* **67107433** ณัชพล วงศาจันทร์ (บอน) - Frontend, Backend
* **67115588** ธนกฤต เพ็ชรกำจัด (พี่นอร์ท) - Frontend, Backend

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

---

## <a id="user-personas"></a>🧑‍🤝‍🧑 User Personas (กลุ่มผู้ใช้งานเป้าหมาย)

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

## <a id="ui-ux"></a>🎨 UI/UX Design & Prototype

🔗 **Figma Prototype:** [คลิกเพื่อดูการออกแบบ PetStop บน Figma](https://www.figma.com/design/By0aa0Ia9NAwNOilaYCD85/PetStop?node-id=135-411&t=6x1Jdpxown9icMEu-1)

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
    Customer([ลูกค้า - Customer])
    Staff([พนักงาน - Staff])
    Manager([ผู้จัดการ - Manager])

    %% Customer Subgraph
    subgraph Customer_Functions [ฟังก์ชันสำหรับลูกค้า]
        direction TB
        C1(สมัครสมาชิก)
        C2(เข้าสู่ระบบ)
        C3(ค้นหาสินค้า)
        C4(ดูรายละเอียดสินค้า)
        C5(เพิ่มสินค้าลงตะกร้า)
        C6(จัดการตะกร้าสินค้า)
        C7(สั่งซื้อสินค้า)
        C8(ชำระเงิน)
        C9(ติดตามสถานะคำสั่งซื้อ)
        C10(ประวัติการสั่งซื้อ)
        
        C_Ext1(ตัวกรองการค้นหา: แบรนด์, รุ่น, ราคา, ประเภท)
        C_Ext2(ยืนยันคำสั่งซื้อ)
        C_Ext3(เลือกช่องทางชำระเงิน)
        
        C3 -.->|"<<extend>>"| C_Ext1
        C7 -.->|"<<include>>"| C_Ext2
        C8 -.->|"<<include>>"| C_Ext3
    end

    %% External Services
    subgraph External_Services [บริการภายนอก]
        direction TB
        E1(ระบบชำระเงินออนไลน์)
        E2(ระบบขนส่ง)
    end
    C8 -.-> E1
    C9 -.-> E2

    %% Staff Subgraph
    subgraph Staff_Functions [ฟังก์ชันสำหรับพนักงาน]
        direction TB
        S1(เข้าสู่ระบบ)
        S2(ดูรายการคำสั่งซื้อ)
        S3(ตรวจสอบและยืนยันคำสั่งซื้อ)
        S4(จัดเตรียมสินค้า / แพ็คสินค้า)
        S5(อัพเดตสถานะคำสั่งซื้อ)
        S6(จัดการสต็อกสินค้า)
        
        S_Ext1(ตรวจสอบสต็อก)
        S_Ext2(รับสินค้าเข้า)
        S_Ext3(ปรับปรุงสต็อก)
        
        S6 -.->|"<<include>>"| S_Ext1
        S6 -.->|"<<include>>"| S_Ext2
        S6 -.->|"<<include>>"| S_Ext3
    end

    %% Manager Subgraph
    subgraph Manager_Functions [ฟังก์ชันสำหรับผู้จัดการ]
        direction TB
        M1(ดูแดชบอร์ดภาพรวม)
        M2(จัดการสินค้า)
        M3(จัดการหมวดหมู่สินค้า)
        M4(จัดการผู้ใช้ระบบ)
        M5(รายงานยอดขาย)
        M6(รายงานสินค้าคงเหลือ)
        M7(รายงานผลประกอบการ)
        
        M1 -.->|"<<include>>"| M2
        M1 -.->|"<<include>>"| M3
        M1 -.->|"<<include>>"| M4
        M1 -.->|"<<include>>"| M5
        M1 -.->|"<<include>>"| M6
        M1 -.->|"<<include>>"| M7
    end

    %% Actor Connections
    Customer --> C1 & C2 & C3 & C4 & C5 & C6 & C7 & C8 & C9 & C10
    Staff --> S1 & S2 & S3 & S4 & S5 & S6
    Manager --> M1
```

---

## <a id="class-diagram"></a>⚙️ Class Diagram

```mermaid
   classDiagram
    class User {
        -String userId
        -String username
        -String email
        -String passwordHash
        -String firstName
        -String lastName
        -String phone
        -String role
        -Datetime createdAt
        -Datetime updatedAt
        +register(userData: Object) boolean
        +login(email, password) boolean
        +logout() void
        +updateProfile(newData: Object) void
        +changePassword(oldPass, newPass) boolean
    }
    
    class Customer {
        -Date dateOfBirth
        -String gender
        +viewProfile() Customer
        +viewOrders() List~Order~
        +addAddress(addressData: Object) boolean
    }
    
    class Staff {
        -String position
        +viewPendingOrders() Array
        +updateOrderStatus(orderId, status) boolean
        +checkStock(productId) Number
        +manageInventory(productId, qty) boolean
    }
    
    class Manager {
        -String department
        +viewDashboard() Object
        +viewReports(reportType) Array
        +manageUsers(targetUserId, action) boolean
        +manageProducts(productData, action) boolean
        +manageCategories(categoryData, action) boolean
    }
    
    User <|-- Customer
    User <|-- Staff
    User <|-- Manager

    class Product {
        -String productId
        -String modelId
        -String categoryId
        -String sku
        -String name
        -String description
        -String gender
        -String size
        -String warranty
        -Number price
        -String status
        -Datetime createdAt
        +getImages() Array
        +getCurrentPrice() Number
    }
    
    class Category {
        -String categoryId
        -String name
        -String description
        -String status
        +getSubCategories() List~Category~
    }
    
    class Brand {
        -String brandId
        -String name
        -String country
        -String logoUrl
        -String description
        -String status
        +getProducts() List~Product~
    }
    
    class ProductImage {
        -String imageId
        -String productId
        -String imageUrl
        -boolean isPrimary
        -Number sortOrder
    }
    
    class Inventory {
        -String inventoryId
        -String productId
        -Number quantityOnHand
        -Number reservedQty
        -Number reorderLevel
        -Datetime lastUpdated
        +adjustStock(qtyChange) boolean
        +updateReservedQty(qty) boolean
        +checkReorderLevel() boolean
    }
    
    Product --> Category : belongs to
    Product --> Brand : belongs to
    Product --> ProductImage : has
    Product --> Inventory : manages

    class Order {
        -String orderId
        -String orderNo
        -String customerId
        -Datetime orderDate
        -String status
        -Number totalAmount
        -Number shippingAmount
        +calculateTotal() Number
        +confirmOrder() boolean
        +cancel() boolean
        +changeStatus(status) boolean
    }
    
    class OrderItem {
        -String orderItemId
        -String orderId
        -String productId
        -Number quantity
        -Number unitPrice
        +getSubTotal() Number
    }
    
    class Cart {
        -String cartId
        -String customerId
        -String status
        -Datetime createdAt
        -Datetime updatedAt
        +addItem(productId, qty) boolean
        +updateItemQty(productId, qty) boolean
        +removeItem(productId) boolean
        +clear() boolean
        +getTotal() Number
    }
    
    class Payment {
        -String paymentId
        -String orderId
        -String method
        -Number amount
        -String status
        -Datetime paymentDate
        -String transactionId
        +confirmPayment() boolean
    }
    
    class Shipping {
        -String shippingId
        -String orderId
        -String trackingNo
        -String carrier
        -String shippingAddressId
        -String shippingMethod
        -String status
        -Datetime shippedDate
        +updateStatus(status) boolean
    }
    
    class Address {
        -String addressId
        -String customerId
        -String type
        -String fullName
        -String phone
        -String addressLine1
        -String addressLine2
        -String district
        -String city
        -String province
        -String postalCode
        -String country
        -boolean isDefault
    }
    
    Customer "1" --> "0..*" Order : places
    Order *-- OrderItem : contains
    Order "1" --> "1" Payment : has
    Order "1" --> "1" Shipping : uses
    Shipping "1" --> "1" Address : delivers to
    Customer "1" --> "1" Cart : owns
    Cart "1" --> "0..*" OrderItem : items
    OrderItem "0..*" --> "1" Product : references

    class Report {
        -String reportId
        -String reportName
        -String periodType
        -Date startDate
        -Date endDate
        -Datetime generatedAt
        -String generatedBy
        +generate() Object
    }
    
    class SalesReport {
        -Number totalOrders
        -Number totalSales
        -Number averageOrderValue
        -List~Product~ topProducts
        +generate() Object
    }
    
    class InventoryReport {
        -Number totalItems
        -Number totalValue
        -Array lowStockItems
        -Array outOfStockItems
        +generate() Object
    }
    
    class ProfitReport {
        -Number totalRevenue
        -Number totalCost
        -Number grossProfit
        -Number netProfit
        +generate() Object
    }
    
    Report <|-- SalesReport
    Report <|-- InventoryReport
    Report <|-- ProfitReport
    
    class ProductSearch {
        -String keyword
        -String brandId
        -String categoryId
        -Number minPrice
        -Number maxPrice
        -String sortBy
        -boolean isStockOnly
        +search() List~Product~
        +clear() void
    }
    
    %% ลากเส้นเชื่อมตัวที่ลอยอยู่
    ProductSearch ..> Product : searches
    Report ..> Order : analyzes
```

---

## <a id="sequence-diagrams"></a>🔧 Sequence Diagrams

1.Customer
```mermaid
    sequenceDiagram
    actor Customer as ลูกค้า (Customer)
    participant UI as หน้าเว็บ React (Web UI)
    participant US as User Service (Node.js)
    participant PS as Product Service
    participant CS as Cart Service
    participant OS as Order Service
    participant PG as Payment Gateway
    participant DB as ฐานข้อมูล (JSON)

    %% เฟส 1: การเข้าสู่ระบบ (Login)
    rect rgb(240, 248, 255)
        Customer->>UI: กรอก Email & Password
        UI->>US: login(email, password)
        US->>DB: ตรวจสอบข้อมูลใน users.json
        DB-->>US: คืนค่าข้อมูล User
        US-->>UI: ส่งสถานะ boolean (True) และข้อมูล Profile
        UI-->>Customer: เปลี่ยนหน้าจอเข้าสู่ระบบสำเร็จ
    end

    %% เฟส 2: ค้นหาสินค้า (Search Product)
    rect rgb(255, 250, 240)
        Customer->>UI: พิมพ์คำค้นหา (เช่น "อาหารแมว")
        UI->>PS: search(keyword, minPrice, maxPrice)
        PS->>DB: ดึงข้อมูลจาก products.json
        DB-->>PS: คืนค่าข้อมูลสินค้า
        PS-->>UI: คืนค่ากลับเป็น Array ของสินค้า
        UI-->>Customer: แสดงการ์ดสินค้าบนหน้าจอ
    end

    %% เฟส 3: หยิบใส่ตะกร้า (Add to Cart)
    rect rgb(240, 255, 240)
        Customer->>UI: กดปุ่ม "เพิ่มลงตะกร้า"
        UI->>CS: addItem(productId, qty)
        CS->>DB: บันทึกข้อมูลลง carts.json
        DB-->>CS: อัปเดตสำเร็จ
        CS-->>UI: คืนค่า boolean (True)
        UI-->>Customer: แสดง Popup แจ้งเตือน "เพิ่มสำเร็จ!"
    end

    %% เฟส 4: สั่งซื้อและชำระเงิน (Checkout)
    rect rgb(255, 240, 245)
        Customer->>UI: กดปุ่ม "ชำระเงิน" ในตะกร้า
        UI->>OS: calculateTotal()
        OS->>DB: ดึงราคาจากตะกร้ามาคำนวณ
        DB-->>OS: ยอดรวม
        OS-->>UI: คืนค่าราคาสุทธิเป็น Number
        UI-->>Customer: แสดงหน้าสรุปยอดและช่องทางจ่ายเงิน
        Customer->>UI: กดยืนยันการจ่ายเงิน (จำลอง)
        UI->>PG: confirmPayment(method, amount)
        PG-->>UI: คืนค่า boolean (True) ยืนยันว่าตัดเงินผ่าน
        UI->>OS: confirmOrder()
        OS->>DB: สร้างออเดอร์ใหม่ลง orders.json
        DB-->>OS: บันทึกสำเร็จ
        OS-->>UI: คืนค่า boolean (True)
        UI->>CS: clear() ตะกร้าสินค้า
        CS-->>UI: ล้างตะกร้าสำเร็จ
        UI-->>Customer: แสดงหน้า "ขอบคุณที่สั่งซื้อสินค้า"
    end
```
2.Staff
```mermaid
    sequenceDiagram
    actor Staff as พนักงาน (Staff)
    participant UI as หน้า Dashboard (React)
    participant US as User Service
    participant IS as Inventory Service
    participant OS as Order Service
    participant DB as ฐานข้อมูล (JSON)

    %% เฟส 1: การเข้าสู่ระบบ (Staff Login)
    rect rgb(240, 248, 255)
        Staff->>UI: กรอก Email & Password
        UI->>US: login(email, password)
        US->>DB: ตรวจสอบสิทธิ์ใน users.json
        DB-->>US: คืนค่าข้อมูล (Role: Staff)
        US-->>UI: ส่งสถานะ boolean (True) และ Token
        UI-->>Staff: พาเข้าสู่หน้า Dashboard การจัดการ
    end

    %% เฟส 2: ตรวจสอบและอัปเดตสต็อก (Manage Inventory)
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

    %% เฟส 3: อัปเดตสถานะคำสั่งซื้อ (Update Order Status)
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
```

3.Manager
```mermaid
    sequenceDiagram
    actor Manager as ผู้จัดการ (Manager)
    participant UI as หน้า Dashboard (React)
    participant US as User Service
    participant PS as Product Service
    participant RS as Report Service
    participant DB as ฐานข้อมูล (JSON)

    %% เฟส 1: การเข้าสู่ระบบ (Manager Login)
    rect rgb(240, 248, 255)
        Manager->>UI: กรอก Email & Password
        UI->>US: login(email, password)
        US->>DB: ตรวจสอบสิทธิ์ระดับบริหารใน users.json
        DB-->>US: คืนค่าข้อมูล (Role: Manager)
        US-->>UI: ส่งสถานะ boolean (True) และ Token
        UI-->>Manager: พาเข้าสู่หน้า Admin Dashboard
    end

    %% เฟส 2: การจัดการสินค้า (Manage Catalog)
    rect rgb(255, 250, 240)
        Manager->>UI: กรอกข้อมูลสินค้าใหม่ (เช่น อาหารแมวสูตรใหม่)
        UI->>PS: มัดรวมข้อมูลส่งไปบันทึก
        PS->>DB: เพิ่มข้อมูลลง products.json
        DB-->>PS: บันทึกสำเร็จ
        PS-->>UI: คืนค่า boolean (True)
        UI-->>Manager: แจ้งเตือน "เพิ่มสินค้าใหม่ลงระบบเรียบร้อย"
    end

    %% เฟส 3: การสร้างรายงาน (Generate Reports)
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
```

---

## <a id="system-architecture"></a>🏗 System Architecture

```mermaid
    graph LR
    A[React Web UI] -->|HTTP Requests| B(Node.js Backend / Express.js)
    B -->|Read/Write Data| C[(Local Storage / JSON Files)]
```

---