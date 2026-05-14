import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { IapProvider } from "blaise-iap-node-provider";

export type ToStartDate = {
  tostartdate: string;
};

export type TmReleaseDate = {
  tmreleasedate: string;
};

export class BimsClient {
  private readonly bimsApiUrl: string;
  private authProvider: IapProvider;
  private httpClient: AxiosInstance;

  constructor(bimsApiUrl: string, bimsClientId: string) {
    this.bimsApiUrl = bimsApiUrl;

    this.httpClient = axios.create();
    this.authProvider = new IapProvider(bimsClientId);
  }

  async getToStartDate(questionnaireName: string): Promise<ToStartDate | undefined> {
    const url = `/tostartdate/${questionnaireName}`;

    const response = await this.get(url);

    if (response.status === 404 || response.status === 204) {
      return undefined;
    }

    if (response.status !== 200) {
      throw new Error(
        `Error getting Telephone Operations start date for questionnaire: ${questionnaireName}`,
      );
    }

    return response.data;
  }

  async deleteToStartDate(questionnaireName: string): Promise<void> {
    const url = `/tostartdate/${questionnaireName}`;

    const response = await this.delete(url);

    if (response.status !== 204) {
      throw new Error(`Could not delete Telephone Operations start date for: ${questionnaireName}`);
    }
  }

  async createToStartDate(questionnaireName: string, toStartDate: string): Promise<ToStartDate> {
    const url = `/tostartdate/${questionnaireName}`;

    const response = await this.post(url, { tostartdate: toStartDate });

    return response.data;
  }

  async updateToStartDate(questionnaireName: string, toStartDate: string): Promise<ToStartDate> {
    const url = `/tostartdate/${questionnaireName}`;

    const response = await this.patch(url, { tostartdate: toStartDate });

    return response.data;
  }

  async getTmReleaseDate(questionnaireName: string): Promise<TmReleaseDate | undefined> {
    const url = `/tmreleasedate/${questionnaireName}`;

    const response = await this.get(url);

    if (response.status === 404 || response.status === 204) {
      return undefined;
    }

    if (response.status !== 200) {
      throw new Error(`Error getting Totalmobile release date for questionnaire: ${questionnaireName}`);
    }

    return response.data;
  }

  async deleteTmReleaseDate(questionnaireName: string): Promise<void> {
    const url = `/tmreleasedate/${questionnaireName}`;

    const response = await this.delete(url);

    if (response.status !== 204) {
      throw new Error(`Could not delete Totalmobile release date for: ${questionnaireName}`);
    }
  }

  async createTmReleaseDate(
    questionnaireName: string,
    tmReleaseDate: string,
  ): Promise<TmReleaseDate> {
    const url = `/tmreleasedate/${questionnaireName}`;

    const response = await this.post(url, { tmreleasedate: tmReleaseDate });

    return response.data;
  }

  async updateTmReleaseDate(
    questionnaireName: string,
    tmReleaseDate: string,
  ): Promise<TmReleaseDate> {
    const url = `/tmreleasedate/${questionnaireName}`;

    const response = await this.patch(url, { tmreleasedate: tmReleaseDate });

    return response.data;
  }

  private url(url: string): string {
    if (!url.startsWith("/")) {
      url = `/${url}`;
    }

    return url;
  }

  protected async get(url: string): Promise<AxiosResponse> {
    const config = await this.axiosConfig();

    config.validateStatus = (statusCode: number) => {
      return [200, 204, 404].includes(statusCode);
    };

    const response = await this.httpClient.get(`${this.bimsApiUrl}${this.url(url)}`, config);

    return response;
  }

  protected async post(url: string, data: unknown): Promise<AxiosResponse> {
    const config = await this.axiosConfig();
    const response = await this.httpClient.post(`${this.bimsApiUrl}${this.url(url)}`, data, config);

    return response;
  }

  protected async delete(url: string): Promise<AxiosResponse> {
    const config = await this.axiosConfig();
    const response = await this.httpClient.delete(`${this.bimsApiUrl}${this.url(url)}`, config);

    return response;
  }

  protected async patch(
    url: string,
    data: unknown | undefined = undefined,
  ): Promise<AxiosResponse> {
    const config = await this.axiosConfig();
    const response = await this.httpClient.patch(
      `${this.bimsApiUrl}${this.url(url)}`,
      data,
      config,
    );

    return response;
  }

  private async axiosConfig(): Promise<AxiosRequestConfig> {
    let config = {};

    if (this.authProvider) {
      config = { headers: await this.authProvider.getAuthHeader() };
    }

    return config;
  }
}
