import React from 'react'
import { fetchCourseBuilderData } from '../../../../../fetcher/courseBuilderServerQuery';
import PricingInformation from '../../../../_component/trainer/PricingInformation';


async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    console.log(' Page :: params:', params)
    let courseFetched = null;

    if (params.id) {
        // Fetch the course data on the server
        try {
            courseFetched = await fetchCourseBuilderData(params.id);
        } catch (error) {
            console.error('priceInformation:: Error fetching course:', error);
        }
    }
    return (
        <PricingInformation id={params.id} courseData={courseFetched} />
    )
}

export default Page
