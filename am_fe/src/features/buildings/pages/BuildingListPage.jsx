import {useEffect, useState} from "react";
import {Badge, Button, ButtonGroup, Modal, Table} from "react-bootstrap";
import {Eye, PencilSquare, Trash} from "react-bootstrap-icons";
import {Link} from "react-router-dom";
import {createOrUpdateBuilding, deleteBuilding, getMyBuildings} from "../services/buildingApi.js";
import "../buildings.css";

const initialFilters = {
    keyword: "",
    minFloor: "",
    maxFloor: "",
};

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

const currentYear = new Date().getFullYear();

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

function getErrorMessage(error, fallback) {
    return error.response?.data?.message || error.response?.data?.detail || error.response?.data?.error || fallback;
}

function BuildingListPage() {
    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);
    const [page, setPage] = useState(0);
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [building, setBuilding] = useState(initialBuilding);
    const [buildingErrors, setBuildingErrors] = useState({});
    const [createError, setCreateError] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [images, setImages] = useState([]);
    const [deletingBuildingId, setDeletingBuildingId] = useState(null);

    useEffect(() => {
        let isCurrent = true;

        async function loadBuildings() {
            setIsLoading(true);
            setError("");

            try {
                const data = await getMyBuildings({
                    ...appliedFilters,
                    page,
                    size: 9,
                });

                if (isCurrent) setResult(data);
            } catch (requestError) {
                if (isCurrent) {
                    setError(
                        requestError.response?.data?.message ||
                        requestError.response?.data?.detail ||
                        "Không thể tải danh sách tòa nhà"
                    );
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        }

        loadBuildings();
        return () => {
            isCurrent = false;
        };
    }, [appliedFilters, page]);

    const handleChange = (event) => {
        const {name, value} = event.target;
        setFilters((current) => ({...current, [name]: value}));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setPage(0);
        setAppliedFilters(filters);
    };

    const handleReset = () => {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
        setPage(0);
    };

    const openCreateModal = () => {
        setBuilding(initialBuilding);
        setBuildingErrors({});
        setCreateError("");
        setImages([]);
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setBuilding(initialBuilding);
        setBuildingErrors({});
        setCreateError("");
        setImages([]);
    };

    const handleBuildingChange = (event) => {
        const {name, value} = event.target;

        setBuilding((current) => ({...current, [name]: value}));
        setBuildingErrors((current) => ({...current, [name]: ""}));
        setCreateError("");
    };

    const handleImagesChange = (event) => {
        setImages(Array.from(event.target.files || []));
    };

    const handleCreateBuilding = async (event) => {
        event.preventDefault();

        const validationErrors = validateBuilding(building);
        setBuildingErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

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
        };

        setIsCreating(true);
        setCreateError("");

        try {
            const createdBuilding = await createOrUpdateBuilding(payload, images);
            setResult((current) => current ? {
                ...current,
                items: [createdBuilding, ...(current.items || [])],
                totalElements: (current.totalElements || 0) + 1,
            } : current);
            closeCreateModal();
        } catch (requestError) {
            setCreateError(getErrorMessage(requestError, "Không thể tạo tòa nhà"));
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteBuilding = async (buildingToDelete) => {
        const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa tòa nhà "${buildingToDelete.name}"?`);

        if (!confirmed) return;

        setDeletingBuildingId(buildingToDelete.buildingId);
        setError("");

        try {
            await deleteBuilding(buildingToDelete.buildingId);
            setResult((current) => current ? {
                ...current,
                items: (current.items || []).filter((item) => item.buildingId !== buildingToDelete.buildingId),
                totalElements: Math.max((current.totalElements || 1) - 1, 0),
            } : current);
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Không thể xóa tòa nhà"));
        } finally {
            setDeletingBuildingId(null);
        }
    };

    return (
        <div className="building-list-page">
            <header className="page-header building-list-header">
                <div>
                    <h1 className="page-title">Tòa nhà của tôi</h1>
                </div>
                <Button type="button" onClick={openCreateModal}>
                    Thêm mới tòa nhà
                </Button>
            </header>

            <form className="building-filter-panel" onSubmit={handleSubmit}>
                <input
                    className="building-control building-filter-search"
                    name="keyword"
                    value={filters.keyword}
                    onChange={handleChange}
                    placeholder="Tìm theo tên hoặc địa chỉ"
                />
                <input
                    className="building-control"
                    name="minFloor"
                    type="number"
                    min="1"
                    value={filters.minFloor}
                    onChange={handleChange}
                    placeholder="Tầng tối thiểu"
                />
                <input
                    className="building-control"
                    name="maxFloor"
                    type="number"
                    min="1"
                    value={filters.maxFloor}
                    onChange={handleChange}
                    placeholder="Tầng tối đa"
                />
                <Button type="submit">Lọc</Button>
                <Button variant="outline-secondary" type="button" onClick={handleReset}>Đặt lại</Button>
            </form>

            {error && <p className="building-alert building-alert--danger">{error}</p>}

            {isLoading ? (
                <div className="building-empty-state">Đang tải danh sách...</div>
            ) : result?.items?.length ? (
                <div className="building-table-wrapper">
                    <Table className="building-table" responsive hover align="middle">
                        <thead>
                            <tr>
                                <th>Tên tòa nhà</th>
                                 <th>Địa chỉ</th>
                                 <th className="text-center">Số tầng</th>
                                <th className="text-center">Tổng phòng</th>
                                <th>Liên hệ</th>
                                 <th className="text-end">Thao tác</th>
                             </tr>
                        </thead>
                        <tbody>
                            {result.items.map((building) => (
                                <tr key={building.buildingId}>
                                    <td className="building-name-cell">
                                        <Link to={`/buildings/${building.buildingId}`}>{building.name}</Link>
                                    </td>
                                    <td>{building.address}</td>
                                     <td className="text-center">
                                         <Badge bg="primary">{building.numberOfFloor} tầng</Badge>
                                     </td>
                                    <td className="text-center">
                                        {building.totalRooms ?? "-"}
                                    </td>
                                    <td>
                                        <div className="building-contact-cell">
                                            <span>{building.phoneNumber || "-"}</span>
                                            {building.email && <span>{building.email}</span>}
                                        </div>
                                    </td>
                                     <td className="text-end">
                                        <ButtonGroup size="sm" aria-label={`Thao tác với ${building.name}`}>
                                            <Button
                                                as={Link}
                                                to={`/buildings/${building.buildingId}`}
                                                variant="outline-secondary"
                                            >
                                                <Eye className="me-1"/>
                                                Chi tiết
                                            </Button>
                                            <Button
                                                as={Link}
                                                to={`/buildings/${building.buildingId}?edit=1`}
                                                variant="outline-primary"
                                            >
                                                <PencilSquare className="me-1"/>
                                                Sửa
                                            </Button>
                                             <Button
                                                 variant="outline-danger"
                                                 type="button"
                                                 disabled={deletingBuildingId === building.buildingId}
                                                 onClick={() => handleDeleteBuilding(building)}
                                             >
                                                 <Trash className="me-1"/>
                                                 {deletingBuildingId === building.buildingId ? "Đang xóa..." : "Xóa"}
                                             </Button>
                                        </ButtonGroup>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            ) : (
                <div className="building-empty-state">Không có tòa nhà phù hợp với bộ lọc.</div>
            )}

            {result && result.totalPages > 1 && (
                <nav className="building-pagination" aria-label="Phân trang tòa nhà">
                    <Button variant="outline-primary" type="button" disabled={!result.hasPrevious} onClick={() => setPage((current) => current - 1)}>
                        Trang trước
                    </Button>
                    <span>Trang {result.page + 1} / {result.totalPages}</span>
                    <Button variant="outline-primary" type="button" disabled={!result.hasNext} onClick={() => setPage((current) => current + 1)}>
                        Trang sau
                    </Button>
                </nav>
            )}

            <Modal show={showCreateModal} onHide={closeCreateModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Thêm mới tòa nhà</Modal.Title>
                </Modal.Header>
                <form className="building-form" onSubmit={handleCreateBuilding}>
                    <Modal.Body>
                        {createError && <p className="building-alert building-alert--danger">{createError}</p>}

                        <div className="building-form-grid building-modal-form-grid">
                            <div className="building-field">
                                <label className="building-label">Tên tòa nhà <span className="required-mark">*</span></label>
                                <input className={`building-control ${buildingErrors.name ? "building-control--invalid" : ""}`} name="name" value={building.name} onChange={handleBuildingChange} placeholder="Nhập tên tòa nhà"/>
                                {buildingErrors.name && <p className="building-error">{buildingErrors.name}</p>}
                            </div>
                            <div className="building-field">
                                <label className="building-label">Địa chỉ <span className="required-mark">*</span></label>
                                <input className={`building-control ${buildingErrors.address ? "building-control--invalid" : ""}`} name="address" value={building.address} onChange={handleBuildingChange} placeholder="Nhập địa chỉ"/>
                                {buildingErrors.address && <p className="building-error">{buildingErrors.address}</p>}
                            </div>
                            <div className="building-field">
                                <label className="building-label">Số tầng <span className="required-mark">*</span></label>
                                <input className={`building-control ${buildingErrors.numberOfFloor ? "building-control--invalid" : ""}`} name="numberOfFloor" value={building.numberOfFloor} onChange={handleBuildingChange} type="number" min="1" max="50" placeholder="Nhập số tầng"/>
                                {buildingErrors.numberOfFloor && <p className="building-error">{buildingErrors.numberOfFloor}</p>}
                            </div>
                            <div className="building-field">
                                <label className="building-label">Diện tích (m²)</label>
                                <input className={`building-control ${buildingErrors.area ? "building-control--invalid" : ""}`} name="area" value={building.area} onChange={handleBuildingChange} type="number" min="0" step="0.01" placeholder="Nhập diện tích"/>
                                {buildingErrors.area && <p className="building-error">{buildingErrors.area}</p>}
                            </div>
                            <div className="building-field">
                                <label className="building-label">Số tầng hầm</label>
                                <input className={`building-control ${buildingErrors.numberOfBasement ? "building-control--invalid" : ""}`} name="numberOfBasement" value={building.numberOfBasement} onChange={handleBuildingChange} type="number" min="0" placeholder="Nhập số tầng hầm"/>
                                {buildingErrors.numberOfBasement && <p className="building-error">{buildingErrors.numberOfBasement}</p>}
                            </div>
                            <div className="building-field">
                                <label className="building-label">Tổng số phòng</label>
                                <input className={`building-control ${buildingErrors.totalRooms ? "building-control--invalid" : ""}`} name="totalRooms" value={building.totalRooms} onChange={handleBuildingChange} type="number" min="0" placeholder="Nhập tổng số phòng"/>
                                {buildingErrors.totalRooms && <p className="building-error">{buildingErrors.totalRooms}</p>}
                            </div>
                            <div className="building-field">
                                <label className="building-label">Năm xây dựng</label>
                                <input className={`building-control ${buildingErrors.yearBuilt ? "building-control--invalid" : ""}`} name="yearBuilt" value={building.yearBuilt} onChange={handleBuildingChange} type="number" min="1800" max={currentYear} placeholder="Nhập năm xây dựng"/>
                                {buildingErrors.yearBuilt && <p className="building-error">{buildingErrors.yearBuilt}</p>}
                            </div>
                            <div className="building-field">
                                <label className="building-label">Số điện thoại liên hệ</label>
                                <input className="building-control" name="phoneNumber" value={building.phoneNumber} onChange={handleBuildingChange} placeholder="Nhập số điện thoại"/>
                            </div>
                            <div className="building-field">
                                <label className="building-label">Email liên hệ</label>
                                <input className={`building-control ${buildingErrors.email ? "building-control--invalid" : ""}`} name="email" value={building.email} onChange={handleBuildingChange} type="email" placeholder="Nhập email liên hệ"/>
                                {buildingErrors.email && <p className="building-error">{buildingErrors.email}</p>}
                            </div>
                            <div className="building-field building-field--full">
                                <label className="building-label">Mô tả</label>
                                <textarea className="building-control building-textarea" name="description" value={building.description} onChange={handleBuildingChange} placeholder="Nhập mô tả" rows={3}/>
                            </div>
                            <div className="building-field building-field--full">
                                <label className="building-label">Ảnh tòa nhà</label>
                                <label className="upload-zone building-upload-zone">
                                    <span className="building-upload-title">Chọn ảnh tòa nhà</span>
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
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="button" variant="outline-secondary" onClick={closeCreateModal}>Hủy</Button>
                        <Button type="submit" disabled={isCreating}>{isCreating ? "Đang lưu..." : "Thêm mới"}</Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    );
}

export default BuildingListPage;
