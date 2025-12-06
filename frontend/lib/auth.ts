export const auth = {
  login(email: string) {
    localStorage.setItem("email", email);
  },

  logout() {
    localStorage.removeItem("email");
    localStorage.removeItem("tenantId");
  },

  isLoggedIn() {
    return !!localStorage.getItem("email");
  },
};