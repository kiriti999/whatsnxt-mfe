import Nodepub3 from "nodepub3";
import fs from "fs-extra";
import path from "path";
import PDFDocument from "pdfkit";
import axios from "axios";
import PptxGenJS from "pptxgenjs";

import CartModel from "../models/cart";

// Function to format content and preserve code snippets
function formatContentForEbook(content) {
  // Create an array to store processed sections
  let sections = [];
  let lastIndex = 0;

  // Find all code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      if (textBefore.trim()) {
        // Convert line breaks to proper XHTML format
        const formattedText = textBefore
          .replace(/\n\n+/g, "</p><p>") // Double line breaks become new paragraphs
          .replace(/\n/g, "<br />"); // Single line breaks become br tags
        sections.push(`<p>${formattedText}</p>`);
      }
    }

    // Add the code block
    const language = match[1] || "";
    const code = match[2];

    // Preserve whitespace in code
    const preservedCode = code.replace(/ /g, "\u00A0");
    sections.push(`<pre><code>${preservedCode}</code></pre>`);

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last code block
  if (lastIndex < content.length) {
    const remainingText = content.slice(lastIndex);
    if (remainingText.trim()) {
      const formattedText = remainingText
        .replace(/\n\n+/g, "</p><p>")
        .replace(/\n/g, "<br />");
      sections.push(`<p>${formattedText}</p>`);
    }
  }

  // If no sections were created, wrap the entire content
  if (sections.length === 0) {
    const formattedContent = content
      .replace(/\n\n+/g, "</p><p>")
      .replace(/\n/g, "<br />");
    sections.push(`<p>${formattedContent}</p>`);
  }

  // Join all sections
  let result = sections.join("");

  // Clean up any empty paragraphs or invalid nesting
  result = result
    .replace(/<p>\s*<\/p>/g, "") // Remove empty paragraphs
    .replace(/<p>\s*<pre>/g, "<pre>") // Remove p tags around pre
    .replace(/<\/pre>\s*<\/p>/g, "</pre>") // Remove closing p after pre
    .replace(/<p>\s*<br \/>\s*<\/p>/g, "") // Remove paragraphs with only br
    .replace(/<br \/>\s*<\/p>/g, "</p>") // Remove br at end of paragraphs
    .replace(/<p>\s*<br \/>/g, "<p>"); // Remove br at start of paragraphs

  return result;
}

