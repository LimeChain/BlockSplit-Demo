const etherlime = require('etherlime');
const ethers = require('ethers')
const CardsGame = require('../build/CardsGame.json');


const deploy = async (network, secret) => {

	const deployer = new etherlime.EtherlimeGanacheDeployer();
	const result = await deployer.deploy(CardsGame, {}, "1000000000000000000" /* 1 ETH */, "250000000000000000"/* 0.25 ETH */, "100000000000000000" /* 0.1 ETH */, { value: ethers.utils.bigNumberify("1350000000000000000") });

};

module.exports = {
	deploy
};