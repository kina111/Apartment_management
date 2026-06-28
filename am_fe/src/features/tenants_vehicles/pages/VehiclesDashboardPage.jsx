import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Table } from "react-bootstrap";
import VehicleTable from "../components/VehicleTable";
import tenantService from "../services/tenantApi";
import { useMemo } from "react";

function VehiclesDashboardPage({ buildings }) {
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
    const [ searchValue, setSearchValue ] = useState("")
  useEffect(() => {
    if (buildings?.length > 0) {
      setSelectedBuildingId(buildings[0].buildingId);
    }
  }, [buildings]);

  useEffect(() => {
    const fetchTenants = async () => {
      if (!selectedBuildingId) return;

      setLoading(true);
      try {
        const data =
          await tenantService.getTenantsByBuildingId(selectedBuildingId);
        setTenants(data || []);
      } catch (error) {
        console.error("Error fetching tenants:", error);
        setTenants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [selectedBuildingId]);

  const filteredTenants = useMemo(() => {
    const lower = searchValue.toLowerCase();
    return tenants.filter(t => 
      t.name.toLowerCase().includes(lower) ||
      (t.vehicles || []).some(v => v.numberPlate?.toLowerCase().includes(lower))
    );
  }, [tenants, searchValue]);
  return (
    <>
      {buildings?.length > 0 && (
        <div className="rooms-building-selector mb-3">
          <select
            className="rooms-building-select"
            value={selectedBuildingId || ""}
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
      <Container className="pb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="text-black">Danh sách phương tiện</h1>
            <input className="form-control w-25" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Tìm kiếm biển số..." />
        </div>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p className="mt-2">Đang tải danh sách xe...</p>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center">
            <p>Không có dữ liệu xe.</p>
          </div>
        ) : (
          <VehicleTable tenants={filteredTenants} handleDeleteVehicle={() => {}} />
        )}
      </Container>
    </>
  );
}

export default VehiclesDashboardPage;
