const creditColors = ['#168567', '#6552A0', '#28618C', '#AE5942', '#475C69'];

export function creditCardColor(name: string) {
  const normalized = name.toLocaleLowerCase('pt-BR');
  if (/nubank|\bnu\b/.test(normalized)) return '#7138B4';
  if (/\binter\b|itaú|itau/.test(normalized)) return '#B75B22';
  if (/santander|bradesco/.test(normalized)) return '#A33A48';
  if (/banco do brasil|\bbb\b|caixa/.test(normalized)) return '#246299';
  const hash = Array.from(normalized).reduce(
    (value, char) => (value * 31 + char.charCodeAt(0)) >>> 0,
    0,
  );
  return creditColors[hash % creditColors.length];
}

export function walletCardAppearance(color = '#168567') {
  const hex = /^#[\da-f]{6}$/i.test(color)
    ? color.slice(1)
    : /^#[\da-f]{3}$/i.test(color)
      ? color
          .slice(1)
          .split('')
          .map((c) => c + c)
          .join('')
      : '168567';
  const channels = hex.match(/../g)!.map((part) => parseInt(part, 16));
  const mix = (target: number[], amount: number) =>
    '#' +
    channels
      .map((channel, index) =>
        Math.round(channel + (target[index] - channel) * amount)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('');
  return {
    base: mix([8, 19, 23], 0.64),
    middle: mix([8, 19, 23], 0.38),
    glow: mix([230, 247, 231], 0.3),
  };
}
