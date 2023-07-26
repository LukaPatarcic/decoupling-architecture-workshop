import * as jwt from 'jsonwebtoken';

import ApiService from 'moleculer-web';
import { Errors } from 'moleculer';
import {config} from "./config";
import {HttpStatus} from "./http";

export class Jwt {
	public static decode(token: string) {
		try {
			return jwt.decode(token, { complete: true }) as any;
		} catch (error) {
			throw new ApiService.Errors.UnAuthorizedError(ApiService.Errors.ERR_INVALID_TOKEN, {});
		}
	}

	public static issueToken(body: object, expiresIn: number | string) {
		return jwt.sign(body, config.auth.secret, {
			expiresIn,
			issuer: config.env,
			audience: [config.env],
		});
	}

	public static verifyLoginToken(token: string) {
		try {
			return this.jwtVerify(token);
		} catch (e) {
			if (e?.error?.name === 'TokenExpiredError') {
				throw new Errors.MoleculerError('Your token has expired!', HttpStatus.Unauthorized);
			} else {
				throw new ApiService.Errors.UnAuthorizedError(ApiService.Errors.ERR_INVALID_TOKEN, {});
			}
		}
	}

	public static verifyResetPasswordToken(token: string) {
		try {
			const tokenData = this.jwtVerify(token);
			return tokenData;
		} catch (error) {
			throw new ApiService.Errors.UnAuthorizedError(ApiService.Errors.ERR_INVALID_TOKEN, {});
		}
	}

	public static jwtVerify(token: string, ignoreExpiration = false) {
		try {
			return jwt.verify(token, config.auth.secret, {
				audience: config.env,
				ignoreExpiration,
			}) as any;
		} catch (error) {
			throw new ApiService.Errors.UnAuthorizedError(ApiService.Errors.ERR_INVALID_TOKEN, {
				error,
			});
		}
	}

	public static getNowSeconds() {
		return Math.round(Date.now() / 1000);
	}

	public static checkTokenExpiration(token: string) {
		const identity = this.jwtVerify(token, true);
		const { exp } = identity;
		const nowSeconds = this.getNowSeconds();
		if (exp <= nowSeconds) {
			throw new ApiService.Errors.UnAuthorizedError(ApiService.Errors.ERR_INVALID_TOKEN, {});
		}
		return identity;
	}

	public static verifyAuthToken(token: string) {
		return this.checkTokenExpiration(token);
	}
}
