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
    
     /**
     * @dev Private function returns the next token id to be created
     * @return Next token id.
     */
    function _getNextTokenId() private view returns (uint256) {
        return totalSupply().add(1);
    }
    
    /**
     * @dev Function to mint tokens by minters
     * @param to The address that will receive the minted tokens.
     * @param tokenURI The token URI of the minted token.
     * @return A boolean that indicates if the operation was successful.
     */
    function mintWithTokenURI(address to, string memory tokenURI) public onlyMinter returns (bool) {
        uint256 tokenId = _getNextTokenId();
        require(
          !_tokenOwnerByURI[to][tokenURI],
          "Acconunt already has a token for that uri"
        );
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _tokenOwnerByURI[to][tokenURI] = true;
        return true;
    }
}
