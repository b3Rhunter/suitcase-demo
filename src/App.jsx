import { Col, Row, notification, Modal, Alert, Button } from "antd";
import "antd/dist/antd.css";
import {
  useBalance,
  useContractLoader,
  useGasPrice,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { Link, Route, Switch } from "react-router-dom";
import "./App.css";
import {
  Account,
  Contract,
  Header,
  NetworkDisplay,
  NetworkSwitch,
} from "./components";
import { NETWORKS, INFURA_ID } from "./constants";
import externalContracts from "./contracts/external_contracts";
// contracts
import { Transactor, Web3ModalSetup } from "./helpers";
import { useStaticJsonRPC } from "./hooks";

import sanityClient from "./client.js";
import Logo from "./images/bp_logo_512.png";
import "./myCss.css";
import OnePost from "./OnePost";
import newGmn from "./newGMN.json";
import gmnabi from "./gmnabi.json";
import ABI from "./ABI.json";
import imageUrlBuilder from "@sanity/image-url";

import MailchimpSubscribe from "react-mailchimp-subscribe";
import twitterLogo from "./images/twitterLogo.svg";
import discordLogo from "./images/discordLogo.svg";

const { ethers } = require("ethers");

/// 📡 What chain are your contracts deployed to?
const initialNetwork = NETWORKS.mumbai; // <------- select your target frontend network (localhost, goerli, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = false;
const NETWORKCHECK = true;
const USE_BURNER_WALLET = false; // toggle burner wallet feature
const USE_NETWORK_SELECTOR = false;

const web3Modal = Web3ModalSetup();

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://mainnet.infura.io/v3/${INFURA_ID}`,
  "https://rpc.scaffoldeth.io:48544",
];

