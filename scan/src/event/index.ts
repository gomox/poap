
import * as Mustache from 'mustache';

const contractAddress = '0xa1eb40c284c5b44419425c4202fa8dabff31006b'; // Deployed manually

const getTokenId = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('tokenId');
}

const updateOwner = (owner: string) => {
  document.getElementById("owner").textContent = owner;
  document.getElementById("owner").setAttribute("href", "https://scan.poap.xyz/badges/badge/?address=" + owner);

}

const getEvent = async (uri: string): Promise<any> => {
  const event = await loadJSON(uri);
  event.uri = uri;
  return event
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

const renderTwitter = (tokenId: string, event: any) => {
  var t = document.getElementById( 'twitter-link' );
  t.setAttribute("data-text", "Look at my " + event.name +  " badge!");
  t.setAttribute("data-url", "https://scan.poap.xyz/event/?tokenId=" + tokenId);
  var script = document.createElement( 'script'  );
  script.setAttribute("src", "https://platform.twitter.com/widgets.js");
  t.parentNode.insertBefore(script, t.nextSibling );
}

window.addEventListener('load', async () => {
   const tokenId = getTokenId();
   const token = await loadJSON("https://admin.poap.xyz/token?id=" + tokenId)
   updateOwner(token.owner);
   const event = await getEvent(token.uri);
   renderEvent(event);
   renderTwitter(tokenId, event);
 })
