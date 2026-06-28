import { useForm, useFieldArray } from "react-hook-form";
import { Modal, Button, Form, Alert, Row, Col, Spinner } from "react-bootstrap";
import { PersonFill, Trash, PlusCircle } from "react-bootstrap-icons";

const AddTenantModal = ({ show, onHide, onSubmit, submitError, submitting }) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      dateOfBirth: "",
      phoneNumber: "",
      permanentAddress: "",
      citizenId: "",
      email: "",
      emergencyContacts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  const handleClose = () => {
    reset();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Thêm thành viên mới</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {submitError && <Alert variant="danger">{submitError}</Alert>}

          {/* ── Thông tin cơ bản ── */}
          <Form.Group className="mb-3">
            <Form.Label>
              Họ và tên <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...register("name", { required: "Vui lòng nhập họ tên" })}
              isInvalid={!!errors.name}
              placeholder="Nguyễn Văn A"
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              CCCD/CMND <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...register("citizenId", { required: "Vui lòng nhập số CCCD" })}
              isInvalid={!!errors.citizenId}
              placeholder="0123456789"
            />
            <Form.Control.Feedback type="invalid">
              {errors.citizenId?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Ngày sinh <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  {...register("dateOfBirth", {
                    required: "Vui lòng nhập ngày sinh",
                  })}
                  isInvalid={!!errors.dateOfBirth}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.dateOfBirth?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Số điện thoại <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  {...register("phoneNumber", {
                    required: "Vui lòng nhập số điện thoại",
                  })}
                  isInvalid={!!errors.phoneNumber}
                  placeholder="0912345678"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phoneNumber?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              {...register("email", { required: "Vui lòng nhập email"})}
              isInvalid={!!errors.email}
              placeholder="example@gmail.com"
            />
            <Form.Control.Feedback type="invalid">
              {errors.email?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Địa chỉ thường trú</Form.Label>
            <Form.Control
              {...register("permanentAddress", {
                required: "Vui lòng nhập địa chỉ thường trú",
              })}
              isInvalid={!!errors.permanentAddress}
              placeholder="Số nhà, đường, phường/xã, tỉnh/thành"
            />
            <Form.Control.Feedback type="invalid">
              {errors.permanentAddress?.message}
            </Form.Control.Feedback>
          </Form.Group>

          {/* ── Người liên hệ khẩn cấp ── */}
          <hr className="border-secondary" />
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Form.Label className="mb-0 d-flex align-items-center gap-2">
              <PersonFill className="text-warning" />
              Người liên hệ khẩn cấp
            </Form.Label>
            <Button
              variant="link"
              className="text-decoration-none text-primary p-0 small"
              type="button"
              onClick={() => append({ name: "", phoneNumber: "" })}
            >
              <PlusCircle className="me-1" /> Thêm
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-muted small fst-italic mb-2">
              Chưa có người liên hệ khẩn cấp.
            </p>
          )}

          {fields.map((field, index) => (
            <Row key={field.id} className="g-2 mb-2 align-items-center">
              <Col md={5}>
                <Form.Control
                  size="sm"
                  placeholder="Họ tên"
                  {...register(`emergencyContacts.${index}.name`, {
                    required: "Vui lòng nhập họ tên",
                  })}
                  isInvalid={!!errors.emergencyContacts?.[index]?.name}
                />
              </Col>
              <Col md={5}>
                <Form.Control
                  size="sm"
                  placeholder="Số điện thoại"
                  {...register(`emergencyContacts.${index}.phoneNumber`, {
                    required: "Vui lòng nhập SĐT",
                  })}
                  isInvalid={!!errors.emergencyContacts?.[index]?.phoneNumber}
                />
              </Col>
              <Col md={2} className="text-center">
                <Button
                  variant="link"
                  className="text-danger p-0"
                  type="button"
                  onClick={() => remove(index)}
                >
                  <Trash />
                </Button>
              </Col>
            </Row>
          ))}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? (
              <Spinner size="sm" animation="border" />
            ) : (
              "Thêm thành viên"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddTenantModal;
