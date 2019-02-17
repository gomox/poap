pragma solidity ^0.5.2;

import "./openzeppelin/token/ERC721/ERC721Full.sol";
import "./openzeppelin/token/ERC721/ERC721Burnable.sol";
import "./openzeppelin/access/roles/MinterRole.sol";


/**
 * @title ERC721POAP
 */
contract ERC721POAP is ERC721Full, ERC721Burnable, MinterRole {
    
    mapping (address => mapping (string => bool)) private _tokenOwnerByURI;


    constructor (string memory name, string memory symbol) public ERC721Full(name, symbol) {
        // solhint-disable-previous-line no-empty-blocks
    }
    
}
