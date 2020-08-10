import { Dictionary } from '../http-common';
import { HttpEndpointFunction } from '../http-endpoint';

/**
 * Settings to be passed into the HttpClient fetch calls.
 */
export interface HttpClientSettings<
  P extends Dictionary = {},
  Q extends Dictionary = {},
> {
  /** An object to be parsed into URL params. */
  params?: Partial<P>;
  /** An object to be parsed into a query string. */
  query?: Partial<Q>;
  /** An object to be assigned into HTTP headers. */
  headers?: Dictionary;
  /** An abort signal. */
  signal?: AbortSignal;
}

/**
 * Settings to be passed into the HttpClient fetch calls.
 */
export interface HttpClientSettingsWithBody<
  P extends Dictionary = {},
  Q extends Dictionary = {},
  B extends object | void = void,
> extends HttpClientSettings<P, Q> {
  /** An object tobe ussed as HTTP request body. */
  body?: B;
}

/**
 * Settings to be passed into the HttpClient constructor.
 */
export interface HttpClientConstructorSettings<
  P extends Dictionary = {},
  Q extends Dictionary = {},
> extends HttpClientSettings<P, Q> {
  /** An url that will be used as the base url on all requests. */
  serviceUrl: string;
  /** A function that accepts parameters and returns an string as endpoint. */
  endpointFn: HttpEndpointFunction<P>;
  /** Fetch API credentials: omit, same-origin, include. */
  credentials?: RequestCredentials;
  /** A function to intercept the response content. */
  contentInterceptorFn?: Function;
}

/**
 * A result from an HttpClient successful response.
 */
export interface HttpClientResponseResult<
  C = void,
  P extends Dictionary = {},
> {
  /**  A response from the Fetch API. */
  readonly response: Response;
  /**  The parsed content after interception. */
  readonly content: C;
  /**  The HTTP status code. */
  readonly status: number;
  /**  The MIME type of the content. */
  readonly mimeType: string;
  /**  The HTTP method. */
  readonly method: string;
  /** The endpoint used to fetch. */
  readonly endpointFn: HttpEndpointFunction<P>;
}

/**
 * 
 */
export interface HttpClientResponseUnknownRawResult<
  C = void,
  P extends Dictionary = {},
> extends HttpClientResponseResult<C, P> {
  /** the type of raw content */
  readonly type: 'UNKNOWN';
  /**  The parsed content before interception. */
  readonly rawContent: any;
}

/**
 * 
 */
export interface HttpClientResponseJsonRawResult<
  C = void,
  P extends Dictionary = {},
> extends HttpClientResponseResult<C, P> {
  /** the type of raw content */
  readonly type: 'JSON';
  /**  The parsed content before interception. */
  readonly rawContent: object;
}

/**
 * 
 */
export interface HttpClientResponseXmlRawResult<
  C = void,
  P extends Dictionary = {},
> extends HttpClientResponseResult<C, P> {
  /** the type of raw content */
  readonly type: 'XML';
  /**  The parsed content before interception. */
  readonly rawContent: Document;
}

/**
 * 
 */
export interface HttpClientResponseTextRawResult<
  C = void,
  P extends Dictionary = {},
> extends HttpClientResponseResult<C, P> {
  /** the type of raw content */
  readonly type: 'TEXT';
  /**  The parsed content before interception. */
  readonly rawContent: string;
}

/**
 * 
 */
export interface HttpClientResponseBlobRawResult<
  C = void,
  P extends Dictionary = {},
> extends HttpClientResponseResult<C, P> {
  /** the type of raw content */
  readonly type: 'BLOB';
  /**  The parsed content before interception. */
  readonly rawContent: Blob;
}

/**
 * 
 */
export type HttpClientResponseRawResult<
  C = void,
  P extends Dictionary = {},
> = HttpClientResponseUnknownRawResult<C, P>
  | HttpClientResponseJsonRawResult<C, P>
  | HttpClientResponseXmlRawResult<C, P>
  | HttpClientResponseTextRawResult<C, P>
  | HttpClientResponseBlobRawResult<C, P>;

/**
 * An abstract error from an HttpClient failed response.
 */
export abstract class AbstractHttpClientResponseError<
  C = void,
  P extends Dictionary = {},
> extends Error implements HttpClientResponseResult<C, P> {
  /**  A response from the Fetch API. */
  readonly response: Response;
  /**  The parsed content before interception. */
  readonly rawContent: any;
  /**  The parsed content after interception. */
  readonly content: any;
  /**  The HTTP status code. */
  readonly status: number;
  /**  The MIME type of the content. */
  readonly mimeType: string;
  /**  The HTTP method. */
  readonly method: string;
  /** The endpoint used to fetch. */
  readonly endpointFn: HttpEndpointFunction<P>;

  /**
   * Creates an error for unsuccess responses.
   * @param message
   * The message to be displayed.
   * @param result
   * An HttpClient response result.
   */
  constructor(message: string, result: HttpClientResponseResult<C, P>) {
    super(message);
    Object.assign(this, result, { name: 'HttpUnsuccessResponseError' });
  }
}

/**
 * An error from an HttpClient failed response.
 */
export class HttpClientResponseError<
  C = void,
  P extends Dictionary = {},
> extends AbstractHttpClientResponseError<C, P> {

  /**
   * Creates an error for unsuccess responses.
   * @param result
   * An HttpClient response result.
   */
  constructor(result: HttpClientResponseResult<C, P>) {
    super(`Request to "${result.response.url}" failed`, result);
  }
}

/**
 * An error from an HttpClient failed interception.
 */
export class HttpContentInterceptionError<
  C = void,
  P extends Dictionary = {},
