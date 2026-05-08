// export const validateMaxLength = (name, value, max, showError) => {

//   if (!value) return true;

//   if (value.length === max) {

//     showError(name, `Maximum ${max} characters reached`);

//     return false;
//   }

//   return true;
// };



export const validateMaxLength = (name, value, max, showError) => {

  if (!value) return true;

  if (value.length > max) {
    showError(name, `Maximum ${max} characters allowed`);
    return false; // ❌ STOP
  }

  return true; // ✅ ALLOW
};