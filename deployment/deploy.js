const etherlime = require('etherlime');
const Verifier = require('../build/Verifier.json');


const deploy = async (network, secret) => {

	const deployer = new etherlime.EtherlimeGanacheDeployer();
	const result = await deployer.deploy(Verifier);

};

module.exports = {
	deploy
};