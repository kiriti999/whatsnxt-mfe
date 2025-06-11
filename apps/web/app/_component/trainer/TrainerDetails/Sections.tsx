import { useMemo, useState } from "react";
import { Tabs } from "@mantine/core";
import Profile from "./Profile";
import Courses from "./Courses";
import styles from './style.module.css';

const Sections = ({ about, skills, languages, courses, certification }) => {
    const TABS = useMemo(() => [
        {
            label: 'Profile',
            value: 'profile',
            children: <Profile skills={skills} about={about} languages={languages} certification={certification} />
        },
        {
            label: 'Reviews',
            value: 'reviews',
            children: <>Reviews coming soon</>,
        },
        {
            label: `Courses (${courses.length})`,
            value: 'courses',
            children: <Courses courses={courses} />,
        },
    ], [])

    const [activeTab, setActiveTab] = useState(TABS[0].value);

    return (
        <Tabs value={activeTab} defaultValue={activeTab} keepMounted={false} onChange={setActiveTab} className={styles['tabs']}>
            <Tabs.List>
                {TABS.map(tab => (
                    <Tabs.Tab key={tab.value} value={tab.value}>
                        {tab.label}
                    </Tabs.Tab>
                ))}
            </Tabs.List>
            {TABS.map(tab => (
                <Tabs.Panel key={tab.value} value={tab.value} className={styles['tabs-panel']}>
                    {tab.children}
                </Tabs.Panel>
            ))}
        </Tabs>
    )
}

export default Sections;
