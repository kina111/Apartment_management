import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import managerApi from "../services/managerApi";

export default function ManagerCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    accountName: "",
    email: "",
    password: "",
    buildingIds: []
  });
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await managerApi.getBuildings();
      // Assume building API returns array directly or {data: array}
      setBuildings(Array.isArray(response.data) ? response.data : response.data?.content || []);
    } catch (err) {
      console.error("Failed to fetch buildings", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuildingChange = (e, buildingId) => {
    const checked = e.target.checked;
    setFormData((prev) => {
      if (checked) {
        return { ...prev, buildingIds: [...prev.buildingIds, buildingId] };
      } else {
        return { ...prev, buildingIds: prev.buildingIds.filter(id => id !== buildingId) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.buildingIds.length === 0) {
      setError("Bạn bắt buộc phải chọn ít nhất một Cơ sở trọ để phân quyền cho nhân sự này.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await managerApi.create(formData);
      navigate("/managers");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create manager");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4" style={{ maxWidth: '800px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Thêm Nhân sự mới</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/managers")}>
          Quay lại
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Tên tài khoản (Username) <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                required
                placeholder="Ví dụ: manager02"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email <span className="text-danger">*</span></label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Ví dụ: manager@example.com"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Mật khẩu <span className="text-danger">*</span></label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Nhập mật khẩu"
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Phân quyền Cơ sở trọ</label>
              <p className="text-muted small mb-2">Chọn các tòa nhà mà nhân sự này được phép quản lý:</p>
              
              <div className="border rounded p-3 bg-light">
                {buildings.length === 0 ? (
                  <div className="text-muted fst-italic">Bạn chưa có cơ sở trọ nào.</div>
                ) : (
                  buildings.map((b) => (
                    <div className="form-check mb-2" key={b.buildingId || b.id}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`building-${b.buildingId || b.id}`}
                        checked={formData.buildingIds.includes(b.buildingId || b.id)}
                        onChange={(e) => handleBuildingChange(e, b.buildingId || b.id)}
                      />
                      <label className="form-check-label" htmlFor={`building-${b.buildingId || b.id}`}>
                        {b.name} - {b.address}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                {loading ? "Đang lưu..." : "Tạo mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
