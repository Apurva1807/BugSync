export const logoutUser = () => {
  localStorage.removeItem(
    "user"
  );

  localStorage.removeItem(
    "token"
  );
};