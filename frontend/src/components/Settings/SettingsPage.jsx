import React, { useContext, useState } from 'react';
import { Form, Input, Button, Card, message, Divider, Row, Col } from 'antd';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

const SettingsPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    const onFinish = async (values) => {
        // Validar que las contraseñas nuevas coincidan
        if (values.newPassword !== values.confirmPassword) {
            message.error('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            await api.put(`/usuarios/${user.user_id}`, {
                password: values.newPassword,
            });
            message.success('Contraseña actualizada exitosamente');
            form.resetFields();
        } catch (error) {
            message.error(error.response?.data?.detail || 'Error actualizando contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Row gutter={16}>
                <Col xs={24} sm={24} md={12} lg={8}>
                    <Card title="Configuración de Cuenta">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                        >
                            <Form.Item>
                                <h4>Usuario: {user?.username}</h4>
                            </Form.Item>

                            <Form.Item>
                                <h4>Rol: {user?.role === 'admin' ? 'Administrador' : 'Usuario'}</h4>
                            </Form.Item>

                            <Divider />

                            <Form.Item
                                label="Nueva Contraseña"
                                name="newPassword"
                                rules={[
                                    { required: true, message: 'Nueva contraseña requerida' },
                                    { min: 6, message: 'Mínimo 6 caracteres' },
                                ]}
                            >
                                <Input.Password placeholder="Ingresa nueva contraseña" />
                            </Form.Item>

                            <Form.Item
                                label="Confirmar Contraseña"
                                name="confirmPassword"
                                rules={[
                                    { required: true, message: 'Confirma la contraseña' },
                                ]}
                            >
                                <Input.Password placeholder="Confirma la contraseña" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" block loading={loading}>
                                    Actualizar Contraseña
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SettingsPage;