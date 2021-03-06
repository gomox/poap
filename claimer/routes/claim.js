var express = require('express');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const ethjsutil = require('ethereumjs-util');
const contractABI = require('../abi/poap.abi');
const abi = require('ethereumjs-abi');

var router = express.Router();

const provider = new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/5ab8f963ef7e4efdb7592aa1000597b8");
const web3 = new Web3(provider);

const account = '0xe583f95bF95d0883F94EfE844442C8bfc9dd7A7F';
const privateKey = Buffer.from('', 'hex');
const contractAddress = '0xa1eb40c284c5b44419425c4202fa8dabff31006b';
const tokenURI = "https://www.poap.xyz/events/jsons/24.json";

let _nonce;

const contract = new web3.eth.Contract(contractABI, contractAddress, {
  from: account,
  gasLimit: 3000000,
});

let nextId;

/* GET users listing. */
router.post('/', async (req, res, next) => {
  var signature = req.body.signature;
  const msg = "I am rocking at EthParis 2019";
  const msgBuffer = ethjsutil.toBuffer(msg);
  const msgHash = ethjsutil.hashPersonalMessage(msgBuffer);
  const signatureBuffer = ethjsutil.toBuffer(signature);
  const signatureParams = ethjsutil.fromRpcSig(signatureBuffer);
  const publicKey = ethjsutil.ecrecover(
    msgHash,
    signatureParams.v,
    signatureParams.r,
    signatureParams.s
  );
  const addressBuffer = ethjsutil.publicToAddress(publicKey);
  const address = ethjsutil.bufferToHex(addressBuffer);
  console.log("Address: "+ address);

  const tokensAmount = await contract.methods.balanceOf(address).call();
  console.log("Token amount: "+ tokensAmount);

  for(let i = 0; i < tokensAmount; i++) {
    const tokenId = await contract.methods.tokenOfOwnerByIndex(address, i).call();
    const uri = await contract.methods.tokenURI(tokenId).call();
    if(uri === tokenURI) {
      res.status(200).send("Account already has a token");
      return;
    }
  }

  const contractFunction = contract.methods.mintWithTokenURI(address, tokenURI);
  const functionAbi = contractFunction.encodeABI();

  if(!_nonce) {
    _nonce = await web3.eth.getTransactionCount(account);
  }
  const nonce = _nonce.toString(16);
  console.log("Nonce: " + nonce);

  const txParams = {
    gasPrice: '0x2540BE400',
    gasLimit: '0x7A120',
    to: contractAddress,
    data: functionAbi,
    from: account,
    nonce: '0x' + nonce,
    value: '0x00'
  };

  const tx = new Tx(txParams);
  tx.sign(privateKey);
  console.log("Tx Hash: "+tx.hash().toString('hex'));

  const serializedTx = tx.serialize();

  web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));

  _nonce = _nonce + 1;

  res.status(200).send(tx.hash().toString('hex'));


});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('claim', { });
});

module.exports = router;
