import React, { useEffect, useMemo, useState } from "react";
import tenantService from "../services/tenantApi";
import { Button, Table, Container } from "react-bootstrap";
import { Eye } from "react-bootstrap-icons";
import UpdateTenantModal from "../components/UpdateTenantModal";
import { updateTenant } from "../../rooms/services/roomApi";
import "../../buildings/buildings.css";

function TenantsManagePage({ buildings }) {
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    if (buildings?.length > 0) {
      setSelectedBuildingId(buildings[0].buildingId);
    }
  }, [buildings]);

  useEffect(() => {
    if (!selectedBuildingId) return;
    const fetchTenants = async () => {
      try {
        const data =
          await tenantService.getTenantsByBuildingId(selectedBuildingId);
        setTenants(data);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      }
    };
    fetchTenants();
  }, [selectedBuildingId]);

  // Update tenant
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [submitErrorUpdate, setSubmitErrorUpdate] = useState("");
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  // search value
  const [searchValue, setSearchValue] = useState("");

  const filterdTenants = useMemo(() => {
    if (!searchValue) return tenants;
    return tenants.filter((tenant) =>
      tenant.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [tenants, searchValue]);

  const handleUpdate = (tenant) => {
    setSelectedTenant(tenant);
    setShowUpdateModal(true);
  };

  const onSubmitUpdate = async (formData) => {
    setSubmittingUpdate(true);
    setSubmitErrorUpdate("");
    try {
      await updateTenant(selectedTenant.tenantId, formData);
      setShowUpdateModal(false);
      // Refresh data
      const data =
        await tenantService.getTenantsByBuildingId(selectedBuildingId);
      setTenants(data);
    } catch (error) {
      setSubmitErrorUpdate(error.message || "Update failed");
    } finally {
      setSubmittingUpdate(false);
    }
  };

  return (
    <>
      {/* ── Building selector ── */}
      {buildings?.length > 0 && (
        <div className="rooms-building-selector mb-3">
          <select
            className="rooms-building-select"
            value={selectedBuildingId || ""}
            onChange={(e) => setSelectedBuildingId(Number(e.target.value))}
          >
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
            <h1 className="page-title">Danh sách cư dân</h1>
          </div>
        </header>

        <div className="building-filter-panel">
          <input
            type="text"
            placeholder="Tìm kiếm cư dân ..."
            className="building-control building-filter-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <div className="building-table-wrapper">
          <Table
            responsive
            hover
            align="middle"
            className="building-table"
          >
            <thead>
              <tr>
                <th>Stt</th>
                <th>Họ tên</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filterdTenants?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="building-empty-state border-0">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filterdTenants?.map((tenant, index) => (
                  <tr key={tenant.tenantId || index}>
                    <td>{index + 1}</td>
                    <td className="building-name-cell">{tenant.name}</td>
                    <td>{tenant.phoneNumber}</td>
                    <td>
                      {tenant.isContractHolder ? "Chủ hợp đồng" : "Thành viên"}
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleUpdate(tenant)}
                      >
                        <Eye className="me-1" /> Cập nhật
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <UpdateTenantModal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        onSubmit={onSubmitUpdate}
        submitError={submitErrorUpdate}
        submitting={submittingUpdate}
        initialData={selectedTenant}
      />
    </>
  );
}

export default TenantsManagePage;
