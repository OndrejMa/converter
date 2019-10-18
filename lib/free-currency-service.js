require('dotenv').config();
const https = require('https');

module.exports = {
    ///function from free-currency example
   freeCurrency: async (amount,from,to, cb) => {

            const apiKey = process.env.KEY;
            from = encodeURIComponent(from);
            to = encodeURIComponent(to);
            const query = from + '_' + to;

            const url = 'https://free.currconv.com/api/v7/convert?q='
                + query + '&compact=ultra&apiKey=' + apiKey;

            https.get(url, function(res){
                let body = '';

                res.on('data', function(chunk){
                    body += chunk;
                    console.log("Received data in JSON format:",body);
                });

                res.on('end', function(){
                    try {
                        let jsonObj = JSON.parse(body);

                        let val = jsonObj[query];
                        if (val) {
                            let total = val * amount;
                            cb(null, Math.round(total * 100) / 100);
                            console.log("Value rate for 1 currency from freeCurrencyServer:",val);
                        } else {
                            let err = new Error("Value not found for " + query);
                            console.log(err);
                           cb(err);
                        }
 //                       return total;
                    } catch(e) {
                        console.log("Parse error: ", e);
                       cb(e);
                    }
                });
            }).on('error', function(e){
                console.log("Got an error: ", e);
                cb(e);
            });
        }

    };