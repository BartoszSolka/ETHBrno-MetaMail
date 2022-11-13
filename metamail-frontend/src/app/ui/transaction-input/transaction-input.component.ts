import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from "@angular/forms";
import {ErrorStateMatcher} from "@angular/material/core";
import {TransactionInputCommand} from "./TransactionInputCommand";


export class InputErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}

@Component({
    selector: 'app-transaction-input',
    templateUrl: './transaction-input.component.html'
})
export class TransactionInputComponent implements OnInit {

    transactionFormControl = new FormControl('', [Validators.required]);
    matcher = new InputErrorStateMatcher();

    @Input() value: TransactionInputCommand = {
        target: '',
        amount: 0
    };
    @Output() valueChange = new EventEmitter<TransactionInputCommand>();

    public inputValue: string = '';
    public inputAmount: string = '';

    constructor() {
    }

    ngOnInit(): void {
    }

    public _formSubmit(): void {
        this.valueChange.emit({
            target: this.inputValue,
            amount: Number(this.inputAmount)
        } as TransactionInputCommand);
    }


}
