import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export function apiInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const baseUrl = 'https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net';

  // Check if URL starts with http or https (absolute URLs)
  const isAbsoluteUrl =
    request.url.startsWith('http://') || request.url.startsWith('https://');

  // If it's not an absolute URL, add the base URL
  if (!isAbsoluteUrl) {
    const apiReq = request.clone({
      url: `${baseUrl}${
        request.url.startsWith('/') ? request.url : `/${request.url}`
      }`,
    });
    return next(apiReq);
  }

  // For absolute URLs, pass through unchanged
  return next(request);
}
