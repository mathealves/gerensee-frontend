'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { TiptapDocument } from '@/types';

interface TiptapEditorProps {
  value: TiptapDocument | null;
  onChange?: (value: TiptapDocument) => void;
  editable?: boolean;
  className?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      size="icon"
      className="h-7 w-7"
      title={title}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function TiptapEditor({ value, onChange, editable = true, className }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: (value as object) ?? undefined,
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getJSON() as TiptapDocument);
      }
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  return (
    <div className={cn('rounded-md border bg-background', className)}>
      {editable && editor && (
        <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Ordered List"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>
      )}

      <div
        className={cn('min-h-[120px]', editable && 'cursor-text')}
        onClick={() => editable && editor?.commands.focus()}
      >
        <EditorContent
          editor={editor}
          className={cn(
            'prose prose-sm max-w-none p-4 [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[88px] [&_.ProseMirror]:cursor-text',
            !editable && 'opacity-80 [&_.ProseMirror]:cursor-default',
          )}
        />
      </div>
    </div>
  );
}
