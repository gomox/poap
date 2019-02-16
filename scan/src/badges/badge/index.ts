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
  const contract = (window as any).web3.eth.contract(abi).at(contractAddress);
  const tokensAmount = await new Promise((resolve, reject) => {
   contract.balanceOf(address, (err, res) => {
      if(err) return reject();
      return resolve(res);
    });
  });
  for(let i = 0; i < tokensAmount; i++) {
    const tokenId = await new Promise((resolve, reject) => {
     contract.tokenOfOwnerByIndex(address, i, (err, res) => {
        if(err) return reject();
        return resolve(res);
      });
    });
    const uri: string = await new Promise((resolve, reject) => {
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

window.addEventListener('load', async () => {
   const address = getAddress();
   updateAddress(address);
   const events = await getEvents(address);
   renderEvents(events);
 })
