window.OWNER_CONFIG = {
  CHAIN_ID_DEC: 56,
  CHAIN_ID_HEX: "0x38",
  CHAIN_NAME: "BSC Mainnet",
  RPC_URL: "https://bsc-dataseed.binance.org/",
  BLOCK_EXPLORER: "https://bscscan.com",

  // ===== Addresses =====
  USDT: "0x55d398326f99059fF775485246999027B3197955",
  DF:   "0x36579d7eC4b29e875E3eC21A55F71C822E03A992",

  CORE:   "0x342d668401572175C21972aF34d0Dc38Aa57F81D",
  VAULT:  "0x2bc3dB5AdB26ef1F192f7Bd6b0B3359d0E796D9a",
  BINARY: "0xD78043E993D0F6cC95F5f81eE927883BbFc41Ac6",
  STAKING:"0x4Dfa9EFEAc6069D139CF7ffEe406FAB78d7410A7",

  // ===== Minimal ABIs for Owner Admin =====
  CORE_ABI: [
    "function owner() view returns(address)",
    "function transferOwnership(address n)"
  ],

  VAULT_ABI: [
    "function owner() view returns(address)",
    "function setCore(address c)",
    "function surplusUSDT() view returns(uint256)",
    "function surplusDF() view returns(uint256)",
    "function withdrawSurplusUSDT(address to, uint256 amount)",
    "function withdrawSurplusDF(address to, uint256 amount)",
    "function transferOwnership(address n)"
  ],

  BINARY_ABI: [
    "function owner() view returns(address)",
    "function setCore(address c)",
    "function transferOwnership(address n)"
  ],

  STAKING_ABI: [
    "function owner() view returns(address)",
    "function setMLM(address _mlm)",
    "function ownerWithdrawDF(address to, uint256 amount)",
    "function transferOwnership(address n)"
  ]
};
