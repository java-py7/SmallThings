/**
 * Generate a consistent avatar URL for a user
 * @param {object|string} user - User object or name string
 * @returns {string} URL to avatar image
 */
export function getAvatarUrl(user) {
  if (!user) {
    return "https://ui-avatars.com/api/?name=User&background=16a34a&color=fff&size=96&bold=true";
  }

  if (typeof user === "object" && user.avatar) {
    return user.avatar;
  }

  const name = typeof user === "object" ? user.name || "User" : user;
  const encodedName = encodeURIComponent(name);

  return `https://ui-avatars.com/api/?name=${encodedName}&background=16a34a&color=fff&size=96&bold=true`;
}

export default getAvatarUrl;

