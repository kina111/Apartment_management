import { Modal, Form, Alert, Spinner, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";

const AddVehicleModal = ({
  tenants,
  onSubmit,
  onHide,
  show,
  submitting,
  submitError,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tenantId: "",
      numberPlate: "",
      vehicleType: "",
    },
  });

  const handleClose = () => {
    reset();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Thêm phương tiện mới</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" className="mb-3">
              {submitError}
            </Alert>
          )}
          <Form.Group>
            <Form.Label>Chủ sở hữu</Form.Label>
            <Form.Select
              {...register("tenantId", {
                required: "Vui lòng chọn chủ sở hữu",
              })}
              isInvalid={!!errors.tenantId}
            >
              <option value="">Chọn chủ sở hữu</option>
              {tenants.map((tenant) => (
                <option key={tenant.tenantId} value={tenant.tenantId}>
                  {tenant.name} - {tenant.phoneNumber}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.tenantId?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>Biển số xe</Form.Label>
            <Form.Control
              {...register("numberPlate", {
                required: "Vui lòng nhập biển số xe",
              })}
              isInvalid={!!errors.numberPlate}
            />
            <Form.Control.Feedback type="invalid">
              {errors.numberPlate?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>Loại phương tiện</Form.Label>
            <Form.Control
              {...register("vehicleType", {
                required: "Vui lòng nhập loại phương tiện",
              })}
              isInvalid={!!errors.vehicleType}
            />
            <Form.Control.Feedback type="invalid">
              {errors.vehicleType?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? (
              <Spinner as="span" size="sm" animation="border" role="status" />
            ) : (
              "Thêm mới"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddVehicleModal;
