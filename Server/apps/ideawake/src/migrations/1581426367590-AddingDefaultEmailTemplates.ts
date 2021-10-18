import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddingDefaultEmailTemplates1581426367590
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const queryResetPassTemplate = `INSERT INTO public.email_template(
          is_deleted, name, subject, body, description, sender_name, sender_email)
          VALUES (false, 'resetPassword', 'Password Reset Email', '<div id="wrapper">
          <table border="0" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;font-family: "Open Sans", sans-serif;font-size:16px;margin:0 auto;line-height:21px; padding: 25px;">

          <tbody>
          <tr>
          <td align="left" style="padding:15px 36px 15px; border-bottom: 1px dashed #cfcfcf;">
          <img src="https://i.ibb.co/HGFxkp2/logo.png" width="106">
          </td>
          </tr>
          <tr>
          <td align="left" style="color:#455a64;padding:20px 36px 26px">
          <a href="{{resetLink}}" style="width: 312px; height: 36px; font-size:16px; line-height:36px; background:#1ab394;text-decoration:none;border-radius:4px;color:#fff;font-weight:700; text-transform: uppercase; padding:10px 20px;display:inline-block;margin-bottom:0;font-weight:normal;text-align:center;vertical-align:middle">Password Reset</a>
          </td>
          </tr>

          <tr>
          <td align="left" style="padding:25px 36px 15px; border-top: 1px dashed #cfcfcf;">
          <p style="margin: 0 0 10px; font-size: 14px; color: #707070;">Having trouble accessing <a href="#" style="color: #1ab394; text-decoration: underline;">Ideawake?</a></p>
          <p style="margin: 0; font-size: 12px; color: #707070;">Powered by Ideawake. 1245 North Water Street, Floor 2 Milwaukee WI, 53202</p>
          </td>
          </tr>

          </tbody>
          </table>
          </div>', 'Reset Password',
          'ideawake', 'noreply@ideawake.com');`;
    await queryRunner.query(queryResetPassTemplate);

    const querySendInviteTemplate = `INSERT INTO public.email_template(
        is_deleted, name, subject, body, description, sender_name, sender_email)
        VALUES (false, 'sendInvite', 'Ivnitation Email', '<div id="wrapper">
              <table border="0" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;font-family: "Open Sans", sans-serif;font-size:16px;margin:0 auto;line-height:21px; padding: 25px;">

                <tbody>
                  <tr>
                    <td align="left" style="padding:15px 36px 15px; border-bottom: 1px dashed #cfcfcf;">
                      <img src="https://i.ibb.co/HGFxkp2/logo.png" width="106">
                    </td>
                  </tr>

                  <tr>
                    <td align="left" style="color:#455a64;padding:20px 36px 15px">
                      <h1 style="line-height:28px;font-size:24px; margin: 0; color: #1ab394;font-weight: 400; font-family: "Montserrat", sans-serif;">You"ve been invited to<br /> innovate with OSF Trailblazer </h1>
                    </td>
                  </tr>

                  <tr>
                    <td align="left" style="color:#455a64;padding:10px 36px 15px">
                      <p style="margin: 0;">Dear Staging test Team Member,<br /> We believe you have great ideas and that those ideas have the potential to transform the future of health care. </p>
                    </td>
                  </tr>

                  <tr>
                    <td align="left" style="color:#455a64;padding:15px 23px 15px">
                      <img src="https://i.ibb.co/59gjBwN/idea-img.png" width="100%" style="display: block;">
                    </td>
                  </tr>

                  <tr>
                    <td align="left" style="color:#455a64;padding:20px 36px 15px">
                      <p style="margin: 0;">That’s why we’re inviting you to participate in our Inaugural OSF Trailblazer Challenge. We’re asking you to help solve for the following complex issue that leaders have identified as a challenge for OSF HealthCare.</p>
                    </td>
                  </tr>

                  <tr>
                    <td align="left" style="color:#455a64;padding:20px 36px 15px">
                      <p style="margin: 0;">"How might we enable and support individuals in their homes and communities to lead healthy lives?"</p>
                    </td>
                  </tr>

                  <tr>
                    <td align="left" style="color:#455a64;padding:20px 36px 15px">
                      <p style="margin: 0;">Form a team, brainstorm and submit your ideas at <a href="#" style="color: #1ab394; text-decoration: underline;">osfhealthcare.org/trailblazer</a> by <strong>September 17</strong>.
                          We look forward to seeing what you come up with!</p>
                    </td>
                  </tr>

                  <tr>
                    <td align="left" style="color:#455a64;padding:20px 36px 26px">
                      <a href="{{inviteLink}}" style="width: 312px; height: 36px; font-size:16px; line-height:36px; background:#1ab394;text-decoration:none;border-radius:4px;color:#fff;font-weight:700; text-transform: uppercase; padding:10px 20px;display:inline-block;margin-bottom:0;font-weight:normal;text-align:center;vertical-align:middle">Accept my Invite</a>
                    </td>
                  </tr>

                  <tr>
                    <td align="left" style="padding:25px 36px 15px; border-top: 1px dashed #cfcfcf;">
                      <p style="margin: 0 0 10px; font-size: 14px; color: #707070;">Having trouble accessing <a href="#" style="color: #1ab394; text-decoration: underline;">Ideawake?</a></p>
                      <p style="margin: 0; font-size: 12px; color: #707070;">Powered by Ideawake. 1245 North Water Street, Floor 2 Milwaukee WI, 53202</p>
                    </td>
                  </tr>

                </tbody>
              </table>
          </div>', 'Invitation',
        'ideawake', 'noreply@ideawake.com');`;
    await queryRunner.query(querySendInviteTemplate);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DELETE FROM public.email_template where name = 'resetPassword';
      `);
    await queryRunner.query(`DELETE FROM public.email_template where name = 'sendInvite';
      `);
  }
}
