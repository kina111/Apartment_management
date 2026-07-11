import React, { useState } from 'react';

function InvoiceDetailModal({ invoice, onClose, onManualPay, onVoid, onResendEmail }) {
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER');
  const [submitting, setSubmitting] = useState(false);
  const [resendingMail, setResendingMail] = useState(false);

  if (!invoice) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onManualPay(invoice.invoiceId, payMethod);
    } catch (err) {
      alert('Không thể cập nhật thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoidSubmit = async () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy hóa đơn này không? Trạng thái sẽ chuyển thành VOID.')) {
      setSubmitting(true);
      try {
        await onVoid(invoice.invoiceId);
      } catch (err) {
        alert('Không thể hủy hóa đơn');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleResendMail = async () => {
    setResendingMail(true);
    try {
      await onResendEmail(invoice.invoiceId);
      alert('Đã gửi lại email hóa đơn thành công!');
    } catch (err) {
      alert('Không thể gửi lại email: ' + (err.response?.data?.message || err.message));
    } finally {
      setResendingMail(false);
    }
  };

  const isUnpaid = invoice.paymentStatus === 'PENDING' || invoice.paymentStatus === 'OVERDUE';

  const getMailBadgeColor = (status) => {
    switch (status) {
      case 'SENT': return 'bg-success';
      case 'FAILED': return 'bg-danger';
      case 'UNSENT':
      default: return 'bg-secondary';
    }
  };

  const getMailBadgeText = (status) => {
    switch (status) {
      case 'SENT': return 'ĐÃ GỬI MAIL';
      case 'FAILED': return 'GỬI MAIL LỖI';
      case 'UNSENT':
      default: return 'CHƯA GỬI MAIL';
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">Chi tiết hóa đơn phòng {invoice.roomCode}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body py-4">
            <div className="row g-4">
              <div className="col-md-7">
                <div className="mb-3 text-secondary small">
                  <div><strong>Tòa nhà:</strong> {invoice.buildingName} | <strong>Kỳ thanh toán:</strong> Tháng {invoice.invoiceMonth}</div>
                  <div className="mt-1">
                    <strong>Ngày phát hành:</strong> {invoice.issueDate || '---'} | <strong>Hạn thanh toán:</strong> {invoice.dueDate || '---'}
                  </div>
                </div>
                <table className="table table-sm align-middle small">
                  <thead className="table-light">
                    <tr>
                      <th>Khoản chi phí</th>
                      <th className="text-center">Số lượng</th>
                      <th className="text-end">Đơn giá</th>
                      <th className="text-end">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.details?.map((d, index) => (
                      <tr key={d.invoiceDetailId || index}>
                        <td>
                          <div><strong>{d.itemName}</strong></div>
                          {d.oldIndex !== null && (
                            <span className="text-muted small">Chỉ số: {d.oldIndex} → {d.newIndex}</span>
                          )}
                        </td>
                        <td className="text-center">{d.quantity}</td>
                        <td className="text-end">{formatCurrency(d.unitPrice)}</td>
                        <td className="text-end fw-semibold">{formatCurrency(d.subTotal)}</td>
                      </tr>
                    ))}
                    <tr className="table-light fw-bold">
                      <td colSpan="3">Tổng cộng thanh toán</td>
                      <td className="text-end text-primary fs-5">{formatCurrency(invoice.totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="col-md-5 text-center border-start">
                <div className="d-flex flex-column align-items-center gap-2 mb-3">
                  <span className={`badge py-2 px-3 fs-6 rounded-pill ${
                    invoice.paymentStatus === 'PAID' ? 'bg-success' :
                    invoice.paymentStatus === 'VOID' ? 'bg-secondary' :
                    invoice.paymentStatus === 'OVERDUE' ? 'bg-danger' : 'bg-warning text-dark'
                  }`}>
                    {invoice.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' :
                     invoice.paymentStatus === 'VOID' ? 'ĐÃ HỦY' :
                     invoice.paymentStatus === 'OVERDUE' ? 'QUÁ HẠN' : 'CHỜ THANH TOÁN'}
                  </span>
                  
                  <span className={`badge py-1.5 px-3 fs-7 rounded-pill text-white ${getMailBadgeColor(invoice.mailStatus)}`}>
                    {getMailBadgeText(invoice.mailStatus)}
                  </span>
                </div>

                {isUnpaid && invoice.paymentUrlQrCode ? (
                  <div className="my-3">
                    <div className="fw-semibold small text-secondary mb-2">Quét mã QR để chuyển khoản</div>
                    <img src={invoice.paymentUrlQrCode} alt="VietQR Payment" className="img-fluid border rounded p-2" style={{ maxHeight: '180px' }} />
                  </div>
                ) : invoice.paymentStatus === 'PAID' ? (
                  <div className="my-4 text-success">
                    <i className="bi bi-check-circle-fill fs-1"></i>
                    <div className="fw-semibold mt-2">Hóa đơn này đã được thanh toán bằng {invoice.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}.</div>
                  </div>
                ) : invoice.paymentStatus === 'VOID' ? (
                  <div className="my-4 text-secondary">
                    <div className="fw-semibold">Hóa đơn đã bị hủy.</div>
                  </div>
                ) : null}

                <div className="mt-3 text-start bg-light p-3 rounded">
                  {invoice.paymentStatus !== 'VOID' && (
                    <button 
                      type="button" 
                      disabled={resendingMail || submitting} 
                      onClick={handleResendMail} 
                      className="btn btn-sm btn-primary w-100 mb-3 fw-semibold d-flex align-items-center justify-content-center gap-1"
                    >
                      {resendingMail ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          <span>Đang gửi...</span>
                        </>
                      ) : (
                        <span>Gửi lại Mail hóa đơn</span>
                      )}
                    </button>
                  )}

                  {isUnpaid && (
                    <>
                      <form onSubmit={handlePaySubmit}>
                        <label className="form-label fw-bold small">Gạch nợ thủ công (Nhận tiền mặt/chuyển khoản)</label>
                        <div className="d-flex gap-2">
                          <select className="form-select form-select-sm" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                            <option value="BANK_TRANSFER">Chuyển khoản</option>
                            <option value="CASH">Tiền mặt</option>
                          </select>
                          <button type="submit" disabled={submitting || resendingMail} className="btn btn-sm btn-success fw-semibold text-nowrap">
                            {submitting ? '...' : 'Xác nhận'}
                          </button>
                        </div>
                      </form>
                      {invoice.paymentStatus === 'PENDING' && (
                        <button type="button" disabled={submitting || resendingMail} onClick={handleVoidSubmit} className="btn btn-sm btn-outline-danger w-100 mt-2 fw-semibold">
                          Hủy hóa đơn
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetailModal;
