'use client';
import { Title, Anchor, Container } from '@mantine/core';

const LectureLinks = ({ linkAr }) => {
    return (
        <div>
            <Title order={3}>Links</Title>
            {linkAr.map((linkData, index: number) => (
                <Container key={linkData?._id}>
                    <Anchor href={linkData?.link} target="_blank">Show Link {index + 1}</Anchor>
                </Container>
            ))}
        </div>
    )
}

export default LectureLinks;
