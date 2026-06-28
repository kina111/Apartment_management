import React, { useEffect, useMemo, useState } from "react";
import tenantService from "../services/tenantApi";
import { Button, Table, Container } from "react-bootstrap";
import { Eye } from "react-bootstrap-icons";
import UpdateTenantModal from "../components/UpdateTenantModal";
import { updateTenant } from "../../rooms/services/roomApi";

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
      <Container className="border border-secondary rounded-3 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1>Danh sách cư dân</h1>
          <input
            type="text"
            placeholder="Tìm kiếm cư dân ..."
            className="form-control w-25 "
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <Table
          striped
          bordered
          hover
          variant="dark"
          className="text-white border-secondary"
        >
          <thead>
            <tr>
              <th>Stt</th>
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {filterdTenants?.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filterdTenants?.map((tenant, index) => (
                <tr key={tenant.tenantId || index}>
                  <td>{index + 1}</td>
                  <td>{tenant.name}</td>
                  <td>{tenant.phoneNumber}</td>
                  <td>
                    {tenant.isContractHolder ? "Chủ hợp đồng" : "Thành viên"}
                  </td>
                  <td>
                    <Button
                      variant="link"
                      className="text-decoration-none text-primary p-0"
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
      </Container>

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
