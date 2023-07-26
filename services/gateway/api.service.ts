import type { Context, ServiceSchema } from "moleculer";
import type { ApiSettingsSchema, IncomingRequest, Route } from "moleculer-web";
import ApiGateway from "moleculer-web";
import * as jwt from 'jsonwebtoken';
import {config} from "../lib/config";
import {JwtPayload} from "jsonwebtoken";

interface Meta {
	userAgent?: string | null | undefined;
	user?: object | null | undefined;
}

const ApiService: ServiceSchema<ApiSettingsSchema> = {
	name: "api",
	mixins: [ApiGateway],
	settings: {
		port: process.env.PORT != null ? Number(process.env.PORT) : 3000,
		ip: "0.0.0.0",
		use: [],
		routes: [
			{
				path: "/api",
				whitelist: ["**"],
				use: [],
				mergeParams: true,
				authentication: true,
				authorization: true,
				autoAliases: true,
				aliases: {},
				bodyParsers: {
					json: {
						strict: false,
						limit: "1MB",
					},
					urlencoded: {
						extended: true,
						limit: "1MB",
					},
				},
				mappingPolicy: "all",
				logging: true,
			},
		],
		log4XXResponses: false,
		logRequestParams: null,
		logResponseData: null,
		assets: {
			folder: "public",
			options: {},
		},
	},

	methods: {
		authenticate(
			ctx: Context,
			route: Route,
			req: IncomingRequest,
		): Record<string, unknown> | null {
			const auth = req.headers.authorization;

			if (auth && auth.startsWith("Bearer")) {
				try {
					const token = auth.slice(7);
					const user = jwt.verify(token, config.auth.secret) as JwtPayload;
					return { id: user.userId }
				} catch (err) {
					throw new ApiGateway.Errors.UnAuthorizedError(
						ApiGateway.Errors.ERR_INVALID_TOKEN,
						null,
					);
				}
			} else {
				throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_NO_TOKEN, null);
			}
		},
		authorize(ctx: Context<null, Meta>, route: Route, req: IncomingRequest) {
			const { user } = ctx.meta;
			if (req.$action.auth === "required" && !user) {
				throw new ApiGateway.Errors.UnAuthorizedError("NO_RIGHTS", null);
			}
		},
	},
};

export default ApiService;
