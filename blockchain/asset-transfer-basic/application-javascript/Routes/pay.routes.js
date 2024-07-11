const express = require('express');
const uniqid = require('uniqid');
const sha256 = require('sha256');
const axios = require('axios');

const router = express.Router();

// const MERCHANT_ID = "PGTESTPAYUAT86";
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const SALT_INDEX = 1;
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const APP_BE_URL = "http://localhost:5000"; // our application
const payEndpoint = "/pg/v1/pay";


router.get("/pay", (req, res) => {
    const MERCHANT_ID = req.query.merchantID;
    const premiumAmountInCents = req.query.premiumAmountInCents;

    let userId = "MUID123";
    const merchantTransactionId = uniqid();

    let normalPayLoad = {
        merchantId: "PGTESTPAYUAT86",
        merchantTransactionId: merchantTransactionId,
        merchantUserId: userId,
        amount: 100000,
        redirectUrl: `${APP_BE_URL}/payment/redirect-url/${merchantTransactionId}/PGTESTPAYUAT86`,
        redirectMode: "REDIRECT",
        callbackUrl: `${APP_BE_URL}/payment/callback`,
        mobileNumber: "9999999999",
        paymentInstrument: {
            type: "PAY_PAGE",
        },
    };

    let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
    let base64EncodedPayload = bufferObj.toString("base64");

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
            console.log("response.data ",response.data);
            console.log("response.data.data ",response.data.data);
            console.log("response.data.data.instrumentResponse",response.data.data.instrumentResponse);
            if (response.data && response.data.data && response.data.data.instrumentResponse) {
                const redirectInfo = response.data.data.instrumentResponse.redirectInfo;
                return res.json(redirectInfo);
            } else {
                return res.status(500).send("Error initiating payment");
            }
        })
        .catch(function (error) {
            console.error(error);
            if (!res.headersSent) {
                return res.status(500).send("Error initiating payment");
            }
        });
});

router.get("/redirect-url/:merchantTransactionID/:MERCHANT_ID", (req, res) => {
    const { merchantTransactionID, MERCHANT_ID } = req.params;
    console.log("merchantTransactionID ", merchantTransactionID);
    if (merchantTransactionID) {
        const xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionID}` + SALT_KEY) + "###" + SALT_INDEX;
        const options = {
            method: 'get',
            url: `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionID}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                "X-MERCHANT-ID": merchantTransactionID,
                "X-VERIFY": xVerify,
            },

        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                if (response.data.code === "PAYMENT_SUCCESS") {
                    return res.send("SUCCESS");
                } else if (response.data.code === "PAYMENT_ERROR") {
                    if (!res.headersSent) {
                        return res.status(500).send("ERROR");
                    }
                } else {
                    // Handle pending payment status here if necessary
                }
            })
            .catch(function (error) {
                console.error(error);
                if (!res.headersSent) {
                    return res.status(500).send("Error fetching payment status");
                }
            });
    } else {
        if (!res.headersSent) {
            return res.status(400).send({ error: "Invalid transaction ID" });
        }
    }
});

router.post("/callback", (req,res)=> {
    const {success} = req.body;
    console.log("SUCCESS HOGAYA!", success);
    res.send(success);
})


router.get("/refund", async (req, res) => {
    let normalPayLoad = {
        "merchantId": "PGTESTPAYUAT86",
        "merchantUserId": "MUID123",
        "originalTransactionId": "T2407120302327554464918",
        "merchantTransactionId": "3bpmxwylyhsbrq5",
        "amount": 100000,
        "callbackUrl": "http://localhost:5000/payment/callback"
    }


    let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
    let base64EncodedPayload = bufferObj.toString("base64");

    let string = base64EncodedPayload + payEndpoint + SALT_KEY;
    let sha256_val = sha256(string);
    let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;


    const options = {
        method: 'post',
        url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/refund',
        headers: {
            accept: 'application/json',
            'Content-type': 'application/json',
            'X-VERIFY': xVerifyChecksum
        },
        data: {
            request: base64EncodedPayload
        }
    };
    axios
        .request(options)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.error(error);
        });
})

module.exports = router;