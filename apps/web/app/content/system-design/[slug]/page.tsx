import { fetchSystemDesignBySlug } from "../../../../fetcher/systemDesignServerQuery";
import SystemDesignContent from "./SystemDesignContent";

interface PageProps {
    params: Promise<{ slug: string }>;
}

const SystemDesignPage = async (props: PageProps) => {
    const { slug } = await props.params;
    const course = await fetchSystemDesignBySlug(slug);

    if (!course) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1>Content not found</h1>
                <p>The requested content could not be found.</p>
            </div>
        );
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Course",
                        name: course.title,
                        description: `System Design: ${course.title} - ${course.category}`,
                        provider: {
                            "@type": "Organization",
                            name: "whatsnxt.in",
                            url: "https://www.whatsnxt.in",
                        },
                        datePublished: course.createdAt,
                        dateModified: course.updatedAt,
                    }),
                }}
            />
            <SystemDesignContent course={course} />
        </>
    );
};

export default SystemDesignPage;
