import * as HTTP from '../../src';

interface GroupUsersParams extends HTTP.Dictionary {
  groupId: number;
  userId: number;
}

interface GroupUsersQuery extends HTTP.Dictionary {
  limit: number;
  skip: number;
}

interface User {
  id: number;
  name: string;
}

interface GroupUsersPayload {
  users: User[];
  skip: number;
  limit: number;
}

const content: GroupUsersPayload = {
  users: [{
    id: 1,
    name: 'John Doe',
  }],
  skip: 1,
  limit: 1,
};

export class GroupUsersHttpClient extends HTTP.HttpClientDecorator {

  async get<GroupUsersPayload>(settings: HTTP.HttpClientSettings<GroupUsersParams, GroupUsersQuery>): Promise<HTTP.HttpClientResponseResult<GroupUsersPayload, GroupUsersParams>> {
    const result = await this.base.get(settings);
    if (result.type === 'JSON') {
      const WTF: GroupUsersPayload = {
        users: [{
          id: 1,
          name: 'John Doe',
        }],
        skip: 1,
        limit: 1,
      };
      return {
        endpointFn: result.endpointFn,
        method: result.method,
        mimeType: result.mimeType,
        response: result.response,
        status: result.status,
        content: null,
      };
    }
    throw new Error('Can\'t parse result');
  }

  async post<GroupUsersPayload>(settings: HTTP.HttpClientSettingsWithBody<GroupUsersParams, GroupUsersQuery>): Promise<HTTP.HttpClientResponseResult<GroupUsersPayload, GroupUsersParams>> {
    return this.base.get(settings);
  }

  async put<GroupUsersPayload>(settings: HTTP.HttpClientSettingsWithBody<GroupUsersParams, GroupUsersQuery>): Promise<HTTP.HttpClientResponseResult<GroupUsersPayload, GroupUsersParams>> {
    return this.base.get(settings);
  }

  async del<GroupUsersPayload>(settings: HTTP.HttpClientSettings<GroupUsersParams, GroupUsersQuery>): Promise<HTTP.HttpClientResponseResult<GroupUsersPayload, GroupUsersParams>> {
    return this.base.get(settings);
  }
}
