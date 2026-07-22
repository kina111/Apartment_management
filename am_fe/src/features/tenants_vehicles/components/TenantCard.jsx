import { Card, Button } from "react-bootstrap";
import { PersonFill, Eye, Trash } from "react-bootstrap-icons";

function TenantCard({ tenant, handleTenantLeave, handleUpdateTenant }) {
  return (
    <Card className="tenant-card">
      <Card.Body>
        <Card.Title className="d-flex align-items-center gap-2 fs-6 mb-3">
          <PersonFill className="text-primary" />
          <span>{tenant.name}</span>
        </Card.Title>
        <Card.Text className="tenant-card-badge mb-4">
          Badge:{" "}
          <span className="tenant-card-badge-value">
            {tenant.isContractHolder ? "CHỦ HỢP ĐỒNG" : "THÀNH VIÊN"}
          </span>
        </Card.Text>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <Button variant="link" className="text-decoration-none text-primary p-0 d-flex align-items-center text-nowrap"
          onClick={() => handleUpdateTenant(tenant)}>
            [ <Eye className="mx-1" /> Hồ sơ ]
          </Button>
          {!tenant.isContractHolder && (
            <Button
              variant="link"
              className="text-decoration-none text-danger p-0 d-flex align-items-center text-nowrap"
              onClick={() => {
                if (window.confirm(`Xác nhận cho ${tenant.name} rời phòng?`)) {
                  handleTenantLeave(tenant.tenantId);
                }
              }}
            >
              [ <Trash className="mx-1" /> Rời phòng ]
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default TenantCard;
