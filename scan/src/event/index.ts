import * as Web3 from 'web3';
import * as Mustache from 'mustache';
import * as abi from '../../abi/poap.abi';

const contractAddress = '0xa1eb40c284c5b44419425c4202fa8dabff31006b'; // Deployed manually

const getTokenId = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('tokenId');
}

const getTokenOwner = async (tokenId: string): Promise<string> => {
  let _web3 = (window as any).web3;

  if(!_web3) {
    // @ts-ignore
    const provider = new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/5ab8f963ef7e4efdb7592aa1000597b8");
    // @ts-ignore
    _web3 = new Web3(provider);
    const contract = new _web3.eth.Contract(abi, contractAddress, {});

    // or sending and using a promise
    const owner = await contract.methods.ownerOf(tokenId).call();
    return owner;

  }
  else {

    const contract = (window as any).web3.eth.contract(abi).at(contractAddress);
    console.log(tokenId)
    const owner: string = await new Promise((resolve, reject) => {
      contract.ownerOf(tokenId, (err, res) => {
        if(err) return reject();
        return resolve(res);
      });
    });
    return owner;
  }
}

const updateOwner = (owner: string) => {
  document.getElementById("owner").textContent = owner;
}

const getEvent = async (tokenId: string): Promise<any> => {
  let _web3 = (window as any).web3;

  if(!_web3) {
    // @ts-ignore
    const provider = new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/5ab8f963ef7e4efdb7592aa1000597b8");
    // @ts-ignore
    _web3 = new Web3(provider);
    const contract = new _web3.eth.Contract(abi, contractAddress, {});

    // or sending and using a promise
    const uri: string  = await contract.methods.tokenURI(tokenId).call();
    const event = await loadJSON(uri);
    event.uri = uri;
    return event

  }
  else {
    const contract = (window as any).web3.eth.contract(abi).at(contractAddress);
    const uri: string = await new Promise((resolve, reject) => {
    contract.tokenURI(tokenId, (err, res) => {
        if(err) return reject();
        return resolve(res);
      });
    });
    const event = await loadJSON(uri);
    event.uri = uri;
    return event
  }
}

const loadJSON = async (uri: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', uri, true);
    xobj.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(JSON.parse(xobj.response));
      } else {
        reject({
          status: this.status,
          statusText: xobj.statusText
        });
      }
    };
    xobj.onerror = function () {
      reject({
        status: this.status,
        statusText: xobj.statusText
      });
    };
    xobj.send();
  });
}

const getDay = (date: Date): string => {
  var day = new Intl.DateTimeFormat("en-US", { day: "numeric" }).format;
  return day(date);
}

const getMonth = (date: Date): string => {
  var monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format;
  return monthName(date);
}

const getAtrribute = (event: any, name: string): string | null => {
  const el = event.attributes.find((element: any) => {
    return element.trait_type === name;
  });
  return el? el.value : null;
}

const renderEvent = (event: any) => {
  const template = document.getElementById("template").innerHTML;
  Mustache.parse(template);
  const startMonth = getMonth(new Date(getAtrribute(event, "startDate")));
  const endMonth = getMonth(new Date(getAtrribute(event, "endDate")));
  var rendered = Mustache.render(template, {
      name: event.name,
      startDay: getDay(new Date(getAtrribute(event, "startDate"))),
      startMonth: startMonth,
      endDay: getDay(new Date(getAtrribute(event, "endDate"))),
      endMonth: startMonth === endMonth? "": endMonth + " ",
      year: event.year,
      city: getAtrribute(event, "city"),
      country: getAtrribute(event, "country"),
      image: event.image
  });
  document.getElementById("event").innerHTML= rendered;
}

window.addEventListener('load', async () => {
   const tokenId = getTokenId();
   const owner = await getTokenOwner(tokenId);
   updateOwner(owner);
   const event = await getEvent(tokenId);
   renderEvent(event);
 })
