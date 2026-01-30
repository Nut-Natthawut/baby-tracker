type InviteEmailInput = {
  to: string;
  inviteLink: string;
  inviterName: string;
  babyName: string;
};

const DEFAULT_FROM = "Baby Tracker <onboarding@resend.dev>";

export async function sendInviteEmail(apiKey: string, input: InviteEmailInput) {
  const payload = {
    from: DEFAULT_FROM,
    to: [input.to],
    subject: `${input.inviterName} invited you to share ${input.babyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>You're invited to Baby Tracker</h2>
        <p>${input.inviterName} invited you to collaborate on <strong>${input.babyName}</strong>.</p>
        <p>
          <a href="${input.inviteLink}" style="display:inline-block;padding:12px 18px;background:#f97316;color:white;text-decoration:none;border-radius:8px;">
            Accept invite
          </a>
        </p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend error: ${response.status} ${text}`);
  }
}
