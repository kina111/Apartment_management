import { Card } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import tenantsList from '../services/tenantsList';
import IdentityInfoCard from '../components/IdentityInfoCard';
import RoomInfoCard from '../components/RoomInfoCard';
import EmergencyContactCard from '../components/EmergencyContactCard';

function TenantDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();


    const baseTenant = tenantsList.find(t => t.id === parseInt(id));


    if (!baseTenant) {
        return <div className="p-5 text-center">Không tìm thấy cư dân</div>;
    }


    const getInitials = (name) => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return parts[parts.length - 2][0] + parts[parts.length - 1][0];
        }
        return name.substring(0, 2);
    };


    const tenant = {
        ...baseTenant,
        initials: getInitials(baseTenant.name),
    };

    return (
        <div className="tenant-detail-page p-4 p-md-5">

            <Card className="shadow-sm border-0" style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Card.Body className="p-4 p-md-5">
                    <div className="d-flex justify-content-between align-items-center mb-5">
                        <div 
                            className="d-flex align-items-center fw-bold" 
                            style={{ cursor: 'pointer', fontSize: '18px', color: '#4f46e5' }}
                            onClick={() => navigate('/tenants')}
                        >
                            <ArrowLeft size={24} className="me-2" /> [Quay lại]
                        </div>
                        <span className="px-4 py-2 rounded-pill fw-semibold text-white" style={{ fontSize: '14px', backgroundColor: '#059669', letterSpacing: '0.05em' }}>
                            HỒ SƠ CƯ DÂN
                        </span>
                    </div>

                    <div className="row g-5">

                        <div className="col-12 col-lg-4">
                            <Card className="shadow-none h-100" style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-5 text-center">
                                    <div 
                                        className="d-flex align-items-center justify-content-center mb-4"
                                        style={{ width: '160px', height: '160px', borderRadius: '20px', backgroundColor: '#e0e7ff', color: '#4f46e5', fontSize: '48px', fontWeight: 'bold' }}
                                    >
                                        {tenant.initials}
                                    </div>
                                    <h4 className="fw-bold mb-2" style={{ color: '#0f172a', fontSize: '28px' }}>{tenant.name}</h4>
                                    <p className="text-muted mb-0" style={{ fontSize: '18px' }}>{tenant.role}</p>
                                </Card.Body>
                            </Card>
                        </div>


                        <div className="col-12 col-lg-8">
                            <IdentityInfoCard tenant={tenant} />
                            <hr className="my-5" style={{ borderColor: '#e2e8f0' }} />
                            
                            <RoomInfoCard tenant={tenant} />
                            <hr className="my-5" style={{ borderColor: '#e2e8f0' }} />
                            
                            <EmergencyContactCard tenant={tenant} />
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}

export default TenantDetailPage;
