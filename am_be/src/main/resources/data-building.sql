-- Alter columns to NVARCHAR to support Vietnamese Unicode characters
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('tenant') AND name = 'name' AND TYPE_NAME(system_type_id) = 'varchar')
    ALTER TABLE tenant ALTER COLUMN name NVARCHAR(255) NOT NULL;

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('tenant') AND name = 'permanent_address' AND TYPE_NAME(system_type_id) = 'varchar')
    ALTER TABLE tenant ALTER COLUMN permanent_address NVARCHAR(255) NOT NULL;

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('building') AND name = 'name' AND TYPE_NAME(system_type_id) = 'varchar')
    ALTER TABLE building ALTER COLUMN name NVARCHAR(255) NOT NULL;

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('building') AND name = 'address' AND TYPE_NAME(system_type_id) = 'varchar')
    ALTER TABLE building ALTER COLUMN address NVARCHAR(255) NOT NULL;

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('building') AND name = 'description' AND TYPE_NAME(system_type_id) = 'varchar')
    ALTER TABLE building ALTER COLUMN description NVARCHAR(500) NULL;

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('room_type') AND name = 'name' AND TYPE_NAME(system_type_id) = 'varchar')
    ALTER TABLE room_type ALTER COLUMN name NVARCHAR(255) NOT NULL;

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('room_type') AND name = 'description' AND TYPE_NAME(system_type_id) = 'varchar')
    ALTER TABLE room_type ALTER COLUMN description NVARCHAR(500) NULL;

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('service_fee') AND name = 'name' AND TYPE_NAME(system_type_id) = 'varchar')
    ALTER TABLE service_fee ALTER COLUMN name NVARCHAR(255) NOT NULL;

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('invoice_detail') AND name = 'item_name' AND TYPE_NAME(system_type_id) = 'varchar')
    ALTER TABLE invoice_detail ALTER COLUMN item_name NVARCHAR(255) NOT NULL;

-- Target cleanup for Room A101 and B101 to avoid duplicates and corruption
DELETE FROM invoice_detail WHERE invoice_id IN (
    SELECT i.invoice_id FROM invoice i 
    JOIN [contract] c ON i.contract_id = c.contract_id 
    WHERE c.room_code IN ('A101', 'B101')
);
DELETE FROM invoice WHERE contract_id IN (
    SELECT contract_id FROM [contract] WHERE room_code IN ('A101', 'B101')
);
DELETE FROM service_fee WHERE contract_id IN (
    SELECT contract_id FROM [contract] WHERE room_code IN ('A101', 'B101')
);
DELETE FROM contract_tenants WHERE contract_id IN (
    SELECT contract_id FROM [contract] WHERE room_code IN ('A101', 'B101')
);
DELETE FROM [contract] WHERE room_code IN ('A101', 'B101');
DELETE FROM tenant WHERE email = 'thuanhdhe186818@fpt.edu.vn';

-- Fix any other existing corrupted encoding data in database
UPDATE tenant SET name = N'Hoàng Đức Thuận' WHERE email = 'thuanhdhe186818@fpt.edu.vn';
UPDATE service_fee SET name = N'Tiền điện' WHERE name LIKE N'%đ%' OR name LIKE '%electric%' OR name LIKE '%Ä%' OR name LIKE '%ä%';
UPDATE service_fee SET name = N'Tiền nước' WHERE name LIKE N'%n%' OR name LIKE '%water%' OR name LIKE '%N%';
UPDATE service_fee SET name = N'Phí dịch vụ chung' WHERE name LIKE N'%dịch%' OR name LIKE '%dá»‹%';
UPDATE service_fee SET name = N'Rác' WHERE name LIKE '%R%c%' OR name LIKE '%RÃ¡c%' OR name LIKE '%RĂ¡c%';

UPDATE building SET name = N'Test Building A', address = N'123 Nguyễn Trãi, Hà Nội' WHERE name LIKE '%Building A%';
UPDATE building SET name = N'Test Building B', address = N'456 Lê Lợi, TP. Hồ Chí Minh' WHERE name LIKE '%Building B%';




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

-- Seed Tenant Hoàng Đức Thuận
IF NOT EXISTS (SELECT 1 FROM tenant WHERE email = 'thuanhdhe186818@fpt.edu.vn')
    INSERT INTO tenant (name, date_of_birth, phone_number, permanent_address, citizen_id, email)
    VALUES (N'Hoàng Đức Thuận', '2000-01-01', '0912345678', N'Hà Nội', '001200123456', 'thuanhdhe186818@fpt.edu.vn');

