export const setAuthUser = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuthUser = () => {
  localStorage.removeItem("user");
};

export function getAuthUser() {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
}
