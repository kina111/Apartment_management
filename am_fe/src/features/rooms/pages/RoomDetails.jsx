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
import {
  getContractsByRoomId,
  getAllTenantsByContractId,
} from "../services/roomApi";

function RoomDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { room } = location.state || {};

  const [contract, setContract] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);

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
                  >
                    [ + THÊM THÀNH VIÊN MỚI ]
                  </Button>
                </div>

                <Row className="g-3 mb-4">
                  {tenants.map((tenant) => (
                    <Col key={tenant.tenantId} xs={12} md={6}>
                      <TenantCard tenant={tenant} />
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
                  >
                    [ + ĐĂNG KÝ PHƯƠNG TIỆN ]
                  </Button>
                </div>
                <VehicleTable tenants={tenants} />
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
    </>
  );
}

export default RoomDetails;
