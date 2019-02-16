let detecting = false;
let search = false;
let account: string;
let needEnable: boolean = false;

function hideAndShow(showNames: string[], hideNames: string[]) {
  hideNames.forEach(hide);
  showNames.forEach(show);
}

function hide(name: string) {
  // @ts-ignore
  var el: HTMLElement = document.getElementsByClassName(name)[0];
  el.style.display = "none";
}

function show(name: string) {
  // @ts-ignore
  var el: HTMLElement = document.getElementsByClassName(name)[0];
  el.style.display = "block";
}

const detectAccount = () => {
  if(!detecting && !search) {
    detecting = true;
    needEnable = false;
    const win = window as any;
    // Modern dapp browsers...
    if (win.ethereum) {
      // @ts-ignore
      if(win.web3.eth.accounts.length > 0) {
        account = win.web3.eth.accounts[0];
        hideAndShow(["web3"],["metamask", "no-web3", "no-metamask"]);
      }
      else {
        needEnable = true;
        if(win.ethereum.isMetaMask) {
          hideAndShow(["metamask"],["web3", "no-web3", "no-metamask"]);
        }
        else {
          hideAndShow(["no-web3"],["metamask", "web3", "no-metamask"]);
        }
      }
    }
    // Legacy dapp browsers...
    else if (win.web3) {
      // @ts-ignore
      const web3js = new Web3(web3.currentProvider);
      if(web3js.eth.accounts.length > 0) {
        account = web3js.eth.accounts[0];
        hideAndShow(["web3"],["metamask", "no-web3", "no-metamask"]);
      }
      else {
        hideAndShow(["no-web3"],["metamask", "web3", "no-metamask"]);
      }
    }
    // Non-dapp browsers...
    else {
      hideAndShow(["no-metamask"],["web3", "no-web3", "metamask"]);
    }
    detecting = false;
  }
}

const loginMetamaskEl = document.getElementById('login-metamask');
const loginMetamask = async () => {
  const web3 = (window as any).web3;
  if(!web3.eth.accounts || web3.eth.accounts.length === 0) {
    await (window as any).ethereum.enable();
  }
  return false;
}
loginMetamaskEl.onclick = loginMetamask;

const claimEl = document.getElementById('claim-badge');
const claim = () => {
  (window as any).location.href = "/claim";
  return false;
}
claimEl.onclick = claim;


window.addEventListener('load', () => {
  detectAccount();
  setInterval(detectAccount, 1000);
})
