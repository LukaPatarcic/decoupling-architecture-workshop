import { Context, Errors } from 'moleculer';
import type { ServiceSchema } from "moleculer";
import type { DbServiceSettings } from "moleculer-db";
import MongooseMixin from "../../mixins/mongoose.mixin";
import {HttpStatus} from "../lib/http";
import * as crypto from '../lib/crypto';
import {Jwt} from "../lib/jwt";
import {UserModel} from "./users.db";
import {config} from "../lib/config";

interface TaskSettings extends DbServiceSettings {}

const UsersService: ServiceSchema<TaskSettings> = {
	name: "users",
	mixins: [MongooseMixin(UserModel)],
	mongoUri: config.mongo.uri,
	hooks: {
		after: {
			register: async (ctx: Context, res) => {
				 ctx.broker.call('mail.send', {
					to: res.email,
					subject: "Welcome",
					text: "Welcome to our awesome decoupled app"
				})

				return res;
			}
		}
	},
	actions: {
		login: {
			rest: "POST /login",
			params: {
				email: { type: "email", required: true },
				password: { type: "string", required: true }
			},
			async handler(ctx: Context<any>) {
				try {
					const user = await this._get({ email: ctx.params.email });
					// Verify password
					if (!(await crypto.checkHash(user.password, ctx.params.password))) {
						throw new Errors.MoleculerError('Invalid credentials!', HttpStatus.Unauthorized);
					}

					const token = Jwt.issueToken({ userId: user.id }, '1days')
					return { token };
				} catch (error) {
					this.logger.error('Trying to get account', { error });
					throw new Errors.MoleculerError('Invalid credentials!', HttpStatus.Unauthorized);
				}


			},
		},

		register: {
			rest: "POST /register",
			params: {
				email: { type: "email", required: true },
				password: { type: "string", required: true }
			},
			async handler(ctx: Context<{ email: string, password: string}>) {
				const { email, password } = ctx.params;
				const hashedPassword = await crypto.hash(password);
				const user = { email, password: hashedPassword };

				const newUser = await this._create(user);
				return { id: newUser.id, email: newUser.email };
			},
		},
		get: {
			params: {
				id: { type: "string", required: true }
			},
			async handler(ctx: Context<{ id: string }>) {
				const user = await this._get({ _id: ctx.params.id });
				delete user.password;
				return user;
			}
		}
	},
	methods: {

	},
};
export default UsersService
