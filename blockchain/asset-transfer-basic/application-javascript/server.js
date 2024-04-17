const express = require('express');
const bodyParser = require('body-parser');

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');
//const {clientCA} = require('./app.js');

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
}))


app.post('/signup', async (req,res) => {
    console.log(req.body.username);
    const ccp = buildCCPOrg1();
    caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
    const wallet = await buildWallet(Wallets, walletPath);

    await enrollAdmin(caClient, wallet, mspOrg1);

    await registerAndEnrollUser(caClient, wallet, mspOrg1, req.body.username, 'org1.department1');
    res.json("It's Working");
})





app.listen(5000, () => {
    console.log(`Server running on port: 5000`);
})
       

