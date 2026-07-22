import {useState} from 'react';
import {NavLink} from 'react-router-dom';
import {BoxArrowRight, Building, CarFront, FileEarmarkText, List, People, Speedometer2, X, EnvelopePaper, DoorOpen, PersonBadge} from 'react-bootstrap-icons';
import {useAuth} from '../../context/AuthContext.jsx';
import './Sidebar.css';

const menuItems = [
    {to: '/project-overview', label: 'Tổng quan', icon: Speedometer2, roles: ['LANDLORD', 'MANAGER', 'ADMIN']},
    {to: '/buildings', label: 'Danh sách tòa nhà', icon: Building, roles: ['LANDLORD', 'MANAGER', 'ADMIN']},
    {to: '/rooms', label: 'Danh sách phòng', icon: DoorOpen, roles: ['LANDLORD', 'MANAGER', 'ADMIN']},
    {to: '/contracts', label: 'Quản lý Hợp đồng', icon: FileEarmarkText, roles: ['LANDLORD', 'MANAGER', 'ADMIN']},
    {to: '/tenants', label: 'Cư dân', icon: PersonBadge, roles: ['LANDLORD', 'MANAGER', 'ADMIN']},
    {to: '/vehicles', label: 'Phương tiện', icon: CarFront, roles: ['LANDLORD', 'MANAGER', 'ADMIN']},
    {to: '/managers', label: 'Quản lý Nhân sự', icon: People, roles: ['LANDLORD']},
    {to: '/notifications', label: 'Gửi thông báo', icon: EnvelopePaper, roles: ['LANDLORD']}
];

function SidebarItem({to, label, icon: Icon}) {
    return (
        <NavLink
            to={to}
            title={label}
            className={({isActive}) =>
                `sidebar-nav-link nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`
            }
        >
            <Icon className="sidebar-link-icon" size={20}/>
            <span className="sidebar-label">{label}</span>
        </NavLink>
    );
}

function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const {user, logout} = useAuth();

    return (
        <aside className={`sidebar ${isCollapsed ? 'is-collapsed' : ''}`}>
            <div className="sidebar-header">
                <h2 className="sidebar-title">Hola Management</h2>
                <button
                    type="button"
                    className="sidebar-toggle"
                    aria-label={isCollapsed ? 'Mở sidebar' : 'Đóng sidebar'}
                    aria-expanded={!isCollapsed}
                    onClick={() => setIsCollapsed((current) => !current)}
                >
                    {isCollapsed ? <List size={22}/> : <X size={22}/>}
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems
                    .filter(item => !item.roles || (user && item.roles.includes(user.role)))
                    .map((item) => (
                        <SidebarItem key={item.to} {...item} />
                ))}
            </nav>

            <div className="sidebar-user">
                <img
                    className="sidebar-avatar"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80"
                    alt="User Avatar"
                />
                <div className="sidebar-user-info">
                    <strong>{user?.accountName || 'Guest'}</strong>
                    <button onClick={logout} className="btn-logout" title="Đăng xuất">
                        <BoxArrowRight size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
