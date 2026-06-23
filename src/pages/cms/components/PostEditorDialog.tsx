import { useRef, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { CmsEditorModal } from '../CmsEditorModal'
import { uploadImage } from '../../../api/cms.api'
import { useLocale } from '../../../hooks/useLocale'
import type { Post, PostPayload } from '../../../types'
import type { NoticeState } from './cms.types'
import { TextField, SelectField, ImageField, ToggleField, InlineNotice } from './CmsSharedUI'
import { RichTextEditor } from './RichTextEditor'

export function PostEditorDialog({
  post,
  onClose,
  onSave,
}: {
  post: Post | null
  onClose: () => void
  onSave: (payload: PostPayload) => Promise<void>
}) {
  const { t } = useLocale()
  const [draft, setDraft] = useState<PostPayload>(
    post
      ? {
        title: post.title,
        slug: post.slug,
        thumbnailUrl: post.thumbnailUrl,
        content: post.content,
        category: post.category,
        tags: post.tags || '',
        isPublished: post.isPublished,
        publishedAt: post.publishedAt ?? null,
      }
      : { title: '', slug: '', thumbnailUrl: '', content: '', category: '', tags: '', isPublished: false, publishedAt: null },
  )
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [unsaved, setUnsaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function updateDraft<K extends keyof PostPayload>(key: K, value: PostPayload[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
    setUnsaved(true)
  }

  async function handleUpload(file: File) {
    setSaving(true)
    setNotice(null)
    try {
      const response = await uploadImage(file, 'posts')
      if (response.data) {
        updateDraft('thumbnailUrl', response.data.secure_url)
      }
      setNotice({ type: 'success', message: t.cms.posts.thumbnailUploadSuccess })
    } catch (uploadError) {
      setNotice({ type: 'error', message: uploadError instanceof Error ? uploadError.message : t.common.uploadError })
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...draft,
        title: draft.title.trim(),
        slug: draft.slug.trim(),
        category: draft.category.trim(),
        tags: draft.tags.trim(),
        content: draft.content.trim(),
      })
      setUnsaved(false)
    } catch (saveError) {
      setNotice({ type: 'error', message: saveError instanceof Error ? saveError.message : t.cms.posts.saveError })
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    if (unsaved && !window.confirm(t.common.unsavedChanges)) return
    onClose()
  }

  return (
    <CmsEditorModal
      open
      title={post ? t.cms.posts.editorTitleEdit : t.cms.posts.editorTitleCreate}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      {notice && <InlineNotice notice={notice} />}
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <TextField label={t.cms.posts.labelTitle} value={draft.title} onChange={(value) => updateDraft('title', value)} required />
        <TextField label={t.cms.posts.labelSlug} value={draft.slug} onChange={(value) => updateDraft('slug', value)} required />
        <SelectField
          label={t.cms.posts.labelCategory}
          value={draft.category}
          onChange={(value) => updateDraft('category', value)}
          options={t.cms.posts.categoryOptions as string[]}
        />
        <TextField
          label={t.cms.posts.labelTags}
          value={draft.tags}
          onChange={(value) => updateDraft('tags', value)}
          placeholder={t.cms.posts.tagsPlaceholder}
        />
        <ImageField label={t.cms.posts.labelThumbnail} value={draft.thumbnailUrl} onChange={(value) => updateDraft('thumbnailUrl', value)} onUpload={handleUpload} fileRef={fileRef} />
        <ToggleField label={t.cms.posts.labelPublished} checked={draft.isPublished} onChange={(checked) => updateDraft('isPublished', checked)} />
        <RichTextEditor label={t.cms.posts.labelContent} value={draft.content} onChange={(value) => updateDraft('content', value)} />
        <TextField
          label={t.cms.posts.labelPublishedAt}
          type="datetime-local"
          value={draft.publishedAt ? draft.publishedAt.slice(0, 16) : ''}
          onChange={(value) => updateDraft('publishedAt', value ? new Date(value).toISOString() : null)}
        />
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" onClick={handleClose} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-coffee">
            {t.common.cancel}
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-70">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {post ? t.common.saveChanges : t.cms.posts.editorTitleCreate}
          </button>
        </div>
      </form>
    </CmsEditorModal>
  )
}
