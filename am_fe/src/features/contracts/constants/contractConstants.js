export const CONTRACT_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  TERMINATED: 'TERMINATED',
};

export const CONTRACT_STATUS_LABELS = {
  [CONTRACT_STATUS.ACTIVE]: 'Đang hoạt động',
  [CONTRACT_STATUS.EXPIRED]: 'Hết hạn',
  [CONTRACT_STATUS.TERMINATED]: 'Đã thanh lý',
};

export const CONTRACT_STATUS_DISPLAY = {
  [CONTRACT_STATUS.ACTIVE]: 'Đang chạy',
  [CONTRACT_STATUS.EXPIRED]: 'Hết hạn',
  [CONTRACT_STATUS.TERMINATED]: 'Thanh lý',
};

export const CHARGE_TYPES = {
  PER_ROOM: 'PER_ROOM',
  PER_INDEX: 'PER_INDEX',
};

export const CHARGE_TYPE_LABELS = {
  [CHARGE_TYPES.PER_ROOM]: 'Cố định / căn hộ',
  [CHARGE_TYPES.PER_INDEX]: 'Theo chỉ số sử dụng',
};
