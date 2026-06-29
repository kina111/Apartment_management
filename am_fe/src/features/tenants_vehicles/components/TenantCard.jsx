import { Card, Button } from "react-bootstrap";
import { PersonFill, Eye, Trash } from "react-bootstrap-icons";

function TenantCard({ tenant, handleTenantLeave, handleUpdateTenant }) {
  return (
    <Card className="border-secondary bg-dark text-white rounded-0">
      <Card.Body>
        <Card.Title className="d-flex align-items-center gap-2 fs-6 mb-3">
          <PersonFill className="text-primary" />
          <span>{tenant.name}</span>
        </Card.Title>
        <Card.Text className="mb-4 text-secondary">
          Badge:{" "}
          <span className="text-white fw-bold">
            {tenant.isContractHolder ? "CHỦ HỢP ĐỒNG" : "THÀNH VIÊN"}
          </span>
        </Card.Text>
        <div className="d-flex justify-content-between">
          <Button variant="link" className="text-decoration-none text-primary p-0"
          onClick={() => handleUpdateTenant(tenant)}>
            [ <Eye className="me-1" /> Hồ sơ ]
          </Button>
          {!tenant.isContractHolder && (
            <Button
              variant="link"
              className="text-decoration-none text-danger p-0"
              onClick={() => {
                if (window.confirm(`Xác nhận cho ${tenant.name} rời phòng?`)) {
                  handleTenantLeave(tenant.tenantId);
                }
              }}
            >
              [ <Trash className="me-1" /> Rời phòng ]
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default TenantCard;
