function connect() {
    if (typeof ethereum !== 'undefined') {
        ethereum.enable().catch(err => {
            console.log(err)
        })
    }
}
if (window.web3.currentProvider.selectedAddress === null) {
    return connect()
}

let { ContractWrappers, ERC20TokenContract, OrderStatus } = require('@0x/contract-wrappers');
let { providerEngine } = require('./provider_engine');
let { generatePseudoRandomSalt, signatureUtils } = require('@0x/order-utils');
let { BigNumber } = require('@0x/utils');
let { NETWORK_CONFIGS, TX_DEFAULTS } = require('./configs');
let { DECIMALS, UNLIMITED_ALLOWANCE_IN_BASE_UNITS, NULL_ADDRESS, NULL_BYTES, ZERO } = require('./constants');
let { Web3Wrapper } = require('@0x/web3-wrapper');
let utils = require('./utils');

//TESTB 0xAAeFF7414dD979d4338799113Ca515cC5af76185
//TESTC 0xbA3808635a43D36153D6E4739e9901B130E83bD5
(async () => {
    const contractWrappers = new ContractWrappers(providerEngine(), { chainId: NETWORK_CONFIGS.chainId });
    const web3Wrapper = new Web3Wrapper(providerEngine());
    const [maker] = await web3Wrapper.getAvailableAddressesAsync();

    console.log(maker)
    const TestBTokenAddress = "0x479868D862A3d24E546112dD59e3540d95A72B47".toLowerCase()
    const TestCTokenAddress = "0x3ebB167e97Ca0fa662d107ecB5BeF9A055104ee5".toLowerCase();
    const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(500), DECIMALS);
    const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(0.5), DECIMALS);
    const makerAssetData = await contractWrappers.devUtils.encodeERC20AssetData(TestBTokenAddress).callAsync();
    const takerAssetData = await contractWrappers.devUtils.encodeERC20AssetData(TestCTokenAddress).callAsync();
    let txHash;

    const erc20Token = new ERC20TokenContract(TestBTokenAddress, providerEngine());
    const makerTestBApprovalTxHash = await erc20Token
        .approve(contractWrappers.contractAddresses.erc20Proxy, UNLIMITED_ALLOWANCE_IN_BASE_UNITS)
        .sendTransactionAsync({ from: maker, gasPrice: 0 });
    console.log(makerTestBApprovalTxHash)

    // const etherToken = new ERC20TokenContract(TestCTokenAddress, providerEngine());
    // const takerTestCApprovalTxHash = await etherToken
    //     .approve(contractWrappers.contractAddresses.erc20Proxy, UNLIMITED_ALLOWANCE_IN_BASE_UNITS)
    //     .sendTransactionAsync({ from: taker, gasPrice: 0 });
    // console.log(takerTestCApprovalTxHash)

    // // const wethToken = new ERC20TokenContract("0x99c2f0c10a64fdbf466a5f4f24794f7c112c23a4".toLowerCase(), providerEngine());
    // // const takerWETHApprovalTxHash = await wethToken
    // //     .approve(contractWrappers.contractAddresses.staking, UNLIMITED_ALLOWANCE_IN_BASE_UNITS)
    // //     .sendTransactionAsync({ from: taker, gasPrice: 0 });
    // // console.log(takerWETHApprovalTxHash);

    // // Convert ETH into WETH for taker by depositing ETH into the WETH contract
    // // const takerWETHDepositTxHash = await contractWrappers.weth9.deposit().sendTransactionAsync({
    // //     value: takerAssetAmount,
    // //     from: taker,
    // // });
    // // console.log(takerWETHDepositTxHash)

    // Set up the Order and fill it
    const randomExpiration = utils.getRandomFutureDateInSeconds();
    const exchangeAddress = contractWrappers.contractAddresses.exchange;

    // Create the order
    const order = {
        chainId: NETWORK_CONFIGS.chainId,
        exchangeAddress,
        makerAddress: maker,
        takerAddress: NULL_ADDRESS,
        senderAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        expirationTimeSeconds: randomExpiration,
        salt: generatePseudoRandomSalt(),
        makerAssetAmount,
        takerAssetAmount,
        makerAssetData,
        takerAssetData,
        makerFeeAssetData: NULL_BYTES,
        takerFeeAssetData: NULL_BYTES,
        makerFee: ZERO,
        takerFee: ZERO,
    };

    // console.log(order)
    console.log(maker)
    const signedOrder = await signatureUtils.ecSignOrderAsync(providerEngine(), order, maker);

    // const txHashCancel = await contractWrappers.exchange.cancelOrder(order).awaitTransactionSuccessAsync({ from: maker, gasPrice: 0, gas: 8000000 });
    // console.log(txHashCancel)

    // const [
    //     { orderStatus, orderHash },
    //     remainingFillableAmount,
    //     isValidSignature,
    // ] = await contractWrappers.devUtils.getOrderRelevantState(signedOrder, signedOrder.signature).callAsync();
    // if (orderStatus === OrderStatus.Fillable && remainingFillableAmount.isGreaterThan(0) && isValidSignature) {
    //     console.log("Fillable")
    // }
    // txHash = await contractWrappers.exchange
    //     .fillOrder(signedOrder, takerAssetAmount, signedOrder.signature)
    //     .awaitTransactionSuccessAsync({
    //         from: taker,
    //         gas: 8000000,
    //         gasPrice: 0,
    //         value: utils.calculateProtocolFee([signedOrder])
    //     });
    // console.log(txHash)
    providerEngine().stop();

})().catch(err => {
    console.log('!!!!!!!!!!!!!!!!!!!', err)
})








































































    // const stakingContract = contractWrappers.staking;
    // let res = await stakingContract.addExchangeAddress(contractWrappers.contractAddresses.exchange).awaitTransactionSuccessAsync({
    //     from: maker,
    // });
    // console.log(res)
    // const tx = await stakingContract.removeExchangeAddress(contractWrappers.contractAddresses.exchange).awaitTransactionSuccessAsync({
    //     from: maker,
    // })
    // console.log(tx)

    // const receipt = await stakingContract
    //     .payProtocolFee(maker, taker, new BigNumber(1))
    //     .awaitTransactionSuccessAsync({ from: maker, value: 0 });
    // console.log(receipt)



