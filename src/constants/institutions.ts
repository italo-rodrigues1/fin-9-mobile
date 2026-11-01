import type { ImageSourcePropType } from 'react-native';

const institutions: { name: string; logo: ImageSourcePropType }[] = [
  { name: 'Nubank', logo: require('../../assets/institutions/nubank.png') },
  { name: 'Itaú', logo: require('../../assets/institutions/itau.png') },
  { name: 'Bradesco', logo: require('../../assets/institutions/bradesco.png') },
  {
    name: 'Santander',
    logo: require('../../assets/institutions/santander.png'),
  },
  {
    name: 'Banco do Brasil',
    logo: require('../../assets/institutions/banco-do-brasil.png'),
  },
  {
    name: 'Caixa Econômica Federal',
    logo: require('../../assets/institutions/caixa.png'),
  },
  { name: 'Banco Inter', logo: require('../../assets/institutions/inter.png') },
  { name: 'C6 Bank', logo: require('../../assets/institutions/c6-bank.png') },
  {
    name: 'BTG Pactual',
    logo: require('../../assets/institutions/btg-pactual.png'),
  },
  {
    name: 'XP Investimentos',
    logo: require('../../assets/institutions/xp.png'),
  },
  { name: 'PicPay', logo: require('../../assets/institutions/picpay.png') },
  {
    name: 'Mercado Pago',
    logo: require('../../assets/institutions/mercado-pago.png'),
  },
];

export const INSTITUTION_OPTIONS = institutions.map(({ name }) => ({
  value: name,
  label: name,
}));

const normalize = (name: string) =>
  name
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');

export function getInstitutionLogo(
  name: string,
): ImageSourcePropType | undefined {
  const normalized = normalize(name);
  return institutions.find(
    (institution) => normalize(institution.name) === normalized,
  )?.logo;
}
