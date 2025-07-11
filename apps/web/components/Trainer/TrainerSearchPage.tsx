import { Container, Skeleton, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { TrainerAPI } from '../../apis/v1/courses/trainer/trainer';
import styles from './TrainerSearchPage.module.css';
import SearchData from './SearchData';

function SearchTrainerPage({ query, page = 1 }) {
  const [total, setTotal] = useState(50);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const fetchTrainers = async () => {
    try {
      const res = await TrainerAPI.searchTrainers(page, query)
      console.log(res);
      setLoading(false);
      setData(res.data.trainers);
      setTotal(res.data.total);
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, [query, page]);

  return (
    <Container size={'xl'}>
      <SearchData data={data} total={total} page={page} query={query} />

      {loading && [...Array(5).keys()].map(i => <Skeleton key={i} width="100%" height={50} radius="sm" my={5} />)}

      {!loading && data.length === 0 && (
        <Title order={3} ta={'center'}>No trainers found for query: "{query}"</Title>
      )}
    </Container>
  );
}

export default SearchTrainerPage;
