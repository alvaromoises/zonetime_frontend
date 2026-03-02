import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import TimerForm from './TimerForm';
import TimerTable from './TimerTable';

const TimerPage = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleTimerCreated = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    return (
        <div>
            <Tabs
                defaultActiveKey="1"
                items={[
                    {
                        key: '1',
                        label: 'Registrar Timer',
                        children: <TimerForm onSuccess={handleTimerCreated} />,
                    },
                    {
                        key: '2',
                        label: 'Mis Timers',
                        children: <TimerTable refreshTrigger={refreshTrigger} />,
                    },
                ]}
            />
        </div>
    );
};

export default TimerPage;