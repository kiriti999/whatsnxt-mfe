import { Accordion, ActionIcon, Anchor, Box, Group, List, Text, Skeleton, Flex } from '@mantine/core';
import classes from './Footer.module.css';
import { Logo } from '../Logo';

export const MobileFooter = ({ footerSections, socialMediaPlatforms, isLoading }: any) => {
    const renderSectionContent = (section: any) => {
        if (section.title === 'Address') {
            return (
                <List className={classes['footer-contact-info']}>
                    {section.links?.map((info: any, i: number) => (
                        <List.Item key={i}>
                            <Flex>
                                {info.icon && <Box mr="sm">{info.icon}</Box>}
                                <Anchor className="text-decoration-none" href={info.link} target="_blank" c={'white'}>
                                    {info.text}
                                </Anchor>
                            </Flex>
                        </List.Item>
                    ))}
                </List>
            );
        } else {
            return (
                <List className={classes['footer-contact-info']}>
                    {section.links?.map((link: any, i: number) => (
                        <List.Item key={i}>
                            <Flex>
                                {link.icon && <Box mr="sm">{link.icon}</Box>}
                                <Anchor className="text-decoration-none" href={link.link}>{link.text}</Anchor>
                            </Flex>
                        </List.Item>
                    ))}
                </List>
            );
        }
    };

    return (
        <Box className={classes['footer-area']}>
            {/* Logo and Social Media (for Mobile) */}
            <section>
                <Logo color="white" className="w-75 mb-3" />
                <Text>
                    Working to bring significant changes in online-based learning by
                    doing extensive research for course curriculum preparation,
                    student engagements, and looking forward to the flexible
                    education!
                </Text>
                <Group gap={10} className={classes.social} justify="flex-start" wrap="nowrap">
                    {socialMediaPlatforms.map((smp: any, i: number) => (
                        <Anchor key={i} href={smp.url} target="_blank" rel="noopener noreferrer">
                            <ActionIcon size="lg" color="white" variant="subtle" className={classes.socialIcon}>
                                {smp.icon}
                            </ActionIcon>
                        </Anchor>
                    ))}
                </Group>
            </section>

            {/* Accordion Sections */}
            {!footerSections || footerSections.length === 0 ? (
                // Render skeletons for loading state
                <Box>
                    <Skeleton height={50} radius="sm" mb="md" />
                    <Skeleton height={50} radius="sm" mb="md" />
                    <Skeleton height={50} radius="sm" />
                </Box>
            ) : (
                <Accordion mt="md" className={classes['accordion-wrapper']}>
                    {footerSections.map((section: any, index: number) => (
                        <Accordion.Item key={index} value={section.title}>
                            <Accordion.Control style={{ background: '#100f1f' }} c={'white'} className={classes['accordion-item']}>
                                {section.title}
                            </Accordion.Control>
                            <Accordion.Panel>
                                {renderSectionContent(section)}
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            )}
        </Box >
    );
};
