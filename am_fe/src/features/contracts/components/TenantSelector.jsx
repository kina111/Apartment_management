import { Form } from 'react-bootstrap';
import styles from './TenantSelector.module.css';

export default function TenantSelector({
  tenantMode,
  tenantId,
  availableTenants,
  newTenantDetails,
  onChange,
  onModeChange,
}) {
  const handleFieldChange = (field, val) => {
    onChange(field, val);
  };

  return (
    <div>
      <h3 className="form-section-title">3. Khách thuê đại diện</h3>
      <div className="d-flex gap-3 mb-3">
        <Form.Check
          id="tenant-existing-check"
          type="radio"
          label="Chọn khách thuê sẵn có"
          name="tenantMode"
          checked={tenantMode === 'existing'}
          onChange={() => onModeChange('existing')}
        />
        <Form.Check
          id="tenant-new-check"
          type="radio"
          label="Tạo cư dân mới"
          name="tenantMode"
          checked={tenantMode === 'new'}
          onChange={() => onModeChange('new')}
        />
      </div>

      {tenantMode === 'existing' ? (
        <Form.Group className="mb-3">
          <Form.Label>Khách thuê</Form.Label>
          <Form.Select
            id="tenant-select"
            className={`${styles.filterSelect} w-100`}
            value={tenantId}
            onChange={(e) => handleFieldChange('tenantId', e.target.value)}
            required
          >
            <option value="">-- Chọn khách thuê trống hợp đồng --</option>
            {availableTenants.map((t) => (
              <option key={t.tenantId} value={t.tenantId}>
                {t.name} ({t.phoneNumber})
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      ) : (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Họ tên</Form.Label>
            <Form.Control
              id="tenant-name-input"
              type="text"
              className={`${styles.filterInput} w-100`}
              value={newTenantDetails.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Ngày sinh</Form.Label>
            <Form.Control
              id="tenant-dob-input"
              type="date"
              className={`${styles.filterInput} w-100`}
              value={newTenantDetails.dateOfBirth || ''}
              onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control
              id="tenant-phone-input"
              type="text"
              className={`${styles.filterInput} w-100`}
              value={newTenantDetails.phoneNumber || ''}
              onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Địa chỉ thường trú</Form.Label>
            <Form.Control
              id="tenant-address-input"
              type="text"
              className={`${styles.filterInput} w-100`}
              value={newTenantDetails.permanentAddress || ''}
              onChange={(e) => handleFieldChange('permanentAddress', e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Số CMND / CCCD</Form.Label>
            <Form.Control
              id="tenant-citizenid-input"
              type="text"
              className={`${styles.filterInput} w-100`}
              value={newTenantDetails.citizenId || ''}
              onChange={(e) => handleFieldChange('citizenId', e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              id="tenant-email-input"
              type="email"
              className={`${styles.filterInput} w-100`}
              value={newTenantDetails.email || ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
            />
          </Form.Group>
        </>
      )}
    </div>
  );
}
