const sendSuccess = (res, data, message = "Sucesso", statusCode = 200) => {
  return res.status(statusCode).json({
    error: false,
    message,
    data,
    statusCode,
  });
};

const sendError = (
  res,
  message = "Erro interno do servidor",
  statusCode = 500,
) => {
  return res.status(statusCode).json({
    error: true,
    message,
    statusCode,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
