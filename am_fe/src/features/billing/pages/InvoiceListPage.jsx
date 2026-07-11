import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices, getInvoiceDetails, updateInvoiceStatus, voidInvoice, resendInvoiceEmail } from '../services/billingApi';
import BillingFilters from '../components/BillingFilters';
import InvoicesTable from '../components/InvoicesTable';
import InvoiceDetailModal from '../components/InvoiceDetailModal';
import { Calculator } from 'react-bootstrap-icons';

function InvoiceListPage({ buildings = [] }) {
  const navigate = useNavigate();
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [searchVal, setSearchVal] = useState('');
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const filters = {
        page: currentPage,
        size: pageSize
      };
      if (selectedBuilding) filters.buildingId = selectedBuilding;
      if (selectedStatus) filters.status = selectedStatus;
      if (selectedMonth) filters.month = selectedMonth;
      if (searchVal) filters.search = searchVal;

      const data = await getInvoices(filters);
      setInvoices(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset page to 0 when filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedBuilding, selectedStatus, selectedMonth, searchVal]);

  // Fetch invoices with debounce on searchVal
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedBuilding, selectedStatus, selectedMonth, searchVal, currentPage]);

  const handleViewInvoice = async (invoiceId) => {
    try {
      const details = await getInvoiceDetails(invoiceId);
      setSelectedInvoice(details);
    } catch (err) {
      alert('Không thể tải chi tiết hóa đơn.');
    }
  };

  const handleManualPay = async (invoiceId, paymentMethod) => {
    await updateInvoiceStatus(invoiceId, { paymentStatus: 'PAID', paymentMethod });
    // Reload full details to reflect paid status in modal
    const updatedDetails = await getInvoiceDetails(invoiceId);
    setSelectedInvoice(updatedDetails);
    fetchInvoices();
  };

  const handleVoidInvoice = async (invoiceId) => {
    await voidInvoice(invoiceId);
    setSelectedInvoice(null);
    fetchInvoices();
  };

  const handleResendEmail = async (invoiceId) => {
    await resendInvoiceEmail(invoiceId);
    // Reload full details to reflect SENT status in modal
    const updatedDetails = await getInvoiceDetails(invoiceId);
    setSelectedInvoice(updatedDetails);
    fetchInvoices();
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1 fw-bold text-dark">Danh sách Hóa đơn</h1>
          <p className="text-secondary mb-0">Quản lý, tra cứu, gạch nợ hóa đơn dịch vụ hàng tháng</p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2 fw-semibold"
          onClick={() => navigate('/billing/calculate')}
        >
          <Calculator size={18} />
          <span>Tính & Chốt phí tháng</span>
        </button>
      </div>

      {/* Premium Search Bar */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body p-2">
          <input
            type="text"
            className="form-control border-0 bg-light py-2"
            placeholder="🔍 Tìm kiếm theo phòng (Ví dụ: B101) hoặc tên khách thuê..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>
      </div>

      <BillingFilters
        buildings={buildings}
        selectedBuilding={selectedBuilding}
        onBuildingChange={setSelectedBuilding}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : (
        <>
          <InvoicesTable invoices={invoices} onViewInvoice={handleViewInvoice} />

          {/* Premium Pagination Component */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted small">
                Hiển thị trang {currentPage + 1} / {totalPages} (Tổng số {totalElements} hóa đơn)
              </div>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}>
                      Trước
                    </button>
                  </li>
                  {[...Array(totalPages).keys()].map((pageNum) => (
                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(pageNum)}>
                        {pageNum + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}>
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onManualPay={handleManualPay}
          onVoid={handleVoidInvoice}
          onResendEmail={handleResendEmail}
        />
      )}
    </div>
  );
}

export default InvoiceListPage;
