import { Table, Form, Button } from 'react-bootstrap';
import { Plus, Trash } from 'react-bootstrap-icons';
import styles from './ServiceFeeConfigurator.module.css';
import { CHARGE_TYPES } from '../constants/contractConstants';

export default function ServiceFeeConfigurator({
  serviceFees,
  onAddFee,
  onRemoveFee,
  onFeeChange,
}) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="form-section-title mb-0">2. Cài đặt Phí Dịch vụ</h3>
        <Button variant="outline-primary" size="sm" onClick={onAddFee}>
          <Plus size={16} /> Thêm loại phí
        </Button>
      </div>

      <Table responsive className={styles.premiumTable}>
        <thead>
          <tr>
            <th>Tên dịch vụ</th>
            <th>Đơn giá (đ)</th>
            <th>Cách tính</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {serviceFees.map((fee, idx) => (
            <tr key={idx}>
              <td>
                <Form.Control
                  type="text"
                  className={`${styles.filterInput} w-100`}
                  placeholder="Ví dụ: Internet, Dọn dẹp..."
                  value={fee.name}
                  onChange={(e) => onFeeChange(idx, 'name', e.target.value)}
                  required
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  className={`${styles.filterInput} w-100`}
                  placeholder="Số tiền"
                  value={fee.fee}
                  onChange={(e) => onFeeChange(idx, 'fee', e.target.value)}
                  required
                />
              </td>
              <td>
                <Form.Select
                  className={`${styles.filterSelect} w-100`}
                  value={fee.chargeType}
                  onChange={(e) => onFeeChange(idx, 'chargeType', e.target.value)}
                >
                  <option value={CHARGE_TYPES.PER_ROOM}>Cố định / căn hộ</option>
                  <option value={CHARGE_TYPES.PER_INDEX}>Theo chỉ số sử dụng</option>
                </Form.Select>
              </td>
              <td>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onRemoveFee(idx)}
                >
                  <Trash size={16} />
                </Button>
              </td>
            </tr>
          ))}
          {serviceFees.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center text-muted py-3">
                Chưa thiết lập phí dịch vụ nào. Hóa đơn sẽ chỉ tính tiền phòng.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
