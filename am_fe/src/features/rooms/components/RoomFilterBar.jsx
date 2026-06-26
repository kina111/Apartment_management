function RoomFilterBar({ activeFilter, onFilterChange, searchValue, onSearchChange }) {
  const filters = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'AVAILABLE', label: 'Trống' },
    { key: 'RENTED', label: 'Đang thuê' },
    { key: 'MAINTENANCE', label: 'Đang sửa' },
  ];

  return (
    <div className="rooms-filter-bar">
      <div className="rooms-filter-group">
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={`rooms-filter-btn${activeFilter === filter.key ? ' active' : ''}`}
            onClick={() => onFilterChange(filter.key)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="rooms-search">
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-white border-end-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Tìm số phòng..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default RoomFilterBar;
