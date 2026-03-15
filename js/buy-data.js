let selectedNetwork = "MTN"

function selectNetwork(el){

document.querySelectorAll(".network").forEach(n=>{
n.classList.remove("active")
})

el.classList.add("active")

selectedNetwork = el.innerText

}



async function buyData(){

let phone = document.getElementById("phone").value
let bundle = document.getElementById("bundle").value

if(phone === "" || bundle === ""){

alert("Fill all fields")
return

}

const { data: { user } } = await supabase.auth.getUser()

if(!user){

window.location.href="login.html"
return

}


let price = bundle * 5   // example price logic


let { data } = await supabase
.from("users")
.select("wallet_balance")
.eq("id",user.id)
.single()


if(data.wallet_balance < price){

alert("Insufficient wallet balance")
return

}


let newBalance = data.wallet_balance - price


await supabase
.from("users")
.update({ wallet_balance:newBalance })
.eq("id",user.id)


await supabase
.from("orders")
.insert({

user_id:user.id,
network:selectedNetwork,
phone:phone,
bundle:bundle,
price:price,
status:"pending"

})


alert("Order placed successfully")

}
