function payWithPaystack(){
  let amountInput = document.getElementById("amount").value;
  let amount = parseFloat(amountInput);

  if(isNaN(amount) || amount <= 0){
    alert("Enter valid amount");
    return;
  }

  // Multiply by 1.02 to apply the 2% charge, then by 100 for PESEWAS
  let totalWithFee = amount * 1.02;
  let paystackAmount = Math.round(totalWithFee * 100); 

  let handler = PaystackPop.setup({
    key: "pk_test_2d0bf42287c58cbad1284d5a6955eb7a84ea207b",
    email: "customer@email.com", // In a real app, fetch the active user email
    amount: paystackAmount,
    currency: "GHS",
    callback: async function(response){
      // 1. Get current logged in user
      const { data: { user } } = await supabase.auth.getUser();
      if(!user) return;

      // 2. Fetch current wallet balance
      let { data: userData } = await supabase
        .from("users")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();
        
      let oldBalance = userData.wallet_balance || 0;
      let newBalance = oldBalance + amount; // Only credit the requested base amount

      // 3. Update the wallet balance
      await supabase
        .from("users")
        .update({ wallet_balance: newBalance })
        .eq("id", user.id);

      // 4. Record the specific transaction (Deposit)
      await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: "Deposit",
          amount: amount,
          balance_before: oldBalance,
          balance_after: newBalance,
          status: "Completed",
          reference: response.reference
        });

      if(window.showSuccessPopup) {
        window.showSuccessPopup("Wallet Funded!", "Your wallet has been successfully credited with ₵" + amount + ".", () => {
          window.location.reload();
        });
      } else {
        alert("Payment successful! Wallet credited with ₵" + amount);
        window.location.reload();
      }
    },
    onClose: function(){
      alert("Transaction cancelled");
    }
  });

  handler.openIframe();
}

function processFunding(){
  if(paymentMethod === "paystack"){
    payWithPaystack();
  } else {
    openManualModal();
  }
}

function openManualModal() {
  let amountInput = parseFloat(document.getElementById("amount").value);
  if(isNaN(amountInput) || amountInput <= 0) {
    alert("Please enter a valid amount first.");
    return;
  }

  // Generate Reference ID dynamically
  let randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  document.getElementById("refId").innerText = "D4G-" + randomChars;
  
  // Show Modal
  document.getElementById("manualModal").style.display = "flex";
}

function closeManualModal() {
  document.getElementById("manualModal").style.display = "none";
}

async function submitManualRequest() {
  let amount = parseFloat(document.getElementById("amount").value);
  let refId = document.getElementById("refId").innerText;

  if(isNaN(amount) || amount <= 0) {
    alert("Invalid amount.");
    return;
  }

  const submitBtn = document.getElementById("submitManualBtn");
  submitBtn.disabled = true;
  submitBtn.innerText = "Submitting Request...";

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) {
      window.location.href = "login.html";
      return;
    }

    // Insert pending transaction (balance remains untouched)
    await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "Deposit (Manual)",
        amount: amount,
        status: "Pending",
        reference: refId
      });

    closeManualModal();
    
    if(window.showSuccessPopup) {
      window.showSuccessPopup("Request Submitted!", "Your manual funding request has been submitted. We will process it shortly.", () => {
        window.location.reload();
      });
    } else {
      alert("Manual funding request submitted successfully! We will process it shortly.");
      window.location.reload();
    }
    
  } catch (err) {
    alert("Failed to submit request.");
    console.error(err);
    submitBtn.disabled = false;
    submitBtn.innerText = "I Have Transferred The Funds";
  }
}
