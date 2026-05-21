export function AuthInput({ label, placeholder, type = 'text' }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-bold">
      {label}
      <input
        type={type}
        placeholder={placeholder}
        className="h-12 rounded-[14px] border border-line bg-cream px-4 text-[15px] font-medium outline-none transition placeholder:text-muted/60 focus:border-latte focus:bg-white focus:ring-4 focus:ring-latte/15"
      />
    </label>
  )
}
