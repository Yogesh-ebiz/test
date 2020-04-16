const _ = require('lodash');
const axiosInstance = require('../services/api.service');

const Currency = require('../models/currency.model');

let base_url = 'http://apilayer.net/api/live';
let access_key = '57add6cb9074d4eed93cbf72df21f8f9';
let source = 'USD';
let currencies = '';
let format = 1;

async function findCurrencyRate(src, target) {
  let data = null;

  if(src==null || target==null){
    return;
  }

  // let regex = '^'+currency+'*';
  // data = await Currency.find({currency: {$regex: regex}});

  let currency = src+target;
  data = await Currency.findOne({currency: currency});
  console.log('data', data)
  if(!data){
    await updateCurrencies(src);
    // data = await Currency.find({currency: {$regex: '/^' + currency + '/'}});
    data = await Currency.findOne({currency: currency});
    console.log('finding', currency, data);
  }

  return data;
}


async function updateCurrencies(currency){
  let newCurrencies = await getLatestRates(currency);
  newCurrencies = newCurrencies.data.quotes;
  if(newCurrencies) {
    for (let currency in newCurrencies) {
      let rate = newCurrencies[currency];
      // currency = currency.replace('USD', '');

      let saved = await Currency.findOneAndUpdate({currency: currency}, {$set: {currency: currency, rate: rate, lastUpdatedDate: Date.now()}}, {upsert: true, new: true});
    }
  }
}

// async function findCurrencyRates(listOfCurrencies) {
//   let data = null;
//
//   if(listOfCurrencies==null){
//     return;
//   }
//   data = await Currency.find({currency: {$in: listOfCurrencies}});
//   if(!data.length){
//     await updateCurrencies();
//     data = await Currency.find({currency: {$in: listOfCurrencies}});
//   } else {
//     let today = new Date();
//       let lastReviewStatDate = new Date(data[0].createdDate);
//       let daysAgo = Math.floor( (Math.abs(today - lastReviewStatDate) / 1000) / 86400);
//
//       //Fetch new currency rates every 7 days
//       if(daysAgo>7){
//         await updateCurrencies();
//         data = await Currency.find({currency: {$in: listOfCurrencies}});
//       }
//   }
//
//   return data;
// }


function getLatestRates(source) {
  let data = null;

  let query = "access_key=" + access_key + '&source=' + source + '&format=' + format;

  console.log('url', query)
  return axiosInstance.request(base_url + "?" + query);

}


module.exports = {
  findCurrencyRate: findCurrencyRate,
  // findCurrencyRates:findCurrencyRates,
  getLatestRates: getLatestRates
}
