﻿import renderComponentIf from "../global/renderComponentIf";
import * as React from "react";
import * as ReactDOM from 'react-dom';
import {IdealBankElement} from 'react-stripe-elements';

interface IIdealBoxProps {
    stripe: any;
    amount: number;
}

interface IIdealBoxState {
    name: string;
    showError: boolean;
    error: string;
}

export default class IdealBox extends React.Component<IIdealBoxProps, IIdealBoxState> {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            showError: false,
            error: ""
        };
    }

    setName(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ name: event.currentTarget.value });
    }

    async submitPayment(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        this.setState({ showError: false });

        let sourceData = {
            type: "ideal",
            amount: this.props.amount,
            currency: "eur",
            owner: {
                name: this.state.name
            },
            redirect: {
                return_url: window.location.origin + "/donation/ThankYou"
            }
        }

        let response = await this.props.stripe.createSource({ type: 'ideal' }, sourceData);
        if (response.status == 200) {

        } else {
            this.setState({ showError: true, error: "Unable to start iDeal" })
        }
    }

    render() {
        return (
            <form onSubmit={(ev) => this.submitPayment(ev)}>
                <div className="error" hidden={!this.state.showError}>
                    <p>{this.state.error}</p>
                </div>
                <label htmlFor="name-input">Name</label>
                <input id="name-input" className="form-control" onChange={(ev) => this.setName(ev)} type="text" />
                <IdealBankElement />
                <input type="submit" className="btn btn-default" value="submit" />
            </form>);
    }
} 