-- Mark room as OCCUPIED
IF NOT EXISTS (SELECT 1 FROM [contract] c JOIN room r ON c.room_code = r.room_code WHERE r.room_code = 'A101' AND c.status = 'ACTIVE')
    UPDATE room SET status = 'RENTED' WHERE room_code = 'A101';

-- Insert contract
IF NOT EXISTS (SELECT 1 FROM [contract] c JOIN room r ON c.room_code = r.room_code WHERE r.room_code = 'A101' AND c.status = 'ACTIVE')
    INSERT INTO [contract] (rent, deposit_amount, start_date, end_date, status, initial_electricity_index, initial_water_index, room_code)
    VALUES (5000000.00, 5000000.00, '2026-01-01', '2027-01-01', 'ACTIVE', 100, 50, 'A101');

-- Link tenant
IF NOT EXISTS (SELECT 1 FROM contract_tenants ct JOIN [contract] c ON ct.contract_id = c.contract_id WHERE c.room_code = 'A101' AND c.status = 'ACTIVE')
    INSERT INTO contract_tenants (contract_id, tenant_id, is_contract_holder, join_date)
    SELECT c.contract_id, t.tenant_id, 1, '2026-01-01'
    FROM [contract] c, tenant t
    WHERE c.room_code = 'A101' AND c.status = 'ACTIVE' AND t.email = 'thuanhdhe186818@fpt.edu.vn';

-- Insert service fee 1
IF NOT EXISTS (SELECT 1 FROM service_fee sf JOIN [contract] c ON sf.contract_id = c.contract_id WHERE c.room_code = 'A101' AND c.status = 'ACTIVE' AND sf.name = N'Tiền điện')
    INSERT INTO service_fee (name, fee, charge_type, contract_id)
    SELECT N'Tiền điện', 3500.00, 'PER_INDEX', c.contract_id
    FROM [contract] c
    WHERE c.room_code = 'A101' AND c.status = 'ACTIVE';

-- Insert service fee 2
IF NOT EXISTS (SELECT 1 FROM service_fee sf JOIN [contract] c ON sf.contract_id = c.contract_id WHERE c.room_code = 'A101' AND c.status = 'ACTIVE' AND sf.name = N'Tiền nước')
    INSERT INTO service_fee (name, fee, charge_type, contract_id)
    SELECT N'Tiền nước', 15000.00, 'PER_INDEX', c.contract_id
    FROM [contract] c
    WHERE c.room_code = 'A101' AND c.status = 'ACTIVE';

-- Insert service fee 3
IF NOT EXISTS (SELECT 1 FROM service_fee sf JOIN [contract] c ON sf.contract_id = c.contract_id WHERE c.room_code = 'A101' AND c.status = 'ACTIVE' AND sf.name = N'Phí dịch vụ chung')
    INSERT INTO service_fee (name, fee, charge_type, contract_id)
    SELECT N'Phí dịch vụ chung', 100000.00, 'PER_ROOM', c.contract_id
    FROM [contract] c
    WHERE c.room_code = 'A101' AND c.status = 'ACTIVE';

-- Mark room B101 as OCCUPIED
IF NOT EXISTS (SELECT 1 FROM [contract] c JOIN room r ON c.room_code = r.room_code WHERE r.room_code = 'B101' AND c.status = 'ACTIVE')
    UPDATE room SET status = 'RENTED' WHERE room_code = 'B101';

-- Insert contract for Room B101
IF NOT EXISTS (SELECT 1 FROM [contract] c JOIN room r ON c.room_code = r.room_code WHERE r.room_code = 'B101' AND c.status = 'ACTIVE')
    INSERT INTO [contract] (rent, deposit_amount, start_date, end_date, status, initial_electricity_index, initial_water_index, room_code)
    VALUES (3000000.00, 3000000.00, '2026-01-01', '2027-01-01', 'ACTIVE', 100, 50, 'B101');

-- Link tenant "Hoàng Đức Thuận" to B101 contract
IF NOT EXISTS (SELECT 1 FROM contract_tenants ct JOIN [contract] c ON ct.contract_id = c.contract_id WHERE c.room_code = 'B101' AND c.status = 'ACTIVE')
    INSERT INTO contract_tenants (contract_id, tenant_id, is_contract_holder, join_date)
    SELECT c.contract_id, t.tenant_id, 1, '2026-01-01'
    FROM [contract] c, tenant t
    WHERE c.room_code = 'B101' AND c.status = 'ACTIVE' AND t.email = 'thuanhdhe186818@fpt.edu.vn';

