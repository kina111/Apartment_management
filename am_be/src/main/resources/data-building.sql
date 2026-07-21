-- Accounts seeding
IF NOT EXISTS (SELECT 1 FROM [account] WHERE email = 'landlord.test@ams.local')
    INSERT INTO [account] (account_name, password, email, role, status)
    VALUES ('landlord_test', '123456', 'landlord.test@ams.local', 'LANDLORD', 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM [account] WHERE email = 'manager.test@ams.local')
    INSERT INTO [account] (account_name, password, email, role, status)
    VALUES ('manager_test', '123456', 'manager.test@ams.local', 'MANAGER', 'ACTIVE');

IF NOT EXISTS (SELECT 1 FROM [account] WHERE email = 'admin.test@ams.local')
    INSERT INTO [account] (account_name, password, email, role, status)
    VALUES ('admin_test', '123456', 'admin.test@ams.local', 'ADMIN', 'ACTIVE');

-- Buildings seeding
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

-- Building Images
IF NOT EXISTS (SELECT 1 FROM building_image WHERE url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg')
    INSERT INTO building_image (url, building_id)
    SELECT 'https://res.cloudinary.com/demo/image/upload/sample.jpg', building_id
    FROM building
    WHERE name = N'Test Building A';

-- Room Types
IF NOT EXISTS (SELECT 1 FROM room_type WHERE name = N'Standard')
    INSERT INTO room_type (name, capacity, area, description)
    VALUES (N'Standard', 2, 25.0, N'Basic room type for dev testing');

IF NOT EXISTS (SELECT 1 FROM room_type WHERE name = N'Deluxe')
    INSERT INTO room_type (name, capacity, area, description)
    VALUES (N'Deluxe', 3, 35.0, N'Larger room type for dev testing');

IF NOT EXISTS (SELECT 1 FROM room_type WHERE name = N'Studio')
    INSERT INTO room_type (name, capacity, area, description)
    VALUES (N'Studio', 1, 30.0, N'Studio room type for dev testing');

-- Rooms seeding (Using AVAILABLE status)
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

IF NOT EXISTS (SELECT 1 FROM room WHERE room_code = 'A102')
    INSERT INTO room (room_code, floor_number, status, building_id, room_type_id)
    SELECT 'A102', 1, 'RENTED', b.building_id, rt.room_type_id
    FROM building b
    CROSS JOIN room_type rt
    WHERE b.name = N'Test Building A' AND rt.name = N'Standard';

IF NOT EXISTS (SELECT 1 FROM room WHERE room_code = 'B101')
    INSERT INTO room (room_code, floor_number, status, building_id, room_type_id)
    SELECT 'B101', 1, 'AVAILABLE', b.building_id, rt.room_type_id
    FROM building b
    CROSS JOIN room_type rt
    WHERE b.name = N'Test Building B' AND rt.name = N'Studio';

-- Tenants seeding
IF NOT EXISTS (SELECT 1 FROM tenant WHERE phone_number = '0912345678')
    INSERT INTO tenant (name, date_of_birth, phone_number, permanent_address, citizen_id, email)
    VALUES (N'Trần Văn B', '1995-05-15', '0912345678', N'Hà Nội, Việt Nam', '987654321012', 'tranvanb@test.local');

IF NOT EXISTS (SELECT 1 FROM tenant WHERE phone_number = '0908765432')
    INSERT INTO tenant (name, date_of_birth, phone_number, permanent_address, citizen_id, email)
    VALUES (N'Lê Thị C', '1998-10-22', '0908765432', N'Đà Nẵng, Việt Nam', '123456789012', 'lethic@test.local');

-- Contract seeding (Active Contract for A102 held by Trần Văn B)
IF NOT EXISTS (SELECT 1 FROM contract WHERE room_code = 'A102' AND status = 'ACTIVE')
BEGIN
    DECLARE @ContractId TABLE (id BIGINT);
    
    INSERT INTO contract (rent, deposit_amount, start_date, end_date, status, room_code)
    OUTPUT INSERTED.contract_id INTO @ContractId
    VALUES (5000000, 10000000, '2026-01-01', '2026-12-31', 'ACTIVE', 'A102');

    DECLARE @NewContractId BIGINT;
    SELECT TOP 1 @NewContractId = id FROM @ContractId;

    -- Add ContractTenant Link
    INSERT INTO contract_tenants (contract_id, tenant_id, is_contract_holder, join_date)
    SELECT @NewContractId, tenant_id, 1, '2026-01-01'
    FROM tenant
    WHERE phone_number = '0912345678';

    -- Add Service Fees
    INSERT INTO service_fee (name, fee, charge_type, contract_id)
    VALUES 
    (N'Điện', 4000, 'PER_INDEX', @NewContractId),
    (N'Nước', 30000, 'PER_ROOM', @NewContractId);
END

-- Link manager.test@ams.local to Test Building A and Test Building B
IF EXISTS (SELECT 1 FROM [account] WHERE email = 'manager.test@ams.local')
BEGIN
    DECLARE @ManagerId BIGINT;
    SELECT @ManagerId = account_id FROM [account] WHERE email = 'manager.test@ams.local';

    IF NOT EXISTS (SELECT 1 FROM account_buildings WHERE account_id = @ManagerId AND building_id IN (SELECT building_id FROM building WHERE name = N'Test Building A'))
        INSERT INTO account_buildings (account_id, building_id)
        SELECT @ManagerId, building_id FROM building WHERE name = N'Test Building A';

    IF NOT EXISTS (SELECT 1 FROM account_buildings WHERE account_id = @ManagerId AND building_id IN (SELECT building_id FROM building WHERE name = N'Test Building B'))
        INSERT INTO account_buildings (account_id, building_id)
        SELECT @ManagerId, building_id FROM building WHERE name = N'Test Building B';
END
