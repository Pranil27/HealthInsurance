const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const axios = require('axios');
const cors = require('cors');

//const payRoute = require("./Routes/pay.routes.js");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

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

const snarkjs = require("snarkjs");
const fs = require("fs");

// Load or generate proving/verification keys
const provingKey = fs.readFileSync('circuit_final.zkey');
const verificationKey = JSON.parse(fs.readFileSync('verification_key.json', 'utf8'));


// Generate proof using snarkjs
async function generateProof(inputData) {
	console.log(inputData);
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputData, './circuit_js/circuit.wasm', provingKey);
    return { proof, publicSignals };
}

// Verify proof
async function verifyProof(proof, publicSignals) {
    const verificationResult = await snarkjs.groth16.verify(verificationKey, publicSignals, proof);
    return verificationResult;
}




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

///app.use("/payment", payRoute);

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
        const role = req.body.role;

        // Register and enroll the user with the role attribute
        await registerAndEnrollUser(caClient, wallet, mspOrg1, username, 'org1.department1', role);

        const gateway = new Gateway();

        try {
            // Connect to the gateway
            await gateway.connect(ccp, {
                wallet,
                identity: username,
                discovery: { enabled: true, asLocalhost: true }
            });

            // Get the network and contract
            const network = await gateway.getNetwork(channelName);
            const contract = network.getContract(chaincodeName);

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

            // Register the user in the ledger with the role and hashed password
            let result;
            if (role === 'client') {
                result = await contract.submitTransaction('RegisterClient', req.body.email, 
                    req.body.username, req.body.dob, req.body.mobile, 
                    req.body.role, hashedPassword);
            } else if (role === 'Hospital') {
                result = await contract.submitTransaction('RegisterHospital', req.body.email, 
                    req.body.username, req.body.address, req.body.mobile, 
                    req.body.role, hashedPassword);
            } else {
                result = await contract.submitTransaction('RegisterInsuranceProvider', req.body.email, 
                    req.body.username, req.body.address, req.body.mobile, 
                    req.body.role, hashedPassword);
            }

            // Log the result
            if (`${result}` !== '') {
                console.log(`*** Result: ${prettyJSONString(result.toString())}`);
            }
			const inputData = { a: 3, b: 5 };

		console.log(provingKey);
		console.log(verificationKey);	
    // Generate proof
    const { proof, publicSignals } = await generateProof(inputData);
	console.log(proof);
	console.log(`Public Signal: ${publicSignals}`);


    // Verify proof
    const isValid = await verifyProof(proof, publicSignals);
	console.log(isValid);
    
    if (isValid) {
        // Submit transaction to Fabric
		res.json({ success: true });
    } else {
        return res.status(400).send('Invalid proof');
    }

            

        } finally {
            // Disconnect from the gateway
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

		// Check if user exists in the wallet
		if (!userIdentity) {
			res.status(401).json("User not found. Please register first!");
			return;
		}

		const gateway = new Gateway();

		try {
			// Connect to the Fabric network as the user
			await gateway.connect(ccp, {
				wallet,
				identity: username,
				discovery: { enabled: true, asLocalhost: true } // use asLocalhost for local Fabric network
			});

			// Get the network and contract
			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			console.log(`name of chaincode: ${chaincodeName}`);

			// Get role from user's certificate
			const clientIdentity = gateway.getIdentity();
			console.log(`name of identity: ${clientIdentity}`);
			const userRoleFromCert = clientIdentity.getAttributeValue('role');
			console.log(`Role from certificate: ${userRoleFromCert}`);

			// Get user data (including role) from the ledger
			console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
			const result = await contract.evaluateTransaction('ReadAsset', req.body.email);
			const result2 = JSON.parse(prettyJSONString(result.toString()));

			// Log the result from the ledger
			console.log(`*** Result from ledger: ${prettyJSONString(result.toString())}`);
			console.log(result2);

			// Check if the provided password matches the stored password (from ledger)
			const passwordMatch = await bcrypt.compare(req.body.password, result2.Password);
			if (passwordMatch) {
				// Generate JWT token
				const token = jwt.sign({ email: req.body.email, role: result2.Role }, process.env.JWT_SECRET);
				console.log(`Generated JWT: ${token}`);

				// Set the JWT as a cookie
				res.cookie("token", token, {
					httpOnly: true,
					sameSite: 'none', // Set to 'none' for cross-origin requests
					secure: true // Require HTTPS in production
				});

				// Print role information to the console
				console.log(`User role from ledger: ${result2.Role}`);
				
				// Send success response with token and role
				res.json({ success: true, token: token, role: result2.Role });
			} else {
				// Incorrect password response
				res.status(404).json("Incorrect Password");
			}

		} finally {
			// Disconnect from the gateway
			gateway.disconnect();
		}

	} catch (error) {
		// Handle errors
		res.status(500).json({ error: error.message });
	}
});


app.get('/getUserDetails',isLoggedIn, async (req, res) => {
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

app.post('/registerPolicy',isLoggedIn, async (req, res) => {
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
		res.json({result2,success:"true"});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.get('/policies',isLoggedIn, async (req, res) => {
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
			//let result = await contract.evaluateTransaction('GetMyPolicies', req.user.email);
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
})

app.post('/issuePolicy',isLoggedIn, async (req, res) => {
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
		res.send(result);

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

app.get('/myPolicies',isLoggedIn, async (req, res) => {
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
			//let result = await contract.evaluateTransaction('GetAllPolicies');
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


app.get('/insurerPolicies',isLoggedIn, async (req, res) => {
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

app.post('/payPremium',isLoggedIn, async (req, res) => {
    const gateway = new Gateway();
    try {
        await gateway.connect(ccp, {
            wallet,
            identity: req.user.email,
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

app.get('/logout',async(req,res) => {
	res.cookie("token","",{
		httpOnly: true,
		sameSite: 'none', // Set to 'none' for cross-origin requests
		secure: true // Require HTTPS in production
	  });
	res.status(204).json({message:"Logged out!"});
});


function isLoggedIn(req,res,next){
	var token = req.cookies.token;
	console.log(req.cookies);
	if(token === undefined || token === "") {res.status(401).send("not found");return;}
	else{
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
