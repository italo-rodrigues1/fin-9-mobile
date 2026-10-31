export function errorMessage(error: any, fallback: string): string {
  const message = error?.response?.data?.message;
  return Array.isArray(message)
    ? message.join('\n')
    : typeof message === 'string'
      ? message
      : error?.request
        ? 'Não foi possível conectar. Verifique sua conexão e tente novamente.'
        : fallback;
}
