function formatError(rawErrors) {
  const formattedErrors = {};
  for (const err of rawErrors) {
    if (!formattedErrors[err.path]) {
      formattedErrors[err.path] = err.msg;
    }
  }

  return formattedErrors
}

module.exports = formatError;