function IdentityInfoCard({ tenant }) {
    return (
        <div className="mb-5">
            <h6 className="fw-bold mb-4" style={{ color: '#4f46e5', fontSize: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                THÔNG TIN CÁ NHÂN
            </h6>
            <div className="row g-4">
                <div className="col-md-6">
                    <p className="text-muted mb-1" style={{ fontSize: '16px' }}>Họ và tên</p>
                    <p className="fw-medium mb-0" style={{ fontSize: '20px', color: '#0f172a' }}>{tenant.name}</p>
                </div>
                <div className="col-md-6">
                    <p className="text-muted mb-1" style={{ fontSize: '16px' }}>Số CCCD</p>
                    <p className="fw-medium mb-0" style={{ fontSize: '20px', color: '#0f172a' }}>{tenant.cccd}</p>
                </div>
                <div className="col-md-6">
                    <p className="text-muted mb-1" style={{ fontSize: '16px' }}>Số điện thoại</p>
                    <p className="fw-medium mb-0" style={{ fontSize: '20px', color: '#0f172a' }}>{tenant.phone}</p>
                </div>
                <div className="col-md-6">
                    <p className="text-muted mb-1" style={{ fontSize: '16px' }}>Ngày sinh</p>
                    <p className="fw-medium mb-0" style={{ fontSize: '20px', color: '#0f172a' }}>{tenant.dob}</p>
                </div>
            </div>
        </div>
    );
}

export default IdentityInfoCard;
