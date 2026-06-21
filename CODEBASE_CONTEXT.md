# 🏢 Hướng dẫn Ngữ cảnh Codebase - Hệ thống Quản lý Chung cư (AMS)

Tài liệu này cung cấp cái nhìn toàn diện về cấu trúc thư mục, kiến trúc phần mềm, mô hình dữ liệu và các quy chuẩn lập trình của dự án **Apartment Management System (AMS)**. Mục tiêu là giúp các mô hình AI nhanh chóng hiểu và làm việc với codebase này một cách chính xác.

---

## 1. Tổng quan Dự án (Project Overview)
- **Tên dự án:** Apartment Management System (AMS) - Hệ thống Quản lý Chung cư.
- **Mục tiêu:** Quản lý thông tin tòa nhà, căn hộ, cư dân (khách thuê), hợp đồng, hóa đơn, phí dịch vụ, phương tiện và trang thiết bị.
- **Kiến trúc:** Client-Server tách biệt (Decoupled Fullstack).
  - **Backend (`am_be`):** Spring Boot REST API kết nối cơ sở dữ liệu SQL Server và dịch vụ Cloudinary để lưu trữ ảnh.
  - **Frontend (`am_fe`):** Ứng dụng Single Page Application (SPA) viết bằng React (Vite) + Bootstrap.

---

## 2. Công nghệ Sử dụng (Tech Stack)

### Backend (`am_be`)
- **Ngôn ngữ:** Java 21 (JDK 21)
- **Framework chính:** Spring Boot v3.4+ / v4.1.0-parent (Spring MVC, Spring Data JPA)
- **Cơ sở dữ liệu:** Microsoft SQL Server (kết nối qua `mssql-jdbc`)
- **Quản lý dependencies:** Maven
- **Thư viện bổ trợ:**
  - **Lombok:** Tự động sinh boilerplate code (Getter, Setter, Builder, Constructor...).
  - **MapStruct:** Thực hiện mapping hiệu năng cao giữa JPA Entities và DTOs.
  - **Cloudinary (http5):** API upload và quản lý tệp hình ảnh đám mây.
  - **Springdoc OpenAPI:** Tự động tạo tài liệu API Swagger UI (truy cập qua `/api/swagger-ui/index.html`).

### Frontend (`am_fe`)
- **Ngôn ngữ & Thư viện UI:** React 19.x, Vite 8.x
- **CSS & Layout:** Vanilla CSS + Bootstrap 5 (`react-bootstrap` & `react-bootstrap-icons`)
- **Router:** React Router DOM v7 (quản lý định tuyến SPA)
- **HTTP Client:** Axios (gửi request đến `/api`)
- **Quản lý Form:** React Hook Form (xử lý validation và submit form)
- **Mocking:** JSON Server (phục vụ mock dữ liệu qua file `db.json` nếu cần)

---

## 3. Cấu trúc Thư mục (Project Directory Structure)

