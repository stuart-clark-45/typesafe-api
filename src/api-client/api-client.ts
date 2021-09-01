import { RequireExactlyOne } from 'type-fest';
import { ReqOptions } from '../endpoint';
import { AxiosRequestConfig } from 'axios';

export type ApiClientParams<DefaultReqOpt extends ReqOptions> = RequireExactlyOne<{
  baseUrl: string;
  parent: AbstractApiClient<DefaultReqOpt>;
}> & {
  defaultReqOptions: DefaultReqOpt;
  defaultAxiosConfig?: AxiosRequestConfig;
};

export abstract class AbstractApiClient<T extends ReqOptions> {
  constructor(private params: ApiClientParams<T>) {}

  public getBaseUrl(): string {
    const { parent, baseUrl } = this.params;
    return parent?.getBaseUrl() || baseUrl;
  }

  public getDefaultReqOptions(): T {
    return this.params.defaultReqOptions;
  }

  public getDefaultAxiosConfig(): AxiosRequestConfig {
    return this.params.defaultAxiosConfig ?? {};
  }

  public getChildParams(): ApiClientParams<T> {
    return {
      parent: this,
      defaultReqOptions: this.params.defaultReqOptions,
      defaultAxiosConfig: this.params.defaultAxiosConfig,
    };
  }
}
