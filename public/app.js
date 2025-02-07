const downloadSpeeds = [];
const uploadSpeeds = [];
const pings = [];

// Function to initialize graphs with all results
async function initializeGraphs() {
    const response = await fetch('/api/results');
    const results = await response.json();
    if (results.length > 0) {
        // Update graphs with all results
        results.forEach(result => {
            updateGraphs(result);
        });
        // Update the stats with the last result
        const lastResult = results[results.length - 1];
        updateStats(lastResult);
    }
}

// Load history on page load
window.onload = async () => {
    await loadHistory(); // Load history when the page loads
    await initializeGraphs(); // Initialize graphs with all results
};

// Event listener for the run test button
document.getElementById('runTest').addEventListener('click', async () => {
    await runSpeedTest(); // Run the speed test
});

// Automatically run speed test every 30 minutes (1800000 ms)
setInterval(runSpeedTest, 1800000);

// Function to run speed test
async function runSpeedTest() {
    console.log('Running speed test...'); // Log when the speed test is running
    document.getElementById('loading').style.display = 'block'; // Show loading indicator
    try {
        const response = await fetch('/speedtest/api/test'); // Call your server's endpoint
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        const result = await response.json();
        console.log('Speed test result:', result); // Log the result
        
        // Update stats and graphs
        updateStats(result);
        updateGraphs(result);
        // Do not call loadHistory here to avoid reloading history
    } catch (error) {
        console.error('Error during speed test:', error); // Log any errors
    } finally {
        document.getElementById('loading').style.display = 'none'; // Hide loading indicator
    }
}

// Function to load history
async function loadHistory() {
    const response = await fetch('/api/results');
    const results = await response.json();
    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = results.map(test => `
        <div class="history-item">
            <span class="material-symbols-rounded">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                    <path d="M480-120q-126 0-223-76.5T131-392q-4-15 6-27.5t27-14.5q16-2 29 6t18 24q24 90 99 147t170 57q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h70q17 0 28.5 11.5T360-600q0 17-11.5 28.5T320-560H160q-17 0-28.5-11.5T120-600v-160q0-17 11.5-28.5T160-800q17 0 28.5 11.5T200-760v54q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm40-376 100 100q11 11 11 28t-11 28q-11 11-28 11t-28-11L452-452q-6-6-9-13.5t-3-15.5v-159q0-17 11.5-28.5T480-680q17 0 28.5 11.5T520-640v144Z"/>
                </svg>
            </span>
            <div>
                <strong>${new Date(test.timestamp).toLocaleString()}</strong><br>
                Download: ${test.downloadSpeed.toFixed(2)} Mbps<br>
                Upload: ${test.uploadSpeed.toFixed(2)} Mbps<br>
                Ping: ${test.ping} ms
            </div>
        </div>
    `).join('');
}

// Function to update stats
function updateStats(result) {
    document.getElementById('downloadSpeed').innerText = `${result.downloadSpeed.toFixed(2)} Mbps`;
    document.getElementById('uploadSpeed').innerText = `${result.uploadSpeed.toFixed(2)} Mbps`;
    document.getElementById('ping').innerText = `${result.ping} ms`;
}

// Function to update graphs
function updateGraphs(result) {
    downloadSpeeds.push(result.downloadSpeed);
    uploadSpeeds.push(result.uploadSpeed);
    pings.push(result.ping);

    if (downloadSpeeds.length > 30) {
        downloadSpeeds.shift();
        uploadSpeeds.shift();
        pings.shift();
    }

    // Update the charts with the new data
    updateChart(downloadChart, downloadSpeeds);
    updateChart(uploadChart, uploadSpeeds);
    updateChart(pingChart, pings);
}

// Function to update a specific chart
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
