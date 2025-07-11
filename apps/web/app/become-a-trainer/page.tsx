"use client"

import React from 'react';
import InstructorGuideLines from '../../components/BecomeATrainer/InstructorGuideLines';
import RegisterForm from '../../components/BecomeATrainer/RegisterForm';
import useAuth from '../../hooks/Authentication/useAuth';
import { Container, Grid, GridCol } from '@mantine/core';


const Page = () => {
  const { user } = useAuth()

  return (
    <>
      <Container size={'xl'} pt={'xl'}>
        <Grid gutter={'xl'}>
          <GridCol span={{ base: 12, lg: 6 }}>
            <RegisterForm user={user} />
          </GridCol>
          <GridCol span={{ base: 12, lg: 6 }}>
            <InstructorGuideLines />
          </GridCol>
        </Grid>
      </Container>
    </>
  );
};

export default Page;
