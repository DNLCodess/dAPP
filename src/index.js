const { ethers } = require("ethers");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server URL is " + rollup_server);

function generateRandomNumber() {
  return Math.floor(Math.random() * 100) + 1;
}

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));

  const randomNumber = generateRandomNumber();
  console.log("Generated random number: " + randomNumber);

  return {
    status: "accept",
    randomNumber: randomNumber,
  };
}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));
  return {
    status: "accept",
  };
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(finish),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      const result = await handler(rollup_req["data"]);
      finish["status"] = result.status;

      if (result.randomNumber) {
        finish["randomNumber"] = result.randomNumber;
      }
    }
  }
})();
