import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Form, Button, Row, Col, Spinner, Pagination } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import { searchContracts } from '../../services/contractApi';
import ContractStatusBadge from '../../components/ContractStatusBadge';
import commonStyles from '../../contractsCommon.module.css';

function ContractListPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchContracts(search, status, page, size);
      setContracts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setLoading(false);
    }
  }, [search, status, page, size]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchContracts();
  }, [fetchContracts]);

  const handleRowClick = (contractId) => {
    navigate(`/contracts/id/${contractId}`);
  };

  return (
    <div className={commonStyles.contractsContainer}>
      <div className={commonStyles.contractsHeader}>
        <h1 className={commonStyles.contractsTitle} id="contracts-title">
          Quản lý Hợp đồng
        </h1>
        <Button
          id="btn-create-contract"
          className={commonStyles.btnPremiumPrimary}
          onClick={() => navigate('/contracts/new')}
        >
          <Plus size={20} /> Tạo hợp đồng mới
        </Button>
      </div>

      <div className={commonStyles.premiumCard}>
        <Row className="g-3 align-items-center mb-3">
          <Col md={6}>
            <Form.Control
              id="contract-search-input"
              type="text"
              className={`${commonStyles.filterInput} w-100`}
              placeholder="Tìm theo số phòng, tên khách thuê, mã HĐ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </Col>
          <Col md={3}>
            <Form.Select
              id="contract-status-select"
              className={`${commonStyles.filterSelect} w-100`}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="EXPIRED">Hết hạn</option>
              <option value="TERMINATED">Đã thanh lý</option>
            </Form.Select>
          </Col>
          <Col md={3} className="text-md-end text-muted">
            Tổng cộng: <strong>{totalElements}</strong> hợp đồng
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" className="mb-2" />
            <div className="text-muted">Đang tải danh sách hợp đồng...</div>
          </div>
        ) : (
          <>
            <Table responsive hover className={commonStyles.premiumTable}>
              <thead>
                <tr>
                  <th>Mã HĐ</th>
                  <th>Tên căn hộ</th>
                  <th>Khách thuê chính</th>
                  <th>Số điện thoại</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Tiền thuê / tháng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      Không tìm thấy hợp đồng nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  contracts.map((contract) => (
                    <tr
                      key={contract.contractId}
                      className={commonStyles.clickableRow}
                      onClick={() => handleRowClick(contract.contractId)}
                      id={`contract-row-${contract.contractId}`}
                    >
                      <td>
                        <strong>#{contract.contractId}</strong>
                      </td>
                      <td>
                        {contract.roomName || `Phòng ${contract.roomCode}`} ({contract.buildingName})
                      </td>
                      <td>{contract.tenantName || 'Chưa xác định'}</td>
                      <td>{contract.tenantPhoneNumber || '-'}</td>
                      <td>{contract.startDate}</td>
                      <td>{contract.endDate}</td>
                      <td>{contract.rent?.toLocaleString()} đ</td>
                      <td>
                        <ContractStatusBadge status={contract.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination id="contract-pagination">
                  <Pagination.Prev
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  />
                  {[...Array(totalPages).keys()].map((p) => (
                    <Pagination.Item
                      key={p}
                      active={p === page}
                      onClick={() => setPage(p)}
                    >
                      {p + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={page === totalPages - 1}
                    onClick={() => setPage(page + 1)}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ContractListPage;
