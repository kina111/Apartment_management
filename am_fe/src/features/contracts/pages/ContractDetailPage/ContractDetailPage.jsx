import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Button, Spinner } from 'react-bootstrap';
import { ArrowLeft, ClockHistory, ArrowRightShort, CalendarCheck } from 'react-bootstrap-icons';
import useContractDetail from '../../hooks/useContractDetail';
import ContractStatusBadge from '../../components/ContractStatusBadge';
import AttachmentGallery from '../../components/AttachmentGallery';
import commonStyles from '../../contractsCommon.module.css';
import styles from './ContractDetailPage.module.css';
import { CONTRACT_STATUS } from '../../constants/contractConstants';

function ContractDetailPage() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { contract, loading } = useContractDetail(contractId);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <div className="text-muted mt-2">Đang tải chi tiết hợp đồng...</div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className={`${commonStyles.premiumCard} text-center py-5`}>
        <div className="text-danger mb-3">Hợp đồng không tồn tại hoặc đã bị xóa.</div>
        <Button className={commonStyles.btnPremiumSecondary} onClick={() => navigate('/contracts')}>
          <ArrowLeft size={16} /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className={commonStyles.contractsContainer}>
      <div className={commonStyles.contractsHeader}>
        <div className="d-flex align-items-center gap-3">
          <Button
            id="btn-back-to-list"
            className={`${commonStyles.btnPremiumSecondary} p-2 d-flex align-items-center justify-content-center`}
            onClick={() => navigate('/contracts')}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className={`${commonStyles.contractsTitle} mb-0`} id="contract-detail-title">
              Hợp đồng #{contract.contractId}
            </h1>
            <small className="text-muted">
              Phòng {contract.roomCode} - {contract.buildingName}
            </small>
          </div>
        </div>

        <div className="d-flex gap-2">
          {contract.status === CONTRACT_STATUS.ACTIVE && (
            <>
              <Button
                id="btn-renew-contract"
                className={commonStyles.btnPremiumPrimary}
                onClick={() => navigate(`/contracts/id/${contract.contractId}/renew`)}
              >
                <ClockHistory size={16} /> Gia hạn
              </Button>
              <Button
                id="btn-transfer-contract"
                className={`${commonStyles.btnPremiumPrimary} bg-info border-0`}
                onClick={() => navigate(`/contracts/id/${contract.contractId}/transfer`)}
              >
                <ArrowRightShort size={18} /> Chuyển nhượng
              </Button>
              <Button
                id="btn-terminate-contract"
                className={`${commonStyles.btnPremiumPrimary} bg-danger border-0`}
                onClick={() => navigate(`/contracts/id/${contract.contractId}/terminate`)}
              >
                <CalendarCheck size={16} /> Thanh lý
              </Button>
            </>
          )}
        </div>
      </div>

      <div className={styles.detailGrid}>
        {/* Left Side: General Info & Service Fees */}
        <div>
          <div className={commonStyles.premiumCard}>
            <h3 className={commonStyles.formSectionTitle}>Thông tin Hợp đồng</h3>
            <Row>
              <Col md={6}>
                <div className={styles.detailLabel}>Phòng căn hộ</div>
                <div className={styles.detailValue}>
                  {contract.roomCode} (Tầng {contract.floorNumber})
                </div>
              </Col>
              <Col md={6}>
                <div className={styles.detailLabel}>Tòa nhà</div>
                <div className={styles.detailValue}>{contract.buildingName}</div>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <div className={styles.detailLabel}>Ngày bắt đầu</div>
                <div className={styles.detailValue}>{contract.startDate}</div>
              </Col>
              <Col md={6}>
                <div className={styles.detailLabel}>Ngày kết thúc</div>
                <div className={styles.detailValue}>{contract.endDate}</div>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <div className={styles.detailLabel}>Tiền thuê căn hộ</div>
                <div className={`${styles.detailValue} text-primary font-weight-bold`}>
                  {contract.rent?.toLocaleString()} đ / tháng
                </div>
              </Col>
              <Col md={6}>
                <div className={styles.detailLabel}>Tiền đặt cọc</div>
                <div className={`${styles.detailValue} text-success font-weight-bold`}>
                  {contract.depositAmount?.toLocaleString()} đ
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <div className={styles.detailLabel}>Trạng thái hợp đồng</div>
                <div>
                  <ContractStatusBadge status={contract.status} />
                </div>
              </Col>
              {contract.parentContractId && (
                <Col md={6}>
                  <div className={styles.detailLabel}>Hợp đồng gốc trước gia hạn</div>
                  <div className={styles.detailValue}>
                    <a
                      id="parent-contract-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/contracts/id/${contract.parentContractId}`);
                      }}
                    >
                      Xem HĐ gốc #{contract.parentContractId}
                    </a>
                  </div>
                </Col>
              )}
            </Row>
          </div>

          <div className={commonStyles.premiumCard}>
            <h3 className={commonStyles.formSectionTitle}>Danh sách phí dịch vụ</h3>
            {contract.serviceFees && contract.serviceFees.length > 0 ? (
              <div className="border rounded">
                {contract.serviceFees.map((fee) => (
                  <div className={styles.serviceFeeItem} key={fee.serviceFeeId}>
                    <div>
                      <strong>{fee.name}</strong>
                      <span className="text-muted ms-2" style={{ fontSize: '12px' }}>
                        ({fee.chargeType === 'PER_ROOM' ? 'Cố định / căn hộ' : 'Theo chỉ số sử dụng'})
                      </span>
                    </div>
                    <div className="text-primary font-weight-bold">
                      {fee.fee?.toLocaleString()} đ
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted py-2">Không có phí dịch vụ nào được cài đặt.</div>
            )}
          </div>
        </div>

        {/* Right Side: Tenant Info & Images */}
        <div>
          <div className={commonStyles.premiumCard}>
            <h3 className={commonStyles.formSectionTitle}>Khách thuê đại diện</h3>
            <div className={styles.detailLabel}>Họ tên</div>
            <div className={styles.detailValue}>{contract.tenantName || 'Chưa thiết lập'}</div>

            <div className={styles.detailLabel}>Số điện thoại</div>
            <div className={styles.detailValue}>{contract.tenantPhoneNumber || '-'}</div>

            <div className={styles.detailLabel}>Email</div>
            <div className={styles.detailValue}>{contract.tenantEmail || '-'}</div>
          </div>

          <div className={commonStyles.premiumCard}>
            <h3 className={commonStyles.formSectionTitle}>Tệp đính kèm & Ảnh</h3>
            <AttachmentGallery images={contract.images} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContractDetailPage;
