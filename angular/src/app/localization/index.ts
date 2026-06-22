import { PortfolioLanguage } from '@core/services/public-theme.service';
import ar from './ar.json';
import en from './en.json';

const portfolioLocalization = {
  en,
  ar,
} satisfies Record<PortfolioLanguage, typeof en>;

export type PortfolioLocalizationNamespace = keyof typeof en;

export function getPortfolioCopy<T extends PortfolioLocalizationNamespace>(
  language: PortfolioLanguage,
  namespace: T,
): (typeof en)[T] {
  return portfolioLocalization[language][namespace];
}
