import {useState} from 'react';
import {NavLink} from 'react-router-dom';
import {Building, CarFront, List, Speedometer2, X} from 'react-bootstrap-icons';
import './Sidebar.css';

const menuItems = [
    {to: '/project-overview', label: 'Tổng quan', icon: Speedometer2},
    {to: '/buildings/new', label: 'Khởi tạo tòa nhà', icon: Building},
    {to: '/rooms', label: 'Danh sách phòng', icon: List},
    {to: '/vehicles', label: 'Phương tiện', icon: CarFront},
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
                {menuItems.map((item) => (
                    <SidebarItem key={item.to} {...item} />
                ))}
            </nav>

            <div className="sidebar-user">
                <img
                    className="sidebar-avatar"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80"
                    alt="Manager User"
                />
                <div className="sidebar-user-info">
                    <strong>Manager</strong>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
