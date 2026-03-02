import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Skeleton, Empty, Tag, Progress, Image } from 'antd';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import usePortugalTime from '../../hooks/usePortugalTime';

const Dashboard = () => {
    const [timers, setTimers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const { formatTime, getPortugalDate } = usePortugalTime();

    useEffect(() => {
        fetchTopTimers();
        const interval = setInterval(fetchTopTimers, 30000); // Actualizar cada 30 segundos
        return () => clearInterval(interval);
    }, []);

    const fetchTopTimers = async () => {
        try {
            const response = await api.get('/timers/top5');
            setTimers(response.data.timers_proximos);
        } catch (error) {
            console.error('Error fetching timers:', error);
        } finally {
            setLoading(false);
        }
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

    const formatTimeRemaining = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgressPercent = (timerData) => {
        const totalDuration = timerData.duracion_segundos;
        const remaining = timerData.tiempo_restante_segundos;
        return ((totalDuration - remaining) / totalDuration) * 100;
    };

    const portugueseTime = getPortugalDate();

    return (
        <div style={{ padding: '20px' }}>
            {/* Header con hora de Portugal */}
            <Card
                style={{
                    marginBottom: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                }}
            >
                <Row gutter={16} style={{ color: 'white' }}>
                    <Col span={24}>
                        <h2 style={{ margin: 0, color: 'white' }}>Bienvenido, {user?.username}!</h2>
                        <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                            Hora Portugal: {formatTime()}
                        </p>
                    </Col>
                </Row>
            </Card>

            {/* Título */}
            <h2 style={{ marginBottom: '20px' }}>Top 5 Timers Próximos a Terminar</h2>

            {loading ? (
                <Row gutter={16}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Col key={i} xs={24} sm={24} md={12} lg={8} xl={5}>
                            <Skeleton active />
                        </Col>
                    ))}
                </Row>
            ) : timers.length === 0 ? (
                <Empty description="No hay timers activos" />
            ) : (
                <Row gutter={16}>
                    {timers.map((timer) => (
                        <Col key={timer.id} xs={24} sm={24} md={12} lg={8} xl={5}>
                            <Card
                                hoverable
                                style={{
                                    textAlign: 'center',
                                    height: '100%',
                                    borderColor: timer.tiempo_restante_segundos <= 600 ? '#ff4d4f' : undefined,
                                    borderWidth: timer.tiempo_restante_segundos <= 600 ? 2 : 1,
                                }}
                            >
                                {timer.zona_imagen && (
                                    <Image
                                        src={timer.zona_imagen}
                                        alt={timer.zona_nombre}
                                        style={{ width: '100%', height: '120px', objectFit: 'cover', marginBottom: '10px' }}
                                        preview={false}
                                    />
                                )}
                                <h3 style={{ margin: '10px 0' }}>{timer.zona_nombre}</h3>
                                <Tag color={getEstadoColor(timer.estado)}>{timer.estado}</Tag>
                                <p style={{ marginTop: '10px', fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                                    {formatTimeRemaining(timer.tiempo_restante_segundos)}
                                </p>
                                <Progress
                                    percent={getProgressPercent(timer)}
                                    status={timer.tiempo_restante_segundos <= 600 ? 'exception' : 'active'}
                                    strokeColor={timer.tiempo_restante_segundos <= 600 ? '#ff4d4f' : '#1890ff'}
                                />
                                <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                                    Pertenece a: {timer.pertenencia}
                                </p>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default Dashboard;