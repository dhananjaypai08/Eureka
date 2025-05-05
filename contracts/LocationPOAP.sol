// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts@4.7.0/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.7.0/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@4.7.0/access/Ownable.sol";
import "@openzeppelin/contracts@4.7.0/utils/Counters.sol"; 

contract LocationPOAP is ERC721, ERC721URIStorage, Ownable {
    struct Location {
        string title;
        string ipfs;
        string latitude;
        string longitude;
    }
    struct PoapCount{
        address user;
        uint256 poaps;
    }
    mapping (address => Location[]) public user_poaps;
    mapping(address => uint256) public user_poaps_count;
    address[] public users;

    constructor() ERC721("LPOAP", "LPOAP") {}
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    function safeMint(address to, string memory ipfs, string memory latitude, string memory longitude, string memory title) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfs);
        user_poaps[to].push(Location({title : title , ipfs: ipfs , latitude: latitude, longitude: longitude}));
        user_poaps_count[to] += 1;
        bool exists = false;
        for(uint i = 0; i < users.length; i++){
            if(users[i] == to){
                exists = true;
                break;
            }
        }
        if(!exists){
            users.push(to);
        }
    }

    function get_all_user_poaps_count() public view returns(PoapCount[] memory){
        PoapCount[] memory all_user_poaps = new PoapCount[](users.length); 
        for (uint i = 0; i < users.length; i++){
            uint poap_count = user_poaps_count[users[i]];
             all_user_poaps[i].user = users[i];
             all_user_poaps[i].poaps = poap_count;
        }
        return all_user_poaps;
    }

    function get_user_poaps(address user) public view returns(Location[] memory) {
        return user_poaps[user];
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
 
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _beforeTokenTransfer(
    address from, 
    address to, 
    uint256 tokenId
    ) internal override virtual {
        require(from == address(0), "Err: token transfer is BLOCKED");   
        super._beforeTokenTransfer(from, to, tokenId);  
    }

}