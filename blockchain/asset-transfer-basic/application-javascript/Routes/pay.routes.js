const express = require('express');
const uniqid = require('uniqid');
const sha256 = require('sha256');
const axios = require('axios');

const router = express.Router();

const MERCHANT_ID = "PGTESTPAYUAT86";
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const SALT_INDEX = 1;
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const APP_BE_URL = "http://localhost:5000"; // our application
const payEndpoint = "/pg/v1/pay";


router.get("/pay", (req, res) => {
    // Initiate a payment

    // Transaction amount

    // User ID is the ID of the user present in our application DB
    let userId = "MUID123";

    // Generate a unique merchant transaction ID for each transaction
    let merchantTransactionId = uniqid();

    // redirect url => phonePe will redirect the user to this url once payment is completed. It will be a GET request, since redirectMode is "REDIRECT"
    let normalPayLoad = {
        merchantId: MERCHANT_ID, //* PHONEPE_MERCHANT_ID . Unique for each account (private)
        merchantTransactionId: merchantTransactionId,
        merchantUserId: userId,
        amount: 10000, // converting to paise
        redirectUrl: `${APP_BE_URL}/payment/redirect-url/${merchantTransactionId}`,
        redirectMode: "REDIRECT",
        mobileNumber: "9999999999",
        paymentInstrument: {
            type: "PAY_PAGE",
        },
    };

    // make base64 encoded payload
    let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
    let base64EncodedPayload = bufferObj.toString("base64");

    // X-VERIFY => SHA256(base64EncodedPayload + "/pg/v1/pay" + SALT_KEY) + ### + SALT_INDEX
    let string = base64EncodedPayload + payEndpoint + SALT_KEY;
    let sha256_val = sha256(string);
    let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

    const options = {
        method: "POST",
        url: `${PHONE_PE_HOST_URL}${payEndpoint}`,
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-VERIFY": xVerifyChecksum
        },
        data: {
            request: base64EncodedPayload
        },
    };
    axios
        .request(options)
        .then(function (response) {
            console.log(response.data);
            const url = response.data.data.instrumentResponse.redirectInfo.url;
            res.redirect(url);
            // res.send(url);
        })
        .catch(function (error) {
            console.error(error);
        });
});

router.get("/redirect-url/:merchantTransactionID", (req, res) => {
    const { merchantTransactionID } = req.params;
    console.log("merchantTransactionID ", merchantTransactionID);
    if (merchantTransactionID) {
        const xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionID}` + SALT_KEY) + "###" + SALT_INDEX;
        const options = {
            method: 'get',
            url: `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionID}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                "X-MERCHANT-ID" : merchantTransactionID,
                "X-VERIFY" : xVerify,
            },

        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                if(response.data.code === "PAYMENT_SUCCESS"){
                    // redirect the user to front end success page 
                }
                else if(response.data.code === "PAYMENT_ERROR"){
                    // redirect the user to front end error page
                }
                else{
                    // pending page
                }
                res.send(response.data);
            })
            .catch(function (error) {
                console.error(error);
            });
        // res.send({ merchantTransactionID });
    }
    else {
        res.send({ error: "Error" });
    }
})

module.exports = router;