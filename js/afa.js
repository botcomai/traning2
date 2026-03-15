function openPremium(){
  document.getElementById("premiumModal").style.display = "flex";
}

function closePremium(){
  document.getElementById("premiumModal").style.display = "none";
}

function openNormal(){
  document.getElementById("normalModal").style.display = "flex";
}

function closeNormal(){
  document.getElementById("normalModal").style.display = "none";
}

function saveAFA(type){
  let registration = {
    type: type,
    date: new Date().toLocaleString()
  };

  console.log("AFA Saved", registration);
}

document.getElementById("afaForm").addEventListener("submit", function(e){
  e.preventDefault();

  let price = 30;

  if(walletBalance < price){
    alert("Insufficient wallet balance. Please fund your wallet.");
    return;
  }

  walletBalance -= price;
  alert("Registration successful! Wallet charged ₵30");
  saveAFA("Premium");
  closePremium();
});

document.getElementById("normalForm").addEventListener("submit", function(e){
  e.preventDefault();

  let price = 25;

  if(walletBalance < price){
    alert("Insufficient wallet balance. Please fund your wallet.");
    return;
  }

  walletBalance -= price;
  alert("Registration successful! Wallet charged ₵25");
  saveAFA("Normal");
  closeNormal();
});