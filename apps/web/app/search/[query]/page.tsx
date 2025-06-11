import Search from './Search';

async function page(props: any) {
  const params = await props.params;
  return <Search query={params.query} />;
}

export default page;