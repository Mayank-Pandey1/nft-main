const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random Ipfs Nft test", () => {
          let randomIpfsNft, deployer, vrfCoordinatorV2Mock;
          beforeEach(async () => {
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["mocks", "randomIpfs"]);
              randomIpfsNft = await ethers.getContract("RandomIpfsNft");
              vrfCoordinatorV2Mock = await ethers.getContract(
                  "VRFCoordinatorV2Mock"
              );
          });

          describe("constructor", () => {
              it("sets the values correctly", async () => {
                  const nftTokenUri = await randomIpfsNft.getNftTokenUri(0);
                  const isInitialized = await randomIpfsNft.getInitialized();
                  assert(nftTokenUri.includes("ipfs://"));
                  assert.equal(isInitialized, true);
              });
          });

          describe("requestNft", () => {
              it("reverts if no ETH is sent along with the request", async () => {
                  await expect(
                      randomIpfsNft.requestNft()
                  ).to.be.revertedWithCustomError(
                      randomIpfsNft,
                      "RandomIpfsNft__NeedMoreETHSent"
                  );
              });

              it("reverts if less ETH is sent along with the request", async () => {
                  const fee = await randomIpfsNft.getMintFee();
                  await expect(
                      randomIpfsNft.requestNft({
                          value: fee.sub(ethers.utils.parseEther("0.001")),
                      })
                  ).to.be.revertedWithCustomError(
                      randomIpfsNft,
                      "RandomIpfsNft__NeedMoreETHSent"
                  );
              });

              it("emits nftRequested event", async () => {
                  const fee = await randomIpfsNft.getMintFee();
                  await expect(
                      randomIpfsNft.requestNft({ value: fee.toString() })
                  ).to.emit(randomIpfsNft, "NftRequested");
              });
          });

          describe("fullfillRandomWords", async () => {
              it("mints NFT after random number is returned", async function () {
                  await new Promise(async (resolve, reject) => {
                      randomIpfsNft.once("NftMinted", async () => {
                          try {
                              const tokenUri = await randomIpfsNft.tokenURI(
                                  "0"
                              );
                              const tokenCounter =
                                  await randomIpfsNft.getTokenCounter();
                              assert.equal(
                                  tokenUri.toString().includes("ipfs://"),
                                  true
                              );
                              assert.equal(tokenCounter.toString(), "1");
                              resolve();
                          } catch (e) {
                              console.log(e);
                              reject(e);
                          }
                      });
                      try {
                          const fee = await randomIpfsNft.getMintFee();
                          const requestNftResponse =
                              await randomIpfsNft.requestNft({
                                  value: fee.toString(),
                              });
                          const requestNftReceipt =
                              await requestNftResponse.wait(1);
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestNftReceipt.events[1].args.requestId,
                              randomIpfsNft.address
                          );
                      } catch (e) {
                          console.log(e);
                          reject(e);
                      }
                  });
              });
          });

          describe("getBreedFromModdedRange", () => {
              it("returns a PUG if range is from 0-9", async () => {
                  const expectedValue =
                      await randomIpfsNft.getBreedFromModdedRange(6);
                  assert.equal(0, expectedValue);
              });

              it("returns a SHIBA-INU if range is from 10-39", async () => {
                  const expectedValue =
                      await randomIpfsNft.getBreedFromModdedRange(30);
                  assert.equal(1, expectedValue);
              });

              it("returns a ST-BERNARD if range is from 40-99", async () => {
                  const expectedValue =
                      await randomIpfsNft.getBreedFromModdedRange(60);
                  assert.equal(2, expectedValue);
              });
          });
      });
