/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');
const bcrypt = require('bcrypt');

class AssetTransfer extends Contract {

    async InitLedger(ctx) {
        const assets = [
            {
                ID: 'asset1',
                Name: 'Kapil',
                Dob: '12-03-1988',
                Nominee: 'Tomoko',
                InsuarancePolicy: 'Policy xyz',
            },
            {
                ID: 'asset2',
                Name: 'Kapil',
                Dob: '12-03-1988',
                Nominee: 'Tomoko',
                InsuarancePolicy: 'Policy xyz',
            },
            {
                ID: 'asset3',
                Name: 'Kapil',
                Dob: '12-03-1988',
                Nominee: 'Tomoko',
                InsuarancePolicy: 'Policy xyz',
            },
            {
                ID: 'asset4',
                Name: 'Kapil',
                Dob: '12-03-1988',
                Nominee: 'Tomoko',
                InsuarancePolicy: 'Policy xyz',
            }, 
            {
                ID: 'asset5',
                Name: 'Kapil',
                Dob: '12-03-1988',
                Nominee: 'Tomoko',
                InsuarancePolicy: 'Policy xyz',
            },
            {
                ID: 'asset6',
                Name: 'Kapil',
                Dob: '12-03-1988',
                Nominee: 'Tomoko',
                InsuarancePolicy: 'Policy xyz',
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.ID, Buffer.from(stringify(sortKeysRecursive(asset))));
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    async CreateAsset(ctx, id, color, size, owner, appraisedValue) {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const asset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return JSON.stringify(asset);
    }

    async RegisterClient(ctx, id, name, dob, mobile, role, password) {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const asset = {
            ID: id,
            Name: name,
            Dob: dob,
            Mobile: mobile,
            Role:role,
            Password: password,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));

        // await this.IssuePolicy(ctx,id,policy_id);

        return JSON.stringify(asset);
    }


    async RegisterHospital(ctx, id, name, address, mobile, role, password) {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        

        const asset = {
            ID: id,
            Name: name,
            Address: address,
            Mobile: mobile,
            Role:role,
            Password: password,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));

        // await this.IssuePolicy(ctx,id,policy_id);

        return JSON.stringify(asset);
    }


    async RegisterInsuranceProvider(ctx, id, name, address, mobile, role, password) {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }


