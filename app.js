'use strict';

const axios = require('axios').default;
const jsdom = require('jsdom');
const fs = require('fs');

let requestData = new jsdom.JSDOM();

const cleanTextData = (domElement) => {
  return domElement.textContent.trim().split('--------------')[2];
};

const convertToDeprem = (depremString) => {
  const depremArr = depremString.split(' ').filter((val) => val != '');
  const substrInd = (depremString.indexOf('�lksel') === -1) ?
  depremString.indexOf('REVIZE') : depremString.indexOf('�lksel');
  const yer = depremString.substring(depremString.indexOf(depremArr[8]),
      substrInd).trim();
  const nitelik = depremString.substring(substrInd).trim();
  const tamTarih = new Date(depremArr[0]);
  const tarihString = String(tamTarih.getDate()).padStart(2, '0') +
    '.' + String(tamTarih.getMonth() + 1).padStart(2, '0') + '.' +
    String(tamTarih.getFullYear());
  const depremObj = {
    'tarih': tarihString,
    'saat': Date(depremArr[1]),
    'enlem': Number(depremArr[2]),
    'boylam': Number(depremArr[3]),
    'derinlik': Number(depremArr[4]),
    'md': (depremArr[5] === '-.-') ? 0 : Number(depremArr[5]),
    'ml': (depremArr[6] === '-.-') ? 0 : Number(depremArr[6]),
    'mw': (depremArr[7] === '-.-') ? 0 : Number(depremArr[7]),
    'yer': yer,
    'nitelik': nitelik,
  };
  return JSON.stringify(depremObj);
};

axios.get('http://www.koeri.boun.edu.tr/scripts/lst0.asp').then((res) => {
  requestData = new jsdom.JSDOM(res.data);
}).catch((error) => {
  console.error(error + ' while fetching data from http://www.koeri.boun.edu.tr/scripts/lst0.asp');
}).then(() => {
  const preData = cleanTextData(requestData.window.
      document.querySelector('pre')).split('\n').filter((elem) => elem !== '');
  fs.writeFileSync('depremler.json', '[');
  preData.forEach((element) => {
    fs.appendFileSync('depremler.json', convertToDeprem(element) + ',' +'\n');
  });
  fs.appendFileSync('depremler.json', ']');
});
