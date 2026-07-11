import React from 'react';

function InvoicesTable({ invoices = [], onViewInvoice }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="badge bg-success-subtle text-success">Đã thanh toán</span>;
      case 'OVERDUE':
        return <span className="badge bg-danger-subtle text-danger">Quá hạn</span>;
      case 'VOID':
        return <span className="badge bg-secondary-subtle text-secondary">Đã hủy</span>;
      case 'PENDING':
      default:
        return <span className="badge bg-warning-subtle text-warning">Chờ thanh toán</span>;
    }
  };

  const getMailStatusBadge = (status) => {
    switch (status) {
      case 'SENT':
        return <span className="badge bg-success-subtle text-success">Đã gửi</span>;
      case 'FAILED':
        return <span className="badge bg-danger-subtle text-danger">Gửi lỗi</span>;
      case 'UNSENT':
      default:
        return <span className="badge bg-secondary-subtle text-secondary">Chưa gửi</span>;
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-0">
        {invoices.length === 0 ? (
          <div className="p-5 text-center text-muted">
            Không tìm thấy hóa đơn nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small uppercase">
                <tr>
                  <th className="px-4 py-3">Mã hóa đơn</th>
                  <th className="py-3">Phòng</th>
                  <th className="py-3">Tòa nhà</th>
                  <th className="py-3">Khách thuê</th>
                  <th className="py-3">Kỳ hóa đơn</th>
                  <th className="py-3">Tổng số tiền</th>
                  <th className="py-3">Trạng thái</th>
                  <th className="py-3">HĐ thanh toán</th>
                  <th className="py-3">Gửi Mail</th>
                  <th className="text-end px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.invoiceId} style={{ cursor: 'pointer' }} onClick={() => onViewInvoice(invoice.invoiceId)}>
                    <td className="px-4 text-muted">#{invoice.invoiceId}</td>
                    <td className="fw-semibold text-dark">{invoice.roomCode}</td>
                    <td>{invoice.buildingName}</td>
                    <td>{invoice.tenantName}</td>
                    <td>Tháng {invoice.invoiceMonth}</td>
                    <td className="fw-bold text-dark">{formatCurrency(invoice.totalAmount)}</td>
                    <td>{getStatusBadge(invoice.paymentStatus)}</td>
                    <td>
                      {invoice.paymentMethod === 'CASH' ? 'Tiền mặt' : 
                       invoice.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : '—'}
                    </td>
                    <td>{getMailStatusBadge(invoice.mailStatus)}</td>
                    <td className="text-end px-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onViewInvoice(invoice.invoiceId)}
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoicesTable;
