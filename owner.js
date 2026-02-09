;(() => {
  "use strict";

  const C = window.OWNER_CONFIG;
  const $ = (id) => document.getElementById(id);

  const setText = (id, t) => { const el = $(id); if (el) el.textContent = t; };
  const shortAddr = (a) => a ? (a.slice(0, 6) + "..." + a.slice(-4)) : "-";

  function toast(msg, type="ok"){
    const el = $("toast");
    if(!el) return;
    el.classList.remove("show");
    el.textContent = msg;
    el.style.background = type==="err" ? "#7f1d1d" : "#0b1220";
    el.classList.add("show");
    setTimeout(()=>el.classList.remove("show"), 2400);
  }
  const setStatus = (t)=> setText("status", t);

  let provider=null, signer=null, user=null;
  let core=null, vault=null, binary=null, staking=null;
  let usdt=null, df=null;
  let usdtDecimals=18, dfDecimals=18;

  async function ensureBSC(){
    const net = await provider.getNetwork();
    if(net.chainId === C.CHAIN_ID_DEC) return true;

    try{
      await provider.send("wallet_switchEthereumChain", [{ chainId: C.CHAIN_ID_HEX }]);
      return true;
    }catch(e){
      await provider.send("wallet_addEthereumChain", [{
        chainId: C.CHAIN_ID_HEX,
        chainName: C.CHAIN_NAME,
        nativeCurrency: { name:"BNB", symbol:"BNB", decimals:18 },
        rpcUrls: [C.RPC_URL],
        blockExplorerUrls: [C.BLOCK_EXPLORER]
      }]);
      return true;
    }
  }

  function isAddr(a){ return a && ethers.utils.isAddress(a); }

  async function connect(){
    try{
      if(!window.ethereum){
        alert("Wallet not found. Open in Bitget/MetaMask DApp Browser.");
        return;
      }
      provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      user = await signer.getAddress();
      await ensureBSC();

      // contracts
      core   = new ethers.Contract(C.CORE,   C.CORE_ABI, signer);
      vault  = new ethers.Contract(C.VAULT,  C.VAULT_ABI, signer);
      binary = new ethers.Contract(C.BINARY, C.BINARY_ABI, signer);
      staking= new ethers.Contract(C.STAKING,C.STAKING_ABI, signer);

      usdt = new ethers.Contract(C.USDT, C.ERC20_ABI, signer);
      df   = new ethers.Contract(C.DF,   C.ERC20_ABI, signer);

      try{ usdtDecimals = await usdt.decimals(); }catch{ usdtDecimals=18; }
      try{ dfDecimals   = await df.decimals(); }catch{ dfDecimals=18; }

      setText("walletAddr", shortAddr(user));
      setText("netText", "BSC (56)");
      $("btnConnect").textContent = "Connected";
      $("btnConnect").disabled = true;

      // fill addresses
      setText("coreAddr", C.CORE);
      setText("vaultAddr", C.VAULT);
      setText("binaryAddr", C.BINARY);
      setText("stakingAddr", C.STAKING);

      // default inputs
      $("cfgVault").value = C.VAULT;
      $("cfgBinary").value = C.BINARY;
      $("cfgStaking").value = C.STAKING;
      $("vaultCore").value = C.CORE;
      $("binCore").value = C.CORE;
      $("mlmAddr").value = C.CORE;

      await refreshAll(true);

      window.ethereum.on?.("accountsChanged", () => location.reload());
      window.ethereum.on?.("chainChanged", () => location.reload());

      toast("Connected ✅");
    }catch(e){
      console.error(e);
      toast("Connect failed", "err");
      setStatus("Connect error: " + (e?.message || String(e)));
    }
  }

  function fmtUnits(x, d=18){
    try{
      return Number(ethers.utils.formatUnits(x, d)).toLocaleString(undefined,{maximumFractionDigits:6});
    }catch{ return String(x); }
  }

  async function refreshAll(showToast=false){
    if(!user) return;
    try{
      setStatus("Refreshing...");
      setText("cfgStatus","-");
      setText("vaultStatus","-");
      setText("binStatus","-");
      setText("mlmStatus","-");
      setText("toStatus","-");

      const o1 = await core.owner();
      const o2 = await vault.owner();
      const o3 = await binary.owner();
      const o4 = await staking.owner();

      setText("oCore", o1);
      setText("oVault", o2);
      setText("oBinary", o3);
      setText("oStaking", o4);

      const isOwnerAny =
        user.toLowerCase() === o1.toLowerCase() ||
        user.toLowerCase() === o2.toLowerCase() ||
        user.toLowerCase() === o3.toLowerCase() ||
        user.toLowerCase() === o4.toLowerCase();

      setText("ownerHint", isOwnerAny
        ? "✅ This wallet is owner of at least one contract."
        : "⚠️ This wallet is NOT owner (transactions will revert)."
      );

      // surplus
      const surU = await vault.surplusUSDT();
      const surD = await vault.surplusDF();
      setText("surU", fmtUnits(surU, usdtDecimals));
      setText("surD", fmtUnits(surD, dfDecimals));

      setStatus("Updated ✅");
      if(showToast) toast("Refreshed ✅");
    }catch(e){
      console.error(e);
      toast("Refresh failed", "err");
      setStatus("Refresh error: " + (e?.message || String(e)));
    }
  }

  async function setConfig(){
    try{
      if(!user) return alert("Connect wallet first.");
      const vaultA   = ($("cfgVault").value||"").trim();
      const binaryA  = ($("cfgBinary").value||"").trim();
      const stakingA = ($("cfgStaking").value||"").trim();
      const treasury = ($("cfgTreasury").value||"").trim();
      const company  = ($("cfgCompany").value||"").trim();

      if(!isAddr(vaultA) || !isAddr(stakingA) || !isAddr(treasury) || !isAddr(company)){
        toast("Invalid address in setConfig", "err");
        return;
      }
      // binary can be 0x0 if disable (your contract allows), but keep strict by default:
      if(binaryA && binaryA !== ethers.constants.AddressZero && !isAddr(binaryA)){
        toast("Invalid binary address", "err");
        return;
      }

      setText("cfgStatus","Sending tx...");
      setStatus("Core.setConfig ...");
      const tx = await core.setConfig(vaultA, binaryA, stakingA, treasury, company);
      await tx.wait();
      setText("cfgStatus","SetConfig success ✅");
      toast("SetConfig success ✅");
      await refreshAll(true);
    }catch(e){
      console.error(e);
      const msg = e?.data?.message || e?.error?.message || e?.message || String(e);
      setText("cfgStatus","Error: " + msg);
      toast("SetConfig failed", "err");
      setStatus("SetConfig error: " + msg);
    }
  }

  async function vaultSetCore(){
    try{
      if(!user) return alert("Connect wallet first.");
      const c = ($("vaultCore").value||"").trim();
      if(!isAddr(c)) { toast("Invalid core address", "err"); return; }

      setText("vaultStatus","Sending tx...");
      setStatus("Vault.setCore ...");
      const tx = await vault.setCore(c);
      await tx.wait();
      setText("vaultStatus","Vault setCore success ✅");
      toast("Vault setCore success ✅");
      await refreshAll(true);
    }catch(e){
      console.error(e);
      const msg = e?.data?.message || e?.error?.message || e?.message || String(e);
      setText("vaultStatus","Error: " + msg);
      toast("Vault setCore failed", "err");
      setStatus("Vault setCore error: " + msg);
    }
  }

  async function binSetCore(){
    try{
      if(!user) return alert("Connect wallet first.");
      const c = ($("binCore").value||"").trim();
      if(!isAddr(c)) { toast("Invalid core address", "err"); return; }

      setText("binStatus","Sending tx...");
      setStatus("Binary.setCore ...");
      const tx = await binary.setCore(c);
      await tx.wait();
      setText("binStatus","Binary setCore success ✅");
      toast("Binary setCore success ✅");
      await refreshAll(true);
    }catch(e){
      console.error(e);
      const msg = e?.data?.message || e?.error?.message || e?.message || String(e);
      setText("binStatus","Error: " + msg);
      toast("Binary setCore failed", "err");
      setStatus("Binary setCore error: " + msg);
    }
  }

  async function setMLM(){
    try{
      if(!user) return alert("Connect wallet first.");
      const m = ($("mlmAddr").value||"").trim();
      if(!isAddr(m)) { toast("Invalid MLM address", "err"); return; }

      setText("mlmStatus","Sending tx...");
      setStatus("Staking.setMLM ...");
      const tx = await staking.setMLM(m);
      await tx.wait();
      setText("mlmStatus","SetMLM success ✅");
      toast("SetMLM success ✅");
      await refreshAll(true);
    }catch(e){
      console.error(e);
      const msg = e?.data?.message || e?.error?.message || e?.message || String(e);
      setText("mlmStatus","Error: " + msg);
      toast("SetMLM failed", "err");
      setStatus("SetMLM error: " + msg);
    }
  }

  async function withdrawUSDT(){
    try{
      if(!user) return alert("Connect wallet first.");
      const to = ($("wToU").value||"").trim();
      const amt = ($("wAmtU").value||"").trim();
      if(!isAddr(to)) { toast("Invalid 'to' address", "err"); return; }
      if(!amt || isNaN(Number(amt)) || Number(amt) <= 0){ toast("Invalid amount", "err"); return; }

      const v = ethers.utils.parseUnits(String(amt), usdtDecimals);

      setText("vaultStatus","Sending tx...");
      setStatus("Vault.withdrawSurplusUSDT ...");
      const tx = await vault.withdrawSurplusUSDT(to, v);
      await tx.wait();
      setText("vaultStatus","Withdraw USDT success ✅");
      toast("Withdraw USDT success ✅");
      await refreshAll(true);
    }catch(e){
      console.error(e);
      const msg = e?.data?.message || e?.error?.message || e?.message || String(e);
      setText("vaultStatus","Error: " + msg);
      toast("Withdraw USDT failed", "err");
      setStatus("Withdraw USDT error: " + msg);
    }
  }

  async function withdrawDF(){
    try{
      if(!user) return alert("Connect wallet first.");
      const to = ($("wToD").value||"").trim();
      const amt = ($("wAmtD").value||"").trim();
      if(!isAddr(to)) { toast("Invalid 'to' address", "err"); return; }
      if(!amt || isNaN(Number(amt)) || Number(amt) <= 0){ toast("Invalid amount", "err"); return; }

      const v = ethers.utils.parseUnits(String(amt), dfDecimals);

      setText("vaultStatus","Sending tx...");
      setStatus("Vault.withdrawSurplusDF ...");
      const tx = await vault.withdrawSurplusDF(to, v);
      await tx.wait();
      setText("vaultStatus","Withdraw DF success ✅");
      toast("Withdraw DF success ✅");
      await refreshAll(true);
    }catch(e){
      console.error(e);
      const msg = e?.data?.message || e?.error?.message || e?.message || String(e);
      setText("vaultStatus","Error: " + msg);
      toast("Withdraw DF failed", "err");
      setStatus("Withdraw DF error: " + msg);
    }
  }

  async function transferOwnership(which){
    try{
      if(!user) return alert("Connect wallet first.");
      const n = ($("newOwner").value||"").trim();
      if(!isAddr(n)) { toast("Invalid new owner", "err"); return; }

      setText("toStatus","Sending tx...");
      setStatus("Transfer ownership...");

      let tx;
      if(which === "core")   tx = await core.transferOwnership(n);
      if(which === "vault")  tx = await vault.transferOwnership(n);
      if(which === "binary") tx = await binary.transferOwnership(n);
      if(which === "staking")tx = await staking.transferOwnership(n);

      await tx.wait();
      setText("toStatus", `Transfer ${which} success ✅`);
      toast("Transfer success ✅");
      await refreshAll(true);
    }catch(e){
      console.error(e);
      const msg = e?.data?.message || e?.error?.message || e?.message || String(e);
      setText("toStatus","Error: " + msg);
      toast("Transfer failed", "err");
      setStatus("Transfer error: " + msg);
    }
  }

  async function addTokens(){
    if(!window.ethereum) return;
    try{
      await window.ethereum.request({
        method:"wallet_watchAsset",
        params:{ type:"ERC20", options:{ address:C.DF, symbol:"365DF", decimals:Number(dfDecimals||18) } }
      });
      await window.ethereum.request({
        method:"wallet_watchAsset",
        params:{ type:"ERC20", options:{ address:C.USDT, symbol:"USDT", decimals:Number(usdtDecimals||18) } }
      });
      toast("Token added ✅");
    }catch{
      toast("Add token canceled", "err");
    }
  }

  function bind(){
    $("btnConnect").onclick = connect;
    $("btnRefresh").onclick = () => refreshAll(true);
    $("btnAddTokens").onclick = addTokens;

    $("btnSetConfig").onclick = setConfig;
    $("btnVaultSetCore").onclick = vaultSetCore;
    $("btnBinSetCore").onclick = binSetCore;
    $("btnSetMLM").onclick = setMLM;

    $("btnWUSDT").onclick = withdrawUSDT;
    $("btnWDF").onclick = withdrawDF;

    $("btnTOCore").onclick = () => transferOwnership("core");
    $("btnTOVault").onclick = () => transferOwnership("vault");
    $("btnTOBinary").onclick = () => transferOwnership("binary");
    $("btnTOStaking").onclick = () => transferOwnership("staking");
  }

  function init(){
    setText("coreAddr", C.CORE);
    setText("vaultAddr", C.VAULT);
    setText("binaryAddr", C.BINARY);
    setText("stakingAddr", C.STAKING);
    setText("walletAddr","-");
    setText("netText","-");
    setStatus("Ready.");
  }

  window.addEventListener("load", () => {
    init();
    bind();
  });
})();
