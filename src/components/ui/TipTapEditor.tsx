import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onChange,
  placeholder = "Start writing...",
  className = "",
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      Highlight,
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-400 hover:text-blue-300 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-gray-900 rounded-lg p-4 my-4",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full my-4",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border-b border-gray-700",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class:
            "border border-gray-700 px-4 py-2 text-left font-bold bg-gray-800",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-700 px-4 py-2",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3 ${className}`,
        placeholder,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Fix: Use proper options object instead of false
      editor.commands.setContent(content, {
        emitUpdate: false,
        errorOnInvalidContent: false,
      });
    }
  }, [content, editor]);

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addTable = () => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-700 rounded-lg bg-background2 overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-700 p-2 flex flex-wrap gap-1 bg-background">
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            editor.isActive("bold") ? "bg-gray-600 text-white" : "text-grayText"
          }`}
          title="Bold"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 4a1 1 0 00-1 1v10a1 1 0 001 1h4.5a3.5 3.5 0 001.852-6.47A3.5 3.5 0 009.5 4H5zm4.5 5a1.5 1.5 0 100-3H6v3h3.5zm0 2H6v3h3.5a1.5 1.5 0 000-3z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            editor.isActive("italic")
              ? "bg-gray-600 text-white"
              : "text-grayText"
          }`}
          title="Italic"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8 1a1 1 0 00-1 1v1H6a1 1 0 000 2h1v10H6a1 1 0 100 2h1v1a1 1 0 001 1h4a1 1 0 001-1v-1h1a1 1 0 100-2h-1V5h1a1 1 0 100-2h-1V2a1 1 0 00-1-1H8zm1 4v10h2V5H9z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            editor.isActive("strike")
              ? "bg-gray-600 text-white"
              : "text-grayText"
          }`}
          title="Strikethrough"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
            <path d="M6 7.5A1.5 1.5 0 017.5 6h5A1.5 1.5 0 0114 7.5v1h-2v-1a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v1H6v-1zM6 12.5v1a.5.5 0 00.5.5h7a.5.5 0 00.5-.5v-1h2v1a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 016 13.5v-1h2z" />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            editor.isActive("code") ? "bg-gray-600 text-white" : "text-grayText"
          }`}
          title="Code"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            editor.isActive("highlight")
              ? "bg-gray-600 text-white"
              : "text-grayText"
          }`}
          title="Highlight"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H16a1 1 0 110 2h-1.85l-1 4H15a1 1 0 110 2h-2.15l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H4a1 1 0 110-2h1.85l1-4H5a1 1 0 110-2h2.15l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.94l1-4H9.03z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Headings */}
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`px-3 py-2 rounded hover:bg-gray-700 transition-colors text-sm font-medium ${
            editor.isActive("heading", { level: 1 })
              ? "bg-gray-600 text-white"
              : "text-grayText"
          }`}
          title="Heading 1"
        >
          H1
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-3 py-2 rounded hover:bg-gray-700 transition-colors text-sm font-medium ${
            editor.isActive("heading", { level: 2 })
              ? "bg-gray-600 text-white"
              : "text-grayText"
          }`}
          title="Heading 2"
        >
          H2
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`px-3 py-2 rounded hover:bg-gray-700 transition-colors text-sm font-medium ${
            editor.isActive("heading", { level: 3 })
              ? "bg-gray-600 text-white"
              : "text-grayText"
          }`}
          title="Heading 3"
        >
          H3
        </button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            editor.isActive("bulletList")
              ? "bg-gray-600 text-white"
              : "text-grayText"
          }`}
          title="Bullet List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            editor.isActive("orderedList")
              ? "bg-gray-600 text-white"
              : "text-grayText"
          }`}
          title="Numbered List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 000 2h.01a1 1 0 100-2H3zM6 4a1 1 0 000 2h11a1 1 0 100-2H6zM3 8a1 1 0 000 2h.01a1 1 0 100-2H3zM6 8a1 1 0 000 2h11a1 1 0 100-2H6zM3 12a1 1 0 000 2h.01a1 1 0 100-2H3zM6 12a1 1 0 000 2h11a1 1 0 100-2H6zM3 16a1 1 0 000 2h.01a1 1 0 100-2H3zM6 16a1 1 0 000 2h11a1 1 0 100-2H6z" />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Block Elements */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            editor.isActive("blockquote")
              ? "bg-gray-600 text-white"
              : "text-grayText"
          }`}
          title="Quote"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            editor.isActive("codeBlock")
              ? "bg-gray-600 text-white"
              : "text-grayText"
          }`}
          title="Code Block"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-gray-700 transition-colors text-grayText"
          title="Horizontal Rule"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Media & Links */}
        <button
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            editor.isActive("link") ? "bg-gray-600 text-white" : "text-grayText"
          }`}
          title="Link"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-700 transition-colors text-grayText"
          title="Image"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          onClick={addTable}
          className="p-2 rounded hover:bg-gray-700 transition-colors text-grayText"
          title="Table"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 4a1 1 0 00-1 1v4a1 1 0 001 1h1V6h8v4h1a1 1 0 001-1V5a1 1 0 00-1-1H5zM4 11a1 1 0 011-1h1v4a1 1 0 001 1h6a1 1 0 001-1v-4h1a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Actions */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-700 transition-colors text-grayText disabled:opacity-30"
          title="Undo"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 110 14H9a1 1 0 110-2h2a5 5 0 100-10H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-700 transition-colors text-grayText disabled:opacity-30"
          title="Redo"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a5 5 0 100 10h2a1 1 0 110 2H9A7 7 0 119 7h5.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="prose-editor min-h-[400px] text-whiteText"
      />

      {/* Fix: Use regular style tag instead of jsx styled-jsx */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .prose-editor .ProseMirror {
            outline: none;
            padding: 1rem;
            color: #f1f5f9;
            background-color: transparent;
          }

          .prose-editor .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #64748b;
            pointer-events: none;
            height: 0;
          }

          .prose-editor .ProseMirror h1 {
            font-size: 2rem;
            font-weight: bold;
            margin: 1.5rem 0 1rem 0;
            color: #f1f5f9;
          }

          .prose-editor .ProseMirror h2 {
            font-size: 1.5rem;
            font-weight: bold;
            margin: 1.25rem 0 0.75rem 0;
            color: #f1f5f9;
          }

          .prose-editor .ProseMirror h3 {
            font-size: 1.25rem;
            font-weight: bold;
            margin: 1rem 0 0.5rem 0;
            color: #f1f5f9;
          }

          .prose-editor .ProseMirror p {
            margin: 0.75rem 0;
            line-height: 1.6;
          }

          .prose-editor .ProseMirror ul,
          .prose-editor .ProseMirror ol {
            margin: 0.75rem 0;
            padding-left: 1.5rem;
          }

          .prose-editor .ProseMirror li {
            margin: 0.25rem 0;
          }

          .prose-editor .ProseMirror blockquote {
            border-left: 4px solid #3b82f6;
            padding-left: 1rem;
            margin: 1rem 0;
            font-style: italic;
            color: #cbd5e1;
          }

          .prose-editor .ProseMirror pre {
            background: #111827;
            border: 1px solid #374151;
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 1rem 0;
            overflow-x: auto;
          }

          .prose-editor .ProseMirror code {
            background: #374151;
            color: #f1f5f9;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
          }

          .prose-editor .ProseMirror mark {
            background: #fbbf24;
            color: #111827;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
          }

          .prose-editor .ProseMirror hr {
            border: none;
            border-top: 2px solid #374151;
            margin: 2rem 0;
          }

          .prose-editor .ProseMirror table {
            border-collapse: collapse;
            margin: 1rem 0;
            width: 100%;
          }

          .prose-editor .ProseMirror table td,
          .prose-editor .ProseMirror table th {
            border: 1px solid #374151;
            padding: 0.5rem;
            text-align: left;
          }

          .prose-editor .ProseMirror table th {
            background-color: #374151;
            font-weight: bold;
          }

          .prose-editor .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
            margin: 1rem 0;
          }
        `,
        }}
      />
    </div>
  );
};

export default TipTapEditor;
