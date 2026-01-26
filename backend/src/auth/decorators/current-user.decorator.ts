import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si on a passé un argument comme @User('id'), on renvoie juste l'id
    return data ? user?.[data] : user;
  },
);