var express = require('express');
var CloudmersiveVirusApiClient = require('cloudmersive-virus-api-client');
var formidable = require('formidable');
var firebase = require('firebase');

//Insert firebase config

var firebaseApp = firebase.initializeApp(firebaseConfig);

var fs = require('fs');
var app = express();
app.use(express.static(__dirname + '/public')); //__dir and not _dir
var port = 8000; // you can use any port
app.listen(port);
console.log('server on' + port);
app.use(express.json());

//Translation
app.post('/apitranslation', (request, response) => {
  console.log(request.body);
  const data = request.body;

  var clientId = "FREE_TRIAL_ACCOUNT";
  var clientSecret = "PUBLIC_SECRET";

  var fromLang = data.fromLang;
  var toLang = data.toLang;
  var text = data.message;

  var jsonPayload = JSON.stringify({
    fromLang: fromLang,
    toLang: toLang,
    text: text
  });

  var options = {
    hostname: "api.whatsmate.net",
    port: 80,
    path: "/v1/translation/translate",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-WM-CLIENT-ID": clientId,
        "X-WM-CLIENT-SECRET": clientSecret,
        "Content-Length": Buffer.byteLength(jsonPayload)
    }
  };

  var translateRequest = new http.ClientRequest(options);
  translateRequest.end(jsonPayload);

  var translatedMessage = 'Untranslated';

  translateRequest.on('response', function (translateResponse) {
    console.log('Status code: ' + translateResponse.statusCode);
    translateResponse.setEncoding('utf8');
    translateResponse.on('data', function (chunk) {
      console.log(chunk);
      translatedMessage = chunk;
      response.json({
        translatedMessage: translatedMessage
      });
    })
  })
});

app.post('/apiviruscheck', (request,response) => {
  var fileToCheck = '';
  new formidable.IncomingForm().parse(request, (err, fields, files) => {
    if (err) {
      console.error('Error', err)
      throw err
    }

    var defaultClient = CloudmersiveVirusApiClient.ApiClient.instance;
    var Apikey = defaultClient.authentications['Apikey'];
    Apikey.apiKey = "";
    
    var api = new CloudmersiveVirusApiClient.ScanApi();

    var inputFile = fs.readFileSync(files.document.path);

    var callback = function(error, data, response) {
      if (error) {
        console.error(error);
      } else {
        console.log('API called successfully. Returned data: ' + data);
        
      }
    };
    
    api.scanFile(Buffer.from(inputFile.buffer), callback);

  })
  



}); 