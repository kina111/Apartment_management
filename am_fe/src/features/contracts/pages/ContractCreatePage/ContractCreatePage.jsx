import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, Save } from 'react-bootstrap-icons';
import { createContract, getAvailableTenants } from '../../services/contractApi';
import { getRoomsByBuilding } from '../../../rooms/services/roomApi';
import TenantSelector from '../../components/TenantSelector';
import ServiceFeeConfigurator from '../../components/ServiceFeeConfigurator';
import AttachmentUploader from '../../components/AttachmentUploader';
import { CHARGE_TYPES } from '../../constants/contractConstants';
import commonStyles from '../../contractsCommon.module.css';
import detailStyles from '../ContractDetailPage/ContractDetailPage.module.css';

function ContractCreatePage({ buildings }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableTenants, setAvailableTenants] = useState([]);

  // Form fields
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [rent, setRent] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Tenant selection type: 'existing' or 'new'
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

  // Service fees
  const [serviceFees, setServiceFees] = useState([
    { name: 'Điện', fee: '4000', chargeType: CHARGE_TYPES.PER_INDEX },
    { name: 'Nước', fee: '30000', chargeType: CHARGE_TYPES.PER_ROOM },
  ]);

  // Uploaded files
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const tenants = await getAvailableTenants();
        setAvailableTenants(tenants);
      } catch (err) {
        console.error('Failed to load available tenants:', err);
      }
    };
    fetchTenants();
  }, []);

  // Fetch rooms when building changes
  useEffect(() => {
    if (!selectedBuilding) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRooms([]);
      return;
    }
    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const allRooms = await getRoomsByBuilding(selectedBuilding);
        // Only show rooms with status "AVAILABLE"
        const vacantRooms = allRooms.filter((r) => r.status === 'AVAILABLE');
        setRooms(vacantRooms);
      } catch (err) {
        console.error('Failed to load building rooms:', err);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, [selectedBuilding]);

  const handleAddFeeRow = () => {
    setServiceFees([...serviceFees, { name: '', fee: '', chargeType: CHARGE_TYPES.PER_ROOM }]);
  };

  const handleRemoveFeeRow = (index) => {
    setServiceFees(serviceFees.filter((_, i) => i !== index));
  };

  const handleFeeChange = (index, field, value) => {
    const updated = [...serviceFees];
    updated[index][field] = value;
    setServiceFees(updated);
  };

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

    if (!roomCode) {
      setError('Vui lòng chọn phòng căn hộ.');
      return;
    }

    // Validate dates: end date must not be before start date, and duration must be >= 1 month
    if (!startDate || !endDate) {
      setError('Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc.');
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setError('Ngày kết thúc hợp đồng không được nhỏ hơn ngày bắt đầu hợp đồng.');
      return;
    }
    const minEndDate = new Date(start);
    minEndDate.setMonth(minEndDate.getMonth() + 1);
    if (end < minEndDate) {
      setError('Thời hạn hợp đồng phải kéo dài ít nhất 1 tháng.');
      return;
    }

    // Validate rent: must be positive integer without non-numeric characters
    if (!rent) {
      setError('Vui lòng nhập tiền thuê hàng tháng.');
      return;
    }
    if (!/^\d+$/.test(String(rent).trim())) {
      setError('Tiền thuê phòng phải là số nguyên dương và không chứa các ký tự khác ngoài số.');
      return;
    }

    // Validate deposit: must be positive integer without non-numeric characters
    if (!depositAmount) {
      setError('Vui lòng nhập tiền đặt cọc.');
      return;
    }
    if (!/^\d+$/.test(String(depositAmount).trim())) {
      setError('Tiền đặt cọc phải là số nguyên dương và không chứa các ký tự khác ngoài số.');
      return;
    }

    if (tenantMode === 'existing' && !tenantId) {
      setError('Vui lòng chọn khách thuê đại diện.');
      return;
    }

    if (
      tenantMode === 'new' &&
      (!newTenantDetails.name || !newTenantDetails.phoneNumber || !newTenantDetails.citizenId)
    ) {
      setError('Vui lòng điền các thông tin khách thuê bắt buộc (Tên, SĐT, CMND/CCCD).');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('roomCode', roomCode);
    formData.append('rent', rent);
    formData.append('depositAmount', depositAmount);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);

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

    // Append service fees with indexed syntax for Spring model mapping
    serviceFees.forEach((fee, idx) => {
      if (fee.name && fee.fee) {
        formData.append(`serviceFees[${idx}].name`, fee.name);
        formData.append(`serviceFees[${idx}].fee`, fee.fee);
        formData.append(`serviceFees[${idx}].chargeType`, fee.chargeType);
      }
    });

    // Append images
    images.forEach((img) => {
      formData.append('images', img);
    });

    try {
      const response = await createContract(formData);
      navigate(`/contracts/id/${response.contractId}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi tạo hợp đồng. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={commonStyles.contractsContainer}>
      <div className={commonStyles.contractsHeader}>
        <div className="d-flex align-items-center gap-3">
          <Button
            id="btn-back"
            className={`${commonStyles.btnPremiumSecondary} p-2 d-flex align-items-center justify-content-center`}
            onClick={() => navigate('/contracts')}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className={`${commonStyles.contractsTitle} mb-0`} id="create-contract-title">
              Tạo Hợp đồng Mới
            </h1>
            <small className="text-muted">Đăng ký căn hộ thuê mới và thiết lập biểu phí</small>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <div className={detailStyles.detailGrid}>
          {/* Left Column: Room & Contract Terms */}
          <div>
            <div className={commonStyles.premiumCard}>
              <h3 className={commonStyles.formSectionTitle}>1. Thông tin Căn hộ & Thời hạn</h3>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Tòa nhà</Form.Label>
                  <Form.Select
                    id="building-select"
                    className={`${commonStyles.filterSelect} w-100`}
                    value={selectedBuilding}
                    onChange={(e) => {
                      setSelectedBuilding(e.target.value);
                      setRoomCode('');
                    }}
                    required
                  >
                    <option value="">-- Chọn tòa nhà --</option>
                    {buildings.map((b) => (
                      <option key={b.buildingId} value={b.buildingId}>
                        {b.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>Phòng căn hộ</Form.Label>
                  <Form.Select
                    id="room-select"
                    className={`${commonStyles.filterSelect} w-100`}
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    disabled={!selectedBuilding || loadingRooms}
                    required
                  >
                    <option value="">
                      {loadingRooms ? 'Đang tải phòng...' : '-- Chọn phòng trống --'}
                    </option>
                    {rooms.map((r) => (
                      <option key={r.roomCode} value={r.roomCode}>
                        Phòng {r.roomCode}
                      </option>
                    ))}
                  </Form.Select>
                  {selectedBuilding && rooms.length === 0 && !loadingRooms && (
                    <small className="text-danger">
                      Không có phòng nào đang trống trong tòa nhà này.
                    </small>
                  )}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Ngày bắt đầu hợp đồng</Form.Label>
                  <Form.Control
                    id="start-date-input"
                    type="date"
                    className={`${commonStyles.filterInput} w-100`}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Ngày kết thúc hợp đồng</Form.Label>
                  <Form.Control
                    id="end-date-input"
                    type="date"
                    className={`${commonStyles.filterInput} w-100`}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Tiền thuê hàng tháng (đ)</Form.Label>
                  <Form.Control
                    id="rent-input"
                    type="number"
                    className={`${commonStyles.filterInput} w-100`}
                    placeholder="Ví dụ: 5000000"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Tiền đặt cọc (đ)</Form.Label>
                  <Form.Control
                    id="deposit-input"
                    type="number"
                    className={`${commonStyles.filterInput} w-100`}
                    placeholder="Ví dụ: 10000000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                  />
                </Col>
              </Row>
            </div>

            <div className={commonStyles.premiumCard}>
              <ServiceFeeConfigurator
                serviceFees={serviceFees}
                onAddFee={handleAddFeeRow}
                onRemoveFee={handleRemoveFeeRow}
                onFeeChange={handleFeeChange}
              />
            </div>
          </div>

          {/* Right Column: Tenant Info & Image Upload */}
          <div>
            <div className={commonStyles.premiumCard}>
              <TenantSelector
                tenantMode={tenantMode}
                tenantId={tenantId}
                availableTenants={availableTenants}
                newTenantDetails={newTenantDetails}
                onChange={handleTenantChange}
                onModeChange={handleTenantModeChange}
              />
            </div>

            <div className={commonStyles.premiumCard}>
              <h3 className={commonStyles.formSectionTitle}>4. Hồ sơ & Ảnh Hợp đồng</h3>
              <AttachmentUploader
                imagePreviews={imagePreviews}
                onImagesChange={handleImagesChange}
              />
            </div>

            <div className="d-grid mt-4">
              <Button
                id="btn-submit-contract"
                type="submit"
                className={`${commonStyles.btnPremiumPrimary} py-3 d-flex justify-content-center`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Đang lưu hợp đồng...
                  </>
                ) : (
                  <>
                    <Save size={18} className="me-2" /> Lưu hợp đồng
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default ContractCreatePage;
