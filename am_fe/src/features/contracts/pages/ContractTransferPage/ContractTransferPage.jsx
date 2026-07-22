import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, Save } from 'react-bootstrap-icons';
import { getAvailableTenants, transferContract } from '../../services/contractApi';
import useContractDetail from '../../hooks/useContractDetail';
import TenantSelector from '../../components/TenantSelector';
import AttachmentUploader from '../../components/AttachmentUploader';
import commonStyles from '../../contractsCommon.module.css';
import detailStyles from '../ContractDetailPage/ContractDetailPage.module.css';

function ContractTransferPage() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { contract, loading: loadingDetails, error: detailsError } = useContractDetail(contractId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableTenants, setAvailableTenants] = useState([]);

  // Form values
  const [transferDate, setTransferDate] = useState('');
  const [tenantMode, setTenantMode] = useState('existing');
  const [tenantId, setTenantId] = useState('');

  // New tenant fields grouped cohesively
  const [newTenantDetails, setNewTenantDetails] = useState({
    name: '',
    dateOfBirth: '',
    phoneNumber: '',
    permanentAddress: '',
    citizenId: '',
    email: '',
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const tenantsData = await getAvailableTenants();
        setAvailableTenants(tenantsData);
        // Default transfer date to today
        setTransferDate(new Date().toISOString().split('T')[0]);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách cư dân.');
      }
    };
    fetchTenants();
  }, []);

  const handleImagesChange = (newImages, newPreviews) => {
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleTenantChange = (field, val) => {
    if (field === 'tenantId') {
      setTenantId(val);
    } else {
      setNewTenantDetails((prev) => ({ ...prev, [field]: val }));
    }
  };

  const handleTenantModeChange = (mode) => {
    setTenantMode(mode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!transferDate) {
      setError('Vui lòng chọn ngày chuyển nhượng.');
      return;
    }

    if (tenantMode === 'existing' && !tenantId) {
      setError('Vui lòng chọn khách thuê mới.');
      return;
    }

    if (
      tenantMode === 'new' &&
      (!newTenantDetails.name || !newTenantDetails.phoneNumber || !newTenantDetails.citizenId)
    ) {
      setError('Vui lòng điền các thông tin bắt buộc cho khách thuê mới.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('transferDate', transferDate);

    if (tenantMode === 'existing') {
      formData.append('tenantId', tenantId);
    } else {
      formData.append('tenantName', newTenantDetails.name);
      if (newTenantDetails.dateOfBirth) {
        formData.append('tenantDateOfBirth', newTenantDetails.dateOfBirth);
      }
      formData.append('tenantPhoneNumber', newTenantDetails.phoneNumber);
      formData.append('tenantPermanentAddress', newTenantDetails.permanentAddress);
      formData.append('tenantCitizenId', newTenantDetails.citizenId);
      formData.append('tenantEmail', newTenantDetails.email);
    }

    images.forEach((img) => {
      formData.append('images', img);
    });

    try {
      const response = await transferContract(contractId, formData);
      navigate(`/contracts/id/${response.contractId}`);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Lỗi chuyển nhượng hợp đồng. Vui lòng kiểm tra lại thông tin.'
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
            <h1 className={`${commonStyles.contractsTitle} mb-0`} id="transfer-contract-title">
              Chuyển nhượng Hợp đồng
            </h1>
            <small className="text-muted">
              Chuyển nhượng căn hộ {contract?.roomName || `Phòng ${contract?.roomCode}`} sang khách thuê mới
            </small>
          </div>
        </div>
      </div>

      {displayError && <Alert variant="danger">{displayError}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          {/* Left Column: Old Holder & Transfer Date */}
          <Col lg={5}>
            <div className={commonStyles.premiumCard}>
              <h3 className={commonStyles.formSectionTitle}>Hợp đồng hiện tại</h3>
              <div className={detailStyles.detailLabel}>Phòng căn hộ</div>
              <div className={detailStyles.detailValue}>{contract?.roomName || `Phòng ${contract?.roomCode}`}</div>

              <div className={detailStyles.detailLabel}>Khách thuê hiện tại</div>
              <div className={`${detailStyles.detailValue} text-danger`}>
                {contract?.tenantName}
              </div>

              <div className={detailStyles.detailLabel}>Tiền thuê phòng</div>
              <div className={detailStyles.detailValue}>
                {contract?.rent?.toLocaleString()} đ / tháng
              </div>

              <div className={detailStyles.detailLabel}>Tiền đặt cọc</div>
              <div className={`${detailStyles.detailValue} text-success`}>
                {contract?.depositAmount?.toLocaleString()} đ
              </div>
            </div>

            <div className={commonStyles.premiumCard}>
              <h3 className={commonStyles.formSectionTitle}>Cấu hình Chuyển nhượng</h3>
              <Form.Group className="mb-3">
                <Form.Label>Ngày chuyển nhượng hợp đồng</Form.Label>
                <Form.Control
                  id="transfer-date-input"
                  type="date"
                  className={`${commonStyles.filterInput} w-100`}
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  required
                />
                <small className="text-muted mt-1 d-block">
                  Hợp đồng cũ sẽ kết thúc vào ngày trước ngày chuyển nhượng. Hợp đồng mới sẽ bắt đầu hoạt động từ ngày này.
                </small>
              </Form.Group>

              <Form.Group className="mb-3">
                <AttachmentUploader
                  imagePreviews={imagePreviews}
                  onImagesChange={handleImagesChange}
                  id="transfer-images-input"
                  label="Ảnh scan phụ lục / Biên bản chuyển nhượng"
                />
              </Form.Group>
            </div>
          </Col>

          {/* Right Column: New Holder details */}
          <Col lg={7}>
            <div className={commonStyles.premiumCard}>
              <TenantSelector
                tenantMode={tenantMode}
                tenantId={tenantId}
                availableTenants={availableTenants}
                newTenantDetails={newTenantDetails}
                onChange={handleTenantChange}
                onModeChange={handleTenantModeChange}
              />

              <div className="d-grid mt-4">
                <Button
                  id="btn-submit-transfer"
                  type="submit"
                  className={`${commonStyles.btnPremiumPrimary} py-3 d-flex justify-content-center`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Đang xử lý chuyển nhượng...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="me-2" /> Hoàn thành chuyển nhượng
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default ContractTransferPage;
