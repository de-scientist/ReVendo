import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { redactSensitive } from '../logging/redact.util';

/**
 * RFC7807-ish error envelope with correlation IDs.
 * All 5xx details are hidden from clients; full (redacted) context goes to logs.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    const correlationId = (req?.id as string | undefined) ?? randomUUID();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = exception instanceof HttpException ? exception.getResponse() : null;
    const message =
      typeof raw === 'string'
        ? raw
        : (raw as { message?: unknown } | null)?.message ?? (status >= 500 ? 'Internal server error' : 'Request failed');

    this.logger.error(
      JSON.stringify(
        redactSensitive({
          correlationId,
          method: req?.method,
          url: req?.url,
          status,
          message,
        }),
      ),
    );

    res.status(status).json({
      statusCode: status,
      message,
      error: status >= 500 ? 'Internal Server Error' : HttpStatus[status],
      correlationId,
    });
  }
}
