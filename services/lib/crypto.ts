import * as crypto from 'crypto';
import {config} from "./config";

const PEPPER = Buffer.from(config.auth.pepper, 'hex');

function pepper(password: string): Buffer {
	return Buffer.concat([Buffer.from(password), PEPPER]);
}

async function hashScrypt8192_8_11(password: string, salt: Buffer): Promise<Buffer> {
	return new Promise((resolve, reject) =>
		crypto.scrypt(
			pepper(password),
			salt,
			64,
			{ N: process.env.TEST_ENV ? parseInt(process.env.TEST_ENV, 10) : 8192, r: 8, p: 11 } as crypto.ScryptOptions,
			(err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve(res);
				}
			},
		),
	);
}

// eslint-disable-next-line @typescript-eslint/naming-convention
async function verifyScrypt8192_8_11(realHash: Buffer, password: string, salt: Buffer): Promise<boolean> {
	const ownHash = await hashScrypt8192_8_11(password, salt);
	return crypto.timingSafeEqual(ownHash, realHash);
}

export async function hash(password: string) {
	const salt = crypto.randomBytes(16);
	const myHash = (await hashScrypt8192_8_11(password, salt)).toString('hex');
	return {
		algorithm: 'scrypt_8192_8_11',
		hash: myHash,
		salt: salt.toString('hex'),
	};
}

export async function checkHash(myHash: { algorithm: string, hash: string, salt: string }, password: string): Promise<boolean> {
	if (myHash.algorithm === 'scrypt_8192_8_11') {
		return verifyScrypt8192_8_11(Buffer.from(myHash.hash, 'hex'), password, Buffer.from(myHash.salt, 'hex'));
	}
	return false;
}

export function createRandomString(size = 32): Promise<string> {
	return new Promise((resolve, reject) => {
		crypto.randomBytes(size, (error, buffer) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(buffer.toString('hex').toLowerCase());
		});
	});
}

export async function hashSha256(input: string): Promise<string> {
	const sum = crypto.createHash('sha256');
	sum.update(input);
	return sum.digest('hex');
}

export function hashHMAC(intercomSecret: string, id: string) {
	const sum = crypto.createHmac('sha256', intercomSecret);
	sum.update(id);
	return sum.digest('hex');
}

export function getRandomBytes(numOfBytes: number) {
	return crypto.randomBytes(numOfBytes);
}
