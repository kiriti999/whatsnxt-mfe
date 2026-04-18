// Update the content page to use the new fetcher
import type { Metadata } from "next";
import {
  createExcerpt,
  generateMetadata as generateOGMetadata,
} from "@whatsnxt/core-util/src/GenerateMetaTags";
import { getPostBySlugServer } from "../../../fetcher/serverFetcher";
import ContentWrapper from "./ContentWrapper";

function resolveSlug(idSegments: string | string[]): string {
  if (Array.isArray(idSegments)) {
    return idSegments.length >= 2
      ? `${idSegments[0]}/${idSegments[1]}`
      : idSegments[0];
  }
  return idSegments;
}

export async function generateMetadata(props: {
  params: Promise<{ id: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const lookupSlug = resolveSlug(params.id);
  const slugData = await getPostBySlugServer(lookupSlug);

  if (!slugData) {
    return { title: "Content not found | whatsnxt.in" };
  }

  const canonical = `https://www.whatsnxt.in/content/${params.id.join("/")}`;

  return generateOGMetadata({
    title: `${slugData.title} | whatsnxt.in`,
    description: createExcerpt(slugData.description, 155),
    image: slugData.imageUrl || undefined,
    canonical,
    type: "article",
    publishedDate: slugData.createdAt,
    modifiedDate: slugData.updatedAt,
    section: slugData.categoryName,
    tags: slugData.tags,
  });
}

const ContentPage = async (props: { params: Promise<{ id: string[] }> }) => {
  const params = await props.params;
  const lookupSlug = resolveSlug(params.id);

  // Use REST API instead of GraphQL for SSR
  const slugData = await getPostBySlugServer(lookupSlug);

  if (!slugData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1>Content not found</h1>
        <p>The requested content could not be found.</p>
      </div>
    );
  }

  return (
    <>
      {/* Your existing JSON-LD script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: slugData.title,
            description: createExcerpt(slugData.description, 155),
            image: slugData.imageUrl
              ? {
                "@type": "ImageObject",
                url: slugData.imageUrl,
                width: 1200,
                height: 630,
              }
              : undefined,
            author: {
              "@type": "Organization",
              name: "whatsnxt.in",
              url: "https://www.whatsnxt.in",
            },
            publisher: {
              "@type": "Organization",
              name: "whatsnxt.in",
              logo: {
                "@type": "ImageObject",
                url: "https://www.whatsnxt.in/logo.png",
              },
              sameAs: ["https://www.linkedin.com/company/105606569"],
            },
            datePublished: slugData.createdAt || slugData.updatedAt,
            dateModified: slugData.updatedAt,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://www.whatsnxt.in/content/${params.id}`,
            },
          }),
        }}
      />

      <ContentWrapper details={slugData} />
    </>
  );
};

export default ContentPage;
