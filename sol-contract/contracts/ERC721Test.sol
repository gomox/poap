pragma solidity ^0.5.2;

import "./openzeppelin/token/ERC721/ERC721Full.sol";
import "./openzeppelin/token/ERC721/ERC721MetadataMintable.sol";
import "./openzeppelin/token/ERC721/ERC721Burnable.sol";

/**
 * @title ERC721TEST
 */
contract ERC721TEST is ERC721Full, ERC721MetadataMintable, ERC721Burnable {
    constructor (string memory name, string memory symbol) public ERC721MetadataMintable() ERC721Full(name, symbol) {
        // solhint-disable-previous-line no-empty-blocks
    }
}