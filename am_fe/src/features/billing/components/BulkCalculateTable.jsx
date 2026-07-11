import React from 'react';

function BulkCalculateTable({ previewData = [], onRowChange, selectedRooms = [], onSelectedRoomsChange, readOnly = false }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const handleIndexChange = (index, field, value) => {
    const updated = { ...previewData[index] };
    if (field === 'additionalFeeNote') {
      updated[field] = value;
    } else {
      updated[field] = value !== '' ? Number(value) : '';
    }
    onRowChange(index, updated);
  };

  const calculateRowTotal = (row) => {
    const roomRent = row.roomRent || 0;
    const elecQty = Math.max(0, (row.newElectricityIndex || row.oldElectricityIndex) - row.oldElectricityIndex);
    const elecTotal = elecQty * (row.electricityPrice || 0);

    const waterQty = Math.max(0, (row.newWaterIndex || row.oldWaterIndex) - row.oldWaterIndex);
    const waterTotal = waterQty * (row.waterPrice || 0);

    const otherFixedTotal = (row.otherServiceFees || []).reduce((acc, f) => acc + (f.fee || 0), 0);
    const addFee = row.additionalFee || 0;

    return roomRent + elecTotal + waterTotal + otherFixedTotal + addFee;
  };

  const allChecked = previewData.length > 0 && selectedRooms.length === previewData.length;

  const handleSelectAll = (e) => {
    if (readOnly) return;
    if (e.target.checked) {
      onSelectedRoomsChange(previewData.map(r => r.roomCode));
    } else {
      onSelectedRoomsChange([]);
    }
  };

  const handleSelectRow = (roomCode, checked) => {
    if (readOnly) return;
    if (checked) {
      onSelectedRoomsChange([...selectedRooms, roomCode]);
    } else {
      onSelectedRoomsChange(selectedRooms.filter(code => code !== roomCode));
    }
  };

  return (
    <div className="table-responsive border rounded bg-white shadow-sm mb-4">
      <table className="table table-hover align-middle mb-0 small">
        <thead className="table-light text-secondary">
          <tr>
            <th style={{ width: '40px' }} className="ps-3">
              <input
                type="checkbox"
                className="form-check-input"
                checked={allChecked}
                onChange={handleSelectAll}
                disabled={readOnly}
              />
            </th>
            <th>Số Phòng</th>
            <th style={{ width: '150px' }}>Tiền phòng (Sửa đè tháng này)</th>
            <th>Điện cũ</th>
            <th style={{ width: '130px' }}>Điện mới (Nhập)</th>
            <th>Nước cũ</th>
            <th style={{ width: '130px' }}>Nước mới (Nhập)</th>
            <th className="text-end">Tiền sửa đồ (Phí cố định)</th>
            <th style={{ width: '120px' }}>Phí phát sinh khác (Nhập)</th>
            <th>Ghi chú phát sinh (Nhập)</th>
            <th className="text-end px-3">Tổng tiền dự kiến (Real-time)</th>
          </tr>
        </thead>
        <tbody>
          {previewData.length === 0 ? (
            <tr>
              <td colSpan="11" className="text-center py-4 text-muted">
                Không tìm thấy phòng nào có hợp đồng hoạt động cần lập hóa đơn.
              </td>
            </tr>
          ) : (
            previewData.map((row, index) => {
              const otherFixedTotal = (row.otherServiceFees || []).reduce((acc, f) => acc + (f.fee || 0), 0);
              const rowTotal = calculateRowTotal(row);
              const isChecked = selectedRooms.includes(row.roomCode);

              return (
                <tr key={row.roomCode} className={isChecked ? "table-active-row" : ""}>
                  <td className="ps-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isChecked}
                      onChange={(e) => handleSelectRow(row.roomCode, e.target.checked)}
                      disabled={readOnly}
                    />
                  </td>
                  <td className="fw-bold text-dark">{row.roomCode}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm border-2 text-end fw-semibold"
                      value={row.roomRent !== undefined ? row.roomRent : ''}
                      onChange={(e) => handleIndexChange(index, 'roomRent', e.target.value)}
                      placeholder="Tiền phòng"
                      disabled={readOnly}
                      min="0"
                    />
                  </td>
                  <td>
                    <span className="badge bg-secondary-subtle text-secondary">{row.oldElectricityIndex}</span>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm border-2"
                      value={row.newElectricityIndex !== undefined ? row.newElectricityIndex : ''}
                      onChange={(e) => handleIndexChange(index, 'newElectricityIndex', e.target.value)}
                      placeholder="Số mới"
                      min={row.oldElectricityIndex}
                      disabled={readOnly}
                    />
                  </td>
                  <td>
                    <span className="badge bg-secondary-subtle text-secondary">{row.oldWaterIndex}</span>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm border-2"
                      value={row.newWaterIndex !== undefined ? row.newWaterIndex : ''}
                      onChange={(e) => handleIndexChange(index, 'newWaterIndex', e.target.value)}
                      placeholder="Số mới"
                      min={row.oldWaterIndex}
                      disabled={readOnly}
                    />
                  </td>
                  <td className="text-end text-muted" title={(row.otherServiceFees || []).map(f => `${f.name}: ${f.fee}`).join(', ')}>
                    {formatCurrency(otherFixedTotal)}
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm border-2"
                      value={row.additionalFee !== undefined ? row.additionalFee : ''}
                      onChange={(e) => handleIndexChange(index, 'additionalFee', e.target.value)}
                      placeholder="Số tiền"
                      min="0"
                      disabled={readOnly}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm border-2"
                      value={row.additionalFeeNote || ''}
                      onChange={(e) => handleIndexChange(index, 'additionalFeeNote', e.target.value)}
                      placeholder="Lý do..."
                      disabled={readOnly}
                    />
                  </td>
                  <td className="text-end px-3 fw-bold text-primary fs-6">{formatCurrency(rowTotal)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default BulkCalculateTable;
