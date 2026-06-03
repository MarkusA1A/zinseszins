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

        let turningPointYear = null;
        const annualContribution = monthlyContribution * 12;
        
        for (let i = 1; i <= years; i++) {
            const annualInterest = (totalData[i] - totalData[i-1]) - (investedData[i] - investedData[i-1]);
            if (annualInterest > annualContribution) {
                turningPointYear = i;
                break;
            }
        }

        updateUI(currentBalance, totalInvested, years, totalData, investedData, monthlyContribution, turningPointYear);
        updateChart(labels, totalData, investedData, turningPointYear);
    };

    const updateUI = (total, invested, years, totalData, investedData, monthlyContribution, turningPointYear) => {
        const interest = total - invested;
        
        document.getElementById('totalBalance').textContent = formatCurrency(total);
        document.getElementById('totalInvested').textContent = formatCurrency(invested);
        document.getElementById('totalInterest').textContent = formatCurrency(interest);

        generateInsights(years, totalData, investedData, monthlyContribution, turningPointYear);
    };

    const generateInsights = (years, totalData, investedData, monthlyContribution, turningPointYear) => {
        const insightsBox = document.getElementById('insightsBox');
        
        // Berechnung: Zinsgewinn in den ersten 10 Jahren vs. letzte 10 Jahre (oder halbe Laufzeit)
        const midPoint = Math.floor(years / 2);
        const firstHalfInterest = (totalData[midPoint] - investedData[midPoint]);
        const secondHalfInterest = (totalData[years] - totalData[midPoint]) - (investedData[years] - investedData[midPoint]);
        
        const annualContribution = monthlyContribution * 12;

        let html = `<span class="insight-title">Analyse des Zinseszins-Effekts</span>`;
        
        if (years >= 10) {
            html += `<p class="insight-text">Geduld zahlt sich aus: In den ersten ${midPoint} Jahren beträgt Ihr Zinsertrag nur <span class="highlight-val">${formatCurrency(firstHalfInterest)}</span>. 
            In der zweiten Hälfte der Laufzeit explodiert dieser auf <span class="highlight-val">${formatCurrency(secondHalfInterest)}</span> &ndash; ein Zuwachs um das <span class="highlight-val">${(secondHalfInterest/firstHalfInterest).toFixed(1)}</span>-fache.</p>`;
        }

        if (turningPointYear) {
            html += `<p class="insight-text" style="margin-top: 0.8rem;">Der markierte **Wendepunkt**: Ab **Jahr ${turningPointYear}** verdienen Ihre Zinsen jährlich mehr Geld (<span class="highlight-val">> ${formatCurrency(annualContribution)}</span>) als Sie selbst aktiv einzahlen.</p>`;
        } else {
            html += `<p class="insight-text" style="margin-top: 0.8rem;">Hinweis: Bei dieser Konfiguration wird die volle Dynamik des Zinseszinses erst bei längeren Laufzeiten oder höheren Raten sichtbar.</p>`;
        }

        insightsBox.innerHTML = html;
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    const updateChart = (labels, totalData, investedData, turningPointYear) => {
        if (growthChart) {
            growthChart.destroy();
        }

        const maxYears = labels.length - 1;

        // Custom plugin to draw vertical line at turning point
        const verticalLinePlugin = {
            id: 'verticalLine',
            afterDatasetsDraw: (chart) => {
                if (turningPointYear && turningPointYear <= maxYears) {
                    const {ctx, chartArea: {top, bottom, left, right}, scales: {x, y}} = chart;
                    
                    // Wir suchen den Index für das Jahr (labels sind "Start", "Jahr 1", "Jahr 2"...)
                    const xIndex = turningPointYear; // Index 1 ist Jahr 1, da "Start" Index 0 ist
                    const xPos = x.getPixelForValue(labels[xIndex]);

                    if (xPos >= left && xPos <= right) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(xPos, top);
                        ctx.lineTo(xPos, bottom);
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = '#0d6e4f';
                        ctx.setLineDash([6, 6]);
                        ctx.stroke();

                        // Hintergrund für Label (massiv vergrößert für Lesbarkeit)
                        ctx.fillStyle = '#0d6e4f';
                        ctx.font = 'bold 20px Outfit';
                        ctx.textAlign = 'center';
                        const text = 'WENDEPUNKT';
                        const textWidth = ctx.measureText(text).width;
                        
                        // Badge-Hintergrund (extra groß)
                        ctx.fillRect(xPos - (textWidth/2) - 15, top - 40, textWidth + 30, 32);
                        
                        // Text (groß und weiß)
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(text, xPos, top - 17);
                        ctx.restore();
                    }
                }
            }
        };

        growthChart = new Chart(ctx, {
            type: 'line',
            plugins: [verticalLinePlugin],
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
                                size: 14
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
                                size: 14
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
