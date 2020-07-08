function connect() {
  if (typeof ethereum !== "undefined") {
    ethereum.enable().catch((err) => {
      console.log(err);
    });
  }
}
if (window.web3.currentProvider.selectedAddress === null) {
  return connect();
}

let {
  ContractWrappers,
  ERC20TokenContract,
  OrderStatus,
} = require("@0x/contract-wrappers");
let { providerEngine } = require("./provider_engine");
let { generatePseudoRandomSalt, signatureUtils } = require("@0x/order-utils");
let { BigNumber } = require("@0x/utils");
let { NETWORK_CONFIGS, TX_DEFAULTS } = require("./configs");
let {
  DECIMALS,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
  NULL_ADDRESS,
  NULL_BYTES,
  ZERO,
} = require("./constants");
let { Web3Wrapper } = require("@0x/web3-wrapper");
let utils = require("./utils");

(async () => {
  const contractWrappers = new ContractWrappers(providerEngine(), {
    chainId: NETWORK_CONFIGS.chainId,
  });
  const web3Wrapper = new Web3Wrapper(providerEngine());
  const [maker, taker] = await web3Wrapper.getAvailableAddressesAsync();

  const TestBTokenAddress = "0x9c8Fc50582F80bad23347627B64e7243fa11287c".toLowerCase();
  const TestCTokenAddress = "0x83d3E487Fe04F9c407C407Dddd15665373f48B0f".toLowerCase();
  const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(
    new BigNumber(10),
    DECIMALS
  );
  const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(
    new BigNumber(10),
    DECIMALS
  );
  const makerAssetData = await contractWrappers.devUtils
    .encodeERC20AssetData(TestBTokenAddress)
    .callAsync();
  const takerAssetData = await contractWrappers.devUtils
    .encodeERC20AssetData(TestCTokenAddress)
    .callAsync();
  let txHash;

  // const erc20Token = new ERC20TokenContract(TestBTokenAddress, providerEngine());
  // const makerTestBApprovalTxHash = await erc20Token
  //     .approve(contractWrappers.contractAddresses.erc20Proxy, UNLIMITED_ALLOWANCE_IN_BASE_UNITS)
  //     .sendTransactionAsync({ from: maker });
  // console.log(makerTestBApprovalTxHash)

  // const etherToken = new ERC20TokenContract(TestCTokenAddress, providerEngine());
  // const takerTestCApprovalTxHash = await etherToken
  //     .approve(contractWrappers.contractAddresses.erc20Proxy, UNLIMITED_ALLOWANCE_IN_BASE_UNITS)
  //     .sendTransactionAsync({ from: taker });
  // console.log(takerTestCApprovalTxHash)

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

  const signedOrder = await signatureUtils.ecSignOrderAsync(
    providerEngine(),
    order,
    maker
  );

  // const txHashCancel = await contractWrappers.exchange.cancelOrder(order).awaitTransactionSuccessAsync({ from: maker, gas: 8000000 });
  // console.log(txHashCancel)

  const [
    { orderStatus, orderHash },
    remainingFillableAmount,
    isValidSignature,
  ] = await contractWrappers.devUtils
    .getOrderRelevantState(signedOrder, signedOrder.signature)
    .callAsync();
  if (
    orderStatus === OrderStatus.Fillable &&
    remainingFillableAmount.isGreaterThan(0) &&
    isValidSignature
  ) {
    console.log("Fillable");
  }
  txHash = await contractWrappers.exchange
    .fillOrder(signedOrder, takerAssetAmount, signedOrder.signature)
    .awaitTransactionSuccessAsync({
      from: taker,
      gas: 8000000,
      gasPrice: 1000000000,
      value: utils.calculateProtocolFee([signedOrder]),
    });
  console.log(txHash);
  providerEngine().stop();
})().catch((err) => {
  console.log("!!!!!!!!!!!!!!!!!!!", err);
});
