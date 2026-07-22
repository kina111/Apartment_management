import {useEffect, useState} from "react";
import {Badge, Button} from "react-bootstrap";
import {Link, useParams} from "react-router-dom";
import {createOrUpdateBuilding, getBuildingDetail, updateBuildingBankAccount} from "../services/buildingApi.js";
import {getErrorMessage} from "../../../shared/services/errorUtils.js";
import {useAuth} from "../../../shared/context/AuthContext.jsx";
import "../buildings.css";

const initialBuilding = {
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

const currentYear = new Date().getFullYear();

function validateBuilding(building) {
    const errors = {};

    if (!building.name.trim()) {
        errors.name = "Tên toà nhà là bắt buộc";
    }

    if (!building.address.trim()) {
        errors.address = "Địa chỉ là bắt buộc";
    }

    const floor = Number(building.numberOfFloor);

    if (!building.numberOfFloor) {
        errors.numberOfFloor = "Số tầng là bắt buộc";
    } else if (!Number.isInteger(floor) || floor <= 0 || floor > 50) {
        errors.numberOfFloor = "Số tầng phải là số nguyên từ 1 đến 50";
    }

    if (building.area) {
        const area = Number(building.area);
        if (!Number.isFinite(area) || area <= 0) {
            errors.area = "Diện tích phải lớn hơn 0";
        }
    }

    if (building.numberOfBasement) {
        const basement = Number(building.numberOfBasement);
        if (!Number.isInteger(basement) || basement < 0) {
            errors.numberOfBasement = "Số tầng hầm phải là số nguyên không âm";
        }
    }

    if (building.totalRooms) {
        const totalRooms = Number(building.totalRooms);
        if (!Number.isInteger(totalRooms) || totalRooms < 0) {
            errors.totalRooms = "Tổng số phòng phải là số nguyên không âm";
        }
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

function optionalNumber(value) {
    return value === "" ? undefined : Number(value);
}


function toFormValue(value) {
    return value ?? "";
}

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

function mapBankAccountToForm(bankAccount) {
    return {
        bankName: toFormValue(bankAccount?.bankName),
        accountNumber: toFormValue(bankAccount?.accountNumber),
        userName: toFormValue(bankAccount?.userName),
    };
}

function validateBankAccount(bankAccount) {
    const errors = {};

    if (!bankAccount.bankName.trim()) {
        errors.bankName = "Tên ngân hàng là bắt buộc";
    }

    if (!bankAccount.accountNumber.trim()) {
        errors.accountNumber = "Số tài khoản là bắt buộc";
    } else if (!/^\d{6,30}$/.test(bankAccount.accountNumber.trim())) {
        errors.accountNumber = "Số tài khoản phải gồm 6-30 chữ số";
    }

    if (!bankAccount.userName.trim()) {
        errors.userName = "Tên chủ tài khoản là bắt buộc";
    }

    return errors;
}

function BuildingEditPage() {
    const {buildingId} = useParams();
    const {role} = useAuth();
    const [building, setBuilding] = useState(initialBuilding);
    const [buildingDetail, setBuildingDetail] = useState(null);
    const [bankAccount, setBankAccount] = useState(initialBankAccount);
    const [bankErrors, setBankErrors] = useState({});
    const [bankSubmitError, setBankSubmitError] = useState("");
    const [bankSubmitSuccess, setBankSubmitSuccess] = useState("");
    const [isSavingBank, setIsSavingBank] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [updatedBuilding, setUpdatedBuilding] = useState(null);
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let isCurrent = true;

        async function loadBuilding() {
            setIsLoading(true);
            setLoadError("");

            try {
                const data = await getBuildingDetail(buildingId);
                if (isCurrent) {
                    setBuildingDetail(data);
                    setBuilding(mapBuildingToForm(data));
                    setBankAccount(mapBankAccountToForm(data.bankAccount));
                }
            } catch (error) {
                if (isCurrent) {
                    setLoadError(getErrorMessage(error, "Không thể tải thông tin tòa nhà"));
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        }

        loadBuilding();

        return () => {
            isCurrent = false;
        };
    }, [buildingId]);

    const handleChange = (e) => {
        const {name, value} = e.target;


        setBuilding((currentBuilding) => ({...currentBuilding, [name]: value}));

        setErrors((currentError) => ({...currentError, [name]: ""}));
        setSubmitError("");
    }

    const handleImagesChange = (e) => {
        const selectedImages = Array.from(e.target.files || []);
        setImages(selectedImages);
    };

    const handleBankChange = (e) => {
        const {name, value} = e.target;

        setBankAccount((current) => ({...current, [name]: value}));
        setBankErrors((current) => ({...current, [name]: ""}));
        setBankSubmitError("");
        setBankSubmitSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validate = validateBuilding(building);
        setErrors(validate);

        if (Object.keys(validate).length > 0) {
            return;
        }

        const payload = {
            name: building.name,
            address: building.address,
            numberOfFloor: Number(building.numberOfFloor),
            area: optionalNumber(building.area),
            numberOfBasement: optionalNumber(building.numberOfBasement),
            totalRooms: optionalNumber(building.totalRooms),
            yearBuilt: optionalNumber(building.yearBuilt),
            phoneNumber: building.phoneNumber,
            email: building.email,
            description: building.description,
        }

        setIsSubmitting(true);
        setSubmitError("");
        setUpdatedBuilding(null);

        try {
            const result = await createOrUpdateBuilding({...payload, buildingId}, images);
            setUpdatedBuilding(result);
            setImages([]);
            setBuildingDetail((current) => ({...current, ...result}));
        } catch (error) {
            const serverMessage = getErrorMessage(error, "Không thể cập nhật tòa nhà");

            setSubmitError(serverMessage);
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleBankSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateBankAccount(bankAccount);
        setBankErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setIsSavingBank(true);
        setBankSubmitError("");
        setBankSubmitSuccess("");

        try {
            const updatedBankAccount = await updateBuildingBankAccount(buildingId, bankAccount);
            setBuildingDetail((current) => ({...current, bankAccount: updatedBankAccount}));
            setBankAccount(mapBankAccountToForm(updatedBankAccount));
            setBankSubmitSuccess("Đã lưu tài khoản nhận tiền");
        } catch (error) {
            setBankSubmitError(getErrorMessage(error, "Không thể lưu tài khoản nhận tiền"));
        } finally {
            setIsSavingBank(false);
        }
    };

    if (isLoading) {
        return <div className="building-empty-state">Đang tải thông tin tòa nhà...</div>;
    }

    if (role === "MANAGER") {
        return (
            <div className="building-create-page">
                <p className="building-alert building-alert--danger">Bạn chỉ có quyền xem tòa nhà này.</p>
                <Button as={Link} variant="outline-secondary" to={`/buildings/${buildingId}`}>
                    Về chi tiết
                </Button>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="building-create-page">
                <p className="building-alert building-alert--danger">{loadError}</p>
                <Button as={Link} variant="outline-secondary" to="/buildings">
                    Trở về
                </Button>
            </div>
        );
    }

    return (
        <div className="building-create-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Cập nhật tòa nhà</h1>
                </div>
                <Button as={Link} variant="outline-secondary" to={`/buildings/${buildingId}`}>
                    Xem chi tiết
                </Button>
            </header>

            <section className="section-card building-form-card">
                <div className="section-card-header building-form-header">
                    <div>
                        <h2 className="building-section-title">Thông tin tòa nhà</h2>
                    </div>
                </div>

                <div className="section-card-body">
                    {submitError && (
                        <p className="building-alert building-alert--danger">{submitError}</p>
                    )}

                    {updatedBuilding && (
                        <div className="building-alert building-alert--success">
                            <p className="building-alert-title">Cập nhật tòa nhà thành công</p>
                        </div>
                    )}

                    <form className="building-form" onSubmit={handleSubmit}>
                        <div className="building-form-grid">
                            <div className="building-field">
                                <label className="building-label">Tên tòa nhà <span
                                    className="required-mark">*</span></label>
                                <input
                                    className={`building-control ${errors.name ? "building-control--invalid" : ""}`}
                                    name="name"
                                    value={building.name}
                                    onChange={handleChange}
                                    placeholder="Nhập tên tòa nhà"/>
                                {errors.name && (
                                    <p className="building-error">{errors.name}</p>
                                )}
                            </div>

                            <div className="building-field">
                                <label className="building-label">Địa chỉ <span
                                    className="required-mark">*</span></label>
                                <input
                                    className={`building-control ${errors.address ? "building-control--invalid" : ""}`}
                                    name="address"
                                    value={building.address}
                                    onChange={handleChange}
                                    placeholder="Nhập địa chỉ"/>
                                {errors.address && (
                                    <p className="building-error">{errors.address}</p>
                                )}
                            </div>

                            <div className="building-field">
                                <label className="building-label">Số tầng <span
                                    className="required-mark">*</span></label>
                                <input
                                    className={`building-control ${errors.numberOfFloor ? "building-control--invalid" : ""}`}
                                    name="numberOfFloor"
                                    value={building.numberOfFloor}
                                    onChange={handleChange}
                                    type="number" min="1" max="50" placeholder="Nhập số tầng"/>
                                {errors.numberOfFloor && (
                                    <p className="building-error">{errors.numberOfFloor}</p>
                                )}
                            </div>

                            <div className="building-field">
                                <label className="building-label">Diện tích (m²)</label>
                                <input
                                    className={`building-control ${errors.area ? "building-control--invalid" : ""}`}
                                    name="area"
                                    value={building.area}
                                    onChange={handleChange}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Nhập diện tích"/>
                                {errors.area && (
                                    <p className="building-error">{errors.area}</p>
                                )}
                            </div>

                            <div className="building-field">
                                <label className="building-label">Số tầng hầm</label>
                                <input
                                    className={`building-control ${errors.numberOfBasement ? "building-control--invalid" : ""}`}
                                    name="numberOfBasement"
                                    value={building.numberOfBasement}
                                    onChange={handleChange}
                                    type="number"
                                    min="0"
                                    placeholder="Nhập số tầng hầm"/>
                                {errors.numberOfBasement && (
                                    <p className="building-error">{errors.numberOfBasement}</p>
                                )}
                            </div>

                            <div className="building-field">
                                <label className="building-label">Tổng số phòng</label>
                                <input
                                    className={`building-control ${errors.totalRooms ? "building-control--invalid" : ""}`}
                                    name="totalRooms"
                                    value={building.totalRooms}
                                    onChange={handleChange}
                                    type="number"
                                    min="0"
                                    placeholder="Nhập tổng số phòng"/>
                                {errors.totalRooms && (
                                    <p className="building-error">{errors.totalRooms}</p>
                                )}
                            </div>

                            <div className="building-field">
                                <label className="building-label">Năm xây dựng</label>
                                <input
                                    className={`building-control ${errors.yearBuilt ? "building-control--invalid" : ""}`}
                                    name="yearBuilt"
                                    value={building.yearBuilt}
                                    onChange={handleChange}
                                    type="number"
                                    min="1800"
                                    max={currentYear}
                                    placeholder="Nhập năm xây dựng"/>
                                {errors.yearBuilt && (
                                    <p className="building-error">{errors.yearBuilt}</p>
                                )}
                            </div>

                            <div className="building-field">
                                <label className="building-label">Số điện thoại liên hệ</label>
                                <input
                                    className="building-control"
                                    name="phoneNumber"
                                    value={building.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="Nhập số điện thoại"/>
                            </div>

                            <div className="building-field">
                                <label className="building-label">Email liên hệ</label>
                                <input
                                    className={`building-control ${errors.email ? "building-control--invalid" : ""}`}
                                    name="email"
                                    value={building.email}
                                    onChange={handleChange}
                                    type="email"
                                    placeholder="Nhập email liên hệ"/>
                                {errors.email && (
                                    <p className="building-error">{errors.email}</p>
                                )}
                            </div>

                            <div className="building-field building-field--full">
                                <label className="building-label">Mô tả</label>
                                <textarea
                                    className="building-control building-textarea"
                                    name="description"
                                    value={building.description}
                                    onChange={handleChange}
                                    placeholder="Nhập mô tả"
                                    rows={4}/>
                            </div>

                            <div className="building-field building-field--full">
                                <label className="building-label">Ảnh tòa nhà</label>
                                {buildingDetail?.imageUrls?.length > 0 && (
                                    <div className="building-current-images">
                                        {buildingDetail.imageUrls.map((imageUrl) => (
                                            <img src={imageUrl} alt="Ảnh tòa nhà hiện có" key={imageUrl}/>
                                        ))}
                                    </div>
                                )}
                                <label className="upload-zone building-upload-zone">
                                    <span className="building-upload-title">Chọn ảnh tòa nhà</span>
                                    <span
                                        className="building-upload-hint">Chọn ảnh mới nếu muốn bổ sung ảnh cho tòa nhà.</span>
                                    <input
                                        className="building-file-input"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImagesChange}
                                    />
                                </label>
                            </div>

                            {images.length > 0 && (
                                <div className="building-selected-images building-field--full">
                                    <p className="building-selected-title">Ảnh đã chọn</p>

                                    {images.map((image) => (
                                        <p className="building-image-chip"
                                           key={`${image.name}-${image.lastModified}`}>{image.name}</p>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="building-form-actions">
                            <Button as={Link} variant="outline-secondary" to="/buildings">
                                Trở về
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                        </div>
                    </form>
                </div>
            </section>

            <section className="section-card building-form-card building-edit-bank-card">
                <div className="section-card-header building-form-header building-bank-header">
                    <div>
                        <h2 className="building-section-title">Tài khoản nhận tiền</h2>
                    </div>
                    <Badge bg={buildingDetail?.bankAccount ? "success" : "secondary"}>
                        {buildingDetail?.bankAccount ? "Đã cấu hình" : "Chưa cấu hình"}
                    </Badge>
                </div>

                <div className="section-card-body">
                    {bankSubmitError && <p className="building-alert building-alert--danger">{bankSubmitError}</p>}
                    {bankSubmitSuccess && <p className="building-alert building-alert--success">{bankSubmitSuccess}</p>}

                    <form className="building-form" onSubmit={handleBankSubmit}>
                        <div className="building-form-grid">
                            <div className="building-field">
                                <label className="building-label">Tên ngân hàng <span className="required-mark">*</span></label>
                                <input
                                    className={`building-control ${bankErrors.bankName ? "building-control--invalid" : ""}`}
                                    name="bankName"
                                    value={bankAccount.bankName}
                                    onChange={handleBankChange}
                                    placeholder="Ví dụ: MB Bank"/>
                                {bankErrors.bankName && <p className="building-error">{bankErrors.bankName}</p>}
                            </div>

                            <div className="building-field">
                                <label className="building-label">Số tài khoản <span className="required-mark">*</span></label>
                                <input
                                    className={`building-control ${bankErrors.accountNumber ? "building-control--invalid" : ""}`}
                                    name="accountNumber"
                                    value={bankAccount.accountNumber}
                                    onChange={handleBankChange}
                                    placeholder="Nhập số tài khoản"
                                    inputMode="numeric"/>
                                {bankErrors.accountNumber && <p className="building-error">{bankErrors.accountNumber}</p>}
                            </div>

                            <div className="building-field building-field--full">
                                <label className="building-label">Tên chủ tài khoản <span className="required-mark">*</span></label>
                                <input
                                    className={`building-control ${bankErrors.userName ? "building-control--invalid" : ""}`}
                                    name="userName"
                                    value={bankAccount.userName}
                                    onChange={handleBankChange}
                                    placeholder="Nhập tên chủ tài khoản"/>
                                {bankErrors.userName && <p className="building-error">{bankErrors.userName}</p>}
                            </div>
                        </div>

                        <div className="building-form-actions">
                            <Button type="submit" disabled={isSavingBank}>
                                {isSavingBank ? "Đang lưu..." : "Lưu tài khoản"}
                            </Button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}

export default BuildingEditPage;
