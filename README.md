# BlockSplit - Demo

This project was generated with Etherlime and shows how to use ZK-Proof with dApps

# How to run it

1. Make sure to run `npm install` in the root directory as well as in `web/zk-web`.

2. Go into `web/zk-web` and run `ng-serve`.

# How to use it

1. You can use `etherlime zk compile` to compile the circuit located in `zero-knowledge-proof/circuits`. New file is creted in `compiled-circuits`.
2. You can use `etherlime zk setup` to compile the trusted setup based on the compiled circuit from step 1. New files with pk and vk are created in `trusted-setup`.
3. You can use `etherlime proof` to generate a witness and a proof. The command use the `input.json` file located in `input` folder. The generated proof is located in `generated-proof` folder.
4. You can use `etherlime zk generate` to generate a smart contract, ready to be used for On-Chain verification. The contract is stored in `contracts` folder.
5. You can use `etherlime zk call` to generate a call based on your proof, ready to be send to the contract method `verifyProof`. The call is printed on the console as well as saved in folder `generated-call`.
