
import React from 'react';
import TrainerProfile from '../../_component/trainer/trainer-profile';
import { fetchTrainerProfile } from '../../../fetcher/trainerServerQuery';

export const dynamic = 'force-dynamic'

async function Page(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  // Extract query parameters
  const userId = searchParams?.userId;

  // Pass query parameters to the fetch function
  const data = await fetchTrainerProfile(userId);

  return <TrainerProfile profile={data?.profile} />;
}

export default Page;
