import React from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for merging classes

interface RichTextRendererProps {
    content: string;
    className?: string;
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
    if (!content) return null;

    // Helper to process content that might be escaped or quoted
    let processedContent = content;

    // Remove surrounding quotes if they exist (common artifact from some DBs/APIs)
    if (processedContent.startsWith('"') && processedContent.endsWith('"')) {
        processedContent = processedContent.slice(1, -1);
    }

    // Simple unescape for common entities if the content appears to be escaped HTML
    // e.g. "&lt;h1&gt;" instead of "<h1>"
    if (!processedContent.includes('<') && processedContent.includes('&lt;')) {
        processedContent = processedContent
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&');
    }

    return (
        <div
            className={cn(
                'prose prose-slate max-w-none',
                // Customize specific elements if needed
                'prose-headings:font-semibold prose-headings:text-slate-900',
                'prose-p:text-slate-600 prose-p:leading-relaxed',
                'prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline',
                'prose-strong:text-slate-900 prose-strong:font-semibold',
                'prose-ul:list-disc prose-ul:pl-6',
                'prose-ol:list-decimal prose-ol:pl-6',
                'prose-li:marker:text-slate-400',
                'prose-img:rounded-xl prose-img:shadow-md',
                'prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-medium prose-code:before:content-none prose-code:after:content-none',
                className
            )}
            dangerouslySetInnerHTML={{ __html: processedContent }}
        />
    );
}
