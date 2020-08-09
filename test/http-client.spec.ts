import fetchMock from 'jest-fetch-mock';
import { endpoint, HttpEndpointFunction, HttpClient, Dictionary } from '../src';

fetchMock.enableMocks();

xdescribe('HttpClient', () => {

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('get', () => {

    it('should lock the state when it is passed to the reduce sub-method', async () => {

      interface GroupUserParams extends Dictionary {
        groupId: number;
        userId: number;
      }

      interface GroupUserQuery extends Dictionary {
        from: number;
        to: number;
      }

      const serviceUrl: string = 'https://www.example.com';

      const endpointFn: HttpEndpointFunction<GroupUserParams> = ({ groupId, userId }) => {
        return endpoint`/api/group/${groupId}/user/${userId}`;
      }
  
      const client = new HttpClient<GroupUserParams, GroupUserQuery>({ serviceUrl, endpointFn });

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
