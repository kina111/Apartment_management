import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCalculatePreview, issueInvoices, getInvoices } from '../services/billingApi';
import BulkCalculateTable from '../components/BulkCalculateTable';
import { ArrowLeft, CheckCircle } from 'react-bootstrap-icons';

function BulkCalculatePage({ buildings = [] }) {
  const navigate = useNavigate();
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [invoiceMonth, setInvoiceMonth] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isFutureMonth, setIsFutureMonth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const currentMonthStr = (() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  })();

  // Default dates on mount
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setInvoiceMonth(`${year}-${month}`);

    const future = new Date();
    future.setDate(future.getDate() + 7);
    setDueDate(formatDate(future));
  }, []);

  const handleMonthChange = (val) => {
    setInvoiceMonth(val);
    setPreviewData([]);
    setSelectedRooms([]);
    setIsLocked(false);
    
    if (val && val > currentMonthStr) {
      setIsFutureMonth(true);
      setError('Kỳ chọn là tháng tương lai. Giao diện bị khóa hoàn toàn, không thể thao tác.');
    } else {
      setIsFutureMonth(false);
      setError('');
    }
  };

  const handleFetchPreview = async () => {
    if (!selectedBuilding) {
      alert('Vui lòng chọn tòa nhà.');
      return;
    }
    if (!invoiceMonth) {
      alert('Vui lòng chọn tháng chốt phí.');
      return;
    }
    if (isFutureMonth) {
      alert('Tháng tương lai đã bị khóa hoàn toàn. Không thể chốt phí.');
      return;
    }

    setLoading(true);
    setError('');
    setIsLocked(false);
    try {
      // 1. Check if invoices already exist for this building and month
      const response = await getInvoices({ buildingId: selectedBuilding, month: invoiceMonth });
      const invoicesList = response.content || response;
      if (invoicesList && invoicesList.length > 0) {
        // Map existing invoices to preview structure
        const mapped = invoicesList.map((inv) => {
          const rentDetail = inv.details?.find(d => d.itemName === "Tiền phòng") || {};
          const elecDetail = inv.details?.find(d => d.itemName.includes("Tiền điện") || d.itemName.includes("Điện")) || {};
          const waterDetail = inv.details?.find(d => d.itemName.includes("Tiền nước") || d.itemName.includes("Nước")) || {};
          const otherServiceFees = inv.details?.filter(d => 
            d.itemName !== "Tiền phòng" && 
            !d.itemName.includes("Tiền điện") && 
            !d.itemName.includes("Điện") && 
            !d.itemName.includes("Tiền nước") && 
            !d.itemName.includes("Nước") && 
            !d.itemName.includes("Phát sinh") && 
            !d.itemName.includes("Phụ phí")
          ) || [];
          const additionalDetail = inv.details?.find(d => 
            d.itemName.includes("Phát sinh") || d.itemName.includes("Phụ phí")
          );

          return {
            roomCode: inv.roomCode,
            contractId: inv.contractId,
            tenantName: inv.tenantName,
            roomRent: rentDetail.unitPrice || 0,
            oldElectricityIndex: elecDetail.oldIndex || 0,
            newElectricityIndex: elecDetail.newIndex || 0,
            electricityPrice: elecDetail.unitPrice || 0,
            oldWaterIndex: waterDetail.oldIndex || 0,
            newWaterIndex: waterDetail.newIndex || 0,
            waterPrice: waterDetail.unitPrice || 0,
            additionalFee: additionalDetail ? additionalDetail.unitPrice : 0,
            additionalFeeNote: additionalDetail ? additionalDetail.itemName : '',
            otherServiceFees: otherServiceFees.map(f => ({ name: f.itemName, fee: f.unitPrice, chargeType: f.chargeType })),
            isExisting: true
          };
        });
        setPreviewData(mapped);
        setSelectedRooms(mapped.map(r => r.roomCode)); // Select all for view
        setIsLocked(true);
        setError('Kỳ hóa đơn này đã được xuất hóa đơn (Chỉ cho phép xem lại lịch sử). Muốn chỉnh sửa phải thông qua tính năng Hủy hóa đơn (UC-14.2).');
      } else {
        // 2. Load fresh calculation preview
        const data = await getCalculatePreview(selectedBuilding, invoiceMonth);
        const mapped = data.map((item) => ({
          ...item,
          newElectricityIndex: item.oldElectricityIndex,
          newWaterIndex: item.oldWaterIndex,
          additionalFee: item.additionalFee || 0,
          additionalFeeNote: item.additionalFeeNote || '',
          isExisting: false
        }));
        setPreviewData(mapped);
        setSelectedRooms(mapped.map(r => r.roomCode)); // Auto-select all by default
        setIsLocked(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu.');
      setPreviewData([]);
      setSelectedRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRowChange = (index, updatedRow) => {
    const copy = [...previewData];
    copy[index] = updatedRow;
    setPreviewData(copy);
  };

  const handleIssue = async () => {
    if (isLocked || isFutureMonth) {
      alert('Không thể phát hành hóa đơn ở kỳ đã chốt hoặc kỳ tương lai.');
      return;
    }

    const checkedRoomsData = previewData.filter(r => selectedRooms.includes(r.roomCode));
    if (checkedRoomsData.length === 0) {
      alert('Vui lòng tích chọn ít nhất một phòng để chốt và xuất hóa đơn.');
      return;
    }

    // Validation
    for (const r of checkedRoomsData) {
      if (r.newElectricityIndex < r.oldElectricityIndex) {
        alert(`Chỉ số điện mới của phòng ${r.roomCode} không được nhỏ hơn chỉ số cũ.`);
        return;
      }
      if (r.newWaterIndex < r.oldWaterIndex) {
        alert(`Chỉ số nước mới của phòng ${r.roomCode} không được nhỏ hơn chỉ số cũ.`);
        return;
      }
    }

    if (!window.confirm(`Bạn có chắc chắn muốn chốt phí và phát hành hóa đơn cho ${checkedRoomsData.length} phòng đã chọn trong tháng ${invoiceMonth}?`)) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        buildingId: Number(selectedBuilding),
        invoiceMonth,
        dueDate,
        rooms: checkedRoomsData.map((r) => ({
          roomCode: r.roomCode,
          contractId: r.contractId,
          newElectricityIndex: Number(r.newElectricityIndex),
          newWaterIndex: Number(r.newWaterIndex),
          additionalFee: Number(r.additionalFee || 0),
          additionalFeeNote: r.additionalFeeNote || '',
          roomRent: Number(r.roomRent || 0),
        })),
      };

      await issueInvoices(payload);
      alert('Phát hành hóa đơn hàng loạt thành công!');
      navigate('/billing/invoices');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi phát hành hóa đơn.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <button className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-1 text-secondary" onClick={() => navigate('/billing/invoices')}>
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>
        <h1 className="h3 mt-2 mb-1 fw-bold text-dark">Tính & Chốt phí tháng hàng loạt</h1>
        <p className="text-secondary">Nhập chỉ số điện, nước, phụ phí để phát hành hóa đơn đồng loạt cho cả tòa nhà</p>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-semibold text-secondary small">Chọn tòa nhà</label>
              <select className="form-select border-2" value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)}>
                <option value="">-- Chọn tòa nhà --</option>
                {buildings.map((b) => (
                  <option key={b.buildingId} value={b.buildingId}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold text-secondary small">Tháng hóa đơn</label>
              <input type="month" className="form-control border-2" value={invoiceMonth} onChange={(e) => handleMonthChange(e.target.value)} />
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-primary w-100 fw-semibold" onClick={handleFetchPreview} disabled={loading || isFutureMonth}>
                {loading ? 'Đang tải...' : 'Xem trước hóa đơn'}
              </button>
            </div>
          </div>

          {!isFutureMonth && (
            <div className="row g-3 align-items-end mt-2 pt-2 border-top">
              <div className="col-md-3">
                <label className="form-label fw-semibold text-secondary small">Hạn chót thanh toán</label>
                <input 
                  type="date" 
                  className="form-control border-2" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isLocked}
                  min={formatDate(new Date())}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <div className={`alert ${isFutureMonth ? 'alert-warning' : 'alert-info'}`}>{error}</div>}

      {previewData.length > 0 && (
        <>
          <BulkCalculateTable 
            previewData={previewData} 
            onRowChange={handleRowChange} 
            selectedRooms={selectedRooms}
            onSelectedRoomsChange={setSelectedRooms}
            readOnly={isLocked || isFutureMonth}
          />
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-light fw-semibold" onClick={() => navigate('/billing/invoices')}>Hủy bỏ</button>
            <button 
              className="btn btn-success d-flex align-items-center gap-2 fw-semibold" 
              onClick={handleIssue} 
              disabled={submitting || isLocked || isFutureMonth}
            >
              <CheckCircle size={18} />
              <span>{submitting ? 'Đang phát hành...' : 'Xác nhận & Phát hành'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default BulkCalculatePage;
