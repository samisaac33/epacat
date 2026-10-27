import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class BancoApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-banco-api-key'];
    const expected = process.env.BANCO_PACIFICO_API_KEY;

    if (!expected || apiKey !== expected) {
      throw new UnauthorizedException('API key bancaria inválida');
    }
    return true;
  }
}
