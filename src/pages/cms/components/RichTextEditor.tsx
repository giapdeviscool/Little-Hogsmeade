import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'image'],
  ['clean'],
]

export function RichTextEditor({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="cms-rich-editor flex flex-col gap-2">
      <span className="text-sm font-semibold text-coffee">{label}</span>
      <div className="overflow-hidden rounded-[14px] border border-line">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={{ toolbar: TOOLBAR_OPTIONS }}
          placeholder="Nhập nội dung..."
        />
      </div>
    </div>
  )
}
