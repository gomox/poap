const msgToSign = "I am rocking at EthDenver 2019";

const updateAddress = async () => {
  const web3 = (window as any).web3;
  if(web3.ethereum && web3.ethereum.isMetaMask && (!web3.eth.accounts || web3.eth.accounts.length === 0)) {
    await (window as any).ethereum.enable();
  }
  let address = web3.eth.accounts[0];
  document.getElementById("address").textContent = address;
}

const claimBadgeEl = document.getElementById('claim-badge');
const claimBadge = async () => {
  const web3 = (window as any).web3;
  const signature: string = await new Promise((resolve, reject) => {
   web3.personal.sign(web3.fromUtf8(msgToSign), web3.eth.coinbase, (err, res) => {
      if(err) return reject();
      return resolve(res);
    });
  });
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/claim", true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function () {
    if (this.status >= 200 && this.status < 300) {
      let address = web3.eth.accounts[0];
      (window as any).location.href = "https://scan.poap.xyz/badges/badge/?address=" + address;
    } else {
      alert("Error:"+ xhr.statusText);
    }
  };
  xhr.onerror = function () {
    alert("Error:"+ xhr.statusText);
  };
  xhr.send(JSON.stringify({ signature }));
  return false;
}
claimBadgeEl.onclick = claimBadge;

window.addEventListener('load', async () => {
   updateAddress();
   setInterval(updateAddress, 1000);
})
