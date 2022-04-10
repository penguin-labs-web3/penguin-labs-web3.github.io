var currentAccount = "";

const CONTRACT_ADDRESS = '0x3E96b6100196414628023893Ee80bA8a120eDb63'; // TODO: UPDATE
const ALLOWED_CHAIN = "0x4"; // TODO: change back to 0x1
const QUANTITY_TO_PRICE = {
    1:  "0x9FDF42F6E48000",  // .045 (45000000000000000)
    2:  "0x13FBE85EDC90000", // .09 (90000000000000000)
    3:  "0x1DF9DC8E4AD8000", // .135 (135000000000000000)
    4:  "0x27F7D0BDB920000", // .18  (180000000000000000)
    5:  "0x31F5C4ED2768000", // .225 (225000000000000000)
    6:  "0x3BF3B91C95B0000", // .27  (270000000000000000)
    7:  "0x45F1AD4C03F8000", // .315 (315000000000000000)
    8:  "0x4FEFA17B7240000", // .36  (360000000000000000)
    9:  "0x59ED95AAE088000", // .405 (405000000000000000)
    10: "0x63EB89DA4ED0000", // .45  (450000000000000000)
    11: "0x6DE97E09BD18000", // .495 (495000000000000000)
    12: "0x77E772392B60000", // .54  (540000000000000000)
    13: "0x81E5666899A8000", // .585 (585000000000000000)
    14: "0x8BE35A9807F0000", // .63  (630000000000000000)
    15: "0x95E14EC77638000", // .675 (675000000000000000)
};
const QUANTITY_TO_DATA =  {
    1: "0x6f4da3d50000000000000000000000000000000000000000000000000000000000000001",
    2: "0x6f4da3d50000000000000000000000000000000000000000000000000000000000000002",
    3: "0x6f4da3d50000000000000000000000000000000000000000000000000000000000000003",
    4: "0x6f4da3d50000000000000000000000000000000000000000000000000000000000000004",
    5: "0x6f4da3d50000000000000000000000000000000000000000000000000000000000000005",
    6: "0x6f4da3d50000000000000000000000000000000000000000000000000000000000000006",
    7: "0x6f4da3d50000000000000000000000000000000000000000000000000000000000000007",
    8: "0x6f4da3d50000000000000000000000000000000000000000000000000000000000000008",
    9: "0x6f4da3d50000000000000000000000000000000000000000000000000000000000000009",
    10: "0x6f4da3d5000000000000000000000000000000000000000000000000000000000000000a",
    11: "0x6f4da3d5000000000000000000000000000000000000000000000000000000000000000b",
    12: "0x6f4da3d5000000000000000000000000000000000000000000000000000000000000000c",
    13: "0x6f4da3d5000000000000000000000000000000000000000000000000000000000000000d",
    14: "0x6f4da3d5000000000000000000000000000000000000000000000000000000000000000e",
    15: "0x6f4da3d5000000000000000000000000000000000000000000000000000000000000000f",
};

TOTAL_SUPPLY_ABI = '0x18160ddd';


function setupPage() {
    // this will be called when the page first loads, but we don't know that the page is fully loaded
    if (document.readyState == 'complete') {
        doActualSetup();
    } else {
        document.onreadystatechange = function () {
            if (document.readyState === "complete") {
                doActualSetup();
            }
        }
    }
}

function doActualSetup(){
    if (window.ethereum) {
        ethereum.request({ method: 'eth_accounts' })
        .then(accountsChanged)
        .catch((err) => {
            // Some unexpected error.
            // For backwards compatibility reasons, if no accounts are available,
            // eth_accounts will return an empty array.
            console.error(err);
        });
        ethereum.on('chainChanged', chainChanged);
        setInterval(updateTotalSupply, 5000);
    }
}

function connectMetamask() {
    if (!ethereum) {
        alert("There were no ethereum utilities detected in your browser. Please install MetaMask or another web3 wallet extension, and ensure it is enabled.");
        return
    }
    ethereum.request({ method: 'eth_requestAccounts' })
    .then(() => {
        ethereum.request({ method: 'eth_accounts' })
        .then(accountsChanged)
        .catch((err) => {
            // Some unexpected error.
            // For backwards compatibility reasons, if no accounts are available,
            // eth_accounts will return an empty array.
            console.error(err);
        });
    });
}

function mint() {
    // TODO: fill this out with contract info
    const quantity = $('.quantity__input');
    const value = quantity.val();
    const price = QUANTITY_TO_PRICE[value];
    const data = QUANTITY_TO_DATA[value];
    if (!price) {
        alert("The quantity entered must be a whole number between 1 and 15. Please correct this and try again.");
        return;
    }

    params = {"from": currentAccount, "to": CONTRACT_ADDRESS, "value": price, "data": data}
    ethereum.request({method: 'eth_sendTransaction', params: [params]}).then((transactionHash) => {
        alert("Your transaction is now in progress! The transaction hash is " + transactionHash + " - please utilize your web3 provide (e.g. metamask) to check for updates or cancel if needed.")
    }).catch((err) => {
        console.error("User rejected metamask transaction");
        console.error(err);
        alert("Your initiated mint transaction was not submitted. If you did not intend to reject the transaction, please try again.")
    });
}

function accountsChanged(accounts) {
    if (accounts.length === 0) {
        // MetaMask is locked or the user has not connected any accounts
        // disable minting and enable connecting
        document.querySelector('#btn-connect').innerText = "Connect Metamask Wallet To Enable Minting";
        document.querySelector('#wallet-info').style.display = "none";
        document.querySelector('.quantity').style.display = "none";
        document.querySelector('#chain-info').style.display = "none";
        $('#btn-connect').prop("disabled", false);
        document.querySelector('#btn-connect').onclick = connectMetamask;
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        // disable connecting and enable minting
        document.querySelector('#btn-connect').innerText = "Click To Mint";
        // unhide 
        document.querySelector('#wallet-info').innerText = "Detected Wallet Address is: " + currentAccount;
        document.querySelector('#wallet-info').style.display = "inline-block";
        document.querySelector('.quantity').style.display = "flex";
        document.querySelector('#btn-connect').onclick = mint;

        ethereum.request({ method: 'eth_chainId' }).then((chainId) => {
            if (chainId != ALLOWED_CHAIN) {
                document.querySelector('#chain-info').style.display = "inline-block";
                $('#btn-connect').prop("disabled", true);
            } else {
                document.querySelector('#chain-info').style.display = "none";
                $('#btn-connect').prop("disabled", false);
            }
        });
    }
}

function chainChanged(chainId) {
    // Handle the new chain.
    // Correctly handling chain changes can be complicated, so we just reload
    window.location.reload();
}

function updateTotalSupply() {
    var minted = "0";
    ethereum.request({method: 'eth_call', params:[{to:CONTRACT_ADDRESS, data:TOTAL_SUPPLY_ABI}, "latest"]}).then((data) => {
        minted = parseInt(data, 16);
        var text = minted + "/5555 Passes have been minted.";
        if (minted == 10000) {
            text += " Sorry that you missed the sale, but if you head over to OpenSea, you can get your pass on the secondary!"
        }
        document.querySelector("#supply").innerText = text;
    });
}

function clickMinus() {
    const input = $('.quantity__input');
    var value = input.val();
    if (value > 1) {
      value--;
    }
    input.val(value);
};
  
function clickPlus() {
    const input = $('.quantity__input');
    var value = input.val();
    if (value < 15) {
      value++;
    }
    input.val(value);
};

