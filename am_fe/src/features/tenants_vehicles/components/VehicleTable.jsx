import { Button, Table } from "react-bootstrap";
import { Trash } from "react-bootstrap-icons";

function VehicleTable({ tenants }) {
  // Flatten vehicles from all tenants and include the owner's name
  const vehicles = (tenants || []).flatMap((tenant) =>
    (tenant.vehicles || []).map((vehicle) => ({
      ...vehicle,
      ownerName: tenant.name,
    }))
  );

  return (
    <Table striped bordered hover variant="dark" className="text-white border-secondary">
      <thead>
        <tr>
          <th>Biển số</th>
          <th>Loại xe</th>
          <th>Chủ xe</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {vehicles.map((vehicle, index) => (
          <tr key={vehicle.vehicleId || index}>
            <td>{vehicle.numberPlate}</td>
            <td>{vehicle.vehicleType}</td>
            <td>{vehicle.ownerName}</td>
            <td>
              <Button variant="link" className="text-decoration-none text-danger p-0">
                [ <Trash className="me-1" /> Xóa ]
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default VehicleTable;