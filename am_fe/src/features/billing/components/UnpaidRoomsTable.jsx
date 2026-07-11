import React from 'react';

function UnpaidRoomsTable({ unpaidRooms = [], onViewInvoice }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 border-0">
        <h5 className="mb-0 fw-bold text-danger d-flex align-items-center gap-2">
          <span>⚠️</span> Danh sách phòng đang nợ tiền (Thời gian thực)
        </h5>
      </div>
      <div className="card-body p-0">
        {unpaidRooms.length === 0 ? (
          <div className="p-4 text-center text-muted">
            Không có phòng nào nợ tiền hiện tại. Hệ thống hoạt động tốt!
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small uppercase">
                <tr>
                  <th className="px-4 py-3">Phòng</th>
                  <th className="py-3">Tòa nhà</th>
                  <th className="py-3">Khách thuê</th>
                  <th className="py-3">Số tiền nợ</th>
                  <th className="py-3">Kỳ hóa đơn</th>
                  <th className="py-3">Trạng thái</th>
                  <th className="text-end px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {unpaidRooms.map((room) => (
                  <tr key={room.invoiceId}>
                    <td className="px-4 fw-semibold text-dark">{room.roomCode}</td>
                    <td>{room.buildingName}</td>
                    <td>{room.tenantName}</td>
                    <td className="fw-semibold text-danger">{formatCurrency(room.unpaidAmount)}</td>
                    <td>Tháng {room.invoiceMonth}</td>
                    <td>
                      <span
                        className={`badge ${
                          room.status === 'OVERDUE' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'
                        }`}
                      >
                        {room.status === 'OVERDUE' ? 'Quá hạn' : 'Chờ thanh toán'}
                      </span>
                    </td>
                    <td className="text-end px-4">
                      <button
                        className="btn btn-sm btn-outline-primary fw-semibold"
                        onClick={() => onViewInvoice(room.invoiceId)}
                      >
                        Xem chi tiết
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

export default UnpaidRoomsTable;