// Function to generate an EPUB
async function generateEbookFromTutorial(tutorialData) {
  const outputPath = path.join(
    __dirname,
    "output",
    `${tutorialData.title.replace(/\s+/g, "_")}.epub`,
  );

  // Ensure the output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    await fs.mkdirp(outputDir);
  }

  // Download the cover image if it's a URL
  const coverImagePath = path.join(outputDir, "cover.jpg");
  if (tutorialData.imageUrl.startsWith("http")) {
    const writer = fs.createWriteStream(coverImagePath);
    const response = await axios({
      url: tutorialData.imageUrl,
      method: "GET",
      responseType: "stream",
    });
    response.data.pipe(writer);
    await new Promise<void>((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } else {
    fs.copyFileSync(tutorialData.imageUrl, coverImagePath);
  }

  // Define book metadata
  const metadata = {
    id: "123456",
    title: tutorialData.title,
    description: tutorialData.description,
    cover: { name: "cover.jpg", data: fs.readFileSync(coverImagePath) },
    publisher: "Whatsnxt Blog",
    language: "en",
    creator: {
      value: "Whatsnxt Blog Author",
      meta: { "file-as": "Whatsnxt Author" },
    },
    subject: [tutorialData.categoryName, tutorialData.subCategory],
    source: "https://whatsnxt.in",
  };

  // Create the EPUB book
  const book = new Nodepub3(metadata);

  // Add CSS for code formatting
  book.addStyle(`
        pre {
            font-family: monospace;
            white-space: pre;
            background-color: #f5f5f5;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            overflow-x: auto;
            display: block;
        }
        code {
            font-family: monospace;
            white-space: pre;
        }
        p {
            margin: 1em 0;
        }
    `);

  // Add chapters dynamically with formatted content
  tutorialData.tutorials.forEach((tutorial, index) => {
    const chapterTitle = tutorial.title || `Chapter ${index + 1}`;

    // Ensure content is properly formatted
    let chapterContent = tutorial.description || "";

    // If content is empty, provide a default
    if (!chapterContent.trim()) {
      chapterContent = "<p>No content available for this chapter.</p>";
    } else {
      // Format the content with proper XHTML structure
      chapterContent = formatContentForEbook(chapterContent);
    }

    // Pass false as the third parameter to prevent HTML escaping
    book.addChapter(chapterTitle, chapterContent, false);
  });

  try {
    // Generate the EPUB file
    await book.create(outputPath);
    console.log(`✅ eBook generated successfully at: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("❌ Failed to generate eBook:", error.message);
    throw error;
  }
}

// Function to generate a PDF from tutorial data
async function generatePdfFromTutorial(tutorialData) {
  const outputPath = path.join(
    __dirname,
    "output",
    `${tutorialData.title.replace(/\s+/g, "_")}.pdf`,
  );

  // Ensure the output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    await fs.mkdirp(outputDir);
  }

  // Create a new PDF document
  const doc = new PDFDocument({
    size: "A4",
    margins: {
      top: 50,
      bottom: 50,
      left: 72,
      right: 72,
    },
    bufferPages: true,
  });

  // Pipe the PDF to a file
  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Add title page
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .text(tutorialData.title, { align: "center" });

  doc.moveDown(2);

  doc
    .fontSize(14)
    .font("Helvetica")
    .text(tutorialData.description, { align: "center" });

  doc.moveDown(2);

  doc
    .fontSize(12)
    .text(`Category: ${tutorialData.categoryName}`, { align: "center" });
  doc.text(`Subcategory: ${tutorialData.subCategory}`, { align: "center" });

  // Add cover image if available
  if (tutorialData.imageUrl) {
    try {
      if (tutorialData.imageUrl.startsWith("http")) {
        const response = await axios.get(tutorialData.imageUrl, {
          responseType: "arraybuffer",
        });
        const imageBuffer = Buffer.from(response.data);
        doc.moveDown(2);
        doc.image(imageBuffer, {
          fit: [400, 300],
          align: "center",
        });
      } else if (fs.existsSync(tutorialData.imageUrl)) {
        doc.moveDown(2);
        doc.image(tutorialData.imageUrl, {
          fit: [400, 300],
          align: "center",
        });
      }
    } catch (error) {
      console.warn("Failed to add cover image:", error.message);
    }
  }

  // Add new page for content
  doc.addPage();

  // Add chapters
  tutorialData.tutorials.forEach((tutorial, index) => {
    // Chapter title
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(tutorial.title || `Chapter ${index + 1}`, {
        align: "left",
        continued: false,
      });

    doc.moveDown();

    // Process content
    if (tutorial.description) {
      formatContentForPdf(doc, tutorial.description);
    } else {
      doc
        .fontSize(12)
        .font("Helvetica")
        .text("No content available for this chapter.");
    }

    // Add page break between chapters (except for the last one)
    if (index < tutorialData.tutorials.length - 1) {
      doc.addPage();
    }
  });

  // Finalize the PDF
  doc.end();

  // Wait for the write stream to finish
  await new Promise<void>((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  console.log(`✅ PDF generated successfully at: ${outputPath}`);
  return outputPath;
}

// Function to clean HTML tags from text
function stripHtmlTags(text) {
  // Remove HTML tags but preserve content
  return text
    .replace(/<p>/g, "\n")
    .replace(/<\/p>/g, "\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<code>/g, "")
    .replace(/<\/code>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

// Function to format content for PDF with proper handling of HTML-like content
function formatContentForPdf(doc, content) {
  // First, clean the content from HTML tags
  const cleanContent = stripHtmlTags(content);

  // Now process for code blocks and regular text
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  // Process content with code blocks
  while ((match = codeBlockRegex.exec(cleanContent)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      const textBefore = cleanContent.slice(lastIndex, match.index);
      if (textBefore.trim()) {
        const lines = textBefore.trim().split("\n");
        lines.forEach((line) => {
          if (line.trim()) {
            doc.fontSize(12).font("Helvetica").text(line, {
              align: "left",
              lineGap: 5,
            });
          } else {
            doc.moveDown(0.5);
          }
        });
        doc.moveDown(0.5);
      }
    }

    // Add the code block
    const language = match[1] || "";
    const code = match[2];

    // Draw code block background
    const startY = doc.y;
    const codeLines = code.split("\n");
    const lineHeight = 14;
    const blockHeight = codeLines.length * lineHeight + 20;

    doc
      .rect(
        doc.x - 10,
        startY - 10,
        doc.page.width - doc.page.margins.left - doc.page.margins.right + 20,
        blockHeight,
      )
      .fill("#f5f5f5");

    // Add code text
    doc.fillColor("black").fontSize(10).font("Courier");

    codeLines.forEach((line, i) => {
      doc.text(line || " ", doc.x, startY + i * lineHeight, {
        align: "left",
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
      });
    });

    doc.moveDown(2);
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last code block
  if (lastIndex < cleanContent.length) {
    const remainingText = cleanContent.slice(lastIndex);
    if (remainingText.trim()) {
      const lines = remainingText.trim().split("\n");
      lines.forEach((line) => {
        if (line.trim()) {
          doc.fontSize(12).font("Helvetica").text(line, {
            align: "left",
            lineGap: 5,
          });
        } else {
          doc.moveDown(0.5);
        }
      });
    }
  }

  // If no code blocks, process the entire content
  if (lastIndex === 0) {
    const lines = cleanContent.split("\n");
    lines.forEach((line) => {
      if (line.trim()) {
        doc.fontSize(12).font("Helvetica").text(line, {
          align: "left",
          lineGap: 5,
        });
      } else {
        doc.moveDown(0.5);
      }
    });
  }
}

// Function to generate a PPT from tutorial data
async function generatePptFromTutorial(tutorialData) {
  const pptx = new PptxGenJS();

  // Set document properties
  pptx.title = tutorialData.title;
  pptx.subject = tutorialData.description;
  pptx.author = "Whatsnxt Blog Author";

  // Create title slide
  const titleSlide = pptx.addSlide();
  titleSlide.addText(tutorialData.title, {
    x: 0.5,
    y: 2,
    w: 9,
    h: 2,
    fontSize: 32,
    color: "363636",
    bold: true,
    align: "center",
  });

  if (tutorialData.description) {
    titleSlide.addText(tutorialData.description, {
      x: 0.5,
      y: 4,
      w: 9,
      h: 1.5,
      fontSize: 16,
      color: "666666",
      align: "center",
    });
  }

  // Process each tutorial
  if (tutorialData.tutorials && tutorialData.tutorials.length > 0) {
    for (const tutorial of tutorialData.tutorials) {
      if (!tutorial.description) continue;

      console.log(`Processing tutorial: ${tutorial.title}`);

      // Create tutorial title slide
      const tutorialTitleSlide = pptx.addSlide();
      tutorialTitleSlide.addText(tutorial.title || "Untitled Section", {
        x: 0.5,
        y: 3,
        w: 9,
        h: 2,
        fontSize: 28,
        color: "363636",
        bold: true,
        align: "center",
      });

      // Process content - split by images first
      const imageRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;
      const parts = [];
      let lastIndex = 0;
      let imgMatch;

      while ((imgMatch = imageRegex.exec(tutorial.description)) !== null) {
        // Add text before image
        if (imgMatch.index > lastIndex) {
          const textBefore = tutorial.description.slice(
            lastIndex,
            imgMatch.index,
          );
          const cleanText = stripHtmlTags(textBefore).trim();
          if (cleanText) {
            parts.push({ type: "text", content: cleanText });
          }
        }

        // Add image
        parts.push({ type: "image", content: imgMatch[1] });
        lastIndex = imgMatch.index + imgMatch[0].length;
      }

      // Add remaining text
      if (lastIndex < tutorial.description.length) {
        const remainingText = tutorial.description.slice(lastIndex);
        const cleanText = stripHtmlTags(remainingText).trim();
        if (cleanText) {
          parts.push({ type: "text", content: cleanText });
        }
      }

      // If no images, just add all text
      if (parts.length === 0) {
        const cleanText = stripHtmlTags(tutorial.description).trim();
        if (cleanText) {
          parts.push({ type: "text", content: cleanText });
        }
      }

      // Process each part
      for (const part of parts) {
        if (part.type === "text") {
          // Split long text into chunks
          const sentences = part.content
            .split(/[.!?]+/)
            .filter((s) => s.trim());
          const sentencesPerSlide = 8; // Reasonable number of sentences per slide

          for (let i = 0; i < sentences.length; i += sentencesPerSlide) {
            const slideSentences = sentences.slice(i, i + sentencesPerSlide);
            const slideText =
              slideSentences.join(". ").trim() +
              (slideSentences.length > 0 ? "." : "");

            if (slideText.trim()) {
              const textSlide = pptx.addSlide();
              textSlide.addText(slideText, {
                x: 0.8,
                y: 1,
                w: 8.4,
                h: 6,
                fontSize: 14,
                color: "333333",
                align: "left",
                valign: "top",
              });
            }
          }
        } else if (part.type === "image") {
          // Create image slide
          try {
            const imageSlide = pptx.addSlide();

            let imageUrl = part.content
              .trim()
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"')
              .replace(/&#039;/g, "'");

            if (imageUrl.startsWith("http")) {
              const response = await axios.get(imageUrl, {
                responseType: "arraybuffer",
                timeout: 20000,
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                  Accept: "image/*",
                  Referer: "https://www.whatsnxt.in/",
                },
              });

              if (response.status === 200 && response.data.byteLength > 0) {
                const imageBuffer = Buffer.from(response.data);
                const mimeType =
                  response.headers["content-type"] || "image/png";
                const base64String = imageBuffer.toString("base64");
                const dataUri = `data:${mimeType};base64,${base64String}`;

                // Add image with proper margins
                imageSlide.addImage({
                  data: dataUri,
                  x: 1,
                  y: 1,
                  w: 8,
                  h: 5.5,
                });

                console.log("Image added successfully");
              }
            }
          } catch (error) {
            console.error("Failed to add image:", error.message);
            // Create error slide
            const errorSlide = pptx.addSlide();
            errorSlide.addText("Image could not be loaded", {
              x: 2,
              y: 3,
              w: 6,
              h: 1,
              fontSize: 16,
              color: "999999",
              align: "center",
            });
          }
        }
      }
    }
  }

  // Create output
  const outputDir = path.join(__dirname, "output");
  if (!fs.existsSync(outputDir)) {
    await fs.mkdirp(outputDir);
  }

  const outputPath = path.join(
    outputDir,
    `${tutorialData.title.replace(/\s+/g, "_")}.pptx`,
  );
  await pptx.writeFile({ fileName: outputPath });

  console.log(`✅ PowerPoint generated: ${outputPath}`);
  return outputPath;
}

// Clean HTML function
function stripHtmlTagsSimple(text) {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const deleteCourseFromCart = async function (courseId) {
  try {
    const course_price_id = `price_${courseId}`;

    await CartModel.updateMany(
      { "cartItems.id": course_price_id },
      {
        $pull: {
          cartItems: {
            id: course_price_id,
          },
        },
      },
    );
  } catch (error) {
    console.log("Error deleting product from cart", error.message);
  }
};

// Export functions
export {
  generateEbookFromTutorial,
  generatePdfFromTutorial,
  formatContentForEbook,
  stripHtmlTags,
  formatContentForPdf,
  generatePptFromTutorial,
  deleteCourseFromCart,
};