```
Apartment_management/
├── am_be/                              # Backend - Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/apartment/management/
│   │   │   │   ├── ManagementApplication.java # Class khởi chạy Spring Boot
│   │   │   │   ├── features/           # Chứa các Module Nghiệp vụ (Feature-based)
│   │   │   │   │   └── building/       # Module quản lý tòa nhà (Building)
│   │   │   │   │       ├── controller/ # REST Controllers
│   │   │   │   │       ├── dto/        # DTOs (Request / Response)
│   │   │   │   │       ├── mapper/     # MapStruct Mappers
│   │   │   │   │       ├── repository/ # Spring Data JPA Repositories
│   │   │   │   │       └── service/    # Services & Implementations
│   │   │   │   └── shared/             # Thành phần dùng chung (Shared layer)
│   │   │   │       ├── config/         # Cấu hình hệ thống (Cloudinary, Swagger...)
│   │   │   │       ├── controller/     # Controllers chung (nếu có)
│   │   │   │       ├── entity/         # Tất cả JPA Entities (Mô hình Dữ liệu)
│   │   │   │       ├── enums/          # Các kiểu Enumeration dùng chung
│   │   │   │       ├── mapper/         # Cấu hình MapStruct dùng chung
│   │   │   │       └── service/        # Các Services dùng chung (ví dụ: CloudService)
│   │   │   └── resources/
│   │   │       ├── application.properties # File cấu hình DB, Server Port, Context Path...
│   │   │       └── static/ & templates/
│   │   └── test/                       # Mã nguồn kiểm thử (Unit test / Integration test)
│   ├── pom.xml                         # Cấu hình Maven Dependencies
│   └── mvnw / mvnw.cmd
│
├── am_fe/                              # Frontend - React + Vite
│   ├── src/
│   │   ├── main.jsx                    # Điểm khởi đầu của ứng dụng React
│   │   ├── App.jsx                     # Component gốc chứa React Router
│   │   ├── features/                   # Chứa các trang/component phân theo chức năng
│   │   │   └── buildings/              # Module Tòa nhà ở Frontend
│   │   │       ├── pages/              # Các trang chính (như BuildingCreatePage)
│   │   │       ├── services/           # API Services riêng cho tòa nhà (buildingApi.js)
│   │   │       └── buildings.css       # Style dành riêng cho module tòa nhà
│   │   ├── shared/                     # Component và Dịch vụ dùng chung
│   │   │   ├── components/             # Layout, Sidebar, Header, Buttons dùng chung
│   │   │   └── services/               # Cấu hình HTTP Client chung (axiosClient.js)
│   │   └── styles/                     # Biến CSS toàn cục, style chung
│   ├── public/                         # Tài nguyên tĩnh (ảnh, favicon...)
│   ├── package.json                    # Cấu hình NodeJS Packages
│   └── vite.config.js                  # Cấu hình Vite
```

---

## 4. Mô hình Dữ liệu (Database Schema & JPA Entities)

Tất cả JPA Entities được khai báo tập trung trong thư mục `am_be/src/main/java/com/apartment/management/shared/entity/`. Dưới đây là danh sách chi tiết và mối quan hệ giữa chúng:

1. **Account (`Account.java`)**
   - Đại diện cho người dùng hệ thống.
   - Có 3 vai trò chính (`Role`): `ADMIN`, `LANDLORD` (Chủ nhà), `MANAGER` (Quản lý).
   - Quan hệ:
     - `@OneToMany` với `Building` (danh sách tòa nhà thuộc sở hữu - luồng Own).
     - `@ManyToMany` với `Building` (danh sách tòa nhà được giao quản lý - luồng Manage).
2. **Building (`Building.java`)**
   - Đại diện cho tòa nhà chung cư.
   - Thuộc tính: `name`, `address`, `numberOfFloor`, `description`.
   - Quan hệ:
     - `@ManyToOne` với `Account` (Chủ nhà - landlord).
     - `@ManyToMany` với `Account` (Các quản lý - managers).
     - `@OneToOne` với `BankAccount` (Tài khoản nhận tiền của tòa nhà).
     - `@OneToOne` với `EmailConfiguration` (Cấu hình gửi mail thông báo).
     - `@OneToMany` với `BuildingImage` (Bộ sưu tập ảnh tòa nhà).
     - `@OneToMany` với `Room` (Các phòng trong tòa nhà).
3. **BuildingImage (`BuildingImage.java`)**
   - Lưu trữ URL ảnh của tòa nhà tải lên Cloudinary.
   - Quan hệ `@ManyToOne` với `Building`.
4. **Room (`Room.java`)**
   - Căn hộ/phòng cụ thể trong tòa nhà.
   - Thuộc tính: `roomNumber`, `floor`, `status` (`RoomStatus`: `VACANT`, `OCCUPIED`, `MAINTENANCE`...).
   - Quan hệ:
     - `@ManyToOne` với `Building`.
     - `@ManyToOne` với `RoomType` (Loại phòng).
     - `@OneToMany` với `Contract` (Hợp đồng thuê phòng này).
     - `@OneToMany` với `Furnishing` (Đồ đạc nội thất được trang bị trong phòng).
5. **RoomType (`RoomType.java`)**
   - Cấu hình loại phòng (Diện tích, số giường, giá thuê cơ bản, số khách tối đa...).
   - Quan hệ `@OneToMany` với `RoomTypeImage` và `@OneToMany` with `Room`.
