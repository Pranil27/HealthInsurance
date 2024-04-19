const express = require('express');
const bodyParser = require('body-parser');

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = process.env.CHANNEL_NAME || 'mychannel';
const chaincodeName = process.env.CHAINCODE_NAME || 'basic';

const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');

function prettyJSONString(inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
}

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use((req,res,next) => {
    res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-Width, Content-Type, Accept"
    );
    next();
})

let ccp, wallet, gateway,caClient;

// Load necessary configurations and setup wallet and CA client
async function initialize() {
    ccp = buildCCPOrg1();
    caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
    wallet = await buildWallet(Wallets, walletPath);

    await enrollAdmin(caClient, wallet, mspOrg1);
}

initialize(); // Initialize the application

// Signup endpoint for registering a new user
app.post('/signup', async (req, res) => {
    try {
        const username = req.body.username;
        await registerAndEnrollUser(caClient, wallet, mspOrg1, username, 'org1.department1');
        const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: username,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
            console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID, color, owner, size, and appraisedValue arguments');
			result = await contract.submitTransaction('RegisterClient', req.body.email, req.body.username, req.body.dob, req.body.mobile, req.body.password);
			console.log('*** Result: committed');
			if (`${result}` !== '') {
				console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			}
        }finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
        res.json({success:true});

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login endpoint for authenticating and authorizing the user
app.post('/login', async (req, res) => {
    try {
        const username = req.body.username;
        const userIdentity = await wallet.get(username);
        if (!userIdentity) {
            res.status(401).json("User not found. Please register first!");
            return;
        }
        const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: username,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
            console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
			let result = await contract.evaluateTransaction('ReadAsset', req.body.email);
            var result2=JSON.parse(prettyJSONString(result.toString()));
            
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
           //console.log(result2);
        }finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
        console.log(result2.Password);
        if(result2.Password === req.body.password)
        res.json({success:true});
        else
        res.json("Incorrect Password");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/getUserDetails', async(req,res) => {
    try{
    const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: req.body.username,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
            console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
			let result = await contract.evaluateTransaction('ReadAsset', req.body.email);
            var result2=JSON.parse(prettyJSONString(result.toString()));
            
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
           //console.log(result2);
        }finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
        res.json(result2);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// Start the server
app.listen(5000, () => {
    console.log(`Server running on port: 5000`);
});
