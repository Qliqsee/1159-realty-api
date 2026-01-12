export function formatFullName(
  firstName?: string | null,
  lastName?: string | null,
  otherName?: string | null,
): string | undefined {
  const parts = [firstName, lastName, otherName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : undefined;
}
