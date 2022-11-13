import {Component} from '@angular/core';
import {WalletService} from "./wallet/wallet.service";
import {WalletSignService} from "./wallet/wallet-sign.service";
import {NGXLogger} from "ngx-logger";
import {EmailAuthenticatorService} from "./auth/email-authenticator.service";
import {DataSignature} from "./DataSignature";
import Web3 from "web3";
import {TransactionInputCommand} from "./ui/transaction-input/TransactionInputCommand";
import {fadeInOnEnterAnimation, fadeOutOnLeaveAnimation} from "angular-animations";
import {BannerContent} from "./ui/BannerContent";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    animations: [
        fadeInOnEnterAnimation({duration: 1200}),
        fadeOutOnLeaveAnimation({duration: 2000})
    ]
})
export class AppComponent {
    title = 'MetaMail-frontend';
    public inputEmail: string = "";
    public inputTransfer: TransactionInputCommand = {
        target: '',
        amount: 0
    };
    public bannerState: boolean = false;
    public bannerMessage: string = "";

    ngOnInit() {

        console.log(location.href);

        //Handle redirect back from oauth flow
        let urlPath = location.href;
        let searchPattern = "?tx=";
        if (urlPath.includes(searchPattern, 0)) {
            let values = urlPath?.split('=');
            console.warn(values)
            this.bannerMessage = this.bannerContent.getEmailRegisteredValue(values[1])
            this.bannerState = true;
        }

    }

    constructor(
        private logger: NGXLogger,
        private walletService: WalletService,
        private walletSignService: WalletSignService,
        private emailAuth: EmailAuthenticatorService,
        private bannerContent: BannerContent
    ) {
    }

    public handleTokenTransfer(): void {
        // let ret = this.walletSignService
        //     .readAccountByHash("0xe93f7f72ee21022dd5e0f080e56ea763d30904ada7ce51bf33ac08a27da853c2");
        // console.log(ret);
        // ret.then(value => console.log(value));

        this.logger.warn(this.inputTransfer);

        this.walletSignService.getCurrentAccount().then((eth_accounts: any) => {

            this.logger.info(eth_accounts);
            let target = "0x1E1AA5055abacFEC06CbfF16aa9540927782fC34";
            this.logger.info(target);


            this.walletSignService.readAccountByHash(Web3.utils.keccak256(this.inputTransfer.target))
                .then(target_acc => {
                    //Send tx
                    this.logger.info("Found wallet address: " + target_acc);
                    this.walletSignService.initFundsTransfer(eth_accounts, target_acc, this.inputTransfer.amount)
                        .then(value => {
                            this.logger.info("TX: " + value);
                            this.bannerState = true;
                            this.bannerMessage = this.bannerContent.getEmailTransfer(target_acc);
                            return value;
                        }).catch(reason => {
                        this.logger.error(reason)
                    })

                });

        });


    }


    public handleBtnClick(): void {
        this.logger.log("Data entered: " + this.inputEmail);
        this.walletSignService.signMessage(this.inputEmail).then(value => {
            this.logger.info("Message signed")
            this.logger.log(value);
            return value;
        }).then(value => {
            //Send http request
            this.logger.log("Sending request to auth");
            this.emailAuth.requestAccessToken({data: value} as DataSignature)
        }).catch(reason => {
            this.logger.info("Tx error or rejected");
            this.logger.error(reason);
        })
    }

    public handleBannerClose(): void {
        this.bannerState = false;
    }


}
