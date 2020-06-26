var Eth = require('ethjs')
window.Eth = Eth

function connect() {
  if (typeof ethereum !== 'undefined') {
    ethereum.enable().catch(err => {
      console.log(err)
    })
  }
}

signTypedDataV3Button.addEventListener('click', function (event) {
  event.preventDefault()

  var from = web3.eth.accounts[0]

  console.log(from)
  if (!from) return connect()

  const msgParams = JSON.stringify({
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: 'host', type: 'string' },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
      ],
      Test: [
        { name: "owner", type: "string" },
      ]
    },
    domain: {
      name: "Ether Mail",
      host: 'https://test.matic.network',
      version: "1",
      verifyingContract: "0x0",
      chainId: 3,
    },
    primaryType: "Test",
    message: {
      owner: from,
    }
  })

  var params = [from, msgParams]
  var method = 'eth_signTypedData_v3'

  web3.currentProvider.sendAsync({
    method,
    params,
    from,
  }, function (err, result) {
    if (err) return console.dir(err)
    if (result.error) {
      alert(result.error.message)
    }
    if (result.error) return alert('ERROR', result)
    console.log('TYPED SIGNED:' + JSON.stringify(result.result))
    document.getElementById("signature").innerHTML = JSON.stringify(result.result)

  })


})

