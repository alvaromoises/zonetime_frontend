import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, Card, Row, Col, message, InputNumber } from 'antd';
import dayjs from 'dayjs';
import api from '../../api/axios';
import usePortugalTime from '../../hooks/usePortugalTime';

const TimerForm = ({ onSuccess }) => {
    const [form] = Form.useForm();
    const [zonas, setZonas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingZonas, setLoadingZonas] = useState(true);
    const { getPortugalDate } = usePortugalTime();

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
            setLoadingZonas(false);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Convertir tiempo a segundos
            const duracion_segundos =
                (values.horas || 0) * 3600 +
                (values.minutos || 0) * 60 +
                (values.segundos || 0);

            if (duracion_segundos <= 0) {
                message.error('La duración debe ser mayor a 0');
                setLoading(false);
                return;
            }

            const payload = {
                zona_id: values.zona_id,
                inicio: values.inicio.toISOString(),
                duracion_segundos,
                pertenencia: values.pertenencia,
            };

            await api.post('/timers', payload);
            message.success('Timer registrado exitosamente');
            form.resetFields();
            onSuccess();
        } catch (error) {
            message.error(error.response?.data?.detail || 'Error registrando timer');
        } finally {
            setLoading(false);
        }
    };

    const portugueseTime = getPortugalDate();
    const initialDateTime = dayjs()
        .hour(portugueseTime.hora)
        .minute(portugueseTime.minuto)
        .second(portugueseTime.segundo);

    return (
        <Card>
            <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
                initialValues={{
                    inicio: initialDateTime,
                    horas: 0,
                    minutos: 0,
                    segundos: 0,
                }}
            >
                <Form.Item
                    label="Zona"
                    name="zona_id"
                    rules={[{ required: true, message: 'Selecciona una zona' }]}
                >
                    <Select
                        placeholder="Selecciona una zona"
                        loading={loadingZonas}
                        options={zonas.map((z) => ({ label: z.nombre, value: z.id }))}
                    />
                </Form.Item>

                <Form.Item
                    label="Hora de Inicio (Formato 24 horas - Zona Portugal)"
                    name="inicio"
                    rules={[{ required: true, message: 'Selecciona hora de inicio' }]}
                >
                    <DatePicker
                        format="DD/MM/YYYY HH:mm:ss"
                        showTime={{ format: 'HH:mm:ss' }}
                    />
                </Form.Item>

                <Form.Item label="Tiempo a Transcurrir">
                    <Row gutter={8}>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                name="horas"
                                label="Horas"
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={0} max={23} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                name="minutos"
                                label="Minutos"
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={0} max={59} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                name="segundos"
                                label="Segundos"
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={0} max={59} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>

                <Form.Item
                    label="Pertenencia (Quién será responsable)"
                    name="pertenencia"
                    rules={[{ required: true, message: 'Ingresa a quién pertenece' }]}
                >
                    <Input placeholder="Ej: Juan Pérez, Equipo A, etc." />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        Registrar Timer
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default TimerForm;