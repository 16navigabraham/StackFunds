// Helper functions for WebAuthn credential creation
export function generateChallenge(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function encodeAttestation(credential: PublicKeyCredential): string {
  const response = credential.response as AuthenticatorAttestationResponse;
  return JSON.stringify({
    credentialId: arrayBufferToBase64(credential.rawId),
    clientDataJSON: arrayBufferToBase64(response.clientDataJSON),
    attestationObject: arrayBufferToBase64(response.attestationObject),
  });
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}