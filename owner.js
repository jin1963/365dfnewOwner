;(() => {
  "use strict";

  const C = window.OWNER_CONFIG;
  const $ = (id) => document.getElementById(id);

  const setText = (id, t) => { const el = $(id); if (el) el.textContent = t; };
  const shortAddr = (a) => a ? (a.slice(0,6) + "..." + a.slice(-4)) : "-";

  function toast(msg, type="ok"){
    const el = $("toast");
    if(!el) return;
    el.classList.remove("show");
    el.textContent = msg;
    el.style.background = type==="err" ? "#7f1d1d" : "#0b1220";
    el.classList.add("show");
    setTimeout(()=>el.classList.remove("show"), 2400);
  }

  function status(t){ setText("status", t); }
  function pill(id, t){ setText(id, t); }

  let provider=null, signer=null, user=null;
  let core=null, vault=null, binary=null, staking=null;

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

  function initStatic(){
    if(!C){
      status("ERROR: owner_config.js not loaded");
      toast("owner_config.js not loaded", "err");
      return;
    }
    setText("coreAddr", C.CORE);
    setText("vaultAddr", C.VAULT);
    setText("binaryAddr", C.BINARY);
    setText("stakingAddr", C.STAKING);
    setText("walletAddr", "-");
    setText("netText", "-");
    pill("dashStatus", "-");
    pill("linkStatus", "-");
    pill("wdStatus", "-");
    pill("ownStatus", "-");

    // default inputs = CoreV5
    $("inpSetVaultCore").value = C.CORE;
    $("inpSetBinaryCore").value = C.CORE;
    $("inpSetStakingMLM").value = C.CORE;
    status("Ready.");
  }

  async function connect(){
    try{
      if(!C) throw new Error("OWNER_CONFIG missing. Check owner_config.js");
      if(!window.ethereum) {
        alert("Wallet not found. Open in MetaMask/Bitget DApp Browser.");
        return;
      }

      provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      user = await signer.getAddress();

      await ensureBSC();

      // ✅ IMPORTANT: ABI must exist (fix your error: map of undefined)
      if(!C.CORE_ABI || !C.VAULT_ABI || !C.BINARY_ABI || !C.STAKING_ABI){
        throw new Error("ABI missing in owner_config.js (CORE_ABI/VAULT_ABI/BINARY_ABI/STAKING_ABI)");
      }

      core   = new ethers.Contract(C.CORE,   C.CORE_ABI,   signer);
      vault  = new ethers.Contract(C.VAULT,  C.VAULT_ABI,  signer);
      binary = new ethers.Contract(C.BINARY, C.BINARY_ABI, signer);
      staking= new ethers.Contract(C.STAKING,C.STAKING_ABI,signer);

      setText("walletAddr", shortAddr(user));
      setText("netText", "bnb (56)");
      $("btnConnect").textContent = "Connected";
      $("btnConnect").disabled = true;

      toast("Connected ✅");
      await refreshAll(true);

      window.ethereum.on?.("accountsChanged", () => location.reload());
      window.ethereum.on?.("chainChanged", () => location.reload());
    }catch(e){
      console.error(e);
      status("Connect error: " + (e?.message || String(e)));
      toast("Connect failed", "err");
    }
  }

  async function refreshAll(showToast=false){
    if(!user) return;
    try{
      pill("dashStatus","Refreshing...");

      const [co, vo, bo, so] = await Promise.all([
        core.owner(),
        vault.owner(),
        binary.owner(),
        staking.owner()
      ]);

      setText("coreOwner", shortAddr(co));
      setText("vaultOwner", shortAddr(vo));
      setText("binaryOwner", shortAddr(bo));
      setText("stakingOwner", shortAddr(so));

      // surplus
      const [sU, sD] = await Promise.all([
        vault.surplusUSDT(),
        vault.surplusDF()
      ]);

      // USDT has 18 decimals on BSC address 0x55d398...
      setText("surplusUSDT", ethers.utils.formatUnits(sU, 18));
      setText("surplusDF", ethers.utils.formatUnits(sD, 18));

      pill("dashStatus","Updated ✅");
      status("Updated ✅");
      if(showToast) toast("Refreshed ✅");
    }catch(e){
      console.error(e);
      pill("dashStatus","Refresh error");
      status("Refresh error: " + (e?.message || String(e)));
      toast("Refresh failed", "err");
    }
  }

  function mustAddr(x, label){
    if(!ethers.utils.isAddress(x)) throw new Error("Invalid " + label);
  }

  async function setVaultCore(){
    try{
      const coreAddr = ($("inpSetVaultCore").value || "").trim() || C.CORE;
      mustAddr(coreAddr, "core");
      pill("linkStatus","Sending...");
      const tx = await vault.setCore(coreAddr);
      await tx.wait();
      pill("linkStatus","Vault core set ✅");
      toast("Vault core set ✅");
      await refreshAll(false);
    }catch(e){
      console.error(e);
      pill("linkStatus","Error");
      toast(e?.message || "Set core failed", "err");
    }
  }

  async function setBinaryCore(){
    try{
      const coreAddr = ($("inpSetBinaryCore").value || "").trim() || C.CORE;
      mustAddr(coreAddr, "core");
      pill("linkStatus","Sending...");
      const tx = await binary.setCore(coreAddr);
      await tx.wait();
      pill("linkStatus","Binary core set ✅");
      toast("Binary core set ✅");
      await refreshAll(false);
    }catch(e){
      console.error(e);
      pill("linkStatus","Error");
      toast(e?.message || "Set core failed", "err");
    }
  }

  async function setStakingMLM(){
    try{
      const coreAddr = ($("inpSetStakingMLM").value || "").trim() || C.CORE;
      mustAddr(coreAddr, "mlm/core");
      pill("linkStatus","Sending...");
      const tx = await staking.setMLM(coreAddr);
      await tx.wait();
      pill("linkStatus","Staking MLM set ✅");
      toast("Staking MLM set ✅");
      await refreshAll(false);
    }catch(e){
      console.error(e);
      pill("linkStatus","Error");
      toast(e?.message || "Set MLM failed", "err");
    }
  }

  async function withdrawSurplusUSDT(){
    try{
      const to = ($("inpToUSDT").value || "").trim();
      const amt = ($("inpAmtUSDT").value || "").trim();
      mustAddr(to, "to");
      if(!amt) throw new Error("Amount required");
      const wei = ethers.utils.parseUnits(amt, 18);
      pill("wdStatus","Sending...");
      const tx = await vault.withdrawSurplusUSDT(to, wei);
      await tx.wait();
      pill("wdStatus","Withdraw USDT ✅");
      toast("Withdraw USDT ✅");
      await refreshAll(false);
    }catch(e){
      console.error(e);
      pill("wdStatus","Error");
      toast(e?.message || "Withdraw failed", "err");
    }
  }

  async function withdrawSurplusDF(){
    try{
      const to = ($("inpToDF").value || "").trim();
      const amt = ($("inpAmtDF").value || "").trim();
      mustAddr(to, "to");
      if(!amt) throw new Error("Amount required");
      const wei = ethers.utils.parseUnits(amt, 18);
      pill("wdStatus","Sending...");
      const tx = await vault.withdrawSurplusDF(to, wei);
      await tx.wait();
      pill("wdStatus","Withdraw DF ✅");
      toast("Withdraw DF ✅");
      await refreshAll(false);
    }catch(e){
      console.error(e);
      pill("wdStatus","Error");
      toast(e?.message || "Withdraw failed", "err");
    }
  }

  async function ownerWithdrawStakeDF(){
    try{
      const to = ($("inpToStakeDF").value || "").trim();
      const amt = ($("inpAmtStakeDF").value || "").trim();
      mustAddr(to, "to");
      if(!amt) throw new Error("Amount required");
      const wei = ethers.utils.parseUnits(amt, 18);
      pill("wdStatus","Sending...");
      const tx = await staking.ownerWithdrawDF(to, wei);
      await tx.wait();
      pill("wdStatus","Staking withdraw DF ✅");
      toast("Staking withdraw DF ✅");
      await refreshAll(false);
    }catch(e){
      console.error(e);
      pill("wdStatus","Error");
      toast(e?.message || "Withdraw failed", "err");
    }
  }

  async function transferOwnership(which){
    try{
      pill("ownStatus","Sending...");
      let newOwner="";
      let tx=null;

      if(which==="core"){
        newOwner = ($("inpNewOwnerCore").value || "").trim();
        mustAddr(newOwner, "new owner");
        tx = await core.transferOwnership(newOwner);
      } else if(which==="vault"){
        newOwner = ($("inpNewOwnerVault").value || "").trim();
        mustAddr(newOwner, "new owner");
        tx = await vault.transferOwnership(newOwner);
      } else if(which==="binary"){
        newOwner = ($("inpNewOwnerBinary").value || "").trim();
        mustAddr(newOwner, "new owner");
        tx = await binary.transferOwnership(newOwner);
      } else if(which==="staking"){
        newOwner = ($("inpNewOwnerStaking").value || "").trim();
        mustAddr(newOwner, "new owner");
        tx = await staking.transferOwnership(newOwner);
      } else {
        throw new Error("Unknown contract");
      }

      await tx.wait();
      pill("ownStatus","Ownership transferred ✅");
      toast("Ownership transferred ✅");
      await refreshAll(false);
    }catch(e){
      console.error(e);
      pill("ownStatus","Error");
      toast(e?.message || "Transfer failed", "err");
    }
  }

  function bindUI(){
    $("btnConnect").onclick = connect;
    $("btnRefresh").onclick = () => refreshAll(true);

    $("btnSetVaultCore").onclick = setVaultCore;
    $("btnSetBinaryCore").onclick = setBinaryCore;
    $("btnSetStakingMLM").onclick = setStakingMLM;

    $("btnWithdrawUSDT").onclick = withdrawSurplusUSDT;
    $("btnWithdrawDF").onclick = withdrawSurplusDF;
    $("btnOwnerWithdrawStakeDF").onclick = ownerWithdrawStakeDF;

    $("btnTransferCore").onclick = () => transferOwnership("core");
    $("btnTransferVault").onclick = () => transferOwnership("vault");
    $("btnTransferBinary").onclick = () => transferOwnership("binary");
    $("btnTransferStaking").onclick = () => transferOwnership("staking");
  }

  window.addEventListener("load", () => {
    initStatic();
    bindUI();
  });
})();
