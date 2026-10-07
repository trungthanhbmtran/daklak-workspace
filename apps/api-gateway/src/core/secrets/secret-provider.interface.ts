export interface SecretProvider {
  getSecret(ref: string): Promise<string | null>;
}
