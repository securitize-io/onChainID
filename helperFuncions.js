////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// ==========================
// showSecuritizeIDLogInLogo
// ==========================
// @baseUrl: SecuritizeID URL (diffent for DEV, RC, Sandobox & Production)
// @issuerID
// @redirecturl
//
// Shows the SecuritizeID logo; on click, it redirects the user to baseURL
//
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function showSecuritizeIDLogInLogo(baseUrl, issuerID, redirecturl) {
    var scope = "info";
    var securitizeID = document.getElementById("SecuritizeID");
    var link = document.createElement("a");
    var logo = document.createElement("img");

    var href = baseUrl + "#/authorize" + "?issuerId=" + issuerID + "&scope=" + scope + "&redirecturl=" + redirecturl;
    logo.src = "./images/securitizeID.png";
    link.href = href;
    link.id = "SecuritizeLogo";
    link.appendChild(logo);
    securitizeID.appendChild(link);
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// ==========================
// captureTOKEN
// ==========================
//
// Parses the URL, extracts the Token (code)
// @return string - the code
// 
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function captureTOKEN() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get("code");
    const country = urlParams.get("country");
    const authorized = urlParams.get("authorized");
    console.log(code, country, authorized);
    if (code != null) { // User has signed-up and has a SecuritizeID
        return code;
    }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// ==========================
// requestAccessToken
// ==========================
//
// @Url: URL to hit the Connect API and receive the User's Access Token
// @code: The code that has been captured by captureTOKEN
// @secret: Application secret, provided by Customer Success
// @clientId: Is actually the IssuerId, also provide by Customer Success
// @return string: Access Token
// 
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function requestAccessToken(Url, code, secret, clientId) {
    var xhr = new XMLHttpRequest();
    var responseString = null;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                response = JSON.parse(this.responseText);
                console.log("Authorized with access Token: ", response.accessToken);
                responseString = JSON.parse('{"response":"OK", "accessToken":"' + response.accessToken + '"}');
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

    //xhr.withCredentials = true;
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

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// ==========================
// requestAccessTokenDUMMY
// ==========================
// Dummy function which returns a valid access Token
// Only useful for testing purposes if we don't want the complete interaction
//
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function requestAccessTokenDUMMY(Url, code, secret, clientId) {
    var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NUb2tlbiI6ImE1MjYxY2Y5LWZhMDctNDNjNC1iM2ZlLWE0MTI0ZWZhNzBiZCIsImludmVzdG9ySWQiOiI2MWVlZGRjYTlhMThkNjAwMTNhZDc0Y2QiLCJjbGllbnRJZCI6IjhjMGM3YzIzLTU4NjUtNDBhYS05Zjc3LWZlN2U3MzNkNWFmNyIsImlhdCI6MTY0MzA1MTA2NSwiZXhwIjoxNjQzNjU1ODY1fQ.zGGE6xZeYWAnKTSjBzrCSKYzeaECcRXYBJM4HKChI8w"
    responseString = JSON.parse('{"response":"OK", "accessToken":"' + token + '"}');
    return responseString;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// ==========================
// showInfo
// ==========================
// @msg: Message to be shown in the Info Div
// @type: "info" or "error": it will simply change the background color 
//
// Utility function to display messages in <div id="info">
//
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function showInfo(msg, type = "info") {
    var p = document.createElement("p");
    p.innerHTML = msg;
    switch (type) {
        case "info":
            p.classList.add("info");
            break;
        case "error":
            p.classList.add("error");
            break;
    }
    document.getElementById("info").appendChild(p);

}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// ==========================
// requestAttestation
// ==========================
// @Url: API URL 
// @type: accessToken from requestAccessToken(Url, code, secret, clientId) 
//
// Call's Securitize API to check if the user complies with the Attestation
// Rules defined by the partner / service
//
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function requestAttestation(Url, accessToken) {
    console.log(Url);
    var xhr = new XMLHttpRequest();
    var response;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                response = JSON.parse(this.responseText);
                console.log("Attestation Response: ", response);
                //return response;
            }
            else {
                //return null;
            }
        }
    });
    xhr.open("GET", Url, false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("access-token", accessToken);
    xhr.send();
    return response;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// ==========================
// attestationFrontEnd
// ==========================
// @Url: API URL 
// @type: accessToken from requestAccessToken(Url, code, secret, clientId) 
//
// Front end which shows a button to check if the investor complies with the
// Attestation Conditions.
//
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function attestationFrontEnd(Url, accessToken) {
    var button = document.createElement("button");
    button.innerHTML = "Request User Attestation";
    button.addEventListener("click", async function () {
        var attestation = await requestAttestation(Url, accessToken);
        showInfo("Attestation Result: " + attestation["status"], "info");
    });
    document.getElementById("SecuritizeID").appendChild(button);
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// ==========================
// requestTransaction
// ==========================
// @Url: API URL 
// @type: accessToken from requestAccessToken(Url, code, secret, clientId) 
//
// API call to request the meta-transaction to register the user Wallet into
// the BlockChain
//
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function requestTransaction(Url, accessToken) {
    Url += "/wallets/" + selectedAccount + "/whitelist";
    console.log(Url);
    var xhr = new XMLHttpRequest();
    var response;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                response = JSON.parse(this.responseText);
                console.log("Response: ", response);
                //return response;
            }
            else {
                //return null;
            }
        }
    });
    xhr.open("GET", Url, false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("access-token", accessToken);
    xhr.send("{securitizeId:" + accessToken);
    return response;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// ==========================
// registerWallet
// ==========================
// @Url: API URL 
// @type: accessToken from requestAccessToken(Url, code, secret, clientId) 
//
// 1.- Creates a Button to enable the user to activate the process of Registering the Wallet
// 2.- Calls requestTransaction(Url, accessToken) to get the meta-transaction
// 3.- Prepares the trasaction so it can be used by Web3 Wallet
// 4.- Triggers the event (window.ethereum.request) to perform the transaction
//     which the user has to sign, and pay for the fees, to register the wallet 
//     in the BlockChain
//
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function registerWallet(Url, accessToken) {
    // Creating the Button
    var button = document.createElement("button");
    button.id = "transactionButton";
    button.innerHTML = "Register Wallet";

    // When the button get's clicked:
    button.addEventListener("click", async function () {
        var transaction = await requestTransaction(Url, accessToken); // We call the API to get the prepared transaction
        console.log("The transaction: ", transaction["preparedTransaction"]);

        const tx = new ethereumjs.Tx(transaction["preparedTransaction"]);

        //const tx = new ethereumjs.Tx("0xf9014a80843b9aca00835b8d8094b8d7d897bdce6f6454b54e808461b337058cdb0b80b901246e5832f2000000000000000000000000000000000000000000000000000000000000001be1fca24c7015d3fd98a0d90cb6c463be42716b2226fa92c256cae9c350cd26b847f5e99a3350c11f69bfff091be5f2414d93a60341d30d68672b405aebe1ccbe00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000005b8d8000000000000000000000000000000000000000000000000000000000000000440a2a9a01000000000000000000000000d67f9a1c7698fce39b138b0016f6a7d637617763000000000000000000000000000000000000000000000000000000000099802b00000000000000000000000000000000000000000000000000000000808080");
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
    });
    document.getElementById("SecuritizeID").appendChild(button);
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// ==========================
// connectWalletFrontEnd
// ==========================
// @Url: API URL 
// @accessTokeb: accessToken from requestAccessToken(Url, code, secret, clientId) 
// @contactAddress: BlockChain Address where the Registry contract has been deployed
//
// Front end which set's up all the "Crypto"-related functionality
//
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function connectWalletFrontEnd(Url, accessToken, contractAddress) {
    var button = document.createElement("button");
    button.id = "connectWalletButton";
    button.innerHTML = "Connect Wallet";

    button.addEventListener("click", async function () {
        await onConnect(); // Connect the Wallet
        button.innerHTML = selectedAccount; // Show wallet public address
        if (!document.getElementById("transactionButton"))
            registerWallet(Url, accessToken); // Show the Resgiter Wallet Button
        if (document.querySelector(".smartContractBtn") == null) // if the SmartContract Interaction Frontend has not been shown yet
            smartContractInteractionFrontend(contractAddress);
    });
    document.getElementById("SecuritizeID").appendChild(button);
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// =================================
// smartContractInteractionFrontend
// =================================
//
// Quick & dirty functions to interact, on the web browser, with
// the Registry Smart Contract
//
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
async function smartContractInteractionFrontend(contractAddress = "0xB8D7d897BdCe6f6454b54E808461B337058cDB0B") {
    theContract = new web3.eth.Contract(RegistryABI, contractAddress);

    console.log("The Contract: ", theContract);
    theContract.options.gas = 5000000;

    var button = document.createElement("button");
    button.classList.add("smartContractBtn");
    button.innerHTML = "Total Wallets";
    button.addEventListener("click", async function () {
        const totalWallets = await theContract.methods.getTotalWallets().call();
        console.log("TOTAL REGISTERED WALLETS: ", totalWallets);
        const msg = "Total Registered Wallets = " + totalWallets;
        showInfo(msg);
    });
    document.getElementById("SecuritizeID").appendChild(button);

    button = document.createElement("button");
    button.classList.add("smartContractBtn");
    button.innerHTML = "Is Whitelisted?";
    button.addEventListener("click", async function () {
        const isWhitelisted = await theContract.methods.isWhitelisted(selectedAccount).call();
        console.log("Is Whitelisted: ", isWhitelisted);
        if (isWhitelisted)
            showInfo(selectedAccount + " is Whitelisted");
        else
            showInfo(selectedAccount + " is not Whitelisted", "error");
    });
    document.getElementById("SecuritizeID").appendChild(button);

    button = document.createElement("button");
    button.classList.add("smartContractBtn");
    button.innerHTML = "Remove from Whitelist";
    button.addEventListener("click", async function () {
        await theContract.methods.removeWallet(selectedAccount).send({ from: selectedAccount }, function (err, res) {
            if (err) {
                showInfo("An error occured" + err, "error");
                return
            }
            console.log("Hash of the transaction: " + res);
            showInfo("Removing Wallet: please wait to be confirmed on the BlockChain");
        });
        showInfo("Wallet succesfully removed");
    });
    document.getElementById("SecuritizeID").appendChild(button);
}
