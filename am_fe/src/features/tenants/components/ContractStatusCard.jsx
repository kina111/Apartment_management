function ContractStatusCard() {
    return (
        <div>
            <h6 className="fw-bold mb-4" style={{ color: '#4f46e5', fontSize: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                TÌNH TRẠNG HỢP ĐỒNG
            </h6>
            <div className="p-4 rounded" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p className="mb-2" style={{ fontSize: '18px', color: '#475569' }}>
                    Trạng thái: <strong style={{ color: '#059669' }}>Đang hiệu lực</strong>
                </p>
                <p className="mb-0" style={{ fontSize: '18px', color: '#475569' }}>
                    Ghi chú: <strong style={{ color: '#0f172a' }}>Chủ hợp đồng chính</strong>
                </p>
            </div>
        </div>
    );
}

export default ContractStatusCard;
