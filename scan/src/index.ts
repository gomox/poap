import * as Web3 from 'web3';
import * as ENS from 'ethereum-ens';

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

const enableSearchBtns = document.getElementsByClassName('enable-search');
const enableSearch = () => {
  search = true;
  hideAndShow(["no-web3"],["metamask", "web3", "no-metamask"]);
  return false;
}
for(let i=0; i< enableSearchBtns.length; i++) {
  (enableSearchBtns[i] as HTMLElement).onclick = enableSearch;
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

const showbadgesEl = document.getElementById('show-badges');
const showbadges = () => {
  if(account) {
    (window as any).location.href = "/badges/badge?address=" + account;
  }
  else {
    alert("No account detected")
  }
  return false;
}
showbadgesEl.onclick = showbadges;

const searchBtn = document.getElementById('search');
const searchBadge = async () => {
  let _web3 = (window as any).web3;
  if(!_web3) {
    // @ts-ignore
    const provider = new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/5ab8f963ef7e4efdb7592aa1000597b8");
    // @ts-ignore
    _web3 = new Web3(provider);
  }
  var ens = new ENS(_web3.currentProvider);

  const address = document.getElementById('address');
  const value = (address as HTMLInputElement).value;
  console.log(value);
  if(_web3.isAddress(value)) {
    (window as any).location.href = "/badges/badge?address=" + value;
  }
  else{
     let addr;
     try {
       addr = await ens.resolver(value).addr();
     }
     catch{}
     if(addr) {
       (window as any).location.href = "/badges/badge?address=" + addr;
     }
     else {
       alert("Invalid address");
     }
   }
   return false;
}
searchBtn.onclick = searchBadge;

window.addEventListener('load', () => {
  detectAccount();
  setInterval(detectAccount, 1000);
})
