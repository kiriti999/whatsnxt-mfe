// components/Consulting/data.ts
import {
    IconCode,
    IconBrain,
    IconSchool,
    IconRocket,
    IconMail,
    IconPhone,
    IconCalendar,
    IconTool,
    IconStar,
    IconMap,
    IconTarget,
    IconUsers,
    IconBuilding
} from '@tabler/icons-react';

export const consultingData = {
    services: [
        {
            icon: IconCode,
            title: "Technical Architecture",
            description: "Design scalable, maintainable software architectures tailored to your business needs. From microservices to monoliths, we help you choose the right approach.",
            features: ["System Design", "Technology Stack Selection", "Performance Optimization", "Security Architecture"],
            color: "blue"
        },
        {
            icon: IconBrain,
            title: "Skill Development Strategy",
            description: "Strategic guidance on building technical capabilities within your organization. Identify skill gaps and create development roadmaps.",
            features: ["Skill Gap Analysis", "Learning Path Design", "Technology Adoption Planning", "Team Capability Assessment"],
            color: "grape"
        },
        {
            icon: IconSchool,
            title: "Corporate Training",
            description: "Comprehensive training programs to upskill your development teams with the latest technologies and best practices.",
            features: ["Custom Curriculum Design", "Hands-on Workshops", "Mentorship Programs", "Progress Tracking"],
            color: "teal"
        }
    ],

    expertise: [
        { name: "Full-Stack Development", level: 95 },
        { name: "Cloud Architecture (AWS, Azure, GCP)", level: 90 },
        { name: "DevOps & CI/CD", level: 88 },
        { name: "Microservices Architecture", level: 92 },
        { name: "Database Design & Optimization", level: 87 },
        { name: "API Development & Integration", level: 94 },
        { name: "Security Best Practices", level: 85 },
        { name: "Agile Methodologies", level: 91 },
        { name: "Team Leadership", level: 89 },
        { name: "Technical Documentation", level: 86 }
    ],

    trainingTopics: [
        { name: "Modern JavaScript & TypeScript", popularity: 98, icon: IconCode },
        { name: "React & Next.js Development", popularity: 95, icon: IconRocket },
        { name: "Node.js & Express", popularity: 87, icon: IconTool },
        { name: "Database Technologies", popularity: 82, icon: IconBuilding },
        { name: "Cloud Computing Fundamentals", popularity: 91, icon: IconMap },
        { name: "Container Technologies", popularity: 89, icon: IconTarget },
        { name: "Testing Strategies", popularity: 78, icon: IconTarget },
        { name: "Code Quality & Best Practices", popularity: 85, icon: IconStar }
    ],

    stats: [
        { number: "500+", label: "Projects Delivered", icon: IconRocket },
        { number: "98%", label: "Client Satisfaction", icon: IconStar },
        { number: "50+", label: "Expert Consultants", icon: IconUsers },
        { number: "10+", label: "Years Experience", icon: IconTarget }
    ],

    contacts: [
        { icon: IconMail, label: "Email", value: "support@whatsnxt.in" },
        { icon: IconPhone, label: "Phone", value: "+91 6300711966" },
        { icon: IconCalendar, label: "Schedule", value: "Free 60-minute consultation" }
    ]
};