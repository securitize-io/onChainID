
# Securitize-iD Integration Tutorial

## Summary

![altText](https://lh5.googleusercontent.com/e-jFoakPmqOyLyeo1PX7bLmVJ-Sf8v16npWGulcJn9NlA3r0Sv3b1jUD_MCSFMgiu5Mcr3KEWhajo_J4JXP2_MXGdGb_5QBBTpOemyJh_rz07-VaFitHglXjdORPHITpNcxYISvf)


This document provides all the required steps to integrate a partner's site with Securitize-iD and the capability of registering attested wallets into a blockchain smart contract.

Securize provides the **services** to **KYC** users, as well as the ability to establish if that user complies with a certain set of requirements (**attestation requirements**) the partner requires from that user. These attestation requirements can simply be that the user is KYCed, but the partner might require that the user resides in a certain jurisdiction (e.g., the United States of America), but doesn’t in specific jurisdictions (e.g, not being a resident in Texas). The attestation rules are quite flexible, and can combine a whole set of user personal identification features to satisfy the partner’s requirements.

To be able to interact with Securitize-iD services:



1. The user needs to sign-in (or up) in Securitize and have a Securitize ID
2. The partner will need to require the user permission to access his profile
3. The partner will need to authenticate in the system
4. The partner will need to interact with the user to obtain his public crypto wallet address


## Prerequisites

In order to be able to access Securitize APIs, a set of information and variables have to be shared between Securitize and the Parner, which are summarized in the following table:


<table>
  <tr>
   <td><strong>Variable</strong>
   </td>
   <td><strong>Value</strong>
   </td>
   <td><strong>Comment</strong>
   </td>
  </tr>
  <tr>
   <td><strong>baseUrl</strong>
<p>
(SecuritizeID)          
   </td>
   <td>
<ul>

<li><a href="https://id.securitize.io/">https://id.securitize.io/</a>
    (Production)
</li>

<li><a href="https://id.sandbox.securitize.io/">https://id.sandbox.securitize.io/</a>
    (Sandbox)
</li>
</ul>
   </td>
   <td rowspan="2" >Take into account, that depending on the environment (Production and Sandbox), <strong><em>issuerID</em></strong> and secret will be different, and the <strong><em>redirecturl</em></strong> will have to be configured in SecID for both environments
   </td>
  </tr>
  <tr>
   <td><strong>API_BASE_URL </strong>
<p>
(API Gateway)
   </td>
   <td>
<ul>

<li><a href="https://connect-gw.sandbox.securitize.io/api/">https://connect-gw.securitize.io/api/</a>
    (Production)</li>

<li><a href="https://connect-gw.sandbox.securitize.io/">https://connect-gw.sandbox.securitize.io/</a> 
    (Sandbox)
</li>
</ul>
   </td>
  </tr>
  <tr>
   <td><strong>issuerID</strong>
   </td>
   <td>String, like this: "b462d564-7562-4528-a207-86fcdfc1c6d5"
   </td>
   <td>Provided by Securitize
   </td>
  </tr>
  <tr>
   <td><strong>secret </strong>
   </td>
   <td>String, like this: "95cacd3d-fbcf-487c-b8f0-60f986ea8968”
   </td>
   <td>Provided by Securitize
   </td>
  </tr>
  <tr>
   <td><strong>contractAddress</strong>
<p>
(Deployed Smart Contract Address)
   </td>
   <td>String like this: “0xB8D7d897BdCe6f6454b54E808461B337058cDB0B”
   </td>
   <td>Provided by Securitize
   </td>
  </tr>
  <tr>
   <td><strong>redirecturl</strong>
   </td>
   <td>"https://{partnerSite}"
   </td>
   <td>Provided by Partner
   </td>
  </tr>
</table>


Take into account to change these paramenters in the index.html file:

```js

        const baseUrl = "https://id.rc.securitize.io/";
        const API_BASE_URL = "https://connect-gw.securitize.io/api/";
        const issuerID = "Provided by Securitize";
        const secret = "Provided by Securitize";
        const redirecturl = "Where the front end Application is hosted"
        const contractAddress = "Provided by Securitize"; // Contract Address 
```



## 


## Securitize ID Flow

In order to access Securitize ID APIs a simple OAuth process takes place, as shown in the figure below:

![alt_text](https://lh4.googleusercontent.com/nPhioZ3qtjuDXiqwltTKOhCf099mcLoQb6DG0D2cRYc4QsNW0kBUTN06ohuhEaiqmW9BQSO--iwwP_o-FQBtSBJyKlc2dl3nXvjCgq8yVuuMqPsU-UF41ygZxQM4IOmHR6q86a0d "image_tooltip")



1. The user accesses the partner's site, and clicks on “Login with Securitize” button
2. The user gets redirected to Securitize-iD’s site, and the redirection URL contains the following information: **_issuerId_**, **_scope_** of access (info, details, …) and the **_URL_** the user will be re-directed once he has finished signing in (or up).


### Login & Sign Up with Securitize-iD


#### Whitelisting the redirect URL

The partner will need to whitelist the URL the user will be redirected to in Securitize. In order to do so, the following script in python can be used.


```python
# Import the required libraries
import requests
from requests_oauthlib import OAuth1
from requests_oauthlib import OAuth2Session
import json
serviceUrl = 'https://sec-id-api.securitize.io/v1/'
Issuer ="{Issuer Name}"
ClientID="{issuerID}"
Secret ="{secret}"

body = {'appIcon':{url of the icon},
       'appName':'{Issuer Name}',
       'redirectUrls':['{redirectUrl}']}

response = requests.patch(
   serviceUrl + ClientID ,
   headers={'Authorization': Secret},
   data= body
)

if (response.status_code == 200):
 print("Correctly updated")
else:
 print('Error: ', response.content)
```


Or using the following CURL:


```shell
curl -X PATCH "https://sec-id-api.securitize.io/v1/{domainID}" -H "accept: application/json" -H "Authorization: {secret}" -H "Content-Type: application/json" -d "{body}"
```


Where:

<table>
  <tr>
   <td><strong>Parameter</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td><strong>{domainID}</strong>
   </td>
   <td>Is the {issuerID} provided by Securitize
   </td>
  </tr>
  <tr>
   <td><strong>{secret}</strong>
   </td>
   <td>Is the {secret} provided by Securitize
   </td>
  </tr>
  <tr>
   <td><strong>body</strong>
   </td>
   <td>
     
 ```json 
{ 
"appIcon": "Icon url", 
"appName": "The Name of your App or [yourdomain]", 
"redirectUrls": [ 
"https://[yourdomain]/*" ]
}
     
```
     
   </td>
  </tr>
</table>



#### Show the Logo

The partner can integrate the Securitize iD button within his own UI. The Partner’s landing page should show a button which links to Securitize iD.

![altText](https://lh3.googleusercontent.com/MLTDyiype3GUulvatg3C2QG0j0BcRRsnMsBSfElGjSRD8SfNLVTtIqEU0tc9u-1-oa9PF6G8cOuGq0EE4XEQC5BrkG-UgEivWf73ChfOynn6xVPM4HbN8lRiA659cNbrdhf1dnCc)

For instance, the partner could use the following code to include in his landing page, which basically creates a button and, once clicked, re-directs the user to Securitize-iD authorization site:


```js
   function showSecuritizeIDLogInLogo(baseUrl, issuerID, redirecturl) {
       var scope = "info";
       var securitizeID = document.getElementById("SecuritizeID");
       var link = document.createElement("a");
       var logo = document.createElement("img");

       var href = baseUrl + "#/authorize" + "?issuerId=" + issuerID + "&scope=" + scope + 
                             "&redirecturl=" + redirecturl;
       logo.src = "./images/securitizeID.png";
       link.href = href;
       link.id = "SecuritizeLogo";
       link.appendChild(logo);
       securitizeID.appendChild(link);
   }
```



#### Capture the Token

![alt_text](https://lh5.googleusercontent.com/r9V8TxmNJVbA3QX8fuRzaksoOoSj1pqb90OZkfbI_GBaQnI34MEzfPxkekxaGmqaaOpQESwpdEDYXqNKSQz0Q8IBdfRZSD4u5NhhJ97p6J40EJHdZEcXKRswSTvS36-f7_qcIQe7 "image_tooltip")

Once the user has singed–in (or up) in Securitize-ID, he will be redirected back the the partners site. The URL of the redirection will look like this:


```
https://{Redirectul}?code={code}&authorized=true
```


Hence, the partner will have to capture the information in the parameters of the URL. This can be simply done with the following JavaScript function:


```js
   function captureTOKEN() {
       const queryString = window.location.search;
       const urlParams = new URLSearchParams(queryString);
       const code = urlParams.get("code");
       const authorized = urlParams.get("authorized");
       console.log(code, country, authorized);
       if (code != null) { // User has signed-up and has a SecuritizeID
           return code;
       }
   }
```



#### User has no Securitize-iD

In case the user has not registered in Securitize-iD before, he will have to sign-up and follow the 5 KYC steps in order to be KYCed by Securitize.

In any case, this is not affecting the way the partner is interacting with the user. By the end of the process, the user will be redirected to the partner’s site exactly in the same way as he had already a verified Securitize-iD. However, in this case, the partner will have to check that the user has been KYCed by Securitize to access the rest of the APIs.


#### Request JSON Access Token


![alt_text](https://lh5.googleusercontent.com/Q4ZKF5TZi_3ZFBePMtBbUp-iZAP5qH5WeabmoJKClzxVeucI2D4aGuSfiKJWExF30mRlZN4tM5NB3X3CTMPYqLG5ABaochmSe7qH4jhsY6yh5FMfPmXhEjTGMT0jOo5T2_V-2d7W "image_tooltip")


The partner will need to request Securitize API GW a JSON Access token to be able to interact with the rest of the APIs through a simple request:


```shell
curl --location --request POST 'https:{API_BASE_URL}/api/auth/v1/authorize' \
--header 'Authorization: Bearer {code}' \
--header 'Content-Type: application/json' \
--header 'clientid: {issuerID}' \
--data-raw '{
   "code": "{secret}"
}'
```


Where:


<table>
  <tr>
   <td><strong>Parameter</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td><strong>{API_BASE_URL}</strong>
   </td>
   <td>
<ul>

<li><a href="https://connect-gw.sandbox.securitize.io/api/">https://connect-gw.securitize.io/api/</a> (Production)

<li><a href="https://connect-gw.sandbox.securitize.io/">https://connect-gw.sandbox.securitize.io/</a> (Sandbox)
</li>
</ul>
   </td>
  </tr>
  <tr>
   <td><strong>{issuerID}</strong>
   </td>
   <td>Is the {issuerID} provided by Securitize
   </td>
  </tr>
  <tr>
   <td><strong>{secret}</strong>
   </td>
   <td>Is the {secret} provided by Securitize
   </td>
  </tr>
  <tr>
   <td><strong>{code}</strong>
   </td>
   <td>The {code} returned in the 
<a href="#heading=h.qs15291tus3t">redirect URL</a>
   </td>
  </tr>
</table>


The following JavaScript function will request, and return, the access Token to be later used to access Securitize APIs:


```js
   function requestAccessToken(Url, code, secret, clientId) {
       var xhr = new XMLHttpRequest();
       var responseString = null;
       xhr.addEventListener("readystatechange", function () {
           if (this.readyState === 4) {
               if (this.status === 200) {
                   response = JSON.parse(this.responseText);
                   console.log("Authorized with access Token: ", response.accessToken);
                   responseString = 
                                  JSON.parse('{"response":"OK", "accessToken":"' +
                                              response.accessToken + '"}');
               }
               else {
                   responseString = JSON.parse('{"response":"NoAccessToken"}');
               }
               console.log(this.responseText);
           } else {
               console.log("Big Problem", this);
               responseString = JSON.parse('{"response":"CORS_PROBLEM"}');
           }
       });

       xhr.open("POST", Url, false);
       xhr.setRequestHeader("Content-Type", "application/json");
       xhr.setRequestHeader("Authorization", "Bearer " + secret);
       xhr.setRequestHeader("clientid", clientId);
       try {
           xhr.send(JSON.stringify({ "code": code }));
           return responseString;
       } catch (err) {
           console.log(err);
           return responseString;
       }
   }

```



## Connect Wallet

![alt_text](https://lh4.googleusercontent.com/3kqzZofm2iBKaIW8IkU6Q82TH3mO1NdnzX9gQXdaXaSjAhe4-i7r64DG2E4F_23RN5EMWheSR-zMePh3kErje9ux2ZqsE1ixBx52XLnJebgPtzSJaSZNQSJ4ft6d4J-_7Ez9ISb3 "image_tooltip")


After the user has signed in into Securitize-iD, the partner will have to provide all the functionality to enable the user’s Crypto-Wallet connection. There are multiple ways of doing this, as well as packages and libraries to deal with the details. In this tutorial, and the code provided, we have used  [Web3Modal](https://github.com/Web3Modal/web3modal), which provides all the basic functionality to connect to a wallet and retrieve the user’s wallet public address.


## Registering a Wallet into the BlockChain


![alt_text](https://lh5.googleusercontent.com/pP0Xf_jdrfN3hvjrMfV5JMafbDI-W7BeWs2XzOU7katCGa4PGDUTcdxP2ROlhz38kCr3wSISlUBLUnhKuwtAMXJzPdr0sDr6tMt0fnLYtYZPmnJxiltbTKA5pHpGcNqj6pmJxbh6 "image_tooltip")


In order to register the user’s wallet into the BlockChain registry, Securitze has developed the infrastructure to simplify the process as much as possible.Therefore, by hitting the following endpoint


```shell
curl 'https://connect-gw.securitize.io/api/bc/v1/partners/{issuerID}/attestation' \
  -H 'access-token: {accessToken}' \
  -H 'Content-Type: application/json' 
```


Where:


<table>
  <tr>
   <td><strong>Parameter</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td><strong>{issuerID}</strong>
   </td>
   <td>Is the {issuerID} provided by Securitize
   </td>
  </tr>
  <tr>
   <td><strong>{accessToken}</strong>
   </td>
   <td>Is the {accessToken} returned by the 
<a href="#heading=h.4vfsiwcezjan">request JSON Access Token API</a> 
   </td>
  </tr>
</table>


The result might contain the following values


<table>
  <tr>
   <td><strong>Parameter</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td><strong>{"status":"passed"}</strong>
   </td>
   <td>If the user has <strong>passed</strong> all the Attestation Rules
   </td>
  </tr>
  <tr>
   <td><strong>{"status":"rejected"}</strong>
   </td>
   <td>If the user <strong>does not</strong> pass all the Attestation Rules. In order to protect the user privacy, no further information will be provided of why the user did not pass the attestation rules.
   </td>
  </tr>
</table>

And with this endpoint: 

```shell
curl 'https://connect-gw.securitize.io/api/bc/v1/partners/{issuerID}/wallets/{wallet}/whitelist' \
  -H 'access-token: {accessToken}' \
  -H 'Content-Type: application/json' 
```

Where:


<table>
  <tr>
   <td><strong>Parameter</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td><strong>{wallet}</strong>
   </td>
   <td>Is the {wallet} address of the user, which will be registered and whitelisted in the Registry smart contract 
   </td>
  </tr>
</table>

The Partner will receive a prepared meta-transaction which can be signed by the user, using his, e.g., metamask wallet, to sign the transaction and store his wallet in the BlockChain Registry contract.

A simple JavaScript snippet to call the API and use Web3 to trigger Metamask on the user’s browser to sign the transaction could look like this:


```js
var transaction = await requestTransaction(Url, accessToken);    
console.log("The transaction: ", transaction["preparedTransaction"]);

   const tx = new ethereumjs.Tx(transaction["preparedTransaction"]);

   const params = {
       gas: '0x124F8', // 30400
       gasPrice: '0x9184e72a000',
       gasLimit: '0x2710',
       to: '0xB8D7d897BdCe6f6454b54E808461B337058cDB0B',
       value: '0x00',
       data: '0x' + tx.data.toString("hex"),
       from: selectedAccount
   }

   await window.ethereum.request({
       method: 'eth_sendTransaction',
       params: [params],
   }).then((result) => {
       console.log('Transaction Hash:', result)
   });
```



## 


## Interacting with the Smart Contract

The deployed Registry Smart Contract has a set of methods the partner can interact with:


![alt_text](https://lh4.googleusercontent.com/Cc2HFdIJqGc6MbTi8J9BUJsB4KPQ9rrIeROjP_9T6dztbbv412XX1hYaptYYJYLh_qnLlCirSCg4C65fNqdk0iYl_hT-XLDeGoPkGTo_PqGdwn0WufAG9sML2jYfReK5GsWSyR83 "image_tooltip")


In order to interact with the methods using Web3 in the browser, these simple calls can be used:


### Retrieve number of total registered Wallets


```js
 const totalWallets = await theContract.methods.getTotalWallets().call();
```



### Checking if a Wallet has been Whitelisted


```js
const isWhitelisted = await theContract.methods.isWhitelisted(selectedAccount).call();
```



### Removing a Wallet from the Whitelist


```js
await theContract.methods.removeWallet(selectedAccount).send({ from: selectedAccount }, function (err, res) {
               if (err) {
                   showInfo("An error occured" + err, "error");
                   return
               }
               console.log("Hash of the transaction: " + res);
});
```

