var currentAccount = "";

const CONTRACT_ADDRESS = '0xaaB430F524Dc07C83d83B2918dF5cA6AEd4F5468'; 
const ALLOWED_CHAIN = "0x1"; 
const QUANTITY_TO_PRICE = {
    1:  "0xb1a2bc2ec50000",  // .05 (50000000000000000)
    2:  "0x16345785D8A0000",
    3:  "0x214e8348c4f0000",
    4:  "0x2c68af0bb140000",
    5:  "0x3782dace9d90000",
    6:  "0x429d069189e0000",
    7:  "0x4db732547630000",
    8:  "0x58d15e176280000",
    9:  "0x63eb89da4ed0000",
    10: "0x6f05b59d3b20000",
    11: "0x7a1fe1602770000",
    12: "0x853a0d2313c0000",
    13: "0x905438e60010000",
    14: "0x9b6e64a8ec60000",
    15: "0xa688906bd8b0000",
};
const QUANTITY_TO_DATA =  {
    1: "0xa0712d680000000000000000000000000000000000000000000000000000000000000001",
    2: "0xa0712d680000000000000000000000000000000000000000000000000000000000000002",
    3: "0xa0712d680000000000000000000000000000000000000000000000000000000000000003",
    4: "0xa0712d680000000000000000000000000000000000000000000000000000000000000004",
    5: "0xa0712d680000000000000000000000000000000000000000000000000000000000000005",
    6: "0xa0712d680000000000000000000000000000000000000000000000000000000000000006",
    7: "0xa0712d680000000000000000000000000000000000000000000000000000000000000007",
    8: "0xa0712d680000000000000000000000000000000000000000000000000000000000000008",
    9: "0xa0712d680000000000000000000000000000000000000000000000000000000000000009",
    10: "0xa0712d68000000000000000000000000000000000000000000000000000000000000000a",
    11: "0xa0712d68000000000000000000000000000000000000000000000000000000000000000b",
    12: "0xa0712d68000000000000000000000000000000000000000000000000000000000000000c",
    13: "0xa0712d68000000000000000000000000000000000000000000000000000000000000000d",
    14: "0xa0712d68000000000000000000000000000000000000000000000000000000000000000e",
    15: "0xa0712d68000000000000000000000000000000000000000000000000000000000000000f",
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
    if (ethereum) {
        ethereum.request({ method: 'eth_accounts' })
        .then(accountsChanged)
        .catch((err) => {
            // Some unexpected error.
            // For backwards compatibility reasons, if no accounts are available,
            // eth_accounts will return an empty array.
            console.error(err);
        });
        ethereum.on('chainChanged', chainChanged);
        setInterval(updateTotalSupply, 3000);
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
    console.log(params);
    ethereum.request({method: 'eth_sendTransaction', params: [params]}).then((transactionHash) => {
        alert("Your transaction is now in progress! The transaction hash is " + transactionHash + " - please utilize your web3 provide (e.g. metamask) to check for updates or cancel if needed.")
    }).catch((err) => {
        console.error("User rejected metamask transaction");
        console.error(err);
        alert("Your initiated mint transaction was not submitted. If you did not intend to reject the transaction, please try again.")
    });
}

function accountsChanged(accounts) {
    if (accounts.length == 0) {
        // MetaMask is locked or the user has not connected any accounts
        // disable minting and enable connecting
        document.querySelector('#btn-connect').innerText = "Connect Metamask Wallet";
        // document.querySelector('#wallet-info').style.display = "none";
        document.querySelector('.quantity').style.display = "none";
        $('#btn-connect').prop("disabled", false);
        document.querySelector('#btn-connect').onclick = connectMetamask;
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        console.log(currentAccount);
        console.log(accounts);
        // disable connecting and enable minting
        document.querySelector('#btn-connect').innerText = "Click To Mint";
        // unhide 
        // document.querySelector('#wallet-info').innerText = "Detected Wallet Address is: " + currentAccount;
        // document.querySelector('#wallet-info').style.display = "inline-block";
        document.querySelector('.quantity').style.display = "flex";
        document.querySelector('#btn-connect').onclick = mint;

        ethereum.request({ method: 'eth_chainId' }).then((chainId) => {
            if (chainId != ALLOWED_CHAIN) {
                $('#btn-connect').prop("disabled", true);
            } else {
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
    ethereum.request({ method: 'eth_chainId' }).then((chainId) => {
        if (chainId != ALLOWED_CHAIN) {
            var text = "Unable to load number of remaining memberships due to connected wallet not being configured for the Ethereum Mainnet.";
            document.querySelector("#supply").innerText = text;
        } else {
            ethereum.request({method: 'eth_call', params:[{to:CONTRACT_ADDRESS, data:TOTAL_SUPPLY_ABI}, "latest"]}).then((data) => {
                minted = parseInt(data, 16)-1;
                if (minted < 0) {
                    minted = 0;
                }
                var text = (5555-minted).toLocaleString('en-US') + "/5,555 Memberships Remaining.";
                document.querySelector("#supply").innerText = text;
            });
        }
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

setupPage();
