import { Card, Stack, Text, Title } from "@mantine/core";
import styles from "./AuthorInfo.module.css";

const AuthorInfo = ({ about, name, designation, experience }) => {
    return (
        <Card className={styles.card}>
            <Stack className={styles.stack}>
                <Title order={6} className={styles.title}>Posted by:</Title>
                <Text className={styles.text}>Name: {name}</Text>
                <Text className={styles.text}>Designation: {designation}</Text>
                <Text className={styles.text}>Experience: {experience} years</Text>
                <Text className={styles.text}>About: {about}</Text>
            </Stack>
        </Card>
    );
};

export default AuthorInfo;
