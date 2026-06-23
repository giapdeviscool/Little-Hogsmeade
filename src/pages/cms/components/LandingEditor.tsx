import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import {
  listBanners,
  listPages,
  createPage,
  updatePage,
  deletePage,
  uploadImage,
} from '../../../api/cms.api'
import type { CmsPage, CmsPagePayload, Banner } from '../../../types'
import { Card } from '../../../components/ui/Card'
import { useLocale } from '../../../hooks/useLocale'
import type { ContactBlock, NoticeState } from './cms.types'
import {
  landingPageSlugs,
  defaultLandingPageDraft,
  defaultContactBlock,
} from './cms.constants'
import { normalizeList, getPageBySlug } from './cms.utils'
import {
  InlineNotice,
  SectionHeading,
  TextField,
  ImageField,
  NumberField,
  TextAreaField,
  PageSyncMeta,
} from './CmsSharedUI'

export function LandingEditor() {
  const { t } = useLocale()
  const [, setBanners] = useState<Banner[]>([])
  const [pages, setPages] = useState<CmsPage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [saving, setSaving] = useState(false)
  const [landingPageDraft, setLandingPageDraft] = useState<CmsPagePayload>(defaultLandingPageDraft)
  const [contactDraft, setContactDraft] = useState<ContactBlock>(defaultContactBlock)
  const landingPageFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let alive = true

    async function load() {
      setIsLoading(true)
      setLoadError(null)
      try {
        const [bannerResponse, pageResponse] = await Promise.all([listBanners(), listPages()])
        if (!alive) return

        const sortedBanners = normalizeList<Banner>(bannerResponse.data).sort((a, b) => a.sortOrder - b.sortOrder)
        setBanners(sortedBanners)
        const normalizedPages = normalizeList<CmsPage>(pageResponse.data)
        setPages(normalizedPages)

        const contactPage = getPageBySlug(normalizedPages, landingPageSlugs.contact)
        if (contactPage?.content) {
          try {
            const parsed = JSON.parse(contactPage.content) as ContactBlock
            setContactDraft(parsed)
          } catch {
            // keep default
          }
        }
        const lpPage = getPageBySlug(normalizedPages, landingPageSlugs.landingPage)
        if (lpPage) {
          setLandingPageDraft({
            title: lpPage.title || '',
            content: lpPage.content || '',
            imageUrl: lpPage.imageUrl || '',
            aboutTitle: lpPage.aboutTitle || '',
            aboutContent: lpPage.aboutContent || '',
            yearsOfExperience: lpPage.yearsOfExperience || 0,
            isPublished: lpPage.isPublished ?? true,
            slug: lpPage.slug,
          })
        }
      } catch (loadError) {
        if (!alive) return
        setLoadError(loadError instanceof Error ? loadError.message : t.cms.shared.loadError)
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    void load()

    return () => {
      alive = false
    }
  }, [])

  const contactPage = getPageBySlug(pages, landingPageSlugs.contact)

  async function persistPage(slug: string, title: string, content: string, isPublished: boolean) {
    const existing = getPageBySlug(pages, slug)
    const payload = { slug, title, content, isPublished }
    const response = existing ? await updatePage(existing.id, payload) : await createPage(payload)
    const saved = response.data
    if (saved) {
      setPages((current) => {
        const withoutCurrent = current.filter((page) => page.id !== saved.id)
        return [...withoutCurrent, saved]
      })
    }
    return saved
  }

  async function handlePageSave(
    block: 'contact' | 'opening-hours' | 'featured-menu',
    draft: ContactBlock | { hours: unknown[] } | { items: unknown[] },
    title: string,
  ) {
    setSaving(true)
    setNotice(null)
    try {
      const saved = await persistPage(
        block === 'contact' ? landingPageSlugs.contact
          : block === 'opening-hours' ? landingPageSlugs.openingHours
          : landingPageSlugs.featuredMenu,
        title,
        JSON.stringify(draft),
        true,
      )
      if (saved) {
        setPages((current) => {
          const withoutCurrent = current.filter((page) => page.id !== saved.id)
          return [...withoutCurrent, saved]
        })
      }
      setNotice({ type: 'success', message: t.cms.landing.saveSuccessContent })
    } catch (pageError) {
      setNotice({ type: 'error', message: pageError instanceof Error ? pageError.message : t.common.saveError })
    } finally {
      setSaving(false)
    }
  }

  async function handlePageDelete(slug: string, resetDraft: () => void) {
    const existing = getPageBySlug(pages, slug)
    if (!window.confirm(t.cms.landing.confirmDeleteBlock)) return
    if (!existing) {
      resetDraft()
      return
    }

    setSaving(true)
    setNotice(null)
    try {
      await deletePage(existing.id)
      setPages((current) => current.filter((page) => page.id !== existing.id))
      resetDraft()
      setNotice({ type: 'success', message: t.cms.landing.deleteSuccessBlock })
    } catch (deleteError) {
      setNotice({ type: 'error', message: deleteError instanceof Error ? deleteError.message : t.common.deleteError })
    } finally {
      setSaving(false)
    }
  }

  async function handleLandingPageSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setNotice(null)
    try {
      const existing = getPageBySlug(pages, landingPageSlugs.landingPage)
      const response = existing ? await updatePage(existing.id, landingPageDraft) : await createPage(landingPageDraft)
      const saved = response.data
      if (saved) {
        setPages((current) => {
          const withoutCurrent = current.filter((page) => page.id !== saved.id)
          return [...withoutCurrent, saved]
        })
      }
      setNotice({ type: 'success', message: t.cms.landing.saveSuccessLanding })
    } catch (saveError) {
      setNotice({ type: 'error', message: saveError instanceof Error ? saveError.message : t.common.saveError })
    } finally {
      setSaving(false)
    }
  }

  async function handleLandingPageUpload(file: File) {
    setSaving(true)
    setNotice(null)
    try {
      const response = await uploadImage(file, 'landing/hero')
      const imageUrl = response.data?.secure_url
      if (imageUrl) {
        setLandingPageDraft((current) => ({ ...current, imageUrl }))
      }
      setNotice({ type: 'success', message: t.cms.landing.uploadSuccessHero })
    } catch (uploadError) {
      setNotice({ type: 'error', message: uploadError instanceof Error ? uploadError.message : t.common.uploadError })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 rounded bg-beige" />
          <div className="h-12 w-full rounded bg-beige" />
          <div className="h-12 w-full rounded bg-beige" />
        </div>
      </Card>
    )
  }

  if (loadError) {
    return (
      <Card className="p-6">
        <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {notice && <InlineNotice notice={notice} />}

      <Card className="p-6">
        <SectionHeading title={t.cms.landing.heroBanner} description={t.cms.landing.heroBannerDesc} />
        <form className="mt-6 grid gap-4" onSubmit={handleLandingPageSave}>
          <div className="grid gap-4 lg:grid-cols-2">
            <TextField label={t.cms.landing.heroTitle} value={landingPageDraft.title} onChange={(val) => setLandingPageDraft(d => ({ ...d, title: val }))} />
            <TextField label={t.cms.landing.heroSubtitle} value={landingPageDraft.content} onChange={(val) => setLandingPageDraft(d => ({ ...d, content: val }))} />
          </div>
          <ImageField label={t.cms.landing.heroImageHint} value={landingPageDraft.imageUrl ?? ''} onChange={(val) => setLandingPageDraft(d => ({ ...d, imageUrl: val }))} onUpload={handleLandingPageUpload} fileRef={landingPageFileRef} />

          <div className="mt-4 border-t border-line pt-4">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-gold">{t.cms.landing.story}</p>
            <div className="grid gap-4 lg:grid-cols-2">
              <TextField label={t.cms.landing.storyTitle} value={landingPageDraft.aboutTitle ?? ''} onChange={(val) => setLandingPageDraft(d => ({ ...d, aboutTitle: val }))} />
              <NumberField label={t.cms.landing.yearsExperience} value={landingPageDraft.yearsOfExperience ?? 0} onChange={(val) => setLandingPageDraft(d => ({ ...d, yearsOfExperience: val }))} />
            </div>
            <div className="mt-4">
              <TextAreaField label={t.cms.landing.storyContent} value={landingPageDraft.aboutContent ?? ''} onChange={(val) => setLandingPageDraft(d => ({ ...d, aboutContent: val }))} rows={4} />
            </div>
          </div>

          <button type="submit" disabled={saving} className="mt-2 inline-flex items-center gap-2 justify-center rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-70">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t.cms.landing.saveLandingChanges}
          </button>
          <PageSyncMeta page={getPageBySlug(pages, landingPageSlugs.landingPage) ?? { slug: 'landing-page', title: '', content: '', isPublished: true, id: '' } as CmsPage} />
        </form>
      </Card>

      <Card className="p-6">
        <SectionHeading title={t.cms.landing.contact} description={t.cms.landing.contactDesc} />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <TextField label={t.cms.landing.contactPhone} value={contactDraft.phone} onChange={(value) => setContactDraft((current) => ({ ...current, phone: value }))} />
          <TextField label={t.cms.landing.contactEmail} value={contactDraft.email} onChange={(value) => setContactDraft((current) => ({ ...current, email: value }))} />
          <TextField label={t.cms.landing.contactAddress} value={contactDraft.address} onChange={(value) => setContactDraft((current) => ({ ...current, address: value }))} className="lg:col-span-2" />
          <TextField label={t.cms.landing.contactMapLink} value={contactDraft.mapLink} onChange={(value) => setContactDraft((current) => ({ ...current, mapLink: value }))} className="lg:col-span-2" />
          <TextField label={t.cms.landing.contactSocialLinks} value={contactDraft.socials.join(', ')} onChange={(value) => setContactDraft((current) => ({ ...current, socials: value.split(',').map((item) => item.trim()).filter(Boolean) }))} className="lg:col-span-2" />
        </div>
        <div className="mt-5">
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => handlePageDelete(landingPageSlugs.contact, () => setContactDraft(defaultContactBlock))} disabled={saving} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-red-700 disabled:opacity-70">
              {t.cms.landing.deleteBlock}
            </button>
            <button type="button" onClick={() => handlePageSave('contact', contactDraft, 'Thông tin liên hệ')} disabled={saving} className="rounded-full bg-coffee px-5 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-70">
              {t.cms.landing.saveContact}
            </button>
          </div>
        </div>
        {contactPage && <PageSyncMeta page={contactPage} />}
      </Card>
    </div>
  )
}