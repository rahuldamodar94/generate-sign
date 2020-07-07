let { RPCSubprovider, Web3ProviderEngine, MetamaskSubprovider } = require('@0x/subproviders');
let { providerUtils } = require('@0x/utils');

let { NETWORK_CONFIGS } = require('./configs');

const determineProvider = () => {

    const pe = new Web3ProviderEngine();

    // this is where I'm making a change, using SignerSubProvider was causing the error
    // now it has been fixed, integration with front will be easy now :) -- Anjan Roy<anjanroy@yandex.com>
    pe.addProvider(new MetamaskSubprovider(window.web3.currentProvider));

    pe.addProvider(new RPCSubprovider(NETWORK_CONFIGS.rpcUrl));
    providerUtils.startProviderEngine(pe);
    return pe;
};

module.exports = {
    providerEngine: determineProvider
}
