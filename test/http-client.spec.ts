import fetchMock from 'jest-fetch-mock';
import * as HTTP from '../src';

fetchMock.enableMocks();

xdescribe('HttpClient', () => {

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('get', () => {

    it('should lock the state when it is passed to the reduce sub-method', async () => {

      interface GroupUserParams extends HTTP.Dictionary {
        groupId: number;
        userId: number;
      }

      interface GroupUserQuery extends HTTP.Dictionary {
        from: number;
        to: number;
      }

      const serviceUrl: string = 'https://www.example.com';

      const endpointFn: HTTP.HttpEndpointFunction<GroupUserParams> = ({ groupId, userId }) => {
        return HTTP.endpoint`/api/group/${groupId}/user/${userId}`;
      }
  
      const client = new HTTP.HttpClientBase<GroupUserParams, GroupUserQuery>({ serviceUrl, endpointFn });

      const result = await client.get({
        params: {
          groupId: 4,
          userId: 7,
        },
        query: {
          from: 5,
          to: 25,
        }
      });
      console.log(result);
    });
  });
});
