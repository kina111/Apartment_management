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
    const [images, setImages] = useState([]);
    const [deletingBuildingId, setDeletingBuildingId] = useState(null);
    const isManager = role === "MANAGER";

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

                if (isCurrent) {
                    setResult(isManager ? {
                        items: data,
                        totalElements: data.length,
                        totalPages: 1,
                        page: 0,
                        size: data.length,
                    } : data);
                }
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

    const handleSizeChange = (event) => {
        setSize(Number(event.target.value));
        setPage(0);
    };

    const openCreateModal = () => {
        setBuilding(initialBuildingForm);
        setBuildingErrors({});
        setCreateError("");
        setImages([]);
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setBuilding(initialBuildingForm);
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
        };

        setIsCreating(true);
        setCreateError("");

        try {
            const createdBuilding = await buildingApi.createBuilding(payload, images);
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
                <Form.Select
                    className="building-control"
                    name="sort"
                    value={filters.sort}
                    onChange={handleChange}
                    aria-label="Sắp xếp tòa nhà"
                >
                    <option value="buildingId,desc">Mới nhất</option>
                    <option value="numberOfFloor,desc">Số tầng cao đến thấp</option>
                    <option value="numberOfFloor,asc">Số tầng thấp đến cao</option>
                </Form.Select>
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
                                             {!isManager && (
                                                 <>
                                                          <Button
                                                              as={Link}
                                                          to={`/buildings/${building.buildingId}/edit`}
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
                        <Form.Select value={size} onChange={handleSizeChange} aria-label="Số tòa nhà mỗi trang">
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                        </Form.Select>
                        <span>/ trang</span>
                    </div>

                    {result.totalPages > 1 && (
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
                </div>
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
