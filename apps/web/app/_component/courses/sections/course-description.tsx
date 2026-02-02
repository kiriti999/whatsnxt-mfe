import { Accordion, Title } from '@mantine/core'
import styles from '../../../../components/Courses/Course.module.css';
import contentStyles from '../../../../components/Blog/Content/BlogContent.module.css';
import { LexicalEditor } from '../../../../components/StructuredTutorial/Editor/LexicalEditor';

const CourseDescription = ({ courseTopics }) => {
    return (
        <>
            <div className={`${contentStyles.content} rte ${styles['courses-overview']}`}>
                <div style={{ display: 'contents' }}>
                    <Accordion variant="default" defaultValue="description" transitionDuration={250}>
                        <Accordion.Item value="description" p={0}>
                            <Accordion.Control p={0}>
                                <Title order={3}>Description</Title>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <LexicalEditor value={courseTopics} readOnly={true} />
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>
        </>
    )
}

export default CourseDescription;
