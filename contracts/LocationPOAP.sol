// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@openzeppelin/contracts@4.7.0/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.7.0/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@4.7.0/access/Ownable.sol";
import "@openzeppelin/contracts@4.7.0/utils/Counters.sol"; 

contract LocationPOAP is ERC721, ERC721URIStorage, Ownable, AutomationCompatibleInterface{
    struct Quest {
        uint256 id;
        string title;
        address creator;
        string clue;
        uint256 reward;
        uint256 expiresAt;
        bool isActive;
    }
    uint256 public immutable interval;
    uint256 public lastTimeStamp;
    Quest[] public all_quests;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct Location {
        string title;
        string ipfs;
        string latitude;
        string longitude;
    }

    struct PoapCount {
        address user;
        uint256 poaps;
    }

    uint256 public constant MAX_MINTS_PER_USER = 9;

    mapping(address => Location[]) public user_poaps;
    mapping(address => bool) public isUser;
    address[] public users;

    mapping(address => bool) public isWhitelisted;

    event POAPMinted(address indexed user, uint256 tokenId);
    event UserWhitelisted(address indexed user);

    constructor(uint256 updateInterval) ERC721("LPOAP", "LPOAP") {
        whitelist(msg.sender);
        interval = updateInterval;
        lastTimeStamp = block.timestamp;
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        upkeepNeeded = false;

        for (uint i = 0; i < all_quests.length; i++) {
            if (all_quests[i].isActive && all_quests[i].expiresAt < block.timestamp) {
                upkeepNeeded = true;
                break;
            }
        }
    }


    function performUpkeep(bytes calldata /* performData */) external override {
        if ((block.timestamp - lastTimeStamp) > interval) {
            lastTimeStamp = block.timestamp;

            for (uint i = 0; i < all_quests.length; i++) {
                if (all_quests[i].isActive && all_quests[i].expiresAt < block.timestamp) {
                    all_quests[i].isActive = false;
                }
            }
        }
    }

    function getAllQuests() public view returns (Quest[] memory) {
        return all_quests;
    }

    function createQuest(string memory clue, uint256 reward, string memory title, uint256 _expiry) public {
        Quest memory new_quest = Quest(all_quests.length, title, msg.sender, clue, reward, _expiry, true);
        all_quests.push(new_quest);
    }

    function whitelist(address user) public onlyOwner {
        isWhitelisted[user] = true;
        emit UserWhitelisted(user);
    }

    function safeMint(address to, string memory ipfs, string memory latitude, string memory longitude, string memory title) public {
        require(isWhitelisted[msg.sender], "Not whitelisted");
        require(user_poaps[to].length < MAX_MINTS_PER_USER, "Max POAPs claimed");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfs);

        user_poaps[to].push(Location(title, ipfs, latitude, longitude));

        if (!isUser[to]) {
            users.push(to);
            isUser[to] = true;
        }

        emit POAPMinted(to, tokenId);
    }

    function get_all_user_poaps_count() public view returns (PoapCount[] memory) {
        PoapCount[] memory result = new PoapCount[](users.length);
        for (uint i = 0; i < users.length; i++) {
            result[i] = PoapCount(users[i], user_poaps[users[i]].length);
        }
        return result;
    }

    function get_all_users() public view returns(address[] memory){
        return users;
    }

    function get_all_users_count() public view returns(uint256) {
        return users.length;
    }

    function get_user_poaps(address user) public view returns (Location[] memory) {
        return user_poaps[user];
    }

    // Block transfers and approvals
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override {
        require(from == address(0), "Token is non-transferable");
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function approve(address, uint256) public pure override {
        revert("Approvals not allowed");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("Approvals not allowed");
    }

    // Override burn and URI
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
}