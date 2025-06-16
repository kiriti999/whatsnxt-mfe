import React from 'react';
import Invoice from '../../../../components/Invoice';
import { serverFetcher } from '../../../../fetcher/serverFetcher';

export const dynamic = 'force-dynamic'

const InvoicePage = async props => {
    const params = await props.params;
    try {
        const response = await fetch(`/trainer-contacted-payment/${params.id}`);
        console.log(response, 'response');
        return (
            <Invoice order={response} />
        );
    } catch (err) {
        console.log(err, 'error in TeacherInvoicePage')
        return <></>;
    }
};

export default InvoicePage;
