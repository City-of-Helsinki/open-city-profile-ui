const EMAIL_API_URL = 'http://api.guerrillamail.com/ajax.php';

type Email = {
  mail_id: string;
  mail_from: string;
  mail_subject: string;
  mail_excerpt: string;
  mail_timestamp: number;
  mail_read: 0 | 1;
  mail_date: string;
};

type CheckEmailResponse = {
  list: Email[];
  count: number;
  email: string;
  ts: number;
  s_active: 'Y' | 'N';
  s_date: string;
  s_time: number;
  s_time_expires: number;
};

export class Mailbox {
  emailAddress: string;
  mailId: string;
  sidToken: string;
  validationCode: string;

  constructor() {
    this.emailAddress = '';
    this.mailId = '';
    this.sidToken = '';
    this.validationCode = '';
  }

  async initializeMailbox() {
    const response = await fetch(`${EMAIL_API_URL}?f=get_email_address`);
    if (!response.ok) {
      throw new Error('Failed to get email address');
    }
    const { email_addr, sid_token } = await response.json();

    this.emailAddress = email_addr;
    this.sidToken = sid_token;
  }

  async waitForEmailFromSender() {
    let emailReceived = false;

    while (!emailReceived) {
      const response = await fetch(
        `${EMAIL_API_URL}?f=check_email&seq=0&sid_token=${this.sidToken}`
      );
      if (!response.ok) {
        throw new Error('Failed to check email');
      }
      const mailList: CheckEmailResponse = await response.json();

      const mailFromSender = mailList.list?.find(
        m => m.mail_from === 'noreply@hel.fi'
      );

      if (mailFromSender) {
        this.mailId = mailFromSender.mail_id;
        emailReceived = true;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async fetchEmailBody() {
    const response = await fetch(
      `${EMAIL_API_URL}?f=fetch_email&sid_token=${this.sidToken}&email_id=${this.mailId}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch email');
    }
    const { mail_body } = await response.json();
    return mail_body;
  }

  async getValidationCode() {
    const emailBody = await this.fetchEmailBody();
    const match = emailBody.match(/<b>(\d+)<\/b>/);

    if (match) {
      this.validationCode = match[1];
    }
    return this.validationCode;
  }
}
