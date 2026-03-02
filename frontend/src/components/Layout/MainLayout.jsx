import React, { useContext } from 'react';
import { Layout, Menu, Dropdown, Avatar, Button, Empty } from 'antd';
import { UserOutlined, LogoutOutlined, ClockCircleOutlined, EnvironmentOutlined, TeamOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAdmin } = useContext(AuthContext);

    if (!user) {
        return <Empty description="No autenticado" />;
    }

    const menuItems = [
        {
            key: '1',
            icon: <ClockCircleOutlined />,
            label: 'Dashboard',
            onClick: () => navigate('/dashboard'),
        },
        {
            key: '2',
            icon: <EnvironmentOutlined />,
            label: 'Zonas',
            onClick: () => navigate('/zonas'),
        },
        {
            key: '3',
            icon: <ClockCircleOutlined />,
            label: 'Timer',
            onClick: () => navigate('/timers'),
        },
        ...(isAdmin
            ? [
                {
                    key: '4',
                    icon: <TeamOutlined />,
                    label: 'Usuarios',
                    onClick: () => navigate('/usuarios'),
                },
            ]
            : []),
        {
            key: '5',
            icon: <SettingOutlined />,
            label: 'Configuración',
            onClick: () => navigate('/configuracion'),
        },
    ];

    const userMenu = {
        items: [
            {
                label: `Usuario: ${user.username}`,
                disabled: true,
            },
            {
                label: `Rol: ${user.role}`,
                disabled: true,
            },
            {
                type: 'divider',
            },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Cerrar Sesión',
                onClick: () => {
                    logout();
                    navigate('/login');
                },
            },
        ],
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header
                style={{
                    background: '#001529',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 20px',
                }}
            >
                <h1 style={{ color: '#fff', margin: 0 }}>⏱️ Timer de Zonas</h1>
                <Dropdown menu={userMenu}>
                    <Button type="text" style={{ color: '#fff' }}>
                        <Avatar icon={<UserOutlined />} /> {user.username}
                    </Button>
                </Dropdown>
            </Header>

            <Layout>
                <Layout.Sider width={200} theme="light">
                    <Menu
                        mode="inline"
                        items={menuItems}
                        defaultSelectedKeys={[location.pathname.split('/')[1]]}
                    />
                </Layout.Sider>

                <Layout>
                    <Content style={{ padding: '20px', background: '#fff' }}>
                        <Outlet />
                    </Content>
                    <Footer style={{ textAlign: 'center', backgroundColor: '#f0f2f5' }}>
                        Timer de Zonas
                    </Footer>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default MainLayout;