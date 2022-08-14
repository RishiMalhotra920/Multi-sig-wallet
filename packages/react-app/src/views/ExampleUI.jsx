import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { utils } from "ethers";
import { SyncOutlined } from "@ant-design/icons";

import { useEventListener } from "eth-hooks/events/useEventListener";

// import {EtherInput}
import { Address, Balance, Events, EtherInput } from "../components";

import AddSigners from "./sections/AddSigners";

export default function ExampleUI({
  purpose,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  async function createUnsignedTx() {
    const result = tx(
      writeContracts.YourContract.createUnsignedTx(newTx.account, utils.parseEther(newTx.amount.toString())),
      update => {
        console.log("📡 Authorized signer Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          console.log(" 🍾 Transaction " + update.hash + " finished!");
          console.log(
            " ⛽️ " +
              update.gasUsed +
              "/" +
              (update.gasLimit || update.gas) +
              " @ " +
              parseFloat(update.gasPrice) / 1000000000 +
              " gwei",
          );
        }
      },
    );
    console.log("awaiting metamask/web3 confirm result...", result);
    console.log(await result);
  }

  async function signTx() {
    const result = tx(writeContracts.YourContract.signTx(), update => {});
    console.log("awaiting metamask/web3 confirm result...", result);
    console.log(await result);
  }

  async function removeAuthorizedSignersAndPendingTxs() {
    const result = tx(writeContracts.YourContract.removeAuthorizedSignersAndPendingTxs(), update => {});
    console.log("awaiting metamask/web3 confirm result...", result);
    console.log(await result);
  }

  const [newSigners, setNewSigners] = useState([]);
  console.log("current newSigners", newSigners);
  const [newNumSignersRequired, setNewNumSignersRequired] = useState();
  const [numSignersRequired, setNumSignersRequired] = useState();
  console.log("logging newSigners", newSigners);
  const [newTx, setNewTx] = useState({ address: "", amount: "" });

  const pendingTxEvents = useEventListener(readContracts, "YourContract", "UnsignedTxCreated", localProvider, 1);
  const txSentEvents = useEventListener(readContracts, "YourContract", "TxSent", localProvider, 1);

  const [pendingTx, setPendingTx] = useState({ account: null, amount: null });
  console.log("logging this account", pendingTxEvents[pendingTxEvents.length - 1]?.args);

  useEffect(() => {
    setPendingTx({
      account: pendingTxEvents[pendingTxEvents.length - 1]?.args?.account,
      amount: pendingTxEvents[pendingTxEvents.length - 1]?.args?.amount,
    });
    console.log("logging this account", pendingTxEvents[pendingTxEvents.length - 1]?.args?.account);
  }, [pendingTxEvents]);

  useEffect(() => {
    setPendingTx({
      account: "",
      amount: "",
    });
    console.log("Tx done");
  }, [txSentEvents]);

  const authorizedSignersEvents = useEventListener(
    readContracts,
    "YourContract",
    "SignersAuthorized",
    localProvider,
    1,
  );
  const [authorizedSigners, setAuthorizedSigners] = useState([]);
  useEffect(() => {
    setAuthorizedSigners(authorizedSignersEvents[authorizedSignersEvents.length - 1]?.args?.authorizedSigners);
    setNumSignersRequired(authorizedSignersEvents[authorizedSignersEvents.length - 1]?.args?.numSignersRequired);
  }, [authorizedSignersEvents]);

  const AuthorizedSignersAndPendingTxsRemovedEvents = useEventListener(
    readContracts,
    "YourContract",
    "AuthorizedSignersAndPendingTxsRemoved",
    localProvider,
    1,
  );
  useEffect(() => {
    setAuthorizedSigners([]);
    setNumSignersRequired(0);
  }, [AuthorizedSignersAndPendingTxsRemovedEvents]);

  return (
    <div>
      {/* <p>hey {pendingTransactionEvents.args.toString()}</p> */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        Your Contract Address:
        <Address
          address={readContracts && readContracts.YourContract ? readContracts.YourContract.address : null}
          ensProvider={localProvider}
          fontSize={16}
        />
        <Divider />
        <h2>Contract Balance:</h2>
        <Balance
          address={readContracts && readContracts.YourContract ? readContracts.YourContract.address : null}
          provider={localProvider}
          price={price}
        />
        <Divider />
        {authorizedSigners?.length !== 0 ? (
          <>
            <h2>Send New Transaction</h2>
            <p style={{ marginBottom: 10 }}>Account</p>
            <Input
              style={{ width: "80%" }}
              onChange={e => {
                setNewTx(prevNewTx => ({ account: e.target.value, value: prevNewTx.amount }));
              }}
            />
            <p style={{ marginTop: 20, marginBottom: 10 }}>Ether Amount</p>
            <p>this: {newTx.amount}</p>
            <div style={{ width: "80%", margin: "auto" }}>
              <EtherInput
                autofocus
                price={price}
                value={newTx.amount}
                placeholder="Enter amount"
                onChange={value => {
                  setNewTx(prevNewTx => ({ account: prevNewTx.account, amount: value }));
                }}
              />
            </div>
            <div style={{ margin: 14 }}></div>
            <Button
              onClick={() => {
                createUnsignedTx();
              }}
            >
              Sign Transaction
            </Button>
            <div style={{ margin: 8 }}></div>
            <Divider />
            <h2 style={{ marginBottom: "20px" }}>Pending Transactions</h2>
            <table style={{ width: "100%", marginBottom: "40px" }}>
              <tr>
                <th>To:</th>
                <th>Amount:</th>
                <th></th>
              </tr>

              {pendingTx.account && pendingTx.amount && (
                <tr>
                  <td>
                    <Address
                      address={pendingTx?.account}
                      ensProvider={mainnetProvider}
                      // blockExplorer={blockExplorer}
                      fontSize={13}
                    />
                    {/* {pendingTx?.account?.slice(0, 5) + "..." + pendingTx?.account?.slice(pendingTx?.account?.length - 4)} */}
                  </td>
                  <td>{pendingTx.amount && utils.formatEther(pendingTx?.amount?.toString())}</td>
                  <td>
                    <Button style={{ marginTop: 8, width: "40%" }} onClick={() => signTx()}>
                      Sign
                    </Button>
                  </td>
                </tr>
              )}
            </table>
            <Divider />
            <h2 style={{ marginBottom: "20px" }}>Current Signers</h2>
            {authorizedSigners?.map(currentSigner => (
              <Address
                address={currentSigner}
                ensProvider={mainnetProvider}
                // blockExplorer={blockExplorer}
                fontSize={13}
              />
            ))}
            <p>
              Num signers required:<b>{numSignersRequired?.toString()}</b>
            </p>
            <Divider />
            <Button onClick={() => removeAuthorizedSignersAndPendingTxs()}>
              Remove Authorized Signers and Pending Tasks
            </Button>
          </>
        ) : (
          <AddSigners
            newSigners={newSigners}
            setNewSigners={setNewSigners}
            newNumSignersRequired={newNumSignersRequired}
            setNewNumSignersRequired={setNewNumSignersRequired}
            tx={tx}
            writeContracts={writeContracts}
          />
        )}
      </div>
      <Divider />
      <h2>Signers Authorized Events</h2>
      <Events
        contracts={readContracts}
        contractName="YourContract"
        eventName="SignersAuthorized"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
      <Divider />
      <h2>Unsigned Tx Created Events</h2>
      <Events
        contracts={readContracts}
        contractName="YourContract"
        eventName="UnsignedTxCreated"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
      <Divider />
      <h2>Tx Signed Events</h2>
      <Events
        contracts={readContracts}
        contractName="YourContract"
        eventName="TxSigned"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
      <h2>Tx Sent Events</h2>
      <Events
        contracts={readContracts}
        contractName="YourContract"
        eventName="TxSent"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
    </div>
  );
}
