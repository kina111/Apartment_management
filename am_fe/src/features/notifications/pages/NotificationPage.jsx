import React, { useState, useEffect } from 'react';
import { EnvelopePaper, Send, X, CloudUpload, Save } from 'react-bootstrap-icons';
import { notificationApi } from '../services/notificationApi';
import buildingApi from '../../buildings/services/buildingApi';
import { toast } from 'react-toastify';
import Select from 'react-select';
import './NotificationPage.css';

const NotificationPage = () => {
    const [buildings, setBuildings] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState('');
    
    const [formData, setFormData] = useState({
        senderEmail: '',
        senderPassword: '',
        targetScope: 'ALL_TENANTS',
        subject: '',
        content: '',
    });
    
    const [targets, setTargets] = useState({ tenants: [], managers: [] });
    const [selectedTenants, setSelectedTenants] = useState([]);
    const [selectedManagers, setSelectedManagers] = useState([]);
    
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [savingConfig, setSavingConfig] = useState(false);

    useEffect(() => {
        loadBuildings();
    }, []);

    const loadBuildings = async () => {
        try {
            const buildings = await buildingApi.getMyBuildingOptions();
            setBuildings(buildings);
        } catch (err) {
            toast.error("Không thể tải danh sách tòa nhà");
        }
    };

    const handleBuildingChange = async (e) => {
        const buildingId = e.target.value;
        setSelectedBuilding(buildingId);
        
        if (buildingId) {
            try {
                // Fetch email config
                const configRes = await notificationApi.getEmailConfig(buildingId);
                setFormData(prev => ({
                    ...prev,
                    senderEmail: configRes.senderEmail || '',
                    senderPassword: configRes.senderPassword || ''
                }));
                
                // Fetch targets
                const targetsRes = await notificationApi.getTargets(buildingId);
                setTargets({
                    tenants: targetsRes?.tenants ?? [],
                    managers: targetsRes?.managers ?? []
                });
                setSelectedTenants([]);
                setSelectedManagers([]);
            } catch (err) {
                toast.error("Lỗi khi tải thông tin tòa nhà");
            }
        } else {
            setFormData(prev => ({ ...prev, senderEmail: '', senderPassword: '' }));
            setTargets({ tenants: [], managers: [] });
        }
    };

    const saveEmailConfig = async () => {
        if (!selectedBuilding) {
            toast.warning("Vui lòng chọn tòa nhà trước");
            return;
        }
        if (!formData.senderEmail || !formData.senderPassword) {
            toast.warning("Vui lòng nhập Email và Mật khẩu ứng dụng");
            return;
        }
        try {
            setSavingConfig(true);
            await notificationApi.saveEmailConfig(selectedBuilding, {
                senderEmail: formData.senderEmail,
                senderPassword: formData.senderPassword
            });
            toast.success("Đã lưu cấu hình Email cho tòa nhà này");
        } catch (err) {
            toast.error("Lưu cấu hình thất bại");
        } finally {
            setSavingConfig(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (indexToRemove) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedBuilding) {
            toast.warning("Vui lòng chọn tòa nhà");
            return;
        }

        if (formData.targetScope === 'SPECIFIC' && selectedTenants.length === 0 && selectedManagers.length === 0) {
            toast.warning('Vui lòng chọn ít nhất 1 người nhận');
            return;
        }

        const submitData = new FormData();
        submitData.append('buildingId', selectedBuilding);
        submitData.append('targetScope', formData.targetScope);
        submitData.append('subject', formData.subject);
        submitData.append('content', formData.content);
        
        if (formData.targetScope === 'SPECIFIC') {
            selectedTenants.forEach(t => submitData.append('specificTenantIds', t.value));
            selectedManagers.forEach(m => submitData.append('specificManagerIds', m.value));
        }

        files.forEach(file => {
            submitData.append('attachments', file);
        });

        try {
            setLoading(true);
            await notificationApi.sendFlexibleNotification(submitData);
            toast.success('Hệ thống đang tiến hành gửi thông báo!');
            setFormData(prev => ({ ...prev, subject: '', content: '' }));
            setFiles([]);
            setSelectedTenants([]);
            setSelectedManagers([]);
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data || 'Lỗi khi gửi thông báo. Vui lòng kiểm tra cấu hình.');
        } finally {
            setLoading(false);
        }
    };

    const tenantOptions = targets.tenants.map(t => ({ value: t.id, label: `${t.name} (${t.email})` }));
    const managerOptions = targets.managers.map(m => ({ value: m.id, label: `${m.name} (${m.email})` }));

    return (
        <div className="notification-page">
            <div className="notification-header">
                <h1><EnvelopePaper className="me-2" />Gửi Thông Báo (Email)</h1>
                <p>Soạn và gửi email linh hoạt theo từng tòa nhà</p>
            </div>

            <div className="notification-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <div className="form-section-title">1. Chọn Tòa Nhà</div>
                        <div className="form-group mb-0">
                            <select className="form-select" value={selectedBuilding} onChange={handleBuildingChange} required>
                                <option value="">-- Chọn tòa nhà --</option>
                                {buildings.map(b => (
                                    <option key={b.buildingId} value={b.buildingId}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={`form-section ${!selectedBuilding ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="form-section-title d-flex justify-content-between align-items-center">
                            <span>2. Cấu hình Email gửi đi (SMTP)</span>
                            <button type="button" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" onClick={saveEmailConfig} disabled={savingConfig || !selectedBuilding}>
                                <Save size={14} /> {savingConfig ? 'Đang lưu...' : 'Lưu Cấu Hình'}
                            </button>
                        </div>
                        
                        <div className="alert alert-info py-2 px-3 mb-3" style={{ fontSize: '0.85rem' }}>
                            <strong>Hướng dẫn cấu hình Gmail SMTP:</strong>
                            <ul className="mb-0 ps-3 mt-1">
                                <li><strong>SMTP Server/Port:</strong> Hệ thống đã tự động cấu hình (smtp.gmail.com:587 - TLS).</li>
                                <li><strong>Email cá nhân:</strong> Địa chỉ Gmail của bạn (ví dụ: tenban@gmail.com).</li>
                                <li><strong>Mật khẩu ứng dụng:</strong> Không dùng mật khẩu đăng nhập Gmail. Bạn phải bật <em>Xác minh 2 bước</em> cho tài khoản Google, sau đó tạo <em>Mật khẩu ứng dụng (App Password)</em> 16 ký tự (nhập viết liền, không khoảng trắng).</li>
                            </ul>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email cá nhân (Gmail)</label>
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    name="senderEmail"
                                    value={formData.senderEmail}
                                    onChange={handleInputChange}
                                    placeholder="vd: nguyenvan@gmail.com"
                                    disabled={!selectedBuilding}
                                />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu ứng dụng (App Password)</label>
                                <input 
                                    type="password" 
                                    className="form-control" 
                                    name="senderPassword"
                                    value={formData.senderPassword}
                                    onChange={handleInputChange}
                                    placeholder="Mật khẩu 16 ký tự"
                                    disabled={!selectedBuilding}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`form-section ${!selectedBuilding ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="form-section-title">3. Đối tượng nhận</div>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="targetScope" 
                                    value="ALL_TENANTS"
                                    checked={formData.targetScope === 'ALL_TENANTS'}
                                    onChange={handleInputChange}
                                    disabled={!selectedBuilding}
                                />
                                Toàn bộ Cư dân ({targets.tenants.length})
                            </label>
                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="targetScope" 
                                    value="ALL_MANAGERS"
                                    checked={formData.targetScope === 'ALL_MANAGERS'}
                                    onChange={handleInputChange}
                                    disabled={!selectedBuilding}
                                />
                                Toàn bộ Quản lý ({targets.managers.length})
                            </label>
                            <label className="radio-label">
                                <input 
                                    type="radio" 
                                    name="targetScope" 
                                    value="SPECIFIC"
                                    checked={formData.targetScope === 'SPECIFIC'}
                                    onChange={handleInputChange}
                                    disabled={!selectedBuilding}
                                />
                                Tùy chọn cá nhân
                            </label>
                        </div>
                        
                        {formData.targetScope === 'SPECIFIC' && (
                            <div className="row mt-3">
                                <div className="col-md-6 form-group">
                                    <label>Chọn Cư Dân</label>
                                    <Select 
                                        isMulti 
                                        options={tenantOptions} 
                                        value={selectedTenants}
                                        onChange={setSelectedTenants}
                                        placeholder="Tìm kiếm cư dân..."
                                        noOptionsMessage={() => "Không có dữ liệu"}
                                    />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Chọn Quản Lý</label>
                                    <Select 
                                        isMulti 
                                        options={managerOptions} 
                                        value={selectedManagers}
                                        onChange={setSelectedManagers}
                                        placeholder="Tìm kiếm quản lý..."
                                        noOptionsMessage={() => "Không có dữ liệu"}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`form-section ${!selectedBuilding ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="form-section-title">4. Nội dung thông báo</div>
                        <div className="form-group mb-3">
                            <label>Tiêu đề (Subject)</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="Tiêu đề thông báo"
                                required 
                                disabled={!selectedBuilding}
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label>Nội dung</label>
                            <textarea 
                                className="form-control textarea-control" 
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                placeholder="Viết nội dung thông báo (Hỗ trợ HTML)..."
                                required 
                                disabled={!selectedBuilding}
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Tệp đính kèm (Tùy chọn)</label>
                            <div className="file-upload-wrapper">
                                <input 
                                    type="file" 
                                    className="file-upload-input" 
                                    multiple 
                                    onChange={handleFileChange}
                                    disabled={!selectedBuilding}
                                />
                                <div className="file-upload-text">
                                    <CloudUpload size={24} className="mb-2 text-primary" />
                                    <div>Kéo thả hoặc <span>Nhấp để chọn tệp</span></div>
                                </div>
                            </div>
                            
                            {files.length > 0 && (
                                <div className="selected-files">
                                    {files.map((file, index) => (
                                        <div key={index} className="file-item">
                                            <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                                            <button type="button" className="file-item-remove" onClick={() => removeFile(index)}>
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-submit" disabled={loading || !selectedBuilding}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Send size={18} /> Gửi Thông Báo
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NotificationPage;
