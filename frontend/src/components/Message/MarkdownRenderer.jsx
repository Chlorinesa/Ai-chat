import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button, Tooltip } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';
import styles from './MarkdownRenderer.module.css';

function CopyCodeButton({ code }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const tooltipOverlayStyle = {
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-color)'
    };

    return (
        <Tooltip title={copied ? 'Скопировано!' : 'Копировать код'} color="var(--bg-secondary)" overlayInnerStyle={tooltipOverlayStyle}>
            <Button
                type="text"
                size="small"
                className={styles.copyCodeButton}
                icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
                onClick={handleCopy}
            />
        </Tooltip>
    );
}

export default function MarkdownRenderer({ content }) {
    const { theme } = useTheme();

    const components = {
        table: ({ children, ...props }) => (
            <div className={styles.tableWrapper}>
                <table className={styles.table} {...props}>{children}</table>
            </div>
        ),
        thead: ({ children, ...props }) => <thead className={styles.thead} {...props}>{children}</thead>,
        tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
        tr: ({ children, ...props }) => <tr className={styles.tr} {...props}>{children}</tr>,
        th: ({ children, ...props }) => <th className={styles.th} {...props}>{children}</th>,
        td: ({ children, ...props }) => <td className={styles.td} {...props}>{children}</td>,

        h1: ({ children, ...props }) => <h1 className={styles.h1} {...props}>{children}</h1>,
        h2: ({ children, ...props }) => <h2 className={styles.h2} {...props}>{children}</h2>,
        h3: ({ children, ...props }) => <h3 className={styles.h3} {...props}>{children}</h3>,
        h4: ({ children, ...props }) => <h4 className={styles.h4} {...props}>{children}</h4>,

        p: ({ children, ...props }) => <p className={styles.p} {...props}>{children}</p>,

        ul: ({ children, ...props }) => <ul className={styles.ul} {...props}>{children}</ul>,
        ol: ({ children, ...props }) => <ol className={styles.ol} {...props}>{children}</ol>,
        li: ({ children, ...props }) => <li className={styles.li} {...props}>{children}</li>,

        code: ({ children, className, ...props }) => {
            const isInline = !className;
            const codeString = String(children).replace(/\n$/, '');
            const language = className?.replace('language-', '') || 'text';

            if (isInline) {
                return <code className={styles.inlineCode} {...props}>{children}</code>;
            }

            return (
                <div className={styles.codeBlockWrapper}>
                    <CopyCodeButton code={codeString} />
                    <SyntaxHighlighter
                        language={language}
                        style={theme === 'dark' ? oneDark : oneLight}
                        customStyle={{
                            margin: 0,
                            padding: '12px 14px',
                            borderRadius: '8px',
                            fontSize: '0.85em',
                            lineHeight: 1.5,
                            background: 'var(--bg-secondary)',
                        }}
                        codeTagProps={{
                            style: {
                                fontFamily: "'SF Mono', Monaco, 'Cascadia Code', monospace",
                            }
                        }}
                    >
                        {codeString}
                    </SyntaxHighlighter>
                </div>
            );
        },

        pre: ({ children, ...props }) => <pre className={styles.pre} {...props}>{children}</pre>,

        blockquote: ({ children, ...props }) => (
            <blockquote className={styles.blockquote} {...props}>{children}</blockquote>
        ),

        strong: ({ children, ...props }) => <strong className={styles.strong} {...props}>{children}</strong>,
        em: ({ children, ...props }) => <em className={styles.em} {...props}>{children}</em>,

        hr: ({ ...props }) => <hr className={styles.hr} {...props} />,

        a: ({ href, children, ...props }) => (
            <a 
                href={href} 
                className={styles.link}
                target="_blank" 
                rel="noopener noreferrer"
                {...props}
            >
                {children}
            </a>
        ),
    };

    return (
        <div className={styles.markdownContainer}>
            <Markdown remarkPlugins={[remarkGfm]} components={components}>
                {content}
            </Markdown>
        </div>
    );
}