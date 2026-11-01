import type { CardBrand } from '../types';
import type { ImageSourcePropType } from 'react-native';

export const CARD_BRAND_LOGOS: Record<CardBrand, ImageSourcePropType> = {
  VISA: require('../../assets/card-brands/visa.png'),
  MASTERCARD: require('../../assets/card-brands/mastercard.png'),
  ELO: require('../../assets/card-brands/elo.png'),
  AMERICAN_EXPRESS: require('../../assets/card-brands/american-express.png'),
  HIPERCARD: require('../../assets/card-brands/hipercard.png'),
};

export const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  ELO: 'Elo',
  AMERICAN_EXPRESS: 'American Express',
  HIPERCARD: 'Hipercard',
};

export const CARD_BRAND_OPTIONS = (
  Object.keys(CARD_BRAND_LABELS) as CardBrand[]
).map((value) => ({
  value,
  label: CARD_BRAND_LABELS[value],
}));
