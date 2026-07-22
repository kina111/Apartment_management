import {useEffect, useState} from "react";
import {Badge, Button, Modal} from "react-bootstrap";
import {Link, useParams, useSearchParams} from "react-router-dom";
import {createOrUpdateBuilding, getBuildingDetail, updateBuildingBankAccount} from "../services/buildingApi.js";
import {
    createRoomType,
    deleteRoomType,
    getRoomsByBuilding,
    getRoomTypes,
    quickCreateRoom,
    updateRoomType,
} from "../../rooms/services/roomApi.js";
import {getErrorMessage} from "../../../shared/services/errorUtils.js";
import {useAuth} from "../../../shared/context/AuthContext.jsx";
import "../buildings.css";

const initialRoomTypeForm = {
    name: "",
    capacity: "",
    area: "",
    description: "",
};

const initialQuickRoomForm = {
    roomName: "",
    roomTypeId: "",
};

const initialBuildingForm = {
    name: "",
    address: "",
    numberOfFloor: "",
    area: "",
    numberOfBasement: "",
    totalRooms: "",
    yearBuilt: "",
    phoneNumber: "",
    email: "",
    description: "",
};

const initialBankAccount = {
    bankName: "",
    accountNumber: "",
    userName: "",
};

function toFormValue(value) {
    return value ?? "";
}

function mapBankAccountToForm(bankAccount) {
    return {
        bankName: toFormValue(bankAccount?.bankName),
        accountNumber: toFormValue(bankAccount?.accountNumber),
        userName: toFormValue(bankAccount?.userName),
    };
}

const currentYear = new Date().getFullYear();

function mapBuildingToForm(building) {
    return {
        name: toFormValue(building.name),
        address: toFormValue(building.address),
        numberOfFloor: toFormValue(building.numberOfFloor),
        area: toFormValue(building.area),
        numberOfBasement: toFormValue(building.numberOfBasement),
        totalRooms: toFormValue(building.totalRooms),
        yearBuilt: toFormValue(building.yearBuilt),
        phoneNumber: toFormValue(building.phoneNumber),
        email: toFormValue(building.email),
        description: toFormValue(building.description),
    };
}

function optionalNumber(value) {
    return value === "" ? undefined : Number(value);
}

function validateBuilding(building) {
    const errors = {};

    if (!building.name.trim()) errors.name = "Tên toà nhà là bắt buộc";
    if (!building.address.trim()) errors.address = "Địa chỉ là bắt buộc";

    const floor = Number(building.numberOfFloor);

    if (!building.numberOfFloor) {
        errors.numberOfFloor = "Số tầng là bắt buộc";
    } else if (!Number.isInteger(floor) || floor <= 0 || floor > 50) {
        errors.numberOfFloor = "Số tầng phải là số nguyên từ 1 đến 50";
    }

    if (building.area) {
        const area = Number(building.area);
        if (!Number.isFinite(area) || area <= 0) errors.area = "Diện tích phải lớn hơn 0";
    }

    if (building.numberOfBasement) {
        const basement = Number(building.numberOfBasement);
        if (!Number.isInteger(basement) || basement < 0) errors.numberOfBasement = "Số tầng hầm phải là số nguyên không âm";
    }

    if (building.totalRooms) {
        const totalRooms = Number(building.totalRooms);
        if (!Number.isInteger(totalRooms) || totalRooms < 0) errors.totalRooms = "Tổng số phòng phải là số nguyên không âm";
    }

    if (building.yearBuilt) {
        const yearBuilt = Number(building.yearBuilt);
        if (!Number.isInteger(yearBuilt) || yearBuilt < 1800 || yearBuilt > currentYear) {
            errors.yearBuilt = `Năm xây dựng phải từ 1800 đến ${currentYear}`;
        }
    }

    if (building.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(building.email.trim())) {
        errors.email = "Email không hợp lệ";
    }

    return errors;
}

function validateBankAccount(bankAccount) {
    const errors = {};

    if (!bankAccount.bankName.trim()) errors.bankName = "Tên ngân hàng là bắt buộc";

    if (!bankAccount.accountNumber.trim()) {
        errors.accountNumber = "Số tài khoản là bắt buộc";
    } else if (!/^\d{6,30}$/.test(bankAccount.accountNumber.trim())) {
        errors.accountNumber = "Số tài khoản phải gồm 6-30 chữ số";
    }

    if (!bankAccount.userName.trim()) errors.userName = "Tên chủ tài khoản là bắt buộc";

    return errors;
}

function validateRoomType(roomType) {
    const errors = {};

    if (!roomType.name.trim()) errors.name = "Tên loại phòng là bắt buộc";

    const capacity = Number(roomType.capacity);
    if (!roomType.capacity) {
        errors.capacity = "Sức chứa là bắt buộc";
    } else if (!Number.isInteger(capacity) || capacity <= 0) {
        errors.capacity = "Sức chứa phải là số nguyên lớn hơn 0";
    }

    const area = Number(roomType.area);
    if (!roomType.area) {
        errors.area = "Diện tích là bắt buộc";
    } else if (!Number.isFinite(area) || area <= 0) {
        errors.area = "Diện tích phải lớn hơn 0";
    }

    return errors;
}

