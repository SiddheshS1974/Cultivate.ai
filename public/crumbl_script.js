document.addEventListener('DOMContentLoaded', () => {
    // Sample Data for Charts
    const sampleData = {
        sentiments: {
            positive: 19,
            negative: 35,
            neutral: 11,
        },
        sentimentOverTime: {
            labels: ['7/16/24', '7/17/24', '7/18/24', '7/19/24', '7/20/24', '7/21/24', '7/22/24', '7/23/24'],
            positive: [2, 1, 4, 3, 3, 3, 2, 1],
            negative: [4, 7, 8, 3, 7, 2, 3, 0],
            neutral: [3, 1, 3, 0, 3, 1, 0, 0]
        }
    };

    // Initialize Pie Chart
    const ctx = document.getElementById('sentimentChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Positive', 'Negative', 'Neutral'],
            datasets: [{
                data: [
                    sampleData.sentiments.positive,
                    sampleData.sentiments.negative,
                    sampleData.sentiments.neutral
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(201, 203, 207, 0.6)'
                ]
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Overall Sentiment'
                }
            }
        }
    });

    // Initialize Line Chart
    const lineCtx = document.getElementById('sentimentLineChart').getContext('2d');
    new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: sampleData.sentimentOverTime.labels,
            datasets: [
                {
                    label: 'Positive',
                    data: sampleData.sentimentOverTime.positive,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true
                },
                {
                    label: 'Negative',
                    data: sampleData.sentimentOverTime.negative,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true
                },
                {
                    label: 'Neutral',
                    data: sampleData.sentimentOverTime.neutral,
                    borderColor: 'rgba(201, 203, 207, 1)',
                    backgroundColor: 'rgba(201, 203, 207, 0.2)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Sentiments Over Time'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Days'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Sentiment Score'
                    }
                }
            }
        }
    });

    // Populate word lists
    

    // Download report
    document.getElementById('downloadReport').addEventListener('click', () => {
        const report = {
            sentiments: sampleData.sentiments,
            words: sampleData.words,
            sentimentOverTime: sampleData.sentimentOverTime
        };
        const reportBlob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(reportBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sentiment_report.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Load CSV data and redirect to twitter.html
    document.getElementById('seeTopReviews').addEventListener('click', () => {
        fetch('kool.csv')
            .then(response => response.text())
            .then(data => {
                localStorage.setItem('csvData', data);
                window.location.href = 'crumbl_reviews.html';
            })
            .catch(error => console.error('Error fetching the CSV file:', error));
    });
});

// Function for demoC
function demoC() {
    const csvData = localStorage.getItem('csvData');

    if (csvData) {
        Papa.parse(csvData, {
            skipEmptyLines: true,
            complete: results => {
                const table = document.getElementById('demoC');
                table.innerHTML = "";

                // Create table header
                const thead = table.createTHead();
                const tr = thead.insertRow();
                results.data[0].forEach(cell => {
                    const th = document.createElement('th');
                    th.innerText = cell;
                    tr.appendChild(th);
                });

                // Create table body
                const tbody = table.createTBody();
                for (let i = 1; i < results.data.length; i++) {
                    const row = results.data[i];
                    const tr = tbody.insertRow();
                    row.forEach(cell => {
                        const td = tr.insertCell();
                        td.innerText = cell;
                    });
                }
            },
            error: (error) => {
                console.error('Error parsing CSV data:', error);
            }
        });
    } else {
        alert('No CSV data found.');
    }
}

// Call demoC function when the page loads if on twitter.html
if (window.location.pathname.includes('crumbl_reviews.html')) {
    window.onload = demoC;
}

// Code for sentiment analysis button
document.getElementById('createSentimentAnalysisButton').addEventListener('click', () => {
    window.location.href = 'crumbl_sentiment.html';
    runPythonScript((result) => {
        console.log('Python script result:', result);
        // Do something with the result
        document.getElementById('output').textContent = JSON.stringify(result, null, 2);
    });
});

// Code to connect Javascript to Python
const { exec } = require('child_process'); // This line won't work in a browser environment
function runPythonScript(callback) {
    exec('SentimentModel.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
        }
        const result = JSON.parse(stdout);
        callback(result);
    });
}










