//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NeedMoreETHSent();
error RandomIpfsNft__TransactionFailed();
error RandomIpfsNft__AlreadyInitialized();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // when we will mint an NFT, We will trigger a chainlink VRF v2 call to get a random number
    // using that random number, we will get a random nft
    // options available: PUG, Shiba Inu, St. Bernard
    // users pay to mint an NFT
    // the owner of the contract can withdraw the ETH

    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    //VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    mapping(uint256 => address) public s_tokenIdToOwner;

    uint256 public s_tokenCounter;
    string[] internal s_nftTokenURIs;
    uint256 internal immutable i_mintFee;
    bool private s_initialized;

    uint256 internal constant MAX_CHANCE_VALUE = 100;

    //EVENTS
    event NftRequested(uint256 requestId, address requester);
    event NftMinted(Breed nftBreed, address minter);

    constructor(
        address vrfCoordinatorV2,
        bytes32 gasLane, //keyHash
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        string[3] memory nftTokenUris,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT", "RIN") {
        //Address of the contract that does the random number verification
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2); //Interface + address = contract
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_nftTokenURIs = nftTokenUris;
        i_mintFee = mintFee;
        _initializeContract(nftTokenUris);
    }

    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) revert RandomIpfsNft__NeedMoreETHSent();

        requestId = i_vrfCoordinator.requestRandomWords( //calling the request function on the vrf coordinator contract
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_tokenIdToOwner[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
    }

    function _initializeContract(string[3] memory nftTokenUris) private {
        if (s_initialized) {
            revert RandomIpfsNft__AlreadyInitialized();
        }
        s_nftTokenURIs = nftTokenUris;
        s_initialized = true;
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        address nftOwner = s_tokenIdToOwner[requestId];
        uint256 newTokenId = s_tokenCounter;

        uint256 modedRng = randomWords[0] % 100; //0-99

        Breed nftBreed = getBreedFromModdedRange(modedRng);
        _safeMint(nftOwner, newTokenId);
        s_tokenCounter += 1;
        _setTokenURI(newTokenId, s_nftTokenURIs[uint256(nftBreed)]);
        emit NftMinted(nftBreed, nftOwner);
    }

    function getBreedFromModdedRange(
        uint256 moddedRng
    ) public pure returns (Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            // Pug = 0 - 9  (10%)
            // Shiba-inu = 10 - 39  (30%)
            // St. Bernard = 40 - 99 (60%)
            if (moddedRng >= cumulativeSum && moddedRng < chanceArray[i]) {
                return Breed(i);
            }
            cumulativeSum = chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds();
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIpfsNft__TransactionFailed();
        }
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 40, MAX_CHANCE_VALUE];
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getNftTokenUri(uint256 index) public view returns (string memory) {
        return s_nftTokenURIs[index];
    }

    function getTokenCounter() public view returns (uint256 tokwnCounter) {
        return s_tokenCounter;
    }

    function getInitialized() public view returns (bool) {
        return s_initialized;
    }
}
