import React from "react";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";

const AddSigners = ({
  newSigners,
  setNewSigners,
  newNumSignersRequired,
  setNewNumSignersRequired,
  tx,
  writeContracts,
}) => {
  async function setNewAuthorizedSigners() {
    /* look how you call setPurpose on your contract: */
    /* notice how you pass a call back for tx updates too */
    const result = tx(writeContracts.YourContract.setAuthorizedSigners(newSigners, newNumSignersRequired), update => {
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
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    console.log(await result);
    setNewSigners([]);
    setNewNumSignersRequired(null);
  }
  return (
    <div>
      <h2>Add Signers</h2>
      {newSigners.map((el, index) => {
        return (
          <>
            <Input
              style={{ width: "80%" }}
              value={newSigners[index]}
              onChange={e => {
                setNewSigners(prevAuthorizedSigners => [
                  ...prevAuthorizedSigners.slice(0, index),
                  e.target.value,
                  ...prevAuthorizedSigners.slice(index + 1),
                ]);
              }}
            />
            <Button
              onClick={() => {
                setNewSigners(prevAuthorizedSigners => [
                  ...prevAuthorizedSigners.slice(0, index),
                  ...prevAuthorizedSigners.slice(index + 1),
                ]);
              }}
            >
              -
            </Button>
          </>
        );
      })}
      <Button
        style={{ marginTop: 8, marginRight: "17px", float: "right" }}
        onClick={() => setNewSigners(prevAuthorizedSigners => [...prevAuthorizedSigners, ""])}
      >
        +
      </Button>
      <table style={{ width: "90%", marginBottom: "20px", marginTop: "80px", marginLeft: "auto", marginRight: "auto" }}>
        <tr>
          <td>Num Signers Required</td>
          <td>
            <Input style={{}} value={newNumSignersRequired} onChange={e => setNewNumSignersRequired(e.target.value)} />
          </td>
        </tr>
      </table>
      <Button style={{ marginTop: 8, width: "90%", margin: "10px" }} onClick={setNewAuthorizedSigners}>
        Set Signers
      </Button>
    </div>
  );
};

export default AddSigners;