6. **RoomTypeImage (`RoomTypeImage.java`)**
   - Ảnh minh họa cho loại phòng.
7. **Tenant (`Tenant.java`)**
   - Khách hàng thuê căn hộ (thông tin cá nhân, CMND/CCCD, SĐT...).
   - Quan hệ:
     - `@OneToMany` với `Contract` (Các hợp đồng đã hoặc đang ký).
     - `@OneToMany` với `Vehicle` (Phương tiện đăng ký gửi tại chung cư).
     - `@OneToMany` với `EmergencyContact` (Thông tin liên hệ khẩn cấp).
8. **Contract (`Contract.java`)**
   - Hợp đồng thuê căn hộ giữa Tenant và Tòa nhà.
   - Thuộc tính: `startDate`, `endDate`, `deposit`, `rentalPrice`, `status` (`ContractStatus`).
   - Quan hệ: `@ManyToOne` với `Room`, `@ManyToOne` với `Tenant`, `@OneToMany` với `ContractImage`.
9. **ContractImage (`ContractImage.java`)**
   - Bản scan hoặc hình ảnh chụp hợp đồng giấy.
10. **BankAccount (`BankAccount.java`)**
    - Thông tin tài khoản ngân hàng của tòa nhà (Số tài khoản, tên ngân hàng, chủ tài khoản) để cư dân chuyển khoản hóa đơn.
11. **EmailConfiguration (`EmailConfiguration.java`)**
    - Cấu hình Mail server (host, port, username, password) dùng để gửi hóa đơn tự động cho cư dân tòa nhà đó.
12. **EmergencyContact (`EmergencyContact.java`)**
    - Người liên hệ khẩn cấp của khách thuê (`Tenant`).
13. **Furnishing / FurnishingType (`Furnishing.java`, `FurnishingType.java`)**
    - Quản lý trang thiết bị nội thất (Tivi, Tủ lạnh, Điều hòa...) bàn giao theo phòng. Gồm trạng thái thiết bị (`FurnishingStatus`: `GOOD`, `BROKEN`...).
14. **Vehicle (`Vehicle.java`)**
    - Phương tiện đi lại của cư dân (biển số, loại xe, màu xe...) phục vụ quản lý bãi gửi xe.
15. **ServiceFee (`ServiceFee.java`)**
    - Định nghĩa đơn giá các dịch vụ (Điện, Nước, Internet, Phí dịch vụ chung cư...).
16. **Invoice / InvoiceDetail (`Invoice.java`, `InvoiceDetail.java`)**
    - Hóa đơn hàng tháng của căn hộ.
    - Thuộc tính: `issueDate`, `dueDate`, `paymentStatus` (`PaymentStatus`: `PAID`, `UNPAID`, `OVERDUE`), `paymentMethod` (`PaymentMethod`).
    - Chi tiết hóa đơn (`InvoiceDetail`) lưu chỉ số cũ, chỉ số mới, số lượng tiêu thụ và thành tiền của từng dịch vụ (Điện, nước...).

---

## 5. Luồng Nghiệp vụ Điển hình (Example End-to-End Flow)

### Tính năng: Khởi tạo Tòa nhà mới (Create Building)

1. **Frontend UI (`BuildingCreatePage.jsx`):**
   - Cung cấp form nhập thông tin: Tên tòa nhà, Số tầng, Địa chỉ, Landlord ID (chủ sở hữu), Mô tả và chọn nhiều tệp ảnh.
   - Thực hiện kiểm tra lỗi nhanh (client-side validation): Tên và địa chỉ không trống, số tầng phải > 0.
   - Gửi yêu cầu qua `buildingApi.js` sử dụng đối tượng `FormData` (do có chứa tệp ảnh nhị phân).
2. **Frontend API Client (`buildingApi.js`):**
   - Đóng gói dữ liệu dạng `multipart/form-data` và gọi endpoint `POST /api/buildings` thông qua `axiosClient.js`.
