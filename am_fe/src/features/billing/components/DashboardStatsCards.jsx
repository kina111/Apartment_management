import React from 'react';
import { CurrencyDollar, House, GraphUp, ExclamationTriangle } from 'react-bootstrap-icons';

function DashboardStatsCards({ stats = {} }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const cards = [
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(stats.totalRevenue),
      subtitle: 'Tổng cộng hóa đơn phát hành',
      icon: CurrencyDollar,
      bgColor: 'bg-primary-subtle',
      textColor: 'text-primary',
    },
    {
      title: 'Dòng tiền thực tế',
      value: formatCurrency(stats.actualCashFlow),
      subtitle: 'Tổng cộng hóa đơn đã trả',
      icon: GraphUp,
      bgColor: 'bg-success-subtle',
      textColor: 'text-success',
    },
    {
      title: 'Tỷ lệ lấp đầy phòng',
      value: `${stats.occupancyRate || 0}%`,
      subtitle: `${stats.occupiedRooms || 0} / ${stats.totalRooms || 0} phòng đang thuê`,
      icon: House,
      bgColor: 'bg-info-subtle',
      textColor: 'text-info',
    },
    {
      title: 'Số hóa đơn chưa đóng',
      value: stats.unpaidInvoiceCount || 0,
      subtitle: 'Đang chờ xử lý thanh toán',
      icon: ExclamationTriangle,
      bgColor: 'bg-warning-subtle',
      textColor: 'text-warning',
    },
  ];

  return (
    <div className="row g-3 mb-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="col-12 col-md-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body d-flex align-items-center justify-content-between p-3">
                <div>
                  <h6 className="card-subtitle mb-1 text-muted fw-semibold small text-uppercase">
                    {c.title}
                  </h6>
                  <h3 className="card-title mb-1 fw-bold text-dark">{c.value}</h3>
                  <span className="text-secondary small">{c.subtitle}</span>
                </div>
                <div className={`p-3 rounded-3 ${c.bgColor} ${c.textColor}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DashboardStatsCards;
