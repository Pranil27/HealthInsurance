const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const axios = require('axios');

const payRoute = require("./Routes/pay.routes.js");

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');
const { sha256 } = require('@hyperledger/fabric-gateway/dist/hash/hashes.js');

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

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-Width, Content-Type, Accept"
	);
	next();
})

let ccp, wallet, gateway, caClient;

app.use("/payment", payRoute);

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
		const username = req.body.email;
		console.log("work");
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
			const saltRounds = 10;

			// Hash the password
			const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

			//console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID, color, owner, size, and appraisedValue arguments');
			if (req.body.role === 'Client') {
				result = await contract.submitTransaction('RegisterClient', req.body.email,
					req.body.username, req.body.dob, req.body.mobile,
					req.body.role, hashedPassword);
			} else if (req.body.role === 'Hospital') {
				result = await contract.submitTransaction('RegisterHospital', req.body.email,
					req.body.username, req.body.address, req.body.mobile,
					req.body.role, hashedPassword);
			} else if(req.body.role === 'Insurer'){
				result = await contract.submitTransaction('RegisterInsuranceProvider', req.body.email,
					req.body.username, req.body.merchantID, req.body.address, req.body.mobile,
					req.body.role, hashedPassword);
			}
			else {
				res.status(500).json({message: "Choose a role"});
			}

			//console.log('*** Result: committed');
			if (`${result}` !== '') {
				console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			}
			res.json({ success: true });
		} finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}


	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Login endpoint for authenticating and authorizing the user
app.post('/login', async (req, res) => {
	try {
		const username = req.body.email;
		console.log(`Looking for user identity: ${username}`);
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
			var result2 = JSON.parse(prettyJSONString(result.toString()));

			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			console.log(result2);
			const passwordMatch = await bcrypt.compare(req.body.password, result2.Password);
			if (passwordMatch) {
				res.json({ success: true, role: result2.Role });
			} else {
				res.json("Incorrect Password");
			}
			//console.log(result2);
		} finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
		// console.log(result2);

		// if (!passwordMatch) {
		//     throw new Error('Invalid password');
		// }
		// if(!result2.ID && result2.ID === username )
		// res.json({success:true,role:result2.Role});
		// else
		// res.json("Incorrect Password");
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});


app.post('/getUserDetails', async (req, res) => {
	try {
		const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: req.body.email,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
			console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
			let result = await contract.evaluateTransaction('ReadAsset', req.body.email);
			var result2 = JSON.parse(prettyJSONString(result.toString()));

			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			//console.log(result2);
		} finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
		res.json(result2);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/registerPolicy', async (req, res) => {
	try {
		const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: req.body.email,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});


			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
			console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
			const result = await contract.submitTransaction('RegisterPolicy',
				req.body.id, req.body.email,
				req.body.username, req.body.duration, req.body.premium,
				req.body.hospitals, req.body.amount);
			var result2 = JSON.parse(prettyJSONString(result.toString()));

			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			//console.log(result2);
		} finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
		res.json(result2);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/getPolicies', async (req, res) => {
	try {
		const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: req.body.email,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});


			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
			console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
			let result = await contract.evaluateTransaction('GetAllPolicies');

			var result2 = JSON.parse(prettyJSONString(result.toString()));

			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			//console.log(result2);
		} finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
		res.json(result2);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/issuePolicy', async (req, res) => {
	const gateway = new Gateway();

	try {
		// setup the gateway instance
		// The user will now be able to create connections to the fabric network and be able to
		// submit transactions and query. All transactions submitted by this gateway will be
		// signed by this user using the credentials stored in the wallet.
		await gateway.connect(ccp, {
			wallet,
			identity: req.body.email,
			discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
		});

		// Build a network instance based on the channel where the smart contract is deployed
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(chaincodeName);
		let result = await contract.evaluateTransaction('GetPolicy', req.body.policy); 
		res.send(result);

		if (!result) return res.json({ message: "Policy not available" });

		var result2 = JSON.parse(prettyJSONString(result.toString()));
		console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID, color, owner, size, and appraisedValue arguments');
		let result3 = await contract.submitTransaction('IssuePolicy', req.body.email + "_" + req.body.policy,
			req.body.email, req.body.policy, req.body.nominee, req.body.aadhar, req.body.relation, req.body.mobile,
			result2.Duration, result2.Premium, 0, parseInt(result2.Duration) * 12, result2.Amount);

		//console.log('*** Result: committed');
		if (`${result3}` !== '') {
			console.log(`*** Result: ${prettyJSONString(result3.toString())}`);
		}
	} finally {
		// Disconnect from the gateway when the application is closing
		// This will close all connections to the network
		gateway.disconnect();
	}
	res.json({ success: true });


});

app.post('/myPolicies', async (req, res) => {
	try {
		const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: req.body.email,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});


			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
			console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
			let result = await contract.evaluateTransaction('GetMyPolicies', req.body.email);

			var result2 = JSON.parse(prettyJSONString(result.toString()));

			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			//console.log(result2);
		} finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
		res.json(result2);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
})


app.post('/insurerPolicies', async (req, res) => {
	try {
		const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: req.body.email,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});


			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
			console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
			let result = await contract.evaluateTransaction('GetInsurerPolicies', req.body.email);

			var result2 = JSON.parse(prettyJSONString(result.toString()));

			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			//console.log(result2);
		} finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
		res.json(result2);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
})

app.post('/payPremium', async (req, res) => {
    const gateway = new Gateway();
    try {
        await gateway.connect(ccp, {
            wallet,
            identity: req.body.email,
            discovery: { enabled: true, asLocalhost: true }
        });

        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        const policyDetails = await contract.evaluateTransaction('GetPolicy', req.body.policy);
        const policy = JSON.parse(policyDetails.toString());

        if (!policy || !policy.Premium) {
            return res.status(404).json({ message: "Policy not found or premium not defined" });
        }

        const insurerDetails = await contract.evaluateTransaction('GetInsuranceCompanyInfo', "insurer1@gmail.com");
        const insurer = JSON.parse(insurerDetails.toString());

        if (!insurer) {
            return res.status(404).json({ message: "Insurer not found" });
        }

        const merchantID = "PGTESTPAYUAT86";
        const premiumAmountInCents = policy.Premium;

        const response = await axios.get('http://localhost:5000/payment/pay', {
            params: {
                merchantID: merchantID,
                premiumAmountInCents: premiumAmountInCents
            }
        });


		const redirectInfo = response.data;
        if (redirectInfo && redirectInfo.url) {
            // Simulate a redirect in Thunder Client
            return res.json({ redirectUrl: redirectInfo.url });
        } else {
            return res.status(500).json({ message: "Error initiating payment" });
        }

        if (response.data === "SUCCESS") {
            let result3 = await contract.submitTransaction('PayPremium', 'TXN_' + req.body.email + '_' + req.body.policy);

            if (`${result3}` !== '') {
                console.log(`*** Result: ${prettyJSONString(result3.toString())}`);
            }
            return res.status(200).json({ message: "Premium Paid." });
        } else {
            return res.status(500).json({ message: "Internal Server Error." });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error." });
    } finally {
        gateway.disconnect();
    }
});


// Start the server
app.listen(5000, () => {
	console.log(`Server running on port: 5000`);
});
