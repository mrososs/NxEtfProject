import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { apiInterceptor } from './api.interceptor';

describe('apiInterceptor', () => {
  let mockHandler: jasmine.SpyObj<HttpHandlerFn>;

  beforeEach(() => {
    mockHandler = jasmine
      .createSpy('HttpHandlerFn')
      .and.returnValue(of({} as HttpEvent<any>));
  });

  it('should add base URL to relative URLs starting with /api', () => {
    const request = new HttpRequest('GET', '/api/Course?lang=ar');
    const expectedUrl =
      'https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/Course?lang=ar';

    apiInterceptor(request, mockHandler);

    expect(mockHandler).toHaveBeenCalledWith(
      jasmine.objectContaining({
        url: expectedUrl,
      })
    );
  });

  it('should add base URL to relative URLs without leading slash', () => {
    const request = new HttpRequest('GET', 'api/Course?lang=ar');
    const expectedUrl =
      'https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/Course?lang=ar';

    apiInterceptor(request, mockHandler);

    expect(mockHandler).toHaveBeenCalledWith(
      jasmine.objectContaining({
        url: expectedUrl,
      })
    );
  });

  it('should not modify requests that start with http://', () => {
    const request = new HttpRequest(
      'GET',
      'https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/Course?lang=ar'
    );

    apiInterceptor(request, mockHandler);

    expect(mockHandler).toHaveBeenCalledWith(request);
  });

  it('should not modify requests that start with https://', () => {
    const request = new HttpRequest('GET', 'https://api.example.com/data');

    apiInterceptor(request, mockHandler);

    expect(mockHandler).toHaveBeenCalledWith(request);
  });

  it('should handle other relative URLs by adding base URL', () => {
    const request = new HttpRequest('GET', 'assets/data/courses.json');
    const expectedUrl =
      'https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/assets/data/courses.json';

    apiInterceptor(request, mockHandler);

    expect(mockHandler).toHaveBeenCalledWith(
      jasmine.objectContaining({
        url: expectedUrl,
      })
    );
  });
});
