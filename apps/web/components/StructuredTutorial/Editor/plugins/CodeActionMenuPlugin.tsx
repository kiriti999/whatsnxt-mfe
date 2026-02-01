import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getNodeByKey,
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_CRITICAL,
    KEY_ARROW_DOWN_COMMAND,
    KEY_ARROW_UP_COMMAND,
    KEY_ESCAPE_COMMAND,
    KEY_TAB_COMMAND,
    LexicalEditor,
    NodeKey,
} from 'lexical';
import { $isCodeNode, CodeNode, getLanguageFriendlyName, normalizeCodeLang } from '@lexical/code';
import { Menu, Button } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

const CODE_LANGUAGE_FRIENDLY_NAME_MAP = {
    c: 'C',
    clike: 'C-like',
    cpp: 'C++',
    css: 'CSS',
    html: 'HTML',
    java: 'Java',
    javascript: 'JavaScript',
    js: 'JavaScript',
    markdown: 'Markdown',
    objc: 'Objective-C',
    php: 'PHP',
    plaintext: 'Plain Text',
    python: 'Python',
    rust: 'Rust',
    sql: 'SQL',
    swift: 'Swift',
    typescript: 'TypeScript',
    ts: 'TypeScript',
    xml: 'XML',
    json: 'JSON',
    bash: 'Bash',
    shell: 'Shell',
    yaml: 'YAML',
    go: 'Go',
    kotlin: 'Kotlin',
    ruby: 'Ruby',
};

const CODE_LANGUAGE_MAP = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    csharp: 'C#',
    php: 'PHP',
    ruby: 'Ruby',
    go: 'Go',
    rust: 'Rust',
    swift: 'Swift',
    kotlin: 'Kotlin',
    sql: 'SQL',
    html: 'HTML',
    css: 'CSS',
    xml: 'XML',
    json: 'JSON',
    yaml: 'YAML',
    markdown: 'Markdown',
    bash: 'Bash',
    shell: 'Shell',
    plaintext: 'Plain Text',
};

function getCodeLanguageOptions(): [string, string][] {
    const options: [string, string][] = [];

    for (const [lang, friendlyName] of Object.entries(CODE_LANGUAGE_MAP)) {
        options.push([lang, friendlyName]);
    }

    return options;
}

interface CodeActionMenuPluginProps {
    anchorElem?: HTMLElement;
}

function CodeActionMenuContainer({
    anchorElem = document.body,
}: {
    anchorElem?: HTMLElement;
}): React.JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [lang, setLang] = useState('');
    const [isShown, setIsShown] = useState<boolean>(false);
    const [shouldListenMouseMove, setShouldListenMouseMove] = useState<boolean>(false);
    const [position, setPosition] = useState<{ top: string; right: string }>({
        top: '0',
        right: '0',
    });
    const codeSetRef = useRef<Set<string>>(new Set());
    const codeDOMNodeRef = useRef<HTMLElement | null>(null);

    const getCodeDOMNode = useCallback((): HTMLElement | null => {
        return codeDOMNodeRef.current;
    }, []);

    const updateCodeGutterPosition = useCallback(() => {
        const codeDOM = getCodeDOMNode();

        if (!codeDOM) {
            return;
        }

        const { right, top } = codeDOM.getBoundingClientRect();
        setPosition({
            right: `${window.innerWidth - right + 5}px`,
            top: `${top}px`,
        });
    }, [getCodeDOMNode]);

    useEffect(() => {
        const codeDOM = getCodeDOMNode();

        if (codeDOM) {
            updateCodeGutterPosition();
        }
    }, [getCodeDOMNode, updateCodeGutterPosition]);

    useEffect(() => {
        return editor.registerMutationListener(
            CodeNode,
            (mutations) => {
                editor.getEditorState().read(() => {
                    for (const [key, type] of mutations) {
                        if (type === 'destroyed') {
                            codeSetRef.current.delete(key);
                        } else {
                            codeSetRef.current.add(key);
                        }
                    }
                });
            },
            { skipInitialization: false }
        );
    }, [editor]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const codeDOM = target.closest<HTMLElement>('code.lexical-code-block');

            if (codeDOM) {
                codeDOMNodeRef.current = codeDOM;
                let lang = codeDOM.getAttribute('data-language') || '';
                lang = normalizeCodeLang(lang);
                setLang(lang);
                setIsShown(true);
                updateCodeGutterPosition();
            } else if (codeDOMNodeRef.current) {
                codeDOMNodeRef.current = null;
                setIsShown(false);
            }
        };

        if (shouldListenMouseMove) {
            document.addEventListener('mousemove', handleMouseMove);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
            };
        }

        return () => {
            setIsShown(false);
        };
    }, [shouldListenMouseMove, updateCodeGutterPosition]);

    useEffect(() => {
        return editor.registerUpdateListener(() => {
            editor.getEditorState().read(() => {
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    const anchorNode = selection.anchor.getNode();
                    const element =
                        anchorNode.getKey() === 'root'
                            ? anchorNode
                            : anchorNode.getTopLevelElementOrThrow();

                    if ($isCodeNode(element)) {
                        const lang = element.getLanguage() || '';
                        setLang(normalizeCodeLang(lang));
                        setShouldListenMouseMove(false);
                        return;
                    }
                }
                setShouldListenMouseMove(true);
            });
        });
    }, [editor]);

    const handleLanguageChange = (language: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const anchorNode = selection.anchor.getNode();
                const element =
                    anchorNode.getKey() === 'root'
                        ? anchorNode
                        : anchorNode.getTopLevelElementOrThrow();

                if ($isCodeNode(element)) {
                    element.setLanguage(language);
                }
            }
        });
    };

    const OPTIONS = getCodeLanguageOptions();

    return (
        <>
            {isShown && (
                <div
                    style={{
                        position: 'fixed',
                        ...position,
                        zIndex: 10,
                    }}
                >
                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <Button
                                variant="subtle"
                                size="xs"
                                rightSection={<IconChevronDown size={14} />}
                                style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    color: 'white',
                                    fontSize: '11px',
                                    padding: '4px 8px',
                                }}
                            >
                                {CODE_LANGUAGE_MAP[lang] || 'Select Language'}
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {OPTIONS.map(([value, label]) => (
                                <Menu.Item
                                    key={value}
                                    onClick={() => handleLanguageChange(value)}
                                    style={{
                                        backgroundColor: value === lang ? '#e3f2fd' : 'transparent',
                                    }}
                                >
                                    {label}
                                </Menu.Item>
                            ))}
                        </Menu.Dropdown>
                    </Menu>
                </div>
            )}
        </>
    );
}

export function CodeActionMenuPlugin({
    anchorElem = document.body,
}: CodeActionMenuPluginProps): React.JSX.Element | null {
    return <CodeActionMenuContainer anchorElem={anchorElem} />;
}
