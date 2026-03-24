import PracticePageClient from "./PracticePageClient";

interface PageProps {
    params: Promise<{ slug: string }>;
}

const PracticePage = async (props: PageProps) => {
    const { slug } = await props.params;
    return <PracticePageClient slug={slug} />;
};

export default PracticePage;