/**
 * // "15001": {
//     "erc20Proxy": "0xed13914560569d8f902fe1eaa945578a738f7a63",
//     "erc721Proxy": "0xdff51569f6dd4cb74054cd8e14c3aeca06734f47",
//     "erc1155Proxy": "0x7f482ef7427ad95d41a890347a808cf385e68f49",
//     "zrxToken": "0x728135bc0206c497998f31d63134ff5a2de8d7d0",
//     "etherToken": "0x99c2f0c10a64fdbf466a5f4f24794f7c112c23a4",
//     "exchange": "0x299c212a6c4e4d549cd08859c1034f1a90d3e426",
//     "assetProxyOwner": "0x0000000000000000000000000000000000000000",
//     "erc20BridgeProxy": "0xa2ba88cfe6aacd2de352150ab10ce39703f5924d",
//     "zeroExGovernor": "0x0000000000000000000000000000000000000000",
//     "forwarder": "0x77c9f4c2816f62c481d8bdc3bbac6c5e346fe08f",
//     "coordinatorRegistry": "0xcb76b850d50533421bf51d96cd85288a18493bc2",
//     "coordinator": "0x3f1f88c3b0c05329c0c002cb35a1c0b156f4ddc0",
//     "multiAssetProxy": "0x2ef0f62558c45da088c0eaebfe0cd81e7b7cbd76",
//     "staticCallProxy": "0x15fe9aaf1fef57c58fa33d4982e638b482930340",
//     "devUtils": "0x677c8f6304e529b0014b1c65d7fe8b94e9ff418c",
//     "exchangeV2": "0x0f0280f3fa1bacc7e4b60a3ed5735f8756d63b72",
//     "zrxVault": "0x46c99dee25f7ec45a0555a5b15d558a3c6a37c2a",
//     "staking": "0xdb0e9a74d1f957d714c958ac86fa42370731c70c",
//     "stakingProxy": "0x1bd9be970a35a9e0dd35ef7f835b57ccea42264a",
//     "uniswapBridge": "0x0000000000000000000000000000000000000000",
//     "eth2DaiBridge": "0x0000000000000000000000000000000000000000",
//     "erc20BridgeSampler": "0x0e71fd73bd25c76f94ce3771278a3dc9b6babd10",
//     "kyberBridge": "0x0000000000000000000000000000000000000000",
//     "chaiBridge": "0x0000000000000000000000000000000000000000",
//     "dydxBridge": "0x0000000000000000000000000000000000000000",
//     "godsUnchainedValidator": "0x0000000000000000000000000000000000000000",
//     "broker": "0x0000000000000000000000000000000000000000",
//     "chainlinkStopLimit": "0x0000000000000000000000000000000000000000",
//     "curveBridge": "0x0000000000000000000000000000000000000000",
//     "maximumGasPrice": "0x0000000000000000000000000000000000000000",
//     "dexForwarderBridge": "0x0000000000000000000000000000000000000000"
// }
 */
