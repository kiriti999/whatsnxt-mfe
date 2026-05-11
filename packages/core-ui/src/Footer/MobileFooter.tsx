import { Accordion, ActionIcon, Anchor, Box, Group, List, ListItem, Skeleton, Stack, Text, Flex } from '@mantine/core';
import classes from './Footer.module.css';
import { MobileLogo } from '../Logo';

export const MobileFooter = ({ footerSections, socialMediaPlatforms, isLoading }: any) => {
    const renderSectionContent = (section: any) => {
        if (section.title === 'Address') {
            return (
                <List className={classes['footer-contact-info']}>
                    {section.links?.map((info: any, i: number) => (
                        <ListItem key={i}>
                            <Flex>
                                {info.icon && <Box mr="sm">{info.icon}</Box>}
                                <Anchor
                                    className="text-decoration-none"
                                    href={info.link}
                                    c="white"
                                    {...(info.link.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                >
                                    {info.text}
                                </Anchor>
                            </Flex>
                        </ListItem>
                    ))}
                </List>
            );
        } else {
            return (
                <List className={classes['footer-contact-info']}>
                    {section.links?.map((link: any, i: number) => (
                        <ListItem key={i}>
                            <Flex>
                                {link.icon && <Box mr="sm">{link.icon}</Box>}
                                <Anchor className="text-decoration-none" href={link.link}>{link.text}</Anchor>
                            </Flex>
                        </ListItem>
                    ))}
                </List>
            );
        }
    };

    return (
        <Box className={classes.mobileFooterInner}>
            {/* Logo + blurb + social: one centered column */}
            <Stack gap="md" align="center" component="section" className={classes.mobileBrandBlock}>
                <MobileLogo color="white" variant="footer" width={420} height={104} />
                <Text size="md" className={`${classes['brand-blurb']} ${classes.mobileBrandBlurb}`}>
                    Working to bring significant changes in online-based learning by
                    doing extensive research for course curriculum preparation,
                    student engagements, and looking forward to the flexible
                    education!
                </Text>
                <Group
                    gap={12}
                    className={classes.social}
                    justify="center"
                    wrap="nowrap"
                    w="100%"
                    aria-label="Social links"
                >
                    {socialMediaPlatforms.map((smp: any, i: number) => (
                        <Anchor key={i} href={smp.url} target="_blank" rel="noopener noreferrer">
                            <ActionIcon size="lg" color="white" variant="subtle" className={classes.socialIcon}>
                                {smp.icon}
                            </ActionIcon>
                        </Anchor>
                    ))}
                </Group>
            </Stack>

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
        </Box>
    );
};
