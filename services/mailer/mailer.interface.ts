interface ISMTPConfig {
	from: string;
	host: string;
	port: number;
	secure: boolean;
	auth: any;

	send?: boolean;
	preview?: boolean;
}

interface IServiceConfig {
	from: string;
	service: string;
	auth: any;

	send?: boolean;
	preview?: boolean;
}

export interface IAttachment {
	filename: string;
	content: any;
}

export type MailConfig = ISMTPConfig | IServiceConfig;

interface IBaseMail {
	from?: string;
	to: string | string[];
	cc?: string | string[];
	attachments?: IAttachment[];
}

export interface ITextEmail extends IBaseMail {
	subject: string;
	text: string;
}

export interface IHtmlEmail extends IBaseMail {
	subject: string;
	html: string;
	text?: string;
}

export interface ITemplateEmail extends IBaseMail {
	template: string;
	data: any;
	text?: string;
}

export type Mail = ITextEmail | IHtmlEmail | ITemplateEmail;
