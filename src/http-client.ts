/**
 * @module http-client
 * @author Leon Plata <pcg.leon@outlook.net>
 */

import { Dictionary } from './http-common';
import { HttpEndpointFunction } from './http-endpoint';

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
  P extends Dictionary = {},
  C = void,
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
export interface HttpClientResponseUnknownResult<
  P extends Dictionary = {},
  R = void,
  C = R,
> extends HttpClientResponseResult<P, C> {
  /** the type of raw content */
  readonly type: 'UNKNOWN';
  /**  The parsed content before interception. */
  readonly rawContent: any;
}

/**
 * 
 */
export interface HttpClientResponseJsonResult<
  P extends Dictionary = {},
  R = void,
  C = R,
> extends HttpClientResponseResult<P, C> {
  /** the type of raw content */
  readonly type: 'JSON';
  /**  The parsed content before interception. */
  readonly rawContent: object;
}

/**
 * 
 */
export interface HttpClientResponseXmlResult<
  P extends Dictionary = {},
  R = void,
  C = R,
> extends HttpClientResponseResult<P, C> {
  /** the type of raw content */
  readonly type: 'XML';
  /**  The parsed content before interception. */
  readonly rawContent: Document;
}

/**
 * 
 */
export interface HttpClientResponseTextResult<
  P extends Dictionary = {},
  R = void,
  C = R,
> extends HttpClientResponseResult<P, C> {
  /** the type of raw content */
  readonly type: 'TEXT';
  /**  The parsed content before interception. */
  readonly rawContent: string;
}

/**
 * 
 */
export interface HttpClientResponseBlobResult<
  P extends Dictionary = {},
  C = void,
> extends HttpClientResponseResult<P, C> {
  /** the type of raw content */
  readonly type: 'BLOB';
  /**  The parsed content before interception. */
  readonly rawContent: Blob;
}

/**
 * 
 */
export type HttpClientResponseAnyResult<
P extends Dictionary = {},
C = void,
> = HttpClientResponseUnknownResult<P, C>
  | HttpClientResponseJsonResult<P, C>
  | HttpClientResponseXmlResult<P, C>
  | HttpClientResponseTextResult<P, C>
  | HttpClientResponseBlobResult<P, C>;

/**
 * An abstract error from an HttpClient failed response.
 */
export abstract class AbstractHttpClientResponseError<
  P extends Dictionary = {},
  C = void,
> extends Error implements HttpClientResponseResult<P, C> {
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
  constructor(message: string, result: HttpClientResponseResult<P, C>) {
    super(message);
    Object.assign(this, result, { name: 'HttpUnsuccessResponseError' });
  }
}

/**
 * An error from an HttpClient failed response.
 */
export class HttpClientResponseError<
  P extends Dictionary = {},
  C = void,
> extends AbstractHttpClientResponseError<P, C> {

  /**
   * Creates an error for unsuccess responses.
   * @param result
   * An HttpClient response result.
   */
  constructor(result: HttpClientResponseResult<P, C>) {
    super(`Request to "${result.response.url}" failed`, result);
  }
}

/**
 * An error from an HttpClient failed interception.
 */
export class HttpContentInterceptionError<
  P extends Dictionary = {},
  C = void,
> extends AbstractHttpClientResponseError<P, C> {

  /** The error that caused the interception exception. */
  readonly innerError: Error;

  /**
   * Creates an error for unsuccess content interception.
   * @param result
   * An HttpClient response result.
   */
  constructor(result: HttpClientResponseResult<P, C>, innerError: Error) {
    super(`Http response content interception failed with error: ${innerError.name}`, result);
    this.innerError = innerError;
  }
}

/**
 * A function to manipulate an HttpClient instance.
 */
export type HttpClientSetupFunction<P extends Dictionary = {}> = (client: HttpClient<P>) => void;

/**
 * A symbol to identify HTTP content interception bypassing.
 */
export const BYPASS_HTTP_CONTENT_INTERCEPTION_ERROR: Symbol = Symbol('BYPASS_HTTP_CONTENT_INTERCEPTION_ERROR');

/**
 * An HTTP client class, it allows to pre-configure HTTP requests.
 */
export class HttpClient<
  P extends Dictionary = {},
  Q extends Dictionary = {},
  B extends object | void = void,
