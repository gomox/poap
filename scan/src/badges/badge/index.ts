import * as Web3 from 'web3';
import * as Mustache from 'mustache';
import * as abi from '../../../abi/poap.abi';

const contractAddress = '0xa1eb40c284c5b44419425c4202fa8dabff31006b'; // Deployed manually

const getAddress = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('address');
}

const updateAddress = (address: string) => {
  document.getElementById("account").textContent = address;
}

const getEvents = async (address: string): Promise<any[]> => {
  const events: any[] = [];
  let _web3 = (window as any).web3;

  if(!_web3) {
    // @ts-ignore
    const provider = new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/5ab8f963ef7e4efdb7592aa1000597b8");
    // @ts-ignore
    _web3 = new Web3(provider);
    const contract = new _web3.eth.Contract(abi, contractAddress, {});

    // or sending and using a promise
    const tokensAmount = await contract.methods.balanceOf(address).call();
    for(let i = 0; i < tokensAmount; i++) {
      let tokenId = await contract.methods.tokenOfOwnerByIndex(address, i).call();
      let uri = await contract.methods.tokenURI(tokenId).call();
      const event = await loadJSON(uri);
      event.tokenId = tokenId;
      event.uri = uri;
      events.push(event);
    }

  }
  else {
    const contract = _web3.eth.contract(abi).at(contractAddress);

    const tokensAmount = await new Promise((resolve, reject) => {
     contract.balanceOf(address, (err, res) => {
        if(err) return reject();
        return resolve(res);
      });
    });
    for(let i = 0; i < tokensAmount; i++) {
       let tokenId = await new Promise((resolve, reject) => {
       contract.tokenOfOwnerByIndex(address, i, (err, res) => {
          if(err) return reject();
          return resolve(res);
        });
      });
      let uri: string = await new Promise((resolve, reject) => {
       contract.tokenURI(tokenId, (err, res) => {
          if(err) return reject();
          return resolve(res);
        });
      });
      const event = await loadJSON(uri);
      event.tokenId = tokenId;
      event.uri = uri;
      events.push(event);
    }
  }
  return events;
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

const renderEvent = (template: any, id: string, badges: any[]) => {
  if(badges.length > 0) {
    var rendered = Mustache.render(template, {
      "badges": badges
    });
    document.getElementById(id).innerHTML= rendered;
  }
  else {
    document.getElementById(id).style.display = "none";
  }
}

const renderEvents = (events: any[]) => {
  const badges = {
    year2014: [],
    year2015: [],
    year2016: [],
    year2017: [],
    year2018: [],
    year2019: []
  }
  for(let i = 0; i < events.length; i++) {
    badges["year" + events[i].year].push({
      url: "/event?tokenId=" + events[i].tokenId,
      image: events[i].image
    });
  }
  const template = document.getElementById("template").innerHTML;
  Mustache.parse(template);
  renderEvent(template, "badges-2014", badges.year2014);
  renderEvent(template, "badges-2015", badges.year2015);
  renderEvent(template, "badges-2016", badges.year2016);
  renderEvent(template, "badges-2017", badges.year2017);
  renderEvent(template, "badges-2018", badges.year2018);
  renderEvent(template, "badges-2019", badges.year2019);

}

const renderTwitter = (address: string, event: any) => {
  var t = document.getElementById( 'twitter-link' );
  t.setAttribute("data-text", "Check out my badge shelf!");
  t.setAttribute("data-url", "https://scan.poap.xyz/badges/badge/?address=" + address);
  var script = document.createElement( 'script'  );
  script.setAttribute("src", "https://platform.twitter.com/widgets.js");
  t.parentNode.insertBefore(script, t.nextSibling );
}

window.addEventListener('load', async () => {
   const address = getAddress();
   updateAddress(address);
   const events = await getEvents(address);
   renderEvents(events);
   renderTwitter(address, event);

 })
