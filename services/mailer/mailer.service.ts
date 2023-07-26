import nodemailer from 'nodemailer';
import Mailgun from 'nodemailer-mailgun-transport';
import { Context, ServiceSchema } from 'moleculer';
import {config} from "../lib/config";
import {Mail} from "./mailer.interface";

const mailService: ServiceSchema = {
	name: 'mail',

	created() {
		this.mailer = nodemailer.createTransport(
			Mailgun({
				auth: config.mail.auth,
			}),
		);
	},

	hooks: {
		before: {},
		after: {},
	},

	methods: {
		sendText(mail) {
			// return this.mailer.sendMail({ ...mail, from: config.mail.from});
			return 'email sent';
		},
		sendHtml(mail) {
			// return this.mailer.sendMail({ ...mail, from: config.mail.from });
			return 'email sent';
		},
	},

	actions: {
		send: {
			async handler(ctx: Context<Mail>) {
				try {
					const mail = ctx.params;
					if ('html' in mail) {
						this.sendHtml(mail);
					}
					this.sendText(mail);
				} catch (err) {
					this.logger.error(err);
				}
			},
		},
	},
};

export default mailService;