        const asset = {
            ID: id,
            Name: name,
            Address: address,
            Mobile: mobile,
            Role:role,
            Password: password,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));

        // await this.IssuePolicy(ctx,id,policy_id);

        return JSON.stringify(asset);
    }
    //user verification
    async VerifyUser(ctx, userId, rawPassword) {
        // Retrieve the user from the ledger
        const userBytes = await ctx.stub.getState(userId);
        if (!userBytes || userBytes.length === 0) {
            throw new Error(`User with ID ${userId} does not exist`);
        }
    
        // Parse the user data
        const user = JSON.parse(userBytes.toString());
    
        // Verify the password
        
    
        return JSON.stringify(user);
    }
    

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    
    async GetClientInfo(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, id, color, size, owner, appraisedValue) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }
    
    async UpdateClientDetails(ctx, id, name, dob, nominee, inspol) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // overwriting original asset with new asset
        const asset = {
            ID: id,
            Name: name,
            Dob: dob,
            Nominee: nominee,
            InsurancePolicy: inspol,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, id) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    async UpdateNominee(ctx, id, newNominee) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        const oldNominee = asset.Nominee;
        asset.Nominee = newNominee;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldNominee;
    }
    
    async TransferAsset(ctx, id, newOwner) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        const oldOwner = asset.Owner;
        asset.Owner = newOwner;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldOwner;
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    async RegisterPolicy(ctx, id, email, name, duration, premium, hospitals, reimburse_amount) {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const asset = {
            ID: "POLICY_"+id+"_"+name,
            Email:email,
            Company: name,
            Duration: duration,
            Premium: premium,
            Hospitals: hospitals,
            Amount: reimburse_amount,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return JSON.stringify(asset);
    }

    // ReadAsset returns the asset stored in the world state with given id.
    async GetAllPolicies(ctx) {
        const iterator = await ctx.stub.getStateByRange('', ''); // Retrieve all assets
        const policies = [];
    
        // Iterate through the result set and add policies to the array
        while (true) {
            const result = await iterator.next();
    
            if (result.value && result.value.value.toString()) {
                //const key = result.value.key;
                const asset = JSON.parse(result.value.value.toString('utf8'));
                const key=asset.ID;
                // Check if the key starts with "POLICY_"
                if (key.startsWith('POLICY_')) {
                    policies.push(asset);
                }
            }
    
            // If there are no more results, break the loop
            if (result.done) {
                await iterator.close();
                return JSON.stringify(policies);
            }
        }
    }

    async GetPolicy(ctx,policy) {
        const iterator = await ctx.stub.getStateByRange('', ''); // Retrieve all assets
        let policies ;
    
        // Iterate through the result set and add policies to the array
        while (true) {
            const result = await iterator.next();
    
            if (result.value && result.value.value.toString()) {
                //const key = result.value.key;
                const asset = JSON.parse(result.value.value.toString('utf8'));
                const key=asset.ID;
                // Check if the key starts with "POLICY_"
                if (key === policy) {
                    policies = asset;
                }
            }
    
            // If there are no more results, break the loop
            if (result.done) {
                await iterator.close();
                return JSON.stringify(policies);
            }
        }
    }
    
 
    async IssuePolicy(ctx, id,email, policy, nominee, adhaar, relation, mobile,
    duration,premium,premium_paid,premium_left,amount) {
        
       
        const asset = {
            ID: "TXN_"+id,
            Email:email,
            Policy:policy,
            Nominee:nominee,
            AdhaarNumber:adhaar,
            Relation:relation,
            Mobile:mobile,
            Duration:duration,
            Premium:premium,
            AmountPaid:premium_paid,
            Premium_paid:premium_paid,
            Premium_left:premium_left,
            Amount:amount
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return JSON.stringify(asset);
    }

    async GetMyPolicies(ctx,client_id) {
        const iterator = await ctx.stub.getStateByRange('', ''); // Retrieve all assets
        const policies = [];
    
        // Iterate through the result set and add policies to the array
        while (true) {
            const result = await iterator.next();
    
            if (result.value && result.value.value.toString()) {
                //const key = result.value.key;
                const asset = JSON.parse(result.value.value.toString('utf8'));
                const key=asset.ID;
                console.log(asset)
                // Check if the key starts with "POLICY_"
                if (key.startsWith('TXN_'+client_id)) {
                    policies.push(asset);
                }
            }
    
            // If there are no more results, break the loop
            if (result.done) {
                await iterator.close();
                return JSON.stringify(policies);
            }
        }
    }


    async GetInsurerPolicies(ctx,email) {
        const iterator = await ctx.stub.getStateByRange('', ''); // Retrieve all assets
        const policies = [];
    
        // Iterate through the result set and add policies to the array
        while (true) {
            const result = await iterator.next();
    
            if (result.value && result.value.value.toString()) {
                //const key = result.value.key;
                const asset = JSON.parse(result.value.value.toString('utf8'));
                const key=asset.Email;
                console.log(asset)
                // Check if the key starts with "POLICY_"
                if (key === email) {
                    policies.push(asset);
                }
            }
    
            // If there are no more results, break the loop
            if (result.done) {
                await iterator.close();
                return JSON.stringify(policies);
            }
        }
    }


    async GetPremiumInfo(ctx, client_id, policy_id) {
        const assetJSON = await ctx.stub.getState("TXN_"+client_id+"_"+policy_id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${client_id+policy_id} does not exist`);
        }
        return assetJSON.toString();
    }

    async PayPremium(ctx, id) {
    
        let premiumAsset;

        const iterator = await ctx.stub.getStateByRange('', ''); // Retrieve all assets
        const policies = [];
    
        // Iterate through the result set and add policies to the array
        while (true) {
            const result = await iterator.next();
    
            if (result.value && result.value.value.toString()) {
                //const key = result.value.key;
                const asset = JSON.parse(result.value.value.toString('utf8'));
                const key=asset.ID;
                console.log(asset)
                // Check if the key starts with "POLICY_"
                if (key === id) {
                    //await ctx.stub.deleteState(result.value.key);
                    premiumAsset=asset;
                    await ctx.stub.deleteState(result.value.key);
                }
            }
    
            // If there are no more results, break the loop
            if (result.done) {
                await iterator.close();
                break;
            }
        }
    
        // Update the amount paid
        const amountPaid = parseInt(premiumAsset.AmountPaid || "0");  // Default to 0 if undefined
        const premium = parseInt(premiumAsset.Premium);
        const updatedAmountPaid = amountPaid + premium;
    
        // Update the premiums paid and premiums left
        const premiumsPaid = parseInt(premiumAsset.Premium_paid);
        const premiumsLeft = parseInt(premiumAsset.Premium_left);
    
        // if (premiumsLeft - 1 === 0) {
        //     if (!premiumAsset.client_id || !premiumAsset.policy_id) {
        //         throw new Error(`Asset data for ID ${id} is missing client_id or policy_id for refund`);
        //     }
        //     await this.Refund(ctx, premiumAsset.client_id, premiumAsset.policy_id);
        //     return `Refund Initiated`;
        // }
    
        const updatedPremiumsPaid = premiumsPaid + 1;
        const updatedPremiumsLeft = premiumsLeft - 1;
        //await ctx.stub.deleteState(id);
        // Create the updated asset
        const asset = {
            ID: id,
            Premium: premiumAsset.Premium,
            Duration: premiumAsset.Duration,
            Nominee: premiumAsset.Nominee,
            Relation: premiumAsset.Relation,
            Mobile: premiumAsset.Mobile,
            AmountPaid: updatedAmountPaid.toString(),
            Premium_paid: updatedPremiumsPaid.toString(),
            Premium_left: updatedPremiumsLeft.toString(),
            Amount: premiumAsset.Amount
        };
    
        // Serialize the updated asset and write it to the ledger
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return JSON.stringify(asset);
    }
    
    
    
    



    async Refund(ctx, client_id, policy_id) {
        const exists = await this.AssetExists(ctx, client_id);
        if (!exists) {
            throw new Error(`The asset ${client_id} do not exist`);
        }

        const exists2 = await this.AssetExists(ctx, policy_id);
        if (!exists2) {
            throw new Error(`The asset ${policy_id} do not exist`);
        }

        const assetString = await this.GetPremiumInfo(ctx, client_id, policy_id);
        const premium_asset = JSON.parse(assetString);

        const amount=premium_asset.AmountPaid.toString();
        const pre=premium_asset.Premium.toString();
        var amt=parseInt(amount.substring(1))+parseInt(pre.substring(1));
        var refund;

        if(amt<parseInt((premium_asset.TotalAmount.toString()).substring(1))){
            refund=amt;
        }
        else{
            refund=premium_asset.ReimburseAmount;
        }

        const id=client_id+policy_id;

        await this.DeleteAsset(ctx,id);

        const asset = {
            ID: id,
            RefundedAmount: refund,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
    }

    //Hospital
    //Request Medical Service
    

}




module.exports = AssetTransfer;

