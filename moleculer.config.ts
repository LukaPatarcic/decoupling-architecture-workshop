import type { BrokerOptions } from "moleculer";
import { Errors } from "moleculer";
import {config} from "./services/lib/config";

const brokerConfig: BrokerOptions = {
	namespace: "",
	nodeID: null,
	metadata: {},
	logger: config.logger,
	logLevel: "info",

	// Define transporter.
	// More info: https://moleculer.services/docs/0.14/networking.html
	// Note: During the development, you don't need to define it because all services will be loaded locally.
	// In production you can set it via `TRANSPORTER=nats://localhost:4222` environment variable.
	transporter: null, // "NATS"
    cacher: {
		type: "Redis",
		options: {
			redis: {
				host: config.redis.host,
				port: config.redis.port,
			},
		}

	},
	serializer: "JSON",
	requestTimeout: 10 * 1000,
	retryPolicy: {
		enabled: false,
		retries: 5,
		delay: 100,
		maxDelay: 1000,
		factor: 2,
		check: (err: Error) =>
			err && err instanceof Errors.MoleculerRetryableError && !!err.retryable,
	},
	maxCallLevel: 100,
	heartbeatInterval: 10,
	heartbeatTimeout: 30,
	contextParamsCloning: false,
	tracking: {
		enabled: false,
		shutdownTimeout: 5000,
	},
	disableBalancer: false,
	registry: {
		strategy: "RoundRobin",
		preferLocal: true,
	},
	circuitBreaker: {
		enabled: false,
		threshold: 0.5,
		minRequestCount: 20,
		windowTime: 60,
		halfOpenTime: 10 * 1000,
		check: (err: Error) => err && err instanceof Errors.MoleculerError && err.code >= 500,
	},

	bulkhead: {
		enabled: false,
		concurrency: 10,
		maxQueueSize: 100,
	},
	validator: true,
	errorHandler: null,
	metrics: {
		enabled: false,
		reporter: {
			type: "",
		},
	},
	tracing: {
		enabled: false,
		exporter: {
			type: "",
		},
	},
	middlewares: [],
	replCommands: null,
};

export = brokerConfig;
