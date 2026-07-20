import {useEffect, useState} from "react";
import {Badge, Button, ButtonGroup, Table} from "react-bootstrap";
import {PencilSquare, Trash} from "react-bootstrap-icons";
import {Link} from "react-router-dom";
import {getMyBuildings} from "../services/buildingApi.js";
import "../buildings.css";

const initialFilters = {
    keyword: "",
    minFloor: "",
    maxFloor: "",
    hasImages: "",
};

function BuildingListPage() {
    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);
    const [page, setPage] = useState(0);
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

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

    return (
        <div className="building-list-page">
            <header className="page-header building-list-header">
                <div>
                    <h1 className="page-title">Tòa nhà của tôi</h1>
                </div>
                <Button as={Link} to="/buildings/new">
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
                <select
                    className="building-control"
                    name="hasImages"
                    value={filters.hasImages}
                    onChange={handleChange}
                >
                    <option value="">Tất cả hình ảnh</option>
                    <option value="true">Có hình ảnh</option>
                    <option value="false">Chưa có hình ảnh</option>
                </select>
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
                                    <td className="building-name-cell">{building.name}</td>
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
                                                variant="outline-primary"
                                                type="button"
                                                disabled
                                                title="Chức năng chỉnh sửa đang được phát triển"
                                            >
                                                <PencilSquare className="me-1"/>
                                                Sửa
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                type="button"
                                                disabled
                                                title="Chức năng xóa đang được phát triển"
                                            >
                                                <Trash className="me-1"/>
                                                Xóa
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
        </div>
    );
}

export default BuildingListPage;
