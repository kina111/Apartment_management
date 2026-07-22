import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, Save } from 'react-bootstrap-icons';
import { terminateContract } from '../../services/contractApi';
import useContractDetail from '../../hooks/useContractDetail';
import AttachmentUploader from '../../components/AttachmentUploader';
import commonStyles from '../../contractsCommon.module.css';
import detailStyles from '../ContractDetailPage/ContractDetailPage.module.css';

function ContractTerminatePage() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { contract, loading: loadingDetails, error: detailsError } = useContractDetail(contractId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form values
  const [terminationDate, setTerminationDate] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (contract) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTerminationDate(new Date().toISOString().split('T')[0]);
    }
  }, [contract]);

  const handleImagesChange = (newImages, newPreviews) => {
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('terminationDate', terminationDate);

    images.forEach((img) => {
      formData.append('images', img);
    });

    try {
      await terminateContract(contractId, formData);
      navigate(`/contracts/id/${contractId}`);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Lỗi thanh lý hợp đồng. Vui lòng kiểm tra lại thông tin.'
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
            <h1 className={`${commonStyles.contractsTitle} mb-0`} id="terminate-contract-title">
              Thanh lý Hợp đồng
            </h1>
            <small className="text-muted">
              Chấm dứt thuê căn hộ {contract?.roomName || `Phòng ${contract?.roomCode}`} (HĐ #{contractId})
            </small>
          </div>
        </div>
      </div>

      {displayError && <Alert variant="danger">{displayError}</Alert>}

      <Row>
        {/* Left Side: Summary of contract to terminate */}
        <Col lg={5}>
          <div className={commonStyles.premiumCard}>
            <h3 className={commonStyles.formSectionTitle}>Hợp đồng thanh lý</h3>
            <div className={detailStyles.detailLabel}>Phòng căn hộ</div>
            <div className={detailStyles.detailValue}>{contract?.roomName || `Phòng ${contract?.roomCode}`}</div>

            <div className={detailStyles.detailLabel}>Tên khách thuê</div>
            <div className={detailStyles.detailValue}>{contract?.tenantName}</div>

            <div className={detailStyles.detailLabel}>Ngày bắt đầu HĐ</div>
            <div className={detailStyles.detailValue}>{contract?.startDate}</div>

            <div className={detailStyles.detailLabel}>Ngày kết thúc dự kiến</div>
            <div className={detailStyles.detailValue}>{contract?.endDate}</div>

            <div className={detailStyles.detailLabel}>Tiền đặt cọc hoàn trả</div>
            <div className={`${detailStyles.detailValue} text-success font-weight-bold`}>
              {contract?.depositAmount?.toLocaleString()} đ
            </div>
            <small className="text-muted d-block mt-2">
              Lưu ý: Sau khi xác nhận thanh lý, phòng căn hộ sẽ tự động chuyển về trạng thái trống (VACANT).
            </small>
          </div>
        </Col>

        {/* Right Side: Termination settings */}
        <Col lg={7}>
          <div className={commonStyles.premiumCard}>
            <h3 className={commonStyles.formSectionTitle}>Thông tin bàn giao & Thanh lý</h3>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Ngày thanh lý & trả phòng</Form.Label>
                <Form.Control
                  id="termination-date-input"
                  type="date"
                  className={`${commonStyles.filterInput} w-100`}
                  value={terminationDate}
                  onChange={(e) => setTerminationDate(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <AttachmentUploader
                  imagePreviews={imagePreviews}
                  onImagesChange={handleImagesChange}
                  id="terminate-images-input"
                  label="Ảnh tình trạng phòng bàn giao / Biên bản thanh lý"
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
                  id="btn-submit-terminate"
                  type="submit"
                  className={`${commonStyles.btnPremiumPrimary} bg-danger border-0`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Đang xử lý thanh lý...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="me-2" /> Xác nhận thanh lý
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

export default ContractTerminatePage;
