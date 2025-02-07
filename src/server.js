const express = require('express');
const speedTest = require('speedtest-net');
const fs = require('fs');
const path = require('path');

const app = express();
const resultsFilePath = path.join(__dirname, 'results.json');

// Middleware
app.use(express.json());
app.use('/speedtest', express.static('public'));

// Route to run speed test
app.get('/speedtest/api/test', async (req, res) => {
    try {
        const result = await speedTest({ acceptLicense: true, acceptGdpr: true });
        const testResult = {
            timestamp: new Date(),
            downloadSpeed: result.download.bandwidth / 125000, // Convert to Mbps
            uploadSpeed: result.upload.bandwidth / 125000, // Convert to Mbps
            ping: result.ping.latency
        };

        // Save result to JSON file
        fs.readFile(resultsFilePath, (err, data) => {
            if (err) {
                fs.writeFile(resultsFilePath, JSON.stringify([testResult], null, 2), () => {});
            } else {
                const results = JSON.parse(data);
                results.push(testResult);
                fs.writeFile(resultsFilePath, JSON.stringify(results, null, 2), () => {});
            }
        });

        res.json(testResult);
    } catch (error) {
        console.error('Speed test failed:', error);
        res.status(500).json({ error: 'Speed test failed' });
    }
});

// Route to get results
app.get('/api/results', (req, res) => {
    fs.readFile(resultsFilePath, (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Could not read results' });
        }
        res.json(JSON.parse(data));
    });
});

// Route to run speed test
app.get('/api/test', async (req, res) => {
    // Your existing speed test logic
});

// Start the server on port 80
const PORT = 80;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/speedtest`);
});
