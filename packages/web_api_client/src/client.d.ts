declare class ApiClient {
    private baseUrl;
    constructor();
    private request;
    get<T>(endpoint: string): Promise<T>;
    post<T>(endpoint: string, body: unknown): Promise<T>;
    put<T>(endpoint: string, body: unknown): Promise<T>;
    delete<T>(endpoint: string): Promise<T>;
}
export declare const apiClient: ApiClient;
export {};
//# sourceMappingURL=client.d.ts.map