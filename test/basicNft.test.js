const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { assert } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip //if not a development chain
    : describe("BasicNft", function () {
          // if a development chain
          let basicNft, deployer;

          beforeEach(async function () {
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["all"]);
              basicNft = await ethers.getContract("BasicNFT");
              // specifying which account we want connected to our deployed basicNft contract since we will be making transactions
              // while testing
              await deployments.fixture(["all"]);
              // using fixture we can deploy our contracts with as many tags as we want
              // running all the deploy scripts using this line
          });

          describe("constructor", () => {
              it("initializes the NFT correctly", async () => {
                  const name = await basicNft.name();
                  const symbol = await basicNft.symbol();
                  const tokenCounter = await basicNft.getTokenCounter();

                  assert.equal(name, "Doggie");
                  assert.equal(symbol, "DOG");
                  assert.equal(tokenCounter, "0");
              });
          });
          describe("Mint Nft", () => {
              beforeEach(async () => {
                  const txResponse = await basicNft.mintNFT();
                  await txResponse.wait(1);
              });
              it("Mints the Nft and updates are done successfully", async () => {
                  const tokenURI = await basicNft.tokenURI(0);
                  const tokenCounter = await basicNft.getTokenCounter();

                  assert.equal(tokenCounter.toString(), "1");
                  assert.equal(tokenURI, await basicNft.TOKEN_URI());
              });
              it("Show the correct balance and owner of an NFT", async function () {
                  const deployerAddress = deployer.address;
                  const deployerBalance = await basicNft.balanceOf(
                      deployerAddress
                  );
                  const owner = await basicNft.ownerOf("0");

                  assert.equal(deployerBalance.toString(), "1");
                  assert.equal(owner, deployerAddress);
              });
          });
      });
