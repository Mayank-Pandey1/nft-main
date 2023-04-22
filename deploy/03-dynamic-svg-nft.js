const { network, ethers } = require("hardhat");
const { deployments, getNamedAccounts } = require("hardhat");
const {
    developmentChains,
    networkConfig,
} = require("../helper-hardhat-config");
const fs = require("fs");
const { verify } = require("../utils/verify");

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await ethers.getContract("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    }

    const lowSvg = fs.readFileSync("./images/DynamicNft/frown.svg", {
        encoding: "utf8",
    });
    const highSvg = fs.readFileSync("./images/DynamicNft/happy.svg", {
        encoding: "utf8",
    });

    log("-----------------------------");
    args = [ethUsdPriceFeedAddress, lowSvg, highSvg];

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying....");
        await verify(dynamicSvgNft.address, args);
    }
};

module.exports.tags = ["all", "dynamicsvg", "main"];
