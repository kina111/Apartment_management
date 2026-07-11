import React, { useState, useEffect } from 'react';
import { getDashboardStats, getInvoiceDetails, updateInvoiceStatus, voidInvoice } from '../services/billingApi';
import DashboardStatsCards from '../components/DashboardStatsCards';
import UnpaidRoomsTable from '../components/UnpaidRoomsTable';
import BillingFilters from '../components/BillingFilters';
import InvoiceDetailModal from '../components/InvoiceDetailModal';

function DashboardPage({ buildings = [] }) {
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats(selectedBuilding);
      setStats(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải dữ liệu thống kê tài chính.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedBuilding]);

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
    setSelectedInvoice(null);
    fetchStats();
  };

  const handleVoidInvoice = async (invoiceId) => {
    await voidInvoice(invoiceId);
    setSelectedInvoice(null);
    fetchStats();
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1 fw-bold text-dark">Tổng quan tài chính</h1>
          <p className="text-secondary mb-0">Theo dõi doanh thu, dòng tiền thực tế và tỷ lệ lấp đầy phòng trọ</p>
        </div>
      </div>

      <BillingFilters
        buildings={buildings}
        selectedBuilding={selectedBuilding}
        onBuildingChange={setSelectedBuilding}
        showStatusFilter={false}
        showMonthFilter={false}
      />

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <DashboardStatsCards stats={stats} />
          <UnpaidRoomsTable
            unpaidRooms={stats?.unpaidRooms}
            onViewInvoice={handleViewInvoice}
          />
        </>
      )}

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onManualPay={handleManualPay}
          onVoid={handleVoidInvoice}
        />
      )}
    </div>
  );
}

export default DashboardPage;
