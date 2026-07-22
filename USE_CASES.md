# Danh sách Use Case

## Mục lục

1. [Quản lý Hạ tầng](#1-quản-lý-hạ-tầng-property--asset-management)
2. [Quản lý Tổ chức, Nhân sự và Giao tiếp](#2-quản-lý-tổ-chức-nhân-sự-và-giao-tiếp-account--communication)
3. [Quản lý Hóa đơn và Tài chính](#3-quản-lý-hóa-đơn-và-tài-chính-billing--analytics)
4. [Quản lý Phòng](#4-quản-lý-phòng-room-management)
5. [Quản lý Hợp đồng thuê](#5-quản-lý-hợp-đồng-thuê-contract-management)
6. [Quản lý Khách thuê, Cư dân và Phương tiện](#6-quản-lý-khách-thuê-cư-dân-và-phương-tiện)

---

## 1. Quản lý Hạ tầng (Property & Asset Management)

**Phụ trách:** Phong

### UC-01 - Khởi tạo thông tin cơ sở (Bước 1)

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord |
| Mô tả tóm tắt | Tiếp nhận các thông tin cơ bản của cơ sở gồm tên, địa chỉ, số tầng và các thông tin liên quan. |
| Ràng buộc | Số tầng phải lớn hơn `0` để làm dữ liệu đầu vào cho việc dựng lưới phòng tại UC-04. |

### UC-02 - Định nghĩa danh mục loại phòng (Bước 2)

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord |
| Mô tả tóm tắt | Khởi tạo các nhóm phòng đại diện cho tòa nhà vừa tạo, ví dụ: Standard, Deluxe, Studio. |
| Logic dữ liệu | Thêm dữ liệu vào bảng `Room_types`, gồm `Rent`, `Capacity`, `Name`, `Description`. Mỗi loại phòng có một `RoomType_ID` riêng biệt. |

### UC-03 - Cấu hình CSVC mặc định cho loại phòng (Bước 3)

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord |
| Mô tả tóm tắt | Cho phép chọn và gán danh sách trang thiết bị, ví dụ điều hòa, tủ lạnh, áp dụng chung cho từng loại phòng đã tạo tại UC-02. |
| Logic dữ liệu | Ánh xạ và lưu danh mục cơ sở vật chất thuộc loại phòng, làm dữ liệu mẫu để các phòng đơn lẻ kế thừa sau này. |

### UC-04 - Khởi tạo phòng nhanh theo lưới tầng (Bước 4)

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord |
| Mô tả tóm tắt | Hệ thống tự động dựng lưới gồm `N` dòng, với `N = NumberOfFloor` đã nhập tại UC-01. Người dùng chọn **+ Thêm phòng nhanh** tại tầng tương ứng để tạo phòng. |
| Logic dữ liệu | Tạo bản ghi trong bảng `Rooms`; `FloorNumber` được lấy tự động từ dòng của lưới; `Status` mặc định là `AVAILABLE`; phòng liên kết với `RoomType_ID` được chọn. |
| Xử lý tự động | Sao chép danh mục CSVC của loại phòng tại UC-03 để tạo các thiết bị cụ thể trong bảng `Furnishings`, với `Status` mặc định là `OPERATIONAL`. |

### UC-05 - Xem danh sách tòa nhà

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord |
| Mô tả tóm tắt | Người dùng chọn menu **Quản lý Tòa nhà** trên sidebar. Hệ thống hiển thị bảng danh sách toàn bộ cơ sở đang quản lý kèm thông tin cơ bản. |

### UC-5.1 - Xóa tòa nhà

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord |
| Mô tả tóm tắt | Xóa một tòa nhà khỏi hệ thống. |
| Điều kiện | Chỉ được xóa khi tòa nhà không có hợp đồng nào đang hoạt động (`ACTIVE`). |

### UC-5.2 - Chỉnh sửa thông tin tòa nhà

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord |
| Mô tả tóm tắt | Chỉnh sửa thông tin của tòa nhà đã tồn tại. |

### UC-06 - Xem chi tiết tòa nhà

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord |
| Mô tả tóm tắt | Người dùng chọn một dòng trong bảng danh sách tòa nhà. Hệ thống điều hướng đến trang thông tin chi tiết của cơ sở tương ứng. |

### UC-07 - Cấu hình tài khoản ngân hàng nhận tiền

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord |
| Mô tả tóm tắt | Từ danh sách hoặc trang chi tiết tòa nhà, Landlord nhập hoặc chỉnh sửa tài khoản ngân hàng được gán cho tòa nhà để phục vụ tạo mã VietQR cho hóa đơn. |
| Dữ liệu | `BankName`, `AccountNumber`, `UserName`. |

---

## 2. Quản lý Tổ chức, Nhân sự và Giao tiếp (Account & Communication)

**Phụ trách:** Huyền

### UC-08 - Gửi thông báo linh hoạt qua email

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord |
| Mô tả tóm tắt | Landlord soạn tiêu đề, nội dung thông báo, đính kèm tệp nếu cần và lựa chọn phạm vi người nhận. |
| Đối tượng nhận | Toàn bộ cư dân; toàn bộ Manager; cá nhân hoặc phòng cụ thể. |

### UC-09 - Phân nhiệm Manager

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord |
| Mô tả tóm tắt | Tạo tài khoản Manager và giới hạn quyền quản lý theo từng cơ sở trọ cụ thể. |

---

## 3. Quản lý Hóa đơn và Tài chính (Billing & Analytics)

**Phụ trách:** Thuận

### UC-10 - Xem Dashboard tài chính và vận hành

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord, Manager |
| Mô tả tóm tắt | Theo dõi tổng doanh thu, dòng tiền thực tế và tỷ lệ lấp đầy phòng theo thời gian thực. |
| Phạm vi Landlord | Xem toàn bộ hệ thống hoặc lọc theo từng cơ sở. |
| Phạm vi Manager | Chỉ xem các cơ sở được phân quyền trong bảng trung gian `Building_Managers`. |

### UC-11 - Cấu hình chu kỳ hóa đơn tự động

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord |
| Mô tả tóm tắt | Cấu hình ngày cố định trong tháng để hệ thống tự động quét chỉ số, tổng hợp chi phí và gửi email hóa đơn cho toàn bộ phòng trong tòa nhà. |
| Cấu hình hết hạn | Thiết lập hạn cuối Tenant phải thanh toán để không bị ghi nhận là nợ quá hạn. |

### UC-12 - Xem và lọc danh sách hóa đơn phòng

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord, Manager |
| Mô tả tóm tắt | Tra cứu toàn bộ hóa đơn phòng trong một tòa nhà. |
| Bộ lọc | Trạng thái `PENDING`, `PAID`, `OVERDUE`; tháng; năm. |

### UC-13 - Xem chi tiết hóa đơn phòng

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord, Manager |
| Mô tả tóm tắt | Khi chọn một dòng trong danh sách hóa đơn, hệ thống hiển thị modal chứa chi tiết tính toán theo Business Rules. |

### UC-14 - Tính toán và chốt phí tháng hàng loạt

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord, Manager |
| Mô tả tóm tắt | Hiển thị bảng tính xem trước toàn bộ hóa đơn dự kiến của một tòa nhà trước khi phát hành. |
| Quy tắc tính | Với hạng mục có `Charge_Type = PER_INDEX`, ví dụ điện hoặc nước theo đồng hồ, hệ thống cho phép nhập chỉ số mới và tự động tính số lượng, thành tiền theo thời gian thực. |

---

## 4. Quản lý Phòng (Room Management)

**Phụ trách:** Nam

### UC-15 - Xem sơ đồ lưới phòng và chỉnh sửa trạng thái phòng

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord, Manager |
| Mô tả tóm tắt | Hiển thị danh sách phòng theo từng tầng dưới dạng các thẻ trực quan và cho phép lọc, tìm kiếm, cập nhật trạng thái phòng trống sang bảo trì. |

**Luồng chính:**

1. Người dùng chọn menu **Lưới phòng** trên sidebar.
2. Hệ thống truy vấn danh sách phòng theo từng tầng của cơ sở hiện tại và hiển thị dưới dạng các card.
3. Mỗi card hiển thị tên phòng, tên khách thuê nếu có và badge trạng thái: Đang thuê, Trống hoặc Đang sửa.
4. Người dùng tìm kiếm hoặc lọc nhanh theo các trạng thái: Tất cả, Trống, Đang thuê, Đang sửa.
5. Với phòng Trống, hệ thống hiển thị nút mở dropdown bên cạnh trạng thái.
6. Người dùng chọn **Chuyển sang Bảo trì (Đang sửa)** để cập nhật trạng thái phòng.

---

## 5. Quản lý Hợp đồng thuê (Contract Management)

**Phụ trách:** Chưa xác định

### UC-18 - Xem chi tiết hợp đồng thuê phòng

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord, Manager |
| Mô tả tóm tắt | Xem toàn bộ thông tin hành chính, tài chính và hồ sơ minh chứng bằng hình ảnh của một hợp đồng thuê phòng; đồng thời cung cấp thao tác thay đổi trạng thái cư trú. |

### UC-19 - Gia hạn hợp đồng

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord, Manager |
| Mô tả tóm tắt | Đóng chu kỳ hợp đồng cũ và tạo, kích hoạt chu kỳ hợp đồng mới với thời hạn, giá thuê và hồ sơ ký kết cập nhật. |

**Luồng chính:**

1. Người dùng chọn **Gia hạn hợp đồng** tại màn hình chi tiết hợp đồng cũ.
2. Hệ thống mở trang gia hạn và điền sẵn tên chủ hợp đồng, tiền đặt cọc cũ, ngày bắt đầu mới bằng ngày hết hạn cũ cộng một ngày.
3. Người dùng chọn thời hạn gia hạn hoặc nhập ngày cụ thể; hệ thống tự tính ngày hết hạn mới.
4. Người dùng cập nhật giá thuê mới nếu cần.
5. Người dùng tải lên hình ảnh hợp đồng hoặc phụ lục gia hạn đã ký.
6. Người dùng chọn **Xác nhận gia hạn**.
7. Hệ thống kiểm tra dữ liệu, đóng chu kỳ cũ, kích hoạt chu kỳ mới và điều hướng về tab Hợp đồng của phòng.

### UC-20 - Chuyển nhượng hợp đồng

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord, Manager |
| Mô tả tóm tắt | Chuyển quyền đứng tên hợp đồng và tiền cọc từ chủ cũ sang chủ mới. |

**Luồng chính:**

1. Người dùng chọn **Chuyển nhượng HĐ** tại màn hình chi tiết hợp đồng cũ.
2. Hệ thống mở trang chuyển nhượng và hiển thị thông tin chủ cũ cùng số tiền cọc chuyển giao.
3. Người dùng chọn một cư dân đang chưa có phòng hoặc tạo cư dân mới bằng họ tên, số điện thoại và CCCD.
4. Người dùng chọn ngày bắt đầu bàn giao hợp đồng cho chủ mới.
5. Người dùng tải lên biên bản chuyển nhượng nếu có.
6. Người dùng chọn **Xác nhận chuyển nhượng**.
7. Hệ thống thực thi transaction cập nhật dữ liệu và điều hướng về trang phòng.

### UC-21 - Kết thúc hợp đồng

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord, Manager |
| Mô tả tóm tắt | Thanh lý hợp đồng, xử lý tiền cọc, ghi nhận tình trạng tài sản và trả phòng. |

**Luồng chính:**

1. Người dùng chọn **Kết thúc hợp đồng** tại màn hình chi tiết hợp đồng.
2. Hệ thống mở trang thanh lý và hiển thị tên khách thuê cùng số tiền cọc gốc đang giữ.
3. Người dùng đánh giá tình trạng tài sản bàn giao: tốt hoặc hỏng hóc cần đền bù.
4. Người dùng xác nhận trạng thái hoàn cọc: trả toàn bộ, trả một phần hoặc chưa trả/khấu trừ hết.
5. Người dùng chọn lý do kết thúc hợp đồng.
6. Người dùng tải lên biên bản thanh lý hoặc ảnh hiện trạng phòng.
7. Người dùng chọn **Xác nhận kết thúc và trả phòng**.
8. Hệ thống đóng hợp đồng, gỡ cư dân khỏi phòng, chuyển phòng sang trạng thái Trống và điều hướng về sơ đồ phòng.

### UC-22 - Xem danh sách và lọc hợp đồng

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord, Manager |
| Mô tả tóm tắt | Hiển thị, tìm kiếm và lọc danh sách hợp đồng theo quyền của người dùng. |

**Luồng chính:**

1. Người dùng truy cập menu **Quản lý Hợp đồng**.
2. Hệ thống kiểm tra vai trò tài khoản.
3. Landlord được hiển thị màn hình có cấu hình tổng; Manager được hiển thị màn hình đã lược bỏ cấu hình tổng.
4. Hệ thống hiển thị bảng gồm ID hợp đồng, `Room_Code`, chủ đứng tên và trạng thái.
5. Người dùng tìm theo ID, tên chủ hoặc số phòng; danh sách được lọc theo thời gian thực.
6. Người dùng lọc trạng thái: Tất cả, Đang hoạt động, Sắp hết hạn hoặc Đã kết thúc.

### UC-23 - Thêm mới hợp đồng thuê phòng

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord, Manager |
| Mô tả tóm tắt | Tạo hợp đồng cho một phòng trống, gán chủ hợp đồng, cấu hình điều khoản, phí dịch vụ và hồ sơ ký kết. |
| Điều kiện bắt buộc | Phòng phải đang trống và phải có ảnh ký kết hợp đồng. |

**Luồng chính:**

1. Người dùng chọn **Thêm hợp đồng** từ tab Hợp đồng của phòng trống hoặc từ Dashboard quản lý hợp đồng.
2. Nếu thao tác từ phòng, hệ thống điền sẵn và khóa `Room_Code`; nếu thao tác từ Dashboard, người dùng chọn một phòng đang trống.
3. Người dùng chọn Tenant chưa có phòng hoặc tạo cư dân mới bằng họ tên, số điện thoại và CCCD.
4. Người dùng nhập `StartDate`, `EndDate`, `Rent` và `Deposit_Amount`.
5. Hệ thống tải danh sách `Service_Fees` của tòa nhà, gồm tên dịch vụ, đơn giá và `Charge_Type`, để người dùng kiểm tra hoặc điều chỉnh.
6. Người dùng tải lên ảnh ký kết hợp đồng.
7. Người dùng chọn **Xác nhận tạo hợp đồng**.
8. Hệ thống kiểm tra dữ liệu, lưu hợp đồng, chuyển phòng sang trạng thái Đang thuê và điều hướng về trang trước.

---

## 6. Quản lý Khách thuê, Cư dân và Phương tiện

**Phụ trách:** Nam

### UC-24 - Xem danh sách thành viên và phương tiện phòng

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord, Manager |
| Mô tả tóm tắt | Xem đồng thời danh sách thành viên và phương tiện thuộc một phòng đang thuê. |

**Luồng chính:**

1. Từ màn hình Lưới phòng, người dùng chọn một phòng đang ở trạng thái Đang thuê.
2. Hệ thống điều hướng đến màn hình Chi tiết phòng.
3. Người dùng mở tab **Thành viên và phương tiện**.
4. Hệ thống hiển thị danh sách thành viên dạng card gồm họ tên, badge Chủ hợp đồng hoặc Thành viên, nút Hồ sơ và nút Xóa.
5. Hệ thống hiển thị bảng phương tiện gồm biển số, loại xe, chủ xe và nút Xóa.

### UC-25 - Thêm thành viên/cư dân mới vào phòng

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord, Manager |
| Mô tả tóm tắt | Thêm cư dân với vai trò Thành viên vào một phòng đang có hợp đồng hoạt động. |

**Luồng chính:**

1. Tại tab Thành viên và phương tiện, người dùng chọn **Thêm thành viên mới**.
2. Hệ thống kiểm tra phòng có hợp đồng đang hoạt động hay không.
3. Nếu phòng trống và chưa có hợp đồng, hệ thống điều hướng sang trang tạo hợp đồng mới.
4. Nếu phòng đang thuê, hệ thống hiển thị form thông tin Tenant gồm họ tên, số điện thoại, CCCD, ngày sinh, quê quán và các trường liên quan.
5. Người dùng nhập dữ liệu và chọn **Xác nhận thêm**.
6. Hệ thống kiểm tra, lưu cư dân, tự động gán vai trò Thành viên và cập nhật danh sách của phòng.

### UC-26 - Xóa thành viên khỏi phòng

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Chưa xác định |
| Mô tả tóm tắt | Gỡ cư dân khỏi phòng. Nếu cư dân là chủ hợp đồng, hệ thống cảnh báo và yêu cầu kết thúc hoặc chuyển nhượng hợp đồng trước. |

### UC-27 - Xem hồ sơ chi tiết cư dân

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord, Manager |
| Mô tả tóm tắt | Người dùng chọn card cư dân tại tab Thành viên và phương tiện. Hệ thống điều hướng đến trang hồ sơ chi tiết của cư dân. |

### UC-28 - Chỉnh sửa thông tin cư dân

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Landlord, Manager |
| Mô tả tóm tắt | Chỉnh sửa số điện thoại, thông tin liên hệ khẩn cấp và lưu dữ liệu cập nhật vào bảng `Tenant`. |

### UC-30 - Đăng ký phương tiện mới cho phòng

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Chưa xác định |
| Mô tả tóm tắt | Nhập biển số, loại xe và chủ xe; gán phương tiện với `Room_Code` hiện tại và lưu vào bảng `Vehicles`. |

### UC-31 - Hủy đăng ký phương tiện

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Chưa xác định |
| Mô tả tóm tắt | Xóa bản ghi phương tiện khỏi bảng `Vehicles` dựa trên `NumberPlate`. |

### UC-32 - Xem danh sách cư dân toàn tòa nhà

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Chưa xác định |
| Mô tả tóm tắt | Hiển thị toàn bộ cư dân của một cơ sở dưới dạng bảng, phân biệt vai trò bằng badge Chủ hợp đồng và Thành viên. |

### UC-33 - Xem danh sách phương tiện toàn tòa nhà

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Chưa xác định |
| Mô tả tóm tắt | Truy cập phân hệ Phương tiện để xem thống kê theo loại xe và tra cứu danh sách xe của toàn bộ cư dân đang lưu trú tại một cơ sở. |

### UC-34 - Tìm kiếm phương tiện theo biển số

| Thuộc tính | Nội dung |
| --- | --- |
| Actor chính | Chưa xác định |
| Mô tả tóm tắt | Tìm kiếm phương tiện theo biển số. |

---

## Ghi chú

- Danh sách nguồn chưa có các mã `UC-16`, `UC-17` và `UC-29`.
- Actor của `UC-26`, `UC-30`, `UC-31`, `UC-32`, `UC-33` và `UC-34` chưa được xác định trong nội dung nguồn.
- Nội dung chi tiết của `UC-5.2` và `UC-34` cần được bổ sung thêm nếu có yêu cầu nghiệp vụ cụ thể.
