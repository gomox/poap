/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var path = require('path');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
var contractABI = require('./abi/poap.abi');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const express = require('express');
const cookieParser = require('cookie-parser')();
const cors = require('cors')({origin: true});
const app = express();

const provider = new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/03e6ac0d84a343318212b133c9c8ce58");
const web3 = new Web3(provider);

const account = '';
const privateKey = Buffer.from('', 'hex');
const contractAddress = '0x208e1b415053eda5333d7b89ecd440f682121906'; // Deployed manually
const abi = contractABI;


// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = (req, res, next) => {
  console.log('Check if request is authorized with Firebase ID token');

  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
      !(req.cookies && req.cookies.__session)) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
        'Make sure you authorize your request by providing the following HTTP header:',
        'Authorization: Bearer <Firebase ID Token>',
        'or by passing a "__session" cookie.');
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if(req.cookies) {
    console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send('Unauthorized');
    return;
  }
  admin.auth().verifyIdToken(idToken).then((decodedIdToken) => {
    console.log('ID Token correctly decoded', decodedIdToken);
    if (decodedIdToken.email === 'fernandez.daniel@gmail.com' || decodedIdToken.email === 'patricio.worthalter@milliwatt.com.ar') {
      req.user = decodedIdToken;
      return next();
    }
    else {
      res.status(403).send('Unauthorized');
      return;
    }
  }).catch((error) => {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized');
  });
};


const mint = (contract, nonce, address, uri) => {
  try {

    console.log("Nonce: " + nonce);

    console.log("Minting for "+address);

    const contractFunction = contract.methods.mintWithTokenURI(address, uri);
    const functionAbi = contractFunction.encodeABI();

    const txParams = {
      gasPrice: '0x3B9ACA00',
      gasLimit: '0x7A120',
      to: contractAddress,
      data: functionAbi,
      from: account,
      nonce: '0x' + nonce.toString(16),
      value: '0x00'
    };

    const tx = new Tx(txParams);
    tx.sign(privateKey);
    console.log("Tx Hash: "+tx.hash().toString('hex'));

    const serializedTx = tx.serialize();

    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));

    return tx.hash().toString('hex');
  }
  catch(error) {
    console.error(error);
    return error;
  }
}

app.use(cors);
app.use(cookieParser);
app.use(validateFirebaseIdToken);
app.use('/scan', express.static(path.join(__dirname, 'dist')))

app.post('/mint', async (req,res, next) => {

    const contract = new web3.eth.Contract(abi, contractAddress, {
      from: account,
      gasLimit: 3000000,
    });

    var addresses=req.body.addresses;
    var uris=req.body.uris;

    let nonce = await web3.eth.getTransactionCount(account);

    let finalResponse = "";
    addresses.forEach(address => {
      if(web3.utils.isAddress(address)) {
        uris.forEach(uri => {
          nonce = nonce + 1;
          const response = mint(contract, nonce, address.trim(), uri.trim());
          finalResponse += ("0x" + response + "\n");
        })
      }
      else {
        finalResponse += "Invalid address " + address + "\n";
      }
    });

    res.send(finalResponse);

});

// This HTTPS endpoint can only be accessed by your Firebase Users.
// Requests need to be authorized by providing an `Authorization` HTTP header
// with value `Bearer <Firebase ID Token>`.
exports.app = functions.https.onRequest(app);
