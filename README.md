# 🏢 Apartment Management System (AMS)

Hệ thống quản lý chung cư - Fullstack application với Spring Boot 4 & React 19.

## 📋 Mục lục

- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Chạy dự án](#-chạy-dự-án)
- [Quy trình làm việc với Git](#-quy-trình-làm-việc-với-git)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Liên hệ](#-liên-hệ)

---

## 💻 Yêu cầu hệ thống

Đảm bảo máy đã cài đặt các phần mềm sau:

| Phần mềm             | Phiên bản tối thiểu | Link tải                                                                  |
| --------------------- | -------------------- | ------------------------------------------------------------------------- |
| **Java JDK**          | 21                   | [Download](https://www.oracle.com/java/technologies/downloads/#java21)    |
| **Apache Maven**      | 3.9+                 | [Download](https://maven.apache.org/download.cgi)                         |
| **Node.js**           | 18+                  | [Download](https://nodejs.org/)                                           |
| **SQL Server**        | 2019+                | [Download](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) |
| **SSMS** (tuỳ chọn)   | Mới nhất             | [Download](https://learn.microsoft.com/en-us/ssms/download-ssms)          |
| **Git**               | Mới nhất             | [Download](https://git-scm.com/downloads)                                 |

### Kiểm tra phiên bản

```bash
java -version        # Java 21+
mvn -v               # Maven 3.9+
node -v              # Node.js 18+
npm -v               # npm 9+
git --version        # Git
```

---

## 📁 Cấu trúc dự án

```
Apartment_management/
├── am_be/                          # Backend - Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/apartment/management/
│   │   │   │   ├── entity/         # JPA Entities
│   │   │   │   ├── enums/          # Enumerations
│   │   │   │   └── ManagementApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   └── mvnw / mvnw.cmd
│
├── am_fe/                          # Frontend - React + Vite
│   ├── src/
│   │   ├── shared/services/        # Axios HTTP client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Hướng dẫn cài đặt

### 1. Clone dự án

```bash
git clone https://github.com/kina111/Apartment_management.git
cd Apartment_management
```

### 2. Tạo Database trên SQL Server

Mở **SSMS** hoặc **sqlcmd** và chạy lệnh sau:

```sql
CREATE DATABASE ams_project;
```

> ⚠️ **Lưu ý:** Hệ thống sử dụng SQL Server Authentication với tài khoản mặc định:
> - **Username:** `sa`
> - **Password:** `123`
>
> Nếu mật khẩu `sa` trên máy bạn khác, hãy cập nhật trong file `am_be/src/main/resources/application.properties`:
>
> ```properties
> spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=ams_project;encrypt=false
> spring.datasource.username=sa
> spring.datasource.password=<mật_khẩu_của_bạn>
> ```
>
> **⛔ KHÔNG commit file này nếu bạn thay đổi mật khẩu!**

### 3. Cài đặt Backend

```bash
cd am_be
mvn clean install
```

Lệnh này sẽ tải tất cả dependencies và build project. Lần đầu có thể mất 2-5 phút.

### 4. Cài đặt Frontend

```bash
cd am_fe
npm install
```

---

## ▶️ Chạy dự án

### Chạy Backend (Terminal 1)

```bash
cd am_be
mvn spring-boot:run
```

Backend sẽ chạy tại: **http://localhost:8080**

### Chạy Frontend (Terminal 2)

```bash
cd am_fe
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

### Chạy JSON Server - Mock API (tuỳ chọn, Terminal 3)

```bash
cd am_fe
npx json-server db.json
```

Mock API sẽ chạy tại: **http://localhost:3000**

> 💡 **Tip:** Mở 2 terminal riêng biệt để chạy Backend và Frontend cùng lúc.

---

## 🔀 Quy trình làm việc với Git

### Quy tắc branch

| Branch      | Mô tả                              |
| ----------- | ----------------------------------- |
| `main`      | Code ổn định, đã review            |
| `develop`   | Branch phát triển chính             |
| `feature/*` | Tính năng mới (VD: `feature/login`)|
| `bugfix/*`  | Sửa lỗi (VD: `bugfix/fix-login`)  |

### Tạo branch mới và làm việc

```bash
# Lấy code mới nhất
git pull origin main

# Tạo branch mới từ main
git checkout -b feature/ten-tinh-nang

# Sau khi code xong, commit
git add .
git commit -m "feat: mô tả ngắn gọn thay đổi"

# Push lên remote
git push origin feature/ten-tinh-nang
```

Sau đó tạo **Pull Request** trên GitHub để review.

### Quy tắc đặt tên commit

| Prefix     | Ý nghĩa                 | Ví dụ                                |
| ---------- | ------------------------ | ------------------------------------- |
| `feat:`    | Tính năng mới            | `feat: add login page`               |
| `fix:`     | Sửa lỗi                 | `fix: resolve null pointer in Room`  |
| `docs:`    | Cập nhật tài liệu       | `docs: update README`               |
| `style:`   | Format code, CSS         | `style: fix button alignment`        |
| `refactor:`| Tái cấu trúc code       | `refactor: extract service layer`    |
| `test:`    | Thêm/sửa test           | `test: add unit test for Account`    |

---

## ❓ Xử lý lỗi thường gặp

### Backend không kết nối được database
1. Kiểm tra SQL Server đang chạy: `Services → SQL Server (MSSQLSERVER) → Running`
2. Kiểm tra **TCP/IP** đã bật trong SQL Server Configuration Manager
3. Đảm bảo port **1433** không bị firewall chặn
4. Kiểm tra lại username/password trong `application.properties`

### `mvn` hoặc `java` không nhận lệnh
- Kiểm tra biến môi trường `JAVA_HOME` và `PATH` đã cấu hình đúng
- Restart terminal sau khi cài đặt

### `npm install` bị lỗi
```bash
# Xoá cache và cài lại
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 👥 Liên hệ

Nếu gặp vấn đề khi setup, liên hệ team lead hoặc tạo **Issue** trên GitHub.

📌 **Repository:** [https://github.com/kina111/Apartment_management](https://github.com/kina111/Apartment_management)
