import React from 'react';

function BillingFilters({
  buildings = [],
  selectedBuilding,
  onBuildingChange,
  selectedStatus,
  onStatusChange,
  selectedMonth,
  onMonthChange,
  showStatusFilter = true,
  showMonthFilter = true,
}) {
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label htmlFor="building-filter" className="form-label fw-semibold text-secondary small">
              Tòa nhà
            </label>
            <select
              id="building-filter"
              className="form-select border-2"
              value={selectedBuilding || ''}
              onChange={(e) => onBuildingChange(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Tất cả tòa nhà</option>
              {buildings.map((b) => (
                <option key={b.buildingId} value={b.buildingId}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {showStatusFilter && (
            <div className="col-md-4">
              <label htmlFor="status-filter" className="form-label fw-semibold text-secondary small">
                Trạng thái thanh toán
              </label>
              <select
                id="status-filter"
                className="form-select border-2"
                value={selectedStatus || ''}
                onChange={(e) => onStatusChange(e.target.value || null)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ thanh toán (PENDING)</option>
                <option value="PAID">Đã thanh toán (PAID)</option>
                <option value="OVERDUE">Quá hạn (OVERDUE)</option>
                <option value="VOID">Đã hủy (VOID)</option>
              </select>
            </div>
          )}

          {showMonthFilter && (
            <div className="col-md-4">
              <label htmlFor="month-filter" className="form-label fw-semibold text-secondary small">
                Tháng hóa đơn
              </label>
              <input
                id="month-filter"
                type="month"
                className="form-select border-2"
                value={selectedMonth || ''}
                onChange={(e) => onMonthChange(e.target.value || '')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BillingFilters;
