import React, { useState } from "react";
import { Checkbox, Card, TextField, FormControlLabel, makeStyles, FormGroup, FormControl } from "@material-ui/core";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";
import { Form, useFormik, FormikProvider } from "formik";
import * as Yup from "yup";

import Loader from "../../Loader/Loader";
import { Alert } from "../../Alert/Alert";
import { Button } from "../../Button/Button";

interface IEditUserProps {
    userId: string;
}

const editUserStyles = makeStyles(theme => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1)
    },
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  }
}));

const AdminEditUser = ({ userId } : IEditUserProps): any => {
    const classes = editUserStyles();
    const history = useHistory();
    const [ error, setError ] = useState<string | null>(null);
    const { data, loading, error: loadingError } = useQuery(
        GET_USER,
        {
            variables: {
                id: userId
            }
        }
    );
    const [ updateUser ] = useMutation(
        UDPATE_USER,
        {
            onError: (data) => {
                console.error(data.message);
                setError(data.message)
            },
            onCompleted: (data) => {
                if (data.user.updateUser.result.succeeded) {
                    history.push("/admin/users/list");
                } else {
                    const err = "Error updating user: " + data.user.updateUser.result.errors.map((e: any) => e.description).join(", ");
                    console.error(err);
                    setError(err);
                }
            }
        });
    const formik = useFormik({
        initialValues: {
            firstName: "",
            lastName: "",
            isAdmin: false,
            representsNumberParticipants: 1,
            initialized: false
        },
        validationSchema: Yup.object({
            representsNumberParticipants: Yup.number().required("Must be filled in").min(1, "Must be a positive number"),
            firstName: Yup.string(),
            lastName: Yup.string(),
            isAdmin: Yup.boolean(),
            initialized: Yup.boolean().oneOf([true], "Data must be loaded")
        }),
        onSubmit: async (values) => {
            await updateUser({ variables: {
                user: {
                    id: userId,
                    email: data.user.email,
                    isSubscribedNewsletter: data.user.isSubscribedNewsletter,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    isAdmin: values.isAdmin,
                    representsNumberParticipants: values.representsNumberParticipants
                }
            }});
            formik.setSubmitting(false);
        }
    });
    if (data && !formik.values.initialized) {
        formik.setValues({
            firstName: data.user.firstName ?? "",
            lastName: data.user.lastName ?? "",
            isAdmin: data.user.isAdmin,
            representsNumberParticipants: data.user.representsNumberParticipants,
            initialized: true
        });
    }
    return <FormikProvider value={formik}>
        { loading ? <Loader /> : null }
        <Card>
            <Alert type="error" text={error} />
            <Alert type="error" text={loadingError?.message} />
            <Form className={classes.root} onSubmit={formik.handleSubmit}>
                <FormGroup>
                    <FormControl>
                        <TextField
                            label="First Name"
                            type="text"
                            { ...formik.getFieldProps('firstName') }
                        />
                        <Alert type="error" text={formik.errors.firstName} />
                    </FormControl>
                    <FormControl>
                        <TextField
                            label="Last Name"
                            type="text"
                            { ...formik.getFieldProps('lastName') }
                        />
                        <Alert type="error" text={formik.errors.lastName} />
                    </FormControl>
                    <FormControl>
                        <TextField
                            label="Represents number participants"
                            type="number"
                            { ...formik.getFieldProps('representsNumberParticipants') }
                        />
                        <Alert type="error" text={formik.errors.representsNumberParticipants} />
                    </FormControl>
                    <FormControl className={classes.formControl}>
                        <FormControlLabel
                            control={<Checkbox
                                checked={formik.values.isAdmin}
                                { ...formik.getFieldProps('isAdmin') }
                            />}
                            label="Is Admin"
                        />
                        <Alert type="error" text={formik.errors.isAdmin} />
                    </FormControl>
                    <Button type="submit" disabled={formik.isSubmitting}>Submit</Button>
                </FormGroup>
            </Form>
        </Card>
    </FormikProvider>;
};

const UDPATE_USER = gql`
    mutation UpdateUser($user: UpdatedUserInputGraph!) {
        user {
            updateUser(user: $user) {
                result {
                    succeeded
                    errors {
                        code
                        description
                    }
                }
                user {
                    id
                    email
                    isSubscribedNewsletter
                    firstName
                    lastName
                    isAdmin
                    fullName
                    registrationDate
                    representsNumberParticipants
                }
            }
        }
    }
`;

const GET_USER = gql`
    query GetUser($id: ID!) {
        user(id: $id) {
            id
            email
            isSubscribedNewsletter
            firstName
            lastName
            isAdmin
            fullName
            registrationDate
            representsNumberParticipants
        }
    }
`;

export default AdminEditUser;