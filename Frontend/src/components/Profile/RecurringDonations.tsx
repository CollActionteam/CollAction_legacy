import React from "react";
import { IUser } from "../../api/types";
import { Card, List, CardContent } from "@material-ui/core";
import RecurringDonationSubscription from "./RecurringDonationSubscription";

interface IRecurringDonationProps {
    user: IUser;
}

const RecurringDonations = ({ user }: IRecurringDonationProps) => {
    return <Card>
        <CardContent>
            <h3>Donation Subscriptions</h3>
            { user.donationSubscriptions.length > 0 ?
                <List>
                    { user.donationSubscriptions.map(subscription => <RecurringDonationSubscription key={subscription.id} subscription={subscription} />) }
                </List> : 
                <p>You have no recurring donations</p>
            }
        </CardContent>
    </Card>;
};

export default RecurringDonations;