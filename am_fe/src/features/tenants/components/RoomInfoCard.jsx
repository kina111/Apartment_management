function RoomInfoCard({ tenant }) {
    return (
        <div className="mb-5">
            <h6 className="fw-bold mb-4" style={{ color: '#4f46e5', fontSize: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                THÔNG TIN CƯ TRÚ
            </h6>
            <div className="row g-4">
                <div className="col-md-6">
                    <p className="text-muted mb-1" style={{ fontSize: '16px' }}>Phòng đang ở</p>
                    <p className="fw-bold mb-0" style={{ fontSize: '22px', color: '#4f46e5' }}>{tenant.room}</p>
                </div>
                <div className="col-md-6">
                    <p className="text-muted mb-1" style={{ fontSize: '16px' }}>Quê quán</p>
                    <p className="fw-medium mb-0" style={{ fontSize: '20px', color: '#0f172a' }}>{tenant.hometown}</p>
                </div>
            </div>
        </div>
    );
}

export default RoomInfoCard;
