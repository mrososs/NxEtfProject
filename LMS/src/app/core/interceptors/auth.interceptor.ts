import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Add credentials: 'include' to all requests
  const authReq = req.clone({
    withCredentials: true,
  });

  return next(authReq);
};
