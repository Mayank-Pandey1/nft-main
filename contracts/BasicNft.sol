//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721 {
    uint256 private s_tokenCounter;       //tokenID
    string public constant TOKEN_URI =    //tokenURI is a json text which has imageURI inside of it and is not the same as imageURI
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    constructor() ERC721("Dogie", "DOG") {
        s_tokenCounter = 0;
    }

    function mintNFT() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        return s_tokenCounter;
    }

    /** @notice A distinct Uniform Resource Identifier (URI) for a given asset.
        @dev Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC
    3986. The URI may point to a JSON file that conforms to the "ERC721
    Metadata JSON Schema". */
    function tokenURI(uint256 /*tokenId*/) public view override returns(string memory) {
        //require(_exists(tokenId));
        return TOKEN_URI;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
