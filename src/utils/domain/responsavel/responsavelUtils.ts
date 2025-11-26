export const clearLoginStorageResponsavel = () => {
  localStorage.removeItem("responsavel_id");
  localStorage.removeItem("responsavel_cpf");
  localStorage.removeItem("responsavel_email");
  localStorage.removeItem("responsavel_usuario_id");
  localStorage.removeItem("responsavel_is_logged");
};