> {

  /** An url that will be used as the base url on all requests. */
  #serviceUrl: string;
  /** A function that accepts parameters and returns an string as endpoint. */
  #endpointFn: HttpEndpointFunction<P>;
  /** An object to be parsed into URL params. */
  #params: Partial<P>;
  /** An object to be parsed into a query string. */
  #query: Partial<Q>;
  /** An object to be assigned into HTTP headers. */
  #headers: Dictionary;
  /** An abort signal. */
  #signal?: AbortSignal;
  /** Fetch API credentials: omit, same-origin, include.  */
  #credentials?: RequestCredentials;
  /** A function to intercept the response content. */
  #contentInterceptorFn?: Function;

  /**
   * A creator function to be used on call chains.
   *
   * @param settings
   * Settings to pre-configure the HTTP request.
   * @returns
   * An HTTP client class instance.
   */
  static create<
    P extends Dictionary = {},
  >(settings: HttpClientConstructorSettings<P>): HttpClient<P> {
    return new HttpClient(settings);
  }

  /**
   * Set pre-defined configurations.
   * 
   * @param settings
   * Settings to pre-configure the HTTP request.
   */
  constructor({
    serviceUrl,
    endpointFn,
    params = {},
    query = {},
    headers = {
      'content-type': 'application/json',
      'accept': 'application/json',
    },
    credentials = 'same-origin',
    signal,
    contentInterceptorFn,
  }: HttpClientConstructorSettings<P, Q>) {
    this.#serviceUrl = serviceUrl;
    this.#endpointFn = endpointFn;
    this.#params = params;
    this.#query = query;
    this.#headers = headers;
    this.#credentials = credentials;
    this.#signal = signal;
    this.#contentInterceptorFn = contentInterceptorFn
  }

  /**
   * Creates a new instance with the same settings.
   * 
   * @returns
   * A new instance with the same settings.
   */
  clone(): HttpClient<P> {
    return new HttpClient({
      serviceUrl: this.#serviceUrl,
      endpointFn: this.#endpointFn,
      params: { ...this.#params },
      query: { ...this.#query },
      headers: { ...this.#headers },
      credentials: this.#credentials,
      signal: this.#signal,
    });
  }

  /**
   * Accepts a function that interacts with this instance.
   * 
   * @param setupFn
   * A function that accepts HttpClient as first parameter.
   * @returns
   * This instance.
   */
  setup(setupFn: HttpClientSetupFunction<P>): HttpClient<P> {
    setupFn(this);
    return this;
  }

  /**
   * Sets a base service URL to make requests.
   * 
   * @param serviceUrl
   * An url that will be used as the base url on all requests.
   * @returns
   * This instance.
   */
  setServiceUrl(serviceUrl: string): HttpClient<P> {
    if (serviceUrl == null) {
      throw new Error('Missing service URL');
    }
    this.#serviceUrl = serviceUrl;
    return this;
  }
  
  /**
   * Sets an endpoint function, it will be filled with the params on each request.
   * 
   * @param endpointFn
   * A function that accepts parameters and returns an string as endpoint.
   * @returns
   * This instance.
   */
  setEndpoint(endpointFn: HttpEndpointFunction<P>): HttpClient<P> {
    if (endpointFn == null || !(endpointFn instanceof Function)) {
      throw new Error('Invalid endpoint');
    }
    this.#endpointFn = endpointFn;
    return this;
  }

  /**
   * Sets an authorization to be sent on the HTTP request headers.
   * 
   * @param authorization
   * An authroization header value.
   * @returns
   * This instance.
   */
  setAuthorization(authorization: string): HttpClient<P> {
    if (authorization == null) {
      throw new Error('Missing authorization');
    }
    this.#headers['authorization'] = authorization;
    return this;
  }

  /**
   * Sets a basic authorization to be sent on the HTTP request headers.
   * 
   * @param token
   * The suffix after "Basic".
   * @returns
   * This instance.
   */
  setBasicAuth(token: string): HttpClient<P> {
    if (token == null) {
      throw new Error('Missing basic authorization');
    }
    return this.setAuthorization('Basic ' + token);
  }

  /**
   * Sets a bearer authorization to be sent on the HTTP request headers.
   * 
   * @param token
   * The suffix after "Bearer".
   * @returns
   * This instance.
   */
  setBearerAuth(token: string): HttpClient<P> {
    if (token == null) {
      throw new Error('Missing bearer authorization');
    }
    return this.setAuthorization('Bearer ' + token);
  }

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
  setBasicAuthCredentials(username: string, password: string): HttpClient<P> {
    if (username == null || password == null) {
      throw new Error('Missing username or password');
    }
    return this.setBasicAuth(btoa(username + ':' + password));
  }

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
  setParams(params: P, replace = false): HttpClient<P> {
    if (replace) {
      this.#params = params;
    } else {
      Object.assign(this.#params, params);
    }
    
    return this;
  }

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
  setQuery(query: Q, replace: boolean = false): HttpClient<P> {
    if (replace) {
      this.#query = query;
    } else {
      Object.assign(this.#query, query);
    }
    return this;
  }

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
  setHeaders(headers: Dictionary, replace: boolean = false): HttpClient<P> {
    if (replace) {
      this.#headers = headers;
    } else {
      Object.assign(this.#headers, headers);
    }
    
    return this;
  }

  /**
   * A signal to abort all the HTTP requests generated by this instance.
   *
   * @param signal
   * An abort signal.
   * @returns
   * This instance.
   */
  setSignal(signal: AbortSignal): HttpClient<P> {
    this.#signal = signal;
    return this;
  }

  /**
   * A function that intercepts the response content, it can alters the
   * content at HttpClientResponseResult.
   * 
   * @param contentInterceptorFn
   * A function to intercept the response content.
   * @returns
   * This instance.
   */
  setContentInterceptor(contentInterceptorFn: Function): HttpClient<P> {
    if (!(contentInterceptorFn instanceof Function)) {
      throw new TypeError('A function type is expected on setContentInterceptor');
    }
    this.#contentInterceptorFn = contentInterceptorFn;
    return this;
  }

  /**
   * Generates a URL with all instance settings and the the given params and
   * query.
   * 
   * @param params
   * An object to be parsed into URL params.
   * @param query
   * An object to be parsed into a query string.
   * @returns
   * An URL as an string.
   * @private
   */
  private _buildUrl<
    QE extends Q,
  >(params: Partial<P> = {}, query: Partial<QE> = {}): string {
    const serviceUrl = this.#serviceUrl || window.location.origin;
    const endpoint = this.#endpointFn({ ...this.#params, ...params });
    const url = new URL(endpoint, serviceUrl);
    fillSearchParams(query || {}, url.searchParams);
    return url.toString();
  }

  /**
   * Performs a fetch call using all instance settings.
   * 
   * @param method
   * An HTTP method: GET, PUT, POST, DELETE.
   * @param settings
   * Settings to override the general settings.
   * @returns
   * A response object with the parsed content.
   * @throws {HttpClientResponseError}
   * The status code must be 2xx.
   * @private
   */
  async fetch<
    QE extends Q,
    BE extends B,
  >(method: string, {
    params,
    query = {},
    headers = {},
    body,
    signal,
  }: HttpClientSettingsWithBody<Partial<P>, QE, BE>): Promise<HttpClientResponseResult<P>> {

    // Building request settings.
    const allHeaders = createHeaders({ ...this.#headers, ...headers });
    const serializedBody = JSON.stringify(body);
    const requestInit: RequestInit = {
      method,
      headers: new Headers(allHeaders),
      body: serializedBody,
      credentials: this.#credentials,
      signal: this.#signal || signal,
    };
    const url = this._buildUrl<QE>(params, query);

    // Performing request.
    const response = await fetch(url, requestInit);

    // Building response result.
    const result: HttpClientResponseAnyResult<P> = {
      ...await parseResponseContent<P>(requestInit, response, this.#endpointFn),
      endpointFn: this.#endpointFn,
    };
    if (!response.ok) {
      throw new HttpClientResponseError(result);
    }
    if (this.#contentInterceptorFn) {
      return transformResultContent<P>(result, this.#contentInterceptorFn);
    }
    return result;
  }

  /**
   * Performs a GET request.
   * 
   * @param settings
   * Settings to override the general settings.
   * @returns
   * A response object with the parsed content.
   */
  get<
    QE extends Q,
  >({ params, query, headers, signal }: HttpClientSettings<P, QE> = {}): Promise<HttpClientResponseResult<P>> {
    return this.fetch('GET', { params, query, headers, signal });
  }

  /**
   * Performs a POST request.
   * 
   * @param settings
   * Settings to override the general settings.
   * @returns
   * A response object with the parsed content.
   */
  post<
    QE extends Q,
    BE extends B,
  >({ params, query, body, headers, signal }: HttpClientSettingsWithBody<P, QE, BE> = {}): Promise<HttpClientResponseResult<P>> {
    return this.fetch('POST', { params, query, body, headers, signal });
  }

  /**
   * Performs a PUT request.
   * 
   * @param settings
   * Settings to override the general settings.
   * @returns
   * A response object with the parsed content.
   */
  put<
    QE extends Q,
    BE extends B,
  >({ params, query, body, headers, signal }: HttpClientSettingsWithBody<P, QE, BE> = {} = {}): Promise<HttpClientResponseResult<P>> {
    return this.fetch('PUT', { params, query, body, headers, signal });
  }

  /**
   * Performs a DELETE request.
   * 
   * @param settings
   * Settings to override the general settings.
   * @returns
   * A response object with the parsed content.
   */
  del<
    QE extends Q,
  >({ params, query, headers, signal }: HttpClientSettings<P, QE> = {} = {}): Promise<HttpClientResponseResult<P>> {
    return this.fetch('DELETE', { params, query, headers, signal });
  }
}

/**
 * Fills a search param object with the given query object properties.
 * If some property values is an Array the it will be repeted.
 * 
 * @param query
 * An object to be parsed into a query string.
 * @param searchParams
 * A search prams instance to fill, if not exist then a new instance will be created.
 * @returns
 * A filled search params instance.
 */
function fillSearchParams(query: Dictionary, searchParams: URLSearchParams = new URLSearchParams()): URLSearchParams {
  for (const key in query) {
    const value = query[key];
    if (Array.isArray(value)) {
      value.forEach(subvalue => searchParams.append(key, subvalue));
    } else if (value) {
      searchParams.append(key, value.toString());
    }
  }
  return searchParams;
}

/**
 * Evaluates if a given string is JSON content type.
 * 
 * @param contentType
 * A content type header.
 * @returns
 * True if the content type is json, JSON otherwise.
 */
function isJsonContentType(contentType: string | null = ''): boolean {
  return Boolean(contentType && contentType.match(/application\/(.*)(\+)?json$/i));
}

/**
 * Evaluates if a given string is XML content type.
 * 
 * @param contentType
 * A content type header.
 * @returns
 * True if the content type is XML, false otherwise.
 */
function isXmlContentType(contentType: string | null = ''): boolean {
  return Boolean(contentType && contentType.match(/application\/(.*)(\+)?xml$/i));
}

/**
 * Evaluates if a given string is text content type.
 * 
 * @param contentType
 * A content type header.
 * @returns
 * True if the content type is text, false otherwise.
 */
function isTextContentType(contentType: string | null = ''): boolean {
  return contentType && contentType.startsWith('text/') || Boolean(contentType && contentType.match(/(text|application|image)\/(.*)(\+)?xml$/i));;
}

/**
 * Parses the content of aresponse based on the content type.
 * 
 * @param requestInit
 * The request settings.
 * @param response
 * A Fetch API response to parse it's content.
 * @returns
 * The parsed response.
 */
async function parseResponseContent<
  P extends Dictionary,
>(requestInit: RequestInit, response: Response, endpointFn: HttpEndpointFunction<P>): Promise<HttpClientResponseAnyResult<P>> {
  const status = response.status;
  const mimeType = response.headers.get('content-type') || 'text/plain';
  let type: 'JSON'|'XML'|'TEXT'|'BLOB';
  let rawContent;
  if (isJsonContentType(mimeType)) {
    rawContent = await response.json();
    type = 'JSON';
  } else if (isXmlContentType(mimeType)) {
    const parser = new DOMParser();
    rawContent = await response.text();
    rawContent = parser.parseFromString(rawContent, 'text/xml');
    type = 'XML';
  } else if (isTextContentType(mimeType)) {
    rawContent = await response.text();
    type = 'TEXT';
  } else  {
    rawContent = await response.blob();
    type = 'BLOB';
  }
  return {
    type,
    method: requestInit.method || 'GET',
    rawContent,
    content: rawContent,
    response,
    status,
    mimeType,
    endpointFn,
  }
}

/**
 * Transforms the result content according with the interception function.
 * If the error has a bypass property set to true then that error will be
 * thrown instead HttpContentInterceptionError.
 * 
 * @param result
 * A result instance to be mutated.
 * @returns
 * A transformed result.
 * @private
 */
function transformResultContent<
  P extends Dictionary,
>(result: HttpClientResponseResult<P>, contentInterceptorFn: Function): HttpClientResponseResult<P> {
  try {
    return {
      ...result,
      content: contentInterceptorFn(result),
    };
  } catch (error) {
    if (Object.prototype.hasOwnProperty.call(error, BYPASS_HTTP_CONTENT_INTERCEPTION_ERROR)) {
      throw error;
    }
    throw new HttpContentInterceptionError(result, error);
  }
}

/**
 * Creates a Headers isntance from a dictionary.
 * 
 * @param dictionary
 * A dictionary of values.
 * @returns
 * A Headers instance.
 */
function createHeaders(dictionary: Dictionary): Headers {
  const headers = new Headers();
  for (const key in dictionary) {
    const value = dictionary[key];
    if (value) {
      headers.append(key, value.toString());
    }
  }
  return headers;
}
