import React from 'react';
import htmlReactParser, { HTMLReactParserOptions, Element, Text } from 'html-react-parser';

interface HtmlParserProps {
    content: string;
    withOptions?: boolean;
}

// Custom option to show file previews for PDF, PPT, DOC, etc.
const parseOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
        if ((domNode as Element).attribs && (domNode as Element).attribs['data-type'] === 'file') {
            const fileDiv = (domNode as Element).children.find(child => (child as Element).name === 'a') as Element | undefined;
            if (fileDiv && fileDiv.attribs) {
                const href = fileDiv.attribs.href;
                const nameNode = fileDiv.children[0] as Text;

                return (
                    <div className="file-wrapper" data-type="file">
                        <a href={href} target="_blank" rel="noopener noreferrer">{nameNode.data}</a>
                    </div>
                );
            }
        }
    },
};

const HtmlParser: React.FC<HtmlParserProps> = ({ content, withOptions = false }) => {
    return content ? <>{withOptions ? htmlReactParser(content, parseOptions) : htmlReactParser(content)}</> : <></>;
};

export default HtmlParser;
