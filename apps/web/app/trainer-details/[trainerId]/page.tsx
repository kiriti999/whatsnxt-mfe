import React from 'react';
import { fetchTrainerDetails } from '../../../fetcher/trainerServerQuery';
import TrainerDetails from '../../_component/trainer/TrainerDetails';

const TrainerDetailsPage = async props => {
    const params = await props.params;
    const data = await fetchTrainerDetails(params.trainerId);
    return (
        <TrainerDetails trainer={data?.trainerData} courses={data?.courses} />
    )
}

export default TrainerDetailsPage;