function validateQuickRoom(room) {
    const errors = {};

    if (!room.roomName.trim()) errors.roomName = "Tên phòng là bắt buộc";
    if (!room.roomTypeId) errors.roomTypeId = "Loại phòng là bắt buộc";

    return errors;
}

function mapRoomTypeToForm(roomType) {
    return {
        name: toFormValue(roomType.name),
        capacity: toFormValue(roomType.capacity),
        area: toFormValue(roomType.area),
        description: toFormValue(roomType.description),
    };
}

function DetailField({label, value}) {
    return (
        <div className="building-detail-readonly-field">
            <span>{label}</span>
            <strong>{value || "-"}</strong>
        </div>
    );
}

function BuildingDetailPage() {
    const {buildingId} = useParams();
    const [searchParams] = useSearchParams();
    const {role} = useAuth();
    const canManageBuilding = role !== "MANAGER";
    const [building, setBuilding] = useState(null);
    const [buildingForm, setBuildingForm] = useState(initialBuildingForm);
    const [buildingErrors, setBuildingErrors] = useState({});
    const [buildingSubmitError, setBuildingSubmitError] = useState("");
    const [buildingSubmitSuccess, setBuildingSubmitSuccess] = useState("");
    const [bankAccount, setBankAccount] = useState(initialBankAccount);
    const [bankErrors, setBankErrors] = useState({});
    const [isEditingBank, setIsEditingBank] = useState(false);
    const [isEditingBuilding, setIsEditingBuilding] = useState(canManageBuilding && searchParams.get("edit") === "1");
    const [activeTab, setActiveTab] = useState("building");
    const [roomTypes, setRoomTypes] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [roomTypeForm, setRoomTypeForm] = useState(initialRoomTypeForm);
    const [roomTypeErrors, setRoomTypeErrors] = useState({});
    const [editingRoomTypeId, setEditingRoomTypeId] = useState(null);
    const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);
    const [roomTypeSubmitError, setRoomTypeSubmitError] = useState("");
    const [roomTypeSubmitSuccess, setRoomTypeSubmitSuccess] = useState("");
    const [quickRoomFloor, setQuickRoomFloor] = useState(null);
    const [quickRoomForm, setQuickRoomForm] = useState(initialQuickRoomForm);
    const [quickRoomErrors, setQuickRoomErrors] = useState({});
    const [quickRoomSubmitError, setQuickRoomSubmitError] = useState("");
    const [quickRoomSubmitSuccess, setQuickRoomSubmitSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingBuilding, setIsSavingBuilding] = useState(false);
    const [isSavingBank, setIsSavingBank] = useState(false);
    const [isLoadingRoomConfig, setIsLoadingRoomConfig] = useState(false);
    const [isSavingRoomType, setIsSavingRoomType] = useState(false);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [images, setImages] = useState([]);
    const [loadError, setLoadError] = useState("");
    const [bankSubmitError, setBankSubmitError] = useState("");
    const [bankSubmitSuccess, setBankSubmitSuccess] = useState("");

    useEffect(() => {
        let isCurrent = true;

        async function loadBuilding() {
            setIsLoading(true);
            setLoadError("");

            try {
                const data = await getBuildingDetail(buildingId);

                if (isCurrent) {
                    setBuilding(data);
                    setBuildingForm(mapBuildingToForm(data));
                    setBankAccount(mapBankAccountToForm(data.bankAccount));
                }
            } catch (error) {
                if (isCurrent) setLoadError(getErrorMessage(error, "Không thể tải thông tin tòa nhà"));
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        }

        loadBuilding();

        return () => {
            isCurrent = false;
        };
    }, [buildingId]);

    useEffect(() => {
        if (activeTab !== "rooms") return;

        let isCurrent = true;

        async function loadRoomConfig() {
            setIsLoadingRoomConfig(true);
            setRoomTypeSubmitError("");
            setQuickRoomSubmitError("");

            try {
                const [roomTypeData, roomData] = await Promise.all([
                    getRoomTypes(),
                    getRoomsByBuilding(buildingId),
                ]);

                if (isCurrent) {
                    setRoomTypes(roomTypeData);
                    setRooms(roomData);
                }
            } catch (error) {
                if (isCurrent) setRoomTypeSubmitError(getErrorMessage(error, "Không thể tải cấu hình phòng"));
            } finally {
                if (isCurrent) setIsLoadingRoomConfig(false);
            }
        }

        loadRoomConfig();

        return () => {
            isCurrent = false;
        };
    }, [activeTab, buildingId]);

    const handleBankChange = (event) => {
        if (!canManageBuilding) return;

        const {name, value} = event.target;

        setBankAccount((current) => ({...current, [name]: value}));
        setBankErrors((current) => ({...current, [name]: ""}));
        setBankSubmitError("");
        setBankSubmitSuccess("");
    };

    const handleBuildingChange = (event) => {
        if (!canManageBuilding) return;

        const {name, value} = event.target;

        setBuildingForm((current) => ({...current, [name]: value}));
        setBuildingErrors((current) => ({...current, [name]: ""}));
        setBuildingSubmitError("");
        setBuildingSubmitSuccess("");
    };

    const handleImagesChange = (event) => {
        if (!canManageBuilding) return;

        setImages(Array.from(event.target.files || []));
    };

    const handleRoomTypeChange = (event) => {
        if (!canManageBuilding) return;

        const {name, value} = event.target;

        setRoomTypeForm((current) => ({...current, [name]: value}));
        setRoomTypeErrors((current) => ({...current, [name]: ""}));
        setRoomTypeSubmitError("");
        setRoomTypeSubmitSuccess("");
    };

    const handleQuickRoomChange = (event) => {
        if (!canManageBuilding) return;

        const {name, value} = event.target;

        setQuickRoomForm((current) => ({...current, [name]: value}));
        setQuickRoomErrors((current) => ({...current, [name]: ""}));
        setQuickRoomSubmitError("");
        setQuickRoomSubmitSuccess("");
    };

    const cancelBuildingEdit = () => {
        setBuildingForm(mapBuildingToForm(building));
        setImages([]);
        setBuildingErrors({});
        setBuildingSubmitError("");
        setBuildingSubmitSuccess("");
        setIsEditingBuilding(false);
    };

    const handleBuildingSubmit = async (event) => {
        event.preventDefault();

        if (!canManageBuilding) return;

        const validationErrors = validateBuilding(buildingForm);
        setBuildingErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        const payload = {
            buildingId,
            name: buildingForm.name,
            address: buildingForm.address,
            numberOfFloor: Number(buildingForm.numberOfFloor),
            area: optionalNumber(buildingForm.area),
            numberOfBasement: optionalNumber(buildingForm.numberOfBasement),
            totalRooms: optionalNumber(buildingForm.totalRooms),
            yearBuilt: optionalNumber(buildingForm.yearBuilt),
            phoneNumber: buildingForm.phoneNumber,
            email: buildingForm.email,
            description: buildingForm.description,
        };

        setIsSavingBuilding(true);
        setBuildingSubmitError("");
        setBuildingSubmitSuccess("");

        try {
            const updatedBuilding = await createOrUpdateBuilding(payload, images);
            const mergedBuilding = {
                ...building,
                ...updatedBuilding,
                bankAccount: building.bankAccount,
                imageUrls: updatedBuilding.imageUrls ?? building.imageUrls,
            };

            setBuilding(mergedBuilding);
            setBuildingForm(mapBuildingToForm(mergedBuilding));
            setImages([]);
            setIsEditingBuilding(false);
            setBuildingSubmitSuccess("Đã cập nhật thông tin tòa nhà");
        } catch (error) {
            setBuildingSubmitError(getErrorMessage(error, "Không thể cập nhật tòa nhà"));
        } finally {
            setIsSavingBuilding(false);
        }
    };

    const handleBankSubmit = async (event) => {
        event.preventDefault();

        if (!canManageBuilding) return;

        const validationErrors = validateBankAccount(bankAccount);
        setBankErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        setIsSavingBank(true);
        setBankSubmitError("");
        setBankSubmitSuccess("");

        try {
            const updatedBankAccount = await updateBuildingBankAccount(buildingId, bankAccount);
            setBuilding((current) => ({...current, bankAccount: updatedBankAccount}));
            setBankAccount(mapBankAccountToForm(updatedBankAccount));
            setIsEditingBank(false);
            setBankSubmitSuccess("Đã lưu tài khoản nhận tiền");
        } catch (error) {
            setBankSubmitError(getErrorMessage(error, "Không thể lưu tài khoản nhận tiền"));
        } finally {
            setIsSavingBank(false);
        }
    };

    const startEditRoomType = (roomType) => {
        if (!canManageBuilding) return;

        setEditingRoomTypeId(roomType.roomTypeId);
        setRoomTypeForm(mapRoomTypeToForm(roomType));
        setRoomTypeErrors({});
        setRoomTypeSubmitError("");
        setRoomTypeSubmitSuccess("");
        setShowRoomTypeModal(true);
    };

    const openCreateRoomTypeModal = () => {
        if (!canManageBuilding) return;

        setEditingRoomTypeId(null);
        setRoomTypeForm(initialRoomTypeForm);
        setRoomTypeErrors({});
        setRoomTypeSubmitError("");
        setRoomTypeSubmitSuccess("");
        setShowRoomTypeModal(true);
    };

    const cancelRoomTypeEdit = () => {
        setEditingRoomTypeId(null);
        setRoomTypeForm(initialRoomTypeForm);
        setRoomTypeErrors({});
        setRoomTypeSubmitError("");
        setShowRoomTypeModal(false);
    };

    const handleRoomTypeSubmit = async (event) => {
        event.preventDefault();

        if (!canManageBuilding) return;

        const validationErrors = validateRoomType(roomTypeForm);
        setRoomTypeErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        const payload = {
            name: roomTypeForm.name,
            capacity: Number(roomTypeForm.capacity),
            area: Number(roomTypeForm.area),
            description: roomTypeForm.description,
        };

        setIsSavingRoomType(true);
        setRoomTypeSubmitError("");
        setRoomTypeSubmitSuccess("");

        try {
            const savedRoomType = editingRoomTypeId
                ? await updateRoomType(editingRoomTypeId, payload)
                : await createRoomType(payload);

            setRoomTypes((current) => editingRoomTypeId
                ? current.map((roomType) => roomType.roomTypeId === editingRoomTypeId ? savedRoomType : roomType)
                : [savedRoomType, ...current]
            );
            setEditingRoomTypeId(null);
            setRoomTypeForm(initialRoomTypeForm);
            setShowRoomTypeModal(false);
            setRoomTypeSubmitSuccess(editingRoomTypeId ? "Đã cập nhật loại phòng" : "Đã thêm loại phòng");
        } catch (error) {
            setRoomTypeSubmitError(getErrorMessage(error, "Không thể lưu loại phòng"));
        } finally {
            setIsSavingRoomType(false);
        }
    };

    const handleDeleteRoomType = async (roomTypeId) => {
        if (!canManageBuilding) return;

        setRoomTypeSubmitError("");
        setRoomTypeSubmitSuccess("");

        try {
            await deleteRoomType(roomTypeId);
            setRoomTypes((current) => current.filter((roomType) => roomType.roomTypeId !== roomTypeId));
            setRoomTypeSubmitSuccess("Đã xóa loại phòng");
        } catch (error) {
            setRoomTypeSubmitError(getErrorMessage(error, "Không thể xóa loại phòng"));
        }
    };

    const openQuickRoomForm = (floorNumber) => {
        if (!canManageBuilding) return;

        setQuickRoomFloor(floorNumber);
        setQuickRoomForm({
            roomName: "",
            roomTypeId: roomTypes[0]?.roomTypeId ? String(roomTypes[0].roomTypeId) : "",
        });
        setQuickRoomErrors({});
        setQuickRoomSubmitError("");
        setQuickRoomSubmitSuccess("");
    };

    const cancelQuickRoomForm = () => {
        setQuickRoomFloor(null);
        setQuickRoomForm(initialQuickRoomForm);
        setQuickRoomErrors({});
        setQuickRoomSubmitError("");
    };

    const handleQuickRoomSubmit = async (event) => {
        event.preventDefault();

        if (!canManageBuilding) return;

        const validationErrors = validateQuickRoom(quickRoomForm);
        setQuickRoomErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        setIsCreatingRoom(true);
        setQuickRoomSubmitError("");
        setQuickRoomSubmitSuccess("");

        try {
            const createdRoom = await quickCreateRoom(buildingId, {
                roomName: quickRoomForm.roomName,
                floorNumber: quickRoomFloor,
                roomTypeId: Number(quickRoomForm.roomTypeId),
            });
            setRooms((current) => [...current, createdRoom]);
            setQuickRoomFloor(null);
            setQuickRoomForm(initialQuickRoomForm);
            setQuickRoomSubmitSuccess("Đã tạo phòng nhanh");
        } catch (error) {
            setQuickRoomSubmitError(getErrorMessage(error, "Không thể tạo phòng"));
        } finally {
            setIsCreatingRoom(false);
        }
    };

    if (isLoading) return <div className="building-empty-state">Đang tải thông tin tòa nhà...</div>;

    if (loadError) {
        return (
            <div className="building-create-page">
                <p className="building-alert building-alert--danger">{loadError}</p>
                <Button as={Link} variant="outline-secondary" to="/buildings">Trở về</Button>
            </div>
        );
    }

    const hasBankAccount = Boolean(building.bankAccount);

    return (
        <div className="building-create-page">
            <header className="page-header building-detail-header">
                <div>
                    <h1 className="page-title">Chi tiết tòa nhà</h1>
                </div>
                <div className="building-detail-actions">
                    <Button as={Link} variant="outline-secondary" to="/buildings">Trở về</Button>
                </div>
            </header>

            <div className="building-detail-tabs" role="tablist" aria-label="Chi tiết tòa nhà">
                <button
                    className={`building-detail-tab ${activeTab === "building" ? "building-detail-tab--active" : ""}`}
                    type="button"
                    onClick={() => setActiveTab("building")}
                    role="tab"
                    aria-selected={activeTab === "building"}
                >
                    Thông tin tòa nhà
                </button>
                <button
                    className={`building-detail-tab ${activeTab === "bank" ? "building-detail-tab--active" : ""}`}
                    type="button"
                    onClick={() => setActiveTab("bank")}
                    role="tab"
                    aria-selected={activeTab === "bank"}
                >
                    Tài khoản nhận tiền
                    <Badge bg={hasBankAccount ? "success" : "secondary"} className="ms-2">
                        {hasBankAccount ? "Đã cấu hình" : "Chưa cấu hình"}
                    </Badge>
                </button>
                <button
                    className={`building-detail-tab ${activeTab === "rooms" ? "building-detail-tab--active" : ""}`}
                    type="button"
                    onClick={() => setActiveTab("rooms")}
                    role="tab"
                    aria-selected={activeTab === "rooms"}
                >
                    Cấu hình phòng
                </button>
            </div>

            {activeTab === "building" && (
                <>
            <section className="section-card building-form-card">
                <div className="section-card-header building-form-header">
                    <div>
                        <h2 className="building-section-title">Thông tin tòa nhà</h2>
                    </div>
                    {canManageBuilding && !isEditingBuilding && (
                        <Button type="button" onClick={() => setIsEditingBuilding(true)}>Chỉnh sửa</Button>
                    )}
                </div>

                <div className="section-card-body">
                    {buildingSubmitError && <p className="building-alert building-alert--danger">{buildingSubmitError}</p>}
                    {buildingSubmitSuccess && <p className="building-alert building-alert--success">{buildingSubmitSuccess}</p>}

                    {isEditingBuilding ? (
                        <form className="building-form" onSubmit={handleBuildingSubmit}>
                            <div className="building-form-grid">
                                <div className="building-field">
                                    <label className="building-label">Tên tòa nhà <span className="required-mark">*</span></label>
                                    <input className={`building-control ${buildingErrors.name ? "building-control--invalid" : ""}`} name="name" value={buildingForm.name} onChange={handleBuildingChange} placeholder="Nhập tên tòa nhà"/>
                                    {buildingErrors.name && <p className="building-error">{buildingErrors.name}</p>}
                                </div>
                                <div className="building-field">
                                    <label className="building-label">Địa chỉ <span className="required-mark">*</span></label>
                                    <input className={`building-control ${buildingErrors.address ? "building-control--invalid" : ""}`} name="address" value={buildingForm.address} onChange={handleBuildingChange} placeholder="Nhập địa chỉ"/>
                                    {buildingErrors.address && <p className="building-error">{buildingErrors.address}</p>}
                                </div>
                                <div className="building-field">
                                    <label className="building-label">Số tầng <span className="required-mark">*</span></label>
                                    <input className={`building-control ${buildingErrors.numberOfFloor ? "building-control--invalid" : ""}`} name="numberOfFloor" value={buildingForm.numberOfFloor} onChange={handleBuildingChange} type="number" min="1" max="50" placeholder="Nhập số tầng"/>
                                    {buildingErrors.numberOfFloor && <p className="building-error">{buildingErrors.numberOfFloor}</p>}
                                </div>
                                <div className="building-field">
                                    <label className="building-label">Diện tích (m²)</label>
                                    <input className={`building-control ${buildingErrors.area ? "building-control--invalid" : ""}`} name="area" value={buildingForm.area} onChange={handleBuildingChange} type="number" min="0" step="0.01" placeholder="Nhập diện tích"/>
                                    {buildingErrors.area && <p className="building-error">{buildingErrors.area}</p>}
                                </div>
                                <div className="building-field">
                                    <label className="building-label">Số tầng hầm</label>
                                    <input className={`building-control ${buildingErrors.numberOfBasement ? "building-control--invalid" : ""}`} name="numberOfBasement" value={buildingForm.numberOfBasement} onChange={handleBuildingChange} type="number" min="0" placeholder="Nhập số tầng hầm"/>
                                    {buildingErrors.numberOfBasement && <p className="building-error">{buildingErrors.numberOfBasement}</p>}
                                </div>
                                <div className="building-field">
                                    <label className="building-label">Tổng số phòng</label>
                                    <input className={`building-control ${buildingErrors.totalRooms ? "building-control--invalid" : ""}`} name="totalRooms" value={buildingForm.totalRooms} onChange={handleBuildingChange} type="number" min="0" placeholder="Nhập tổng số phòng"/>
                                    {buildingErrors.totalRooms && <p className="building-error">{buildingErrors.totalRooms}</p>}
                                </div>
                                <div className="building-field">
                                    <label className="building-label">Năm xây dựng</label>
                                    <input className={`building-control ${buildingErrors.yearBuilt ? "building-control--invalid" : ""}`} name="yearBuilt" value={buildingForm.yearBuilt} onChange={handleBuildingChange} type="number" min="1800" max={currentYear} placeholder="Nhập năm xây dựng"/>
                                    {buildingErrors.yearBuilt && <p className="building-error">{buildingErrors.yearBuilt}</p>}
                                </div>
                                <div className="building-field">
                                    <label className="building-label">Số điện thoại liên hệ</label>
                                    <input className="building-control" name="phoneNumber" value={buildingForm.phoneNumber} onChange={handleBuildingChange} placeholder="Nhập số điện thoại"/>
                                </div>
                                <div className="building-field">
                                    <label className="building-label">Email liên hệ</label>
                                    <input className={`building-control ${buildingErrors.email ? "building-control--invalid" : ""}`} name="email" value={buildingForm.email} onChange={handleBuildingChange} type="email" placeholder="Nhập email liên hệ"/>
                                    {buildingErrors.email && <p className="building-error">{buildingErrors.email}</p>}
                                </div>
                                <div className="building-field building-field--full">
                                    <label className="building-label">Mô tả</label>
                                    <textarea className="building-control building-textarea" name="description" value={buildingForm.description} onChange={handleBuildingChange} placeholder="Nhập mô tả" rows={4}/>
                                </div>
                                <div className="building-field building-field--full">
                                    <label className="building-label">Bổ sung ảnh tòa nhà</label>
                                    <label className="upload-zone building-upload-zone">
                                        <span className="building-upload-title">Chọn ảnh tòa nhà</span>
                                        <span className="building-upload-hint">Chọn ảnh mới nếu muốn bổ sung ảnh cho tòa nhà.</span>
                                        <input className="building-file-input" type="file" accept="image/*" multiple onChange={handleImagesChange}/>
                                    </label>
                                </div>
                                {images.length > 0 && (
                                    <div className="building-selected-images building-field--full">
                                        <p className="building-selected-title">Ảnh đã chọn</p>
                                        {images.map((image) => (
                                            <p className="building-image-chip" key={`${image.name}-${image.lastModified}`}>{image.name}</p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="building-form-actions">
                                <Button type="button" variant="outline-secondary" onClick={cancelBuildingEdit}>Hủy</Button>
                                <Button type="submit" disabled={isSavingBuilding}>{isSavingBuilding ? "Đang lưu..." : "Lưu thay đổi"}</Button>
                            </div>
                        </form>
                    ) : (
                        <div className="building-form-grid building-detail-readonly-grid">
                            <DetailField label="Tên tòa nhà" value={building.name}/>
                            <DetailField label="Địa chỉ" value={building.address}/>
                            <DetailField label="Số tầng" value={building.numberOfFloor ? `${building.numberOfFloor} tầng` : "-"}/>
                            <DetailField label="Diện tích" value={building.area ? `${building.area} m²` : "-"}/>
                            <DetailField label="Số tầng hầm" value={building.numberOfBasement}/>
                            <DetailField label="Tổng số phòng" value={building.totalRooms}/>
                            <DetailField label="Năm xây dựng" value={building.yearBuilt}/>
                            <DetailField label="Số điện thoại liên hệ" value={building.phoneNumber}/>
                            <DetailField label="Email liên hệ" value={building.email}/>

                            <div className="building-detail-readonly-field building-field--full">
                                <span>Mô tả</span>
                                <p>{building.description || "-"}</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="section-card building-form-card building-detail-section-gap">
                <div className="section-card-header building-form-header">
                    <h2 className="building-section-title">Ảnh tòa nhà</h2>
                </div>
                <div className="section-card-body">
                    {building.imageUrls?.length > 0 ? (
                        <div className="building-current-images">
                            {building.imageUrls.map((imageUrl) => (
                                <img src={imageUrl} alt="Ảnh tòa nhà" key={imageUrl}/>
                            ))}
                        </div>
                    ) : (
                        <div className="building-empty-state">Tòa nhà chưa có ảnh.</div>
                    )}
                </div>
            </section>
                </>
            )}

            {activeTab === "bank" && (
            <section className="section-card building-form-card building-detail-section-gap">
                <div className="section-card-header building-form-header building-bank-header">
                    <div>
                        <h2 className="building-section-title">Tài khoản nhận tiền</h2>
                    </div>
                    <Badge bg={hasBankAccount ? "success" : "secondary"}>
                        {hasBankAccount ? "Đã cấu hình" : "Chưa cấu hình"}
                    </Badge>
                </div>

                <div className="section-card-body">
                    {bankSubmitError && <p className="building-alert building-alert--danger">{bankSubmitError}</p>}
                    {bankSubmitSuccess && <p className="building-alert building-alert--success">{bankSubmitSuccess}</p>}

                    {!isEditingBank && hasBankAccount ? (
                        <div className="building-form-grid building-detail-readonly-grid">
                            <DetailField label="Ngân hàng" value={building.bankAccount.bankName}/>
                            <DetailField label="Số tài khoản" value={building.bankAccount.accountNumber}/>
                            <DetailField label="Chủ tài khoản" value={building.bankAccount.userName}/>
                            {canManageBuilding && (
                                <div className="building-field building-field--full">
                                    <Button type="button" onClick={() => setIsEditingBank(true)}>Chỉnh sửa tài khoản</Button>
                                </div>
                            )}
                        </div>
                    ) : canManageBuilding ? (
                        <form className="building-form" onSubmit={handleBankSubmit}>
                            <div className="building-form-grid">
                                <div className="building-field">
                                    <label className="building-label">Tên ngân hàng <span className="required-mark">*</span></label>
                                    <input className={`building-control ${bankErrors.bankName ? "building-control--invalid" : ""}`} name="bankName" value={bankAccount.bankName} onChange={handleBankChange} placeholder="Ví dụ: MB Bank"/>
                                    {bankErrors.bankName && <p className="building-error">{bankErrors.bankName}</p>}
                                </div>
                                <div className="building-field">
                                    <label className="building-label">Số tài khoản <span className="required-mark">*</span></label>
                                    <input className={`building-control ${bankErrors.accountNumber ? "building-control--invalid" : ""}`} name="accountNumber" value={bankAccount.accountNumber} onChange={handleBankChange} placeholder="Nhập số tài khoản" inputMode="numeric"/>
                                    {bankErrors.accountNumber && <p className="building-error">{bankErrors.accountNumber}</p>}
                                </div>
                                <div className="building-field building-field--full">
                                    <label className="building-label">Tên chủ tài khoản <span className="required-mark">*</span></label>
                                    <input className={`building-control ${bankErrors.userName ? "building-control--invalid" : ""}`} name="userName" value={bankAccount.userName} onChange={handleBankChange} placeholder="Nhập tên chủ tài khoản"/>
                                    {bankErrors.userName && <p className="building-error">{bankErrors.userName}</p>}
                                </div>
                            </div>
                            <div className="building-form-actions">
                                {hasBankAccount && (
                                    <Button type="button" variant="outline-secondary" onClick={() => {
                                        setBankAccount(mapBankAccountToForm(building.bankAccount));
                                        setBankErrors({});
                                        setIsEditingBank(false);
                                    }}>
                                        Hủy
                                    </Button>
                                )}
                                <Button type="submit" disabled={isSavingBank}>{isSavingBank ? "Đang lưu..." : "Lưu tài khoản"}</Button>
                            </div>
                        </form>
                    ) : (
                        <div className="building-empty-state">Tòa nhà chưa cấu hình tài khoản nhận tiền.</div>
                    )}
                </div>
            </section>
            )}

            {activeTab === "rooms" && (
                <div className="building-room-config">
                    {isLoadingRoomConfig && <div className="building-empty-state">Đang tải cấu hình phòng...</div>}

                    <section className="section-card building-form-card">
                        <div className="section-card-header building-form-header">
                            <div>
                                <h2 className="building-section-title">Loại phòng</h2>
                            </div>
                            {canManageBuilding && <Button type="button" onClick={openCreateRoomTypeModal}>Thêm loại phòng</Button>}
                        </div>
                        <div className="section-card-body">
                            {roomTypeSubmitError && <p className="building-alert building-alert--danger">{roomTypeSubmitError}</p>}
                            {roomTypeSubmitSuccess && <p className="building-alert building-alert--success">{roomTypeSubmitSuccess}</p>}

                            <div className="building-room-type-list">
                                {roomTypes.length > 0 ? roomTypes.map((roomType) => (
                                    <div className="building-room-type-card" key={roomType.roomTypeId}>
                                        <div>
                                            <h3>{roomType.name}</h3>
                                            <p>{roomType.capacity} người · {roomType.area} m²</p>
                                            {roomType.description && <span>{roomType.description}</span>}
                                        </div>
                                        {canManageBuilding && (
                                            <div className="building-room-type-actions">
                                                <Button type="button" variant="outline-primary" size="sm" onClick={() => startEditRoomType(roomType)}>Sửa</Button>
                                                <Button type="button" variant="outline-danger" size="sm" onClick={() => handleDeleteRoomType(roomType.roomTypeId)}>Xóa</Button>
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <div className="building-empty-state">Chưa có loại phòng. Hãy thêm loại phòng trước khi tạo phòng nhanh.</div>
                                )}
                            </div>
                        </div>
                    </section>

                    <Modal show={showRoomTypeModal} onHide={cancelRoomTypeEdit} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>{editingRoomTypeId ? "Chỉnh sửa loại phòng" : "Thêm loại phòng"}</Modal.Title>
                        </Modal.Header>
                        <form className="building-form" onSubmit={handleRoomTypeSubmit}>
                            <Modal.Body>
                                {roomTypeSubmitError && <p className="building-alert building-alert--danger">{roomTypeSubmitError}</p>}
                                <div className="building-form-grid building-modal-form-grid">
                                    <div className="building-field building-field--full">
                                        <label className="building-label">Tên loại phòng <span className="required-mark">*</span></label>
                                        <input className={`building-control ${roomTypeErrors.name ? "building-control--invalid" : ""}`} name="name" value={roomTypeForm.name} onChange={handleRoomTypeChange} placeholder="Ví dụ: Standard"/>
                                        {roomTypeErrors.name && <p className="building-error">{roomTypeErrors.name}</p>}
                                    </div>
                                    <div className="building-field">
                                        <label className="building-label">Sức chứa <span className="required-mark">*</span></label>
                                        <input className={`building-control ${roomTypeErrors.capacity ? "building-control--invalid" : ""}`} name="capacity" value={roomTypeForm.capacity} onChange={handleRoomTypeChange} type="number" min="1" placeholder="Số người"/>
                                        {roomTypeErrors.capacity && <p className="building-error">{roomTypeErrors.capacity}</p>}
                                    </div>
                                    <div className="building-field">
                                        <label className="building-label">Diện tích (m²) <span className="required-mark">*</span></label>
                                        <input className={`building-control ${roomTypeErrors.area ? "building-control--invalid" : ""}`} name="area" value={roomTypeForm.area} onChange={handleRoomTypeChange} type="number" min="0" step="0.01" placeholder="Diện tích"/>
                                        {roomTypeErrors.area && <p className="building-error">{roomTypeErrors.area}</p>}
                                    </div>
                                    <div className="building-field building-field--full">
                                        <label className="building-label">Mô tả</label>
                                        <textarea className="building-control building-textarea" name="description" value={roomTypeForm.description} onChange={handleRoomTypeChange} rows={3} placeholder="Mô tả loại phòng"/>
                                    </div>
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button type="button" variant="outline-secondary" onClick={cancelRoomTypeEdit}>Hủy</Button>
                                <Button type="submit" disabled={isSavingRoomType}>{isSavingRoomType ? "Đang lưu..." : editingRoomTypeId ? "Lưu loại phòng" : "Thêm loại phòng"}</Button>
                            </Modal.Footer>
                        </form>
                    </Modal>

                    <section className="section-card building-form-card building-detail-section-gap">
                        <div className="section-card-header building-form-header">
                            <div>
                                <h2 className="building-section-title">Lưới tầng tạo phòng</h2>
                            </div>
                        </div>
                        <div className="section-card-body">
                            {quickRoomSubmitError && <p className="building-alert building-alert--danger">{quickRoomSubmitError}</p>}
                            {quickRoomSubmitSuccess && <p className="building-alert building-alert--success">{quickRoomSubmitSuccess}</p>}

                            <div className="building-floor-grid">
                                {Array.from({length: Number(building.numberOfFloor) || 0}, (_, index) => index + 1).map((floorNumber) => {
                                    const floorRooms = rooms.filter((room) => room.floorNumber === floorNumber);
                                    const isCurrentFloor = quickRoomFloor === floorNumber;

                                    return (
                                        <div className="building-floor-row" key={floorNumber}>
                                    <div className="building-floor-header">
                                        <h3>Tầng {floorNumber}</h3>
                                        {canManageBuilding && <Button type="button" size="sm" onClick={() => openQuickRoomForm(floorNumber)} disabled={roomTypes.length === 0}>+ Thêm phòng nhanh</Button>}
                                    </div>

                                            {floorRooms.length > 0 ? (
                                                <div className="building-floor-room-list">
                                                    {floorRooms.map((room) => (
                                                        <div className="building-floor-room-chip" key={room.roomCode}>
                                                            <strong>{room.roomName || room.roomCode}</strong>
                                                            <span>{room.roomType?.name || "-"}</span>
                                                            <Badge bg="success" className="text-white">{room.status}</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="building-floor-empty">Chưa có phòng ở tầng này.</p>
                                            )}

                                    {canManageBuilding && isCurrentFloor && (
                                                <form className="building-quick-room-form" onSubmit={handleQuickRoomSubmit}>
                                                    <div className="building-field">
                                                        <label className="building-label">Tên phòng <span className="required-mark">*</span></label>
                                                        <input className={`building-control ${quickRoomErrors.roomName ? "building-control--invalid" : ""}`} name="roomName" value={quickRoomForm.roomName} onChange={handleQuickRoomChange} placeholder={`Ví dụ: Phòng ${floorNumber}01`}/>
                                                        {quickRoomErrors.roomName && <p className="building-error">{quickRoomErrors.roomName}</p>}
                                                    </div>
                                                    <div className="building-field">
                                                        <label className="building-label">Loại phòng <span className="required-mark">*</span></label>
                                                        <select className={`building-control ${quickRoomErrors.roomTypeId ? "building-control--invalid" : ""}`} name="roomTypeId" value={quickRoomForm.roomTypeId} onChange={handleQuickRoomChange}>
                                                            <option value="">Chọn loại phòng</option>
                                                            {roomTypes.map((roomType) => (
                                                                <option value={roomType.roomTypeId} key={roomType.roomTypeId}>{roomType.name}</option>
                                                            ))}
                                                        </select>
                                                        {quickRoomErrors.roomTypeId && <p className="building-error">{quickRoomErrors.roomTypeId}</p>}
                                                    </div>
                                                    <div className="building-quick-room-actions">
                                                        <Button type="button" variant="outline-secondary" onClick={cancelQuickRoomForm}>Hủy</Button>
                                                        <Button type="submit" disabled={isCreatingRoom}>{isCreatingRoom ? "Đang tạo..." : "Tạo phòng"}</Button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default BuildingDetailPage;
