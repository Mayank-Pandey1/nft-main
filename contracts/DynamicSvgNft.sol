//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicSvgNft is ERC721 {
    uint256 private s_tokenCounter;
    string private s_lowImageUri;
    string private s_highImageUri;
    string private constant base64EncodedSvgPrefix =
        "data:image/svg+xml;base64,";
    AggregatorV3Interface private immutable i_priceFeed;
    mapping(uint256 => int256) private s_tokenIdToHighValues;

    //EVENTS
    event CreatedNFT(uint256 indexed tokenId, int256 highPrice);

    constructor(
        string memory lowSvg,
        string memory highSvg,
        address priceFeedAddress
    ) ERC721("Dynamic SVG Nft", "DSN") {
        s_tokenCounter = 0;
        s_lowImageUri = svgToImageUri(lowSvg);
        s_highImageUri = svgToImageUri(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function mintNft(int256 highPrice) public {
        s_tokenIdToHighValues[s_tokenCounter] = highPrice;
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        emit CreatedNFT(s_tokenCounter, highPrice);
    }

    function svgToImageUri(
        string memory svg
    ) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return
            string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    /*
    ERC721 code comes with a tokenURI and the tokenURI is what points to the json output
    
    First we Base64 encoded the svg image to get the imageURI and then we insert 
    that image URI into the token JSON data and now we Base64 encode the JSON to get the tokenURI*/

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) {
            revert ERC721Metadata__URI_QueryFor_NonExistentToken();
        }

        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = s_lowImageUri;
        if (price >= s_tokenIdToHighValues[tokenId]) {
            imageURI = s_highImageUri;
        }
        return (
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '", "description":"An NFT that changes based on the chainlink Feed",',
                                '"attributes": [{"trait_type": "coolness", "value":100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            )
        );
    }
}
