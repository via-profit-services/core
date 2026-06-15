const parseContentType = (
  contentType: string,
): { type: string; params: Record<string, string> } | null => {
  const trimmed = contentType.trim();

  const semicolonIndex = trimmed.indexOf(';');
  const mediaType = (semicolonIndex === -1 ? trimmed : trimmed.slice(0, semicolonIndex))
    .trim()
    .toLowerCase();

  if (!/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/.test(mediaType)) {
    return null;
  }

  const params: Record<string, string> = {};

  if (semicolonIndex !== -1) {
    const paramsStr = trimmed.slice(semicolonIndex + 1);
    paramsStr.split(';').forEach(param => {
      const [key, value] = param.split('=').map(s => s.trim());
      if (key && value) {
        params[key.toLowerCase()] = value.replace(/^["']|["']$/g, '');
      }
    });
  }

  return { type: mediaType, params };
};

export default parseContentType;