3. **Backend Controller (`BuildingController.java`):**
   - Nhận request thông qua annotation `@ModelAttribute CreateBuildingRequest request` và `@RequestPart(value = "images", required = false) List<MultipartFile> images`.
   - Chuyển tiếp dữ liệu đến `BuildingService`.
4. **Backend Service (`BuildingServiceImpl.java`):**
   - Validate nghiệp vụ: kiểm tra tính hợp lệ của dữ liệu đầu vào.
   - Tìm kiếm thông tin Landlord (Account) từ cơ sở dữ liệu dựa trên `landlordId`.
   - Gọi `CloudService` tải các tệp ảnh lên Cloudinary và lấy về URL.
   - Xây dựng đối tượng `Building` và danh sách `BuildingImage`.
   - Thực hiện lưu (`save`) thông tin vào DB trong một Transaction `@Transactional`.
   - Nếu có lỗi xảy ra trong quá trình lưu DB, hệ thống sẽ thực hiện rollback DB đồng thời gọi hàm dọn dẹp ảnh (`cleanupUploadedImages`) để xóa các ảnh đã tải lên Cloudinary tránh rác dữ liệu.
5. **Backend Mapper (`BuildingMapper.java`):**
   - Sử dụng MapStruct chuyển đổi Entity `Building` sau khi lưu thành `BuildingResponse` chứa danh sách URL ảnh và thông tin của landlord để trả về cho Client.

---

## 6. Hướng dẫn Thiết lập & Chạy Dự án (Quick Start Guide)

### Cơ sở Dữ liệu
1. Cài đặt **Microsoft SQL Server** và **SSMS**.
2. Tạo database:
   ```sql
   CREATE DATABASE ams_project;
   ```
3. Cập nhật thông tin kết nối (Username/Password) trong file `am_be/src/main/resources/application.properties` (lưu ý: mật khẩu mặc định cấu hình sẵn là `123`, tài khoản `sa`).

### Khởi động Backend
```bash
cd am_be
mvn clean install
mvn spring-boot:run
```
*Backend sẽ chạy tại: `http://localhost:8080/api`. Tài liệu API Swagger tại: `http://localhost:8080/api/swagger-ui/index.html`.*

### Khởi động Frontend
```bash
cd am_fe
npm install
npm run dev
```
*Frontend sẽ chạy tại: `http://localhost:5173`.*

---

## 7. Các Lưu ý Quan trọng Dành cho AI khi Phát triển (AI Guidelines)

- **Nguyên tắc Tổ chức Code:**
  - Code mới cần được phân tách rõ ràng theo module chức năng (Ví dụ: Thêm tính năng quản lý phòng thì đặt vào `features/room/...`).
  - Tránh viết logic nghiệp vụ trực tiếp trong Controller, luôn đưa vào Service Layer.
  - Sử dụng DTOs cho các cổng giao tiếp API (Request/Response DTO), không trả trực tiếp JPA Entity ra ngoài Controller để tránh các lỗi Lazy Loading hoặc rò rỉ dữ liệu nhạy cảm.
- **Quy tắc MapStruct & Lombok:**
  - Luôn sử dụng `@Mapper(config = MapStructConfig.class)` để các mapper kế thừa cấu hình chung.
  - Chú ý các cấu hình Lombok như `@Builder`, khi có thuộc tính Collection cần khởi tạo mặc định bằng `@Builder.Default` để tránh lỗi Null Pointer.
- **Xử lý Tệp tin (Upload File):**
  - Tích hợp `CloudService` để thực hiện upload ảnh.
  - Khi viết các service tạo/sửa có upload ảnh, cần bọc trong `@Transactional` và có khối lệnh `try-catch` dọn dẹp file trên Cloudinary nếu thao tác lưu DB thất bại.
- **Quy tắc Thiết kế UI ở Frontend:**
  - Sử dụng React-Bootstrap để tạo giao diện.
  - Style viết trong các file `.css` tương ứng của từng module (Ví dụ: `buildings.css`) hoặc `index.css` nếu là style chung, hạn chế viết style inline phức tạp.
  - Đảm bảo tuân thủ SEO tốt, sử dụng ngữ nghĩa HTML5 rõ ràng và gắn ID duy nhất cho các thẻ tương tác phục vụ việc test tự động.
