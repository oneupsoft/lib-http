import { Dictionary } from './http-common';

/**
 * A function that returns a generated endpoint by the given parameters.
 */
export type HttpEndpointFunction<P extends Dictionary> = (params: Partial<P>) => string

/**
 * A enumeration of the possible invalid endpoint parameter cases.
 */
export enum InvalidHttpEndpointParameterType {
  Undefined = 'UNDEFINED',
  Null = 'NULL',
  EmptyString = 'EMPTY_STRING',
  MissingToString = 'MISSING_TO_STRING',
}

/**
 * An error for invalid parameter types.
 */
export class InvalidHttpEndpointParameterError extends Error {

  /** The invalid endpoint parameter case type. */
  readonly parameterType: InvalidHttpEndpointParameterType;

  /**
   * Constructs an error instance with the given parameter type.
   *
   * @param parameterType
   * A parameter case type to assign.
   */
  constructor(parameterType: InvalidHttpEndpointParameterType) {
    super('All endpoint parameters must be fulfilled.');
    Object.assign(this, {
      name: 'InvalidHttpEndpointParameterError',
      parameterType,
    });
  }
}

/**
 * Check if all the parameters are valid, if they are not then will throw an error.
 * 
 * @param strings
 * The template string chunks.
 * @param  values
 * The values to interpolate.
 * @returns
 * A built endpoint.
 * @throws {InvalidHttpEndpointParameterError}
 * When a given parameter is invalid:
 *   - Undefined parameters.
 *   - Null parameters.
 *   - Empty string parameters.
 *   - Object parameters that doen't have overrided toString.
 */
export function endpoint(strings: TemplateStringsArray, ...values: any): string {
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const parameterType: InvalidHttpEndpointParameterType|null =
      (value === undefined)
        ? InvalidHttpEndpointParameterType.Undefined
        : (value === null)
          ? InvalidHttpEndpointParameterType.Null
          : (value === '')
            ? InvalidHttpEndpointParameterType.EmptyString
            : (value instanceof Object && value.toString === Object.prototype.toString)
              ? InvalidHttpEndpointParameterType.MissingToString
              : null;
      
    if (parameterType) {
      throw new InvalidHttpEndpointParameterError(parameterType);
    }
    result += value.toString() + strings[i + 1];
  }
  return result;
}
