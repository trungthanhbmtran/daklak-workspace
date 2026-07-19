/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef } from 'react';
import { useHrmEmployeesSearch } from '../hooks/useHrmEmployees';
import { Text } from "@/components/ui/typography";

interface MentionInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: any) => void;
  onSend?: () => void;
}

export function MentionInput({ value, onChange, onSend, ...props }: MentionInputProps) {
  const [mentionQuery, setMentionQuery] = useState<{ keyword: string; startIndex: number } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch employees when mentionQuery is active
  const { data: searchResults, isLoading } = useHrmEmployeesSearch(mentionQuery?.keyword || '', {
    enabled: !!mentionQuery,
    minChars: 1, // trigger immediately after @
  });
  const employees = searchResults || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    const val = e.target.value;
    const cursor = e.target.selectionStart || 0;

    // Check if the word before the cursor starts with '@'
    const textBeforeCursor = val.slice(0, cursor);
    const words = textBeforeCursor.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      const keyword = lastWord.slice(1);
      const startIndex = cursor - lastWord.length;
      setMentionQuery({ keyword, startIndex });
      setSelectedIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectMention = (employeeCode: string, fullName: string) => {
    if (!mentionQuery) return;
    const val = value;
    const mentionText = `@[${fullName}](${employeeCode}) `;
    
    // Replace the `@...` with `@[FullName](employeeCode) `
    const before = val.slice(0, mentionQuery.startIndex);
    // Find the end of the word
    const textAfterCursor = val.slice(mentionQuery.startIndex);
    const endOfWordIndex = textAfterCursor.search(/\s/);
    const after = endOfWordIndex !== -1 ? textAfterCursor.slice(endOfWordIndex) : '';

    const newValue = before + mentionText + after;
    
    // Create a synthetic event
    const event = {
      target: { value: newValue }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(event);
    setMentionQuery(null);

    // Set cursor focus back
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = before.length + mentionText.length;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mentionQuery && employees.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < employees.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = employees[selectedIndex];
        if (selected) {
          handleSelectMention(selected.employeeCode, selected.fullName || selected.lastname);
        }
      } else if (e.key === 'Escape') {
        setMentionQuery(null);
      }
    } else if (e.key === 'Enter' && onSend && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSend();
    } else if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  return (
    <div className="relative flex-1 flex">
      {mentionQuery && (
        <div className="absolute bottom-full left-0 mb-2 w-64 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 p-1">
          {isLoading && <Text variant="small" className="p-3 text-slate-500 text-center font-normal">Đang tìm...</Text>}
          {!isLoading && employees.length === 0 && (
            <Text variant="small" className="p-3 text-slate-500 text-center font-normal">Không tìm thấy</Text>
          )}
          {!isLoading && employees.map((emp: any, idx: number) => (
            <div
              key={emp.id}
              onClick={() => handleSelectMention(emp.employeeCode, emp.fullName || emp.lastname)}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${idx === selectedIndex ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200'}`}
            >
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                {(emp.fullName || emp.lastname || '?').charAt(0)}
              </div>
              <div className="min-w-0">
                <Text variant="small" weight="bold" className="truncate">{emp.fullName}</Text>
                <Text variant="small" className="text-[10px] opacity-70 truncate font-normal">{emp.jobTitle?.name || emp.department?.name}</Text>
              </div>
            </div>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
        className={`flex-1 bg-transparent border-none text-[13.5px] focus:ring-0 outline-none disabled:opacity-40 text-slate-800 dark:text-white ${props.className || ''}`}
      />
    </div>
  );
}
