import { Button, Table } from "react-bootstrap";
import { Trash } from "react-bootstrap-icons";

function VehicleTable({ tenants, vehicles: vehicleItems, handleDeleteVehicle, startIndex = 0 }) {
  // Flatten vehicles from all tenants and include the owner's name
  const vehicles = vehicleItems || (tenants || []).flatMap((tenant) =>
    (tenant.vehicles || []).map((vehicle) => ({
      ...vehicle,
      ownerName: tenant.name,
      tenantId: tenant.tenantId,
    }))
  );

  return (
    <Table bordered hover responsive className="vehicle-table">
      <thead>
        <tr>
          <th>Stt</th>
          <th>Biển số</th>
          <th>Loại xe</th>
          <th>Chủ xe</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {vehicles.map((vehicle, index) => (
          <tr key={vehicle.vehicleId || index}>
            <td>{startIndex + index + 1}</td>
            <td>{vehicle.numberPlate}</td>
            <td>{vehicle.vehicleType}</td>
            <td>{vehicle.ownerName}</td>
            <td>
              <Button variant="link" className="text-decoration-none text-danger p-0 d-inline-flex align-items-center text-nowrap"
              onClick={() => {
                if (window.confirm("Bạn có chắc chắn muốn xóa phương tiện này?")) {
                  handleDeleteVehicle(vehicle.tenantId, vehicle.vehicleId);
                }
              }}>
                [ <Trash className="mx-1" /> Xóa ]
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default VehicleTable;
