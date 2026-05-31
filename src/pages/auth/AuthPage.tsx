import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthInput } from '../../components/ui/AuthInput'
import { LanguageSwitch } from '../../components/ui/LanguageSwitch'
import { useLocale } from '../../hooks/useLocale'
import { cn } from '../../utils/cn'
import type { AuthMode } from '../../types'
import { login, register } from '../../api/auth.api'
import { saveAuthSession } from '../../store/auth.store'

export function AuthPage({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate()
  const { t } = useLocale()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isLogin = mode === 'login'
  const isRegister = mode === 'register'
  const isForgot = mode === 'forgot'

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (isForgot) {
      setMessage(t.auth.recoverySent)
      return
    }

    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') || '')

    if (isRegister && password !== String(form.get('confirmPassword') || '')) {
      setError(t.auth.passwordMismatch)
      return
    }

    setIsSubmitting(true)

    try {
      const response = isRegister
        ? await register({
            accountType: 'customer',
            fullName: String(form.get('fullName') || '').trim(),
            phone: String(form.get('phone') || '').trim(),
            email: String(form.get('email') || '').trim() || undefined,
            password,
          })
        : await login({
            identifier: String(form.get('identifier') || '').trim(),
            password,
          })

      saveAuthSession(response.data)
      navigate('/home')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to connect to server')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-[1.05fr_.95fr] bg-white p-6 text-coffee">
      <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(90deg,rgba(74,53,37,.72),rgba(74,53,37,.18)),url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=85')] bg-cover bg-center p-10 shadow-soft">
        <div className="relative z-10 flex items-start justify-between text-white">
          <strong className="text-[30px] font-bold tracking-[-0.03em]">{t.brand.name}</strong>
          <div className="flex items-center gap-4">
            <span className="mt-2 text-xs font-bold uppercase tracking-[0.34em] text-white/75">{t.brand.tagline}</span>
            <LanguageSwitch tone="glass" />
          </div>
        </div>
        <div className="relative z-10 mt-[210px] max-w-[620px] text-white">
          <p className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] backdrop-blur">ERP & POS Management</p>
          <h1 className="text-[52px] font-bold leading-[1.03] tracking-[-0.05em]">{t.auth.heroTitle}</h1>
          <span className="mt-5 block max-w-[520px] text-[17px] leading-7 text-white/80">{t.auth.heroSubtitle}</span>
        </div>
        <div className="absolute bottom-10 left-10 right-10 z-10 grid grid-cols-3 gap-4">
          {['12 Chi nhánh', '6.4K Đơn/tháng', '98% Đồng bộ'].map((metric) => {
            const [value, ...label] = metric.split(' ')
            return (
              <article key={metric} className="rounded-[18px] border border-white/20 bg-white/15 p-5 text-white backdrop-blur">
                <b className="block text-[32px] leading-none">{value}</b>
                <span className="mt-2 block text-xs font-semibold text-white/75">{label.join(' ')}</span>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[520px] flex-col justify-center px-8">
        <div className="mb-9 grid grid-cols-2 rounded-[16px] bg-cream p-1">
          <button type="button" onClick={() => navigate('/login')} className={cn('rounded-[13px] px-4 py-3 text-sm font-bold transition', isLogin ? 'bg-white text-coffee shadow-soft' : 'text-muted')}>{t.auth.login}</button>
          <button type="button" onClick={() => navigate('/register')} className={cn('rounded-[13px] px-4 py-3 text-sm font-bold transition', isRegister ? 'bg-white text-coffee shadow-soft' : 'text-muted')}>{t.auth.register}</button>
        </div>

        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-muted">{isForgot ? t.auth.recoverAccess : isRegister ? t.auth.createAccount : t.auth.welcomeBack}</p>
          <h1 className="text-[40px] font-bold tracking-[-0.04em]">{isForgot ? t.auth.forgotTitle : isRegister ? t.auth.registerTitle : t.auth.loginTitle}</h1>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {isRegister && (
            <>
              <AuthInput name="fullName" label={t.auth.fullName} placeholder="Anna Nguyễn" required />
              <AuthInput name="phone" label={t.auth.phone} placeholder="0901 234 567" required />
              <AuthInput name="email" label={t.auth.email} placeholder="anna@littlehogsmeade.vn" type="email" />
            </>
          )}
          {!isRegister && <AuthInput name="identifier" label={isForgot ? t.auth.recoveryEmail : t.auth.emailOrPhone} placeholder="admin@littlehogsmeade.vn" type={isForgot ? 'email' : 'text'} required />}
          {!isForgot && <AuthInput name="password" label={t.auth.password} placeholder="••••••••" type="password" required />}
          {isRegister && <AuthInput name="confirmPassword" label={t.auth.confirmPassword} placeholder="••••••••" type="password" required />}
          {isLogin && (
            <div className="flex items-center justify-between pt-1 text-sm">
              <label className="flex items-center gap-2 font-semibold text-muted"><input type="checkbox" defaultChecked className="h-4 w-4 accent-coffee" />{t.auth.rememberMe}</label>
              <button type="button" onClick={() => navigate('/forgot-password')} className="font-bold text-coffee hover:underline">{t.auth.forgotPassword}?</button>
            </div>
          )}
          <button type="submit" disabled={isSubmitting} className="mt-2 h-12 rounded-[14px] bg-coffee px-5 text-[15px] font-bold text-white shadow-[0_16px_32px_rgba(74,53,37,0.18)] hover:bg-[#3f2d20] disabled:cursor-wait disabled:opacity-65">{isSubmitting ? t.auth.processing : isForgot ? t.auth.submitRecovery : isRegister ? t.auth.submitRegister : t.auth.login}</button>
          {message && <p className="rounded-[12px] bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p>}
          {error && <p className="rounded-[12px] bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
        </form>

        <p className="mt-7 flex justify-center gap-2 text-sm font-medium text-muted">
          {isForgot ? t.auth.rememberedPassword : isLogin ? t.auth.noAccount : t.auth.hasAccount}
          <button type="button" onClick={() => navigate(isForgot || isRegister ? '/login' : '/register')} className="font-bold text-coffee hover:underline">{isForgot || isRegister ? t.auth.login : t.auth.register}</button>
        </p>
      </section>
    </main>
  )
}
