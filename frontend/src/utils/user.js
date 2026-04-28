export const setUser = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null
};

export const clearUser = () => {
    localStorage.removeItem("user");
}