-- Insert service fees for B101 contract
IF NOT EXISTS (SELECT 1 FROM service_fee sf JOIN [contract] c ON sf.contract_id = c.contract_id WHERE c.room_code = 'B101' AND c.status = 'ACTIVE' AND sf.name = N'Tiền điện')
    INSERT INTO service_fee (name, fee, charge_type, contract_id)
    SELECT N'Tiền điện', 3500.00, 'PER_INDEX', c.contract_id
    FROM [contract] c
    WHERE c.room_code = 'B101' AND c.status = 'ACTIVE';

IF NOT EXISTS (SELECT 1 FROM service_fee sf JOIN [contract] c ON sf.contract_id = c.contract_id WHERE c.room_code = 'B101' AND c.status = 'ACTIVE' AND sf.name = N'Tiền nước')
    INSERT INTO service_fee (name, fee, charge_type, contract_id)
    SELECT N'Tiền nước', 15000.00, 'PER_INDEX', c.contract_id
    FROM [contract] c
    WHERE c.room_code = 'B101' AND c.status = 'ACTIVE';

IF NOT EXISTS (SELECT 1 FROM service_fee sf JOIN [contract] c ON sf.contract_id = c.contract_id WHERE c.room_code = 'B101' AND c.status = 'ACTIVE' AND sf.name = N'Phí dịch vụ chung')
    INSERT INTO service_fee (name, fee, charge_type, contract_id)
    SELECT N'Phí dịch vụ chung', 100000.00, 'PER_ROOM', c.contract_id
    FROM [contract] c
    WHERE c.room_code = 'B101' AND c.status = 'ACTIVE';

-- Seed Agribank Bank Account A
IF NOT EXISTS (SELECT 1 FROM bank_account WHERE account_number = '3511205288130')
    INSERT INTO bank_account (bank_name, account_number, user_name)
    VALUES (N'Agribank', '3511205288130', N'HOANG DUC THUAN');

-- Seed Agribank Bank Account B
IF NOT EXISTS (SELECT 1 FROM bank_account WHERE account_number = '3511205288131')
    INSERT INTO bank_account (bank_name, account_number, user_name)
    VALUES (N'Agribank', '3511205288131', N'HOANG DUC THUAN');

-- Reset bank_account_id to NULL to allow clean unique updates
UPDATE building SET bank_account_id = NULL;

-- Link Bank Account A to Test Building A (ID 1)
UPDATE building 
SET bank_account_id = (SELECT TOP 1 bank_account_id FROM bank_account WHERE account_number = '3511205288130')
WHERE building_id = 1;

-- Link Bank Account B to Test Building B (ID 2)
UPDATE building 
SET bank_account_id = (SELECT TOP 1 bank_account_id FROM bank_account WHERE account_number = '3511205288131')
WHERE building_id = 2;

-- Seed Email Configuration for Test Building A
IF NOT EXISTS (SELECT 1 FROM email_configuration ec JOIN building b ON ec.building_id = b.building_id WHERE b.name = N'Test Building A')
    INSERT INTO email_configuration (invoice_send_day, contract_expiry_reminder_days, is_invoice_auto_send, is_expiry_reminder_auto_send, smtp_host, smtp_port, smtp_username, smtp_password, smtp_auth, smtp_starttls, building_id)
    SELECT 5, 30, 1, 1, 'smtp.gmail.com', 587, 'holamanagement1712@gmail.com', 'zkyhrdzfxkzypyip', 1, 1, building_id
    FROM building
    WHERE name = N'Test Building A';

-- Seed Email Configuration for Test Building B
IF NOT EXISTS (SELECT 1 FROM email_configuration ec JOIN building b ON ec.building_id = b.building_id WHERE b.name = N'Test Building B')
    INSERT INTO email_configuration (invoice_send_day, contract_expiry_reminder_days, is_invoice_auto_send, is_expiry_reminder_auto_send, smtp_host, smtp_port, smtp_username, smtp_password, smtp_auth, smtp_starttls, building_id)
    SELECT 5, 30, 1, 1, 'smtp.gmail.com', 587, 'holamanagement1712@gmail.com', 'zkyhrdzfxkzypyip', 1, 1, building_id
    FROM building
    WHERE name = N'Test Building B';




