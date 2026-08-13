import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./RichTextEditor.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const modules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
  ],
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
}) => (
  <ReactQuill
    value={value}
    onChange={onChange}
    modules={modules}
    placeholder={placeholder || "Enter terms and conditions..."}
    theme="snow"
    className="large-editor"
  />
);

export default RichTextEditor; 