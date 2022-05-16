import { ReqOptions } from '../endpoint';

export type ApiClientParams<DefaultReqOpt extends ReqOptions> = {
  baseUrl?: string;
  parent?: AbstractApiClient<DefaultReqOpt>;
};

export abstract class AbstractApiClient<T extends ReqOptions> {
  constructor(private params: ApiClientParams<T>) {}

  public getBaseUrl(): string {
    const { parent, baseUrl } = this.params;
    return parent?.getBaseUrl() || baseUrl;
  }

  public async getDefaultReqOptions(): Promise<T> {
    const parent = this.params.parent;
    if (!parent) {
      throw Error('getDefaultReqOptions(..) must be overridden if client has no parent');
    }
    return parent.getDefaultReqOptions();
  }

  public getChildParams(): ApiClientParams<T> {
    return {
      parent: this,
    };
  }
}
