window.OWNER_CONFIG = {
  // ===== Network =====
  CHAIN_ID_DEC: 56,
  CHAIN_ID_HEX: "0x38",
  CHAIN_NAME: "BSC Mainnet",
  RPC_URL: "https://bsc-dataseed.binance.org/",
  BLOCK_EXPLORER: "https://bscscan.com",

  // ===== Contracts =====
  CORE: "0x342d668401572175C21972aF34d0Dc38Aa57F81D",      // CoreV5
  VAULT: "0x2bc3dB5AdB26ef1F192f7Bd6b0B3359d0E796D9a",     // VaultV6
  STAKING: "0x4Dfa9EFEAc6069D139CF7ffEe406FAB78d7410A7",   // StakingV4
  BINARY: "0xD78043E993D0F6cC95F5f81eE927883BbFc41Ac6",    // BinaryV4

  DF: "0x36579d7eC4b29e875E3eC21A55F71C822E03A992",
  USDT: "0x55d398326f99059fF775485246999027B3197955",

  // ===== ABI (owner ใช้เฉพาะที่จำเป็น) =====
  VAULT_ABI: [
    "function surplusUSDT() view returns(uint256)",
    "function surplusDF() view returns(uint256)",
    "function withdrawSurplusUSDT(address to, uint256 amount)",
    "function withdrawSurplusDF(address to, uint256 amount)",
    "function setCore(address c)"
  ],

  STAKING_ABI: [
    "function ownerWithdrawDF(address to, uint256 amount)"
  ],

  BINARY_ABI: [
    "function setCore(address c)"
  ]
};
