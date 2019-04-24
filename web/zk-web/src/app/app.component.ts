declare let require: any;
import { Component, OnInit } from '@angular/core';
const zkSnark = require('snarkjs');
const { unstringifyBigInts } = require('snarkjs');
const etherlime = require('etherlime');
const ethers = require('ethers');
const circuit = require('../../../../zero-knowledge-proof/compiled-circuits/circuit.json');
const verifier = require('../../../../build/Verifier.json');
const proverKey = require('../../../../zero-knowledge-proof/trusted-setup/circuit_proving_key.json');
const verifierKey = require('../../../../zero-knowledge-proof/trusted-setup/circuit_verification_key.json');
declare let $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'zk-web';

  public contractInstance: any;
  public contractAddress = '0xc9707E1e496C12f1Fa83AFbbA8735DA697cdBf64';

  public firstCard: string;
  public secondCard: string;
  public thirdCard: string;
  public fourthCard: string;

  public circuit;
  public proovingKey;
  public verificationKey;
  public proof;
  public publicSignals;
  public input;
  public isLoading: boolean;
  public modalMessage: string;
  public infoMessage: string;
  public shouldShowInfoMessage: boolean;
  public errorMessage: string;
  public shouldShowErrorMessage: boolean;
  public generatedCall: string;

  constructor() {

  }

  async ngOnInit() {

    // parse circuit
    this.circuit = new zkSnark.Circuit(circuit);
    this.proovingKey =  unstringifyBigInts(proverKey);
    this.verificationKey = unstringifyBigInts(verifierKey);


    // connect to the deployed contract
    try {
      const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
      const signer = await provider.getSigner();
      this.contractInstance = await etherlime.ContractAt(verifier, this.contractAddress, signer, provider);
    } catch (e) {
      console.log(e);
    }
  }


  // Generate Proof
  public async generateProof() {
    this.input = {
      cardOne: this.firstCard,
      cardTwo: this.secondCard,
      cardThree: this.thirdCard,
      cardFour: this.fourthCard
    };
    this.isLoading = true;
    setTimeout(async () => {
        try {
          const witness = await this.circuit.calculateWitness(this.input);
          const proofAndSignals = await zkSnark.original.genProof(this.proovingKey, witness);
          this.proof = proofAndSignals.proof;
          this.publicSignals = proofAndSignals.publicSignals;
          this.isLoading = false;
          this.showInfoMessage('Your proof is generated!');
      } catch (e) {
          console.log(e);
          this.isLoading = false;
          this.showErrorMessage('Your input data does not match the circuit constraints!');
      }
      }, 1000);
  }

  // Offchain Verify Proof
  public async verifyOffChain() {
    this.isLoading = true;
    setTimeout(async () => {
      try {
        if (await zkSnark.original.isValid(this.verificationKey, this.proof, this.publicSignals)) {
          this.showModal('Your Proof is VALID');
          this.isLoading = false;
        } else {
          this.showModal('Your Proof is INVALID');
          this.isLoading = false;
        }
      } catch (e) {
        console.log(e);
        this.isLoading = false;
      }
    }, 1000);
  }


  public async generateCall() {
    this.generatedCall = zkSnark.generateCall(this.publicSignals, this.proof);
    const test = JSON.parse(this.generatedCall);
    console.log(test);
  }


  // OnChain Verify Proof
  public async verifyOnChain() {
    // const generateCall = zkSnark.generateCall(this.publicSignals, this.proof);
    // console.log(generateCall)
    // console.log(typeof generateCall)


    // let re = /(?<=\])(,*?)(?=\[)/g;
    // const test = [["0x1b5cf30a6909c93a8d3861bf28c8c99c08430bbd400565ae55f37caeac09cbea", "0x265a29b850ddd10b4016fd805c13dd02997f78e4f0996f586f517ee104fe76af"],["0x123384ea2be39ea5158b9cbe6b2fa42665fbe68e1242a5f8956122a9f45ab877", "0x0b6929132e41905ec5bfef67fb1548856d3a9c039061ce90b11f2436e094dd09"],[["0x11f577f99c3c3f85a1842b3e6f1e8de0d78f2a4935124aeca16bece742ac5d69", "0x293289024454adcc25376a980cc52d7c494bc88141e3e9e27a462d2f949bfeaa"], ["0x261a1edd2c8f14a29c6a7f4bc6d7c1f58b98bbe2554fa1d70953656277d62186", "0x2fbdc0182db242599cae2950aa7dd260c38e37e9a2dc2c1510f4bf4321352669"]],["0x1c6ae830cea441db15aaa756a3fd9821f45813abe5d22595e98a579488a1695f", "0x13a2af1cf2f2cccfce2b425a7a9127a3ba0d244a44f7bab02e8d6edfad3b37a9"],["0x0a08a6c427af60fe89b34ce18eb6310f37de698e6648cc9503b47c801a90844f", "0x0719cb097248d018c8ae5380d0b123d003ac4ad3018cb08eb49a39ba683e7b85"],["0x1045240dcfaf082c4cad8b03206365852a24175309e83cf6562385dbfa6b1dab", "0x0363015fe554e08739849c5d458a494dc403f3c676c4bf951648cfe4cfd472fc"],["0x160ec605db9465dbb5c60aac7982683078be082b97cb0ed1024c0acfb32c0654", "0x1eef85c318a0183d73b3f5b945a38c2c7805db3407ac9e091748055c511de4aa"],["0x0897795a4322f69932f11be9acb05fd4f34e684168c9e1f2a44ab0fd7c0aabc0", "0x0140c283faa3a02cdb6e7a4d911b522de9df7f225d8a01fa37938217867ccef6"],[]];
    // const test2 = test.split(/(?<=\])(,*?)(?=\[)/g).filter((result) => result !== ',');
    // const test3 = JSON.parse(test2[0])
    // console.log(test3)

    // console.log(test2);
    const result = await this.contractInstance.verifyProof(this.generateCall);
    console.log(result)

  }

  public showModal(message) {
    this.modalMessage = message;
    $('#exampleModal').modal({
      show: true
    });
  }

  public showInfoMessage(message) {
    this.shouldShowInfoMessage = true;
    this.infoMessage = message;
    this.hideInfoMessage();
  }

  public hideInfoMessage() {
    setTimeout(() => {
      this.shouldShowInfoMessage = false;
    }, 3000);
  }

  public showErrorMessage(message) {
    this.shouldShowErrorMessage = true;
    this.errorMessage = message;
    this.hideErrorMessage();
  }

  public hideErrorMessage() {
    setTimeout(() => {
      this.shouldShowErrorMessage = false;
    }, 3000);
  }

}
