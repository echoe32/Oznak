import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_COLORS = {
    FOOD: '#f97316',
    ENTERTAINMENT: '#8b5cf6',
    BILLS: '#ef4444',
    TRANSPORT: '#06b6d4',
    SHOPPING: '#ec4899',
    OTHER: '#22c55e',
};

const CATEGORY_LABELS = {
    FOOD: 'Еда и напитки',
    ENTERTAINMENT: 'Развлечения',
    BILLS: 'Счета',
    TRANSPORT: 'Транспорт и путешествия',
    SHOPPING: 'Покупки',
    OTHER: 'Другое',
};

const TransactionChart = ({ data }) => {
    const categoryTotals = data.reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
    }, {});

    const chartData = {
        labels: Object.keys(categoryTotals).map(key => CATEGORY_LABELS[key] || key),
        datasets: [
            {
                data: Object.values(categoryTotals),
                backgroundColor: Object.keys(categoryTotals).map(
                    (category) => CATEGORY_COLORS[category] || '#64748b'
                ),
                hoverBackgroundColor: Object.keys(categoryTotals).map(
                    (category) => CATEGORY_COLORS[category] || '#64748b'
                ),
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 8,
            },
        ],
    };

    const options = {
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                backgroundColor: '#0f172a',
                titleColor: '#f8fafc',
                bodyColor: '#e2e8f0',
                borderColor: '#334155',
                borderWidth: 1,
            },
            legend: {
                position: 'right',
                labels: {
                    color: '#334155',
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: {
                        family: 'Inter, system-ui, sans-serif',
                        size: 13,
                        weight: '600',
                    }
                }
            }
        },
        cutout: '62%',
    };

    if (!data || data.length === 0) {
        return <div className="text-center text-slate-500 py-10">Еще нет данных для отображения.</div>;
    }

    return (
        <div className="w-full max-w-md mx-auto aspect-square">
            <Doughnut data={chartData} options={options} />
        </div>
    );
};

export default TransactionChart;