const rpc = require('discord-rpc');
const clientId = '1133824701555294279'; // Replace with your actual Client ID

// Create the client
const rpcClient = new rpc.Client({ transport: 'ipc' });

// Once the client is ready, set the Rich Presence
rpcClient.on('ready', () => {
    rpcClient.setActivity({
        state: 'Playing Solo',
        details: 'Competitive',
        startTimestamp: new Date(),
        largeImageKey: 'numbani', // Key of the image uploaded in your Discord application
        largeImageText: 'Numbani',
        smallImageKey: 'rogue', // Key of the image uploaded in your Discord application
        smallImageText: 'Rogue - Level 100',
        partyId: 'ae488379-351d-4a4f-ad32-2b9b01c91657',
        partySize: 1,
        partyMax: 5,
        joinSecret: 'MTI4NzM0OjFpMmhuZToxMjMxMjM='
    });

    console.log('Rich Presence is now active');
});

// Log the client in
rpcClient.login({ clientId }).catch(console.error);
