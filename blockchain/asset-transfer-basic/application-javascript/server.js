const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const axios = require('axios');
const cors = require('cors');

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const stripe = require('stripe')('sk_test_51PTVxBP9R43T6Z9PC1WyREOJy7nikD60OXjcoI9VUoPdTtHcgRAZKoX7WWV9AqFLCwEsOqmrkYPtWkezvdr2rcYj00vIllbO2h');

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
app.use(cookieParser());

// app.use((req, res, next) => {
// 	res.header("Access-Control-Allow-Origin", "http://localhost:3000");
// 	res.header("Access-Control-Allow-Credentials", "true");
//  	res.header(	"Access-Control-Allow-Headers",
// 		"Origin, X-Requested-Width, Content-Type, Accept"
// 	);
// 	next();
// });
const corsOptions = {
	origin: 'http://localhost:3000', // your frontend URL
	methods: 'GET,POST,PUT,DELETE',
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// app.use((req,response,next) => {
// 	response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
// response.setHeader("Access-Control-Allow-Credentials", "true");
// response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT");
// response.setHeader("Access-Control-Allow-Headers", " Origin,Accept, X-Requested-With, Content-Type");
// next();
// })


let ccp, wallet, gateway, caClient;

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

		await registerAndEnrollUser(caClient, wallet, mspOrg1, username, 'org1.department1');
		const gateway = new Gateway();
		//      console.log("work");
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
			console.log(req.body.role);
			//console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID, color, owner, size, and appraisedValue arguments');
			if (req.body.role === 'client') {
				console.log("aaya");
				result = await contract.submitTransaction('RegisterClient', req.body.email,
					req.body.username, req.body.dob, req.body.mobile,
					req.body.role, hashedPassword);
				console.log("gaya");
			} else if (req.body.role === 'Hospital') {
				result = await contract.submitTransaction('RegisterHospital', req.body.email,
					req.body.username, req.body.address, req.body.mobile,
					req.body.role, hashedPassword);

			} else {
				result = await contract.submitTransaction('RegisterInsuranceProvider', req.body.email,
					req.body.username, req.body.merchantID, req.body.address, req.body.mobile,
					req.body.role, hashedPassword);

			}
			// else {
			// 	res.status(500).json({message: "Choose a role"});
			// }

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
		console.log(error);
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
			console.log(process.env.JWT_SECRET);
			const passwordMatch = await bcrypt.compare(req.body.password, result2.Password);
			if (passwordMatch) {
				let token = jwt.sign({ email: req.body.email, role: result2.Role }, process.env.JWT_SECRET);
				console.log(token);
				res.cookie("token", token, {
					httpOnly: true,
					sameSite: 'none', // Set to 'none' for cross-origin requests
					secure: true // Require HTTPS in production
				});
				res.json({ success: true, token: token, role: result2.Role });
			} else {
				res.status(404).json("Incorrect Password");
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


app.get('/getUserDetails', isLoggedIn, async (req, res) => {
	try {
		const gateway = new Gateway();

		try {
			console.log(req.user.email);
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: req.user.email,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
			console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
			let result = await contract.evaluateTransaction('ReadAsset', req.user.email);
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

app.post('/registerPolicy', isLoggedIn, async (req, res) => {
	try {
		const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: req.user.email,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});


			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
			console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
			const result = await contract.submitTransaction('RegisterPolicy',
				req.body.id, req.user.email,
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

app.get('/getPolicies', isLoggedIn, async (req, res) => {
	try {
		const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: req.user.email,
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
			console.log(result2);
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

app.post('/issuePolicy', isLoggedIn, async (req, res) => {
	const gateway = new Gateway();

	try {
		// setup the gateway instance
		// The user will now be able to create connections to the fabric network and be able to
		// submit transactions and query. All transactions submitted by this gateway will be
		// signed by this user using the credentials stored in the wallet.
		await gateway.connect(ccp, {
			wallet,
			identity: req.user.email,
			discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
		});

		// Build a network instance based on the channel where the smart contract is deployed
		const network = await gateway.getNetwork(channelName);

		// Get the contract from the network.
		const contract = network.getContract(chaincodeName);
		let result = await contract.evaluateTransaction('GetPolicy', req.body.policy);
		// res.send(result);

		if (!result) return res.json({ message: "Policy not available" });

		var result2 = JSON.parse(prettyJSONString(result.toString()));
		console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID, color, owner, size, and appraisedValue arguments');
		let result3 = await contract.submitTransaction('IssuePolicy', req.user.email + "_" + req.body.policy,
			req.user.email, req.body.policy, req.body.nominee, req.body.aadhar, req.body.relation, req.body.mobile,
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

app.get('/myPolicies', isLoggedIn, async (req, res) => {
	try {
		const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: req.user.email,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});


			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
			console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
			let result = await contract.evaluateTransaction('GetMyPolicies', req.user.email);

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

app.post('/insurerPolicies', isLoggedIn, async (req, res) => {
	try {
		const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: req.user.email,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});


			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
			console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
			let result = await contract.evaluateTransaction('GetInsurerPolicies', req.user.email);

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

async function callSmartContract(paymentNumber, req) {
    try {
        const gateway = new Gateway();

        try {
            // Setup the gateway instance
            await gateway.connect(ccp, {
                wallet,
                identity: "policyholder1@gmail.com", // Ensure `req.user.email` is available or passed as a parameter
                discovery: { enabled: true, asLocalhost: true }
            });

            // Build a network instance based on the channel where the smart contract is deployed
            const network = await gateway.getNetwork(channelName);

            // Get the contract from the network
            const contract = network.getContract(chaincodeName);
            console.log('\n--> Submit Transaction: logPayment');
            const result = await contract.submitTransaction('logPayment', paymentNumber);
            console.log('Transaction has been submitted');
            console.log(result.toString());

            // Return the result back to the caller
            return { success: true, result: result.toString() };

        } finally {
            // Disconnect from the gateway
            gateway.disconnect();
        }
    } catch (error) {
        // Return error back to the caller
        throw new Error(error.message);
    }
}



//Route to create a payment intent
app.post('/create-payment-intent', async (req, res) => {
    try {
        let { amount } = req.body; // amount should be in cents
		amount = Number(amount);
		if (!amount) {
            throw new Error('Amount is required');
        }
        if (typeof amount !== 'number' || amount <= 0) {
            throw new Error('Amount must be a positive number');
        }
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
		console.log(error.message)
        res.status(500).json({ "message" : "hello" });
    }
});

app.post('/verify-payment', async (req, res) => {
	const { paymentIntentId } = req.body;
	try {
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

		if (paymentIntent.status === 'succeeded') {
			const paymentNumber = 42;
			await callSmartContract(paymentNumber, req, res);

			res.send('Payment verified and smart contract called');
		}
		else {
			res.status(400).send('Payment not successful');
		}
	} catch (error) {
		console.error(error);
		res.status(500).send('Error verifying payment');
	}
})

// app.post('/payPremium',isLoggedIn, async (req, res) => {
//     const gateway = new Gateway();
//     try {
//         await gateway.connect(ccp, {
//             wallet,
//             identity: req.user.email,
//             discovery: { enabled: true, asLocalhost: true }
//         });

//         const network = await gateway.getNetwork(channelName);
//         const contract = network.getContract(chaincodeName);

//         const policyDetails = await contract.evaluateTransaction('GetPolicy', req.body.policy);
//         const policy = JSON.parse(policyDetails.toString());

//         if (!policy || !policy.Premium) {
//             return res.status(404).json({ message: "Policy not found or premium not defined" });
//         }

//         const insurerDetails = await contract.evaluateTransaction('GetInsuranceCompanyInfo', "insurer1@gmail.com");
//         const insurer = JSON.parse(insurerDetails.toString());

//         if (!insurer) {
//             return res.status(404).json({ message: "Insurer not found" });
//         }

//         const merchantID = "PGTESTPAYUAT86";
//         const premiumAmountInCents = policy.Premium;

//         const response = await axios.get('http://localhost:5000/payment/pay', {
//             params: {
//                 merchantID: merchantID,
//                 premiumAmountInCents: premiumAmountInCents
//             }
//         });


// 		const redirectInfo = response.data;
//         if (redirectInfo && redirectInfo.url) {
//             // Simulate a redirect in Thunder Client
//             return res.json({ redirectUrl: redirectInfo.url });
//         } else {
//             return res.status(500).json({ message: "Error initiating payment" });
//         }

//         if (response.data === "SUCCESS") {
//             let result3 = await contract.submitTransaction('PayPremium', 'TXN_' + req.body.email + '_' + req.body.policy);

//             if (`${result3}` !== '') {
//                 console.log(`*** Result: ${prettyJSONString(result3.toString())}`);
//             }
//             return res.status(200).json({ message: "Premium Paid." });
//         } else {
//             return res.status(500).json({ message: "Internal Server Error." });
//         }

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Internal Server Error." });
//     } finally {
//         gateway.disconnect();
//     }
// });

app.get('/logout', async (req, res) => {
	res.cookie("token", "", {
		httpOnly: true,
		sameSite: 'none', // Set to 'none' for cross-origin requests
		secure: true // Require HTTPS in production
	});
	res.status(204).json({ message: "Logged out!" });
});


function isLoggedIn(req, res, next) {
	var token = req.cookies.token;
	console.log(req.cookies);
	if (token === undefined || token === "") { res.status(401).send("not found"); return; }
	else {
		var decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log(decoded.email);
		console.log(decoded.role);
		req.user = decoded;
	}
	next();
}

// Start the server
app.listen(5000, () => {
	console.log(`Server running on port: 5000`);
});
