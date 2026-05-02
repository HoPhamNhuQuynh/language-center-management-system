export const setTokens = (access_token, refresh_token, user) => {
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

export const getRefreshToken = () => {
  return localStorage.getItem("refresh_token");
};

export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const getUser = () => {
  const data = localStorage.getItem("user");
  if (!data || data === "undefined") 
    return null;
  return data ? JSON.parse(data) : null;
}

export const getRole = () => getUser()?.role;