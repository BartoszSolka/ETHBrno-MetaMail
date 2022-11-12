import {Injectable} from '@angular/core';
import Web3 from "web3";
import {WalletActionType} from "./wallet-action-type";
import {Address} from "abitype";
import '@metamask/legacy-web3'
import {Contract} from "web3-eth-contract";

@Injectable({
    providedIn: 'root'
})
export class WalletSignService {

    constructor() {
    }

    async signMessage(message: string): Promise<string> {
        if (!window.ethereum) throw new Error("Metamask wallet not connected :/");

        // connect and get metamask account
        const account = await this.getCurrentAccount();

        // message to sign
        console.log({message});

        // hash message
        const hashedMessage = Web3.utils.sha3(message);
        console.log({hashedMessage});


        // sign hashed message
        const signature: Promise<string> = window.ethereum.request({
            method: WalletActionType.SIGN_DATA,
            params: [hashedMessage, account],
        });
        console.log({signature});

        return signature;

    }

    async getCurrentAccount(): Promise<Address[]> {
        // connect and get metamask account
        const accounts = await window.ethereum.request({method: WalletActionType.REQUEST_ACCOUNT});
        return accounts[0];
    }

    async loadContract(): Promise<Contract> {
        let abi = [{
            "inputs": [{"internalType": "address", "name": "_oracleAddress", "type": "address"}],
            "stateMutability": "nonpayable",
            "type": "constructor"
        }, {
            "inputs": [{"internalType": "bytes32", "name": "emailHash", "type": "bytes32"}],
            "name": "getWalletAddress",
            "outputs": [{"internalType": "address", "name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [{"internalType": "bytes32", "name": "_emailHash", "type": "bytes32"}, {
                "internalType": "uint8",
                "name": "_v",
                "type": "uint8"
            }, {"internalType": "bytes32", "name": "_r", "type": "bytes32"}, {
                "internalType": "bytes32",
                "name": "_s",
                "type": "bytes32"
            }], "name": "registerEmail", "outputs": [], "stateMutability": "nonpayable", "type": "function"
        }];
        let address = "0x078aa0051964d9da034e323967386910d96a4a90"
        var web3 = new Web3(window.ethereum);

        // @ts-ignore
        return new web3.eth.Contract(abi, address);
    }

    async readAccountByHash(hashData: string): Promise<string> {

        let contract: Contract = await this.loadContract();

        let accountFrom = await this.getCurrentAccount();

        return await contract.methods.getWalletAddress(hashData).call();
    }

}
