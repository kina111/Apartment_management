import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Image, Row, Spinner } from 'react-bootstrap';
import { Building, CheckCircle, CloudUpload } from 'react-bootstrap-icons';
import { createBuilding } from '../services/buildingApi';
import '../buildings.css';

const initialForm = {
  name: '',
  address: '',
  numberOfFloor: '',
  description: '',
  landlordId: '',
};

function validateForm(form) {
  const errors = {};
  const floorCount = Number(form.numberOfFloor);

  if (!form.name.trim()) {
    errors.name = 'Tên tòa nhà là bắt buộc.';
  }

  if (!form.address.trim()) {
    errors.address = 'Địa chỉ là bắt buộc.';
  }

  if (!Number.isInteger(floorCount) || floorCount <= 0) {
    errors.numberOfFloor = 'Số tầng phải là số nguyên lớn hơn 0.';
  }

  return errors;
}

function BuildingCreatePage() {
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdBuilding, setCreatedBuilding] = useState(null);

  const previews = useMemo(() => {
    return images.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
  }, [images]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
  };

  const handleImagesChange = (event) => {
    const selectedImages = Array.from(event.target.files || []);
    setImages(selectedImages);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    setSubmitError('');
    setCreatedBuilding(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createBuilding(
        {
          ...form,
          numberOfFloor: Number(form.numberOfFloor),
          landlordId: form.landlordId ? Number(form.landlordId) : undefined,
        },
        images,
      );
      setCreatedBuilding(response);
      setForm(initialForm);
      setImages([]);
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.response?.data?.detail || 'Không thể tạo tòa nhà. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="building-create-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Khởi tạo thông tin cơ sở</h1>
        </div>
      </header>

      {createdBuilding && (
        <Alert variant="success" className="building-success-card">
          <div className="d-flex align-items-center gap-2 fw-bold mb-2">
            <CheckCircle /> Tạo tòa nhà thành công
          </div>
          <div>Mã tòa nhà: <strong>{createdBuilding.buildingId}</strong></div>
          <div>Tên: <strong>{createdBuilding.name}</strong></div>
          <div>Số ảnh: <strong>{createdBuilding.imageUrls?.length || 0}</strong></div>
        </Alert>
      )}

      <Row className="g-4">
        <Col xs={12}>
          <Card className="section-card building-form-card">
            <Card.Header className="section-card-header bg-white">
              <div className="d-flex align-items-center gap-3">
                <span className="building-icon-badge"><Building size={22} /></span>
                <div>
                  <h2 className="building-section-title">Thông tin tòa nhà</h2>
                </div>
              </div>
            </Card.Header>

            <Card.Body className="section-card-body">
              {submitError && <Alert variant="danger">{submitError}</Alert>}

              <Form onSubmit={handleSubmit} noValidate>
                <Row className="g-3">
                  <Col md={7}>
                    <Form.Group controlId="buildingName">
                      <Form.Label className="fw-semibold">Tên tòa nhà <span className="required-mark">*</span></Form.Label>
                      <Form.Control
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        isInvalid={Boolean(errors.name)}
                        placeholder="Ví dụ: Chung cư A"
                      />
                      <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={5}>
                    <Form.Group controlId="numberOfFloor">
                      <Form.Label className="fw-semibold">Số tầng <span className="required-mark">*</span></Form.Label>
                      <Form.Control
                        min="1"
                        name="numberOfFloor"
                        type="number"
                        value={form.numberOfFloor}
                        onChange={handleChange}
                        isInvalid={Boolean(errors.numberOfFloor)}
                        placeholder="Ví dụ: 5"
                      />
                      <Form.Control.Feedback type="invalid">{errors.numberOfFloor}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={8}>
                    <Form.Group controlId="buildingAddress">
                      <Form.Label className="fw-semibold">Địa chỉ <span className="required-mark">*</span></Form.Label>
                      <Form.Control
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        isInvalid={Boolean(errors.address)}
                        placeholder="Ví dụ: 123 Nguyễn Trãi, Hà Nội"
                      />
                      <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group controlId="landlordId">
                      <Form.Label className="fw-semibold">Landlord ID</Form.Label>
                      <Form.Control
                        min="1"
                        name="landlordId"
                        type="number"
                        value={form.landlordId}
                        onChange={handleChange}
                        placeholder="Ví dụ: 1"
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group controlId="buildingDescription">
                      <Form.Label className="fw-semibold">Mô tả</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        rows={4}
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Ghi chú thêm về cơ sở, vị trí, tiện ích xung quanh..."
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Label className="fw-semibold">Ảnh tòa nhà</Form.Label>
                    <label className="upload-zone building-upload-zone" htmlFor="buildingImages">
                      <CloudUpload size={34} />
                      <span className="fw-semibold">Chọn ảnh hoặc kéo thả vào đây</span>
                      <small>Hỗ trợ chọn nhiều ảnh. Có thể bỏ trống.</small>
                      <Form.Control
                        id="buildingImages"
                        className="visually-hidden"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesChange}
                      />
                    </label>
                  </Col>
                </Row>

                {previews.length > 0 && (
                  <div className="building-preview-grid mt-3">
                    {previews.map((preview) => (
                      <figure key={preview.url} className="building-preview-item">
                        <Image src={preview.url} alt={preview.name} />
                        <figcaption>{preview.name}</figcaption>
                      </figure>
                    ))}
                  </div>
                )}

                <div className="building-form-actions">
                  <Button type="button" variant="light" onClick={() => { setForm(initialForm); setImages([]); setErrors({}); }}>
                    Xóa form
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner size="sm" className="me-2" /> : null}
                    Tạo tòa nhà
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default BuildingCreatePage;
