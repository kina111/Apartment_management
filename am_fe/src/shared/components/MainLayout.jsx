import {Outlet} from 'react-router-dom';
import {Container} from 'react-bootstrap';
import Sidebar from './sidebar/Sidebar.jsx';

function MainLayout() {
    return (
        <div className="app-layout d-flex">
            <Sidebar/>
            <Container fluid as="main" className="main-content flex-grow-1 p-4">
                <Outlet/>
            </Container>
        </div>
    );
}

export default MainLayout;