function App(props) {
  // specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
  // reference './constants.js' for other networks
  const networkOptions = [initialNetwork.name, "mainnet", "goerli"];

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);
  const [goMint, setMint] = useState(false);
  const [claim, setClaim] = useState(false)

  const targetNetwork = NETWORKS[selectedNetwork];

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;

  // load all your providers
  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER
      ? process.env.REACT_APP_PROVIDER
      : targetNetwork.rpcUrl,
  ]);
  const mainnetProvider = useStaticJsonRPC(providers);

  if (DEBUG) console.log(`Using ${selectedNetwork} network`);

  // 🛰 providers
  if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (
      injectedProvider &&
      injectedProvider.provider &&
      typeof injectedProvider.provider.disconnect == "function"
    ) {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(
    injectedProvider,
    localProvider,
    USE_BURNER_WALLET
  );
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId =
    localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner &&
    userSigner.provider &&
    userSigner.provider._network &&
    userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // const contractConfig = useContractConfig();

  const contractConfig = { externalContracts: externalContracts };

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, localChainId);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (
      DEBUG &&
      mainnetProvider &&
      address &&
      selectedChainId &&
      yourLocalBalance &&
      yourMainnetBalance &&
      readContracts &&
      writeContracts &&
      mainnetContracts
    ) {
      console.log(
        "_____________________________________ 🏗 scaffold-eth _____________________________________"
      );
      console.log("🌎 mainnetProvider", mainnetProvider);
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log(
        "💵 yourLocalBalance",
        yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "..."
      );
      console.log(
        "💵 yourMainnetBalance",
        yourMainnetBalance
          ? ethers.utils.formatEther(yourMainnetBalance)
          : "..."
      );
      console.log("📝 readContracts", readContracts);
      console.log("🌍 DAI contract on mainnet:", mainnetContracts);

      console.log("🔐 writeContracts", writeContracts);
    }
  }, [
    mainnetProvider,
    address,
    selectedChainId,
    yourLocalBalance,
    yourMainnetBalance,
    readContracts,
    writeContracts,
    mainnetContracts,
    localChainId,
  ]);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", (chainId) => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [isAuth, setIsAuth] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const sendNotification = (type, data) => {
    return notification[type]({
      ...data,
      placement: "bottomRight",
    });
  };

  // Sign In With Ethereum

  const handleSignIn = async () => {
    if (web3Modal.cachedProvider === "") {
      return sendNotification("error", {
        message: "Failed to Sign In!",
        description: "Please Connect a wallet before Signing in",
      });
    }

    setIsSigning(true);

    try {
      // sign message using wallet
      const message = `GMN Verify`;
      const address = await userSigner.getAddress();
      let signature = await userSigner.signMessage(message);

      const isValid = await validateUser(message, address, signature);

      if (!isValid) {

        throw new Error("Your are not a holder.");
      }
      setIsAuth(isValid);
      setClaim(true);

      // notify user of sign-in
      sendNotification("success", {
        message: "Welcome back " + address.substr(0, 6) + "...",
      });
    } catch (error) {
      sendNotification("error", {
        message: "Verification Failed!",
        description: `Connection issue - ${error.message}`,
      });
    }

    setIsSigning(false);
  };

  // Token Gate 🚫
  const validateUser = async (message, address, signature) => {
    // validate signature
    const recovered = ethers.utils.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return false;
    }

    try {
      // validate token balance
      const tokenAddress = "0x4aDdb5d5cE77f2e8e41c6925AbA541E58F7335a6";
      const tokenContract = new ethers.Contract(tokenAddress, ABI, userSigner);
      const balance = await tokenContract.balanceOf(address);
      const id = await tokenContract.tokenOfOwnerByIndex(address, "0");
      const parsedId = Number(ethers.utils.hexlify(id));
      console.log(parsedId);
      console.log(balance);
      return balance.gt(0);
    } catch (error) {
      setMint(true);
      console.log(error);
      return false;
    }
  };

  return (
    <div className="App background">
      <Header>
        {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", flex: 1 }}>
            {USE_NETWORK_SELECTOR && (
              <div style={{ marginRight: 20 }}>
                <NetworkSwitch
                  networkOptions={networkOptions}
                  selectedNetwork={selectedNetwork}
                  setSelectedNetwork={setSelectedNetwork}
                />
              </div>
            )}
            <Account
              useBurner={USE_BURNER_WALLET}
              address={address}
              localProvider={localProvider}
              userSigner={userSigner}
              mainnetProvider={mainnetProvider}
              price={price}
              web3Modal={web3Modal}
              loadWeb3Modal={loadWeb3Modal}
              logoutOfWeb3Modal={logoutOfWeb3Modal}
              blockExplorer={blockExplorer}
            />
          </div>
        </div>
      </Header>

<div className=" p-12 mobile" style={{ marginBottom: "0px" }}>
        <div className="container mx-auto">
          <p style={{fontSize: "2000%", marginBottom: "50px"}}>💼</p>

{!goMint && (
          <button
          className="verify"
          style={{
            position: "absolute",
            top: "450px",
            left: "0px",
            right: "0px",
            width: "150px"
          }}
          onClick={handleSignIn}
          loading={isSigning}
        >
          Verify
        </button>
)}

{goMint && (
            <><div 
            className="verify"
            style={{
              position: "absolute",
              top: "450px",
              left: "0px",
              right: "0px",
              width: "150px"
            }}
        >
          <button
            onClick={async () => {
              const contract = new ethers.Contract(
                "0x4aDdb5d5cE77f2e8e41c6925AbA541E58F7335a6",
                ABI,
                userSigner
              );
              const cost = contract.price();
              const result = tx(
                contract.mintItem({ value: cost }),
                (update) => {
                  console.log("📡 Transaction Update:", update);
                  if (update &&
                    (update.status === "confirmed" || update.status === 1)) {
                    setIsAuth(true);
                    sendNotification("success", {
                      message: "Minted",
                      description: `You can now view any article of your choice.`,
                    });
                    console.log(
                      " 🍾 Transaction " + update.hash + " finished!"
                    );
                    console.log(
                      " ⛽️ " +
                      update.gasUsed +
                      "/" +
                      (update.gasLimit || update.gas) +
                      " @ " +
                      parseFloat(update.gasPrice) / 1000000000 +
                      " gwei"
                    );
                  }
                }
              );
              console.log(
                "awaiting metamask/web3 confirm result...",
                result
              );
              console.log(await result);
            } }
          >
            <b>Mint</b>
          </button>
        </div> 
</>
  )
}

{claim && (
  <div 
            className="verify"
            style={{
              position: "absolute",
              top: "450px",
              left: "0px",
              right: "0px",
              width: "150px"
            }}
        >
            <button
              onClick={async () => {
                const contract = new ethers.Contract(
                  "0x4aDdb5d5cE77f2e8e41c6925AbA541E58F7335a6",
                  ABI,
                  userSigner
                );
                const id = contract.tokenOfOwnerByIndex(address, 0);
                const result = tx(contract.Emission(id), (update) => {
                  console.log("📡 Transaction Update:", update);
                  if (update &&
                    (update.status === "confirmed" || update.status === 1)) {
                    setIsAuth(true);
                    sendNotification("success", {
                      message: "Claimed!",
                      description: `You claimed your daily LAW tokens.`,
                    });
                    console.log(" 🍾 Transaction " + update.hash + " finished!");
                    console.log(
                      " ⛽️ " +
                      update.gasUsed +
                      "/" +
                      (update.gasLimit || update.gas) +
                      " @ " +
                      parseFloat(update.gasPrice) / 1000000000 +
                      " gwei"
                    );
                  }
                });
                console.log("awaiting metamask/web3 confirm result...", result);
                console.log(await result);
              } }
            >
              <b>Claim</b>
            </button>
          </div>
)}


        </div>
      </div>

      <NetworkDisplay
        NETWORKCHECK={NETWORKCHECK}
        localChainId={localChainId}
        selectedChainId={selectedChainId}
        targetNetwork={targetNetwork}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
        USE_NETWORK_SELECTOR={USE_NETWORK_SELECTOR}
      />

      <Switch>
        <Route exact path="/debug">
          {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}

          <Contract
            name="YourContract"
            price={price}
            signer={userSigner}
            provider={localProvider}
            address={address}
            blockExplorer={blockExplorer}
            contractConfig={contractConfig}
          />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
