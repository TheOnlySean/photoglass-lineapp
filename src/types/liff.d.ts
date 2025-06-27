declare module '@line/liff' {
  export interface Profile {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
  }

  export interface Liff {
    init(config: { liffId: string; withLoginOnExternalBrowser?: boolean }): Promise<void>;
    isInClient(): boolean;
    isLoggedIn(): boolean;
    login(): void;
    logout(): void;
    getProfile(): Promise<Profile>;
    closeWindow(): void;
    shareTargetPicker(
      messages: Array<{
        type: string;
        text?: string;
        originalContentUrl?: string;
        previewImageUrl?: string;
      }>
    ): Promise<void>;
    openWindow(params: { url: string; external?: boolean }): void;
  }

  const liff: Liff;
  export default liff;
} 