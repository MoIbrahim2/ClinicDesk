import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resPayload = exception.getResponse();
      if (typeof resPayload === 'object' && resPayload !== null) {
        message = (resPayload as any).message || exception.message;
        error = (resPayload as any).error || 'Error';
      } else {
        message = resPayload || exception.message;
      }
    } else if (exception && (exception.code === 'ER_DUP_ENTRY' || exception.errno === 1062)) {
      status = HttpStatus.CONFLICT;
      message = 'A record with duplicate unique fields already exists.';
      error = 'Conflict';
      this.logger.warn(`Duplicate key entry database exception: ${exception.message}`);
    } else if (
      exception &&
      (exception.code === 'ER_NO_REFERENCED_ROW' ||
        exception.code === 'ER_NO_REFERENCED_ROW_2' ||
        exception.errno === 1452)
    ) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Referenced entity does not exist.';
      error = 'Bad Request';
      this.logger.warn(`Foreign key violation database exception: ${exception.message}`);
    } else if (
      exception &&
      (exception.code === 'ER_ROW_IS_REFERENCED' ||
        exception.code === 'ER_ROW_IS_REFERENCED_2' ||
        exception.errno === 1451)
    ) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Cannot delete or update because this record is referenced by other entities.';
      error = 'Bad Request';
      this.logger.warn(`Foreign key restrict violation database exception: ${exception.message}`);
    } else {
      // Unhandled standard errors
      this.logger.error('Unhandled Exception caught in global filter:', exception);
      if (process.env.NODE_ENV === 'development') {
        message = exception instanceof Error ? exception.message : String(exception);
        error = exception?.name || 'UnknownError';
      }
    }

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message: Array.isArray(message) ? message : [message],
    };

    response.status(status).json(responseBody);
  }
}
