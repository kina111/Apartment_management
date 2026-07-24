import {useEffect, useState} from "react";
import {Badge, Button} from "react-bootstrap";
import {Link, useParams} from "react-router-dom";
import buildingApi from "../services/buildingApi.js";
import {getErrorMessage} from "../../../shared/services/errorUtils.js";
import {useAuth} from "../../../shared/context/AuthContext.jsx";
import {
    initialBankAccountForm,
    initialBuildingEditForm,
    mapBankAccountToForm,
    mapBuildingToEditForm,
    validateBankAccount,
    validateBuilding,
} from "../utils/buildingForm.js";
import "../buildings.css";

function BuildingEditPage() {
    const {buildingId} = useParams();
    const {role} = useAuth();
    const [building, setBuilding] = useState(initialBuildingEditForm);
    const [buildingDetail, setBuildingDetail] = useState(null);
    const [bankAccount, setBankAccount] = useState(initialBankAccountForm);
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
                const data = await buildingApi.getBuildingDetail(buildingId);
                if (isCurrent) {
                    setBuildingDetail(data);
                    setBuilding(mapBuildingToEditForm(data));
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
            description: building.description,
        }

        setIsSubmitting(true);
        setSubmitError("");
        setUpdatedBuilding(null);

        try {
            const result = await buildingApi.updateBuilding(buildingId, payload, images);
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
            const updatedBankAccount = await buildingApi.updateBuildingBankAccount(buildingId, bankAccount);
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
