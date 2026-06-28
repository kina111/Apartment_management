import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  Tab,
  Tabs,
  Row,
  Col,
  Card,
  Button,
  Spinner,
} from "react-bootstrap";
import { ArrowLeft, PeopleFill } from "react-bootstrap-icons";
import TenantCard from "../../tenants_vehicles/components/TenantCard";
import VehicleTable from "../../tenants_vehicles/components/VehicleTable";
import AddTenantModal from "../../tenants_vehicles/components/AddTenantModal";
import UpdateTenantModal from "../../tenants_vehicles/components/UpdateTenantModal";
import {
  getContractsByRoomId,
  getAllTenantsByContractId,
  addTenantToContract,
  tenantLeave,
  updateTenant,
  addVehicleToTenant,
  deleteVehicleFromTenant
} from "../services/roomApi";
import AddVehicleModal from "../../tenants_vehicles/components/AddVehicleModal";

function RoomDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { room } = location.state || {};

  const [contract, setContract] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);

  // state add modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // state update modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [submitErrorUpdate, setSubmitErrorUpdate] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);

  // state add vehicle
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [submittingVehicle, setSubmittingVehicle] = useState(false);
  const [submitErrorVehicle, setSubmitErrorVehicle] = useState(null);

  useEffect(() => {
    if (!room?.roomCode) return;

    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const contractResponse = await getContractsByRoomId(
          room.roomCode,
          "ACTIVE",
        );
        if (isMounted) {
          setContract(contractResponse);
        }

        if (contractResponse && contractResponse.contractId) {
          const tenantResponse = await getAllTenantsByContractId(
            contractResponse.contractId,
          );
          if (isMounted) {
            setTenants(tenantResponse || []);
          }
        } else {
          if (isMounted) {
            setTenants([]);
          }
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
        if (isMounted) {
          setContract(null);
          setTenants([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [room?.roomCode]);

  // handle show modal based on room status
  const handleAddTenant = () => {
    if (room?.status === "AVAILABLE") {
      navigate("/tenants/add", { state: { roomCode: room.roomCode } });
    } else {
      setSubmitError(null);
      setShowModal(true);
    }
  };

  // handle show update modal
  const handleUpdateTenant = (tenant) => {
    setSubmitErrorUpdate(null);
    setShowUpdateModal(true);
    setSelectedTenant(tenant);
  };
  // handle submit form
  const onSubmit = async (formData) => {
    if (!contract?.contractId) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      await addTenantToContract(contract.contractId, formData);
      const updated = await getAllTenantsByContractId(contract.contractId);
      setTenants(updated);
      setShowModal(false);
    } catch (error) {
      setSubmitError("Thêm thành viên thất bại. Vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitUpdate = async (formData) => {
    if (!contract?.contractId) return;
    setSubmittingUpdate(true);
    setSubmitErrorUpdate(null);

    try {
      await updateTenant(selectedTenant.tenantId, formData);
      const updated = await getAllTenantsByContractId(contract.contractId);
      setTenants(updated);
      setShowUpdateModal(false);
    } catch (error) {
      setSubmitErrorUpdate("Cập nhật thành viên thất bại. Vui lòng thử lại");
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleTenantLeave = async (tenantId) => {
    try {
      await tenantLeave(contract.contractId, tenantId);
      const updated = await getAllTenantsByContractId(contract.contractId);
      setTenants(updated);
    } catch (error) {
      alert("Xóa thành viên thất bại. Vui lòng thử lại");
    }
  };

  const handleAddVehicle = () => {
    setSubmitErrorVehicle(null);
    setShowVehicleModal(true);
  };

  const onSubmitVehicle = async (formData) => {
    if (!contract?.contractId) return;
    setSubmittingVehicle(true);
    setSubmitErrorVehicle(null);

    try {
      await addVehicleToTenant(formData.tenantId, {
        numberPlate: formData.numberPlate,
        vehicleType: formData.vehicleType,
      });
      const updated = await getAllTenantsByContractId(contract.contractId);
      setTenants(updated);
      setShowVehicleModal(false);
    } catch (error) {
      setSubmitErrorVehicle("Thêm phương tiện thất bại. Vui lòng thử lại");
    } finally {
      setSubmittingVehicle(false);
    }
  };

  const handleDeleteVehicle = async (tenantId, vehicleId) => {
    try{
      await deleteVehicleFromTenant(tenantId, vehicleId);
      const updated = await getAllTenantsByContractId(contract.contractId);
      setTenants(updated);
    }catch(error){
      setSubmitErrorVehicle("Xóa phương tiện thất bại. Vui lòng thử lại");
    }
  }

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item onClick={() => navigate("/rooms")}>
          <ArrowLeft /> Danh sách phòng
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Quản lý người thuê và xe</Breadcrumb.Item>
      </Breadcrumb>

      <Tabs
        defaultActiveKey="tenants_vehicles"
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab eventKey="tenants_vehicles" title="Thành viên và phương tiện">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-2" />
              <div className="text-muted">
                Đang tải thông tin thành viên và phương tiện...
              </div>
            </div>
          ) : (
            <>
              <div className="tenants">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <PeopleFill className="text-primary fs-5" />
                    <h5 className="mb-0 fw-bold">
                      Danh sách thành viên ({tenants.length})
                    </h5>
                  </div>
                  <Button
                    variant="link"
                    className="text-decoration-none text-primary fw-bold p-0"
                    onClick={handleAddTenant}
                  >
                    [ + THÊM THÀNH VIÊN MỚI ]
                  </Button>
                </div>

                <Row className="g-3 mb-4">
                  {tenants.map((tenant) => (
                    <Col key={tenant.tenantId} xs={12} md={6}>
                      <TenantCard
                        tenant={tenant}
                        handleTenantLeave={handleTenantLeave}
                        handleUpdateTenant={handleUpdateTenant}
                      />
                    </Col>
                  ))}
                </Row>
              </div>

              <div className="vehicles">
                <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-5">🏍️</span>
                    <h5 className="mb-0 fw-bold">Phương tiện giao thông</h5>
                  </div>
                  <Button
                    variant="link"
                    className="text-decoration-none text-primary fw-bold p-0"
                    onClick={handleAddVehicle}
                  >
                    [ + ĐĂNG KÝ PHƯƠNG TIỆN ]
                  </Button>
                </div>
                <VehicleTable tenants={tenants} handleDeleteVehicle={handleDeleteVehicle}/>
              </div>
            </>
          )}
        </Tab>

        <Tab eventKey="invoices" title="Hóa Đơn">
          Tab content for Contact
        </Tab>
        <Tab eventKey="furnishings" title="CSVC">
          Tab content for Contact
        </Tab>
        <Tab eventKey="contracts" title="Hợp Đồng">
          Tab content for Contact
        </Tab>
      </Tabs>
      {/* ── Modal thêm thành viên ── */}
      <AddTenantModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={onSubmit}
        submitError={submitError}
        submitting={submitting}
      />

      <UpdateTenantModal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        onSubmit={onSubmitUpdate}
        submitError={submitErrorUpdate}
        submitting={submittingUpdate}
        initialData={selectedTenant}
      />

      <AddVehicleModal
        tenants={tenants}
        onSubmit={onSubmitVehicle}
        onHide={() => setShowVehicleModal(false)}
        show={showVehicleModal}
        submitting={submittingVehicle}
        submitError={submitErrorVehicle}
      />
    </>
  );
}

export default RoomDetails;
