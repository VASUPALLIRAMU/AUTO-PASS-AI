const WebSocket = require('ws');
const axios = require('axios');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.on('message', async (message) => {
        const data = JSON.parse(message);
        
        if (data.type === 'newRequest') {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'newRequest', request: data.request }));
                }
            });
        } else if (data.type === 'statusUpdate') {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'statusUpdate', regNumber: data.regNumber }));
                }
            });
        } else if (data.type === 'sendSMS') {
            // Replace with actual SMS sending logic if needed
            console.log(`Sending SMS to ${data.to}: ${data.message}`);
            ws.send(JSON.stringify({ type: 'smsStatus', message: 'SMS sent successfully' }));
        } else if (data.type === 'sendOTP') {
            try {
                const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
                    authorization: data.apiKey,
                    route: 'otp',
                    numbers: data.to.replace('+91', ''),
                    message: data.message
                });
                console.log(`OTP sent to ${data.to}`);
                ws.send(JSON.stringify({ type: 'otpStatus', message: 'OTP sent successfully' }));
            } catch (error) {
                console.error('Error sending OTP:', error.response ? error.response.data : error.message);
                ws.send(JSON.stringify({ type: 'otpStatus', message: 'Failed to send OTP' }));
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server running on ws://localhost:8080');
