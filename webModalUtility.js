/**
 * Example JavaScript code that interacts with the page and Web3 wallets
 */

// Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

// Web3modal instance
let web3Modal
// Chosen wallet provider given by the dialog window
let provider;
// Address of the selected account
let selectedAccount;
// All Metamask Accounts; only accounts[0] will be selected
let accounts;

/**
 * Setup the orchestra
 */
async function initWallet() {

    console.log("WalletConnectProvider is", WalletConnectProvider);
    console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

    // Check that the web page is run in a secure context,
    // as otherwise MetaMask won't be available

    if (location.protocol !== 'https:') {
        alert("Not a secure connection!")
        return;
    }

    // Tell Web3modal what providers we have available.
    // Built-in web browser provider (only one can exist as a time)
    // like MetaMask, Brave or Opera is added automatically by Web3modal
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                // Miguel's test key - don't copy as your mileage may vary
                infuraId: "ac240982f9804e358d1f59fc60a5c451",
            }
        }
    };

    web3Modal = new Web3Modal({
        network: "mainnet", // optional
        cacheProvider: true, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

    console.log("Web3Modal instance is", web3Modal);
}

/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {
    // Get a Web3 instance for the wallet

    web3 = new Web3(provider);
    console.log("Web3 instance is", web3);

    accounts = null;

    // Get list of accounts of the connected wallet
    try {
        accounts = await web3.eth.getAccounts();
    } catch (error) {
        console.log("Wallet still not connected: ", error);
    }

    if (accounts != null) {
        const chainId = await web3.eth.getChainId();
        console.log("CHAIN ID=> ", chainId);

        if (chainId != 4) {
            alert("This demo only works in Rinkeby");
        } else {
            // MetaMask does not give you all accounts, only the selected account
            console.log("Got accounts", accounts);
            if (accounts.length != 0) {
                selectedAccount = accounts[0];
            }

            document.dispatchEvent(new CustomEvent('Wallet',
                {
                    bubbles: true,
                    detail: {
                        status: "connected",
                        wallet: selectedAccount
                    }
                }));
        }
    }
}

async function onConnect() {

    try {
        provider = await web3Modal.connect();
    } catch (e) {
        console.log("Could not get a wallet connection", e);
        return;
    }

    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        fetchAccountData();
    });

    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
        fetchAccountData();
    });

    await fetchAccountData(provider);
}

async function onDisconnect() {
    console.log("Killing the wallet connection", provider);
    // If the cached provider is not cleared,
    // WalletConnect will default to the existing session
    // and does not allow to re-scan the QR code with a new wallet.
    // Depending on your use case you may want or want not his behavir.
    await web3Modal.clearCachedProvider();
    provider = null;

    selectedAccount = null;
}