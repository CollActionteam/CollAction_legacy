import React, { useState } from "react";
import { Card, CardContent, CardActions } from "@material-ui/core";
import { IUser } from "../../api/types";
import { useMutation, gql } from "@apollo/client";
import { Alert } from "../Alert/Alert";
import { Button } from "../Button/Button";
import { useAnalytics } from "../../providers/AnalyticsProvider";

interface INewsletterSubscriptionProps {
    user: IUser;
}

const NewsletterSubscription = ({ user }: INewsletterSubscriptionProps) => {
    const [ errorMessage, setErrorMessage ] = useState<string | null>(null);
    const { sendUserEvent } = useAnalytics();
    const [ toggleSubscription ] =
        useMutation(
            UPDATE_USER,
            {
                variables: {
                    updatedUser: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        isSubscribedNewsletter: !user.isSubscribedNewsletter,
                        representsNumberParticipants: user.representsNumberParticipants,
                        isAdmin: user.isAdmin
                    }
                },
                onCompleted: (data) => {
                    if (!data.user.updateUser.result.succeeded) {
                        let error = data.user.updateUser.result.errors.map((e: any) => e.description).join(", ");
                        console.error(error);
                        setErrorMessage(error);
                    }
                },
                onError: (data) => {
                    console.error(data.message);
                    setErrorMessage(data.message);
                }
            });

    return <>
            <Alert type="error" text={errorMessage} />
            <Card>
                <CardContent>
                    <h3>Newsletter subscription</h3>
                    {
                        user.isSubscribedNewsletter ? 
                            <p>Unsubscribe from our newsletter, we'll be sad to see you go!</p> : 
                            <p>Subscribe to our newsletter if you would like to receive an update from CollAction every once in a while - don't worry, we like spam as little as you do! <span role="img" aria-label="smiley">🙂</span></p>
                    }
                </CardContent>
                <CardActions>
                    <Button onClick={() => { toggleSubscription(); sendUserEvent(false, 'user', user.isSubscribedNewsletter ? 'unsubscribe' : 'subscribe', 'newsletter', null); }}>{ user.isSubscribedNewsletter ? "Unsubscribe" : "Subscribe" }</Button>
                </CardActions>
            </Card>
        </>;
};

const UPDATE_USER = gql`
    mutation UpdateUser($updatedUser: UpdatedUserInputGraph!)
    {  
        user {
            updateUser(user:$updatedUser) {
                user {
                    id
                    isSubscribedNewsletter
                }
                result {
                    succeeded
                    errors {
                        code
                        description
                    }
                }
            }
        }
    }`;

export default NewsletterSubscription;