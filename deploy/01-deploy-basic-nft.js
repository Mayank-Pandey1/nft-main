//import
//main function
//calling of main function

// function deployFunc(hre) {
//      console.log("Hi");
//      const {getNamedAccounts, deployments} = hre
//      hre.getNamedAccounts()
//      hre.deployments
// }

// module.exports.default = deployFunc;

const { network } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments; //getting variables from deployments object
    const { deployer } = await getNamedAccounts();

    log("---------------------------");

    const arguments = [];
    const basicNft = await deploy("BasicNFT", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying...");
        await verify(basicNft.address, arguments);
        log("------------------------");
    }
};

module.exports.tags = ["all", "basicNft"];
