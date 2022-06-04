import BlaiseIapNodeProvider from "blaise-iap-node-provider";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export type toStartDate = {
    tostartdate: string
}

export class BimsApi {
    private readonly bimsApiUrl: string;
    private authProvider: BlaiseIapNodeProvider;
    private httpClient: AxiosInstance;

    constructor(bimsApiUrl: string, bimsClientId: string) {
        this.bimsApiUrl = bimsApiUrl;

        this.httpClient = axios.create();
        this.authProvider = new BlaiseIapNodeProvider(bimsClientId);
    }

    async getStartDate(questionnaireName: string): Promise<toStartDate | undefined> {
        const url = `/tostartdate/${questionnaireName}`;

        const response = await this.get(url);
        if (response.status === 404) {
            return undefined;
        }
        if (response.status !== 200) {
            throw new Error(`Error getting start date for questionnaire: ${questionnaireName}`);
        }
        return response.data;
    }

    async deleteStartDate(questionnaireName: string): Promise<void> {
        const url = `/tostartdate/${questionnaireName}`;

        const response = await this.delete(url);
        if (response.status !== 204) {
            throw `Could not delete TO Start date for: ${questionnaireName}`;
        }
    }

    async createStartDate(questionnaireName: string, startDate: string): Promise<toStartDate> {
        const url = `/tostartdate/${questionnaireName}`;

        const response = await this.post(url, { tostartdate: startDate });
        return response.data;
    }

    async updateStartDate(questionnaireName: string, startDate: string): Promise<toStartDate> {
        const url = `/tostartdate/${questionnaireName}`;

        const response = await this.patch(url, { tostartdate: startDate });
        return response.data;
    }

    private url(url: string): string {
        if (!url.startsWith("/")) {
            url = `/${url}`;
        }
        return url;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected async get(url: string): Promise<AxiosResponse> {
        const config = await this.axiosConfig();
        config.validateStatus = (statusCode: number) => {
            return [200, 404].includes(statusCode);
        };
        const response = await this.httpClient.get(`${this.bimsApiUrl}${this.url(url)}`, config);
        return response;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    protected async post(url: string, data: any): Promise<AxiosResponse> {
        const config = await this.axiosConfig();
        const response = await this.httpClient.post(`${this.bimsApiUrl}${this.url(url)}`, data, config);
        return response;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected async delete(url: string): Promise<AxiosResponse> {
        const config = await this.axiosConfig();
        const response = await this.httpClient.delete(`${this.bimsApiUrl}${this.url(url)}`, config);
        return response;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected async patch(url: string, data: any | undefined = undefined): Promise<AxiosResponse> {
        const config = await this.axiosConfig();
        console.log(`${this.bimsApiUrl}${this.url(url)}`);
        const response = await this.httpClient.patch(`${this.bimsApiUrl}${this.url(url)}`, data, config);
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
