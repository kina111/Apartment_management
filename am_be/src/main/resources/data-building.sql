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
