import {useEffect, useState} from "react";
import {Badge, Button} from "react-bootstrap";
import {Link, useParams} from "react-router-dom";
import buildingApi from "../services/buildingApi.js";
import {getErrorMessage} from "../../../shared/services/errorUtils.js";
import {useAuth} from "../../../shared/context/AuthContext.jsx";
import {
    initialBankAccountForm,
    mapBankAccountToForm,
    validateBankAccount,
} from "../utils/buildingForm.js";
import "../buildings.css";

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
    const {role} = useAuth();
    const canManageBuilding = role !== "MANAGER";
    const [building, setBuilding] = useState(null);
    const [bankAccount, setBankAccount] = useState(initialBankAccountForm);
    const [bankErrors, setBankErrors] = useState({});
    const [isEditingBank, setIsEditingBank] = useState(false);
    const [activeTab, setActiveTab] = useState("building");
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingBank, setIsSavingBank] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [bankSubmitError, setBankSubmitError] = useState("");
    const [bankSubmitSuccess, setBankSubmitSuccess] = useState("");

    useEffect(() => {
        let isCurrent = true;

        async function loadBuilding() {
            setIsLoading(true);
            setLoadError("");

            try {
                const data = await buildingApi.getBuildingDetail(buildingId);

                if (isCurrent) {
                    setBuilding(data);
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

    const handleBankChange = (event) => {
        if (!canManageBuilding) return;

        const {name, value} = event.target;

        setBankAccount((current) => ({...current, [name]: value}));
        setBankErrors((current) => ({...current, [name]: ""}));
        setBankSubmitError("");
        setBankSubmitSuccess("");
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
            const updatedBankAccount = await buildingApi.updateBuildingBankAccount(buildingId, bankAccount);
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
                    {canManageBuilding && (
                        <Button as={Link} to={`/buildings/${buildingId}/edit`}>Chỉnh sửa</Button>
                    )}
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
            </div>

            {activeTab === "building" && (
                <>
                    <section className="section-card building-form-card">
                        <div className="section-card-header building-form-header">
                            <h2 className="building-section-title">Thông tin tòa nhà</h2>
                        </div>
                        <div className="section-card-body">
                            <div className="building-form-grid building-detail-readonly-grid">
                                <DetailField label="Tên tòa nhà" value={building.name}/>
                                <DetailField label="Địa chỉ" value={building.address}/>
                                <DetailField label="Số tầng" value={building.numberOfFloor ? `${building.numberOfFloor} tầng` : "-"}/>
                            </div>
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
                        <h2 className="building-section-title">Tài khoản nhận tiền</h2>
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
        </div>
    );
}

export default BuildingDetailPage;
