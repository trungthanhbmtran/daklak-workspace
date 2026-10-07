import {
  Controller,
  All,
  Req,
  Res,
  Param,
  Headers,
  Body,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { PartnerAuthGuard } from './partner-auth.guard';
import { ExecutorService } from './executor.service';
import { Request, Response } from 'express';

@Controller()
export class ExecutorController {
  private readonly logger = new Logger(ExecutorController.name);
  constructor(private readonly executorService: ExecutorService) {}

  @All('execute/:code/*')
  async handleInternalProxy(
    @Param('code') code: string,
    @Param('0') pathParams: string,
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: any,
    @Body() body: any,
  ) {
    return this.doProxy(code, pathParams, req, res, headers, body);
  }

  @All('partner-api/:code/*')
  @UseGuards(PartnerAuthGuard)
  async handlePartnerProxy(
    @Param('code') code: string,
    @Param('0') pathParams: string,
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: any,
    @Body() body: any,
  ) {
    // Partner specific logic, e.g. check scopes
    return this.doProxy(code, pathParams, req, res, headers, body);
  }

  private async doProxy(
    code: string,
    pathParams: string,
    req: Request,
    res: Response,
    headers: any,
    body: any,
  ) {
    const method = req.method;
    // req.url contains query params as well, so we use originalUrl or construct it
    const path =
      '/' +
      pathParams +
      (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');

    this.logger.debug(`[Executor] Proxying ${method} ${code} ${path}`);

    try {
      const result = await this.executorService.executeRequest(
        code,
        method,
        path,
        headers,
        body,
        (req as any).user,
      );

      // Pass back headers
      for (const [key, value] of Object.entries(result.headers)) {
        if (key.toLowerCase() === 'transfer-encoding') continue;
        res.setHeader(key, value as string);
      }

      res.status(result.status).send(result.data);
    } catch (e: any) {
      if (e.status) {
        res.status(e.status).json({ success: false, message: e.message });
      } else {
        res
          .status(500)
          .json({ success: false, message: 'Internal Gateway Error' });
      }
    }
  }
}
