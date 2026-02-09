window.OWNER_CONFIG = {
  // ===== Network =====
  CHAIN_ID_DEC: 56,
  CHAIN_ID_HEX: "0x38",
  CHAIN_NAME: "BSC Mainnet",
  RPC_URL: "https://bsc-dataseed.binance.org/",
  BLOCK_EXPLORER: "https://bscscan.com",

  // ===== Tokens =====
  USDT: "0x55d398326f99059fF775485246999027B3197955",
  DF:   "0x36579d7eC4b29e875E3eC21A55F71C822E03A992",

  // ===== Contracts =====
  CORE:   "0x342d668401572175C21972aF34d0Dc38Aa57F81D",
  VAULT:  "0x2bc3dB5AdB26ef1F192f7Bd6b0B3359d0E796D9a",
  BINARY: "0xD78043E993D0F6cC95F5f81eE927883BbFc41Ac6",
  STAKING:"0x4Dfa9EFEAc6069D139CF7ffEe406FAB78d7410A7",

  // ===== Minimal ERC20 ABI =====
  ERC20_ABI: [
    { "inputs":[], "name":"decimals", "outputs":[{"type":"uint8"}], "stateMutability":"view", "type":"function" }
  ],

  // ===== CoreV5 (admin) =====
  CORE_ABI: [
    { "inputs":[], "name":"owner", "outputs":[{"type":"address"}], "stateMutability":"view", "type":"function" },
    {
      "inputs":[
        {"type":"address","name":"vault"},
        {"type":"address","name":"binary"},
        {"type":"address","name":"staking"},
        {"type":"address","name":"treasury_"},
        {"type":"address","name":"companyWallet"}
      ],
      "name":"setConfig",
      "outputs":[],
      "stateMutability":"nonpayable",
      "type":"function"
    },
    { "inputs":[{"type":"address","name":"n"}], "name":"transferOwnership", "outputs":[], "stateMutability":"nonpayable", "type":"function" }
  ],

  // ===== VaultV6 (admin) =====
  VAULT_ABI: [
    { "inputs":[], "name":"owner", "outputs":[{"type":"address"}], "stateMutability":"view", "type":"function" },
    { "inputs":[{"type":"address","name":"c"}], "name":"setCore", "outputs":[], "stateMutability":"nonpayable", "type":"function" },
    { "inputs":[], "name":"surplusUSDT", "outputs":[{"type":"uint256"}], "stateMutability":"view", "type":"function" },
    { "inputs":[], "name":"surplusDF", "outputs":[{"type":"uint256"}], "stateMutability":"view", "type":"function" },
    { "inputs":[{"type":"address","name":"to"},{"type":"uint256","name":"amount"}], "name":"withdrawSurplusUSDT", "outputs":[], "stateMutability":"nonpayable", "type":"function" },
    { "inputs":[{"type":"address","name":"to"},{"type":"uint256","name":"amount"}], "name":"withdrawSurplusDF", "outputs":[], "stateMutability":"nonpayable", "type":"function" },
    { "inputs":[{"type":"address","name":"n"}], "name":"transferOwnership", "outputs":[], "stateMutability":"nonpayable", "type":"function" }
  ],

  // ===== BinaryV4 (admin) =====
  BINARY_ABI: [
    { "inputs":[], "name":"owner", "outputs":[{"type":"address"}], "stateMutability":"view", "type":"function" },
    { "inputs":[{"type":"address","name":"c"}], "name":"setCore", "outputs":[], "stateMutability":"nonpayable", "type":"function" },
    { "inputs":[{"type":"address","name":"n"}], "name":"transferOwnership", "outputs":[], "stateMutability":"nonpayable", "type":"function" }
  ],

  // ===== StakingV4 (admin) =====
  STAKING_ABI: [
    { "inputs":[], "name":"owner", "outputs":[{"type":"address"}], "stateMutability":"view", "type":"function" },
    { "inputs":[{"type":"address","name":"_mlm"}], "name":"setMLM", "outputs":[], "stateMutability":"nonpayable", "type":"function" },
    { "inputs":[{"type":"address","name":"n"}], "name":"transferOwnership", "outputs":[], "stateMutability":"nonpayable", "type":"function" }
  ]
};
