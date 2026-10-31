export function errorMessage(error: any, fallback: string): string {
  if (error?.response?.status === 429)
    return 'Muitas solicitações em pouco tempo. Aguarde um minuto e tente novamente.';
  const message = error?.response?.data?.message;
  return Array.isArray(message)
    ? message.join('\n')
    : typeof message === 'string'
      ? message
      : error?.request
        ? 'Não foi possível conectar. Verifique sua conexão e tente novamente.'
        : fallback;
}
