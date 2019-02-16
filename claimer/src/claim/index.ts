let address;
const msgToSign = "I am rocking at EthDenver 2019";

const updateAddress = (address: string) => {
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
      (window as any).location.href = "https://poap-scan.firebaseapp.com/badges/badge/?address=" + address;
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
   address = (window as any).web3.eth.accounts[0];
   updateAddress(address);
})
