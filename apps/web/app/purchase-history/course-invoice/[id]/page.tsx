import React from 'react';
import { serverFetcher } from '../../../../fetcher/serverFetcher';
import CourseInvoice from '../../../../components/CourseInvoice';

export const dynamic = 'force-dynamic'

const CourseInvoicePage = async props => {
    const params = await props.params;
    try {
        const BASEURL = process.env.BFF_HOST_API as string;
        const response = await serverFetcher(BASEURL, `/orders/${params.id}`);
        console.log(response, 'response');
        return (
            <CourseInvoice order={response} />
        );
    } catch (err) {
        console.log(err, 'error in InvoicePage');
        return <></>;
    }
};

export default CourseInvoicePage;
