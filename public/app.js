const downloadSpeeds = [];
const uploadSpeeds = [];
const pings = [];

document.getElementById('runTest').addEventListener('click', async () => {
    await runSpeedTest();
    loadHistory();
    setInterval(loadHistory, 60000); // Update history every minute
});

// Automatically run speed test every 30 minutes (1800000 ms)
setInterval(runSpeedTest, 1800000);

async function runSpeedTest() {
    document.getElementById('loading').style.display = 'block'; // Show loading indicator
    const response = await fetch('/api/test');
    const result = await response.json();
    updateStats(result);
    updateGraphs(result);
    loadHistory();
    document.getElementById('loading').style.display = 'none'; // Hide loading indicator
}

function updateStats(result) {
    document.getElementById('downloadSpeed').innerText = `${result.downloadSpeed.toFixed(2)} Mbps`;
    document.getElementById('uploadSpeed').innerText = `${result.uploadSpeed.toFixed(2)} Mbps`;
    document.getElementById('ping').innerText = `${result.ping} ms`;
}

function updateGraphs(result) {
    downloadSpeeds.push(result.downloadSpeed);
    uploadSpeeds.push(result.uploadSpeed);
    pings.push(result.ping);

    if (downloadSpeeds.length > 30) {
        downloadSpeeds.shift();
        uploadSpeeds.shift();
        pings.shift();
    }

    updateChart(downloadChart, downloadSpeeds);
    updateChart(uploadChart, uploadSpeeds);
    updateChart(pingChart, pings);
}

function updateChart(chart, data) {
    chart.data.labels.push('');
    chart.data.datasets[0].data = data;
    chart.update();
}

// Initialize charts
const ctxDownload = document.getElementById('downloadChart').getContext('2d');
const ctxUpload = document.getElementById('uploadChart').getContext('2d');
const ctxPing = document.getElementById('pingChart').getContext('2d');

const downloadChart = new Chart(ctxDownload, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Download Speed (Mbps)',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false
            }
        }
    }
});

const uploadChart = new Chart(ctxUpload, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Upload Speed (Mbps)',
            data: [],
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
            fill: false
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false
            }
        }
    }
});

const pingChart = new Chart(ctxPing, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Ping (ms)',
            data: [],
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            fill: false
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false
            }
        }
    }
});

async function loadHistory() {
    const response = await fetch('/api/results');
    const results = await response.json();
    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = results.map(test => `
        <div class="history-item">
            <span class="material-symbols-rounded">history</span>
            <div>
                <strong>${new Date(test.timestamp).toLocaleString()}</strong><br>
                Download: ${test.downloadSpeed.toFixed(2)} Mbps<br>
                Upload: ${test.uploadSpeed.toFixed(2)} Mbps<br>
                Ping: ${test.ping} ms
            </div>
        </div>
    `).join('');
}
