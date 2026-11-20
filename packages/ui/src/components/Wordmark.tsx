import { useT } from '../i18n';

/** The product's name in the interface language: Promptreel (never in capitals) */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  const { t } = useT();
  return compact
    ? null
    : <span className="text-[15px] font-semibold leading-none tracking-[-0.01em] text-ink">{t('common.product')}</span>;
}