> extends AbstractHttpClientResponseError<C, P> {

  /** The error that caused the interception exception. */
  readonly innerError: Error;

  /**
   * Creates an error for unsuccess content interception.
   * @param result
   * An HttpClient response result.
   */
  constructor(result: HttpClientResponseResult<C, P>, innerError: Error) {
    super(`Http response content interception failed with error: ${innerError.name}`, result);
    this.innerError = innerError;
  }
}

/**
 * A function to manipulate an HttpClient instance.
 */
export type HttpClientSetupFunction<
  P extends Dictionary = {},
  Q extends Dictionary = {},
  B extends object | void = void,
> = (client: HttpClient<P, Q, B>) => void;

/**
 * A symbol to identify HTTP content interception bypassing.
 */
export const BYPASS_HTTP_CONTENT_INTERCEPTION_ERROR: Symbol = Symbol('BYPASS_HTTP_CONTENT_INTERCEPTION_ERROR');

/**
 * 
 */
export interface HttpClient<
  P extends Dictionary = {},
  Q extends Dictionary = {},
  B extends object | void = void,
> {

  /**
   * Creates a new instance with the same settings.
   * 
   * @returns
   * A new instance with the same settings.
   */
  clone(): HttpClient<P, Q, B>;

  /**
   * Accepts a function that interacts with this instance.
   * 
   * @param setupFn
   * A function that accepts HttpClient as first parameter.
   * @returns
   * This instance.
   */
  setup(setupFn: HttpClientSetupFunction<P>): HttpClient<P>;

  /**
   * Sets a base service URL to make requests.
   * 
   * @param serviceUrl
   * An url that will be used as the base url on all requests.
   * @returns
   * This instance.
   */
  setServiceUrl(serviceUrl: string): HttpClient<P>;
  
  /**
   * Sets an endpoint function, it will be filled with the params on each request.
   * 
   * @param endpointFn
   * A function that accepts parameters and returns an string as endpoint.
   * @returns
   * This instance.
   */
  setEndpoint(endpointFn: HttpEndpointFunction<P>): HttpClient<P>;

  /**
   * Sets an authorization to be sent on the HTTP request headers.
   * 
   * @param authorization
   * An authroization header value.
   * @returns
   * This instance.
   */
  setAuthorization(authorization: string): HttpClient<P>;

  /**
   * Sets a basic authorization to be sent on the HTTP request headers.
   * 
   * @param token
   * The suffix after "Basic".
   * @returns
   * This instance.
   */
  setBasicAuth(token: string): HttpClient<P>;

  /**
   * Sets a bearer authorization to be sent on the HTTP request headers.
   * 
   * @param token
   * The suffix after "Bearer".
   * @returns
   * This instance.
   */
  setBearerAuth(token: string): HttpClient<P>;

  /**
   * Sets a basic authorization with the given username and password.
   * 
   * @param username
   * An username.
   * @param password
   * A password.
   * @returns
   * This instance.
   */
  setBasicAuthCredentials(username: string, password: string): HttpClient<P>;

  /**
   * An object to be parsed into URL parameters, it will be injected into the
   * endpoint function.
   * 
   * @param params
   * An object to be parsed into URL params.
   * @param replace
   * Replaces the whole params if true, will merge otherwise.
   * @returns
   * This instance.
   */
  setParams(params: P, replace: boolean): HttpClient<P>;

  /**
   * An object to be parsed into a query string.
   * if some property values is an array then will be repeated:
   * { item: [1, 2, 3, 4] } --> ?item=1&item=2&item=3&item=4
   * 
   * @param query
   * An object to be parsed into a query string.
   * @param replace
   * Replaces the whole query if true, will merge otherwise.
   * @returns
   * This instance.
   */
  setQuery(query: Q, replace: boolean): HttpClient<P>;

  /**
   * An object to be assigned into HTTP headers.
   * 
   * @param headers
   * An object to be assigned into HTTP headers.
   * @param replace
   * Replaces the whole headers if true, will merge otherwise.
   * @returns
   * This instance.
   */
  setHeaders(headers: Dictionary, replace: boolean): HttpClient<P>;

  /**
   * A signal to abort all the HTTP requests generated by this instance.
   *
   * @param signal
   * An abort signal.
   * @returns
   * This instance.
   */
  setSignal(signal: AbortSignal): HttpClient<P>;

  /**
   * Performs a GET request.
   * 
   * @param settings
   * Settings to override the general settings.
   * @returns
   * A response object with the parsed content.
   */
  get<
    C,
    PE extends P = P,
    QE extends Q = Q,
  >(settings: HttpClientSettings<PE, QE>): Promise<HttpClientResponseResult<C, PE>>;

  /**
   * Performs a POST request.
   * 
   * @param settings
   * Settings to override the general settings.
   * @returns
   * A response object with the parsed content.
   */
  post<
    C,
    PE extends P = P,
    QE extends Q = Q,
    BE extends B = B,
  >(settings: HttpClientSettingsWithBody<PE, QE, BE>): Promise<HttpClientResponseResult<C, PE>>;

  /**
   * Performs a PUT request.
   * 
   * @param settings
   * Settings to override the general settings.
   * @returns
   * A response object with the parsed content.
   */
  put<
    C,
    PE extends P = P,
    QE extends Q = Q,
    BE extends B = B,
  >(settings: HttpClientSettingsWithBody<PE, QE, BE>): Promise<HttpClientResponseResult<C, PE>>;

  /**
   * Performs a DELETE request.
   * 
   * @param settings
   * Settings to override the general settings.
   * @returns
   * A response object with the parsed content.
   */
  del<
    C,
    PE extends P = P,
    QE extends Q = Q,
  >(settings: HttpClientSettings<PE, QE>): Promise<HttpClientResponseResult<C, PE>>;
}
