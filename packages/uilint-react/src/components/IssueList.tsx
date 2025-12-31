'use client';

import React from 'react';
import { useUILint } from './UILint';
import type { UILintIssue } from '../types';

export function IssueList() {
  const { issues, highlightedIssue, setHighlightedIssue } = useUILint();

  if (issues.length === 0) {
    return (
      <div
        style={{
          padding: '32px 16px',
          textAlign: 'center',
          color: '#9CA3AF',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>✨</div>
        <div style={{ fontSize: '14px' }}>No issues found</div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          Click "Scan" to analyze the page
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '8px' }}>
      {issues.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          isHighlighted={highlightedIssue?.id === issue.id}
          onHover={() => setHighlightedIssue(issue)}
          onLeave={() => setHighlightedIssue(null)}
        />
      ))}
    </div>
  );
}

interface IssueCardProps {
  issue: UILintIssue;
  isHighlighted: boolean;
  onHover: () => void;
  onLeave: () => void;
}

function IssueCard({ issue, isHighlighted, onHover, onLeave }: IssueCardProps) {
  const typeColors: Record<string, string> = {
    color: '#F59E0B',
    typography: '#8B5CF6',
    spacing: '#10B981',
    component: '#3B82F6',
    responsive: '#EC4899',
    accessibility: '#EF4444',
  };

  const typeColor = typeColors[issue.type] || '#6B7280';

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        padding: '12px',
        marginBottom: '8px',
        backgroundColor: isHighlighted ? '#374151' : '#111827',
        borderRadius: '8px',
        border: isHighlighted ? '1px solid #4B5563' : '1px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {/* Type badge */}
      <div
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: `${typeColor}20`,
          color: typeColor,
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}
      >
        {issue.type}
      </div>

      {/* Message */}
      <div
        style={{
          fontSize: '13px',
          color: '#F3F4F6',
          lineHeight: '1.4',
          marginBottom: '8px',
        }}
      >
        {issue.message}
      </div>

      {/* Values */}
      {(issue.currentValue || issue.expectedValue) && (
        <div
          style={{
            display: 'flex',
            gap: '12px',
            fontSize: '12px',
            color: '#9CA3AF',
          }}
        >
          {issue.currentValue && (
            <div>
              <span style={{ color: '#6B7280' }}>Current: </span>
              <code
                style={{
                  padding: '2px 4px',
                  backgroundColor: '#374151',
                  borderRadius: '3px',
                  fontSize: '11px',
                }}
              >
                {issue.currentValue}
              </code>
            </div>
          )}
          {issue.expectedValue && (
            <div>
              <span style={{ color: '#6B7280' }}>Expected: </span>
              <code
                style={{
                  padding: '2px 4px',
                  backgroundColor: '#374151',
                  borderRadius: '3px',
                  fontSize: '11px',
                }}
              >
                {issue.expectedValue}
              </code>
            </div>
          )}
        </div>
      )}

      {/* Suggestion */}
      {issue.suggestion && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#1E3A5F',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#93C5FD',
          }}
        >
          💡 {issue.suggestion}
        </div>
      )}
    </div>
  );
}

