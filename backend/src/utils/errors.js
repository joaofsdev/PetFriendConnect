class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado") {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = "Erro de validação") {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Não autorizado") {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Acesso proibido") {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = "Conflito nos dados") {
    super(message, 409);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
};
