let { SignerSubprovider, RPCSubprovider, Web3ProviderEngine } = require('@0x/subproviders');
let { providerUtils } = require('@0x/utils');

let { NETWORK_CONFIGS } = require('./configs');

const determineProvider = () => {

    const pe = new Web3ProviderEngine();
    pe.addProvider(new SignerSubprovider(window.web3.currentProvider));
    pe.addProvider(new RPCSubprovider(NETWORK_CONFIGS.rpcUrl));
    providerUtils.startProviderEngine(pe);
    return pe;
};

module.exports = {
    providerEngine: determineProvider
}

