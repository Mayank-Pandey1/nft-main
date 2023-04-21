const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNft tests", async () => {
          let basicNft;
          let deployer;
          beforeEach(async () => {
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["basicnft"]);
              basicNft = await ethers.getContract("BasicNft");
              //   deployer = (await getNamedAccounts()).deployer;
              //   //specifying which account we want connected to our deployed baiscNft contract

              //   await deployments.fixture(["all"]); //using fixture we can deploy our contracts with as many tags as we want
              //   //running all the deploy scripts using this line

              //   basicNft = await ethers.getContract("BasicNft", deployer);
              //   //Returns a new connection to a contract at contractAddressOrName with the contractInterface.
          });

          describe("Constructor", () => {
              it("Initializes the NFT correctly", async () => {
                  const name = await basicNft.name();
                  const symbol = await basicNft.symbol();
                  const tokenCounter = await basicNft.getTokenCounter();

                  assert.equal(name, "Dogie");
                  assert.equal(symbol, "DOG");
                  assert.equal(tokenCounter.toString(), "0");
              });
          });

          describe("Mint NFT", () => {
              beforeEach(async () => {
                  const txResponse = await basicNft.mintNFT();
                  await txResponse.wait(1);
              });
              it("Allows users to mint NFT and updates the values correctly", async () => {
                  const tokenURI = await basicNft.tokenURI(0);
                  const tokenCounter = await basicNft.getTokenCounter();

                  assert.equal(tokenURI, await basicNft.TOKEN_URI());
                  assert.equal(tokenCounter.toString(), "1");
              });
              it("shows the correct balance and owner of NFT", async () => {
                  const deployerAddress = await deployer.address;
                  const deployerBalance = await basicNft.balanceOf(
                      deployerAddress
                  );
                  const owner = await basicNft.ownerOf("0");
                  assert.equal(deployerBalance.toString(), "1");
                  assert.equal(deployerAddress, owner);
              });
          });
      });
