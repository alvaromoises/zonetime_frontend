import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Input, Upload, message, Card, Space, Image, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const ZonasPage = () => {
    const { isAdmin } = useContext(AuthContext);
    const [zonas, setZonas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingZona, setEditingZona] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);

    useEffect(() => {
        fetchZonas();
    }, []);

    const fetchZonas = async () => {
        try {
            const response = await api.get('/zonas');
            setZonas(response.data.zonas);
        } catch (error) {
            message.error('Error cargando zonas');
        } finally {
            setLoading(false);
        }
    };

    const handleNewZona = () => {
        setEditingZona(null);
        setImageBase64(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (zona) => {
        setEditingZona(zona);
        setImageBase64(zona.imagen_base64);
        form.setFieldsValue({
            nombre: zona.nombre,
        });
        setIsModalVisible(true);
    };

    const handleDelete = (zonaId) => {
        Modal.confirm({
            title: 'Eliminar Zona',
            content: '¿Estás seguro? Esto eliminarán todos los timers asociados.',
            okText: 'Sí',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await api.delete(`/zonas/${zonaId}`);
                    message.success('Zona eliminada');
                    fetchZonas();
                } catch (error) {
                    message.error('Error eliminando zona');
                }
            },
        });
    };

    const onImageChange = (info) => {
        const file = info.file;
        const reader = new FileReader();
        reader.onload = (e) => {
            setImageBase64(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const onFinish = async (values) => {
        try {
            const payload = {
                nombre: values.nombre,
                imagen_base64: imageBase64,
            };

            if (editingZona) {
                await api.put(`/zonas/${editingZona.id}`, payload);
                message.success('Zona actualizada');
            } else {
                await api.post('/zonas', payload);
                message.success('Zona creada');
            }

            setIsModalVisible(false);
            form.resetFields();
            setImageBase64(null);
            fetchZonas();
        } catch (error) {
            message.error(error.response?.data?.detail || 'Error');
        }
    };

    const columns = [
        {
            title: 'Imagen',
            dataIndex: 'imagen_base64',
            key: 'imagen',
            width: 100,
            render: (imagen) =>
                imagen ? (
                    <Image
                        src={imagen}
                        alt="zona"
                        width={50}
                        height={50}
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <span>Sin imagen</span>
                ),
        },
        {
            title: 'Nombre',
            dataIndex: 'nombre',
            key: 'nombre',
            flex: 1,
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
                    <Tooltip title="Editar zona">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Eliminar zona">
                        <Button
                            type="danger"
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
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
                    onClick={handleNewZona}
                >
                    Nueva Zona
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={zonas}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
            />

            <Modal
                title={editingZona ? 'Editar Zona' : 'Crear Nueva Zona'}
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
                        label="Nombre de la Zona"
                        name="nombre"
                        rules={[{ required: true, message: 'Nombre requerido' }]}
                    >
                        <Input placeholder="Ej: Lisboa, Oporto, etc." />
                    </Form.Item>

                    <Form.Item label="Imagen">
                        {imageBase64 && (
                            <div style={{ marginBottom: '10px' }}>
                                <Image
                                    src={imageBase64}
                                    alt="preview"
                                    width={100}
                                    height={100}
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        )}
                        <Upload
                            maxCount={1}
                            onChange={onImageChange}
                            beforeUpload={() => false}
                        >
                            <Button>Seleccionar Imagen</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ZonasPage;