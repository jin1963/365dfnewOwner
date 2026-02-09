;(() => {
  "use strict";
  const C = window.OWNER_CONFIG;
  const $ = (id) => document.getElementById(id);

  const setText = (id, t) => { const el = $(id); if (el) el.textContent = t; };
  const shortAddr = (a) => a ? (a.slice(0, 6) + "..." + a.slice(-4)) : "-";

  function toast(msg, type = "ok") {
    const el = $("toast");
    if (!el) return;
    el.classList.remove("show");
    el.textContent = msg;
    el.style.background = type === "err" ? "#7f1d1d" : "#0b1220";
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2400);
  }

  function setStatus(t){ setText("status", t); }

  let provider=null, signer=null, me=null;
  let df=null, vault=null, binary=null, staking=null;
  let dfDecimals = 18;

  async function ensureBSC() {
    const net = await provider.getNetwork();
    if (net.chainId === C.CHAIN_ID_DEC) return true;

    try {
      await provider.send("wallet_switchEthereumChain", [{ chainId: C.CHAIN_ID_HEX }]);
      return true;
    } catch {
      await provider.send("wallet_addEthereumChain", [{
        chainId: C.CHAIN_ID_HEX,
        chainName: C.CHAIN_NAME,
        nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
        rpcUrls: [C.RPC_URL],
        blockExplorerUrls: [C.BLOCK_EXPLORER]
      }]);
      return true;
    }
  }

  function parseAmount(amountStr, decimals){
    const s = (amountStr || "").trim();
    if (!s) throw new Error("Amount is empty");
    return ethers.utils.parseUnits(s, decimals);
  }

  async function connect(){
    try{
      if (!C) throw new Error("OWNER_CONFIG not loaded (check owner_config.js path/name).");

      if (!window.ethereum) {
        alert("Wallet not found. Please open in MetaMask/Bitget DApp browser.");
        return;
      }

      provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      me = await signer.getAddress();

      await ensureBSC();

      df = new ethers.Contract(C.DF, C.ERC20_ABI, signer);
      vault = new ethers.Contract(C.VAULT, C.VAULT_ABI, signer);
      binary = new ethers.Contract(C.BINARY, C.BINARY_ABI, signer);
      staking = new ethers.Contract(C.STAKING, C.STAKING_ABI, signer);

      try { dfDecimals = await df.decimals(); } catch { dfDecimals = 18; }

      setText("walletAddr", shortAddr(me));
      setText("netText", "bnb (56)");
      $("btnConnect").textContent = "Connected";
      $("btnConnect").disabled = true;

      setText("coreAddr", C.CORE);
      setText("vaultAddr", C.VAULT);
      setText("binaryAddr", C.BINARY);
      setText("stakingAddr", C.STAKING);

      await refreshBalances();
      toast("Connected ✅");
      setStatus("Ready ✅");
    } catch(e){
      console.error(e);
      toast("Connect failed", "err");
      setStatus("Connect error: " + (e?.message || String(e)));
    }
  }

  async function refreshBalances(){
    if(!me) return;
    try{
      const ownerBal = await df.balanceOf(me);
      const stakingBal = await df.balanceOf(C.STAKING);
      setText("balOwnerDF", ethers.utils.formatUnits(ownerBal, dfDecimals));
      setText("balStakingDF", ethers.utils.formatUnits(stakingBal, dfDecimals));
    } catch(e){
      console.error(e);
    }
  }

  async function vaultSetCore(){
    try{
      setText("vaultSetCoreStatus", "Sending tx...");
      const tx = await vault.setCore(C.CORE);
      await tx.wait();
      setText("vaultSetCoreStatus", "Done ✅");
      toast("Vault setCore ✅");
    } catch(e){
      console.error(e);
      setText("vaultSetCoreStatus", "Error: " + (e?.message || String(e)));
      toast("Vault setCore failed", "err");
    }
  }

  async function binarySetCore(){
    try{
      setText("binarySetCoreStatus", "Sending tx...");
      const tx = await binary.setCore(C.CORE);
      await tx.wait();
      setText("binarySetCoreStatus", "Done ✅");
      toast("Binary setCore ✅");
    } catch(e){
      console.error(e);
      setText("binarySetCoreStatus", "Error: " + (e?.message || String(e)));
      toast("Binary setCore failed", "err");
    }
  }

  async function stakingSetMLM(){
    try{
      setText("stakingSetMLMStatus", "Sending tx...");
      const tx = await staking.setMLM(C.CORE);
      await tx.wait();
      setText("stakingSetMLMStatus", "Done ✅");
      toast("Staking setMLM ✅");
    } catch(e){
      console.error(e);
      setText("stakingSetMLMStatus", "Error: " + (e?.message || String(e)));
      toast("Staking setMLM failed", "err");
    }
  }

  async function fundDF(){
    if(!me) return alert("Connect wallet first.");
    try{
      const amt = parseAmount($("inpFundDF").value, dfDecimals);
      setText("fundDFStatus", "Sending DF transfer...");
      const tx = await df.transfer(C.STAKING, amt);
      await tx.wait();
      setText("fundDFStatus", "Transfer done ✅");
      toast("DF sent to Staking ✅");
      await refreshBalances();
    } catch(e){
      console.error(e);
      setText("fundDFStatus", "Error: " + (e?.message || String(e)));
      toast("Transfer failed", "err");
    }
  }

  async function withdrawUSDT(){
    if(!me) return alert("Connect wallet first.");
    try{
      const to = ($("inpWUSDTTo").value || "").trim();
      if (!ethers.utils.isAddress(to)) throw new Error("Invalid to-address");
      const amt = parseAmount($("inpWUSDT").value, 18); // USDT on BSC is 18 decimals
      setText("wusdtStatus", "Sending tx...");
      const tx = await vault.withdrawSurplusUSDT(to, amt);
      await tx.wait();
      setText("wusdtStatus", "Done ✅");
      toast("Withdraw USDT ✅");
    } catch(e){
      console.error(e);
      setText("wusdtStatus", "Error: " + (e?.message || String(e)));
      toast("Withdraw failed", "err");
    }
  }

  async function withdrawDF(){
    if(!me) return alert("Connect wallet first.");
    try{
      const to = ($("inpWDFTo").value || "").trim();
      if (!ethers.utils.isAddress(to)) throw new Error("Invalid to-address");
      const amt = parseAmount($("inpWDF").value, dfDecimals);
      setText("wdfStatus", "Sending tx...");
      const tx = await vault.withdrawSurplusDF(to, amt);
      await tx.wait();
      setText("wdfStatus", "Done ✅");
      toast("Withdraw DF ✅");
      await refreshBalances();
    } catch(e){
      console.error(e);
      setText("wdfStatus", "Error: " + (e?.message || String(e)));
      toast("Withdraw failed", "err");
    }
  }

  function initStatic(){
    setText("coreAddr", C?.CORE || "-");
    setText("vaultAddr", C?.VAULT || "-");
    setText("binaryAddr", C?.BINARY || "-");
    setText("stakingAddr", C?.STAKING || "-");
    setStatus("Ready.");
  }

  function bind(){
    $("btnConnect").onclick = connect;
    $("btnVaultSetCore").onclick = vaultSetCore;
    $("btnBinarySetCore").onclick = binarySetCore;
    $("btnStakingSetMLM").onclick = stakingSetMLM;
    $("btnFundDF").onclick = fundDF;
    $("btnCheckBalances").onclick = refreshBalances;
    $("btnWithdrawUSDT").onclick = withdrawUSDT;
    $("btnWithdrawDF").onclick = withdrawDF;
  }

  window.addEventListener("load", () => {
    initStatic();
    bind();
  });
})();
