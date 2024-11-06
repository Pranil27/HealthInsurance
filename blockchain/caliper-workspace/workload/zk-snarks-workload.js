'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const axios = require('axios');

class ZkSnarksWorkload extends WorkloadModuleBase {
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        this.url = "http://localhost:5000"; // Update with your server.js URL
    }

    async submitTransaction() {
        // Example input data
        const inputData = { a: 5, b: 3 };

        // Generate proof and submit it in a transaction request
        try {
            const response = await axios.post(`${this.url}/submitTransaction`, inputData);
            if (response.status === 200) {
                console.log("Transaction submitted with valid zk-SNARK proof");
            }
        } catch (error) {
            console.error("Transaction submission failed:", error);
        }
    }

    async cleanupWorkloadModule() {
        // Optional cleanup logic
    }
}

function createWorkloadModule() {
    return new ZkSnarksWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
