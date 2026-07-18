import { INVITATION_TYPE, TInvitationTarget } from '@linkedapi/node';

export function buildInvitationTarget(
  invitationType: string,
  url: string,
): TInvitationTarget & Record<string, unknown> {
  switch (invitationType) {
    case INVITATION_TYPE.connect:
      return { invitationType, personUrl: url };
    case INVITATION_TYPE.companyFollow:
      return { invitationType, companyUrl: url };
    case INVITATION_TYPE.newsletterSubscribe:
      return { invitationType, newsletterUrl: url };
    default:
      throw new Error(`Unsupported invitation type: ${invitationType}`);
  }
}
