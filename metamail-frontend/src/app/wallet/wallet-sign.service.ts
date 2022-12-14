import {Injectable} from '@angular/core';
import Web3 from "web3";
import {WalletActionType} from "./wallet-action-type";
import {Address} from "abitype";
import '@metamask/legacy-web3'
import {Contract} from "web3-eth-contract";
import {ContractProperties} from "./ContractProperties";

@Injectable({
    providedIn: 'root'
})
export class WalletSignService {

    private static WEI_TO_ETH = 1e18;

    constructor() {
    }

    async signMessage(message: string): Promise<string> {
        if (!window.ethereum) throw new Error("Metamask wallet not connected :/");

        // connect and get metamask account
        const account = await this.getCurrentAccount();
        console.log("ACCOUNT: " + account);
        // message to sign
        console.log(message);

        // hash message
        const hashedMessage = Web3.utils.keccak256(message);
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
        var web3 = new Web3(window.ethereum);

        // @ts-ignore
        return new web3.eth.Contract(ContractProperties.ABI, ContractProperties.CONTRACT_ADDRESS);
    }

    async readAccountByHash(hashData: string): Promise<string> {

        let contract: Contract = await this.loadContract();

        let accountFrom = await this.getCurrentAccount();

        return await contract.methods.getWalletAddress(hashData).call();
    }

    public async initFundsTransfer(from_wallet: string, target_wallet: string, value: number): Promise<string> {
        const tr: Promise<string> = window.ethereum.request({
            method: WalletActionType.SEND_TX,
            params: [
                {
                    from: from_wallet,
                    to: target_wallet,
                    value: Web3.utils.toHex(value * WalletSignService.WEI_TO_ETH),//1e-18 eth
                },
            ],
        });
        return tr;
    }

}
