import { Badge, Group, Text, Title, Grid } from "@mantine/core";

const Profile = ({ about, skills, languages, certification }) => {

    return (
        <>
            <Title order={5}>Overview</Title>
            <Text c="gray" className="mb-2">{about}</Text>
            <Title order={5}>Certifications</Title>
            <Grid>
                <Grid.Col span={{ base: 12, md: 6, lg: 2, sm: 12 }}><Text c="gray" size='0.9rem'>Certificate Name:</Text></Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 2, sm: 12 }}><Text size='0.9rem' truncate='end'>{certification.name}</Text></Grid.Col>
            </Grid>
            <Grid>
                <Grid.Col span={{ base: 12, md: 6, lg: 2, sm: 12 }}><Text c="gray" size='0.9rem'>Certificate Link:</Text></Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 2, sm: 12 }}><Text size='0.9rem' truncate='end'>{certification.link}</Text></Grid.Col>
            </Grid>
            {languages.length > 0 && <Title order={4}>Languages spoken</Title>}
            {languages.map((language: any) => (
                <Text key={language._id} c="gray" className="mb-2">{language.name}</Text>
            ))}
            <Group mt="sm" mb="sm">
                <Title mb={0} order={5}>Skills:</Title>
                {skills?.map((skill) => (
                    <Badge key={skill} color="blue" variant="light">
                        {skill}
                    </Badge>
                ))}
            </Group>
        </>
    )
}

export default Profile;
