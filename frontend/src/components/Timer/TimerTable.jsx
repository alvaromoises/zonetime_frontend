import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, InputNumber, Row, Col, message, Empty } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import api from '../../api/axios';

const TimerTable = ({ refreshTrigger }) => {
    const [timers, setTimers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingTimer, setEditingTimer] = useState(null);
    const [editingValues, setEditingValues] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        fetchTimers();
        const interval = setInterval(fetchTimers, 5000); // Actualizar cada 5 segundos
        return () => clearInterval(interval);
    }, [refreshTrigger]);

    const fetchTimers = async () => {
        try {
            const response = await api.get('/timers');
            setTimers(response.data.timers);
        } catch (error) {
            message.error('Error cargando timers');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'activo':
                return 'green';
            case 'espera':
                return 'orange';
            case 'inactivo':
                return 'red';
            default:
                return 'default';
        }
    };

    const handleEdit = (timer) => {
        setEditingTimer(timer);
        setEditingValues({
            horas: Math.floor(timer.duracion_segundos / 3600),
            minutos: Math.floor((timer.duracion_segundos % 3600) / 60),
            segundos: timer.duracion_segundos % 60,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (timerId) => {
        Modal.confirm({
            title: 'Eliminar Timer',
            content: '¿Estás seguro de que deseas eliminar este timer?',
            okText: 'Sí',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await api.delete(`/timers/${timerId}`);
                    message.success('Timer eliminado');
                    fetchTimers();
                } catch (error) {
                    message.error('Error eliminando timer');
                }
            },
        });
    };

    const handleUpdateTimer = async () => {
        try {
            const duracion_segundos =
                (editingValues.horas || 0) * 3600 +
                (editingValues.minutos || 0) * 60 +
                (editingValues.segundos || 0);

            await api.put(`/timers/${editingTimer.id}`, {
                duracion_segundos,
            });

            message.success('Timer actualizado');
            setIsModalVisible(false);
            fetchTimers();
        } catch (error) {
            message.error(error.response?.data?.detail || 'Error actualizando timer');
        }
    };

    const columns = [
        {
            title: 'Zona',
            dataIndex: 'zona_nombre',
            key: 'zona_nombre',
            width: '15%',
        },
        {
            title: 'Inicio',
            dataIndex: 'inicio',
            key: 'inicio',
            render: (text) => new Date(text).toLocaleString('es-ES'),
            width: '18%',
        },
        {
            title: 'Fin',
            dataIndex: 'fin',
            key: 'fin',
            render: (text) => new Date(text).toLocaleString('es-ES'),
            width: '18%',
        },
        {
            title: 'Tiempo Restante',
            dataIndex: 'tiempo_restante_segundos',
            key: 'tiempo_restante',
            render: (seconds) => {
                const color = seconds <= 600 ? 'red' : 'blue';
                return <span style={{ color, fontWeight: 'bold' }}>{formatTime(seconds)}</span>;
            },
            width: '15%',
        },
        {
            title: 'Pertenencia',
            dataIndex: 'pertenencia',
            key: 'pertenencia',
            width: '15%',
        },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
            render: (estado) => <Tag color={getEstadoColor(estado)}>{estado}</Tag>,
            width: '10%',
        },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, record) => (
                <div>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        style={{ marginRight: '8px' }}
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
                </div>
            ),
            width: '12%',
        },
    ];

    if (timers.length === 0 && !loading) {
        return <Empty description="No hay timers registrados" />;
    }

    return (
        <>
            <Table
                columns={columns}
                dataSource={timers}
                loading={loading}
                rowKey="id"
                scroll={{ x: 1200 }}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title="Editar Duración del Timer"
                open={isModalVisible}
                onOk={handleUpdateTimer}
                onCancel={() => setIsModalVisible(false)}
            >
                <Row gutter={16}>
                    <Col xs={24} sm={8}>
                        <label>Horas</label>
                        <InputNumber
                            min={0}
                            max={23}
                            value={editingValues.horas}
                            onChange={(val) =>
                                setEditingValues({ ...editingValues, horas: val })
                            }
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <label>Minutos</label>
                        <InputNumber
                            min={0}
                            max={59}
                            value={editingValues.minutos}
                            onChange={(val) =>
                                setEditingValues({ ...editingValues, minutos: val })
                            }
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <label>Segundos</label>
                        <InputNumber
                            min={0}
                            max={59}
                            value={editingValues.segundos}
                            onChange={(val) =>
                                setEditingValues({ ...editingValues, segundos: val })
                            }
                            style={{ width: '100%' }}
                        />
                    </Col>
                </Row>
            </Modal>
        </>
    );
};

export default TimerTable;