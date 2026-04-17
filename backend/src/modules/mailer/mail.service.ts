import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface InviteEmailParams {
  to: string;
  organizationName: string;
  roleName: string;
  inviteToken: string;
  teamName?: string;
}

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly inviteBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') || 'AOP Platform <noreply@aop.local>';
    this.inviteBaseUrl =
      this.configService.get<string>('INVITE_BASE_URL') || 'http://localhost:3000/invite';

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    this.resend = new Resend(apiKey);
  }

  async sendInviteEmail({
    to,
    organizationName,
    roleName,
    inviteToken,
    teamName,
  }: InviteEmailParams) {
    const inviteUrl = `${this.inviteBaseUrl}?token=${inviteToken}`;
    const roleLabel = roleName.replace(/_/g, ' ');

    const subject = `You're invited to ${organizationName}`;
    const teamLine = teamName ? `<p>Team: <strong>${teamName}</strong></p>` : '';

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2>You're invited to ${organizationName}</h2>
        <p>You've been invited to join the AOP Platform as <strong>${roleLabel}</strong>.</p>
        ${teamLine}
        <p>Click the button below to set your password and activate your account.</p>
        <p style="margin:24px 0;">
          <a href="${inviteUrl}" style="background:#111;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;">
            Accept invite
          </a>
        </p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${inviteUrl}">${inviteUrl}</a></p>
        <p style="font-size:12px;color:#666;">This invite expires in 7 days.</p>
      </div>
    `;

    await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject,
      html,
    });
  }
}
