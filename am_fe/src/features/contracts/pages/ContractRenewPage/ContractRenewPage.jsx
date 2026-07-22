import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, Save } from 'react-bootstrap-icons';
import { renewContract } from '../../services/contractApi';
import useContractDetail from '../../hooks/useContractDetail';
import AttachmentUploader from '../../components/AttachmentUploader';
import commonStyles from '../../contractsCommon.module.css';
import detailStyles from '../ContractDetailPage/ContractDetailPage.module.css';

function ContractRenewPage() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { contract, loading: loadingDetails, error: detailsError } = useContractDetail(contractId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form values
  const [rent, setRent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (contract) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRent(contract.rent || '');
      // Set new start date to old end date + 1 day
      if (contract.endDate) {
        const nextDay = new Date(contract.endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setStartDate(nextDay.toISOString().split('T')[0]);
      }
    }
  }, [contract]);

  const handleImagesChange = (newImages, newPreviews) => {
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate dates: end date must not be before start date, and duration must be >= 1 month
    if (!startDate || !endDate) {
      setError('Vui lòng nhập đầy đủ ngày bắt đầu gia hạn và ngày kết thúc gia hạn.');
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setError('Ngày kết thúc gia hạn không được nhỏ hơn ngày bắt đầu gia hạn.');
      return;
    }
    const minEndDate = new Date(start);
    minEndDate.setMonth(minEndDate.getMonth() + 1);
    if (end < minEndDate) {
      setError('Thời hạn gia hạn hợp đồng phải kéo dài ít nhất 1 tháng.');
      return;
    }

    // Validate rent: must be positive integer without non-numeric characters
    if (!rent) {
      setError('Vui lòng nhập tiền thuê phòng mới.');
      return;
    }
    if (!/^\d+$/.test(String(rent).trim())) {
      setError('Tiền thuê phòng phải là số nguyên dương và không chứa các ký tự khác ngoài số.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('rent', rent);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);

    images.forEach((img) => {
      formData.append('images', img);
    });

    try {
      const response = await renewContract(contractId, formData);
      navigate(`/contracts/id/${response.contractId}`);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Lỗi gia hạn hợp đồng. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingDetails) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <div className="text-muted mt-2">Đang tải thông tin hợp đồng...</div>
      </div>
    );
  }

  const displayError = error || detailsError;

  return (
    <div className={commonStyles.contractsContainer}>
      <div className={commonStyles.contractsHeader}>
        <div className="d-flex align-items-center gap-3">
          <Button
            id="btn-back-detail"
            className={`${commonStyles.btnPremiumSecondary} p-2 d-flex align-items-center justify-content-center`}
            onClick={() => navigate(`/contracts/id/${contractId}`)}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className={`${commonStyles.contractsTitle} mb-0`} id="renew-contract-title">
              Gia hạn Hợp đồng
            </h1>
            <small className="text-muted">
              Gia hạn căn hộ {contract?.roomName || `Phòng ${contract?.roomCode}`} (HĐ #{contractId})
            </small>
          </div>
        </div>
      </div>

      {displayError && <Alert variant="danger">{displayError}</Alert>}

      <Row>
        {/* Left Side: Summary of old contract */}
        <Col lg={4}>
          <div className={commonStyles.premiumCard}>
            <h3 className={commonStyles.formSectionTitle}>Hợp đồng hiện tại</h3>
            <div className={detailStyles.detailLabel}>Phòng căn hộ</div>
            <div className={detailStyles.detailValue}>{contract?.roomName || `Phòng ${contract?.roomCode}`}</div>

            <div className={detailStyles.detailLabel}>Khách thuê</div>
            <div className={detailStyles.detailValue}>{contract?.tenantName}</div>

            <div className={detailStyles.detailLabel}>Ngày ngày bắt đầu cũ</div>
            <div className={detailStyles.detailValue}>{contract?.startDate}</div>

            <div className={detailStyles.detailLabel}>Ngày kết thúc cũ</div>
            <div className={detailStyles.detailValue}>{contract?.endDate}</div>

            <div className={detailStyles.detailLabel}>Tiền đặt cọc cũ</div>
            <div className={detailStyles.detailValue}>
              {contract?.depositAmount?.toLocaleString()} đ
            </div>
            <small className="text-muted d-block mt-2">
              Lưu ý: Tiền đặt cọc sẽ được chuyển tiếp giữ nguyên sang hợp đồng mới.
            </small>
          </div>
        </Col>

        {/* Right Side: Renewal Inputs */}
        <Col lg={8}>
          <div className={commonStyles.premiumCard}>
            <h3 className={commonStyles.formSectionTitle}>Thông tin gia hạn mới</h3>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Ngày bắt đầu gia hạn</Form.Label>
                  <Form.Control
                    id="renew-start-date-input"
                    type="date"
                    className={`${commonStyles.filterInput} w-100`}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Ngày kết thúc gia hạn</Form.Label>
                  <Form.Control
                    id="renew-end-date-input"
                    type="date"
                    className={`${commonStyles.filterInput} w-100`}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Tiền thuê phòng mới hàng tháng (đ)</Form.Label>
                <Form.Control
                  id="renew-rent-input"
                  type="number"
                  className={`${commonStyles.filterInput} w-100`}
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <AttachmentUploader
                  imagePreviews={imagePreviews}
                  onImagesChange={handleImagesChange}
                  id="renew-images-input"
                  label="Ảnh phụ lục hợp đồng gia hạn"
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button
                  id="btn-cancel"
                  type="button"
                  className={commonStyles.btnPremiumSecondary}
                  onClick={() => navigate(`/contracts/id/${contractId}`)}
                >
                  Hủy bỏ
                </Button>
                <Button
                  id="btn-submit-renew"
                  type="submit"
                  className={commonStyles.btnPremiumPrimary}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="me-2" /> Xác nhận gia hạn
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default ContractRenewPage;
