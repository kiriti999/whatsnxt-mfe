import { notFound } from "next/navigation";
import AuthorInfo from "../../../components/AuthorInfo";
import Question from "../../../components/Lesson/question";
import { serverFetcher } from "../../../fetcher/serverFetcher";
import { generateMetadata as createMetadata } from '@whatsnxt/core-util';
import { Metadata } from 'next';
import { cache } from 'react';


export const dynamic = 'force-dynamic'

const fetchInterviewData = cache(async (slug: string) => {
    try {
        const BASEURL = process.env.BFF_HOST_API as string;
        return await serverFetcher(BASEURL, `/interview/${slug}`);
    } catch (error) {
        return null;
    }
});

export async function generateMetadata({ params }): Promise<Metadata> {
    try {
        const { slug } = await params;
        const interview = await fetchInterviewData(slug);

        if (!interview) return {};

        return createMetadata({
            title: `${interview.question}` || 'whatsnxt.in`',
            description: interview.answer
                ? `${interview.answer.substring(0, 150)}...`
                : `Expert answer by ${interview.authorInfo.name}`,
            type: 'article',
            siteName: 'whatsnxt.in',
            keywords: ['interview', 'question', 'answer', interview.courseInfo.slug],
            author: interview.authorInfo.name,
            publishedDate: interview.questionUpdated,
            modifiedDate: interview.answerUpdated,
            canonical: `https://whatsnxt.in/interview/${slug}`,
        });
    } catch (error) {
        return {};
    }
}

async function QuestionPage({ params }) {
    const { slug } = await params;

    try {
        const interview = await fetchInterviewData(slug);

        if (!interview) {
            return notFound();
        }
        const { about, designation, experience, name } = interview.authorInfo;
        return (
            <>
                <Question
                    showFullInfo
                    slug={interview.slug}
                    questionUpdated={interview.questionUpdated}
                    question={interview.question}
                    answerUpdated={interview.answerUpdated}
                    answer={interview.answer}
                    courseSlug={interview.courseInfo.slug}
                />
                <AuthorInfo name={name} about={about} designation={designation} experience={experience} />
            </>
        )
    } catch (error) {
        console.error("Error fetching questions:", error);
        return notFound();
    }


}

export default QuestionPage;
