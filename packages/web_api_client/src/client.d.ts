declare class ApiClient {
    private baseUrl;
    constructor();
    private request;
    get<T>(endpoint: string, headers?: Record<string, string>, responseType?: 'json' | 'blob'): Promise<T>;
    post<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T>;
    put<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T>;
    delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T>;
}
export declare const apiClient: ApiClient;
export {};
//# sourceMappingURL=client.d.ts.map