import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import managerApi from "../services/managerApi";
import { PlusCircle, PencilSquare, Trash } from "react-bootstrap-icons";
import { toast } from 'react-toastify';

export default function ManagerListPage() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await managerApi.getAll();
      setManagers(response.data);
    } catch (err) {
      setError("Failed to load managers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản quản lý [${name}] không?\nLưu ý: Hành động này sẽ thu hồi toàn bộ quyền quản lý cơ sở của tài khoản này về cho Landlord.`)) {
      try {
        await managerApi.delete(id);
        toast.success(`Đã xóa tài khoản [${name}] thành công!`);
        fetchManagers();
      } catch (err) {
        toast.error(err.response?.data?.message || "Lỗi khi xóa nhân sự");
      }
    }
  };

  if (loading) return <div className="p-4">Đang tải danh sách quản lý...</div>;
  if (error) return <div className="p-4 text-danger">{error}</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý Nhân sự</h2>
        <Link to="/managers/new" className="btn btn-primary d-flex align-items-center gap-2">
          <PlusCircle />
          <span>Thêm Nhân sự</span>
        </Link>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Tài khoản</th>
                <th>Email</th>
                <th>Cơ sở quản lý</th>
                <th>Trạng thái</th>
                <th className="text-end">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {managers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">Chưa có nhân sự nào được tạo.</td>
                </tr>
              ) : (
                managers.map((m, idx) => (
                  <tr key={m.accountId}>
                    <td>{idx + 1}</td>
                    <td><strong>{m.accountName}</strong></td>
                    <td>{m.email}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {m.managedBuildings.length > 0 ? (
                          m.managedBuildings.map((b) => (
                            <span key={b.buildingId} className="badge bg-info text-dark">
                              {b.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted fst-italic">Chưa gán cơ sở</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${m.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Link to={`/managers/${m.accountId}/edit`} className="btn btn-sm btn-outline-secondary">
                          <PencilSquare /> Sửa
                        </Link>
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => handleDelete(m.accountId, m.accountName)}
                        >
                          <Trash /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
