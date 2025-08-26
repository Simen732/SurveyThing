// Results page chart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the results page
    if (!document.querySelector('[data-results-page]')) {
        return;
    }

    // Get results data from the page
    const resultsData = JSON.parse(document.getElementById('results-data').textContent);
    const totalResponses = parseInt(document.getElementById('total-responses').textContent);

    if (totalResponses === 0) {
        return;
    }

    // Create charts for each question
    Object.keys(resultsData).forEach(questionId => {
        const result = resultsData[questionId];
        createChart(questionId, result, totalResponses);
    });
});

function createChart(questionId, result, totalResponses) {
    const canvas = document.getElementById(`chart-${questionId}`);
    if (!canvas) {
        console.error(`Canvas not found for question ${questionId}`);
        return;
    }

    const ctx = canvas.getContext('2d');
    
    // Prepare labels and data
    const labels = [];
    const data = [];
    
    Object.keys(result.responses).forEach(answer => {
        if (result.type === 'rating') {
            labels.push(`${answer} Star${answer === '1' ? '' : 's'}`);
        } else {
            const option = result.options.find(opt => opt.value === answer);
            labels.push(option ? option.text : answer);
        }
        data.push(result.responses[answer]);
    });

    // Chart configuration
    const chartConfig = {
        type: result.type === 'rating' ? 'bar' : 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Responses',
                data: data,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
                ],
                borderColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: result.type !== 'rating'
                }
            }
        }
    };

    // Add scales for rating charts
    if (result.type === 'rating') {
        chartConfig.options.scales = {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        };
    }

    new Chart(ctx, chartConfig);
}