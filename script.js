document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('growthChart').getContext('2d');
    let growthChart;

    const calculate = () => {
        const initialCapital = parseFloat(document.getElementById('initialCapital').value) || 0;
        const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value) || 0;
        const annualRate = parseFloat(document.getElementById('interestRate').value) / 100 || 0;
        const years = parseInt(document.getElementById('years').value) || 0;

        const labels = [];
        const totalData = [];
        const investedData = [];
        
        let currentBalance = initialCapital;
        let totalInvested = initialCapital;
        const monthlyRate = annualRate / 12;

        labels.push('Start');
        totalData.push(initialCapital);
        investedData.push(initialCapital);

        for (let year = 1; year <= years; year++) {
            for (let month = 1; month <= 12; month++) {
                currentBalance = (currentBalance + monthlyContribution) * (1 + monthlyRate);
                totalInvested += monthlyContribution;
            }
            labels.push(`Jahr ${year}`);
            totalData.push(currentBalance);
            investedData.push(totalInvested);
        }

        updateUI(currentBalance, totalInvested);
        updateChart(labels, totalData, investedData);
    };

    const updateUI = (total, invested) => {
        const interest = total - invested;
        
        document.getElementById('totalBalance').textContent = formatCurrency(total);
        document.getElementById('totalInvested').textContent = formatCurrency(invested);
        document.getElementById('totalInterest').textContent = formatCurrency(interest);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    const updateChart = (labels, totalData, investedData) => {
        if (growthChart) {
            growthChart.destroy();
        }

        growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Gesamtguthaben',
                        data: totalData,
                        borderColor: '#0d6e4f',
                        backgroundColor: 'rgba(13, 110, 79, 0.1)',
                        fill: true,
                        tension: 0.3,
                        borderWidth: 3,
                        pointRadius: 0,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'Eingezahltes Kapital',
                        data: investedData,
                        borderColor: '#999999',
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0,
                        borderWidth: 2,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Outfit',
                                size: 12
                            },
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#ffffff',
                        titleColor: '#1a1a1a',
                        bodyColor: '#666666',
                        borderColor: '#e0e0e0',
                        borderWidth: 1,
                        padding: 12,
                        titleFont: {
                            family: 'Outfit',
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: 'IBM Plex Mono'
                        },
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f0f0f0'
                        },
                        ticks: {
                            font: {
                                family: 'IBM Plex Mono',
                                size: 11
                            },
                            callback: function(value) {
                                if (value >= 1000000) return (value / 1000000).toFixed(1) + ' Mio. €';
                                if (value >= 1000) return (value / 1000).toFixed(0) + 'k €';
                                return value + ' €';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                family: 'Outfit',
                                size: 11
                            },
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 10
                        }
                    }
                }
            }
        });
    };

    document.getElementById('calculateBtn').addEventListener('click', calculate);
    
    // Initial calculation
    calculate();
});
