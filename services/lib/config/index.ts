import path from "path";
import fs from "fs";
import yaml from 'js-yaml';

function loadFromDirectory(dir: string) {
	const env = process.env.APP_ENV || 'LOCAL';
	const location = path.join(dir, `${env.toLowerCase()}.yml`);

	return yaml.load(fs.readFileSync(location, 'utf8'));
}

function loadFromEnv(config: any): unknown {
	for (const key in config) {
		if (config[key] instanceof Object) {
			loadFromEnv(config[key]);
		} else if (typeof config[key] === 'string' && config[key][0] === '$') {
			const name = config[key].substr(1);
			config[key] = process.env[name];
		}
	}
	return config;
}

export function load(name: string, port?: number) {
	let base: any = loadFromDirectory(path.join(__dirname, './env'));
	console.log(base);
	base.app = {
		name,
		port,
	};
	base = loadFromEnv(base);

	if (base.mongo && base.mongo.user && base.mongo.password) {
		base.mongo.uri = base.mongo.uri.replace('user:password', `${base.mongo.user}:${base.mongo.password}`);
	}

	return base;
}

export const config = load('app')
