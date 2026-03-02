import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Card, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const UsuariosPage = () => {
    const { isAdmin } = useContext(AuthContext);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        if (isAdmin) {
            fetchUsuarios();
        }
    }, [isAdmin]);

    const fetchUsuarios = async () => {
        try {
            const response = await api.get('/usuarios');
            setUsuarios(response.data.usuarios);
        } catch (error) {
            message.error('Error cargando usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleNewUser = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        form.setFieldsValue({
            username: user.username,
            role: user.role,
        });
        setIsModalVisible(true);
    };

    const handleDelete = (userId) => {
        Modal.confirm({
            title: 'Eliminar Usuario',
            content: '¿Estás seguro de que deseas eliminar este usuario?',
            okText: 'Sí',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await api.delete(`/usuarios/${userId}`);
                    message.success('Usuario eliminado');
                    fetchUsuarios();
                } catch (error) {
                    message.error('Error eliminando usuario');
                }
            },
        });
    };

    const onFinish = async (values) => {
        try {
            if (editingUser) {
                // Actualizar usuario
                await api.put(`/usuarios/${editingUser.id}`, {
                    username: values.username,
                    password: values.password || undefined,
                });
                message.success('Usuario actualizado');
            } else {
                // Crear nuevo usuario
                await api.post('/usuarios', {
                    username: values.username,
                    password: values.password,
                    role: values.role,
                });
                message.success('Usuario creado');
            }
            setIsModalVisible(false);
            form.resetFields();
            fetchUsuarios();
        } catch (error) {
            message.error(error.response?.data?.detail || 'Error');
        }
    };

    const columns = [
        {
            title: 'Usuario',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Rol',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'admin' ? 'red' : 'blue'}>{role}</Tag>
            ),
        },
        {
            title: 'Fecha Creación',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleString('es-ES'),
        },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Editar
                    </Button>
                    <Button
                        type="danger"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    >
                        Eliminar
                    </Button>
                </Space>
            ),
        },
    ];

    if (!isAdmin) {
        return <Card>No tienes permiso para acceder a esta página</Card>;
    }

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleNewUser}
                >
                    Nuevo Usuario
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={usuarios}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="Usuario"
                        name="username"
                        rules={[{ required: true, message: 'Usuario requerido' }]}
                    >
                        <Input placeholder="Ingresa el nombre de usuario" />
                    </Form.Item>

                    <Form.Item
                        label="Contraseña"
                        name="password"
                        rules={[
                            {
                                required: !editingUser,
                                message: 'Contraseña requerida',
                            },
                        ]}
                    >
                        <Input.Password placeholder={editingUser ? 'Dejar en blanco para mantener' : 'Ingresa contraseña'} />
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            label="Rol"
                            name="role"
                            rules={[{ required: true, message: 'Rol requerido' }]}
                            initialValue="user"
                        >
                            <Select
                                options={[
                                    { label: 'Administrador', value: 'admin' },
                                    { label: 'Usuario', value: 'user' },
                                ]}
                            />
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default UsuariosPage;