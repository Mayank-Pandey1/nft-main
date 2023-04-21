## Three contracts

1: Basic NFT
2: Random Ipfs Nft : Hosted on Ipfs
3: Dynamic Svg Nft  : Hosted completely on chain

## Basic NFT

Hardcoded the tokenURI in BaiscNFT contract because everyone who will mint an NFT will get the same dog NFT
In reality, we never hardcode the tokenURI 

## Random IPFS NFT 
when we will mint an NFT, We will trigger a chainlink VRF v2 call to get a random number
using that random number, we will get a random nft
options available: PUG, Shiba Inu, St. Bernard

users pay to mint an NFT
the owner of the contract can withdraw the ETH

## Dynamic SVG NFT
- scalable vector graphics -> minimalistic size no matter how complex the art is. (less costly)
- The NFT will be dynamic -> will change depending upon some real-time parameter

parameter here: if the price of ETH is above x: Smiley
                                        else: frown face