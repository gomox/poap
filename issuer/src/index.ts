
import QrScanner from "qr-scanner";
//@ts-ignore
import * as QrScannerWorkerPath from '!!file-loader!../node_modules/qr-scanner/qr-scanner-worker.min.js';

console.log(QrScannerWorkerPath)
QrScanner.WORKER_PATH = QrScannerWorkerPath;

const video = document.getElementById('qr-video');
const address = document.getElementById('address');

const scanner = new QrScanner(
  video as HTMLVideoElement,
  (result:any) => {
    console.log('decoded qr code:', result);
    (address as HTMLInputElement).textContent = result;
    scanner.stop();
  }
);

function scan() {
  scanner.start();
  return false;
}

function post(addresses: string[], uris: string[]) {
//  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/mint", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        alert(this.responseText);
      } else {
        alert(xhr.statusText);
      }
    };
    xhr.onerror = function () {
      alert(xhr.statusText);
    };
    xhr.send(JSON.stringify({
        addresses: addresses,
        uris: uris
    }));
//  });
}

const add = () => {
  const selected = document.querySelectorAll("#events input[type=checkbox]:checked");
  const uris = Array.from(selected).map((el: HTMLOptionElement) => el.value);
  var addresses = (document.getElementById('address') as HTMLOptionElement).value.split('\n');
  post(addresses, uris);
  return false;
}

document.getElementById("scan").onclick = scan;
document.getElementById("add").onclick = add;
