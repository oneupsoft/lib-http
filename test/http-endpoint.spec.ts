import { endpoint, InvalidHttpEndpointParameterError, InvalidHttpEndpointParameterType } from '../src/http-endpoint';

describe('http-endpoint', () => {

  describe('endpoint', () => {

    it('should return a well-formed string when all the interpolated values are entered', () => {

      const actualN = endpoint`/api/groups/${1}/users/${0}`;
      const actualS = endpoint`/api/groups/${'gr1'}/users/${'u1'}`;
      const actualB = endpoint`/api/groups/${true}/users/${false}`;
      const actualT = endpoint`/api/groups/${{ toString() { return 'gr2' } }}/users/${{ toString() { return 'u2' } }}`;

      expect(actualN).toBe('/api/groups/1/users/0');
      expect(actualS).toBe('/api/groups/gr1/users/u1');
      expect(actualB).toBe('/api/groups/true/users/false');
      expect(actualT).toBe('/api/groups/gr2/users/u2');
    });

    it('should throw an InvalidHttpEndpointParameterError when any of the interpolated values is undefined', () => {

      const actualFn = () => endpoint`/api/groups/${undefined}/users/${undefined}`;

      expect(actualFn).toThrowError(InvalidHttpEndpointParameterError);

      let parameterType: InvalidHttpEndpointParameterType|null = null;

      try {
        actualFn();
      } catch (error) {
        if (error instanceof InvalidHttpEndpointParameterError) {
          parameterType = error.parameterType;
        }
      }

      expect(parameterType).toBe(InvalidHttpEndpointParameterType.Undefined);
    });

    it('should throw an InvalidHttpEndpointParameterError when any of the interpolated values is null', () => {

      const actualFn = () => endpoint`/api/groups/${null}/users/${null}`;

      expect(actualFn).toThrowError(InvalidHttpEndpointParameterError);

      let parameterType: InvalidHttpEndpointParameterType|null = null;

      try {
        actualFn();
      } catch (error) {
        if (error instanceof InvalidHttpEndpointParameterError) {
          parameterType = error.parameterType;
        }
      }

      expect(parameterType).toBe(InvalidHttpEndpointParameterType.Null);
    });

    it('should throw an InvalidHttpEndpointParameterError when any of the interpolated values is empty string', () => {

      const actualFn = () => endpoint`/api/groups/${''}/users/${''}`;

      expect(actualFn).toThrowError(InvalidHttpEndpointParameterError);

      let parameterType: InvalidHttpEndpointParameterType|null = null;

      try {
        actualFn();
      } catch (error) {
        if (error instanceof InvalidHttpEndpointParameterError) {
          parameterType = error.parameterType;
        }
      }

      expect(parameterType).toBe(InvalidHttpEndpointParameterType.EmptyString);
    });

    it('should throw an InvalidHttpEndpointParameterError when any of the interpolated values doesn\'t have toString', () => {

      const actualFn = () => endpoint`/api/groups/${{}}/users/${{}}`;

      expect(actualFn).toThrowError(InvalidHttpEndpointParameterError);

      let parameterType: InvalidHttpEndpointParameterType|null = null;

      try {
        actualFn();
      } catch (error) {
        if (error instanceof InvalidHttpEndpointParameterError) {
          parameterType = error.parameterType;
        }
      }

      expect(parameterType).toBe(InvalidHttpEndpointParameterType.MissingToString);
    });
  });
});
