// NotFoundImage.tsx
import React, { JSX } from 'react';
import { Container, Title, Text, Button, SimpleGrid } from '@mantine/core';
import classes from './NotFoundComponent.module.css';

interface NotFoundImageProps {
  goToText?: string;
  goToLink?: string;
}

export const NotFoundComponent = ({ goToText = "Get back to home page", goToLink = "/" }: NotFoundImageProps): JSX.Element => {
  return (
    <Container className={classes.root}>
      <SimpleGrid spacing={{ base: 40, sm: 80 }} cols={{ base: 1, sm: 2 }}>
        <div>
          <Title className={classes.title}>Something is not right...</Title>
          <Text color="dimmed" size="lg">
            Page you are trying to open does not exist. You may have mistyped the address, or the
            page has been moved to another URL. If you think this is an error contact support.
          </Text>
          <Button
            variant="outline"
            size="md"
            mt="xl"
            className={classes.control}
            component="a"
            href={goToLink}
          >
            {goToText}
          </Button>
        </div>
      </SimpleGrid>
    </Container>
  );
}
