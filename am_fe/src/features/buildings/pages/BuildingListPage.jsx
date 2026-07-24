import {useEffect, useState} from "react";
import {Badge, Button, ButtonGroup, Form, Modal, Table} from "react-bootstrap";
import {Eye, PencilSquare, Trash} from "react-bootstrap-icons";
import {Link} from "react-router-dom";
import buildingApi from "../services/buildingApi.js";
import {useAuth} from "../../../shared/context/AuthContext.jsx";
import {getErrorMessage} from "../../../shared/services/errorUtils.js";
import {initialBuildingForm, validateBuilding} from "../utils/buildingForm.js";
import "../buildings.css";

const initialFilters = {
    keyword: "",
    minFloor: "",
    maxFloor: "",
    sort: "buildingId,desc",
};

function BuildingListPage() {
    const {user, role} = useAuth();
    const isManager = role === "MANAGER";

    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [building, setBuilding] = useState(initialBuildingForm);
    const [buildingErrors, setBuildingErrors] = useState({});
    const [createError, setCreateError] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [deletingBuildingId, setDeletingBuildingId] = useState(null);

    const buildings = result?.items || [];
    const hasBuildings = buildings.length > 0;
    const hasPagination = result?.totalPages > 1;

    useEffect(() => {
        let isCurrent = true;

        async function loadBuildings() {
            setIsLoading(true);
            setError("");

            try {
                const data = isManager
                    ? await buildingApi.getAllBuildingsByManagerId(user?.accountId)
                    : await buildingApi.getMyBuildings({
                        ...appliedFilters,
                        page,
                        size,
                    });

                if (!isCurrent) return;

                setResult(isManager ? {
                    items: data,
                    totalElements: data.length,
                    totalPages: 1,
                    page: 0,
                    size: data.length,
                } : data);
            } catch (requestError) {
                if (isCurrent) {
                    setError(getErrorMessage(requestError, "Không thể tải danh sách tòa nhà"));
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        }

        loadBuildings();
        return () => {
            isCurrent = false;
        };
    }, [appliedFilters, isManager, page, size, user?.accountId]);

    const handleFilterChange = (event) => {
        const {name, value} = event.target;
        setFilters((current) => ({...current, [name]: value}));
    };

    const handleFilterSubmit = (event) => {
        event.preventDefault();
        setPage(0);
        setAppliedFilters(filters);
    };

    const handleFilterReset = () => {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
        setPage(0);
    };

    const handlePageSizeChange = (event) => {
        setSize(Number(event.target.value));
        setPage(0);
    };

    const openCreateModal = () => {
        setBuilding(initialBuildingForm);
        setBuildingErrors({});
        setCreateError("");
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setBuilding(initialBuildingForm);
        setBuildingErrors({});
        setCreateError("");
    };

    const handleCreateFormChange = (event) => {
        const {name, value} = event.target;

        setBuilding((current) => ({...current, [name]: value}));
        setBuildingErrors((current) => ({...current, [name]: ""}));
        setCreateError("");
    };

    const handleCreateImagesChange = (event) => {
        setBuilding((current) => ({
            ...current,
            images: Array.from(event.target.files || []),
        }));
    };

    const handleCreateSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateBuilding(building);
        setBuildingErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        setIsCreating(true);
        setCreateError("");

        try {
            const createdBuilding = await buildingApi.createBuilding({
                name: building.name,
                address: building.address,
                numberOfFloor: Number(building.numberOfFloor),
                images: building.images,
            });

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
            await buildingApi.deleteBuilding(buildingToDelete.buildingId);
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
                {!isManager && (
                    <Button type="button" onClick={openCreateModal}>
                        Thêm mới tòa nhà
                    </Button>
                )}
            </header>

            <form className="building-filter-panel" onSubmit={handleFilterSubmit}>
                <input
                    className="building-control building-filter-search"
                    name="keyword"
                    value={filters.keyword}
                    onChange={handleFilterChange}
                    placeholder="Tìm theo tên hoặc địa chỉ"
                />
                <input
                    className="building-control"
                    name="minFloor"
                    type="number"
                    min="1"
                    value={filters.minFloor}
                    onChange={handleFilterChange}
                    placeholder="Tầng tối thiểu"
                />
                <input
                    className="building-control"
                    name="maxFloor"
                    type="number"
                    min="1"
                    value={filters.maxFloor}
                    onChange={handleFilterChange}
                    placeholder="Tầng tối đa"
                />
                <Form.Select
                    className="building-control"
                    name="sort"
                    value={filters.sort}
                    onChange={handleFilterChange}
                    aria-label="Sắp xếp tòa nhà"
                >
                    <option value="buildingId,desc">Mới nhất</option>
                    <option value="numberOfFloor,desc">Số tầng cao đến thấp</option>
                    <option value="numberOfFloor,asc">Số tầng thấp đến cao</option>
                </Form.Select>
                <Button type="submit">Lọc</Button>
                <Button variant="outline-secondary" type="button" onClick={handleFilterReset}>
                    Đặt lại
                </Button>
            </form>

            {error && <p className="building-alert building-alert--danger">{error}</p>}

            {isLoading ? (
                <div className="building-empty-state">Đang tải danh sách...</div>
            ) : hasBuildings ? (
                <div className="building-table-wrapper">
                    <Table className="building-table" responsive hover align="middle">
                        <thead>
                            <tr>
                                <th>Tên tòa nhà</th>
                                <th>Địa chỉ</th>
                                <th className="text-center">Số tầng</th>
                                <th className="text-end">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {buildings.map((buildingItem) => (
                                <tr key={buildingItem.buildingId}>
                                    <td className="building-name-cell">
                                        <Link to={`/buildings/${buildingItem.buildingId}`}>
                                            {buildingItem.name}
                                        </Link>
                                    </td>
                                    <td>{buildingItem.address}</td>
                                    <td className="text-center">
                                        <Badge bg="primary">{buildingItem.numberOfFloor} tầng</Badge>
                                    </td>
                                    <td className="text-end">
                                        <ButtonGroup size="sm" aria-label={`Thao tác với ${buildingItem.name}`}>
                                            <Button
                                                as={Link}
                                                to={`/buildings/${buildingItem.buildingId}`}
                                                variant="outline-secondary"
                                            >
                                                <Eye className="me-1"/>
                                                Chi tiết
                                            </Button>
                                            {!isManager && (
                                                <>
                                                    <Button
                                                        as={Link}
                                                        to={`/buildings/${buildingItem.buildingId}/edit`}
                                                        variant="outline-primary"
                                                    >
                                                        <PencilSquare className="me-1"/>
                                                        Sửa
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        type="button"
                                                        disabled={deletingBuildingId === buildingItem.buildingId}
                                                        onClick={() => handleDeleteBuilding(buildingItem)}
                                                    >
                                                        <Trash className="me-1"/>
                                                        {deletingBuildingId === buildingItem.buildingId ? "Đang xóa..." : "Xóa"}
                                                    </Button>
                                                </>
                                            )}
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

            {result && (
                <div className="building-pagination-bar">
                    <div className="building-page-size">
                        <span>Hiển thị</span>
                        <Form.Select value={size} onChange={handlePageSizeChange} aria-label="Số tòa nhà mỗi trang">
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                        </Form.Select>
                        <span>/ trang</span>
                    </div>

                    {hasPagination && (
                        <nav className="building-pagination" aria-label="Phân trang tòa nhà">
                            <Button
                                variant="outline-primary"
                                type="button"
                                disabled={!result.hasPrevious}
                                onClick={() => setPage((current) => current - 1)}
                            >
                                Trang trước
                            </Button>
                            <span>Trang {result.page + 1} / {result.totalPages}</span>
                            <Button
                                variant="outline-primary"
                                type="button"
                                disabled={!result.hasNext}
                                onClick={() => setPage((current) => current + 1)}
                            >
                                Trang sau
                            </Button>
                        </nav>
                    )}
                </div>
            )}

            <Modal show={showCreateModal} onHide={closeCreateModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Thêm mới tòa nhà</Modal.Title>
                </Modal.Header>
                <form className="building-form" onSubmit={handleCreateSubmit}>
                    <Modal.Body>
                        {createError && <p className="building-alert building-alert--danger">{createError}</p>}

                        <div className="building-form-grid building-modal-form-grid">
                            <div className="building-field">
                                <label className="building-label">
                                    Tên tòa nhà <span className="required-mark">*</span>
                                </label>
                                <input
                                    className={`building-control ${buildingErrors.name ? "building-control--invalid" : ""}`}
                                    name="name"
                                    value={building.name}
                                    onChange={handleCreateFormChange}
                                    placeholder="Nhập tên tòa nhà"
                                />
                                {buildingErrors.name && <p className="building-error">{buildingErrors.name}</p>}
                            </div>
                            <div className="building-field">
                                <label className="building-label">
                                    Địa chỉ <span className="required-mark">*</span>
                                </label>
                                <input
                                    className={`building-control ${buildingErrors.address ? "building-control--invalid" : ""}`}
                                    name="address"
                                    value={building.address}
                                    onChange={handleCreateFormChange}
                                    placeholder="Nhập địa chỉ"
                                />
                                {buildingErrors.address && <p className="building-error">{buildingErrors.address}</p>}
                            </div>
                            <div className="building-field">
                                <label className="building-label">
                                    Số tầng <span className="required-mark">*</span>
                                </label>
                                <input
                                    className={`building-control ${buildingErrors.numberOfFloor ? "building-control--invalid" : ""}`}
                                    name="numberOfFloor"
                                    value={building.numberOfFloor}
                                    onChange={handleCreateFormChange}
                                    type="number"
                                    min="1"
                                    max="50"
                                    placeholder="Nhập số tầng"
                                />
                                {buildingErrors.numberOfFloor && <p className="building-error">{buildingErrors.numberOfFloor}</p>}
                            </div>
                            <div className="building-field building-field--full">
                                <label className="building-label">Ảnh tòa nhà</label>
                                <label className="upload-zone building-upload-zone">
                                    <span className="building-upload-title">Chọn ảnh tòa nhà</span>
                                    <input
                                        className="building-file-input"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleCreateImagesChange}
                                    />
                                </label>
                            </div>
                            {building.images.length > 0 && (
                                <div className="building-selected-images building-field--full">
                                    <p className="building-selected-title">Ảnh đã chọn</p>
                                    {building.images.map((image) => (
                                        <p className="building-image-chip" key={`${image.name}-${image.lastModified}`}>
                                            {image.name}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="button" variant="outline-secondary" onClick={closeCreateModal}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isCreating}>
                            {isCreating ? "Đang lưu..." : "Thêm mới"}
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    );
}

export default BuildingListPage;
