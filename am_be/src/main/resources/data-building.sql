IF NOT EXISTS (SELECT 1 FROM [account] WHERE email = 'landlord.test@ams.local')
    INSERT INTO [account] (account_name, password, email, role, status)
    VALUES ('landlord_test', '123456', 'landlord.test@ams.local', 'LANDLORD', 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM [account] WHERE email = 'manager.test@ams.local')
    INSERT INTO [account] (account_name, password, email, role, status)
    VALUES ('manager_test', '123456', 'manager.test@ams.local', 'MANAGER', 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM [account] WHERE email = 'admin.test@ams.local')
    INSERT INTO [account] (account_name, password, email, role, status)
    VALUES ('admin_test', '123456', 'admin.test@ams.local', 'ADMIN', 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM building WHERE name = N'Test Building A')
    INSERT INTO building (name, number_of_floor, address, description, landlord_id)
    SELECT N'Test Building A', 5, N'123 Nguyen Trai, Ha Noi', N'Dev seed building for UC-01 testing', account_id
    FROM [account]
    WHERE email = 'landlord.test@ams.local';

IF NOT EXISTS (SELECT 1 FROM building WHERE name = N'Test Building B')
    INSERT INTO building (name, number_of_floor, address, description, landlord_id)
    SELECT N'Test Building B', 3, N'456 Le Loi, Ho Chi Minh City', N'Second dev seed building', account_id
    FROM [account]
    WHERE email = 'landlord.test@ams.local';

