import { useEffect, useMemo, useState } from "react";
import { Button, Container, Form, Spinner } from "react-bootstrap";
import VehicleTable from "../components/VehicleTable";
import tenantService from "../services/tenantApi";
import "../../buildings/buildings.css";

function VehiclesDashboardPage({ buildings }) {
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const activeBuildingId = selectedBuildingId ?? buildings?.[0]?.buildingId;

  useEffect(() => {
    const fetchTenants = async () => {
      if (!activeBuildingId) return;

      setLoading(true);
      try {
        const data =
          await tenantService.getTenantsByBuildingId(activeBuildingId);
        setTenants(data || []);
      } catch (error) {
        console.error("Error fetching tenants:", error);
        setTenants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [activeBuildingId]);

  const filteredTenants = useMemo(() => {
    const lower = searchValue.toLowerCase();
    return tenants.filter(t => 
      t.name.toLowerCase().includes(lower) ||
      (t.vehicles || []).some(v => v.numberPlate?.toLowerCase().includes(lower))
    );
  }, [tenants, searchValue]);

  const vehicles = useMemo(() => {
    const lower = searchValue.toLowerCase();

    return filteredTenants.flatMap((tenant) =>
      (tenant.vehicles || [])
        .filter((vehicle) =>
          tenant.name.toLowerCase().includes(lower) ||
          vehicle.numberPlate?.toLowerCase().includes(lower)
        )
        .map((vehicle) => ({
          ...vehicle,
          ownerName: tenant.name,
          tenantId: tenant.tenantId,
        }))
    );
  }, [filteredTenants, searchValue]);

  const totalPages = Math.ceil(vehicles.length / pageSize);
  const safePage = totalPages > 0 ? Math.min(page, totalPages - 1) : 0;
  const pageStart = safePage * pageSize;
  const paginatedVehicles = vehicles.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setPage(0);
  }, [activeBuildingId, pageSize, searchValue]);

  return (
    <>
      {buildings?.length > 0 && (
        <div className="rooms-building-selector mb-3">
          <select
            className="rooms-building-select"
            value={activeBuildingId || ""}
            onChange={(e) => setSelectedBuildingId(Number(e.target.value))}
          >
            <option value="">-- Chọn tòa nhà --</option>
            {buildings.map((building) => (
              <option key={building.buildingId} value={building.buildingId}>
                {building.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="building-list-page">
        <header className="page-header building-list-header">
          <div>
            <h1 className="page-title">Danh sách phương tiện</h1>
          </div>
        </header>

        <div className="building-filter-panel">
          <input
            className="building-control building-filter-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Tìm kiếm biển số..."
          />
        </div>

        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" />
            <p className="mt-2">Đang tải danh sách xe...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="building-empty-state">
            <p>Không có dữ liệu xe.</p>
          </div>
        ) : (
          <>
            <div className="building-table-wrapper">
              <VehicleTable
                vehicles={paginatedVehicles}
                handleDeleteVehicle={() => {}}
                startIndex={pageStart}
              />
            </div>
            
            <div className="building-pagination-bar">
              <div className="building-page-size">
                <span>Hiển thị</span>
                <Form.Select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  aria-label="Số phương tiện mỗi trang"
                >
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Form.Select>
                <span>/ trang</span>
              </div>
              <nav className="building-pagination" aria-label="Phân trang phương tiện">
                <Button
                  variant="outline-primary"
                  type="button"
                  disabled={safePage === 0}
                  onClick={() => setPage((current) => Math.max(current - 1, 0))}
                >
                  Trang trước
                </Button>
                <span>
                  Trang {safePage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline-primary"
                  type="button"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))}
                >
                  Trang sau
                </Button>
              </nav>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default VehiclesDashboardPage;
