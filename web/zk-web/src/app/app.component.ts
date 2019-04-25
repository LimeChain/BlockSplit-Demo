declare let require: any;
import { Component, OnInit } from '@angular/core';
const zkSnark = require('snarkjs');
const { unstringifyBigInts } = require('snarkjs');
const etherlime = require('etherlime');
const ethers = require('ethers');
const circuit = require('../../../../zero-knowledge-proof/compiled-circuits/circuit.json');
const verifier = require('../../../../build/CardsGame.json');
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
  public contractAddress = '0x9eD274314f0fB37837346C425D3cF28d89ca9599';
  public proverPK = '0x6ca40ba4cca775643398385022264c0c414da1abd21d08d9e7136796a520a543';

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
  private proverWallet;

  constructor() {

  }

  async ngOnInit() {

    // parse circuit
    this.circuit = new zkSnark.Circuit(circuit);
    this.proovingKey = unstringifyBigInts(proverKey);
    this.verificationKey = unstringifyBigInts(verifierKey);
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
        } else {
          this.showModal('Your Proof is INVALID');
        }
        this.isLoading = false;
      } catch (e) {
        console.log(e);
        this.isLoading = false;
      }
    }, 1000);
  }


  public async generateCall() {
    this.generatedCall = zkSnark.generateCall(this.publicSignals, this.proof);
  }


  // OnChain Verify Proof
  public async verifyOnChain() {
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    this.proverWallet = new ethers.Wallet(this.proverPK, provider);
    this.contractInstance = await etherlime.ContractAt(verifier, this.contractAddress, this.proverWallet, provider);
    const contractArgsStr = zkSnark.generateCall(this.publicSignals, this.proof);
    const contractArgsArr = JSON.parse(`[${contractArgsStr}]`)
    const balanceBefore = await this.proverWallet.getBalance();
    const isValid = await this.contractInstance.submitSolution(...Array.prototype.slice.call(contractArgsArr));
    const balanceAfter = await this.proverWallet.getBalance();
    this.showModal(`Your proof is ${isValid ? 'VALID' : 'INVALID'}. Balance increased by ${ethers.utils.formatEther(balanceAfter.sub(balanceBefore).toString(10))}`);
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