IF NOT EXISTS (SELECT 1 FROM building_image WHERE url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg')
    INSERT INTO building_image (url, building_id)
    SELECT 'https://res.cloudinary.com/demo/image/upload/sample.jpg', building_id
    FROM building
    WHERE name = N'Test Building A';

IF NOT EXISTS (SELECT 1 FROM room_type WHERE name = N'Standard')
    INSERT INTO room_type (name, capacity, area, description)
    VALUES (N'Standard', 2, 25.0, N'Basic room type for dev testing');

IF NOT EXISTS (SELECT 1 FROM room_type WHERE name = N'Deluxe')
    INSERT INTO room_type (name, capacity, area, description)
    VALUES (N'Deluxe', 3, 35.0, N'Larger room type for dev testing');

IF NOT EXISTS (SELECT 1 FROM room_type WHERE name = N'Studio')
    INSERT INTO room_type (name, capacity, area, description)
    VALUES (N'Studio', 1, 30.0, N'Studio room type for dev testing');

IF NOT EXISTS (SELECT 1 FROM room WHERE room_code = 'A101')
    INSERT INTO room (room_code, floor_number, status, building_id, room_type_id)
    SELECT 'A101', 1, 'AVAILABLE', b.building_id, rt.room_type_id
    FROM building b
    CROSS JOIN room_type rt
    WHERE b.name = N'Test Building A' AND rt.name = N'Standard';

IF NOT EXISTS (SELECT 1 FROM room WHERE room_code = 'A201')
    INSERT INTO room (room_code, floor_number, status, building_id, room_type_id)
    SELECT 'A201', 2, 'AVAILABLE', b.building_id, rt.room_type_id
    FROM building b
    CROSS JOIN room_type rt
    WHERE b.name = N'Test Building A' AND rt.name = N'Deluxe';

IF NOT EXISTS (SELECT 1 FROM room WHERE room_code = 'B101')
    INSERT INTO room (room_code, floor_number, status, building_id, room_type_id)
    SELECT 'B101', 1, 'AVAILABLE', b.building_id, rt.room_type_id
    FROM building b
    CROSS JOIN room_type rt
    WHERE b.name = N'Test Building B' AND rt.name = N'Studio';

/* =========================================================
   Building list/filter development data
   - 3 landlords
   - 4 managers
   - 24 buildings
   - cross-landlord manager assignments
   - a mix of buildings with and without images
   This section is idempotent and can be executed repeatedly.
   ========================================================= */

INSERT INTO [account] (account_name, password, email, role, status)
SELECT source.account_name, source.password, source.email, source.role, source.status
FROM (VALUES
    ('seed_landlord_north', '123456', 'seed.landlord.north@ams.local', 'LANDLORD', 'ACTIVE'),
    ('seed_landlord_central', '123456', 'seed.landlord.central@ams.local', 'LANDLORD', 'ACTIVE'),
    ('seed_landlord_south', '123456', 'seed.landlord.south@ams.local', 'LANDLORD', 'ACTIVE'),
    ('seed_manager_ha', '123456', 'seed.manager.ha@ams.local', 'MANAGER', 'ACTIVE'),
    ('seed_manager_nam', '123456', 'seed.manager.nam@ams.local', 'MANAGER', 'ACTIVE'),
    ('seed_manager_huyen', '123456', 'seed.manager.huyen@ams.local', 'MANAGER', 'ACTIVE'),
    ('seed_manager_thuan', '123456', 'seed.manager.thuan@ams.local', 'MANAGER', 'ACTIVE')
) AS source(account_name, password, email, role, status)
WHERE NOT EXISTS (
    SELECT 1
    FROM [account] existing
    WHERE existing.email = source.email
       OR existing.account_name = source.account_name
);

INSERT INTO building (name, number_of_floor, address, description, landlord_id)
SELECT
    source.name,
    source.number_of_floor,
    source.address,
    source.description,
    landlord.account_id
FROM (VALUES
    (N'SEED-N01 - Hola Residence',       3,  N'12 Thạch Hòa, Thạch Thất, Hà Nội',       N'Cơ sở nhỏ gần khu công nghệ cao',              'seed.landlord.north@ams.local'),
    (N'SEED-N02 - Green House',          5,  N'85 Hồ Tùng Mậu, Nam Từ Liêm, Hà Nội',    N'Tòa nhà có thang máy và khu để xe',            'seed.landlord.north@ams.local'),
    (N'SEED-N03 - West Lake Studio',     8,  N'20 Trích Sài, Tây Hồ, Hà Nội',            N'Căn hộ studio gần Hồ Tây',                      'seed.landlord.north@ams.local'),
    (N'SEED-N04 - Cầu Giấy Home',        6,  N'44 Trần Thái Tông, Cầu Giấy, Hà Nội',     N'Cơ sở dành cho sinh viên và người đi làm',      'seed.landlord.north@ams.local'),
    (N'SEED-N05 - Sunrise Apartment',   12,  N'101 Nguyễn Trãi, Thanh Xuân, Hà Nội',     N'Tòa nhà quy mô lớn có nhiều loại phòng',        'seed.landlord.north@ams.local'),
    (N'SEED-N06 - Mini House',           2,  N'16 Phùng Khoang, Nam Từ Liêm, Hà Nội',    N'Cơ sở hai tầng chưa có ảnh',                    'seed.landlord.north@ams.local'),
    (N'SEED-N07 - Riverside Rooms',      4,  N'72 Ngọc Thụy, Long Biên, Hà Nội',         N'Phòng trọ gần sông Hồng',                       'seed.landlord.north@ams.local'),
    (N'SEED-N08 - Đông Anh Stay',        7,  N'35 Cao Lỗ, Đông Anh, Hà Nội',             N'Cơ sở phía bắc thành phố',                      'seed.landlord.north@ams.local'),

    (N'SEED-C01 - Central Living',       4,  N'18 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',   N'Cơ sở trung tâm thành phố',                     'seed.landlord.central@ams.local'),
    (N'SEED-C02 - Beach Side Home',      9,  N'62 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng',     N'Căn hộ gần biển Mỹ Khê',                        'seed.landlord.central@ams.local'),
    (N'SEED-C03 - Han River Studio',     6,  N'11 Bạch Đằng, Hải Châu, Đà Nẵng',         N'Studio nhìn ra sông Hàn',                       'seed.landlord.central@ams.local'),
    (N'SEED-C04 - Hội An Residence',     3,  N'90 Hai Bà Trưng, Hội An, Quảng Nam',       N'Cơ sở phong cách phố cổ',                       'seed.landlord.central@ams.local'),
    (N'SEED-C05 - Huế Garden',           5,  N'27 Lê Lợi, Phú Hội, Huế',                 N'Khu lưu trú có sân vườn',                       'seed.landlord.central@ams.local'),
    (N'SEED-C06 - Ocean View',          15,  N'108 Phạm Văn Đồng, Sơn Trà, Đà Nẵng',     N'Tòa nhà cao tầng gần biển',                     'seed.landlord.central@ams.local'),
    (N'SEED-C07 - Student House',        2,  N'33 Ngũ Hành Sơn, Đà Nẵng',                N'Cơ sở giá rẻ dành cho sinh viên',               'seed.landlord.central@ams.local'),
    (N'SEED-C08 - An Thượng Apartment',  8,  N'54 An Thượng 4, Ngũ Hành Sơn, Đà Nẵng',   N'Căn hộ trong khu phố du lịch',                  'seed.landlord.central@ams.local'),

    (N'SEED-S01 - Saigon Central',      10,  N'125 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',N'Căn hộ tại trung tâm thành phố',                 'seed.landlord.south@ams.local'),
    (N'SEED-S02 - Bình Thạnh Home',      5,  N'77 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM',N'Cơ sở gần các trường đại học',                   'seed.landlord.south@ams.local'),
    (N'SEED-S03 - Thủ Đức Studio',       7,  N'40 Võ Văn Ngân, Thủ Đức, TP.HCM',         N'Studio cho sinh viên và nhân viên văn phòng',   'seed.landlord.south@ams.local'),
    (N'SEED-S04 - Green Park',           4,  N'22 Nguyễn Hữu Thọ, Quận 7, TP.HCM',       N'Cơ sở gần khu đô thị Phú Mỹ Hưng',              'seed.landlord.south@ams.local'),
    (N'SEED-S05 - Airport Residence',    9,  N'18 Hồng Hà, Tân Bình, TP.HCM',            N'Căn hộ gần sân bay Tân Sơn Nhất',               'seed.landlord.south@ams.local'),
    (N'SEED-S06 - Mini Stay',            1,  N'65 Lê Văn Sỹ, Quận 3, TP.HCM',            N'Cơ sở một tầng chưa có ảnh',                    'seed.landlord.south@ams.local'),
    (N'SEED-S07 - Riverside Saigon',    12,  N'30 Nguyễn Văn Hưởng, Thủ Đức, TP.HCM',    N'Căn hộ ven sông Sài Gòn',                       'seed.landlord.south@ams.local'),
    (N'SEED-S08 - Chợ Lớn House',        3,  N'91 Hậu Giang, Quận 6, TP.HCM',            N'Cơ sở tại khu vực Chợ Lớn',                     'seed.landlord.south@ams.local')
) AS source(name, number_of_floor, address, description, landlord_email)
INNER JOIN [account] landlord ON landlord.email = source.landlord_email
WHERE NOT EXISTS (
    SELECT 1
    FROM building existing
    WHERE existing.name = source.name
);

INSERT INTO Account_Buildings (account_id, building_id)
SELECT manager.account_id, building.building_id
FROM (VALUES
    ('seed.manager.ha@ams.local',    N'SEED-N01 - Hola Residence'),
    ('seed.manager.ha@ams.local',    N'SEED-N02 - Green House'),
    ('seed.manager.ha@ams.local',    N'SEED-N03 - West Lake Studio'),
    ('seed.manager.ha@ams.local',    N'SEED-C01 - Central Living'),
    ('seed.manager.ha@ams.local',    N'SEED-S01 - Saigon Central'),

    ('seed.manager.nam@ams.local',   N'SEED-N01 - Hola Residence'),
    ('seed.manager.nam@ams.local',   N'SEED-N04 - Cầu Giấy Home'),
    ('seed.manager.nam@ams.local',   N'SEED-N05 - Sunrise Apartment'),
    ('seed.manager.nam@ams.local',   N'SEED-C02 - Beach Side Home'),
    ('seed.manager.nam@ams.local',   N'SEED-S02 - Bình Thạnh Home'),
    ('seed.manager.nam@ams.local',   N'SEED-S03 - Thủ Đức Studio'),

    ('seed.manager.huyen@ams.local', N'SEED-N06 - Mini House'),
    ('seed.manager.huyen@ams.local', N'SEED-N07 - Riverside Rooms'),
    ('seed.manager.huyen@ams.local', N'SEED-C03 - Han River Studio'),
    ('seed.manager.huyen@ams.local', N'SEED-C04 - Hội An Residence'),
    ('seed.manager.huyen@ams.local', N'SEED-C05 - Huế Garden'),
    ('seed.manager.huyen@ams.local', N'SEED-S04 - Green Park'),

    ('seed.manager.thuan@ams.local', N'SEED-N08 - Đông Anh Stay'),
    ('seed.manager.thuan@ams.local', N'SEED-C06 - Ocean View'),
    ('seed.manager.thuan@ams.local', N'SEED-C07 - Student House'),
    ('seed.manager.thuan@ams.local', N'SEED-C08 - An Thượng Apartment'),
    ('seed.manager.thuan@ams.local', N'SEED-S05 - Airport Residence'),
    ('seed.manager.thuan@ams.local', N'SEED-S07 - Riverside Saigon'),
    ('seed.manager.thuan@ams.local', N'SEED-S08 - Chợ Lớn House')
) AS assignment(manager_email, building_name)
INNER JOIN [account] manager ON manager.email = assignment.manager_email
INNER JOIN building building ON building.name = assignment.building_name
WHERE NOT EXISTS (
    SELECT 1
    FROM Account_Buildings existing
    WHERE existing.account_id = manager.account_id
      AND existing.building_id = building.building_id
);

INSERT INTO building_image (url, building_id)
SELECT image.url, building.building_id
FROM (VALUES
    ('https://picsum.photos/seed/ams-n01-main/1200/800', N'SEED-N01 - Hola Residence'),
    ('https://picsum.photos/seed/ams-n01-room/1200/800', N'SEED-N01 - Hola Residence'),
    ('https://picsum.photos/seed/ams-n02/1200/800',      N'SEED-N02 - Green House'),
    ('https://picsum.photos/seed/ams-n03/1200/800',      N'SEED-N03 - West Lake Studio'),
    ('https://picsum.photos/seed/ams-n05/1200/800',      N'SEED-N05 - Sunrise Apartment'),
    ('https://picsum.photos/seed/ams-n07/1200/800',      N'SEED-N07 - Riverside Rooms'),
    ('https://picsum.photos/seed/ams-c01/1200/800',      N'SEED-C01 - Central Living'),
    ('https://picsum.photos/seed/ams-c02-main/1200/800', N'SEED-C02 - Beach Side Home'),
    ('https://picsum.photos/seed/ams-c02-view/1200/800', N'SEED-C02 - Beach Side Home'),
    ('https://picsum.photos/seed/ams-c03/1200/800',      N'SEED-C03 - Han River Studio'),
    ('https://picsum.photos/seed/ams-c05/1200/800',      N'SEED-C05 - Huế Garden'),
    ('https://picsum.photos/seed/ams-c06/1200/800',      N'SEED-C06 - Ocean View'),
    ('https://picsum.photos/seed/ams-c08/1200/800',      N'SEED-C08 - An Thượng Apartment'),
    ('https://picsum.photos/seed/ams-s01/1200/800',      N'SEED-S01 - Saigon Central'),
    ('https://picsum.photos/seed/ams-s02/1200/800',      N'SEED-S02 - Bình Thạnh Home'),
    ('https://picsum.photos/seed/ams-s03/1200/800',      N'SEED-S03 - Thủ Đức Studio'),
    ('https://picsum.photos/seed/ams-s05/1200/800',      N'SEED-S05 - Airport Residence'),
    ('https://picsum.photos/seed/ams-s07-main/1200/800', N'SEED-S07 - Riverside Saigon'),
    ('https://picsum.photos/seed/ams-s07-view/1200/800', N'SEED-S07 - Riverside Saigon'),
    ('https://picsum.photos/seed/ams-s08/1200/800',      N'SEED-S08 - Chợ Lớn House')
) AS image(url, building_name)
INNER JOIN building building ON building.name = image.building_name
WHERE NOT EXISTS (
    SELECT 1
    FROM building_image existing
    WHERE existing.url = image.url
);
