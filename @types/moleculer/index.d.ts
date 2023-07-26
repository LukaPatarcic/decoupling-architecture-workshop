import {
	Context,
	GenericObject,
	LoggerInstance, Service,
	ServiceActions, ServiceActionsSchema,
	ServiceBroker, ServiceEvents,
	ServiceSchema,
	ServiceSettingSchema, Span
} from "moleculer";

declare module 'moleculer' {

  declare namespace Moleculer {
	  class Service<S = ServiceSettingSchema> implements ServiceSchema {
		  constructor(broker: ServiceBroker, schema?: ServiceSchema<S>);

		  protected parseServiceSchema(schema: ServiceSchema<S>): void;

		  name: string;
		  fullName: string;
		  version?: string | number;
		  settings: S;
		  metadata: GenericObject;
		  dependencies: string | GenericObject | Array<string> | Array<GenericObject>;
		  schema: ServiceSchema<S>;
		  broker: ServiceBroker;
		  logger: LoggerInstance;
		  actions: ServiceActions;
		  Promise: PromiseConstructorLike;
		  currentContext: Context | null;

		  _init(): void;
		  _start(): PromiseLike<void>;
		  _stop(): PromiseLike<void>;

		  waitForServices(serviceNames: string | Array<string> | Array<GenericObject>, timeout?: number, interval?: number): PromiseLike<void>;

		  [name: string]: any;

		  static applyMixins(schema: ServiceSchema): ServiceSchema;
		  static mergeSchemas(mixinSchema: ServiceSchema, svcSchema: ServiceSchema): ServiceSchema;
		  static mergeSchemaSettings(src: GenericObject, target: GenericObject): GenericObject;
		  static mergeSchemaMetadata(src: GenericObject, target: GenericObject): GenericObject;
		  static mergeSchemaMixins(src: GenericObject, target: GenericObject): GenericObject;
		  static mergeSchemaDependencies(src: GenericObject, target: GenericObject): GenericObject;
		  static mergeSchemaHooks(src: GenericObject, target: GenericObject): GenericObject;
		  static mergeSchemaActions(src: GenericObject, target: GenericObject): GenericObject;
		  static mergeSchemaMethods(src: GenericObject, target: GenericObject): GenericObject;
		  static mergeSchemaEvents(src: GenericObject, target: GenericObject): GenericObject;
		  static mergeSchemaLifecycleHandlers(src: GenericObject, target: GenericObject): GenericObject;
		  static mergeSchemaUnknown(src: GenericObject, target: GenericObject): GenericObject;
	  }
	  interface ServiceSchema<S = ServiceSettingSchema> {
		  name: string;
		  version?: string | number;
		  settings?: S;
		  dependencies?: string | GenericObject | Array<string> | Array<GenericObject>;
		  metadata?: GenericObject;
		  actions?: ServiceActionsSchema;
		  mixins?: Array<ServiceSchema>;
		  methods?: ServiceMethods;

		  events?: ServiceEvents;
		  created?: (() => void) | Array<() => void>;
		  started?: (() => PromiseLike<void>) | Array<() => PromiseLike<void>>;
		  stopped?: (() => PromiseLike<void>) | Array<() => PromiseLike<void>>;

		  [name: string]: any;
	  }

	  type ServiceMethods = { [key: string]: (...args: any[]) => any } & ThisType<Service>;

  }

  export = Moleculer;
}
