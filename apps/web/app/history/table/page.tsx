import { Container } from '@mantine/core';
import History from './History';

export default function HistoryPage() {
  return (
    <>
      <Container fluid>
        <div className="table-wrapper">
          <div className="table-title"></div>
          <History />
        </div>
      </Container>
    </>
  );
}
