"use client"

import React from 'react';
import InstructorGuideLines from '../../components/BecomeATrainer/InstructorGuideLines';
import RegisterForm from '../../components/BecomeATrainer/RegisterForm';
import useAuth from '../../hooks/Authentication/useAuth';


const Page = () => {
  const { user } = useAuth()

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-lg">
            <RegisterForm user={user} />
          </div>
          <div className="col-lg">
            <InstructorGuideLines />
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
