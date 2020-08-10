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

export class GroupUsersHttpClient extends HTTP.HttpClientDecorator {

  get<GroupUsersPayload>(settings: HTTP.HttpClientSettings<GroupUsersParams, GroupUsersQuery>): Promise<HTTP.HttpClientResponseResult<GroupUsersPayload, GroupUsersParams>> {
    return this.base.get(settings);
  }

  post<GroupUsersPayload>(settings: HTTP.HttpClientSettingsWithBody<GroupUsersParams, GroupUsersQuery>): Promise<HTTP.HttpClientResponseResult<GroupUsersPayload, GroupUsersParams>> {
    return this.base.get(settings);
  }

  put<GroupUsersPayload>(settings: HTTP.HttpClientSettingsWithBody<GroupUsersParams, GroupUsersQuery>): Promise<HTTP.HttpClientResponseResult<GroupUsersPayload, GroupUsersParams>> {
    return this.base.get(settings);
  }

  del<GroupUsersPayload>(settings: HTTP.HttpClientSettings<GroupUsersParams, GroupUsersQuery>): Promise<HTTP.HttpClientResponseResult<GroupUsersPayload, GroupUsersParams>> {
    return this.base.get(settings);
  }
}
