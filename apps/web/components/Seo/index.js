import React from 'react';
import Head from 'next/head';

const SEO = ({ title, description, image }) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta itemProp="name" content={title} />
      <meta itemProp="image" content={image} />
    </Head>
  );
};

SEO.defaultProps = {
  title: 'whatsnxt',
  description: 'whatsnxt edu',
  image: 'https://www.whatsnxt.in/images/logo.png',
};

export default SEO;
