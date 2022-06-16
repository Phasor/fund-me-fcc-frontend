import { ethers } from "./ethers.5.6.esm.min.js" //minified local version of ethers
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
  if (typeof window.ethereum != "undefined") {
    //is MM installed?
    await window.ethereum.request({ method: "eth_requestAccounts" })
    connectButton.innerHTML = "Connected"
  } else {
    connectButton.innerHTML = "Install MM"
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  if (typeof window.ethereum != "undefined") {
    //we need a provider/connection to block chain
    //signer/wallet/someone with gas
    //contract we are interacting with i.e. ABI and address

    //we use Web3Provider when working with metamask, we use JsonRPC provider when working with say infura RPC endpoints directly via URL
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner() //connected MM account
    const contract = new ethers.Contract(contractAddress, abi, signer)

    try {
      const transactionReposonse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      await listenForTransactionMine(transactionReposonse, provider)
      console.log("Done")
    } catch (error) {
      console.log(error)
    }
  }
}

//the below needs to be wrapped in a promise since we want to wait for it to finnish before moving
//on in our code i.e. we want to use await in our functions when using this
function listenForTransactionMine(transactionReposonse, provider) {
  console.log(`Mining  ${transactionReposonse.hash}...`)
  return new Promise((resolve, reject) => {
    provider.once(transactionReposonse.hash, (transactionReceipt) => {
      console.log(
        `Complete with ${transactionReceipt.confirmations} confirmations`
      )
      resolve() //transaction hash now found, now we can call resolve() and therefore return the Promise
    })
  })
}

async function getBalance() {
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance))
  }
}

async function withdraw() {
  if (typeof window.ethereum != "undefined") {
    console.log("Withdrawing...")
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner() //connected MM account
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionReposonse = await contract.withdraw()
      await listenForTransactionMine(transactionReposonse, provider)
    } catch (error) {
      console.log(error)
    }
  }
}
