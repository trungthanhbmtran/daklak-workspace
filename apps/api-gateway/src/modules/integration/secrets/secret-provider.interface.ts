export interface SecretProvider {
  getSecret(secretRef: string): Promise<string | null>;
}
