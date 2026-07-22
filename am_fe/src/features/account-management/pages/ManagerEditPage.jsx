import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import managerApi from "../services/managerApi";
import { toast } from 'react-toastify';

export default function ManagerEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    accountName: "",
    email: "",
    password: "", // Optional for update
    status: "ACTIVE",
    buildingIds: []
  });
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch all buildings for this landlord
      const buildingRes = await managerApi.getBuildings();
      const buildingsList = Array.isArray(buildingRes.data) ? buildingRes.data : buildingRes.data?.content || [];
      setBuildings(buildingsList);

      // Fetch all managers and find the one to edit
      const managersRes = await managerApi.getAll();
      const managerToEdit = managersRes.data.find(m => m.accountId.toString() === id);

      if (managerToEdit) {
        setFormData({
          accountName: managerToEdit.accountName,
          email: managerToEdit.email,
          password: "",
          status: managerToEdit.status,
          buildingIds: managerToEdit.managedBuildings.map(b => b.buildingId)
        });
      } else {
        toast.error("Không tìm thấy nhân sự!");
        navigate("/managers");
      }
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu");
      console.error(err);
    } finally {
      setInitialLoading(false);
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
      toast.warning("Bạn bắt buộc phải chọn ít nhất một Cơ sở trọ để phân quyền cho nhân sự này.");
      return;
    }
    setLoading(true);
    try {
      await managerApi.update(id, formData);
      toast.success("Cập nhật thông tin thành công");
      navigate("/managers");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-4">Đang tải thông tin...</div>;
  }

  return (
    <div className="container-fluid p-4" style={{ maxWidth: '800px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Sửa Thông tin Nhân sự</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/managers")}>
          Quay lại
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
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
              <label className="form-label">Đổi mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Bỏ trống nếu không muốn đổi mật khẩu"
              />
              <small className="text-muted">Nhập mật khẩu mới nếu bạn muốn thay đổi. Nếu không, hãy để trống.</small>
            </div>

            <div className="mb-3">
              <label className="form-label">Trạng thái</label>
              <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                <option value="INACTIVE">Khóa (INACTIVE)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Phân quyền Cơ sở trọ</label>
              <p className="text-muted small mb-2">Chọn các tòa nhà mà nhân sự này được phép quản lý (Thêm hoặc bớt):</p>
              
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
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
