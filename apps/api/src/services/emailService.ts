// Placeholder for email sending logic
export async function sendVerificationEmail(email: string, link: string) {
  // TODO: Integrate with real email provider
  // For now, just log
  // eslint-disable-next-line no-console
  console.log(`Send verification email to ${email}: ${link}`);
}

export async function sendPasswordResetEmail(email: string, link: string) {
  // TODO: Integrate with real email provider
  // eslint-disable-next-line no-console
  console.log(`Send password reset email to ${email}: ${link}`);
}
