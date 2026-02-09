window.OWNER_CONFIG = {
  // ===== Network =====
  CHAIN_ID_DEC: 56,
  CHAIN_ID_HEX: "0x38",
  CHAIN_NAME: "BSC Mainnet",
  RPC_URL: "https://bsc-dataseed.binance.org/",
  BLOCK_EXPLORER: "https://bscscan.com",

  // ===== Addresses =====
  USDT:   "0x55d398326f99059fF775485246999027B3197955",
  DF:     "0x36579d7eC4b29e875E3eC21A55F71C822E03A992",

  CORE:   "0x342d668401572175C21972aF34d0Dc38Aa57F81D",
  VAULT:  "0x2bc3dB5AdB26ef1F192f7Bd6b0B3359d0E796D9a",
  BINARY: "0xD78043E993D0F6cC95F5f81eE927883BbFc41Ac6",
  STAKING:"0x4Dfa9EFEAc6069D139CF7ffEe406FAB78d7410A7",

  // ===== Minimal ABIs for owner actions =====
  ERC20_ABI: [
    {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"},
    {"constant":true,"inputs":[{"name":"a","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"},
    {"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"amt","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"}
  ],

  VAULT_ABI: [
    {"inputs":[{"internalType":"address","name":"c","type":"address"}],"name":"setCore","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"surplusUSDT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"surplusDF","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawSurplusUSDT","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawSurplusDF","outputs":[],"stateMutability":"nonpayable","type":"function"}
  ],

  BINARY_ABI: [
    {"inputs":[{"internalType":"address","name":"c","type":"address"}],"name":"setCore","outputs":[],"stateMutability":"nonpayable","type":"function"}
  ],

  STAKING_ABI: [
    {"inputs":[{"internalType":"address","name":"_mlm","type":"address"}],"name":"setMLM","outputs":[],"stateMutability":"nonpayable","type":"function"}
  ]
};
