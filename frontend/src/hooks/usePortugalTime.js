import { useState, useEffect } from 'react';

const usePortugalTime = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // Obtener la hora actual en la zona horaria de Portugal (WET/WEST)
        const updateTime = () => {
            const now = new Date();
            // Portugal usa UTC+0 (WET) en invierno y UTC+1 (WEST) en verano
            // Podemos usar toLocaleString para obtener la hora de Portugal
            setTime(now);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = () => {
        // Obtener hora en zona horaria de Portugal
        const formatter = new Intl.DateTimeFormat('es-ES', {
            timeZone: 'Europe/Lisbon',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });

        return formatter.format(time);
    };

    const getPortugalDate = () => {
        const formatter = new Intl.DateTimeFormat('es-ES', {
            timeZone: 'Europe/Lisbon',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });

        const parts = formatter.formatToParts(time);
        const result = {};
        parts.forEach((part) => {
            result[part.type] = part.value;
        });

        return {
            timestamp: formatTime(),
            año: parseInt(result.year),
            mes: parseInt(result.month),
            dia: parseInt(result.day),
            hora: parseInt(result.hour),
            minuto: parseInt(result.minute),
            segundo: parseInt(result.second),
        };
    };

    return {
        time,
        formatTime,
        getPortugalDate,
    };
};

export default usePortugalTime;