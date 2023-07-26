import type { Context, Service, ServiceSchema } from "moleculer";
import {Errors} from "moleculer";
import {HttpStatus} from "../services/lib/http";
import mongoose, {Model} from "mongoose";
import {ErrorType} from "../services/lib/error";

export type DbServiceMethods = {
	seedDb?(): Promise<void>;
};

export type DbServiceThis = Service & DbServiceMethods;

export default function createDbServiceMixin(mongooseModel: ReturnType<any>) {
	const cacheCleanEventName = `cache.clean.${mongooseModel.name}`;

	const schema: ServiceSchema = {
		name: '',
		model: mongooseModel,

		created() {
			if (!this.schema.model) {
				throw new Errors.MoleculerError('Insightful db mixin requires model', HttpStatus.InternalServerError);
			}

			this.model = this.schema.model;

			this._connect();
		},

		async started() {
			await this.model.createCollection();
		},

		stopped() {
			return this._disconnect();
		},
		events: {
			async [cacheCleanEventName](this: DbServiceThis) {
				if (this.broker.cacher) {
					await this.broker.cacher.clean(`${this.fullName}.*`);
				}
			},
		},

		methods: {
			transform(object: any) {
				object = Object.assign({ id: object._id }, object);
				object.createdAt = new Date(object.createdAt).getTime();
				object.updatedAt = new Date(object.updatedAt).getTime();
				object.modelName = this.model.modelName;

				delete object._id;
				delete object.__v;

				return object;
			},

			async entityChanged(type: string, json: unknown, ctx: Context): Promise<void> {
				await ctx.broadcast(cacheCleanEventName);
			},

			onModelIndexError(error: any) {
				if (error) {
					this.logger.error('model on index error', {
						modelName: this.model.modelName,
						error,
					});
				}
			},

			async _connect() {
				if (mongoose.connection.readyState === 2 || mongoose.connection.readyState === 1) {
					return mongoose.connection;
				}
				const result = await mongoose.connect(this.schema.mongoUri, {});

				this.logger.info('MongooseMixin: connected successfully.');

				result.connection.on('disconnected', () => this.logger.warn('MongooseMixin: connection disconnected.'));

				result.connection.on('error', (error:any) => this.logger.error('MongooseMixin: connection error.', { error }));

				result.connection.on('reconnect', () => this.logger.info('MongooseMixin: reconnected successfully.'));

				this.model.on('index', this.onModelIndexError);

				return result.connection;
			},

			async _disconnect() {
				if (mongoose.connection.readyState === 2 || mongoose.connection.readyState === 1) {
					this.model.off('index', this.onModelIndexError);
					await mongoose.connection.close();
				}
			},

			async _startSession() {
				return mongoose.startSession();
			},

			async _create(docs: any | any[], options?: any) {
				if (Array.isArray(docs)) {
					docs.forEach((one) => {
						delete one.createdAt;
						delete one.updatedAt;
					});
				} else {
					delete docs.createdAt;
					delete docs.updatedAt;
				}

				const result: any = await this.model.create(docs, options).catch((error: any) => {
					if (error.code === 11000) {
						throw new Errors.MoleculerError(
							`Duplicated ${this.model.modelName.toLowerCase()}.`,
							HttpStatus.Conflict,
							ErrorType.EntitiyConflict,
						);
					}

					if (error.name === 'ValidationError') {
						this.logger.error('ValidationError', {
							error,
							docs,
						});
					}

					throw error;
				});

				if (Array.isArray(result)) {
					return result.map((one) => this.transform(one.toJSON()));
				}
				return this.transform(result.toJSON());
			},

			async _find(filter?: any, limit?: number, sort?: any, select?: any, options?: any) {
				const query = (<Model<any>>this.model).find(filter, options);

				if (sort) {
					query.sort({ [sort.sortBy]: sort.sortOrder, _id: sort.sortOrder });
				}

				if (select) {
					query.select(select);
				}

				if (limit) {
					query.limit(limit);
				}

				const result: any[] = await query.lean();
				return result.map((one) => this.transform(one));
			},

			async _findCursor(batchSize: number, filter?: any, options?: any) {
				return this.model.find(filter, options).cursor({ batchSize });
			},

			async _findBatch(batchSize: number, filter?: any, options?: any) {
				return this.getBatchedIterable(await this._findCursor(batchSize, filter, options), batchSize);
			},

			async *getBatchedIterable<T>(cursor: { next(): Promise<T> }, batchSize: number): AsyncIterableIterator<T[]> {
				let batch: T[] = [];
				let hasNext = false;
				do {
					const item = await cursor.next();
					hasNext = !!item;
					if (hasNext) {
						batch.push(item);
					}

					if (batch.length === batchSize) {
						yield batch;
						batch = [];
					}
				} while (hasNext);

				if (batch.length) {
					yield batch;
				}
			},

			async _get(filter: any, options?: any) {
				const values = Object.values(filter).filter((value: any) => {
					return value !== null && value !== undefined;
				});

				if (!values.length) {
					throw new Errors.MoleculerError(
						`Filter for getting ${this.model.modelName} is invalid.`,
						HttpStatus.Conflict,
						ErrorType.EntitiyConflict,
					);
				}

				const result: any = await this.model.findOne(filter, options).lean();
				if (!result) {
					throw new Errors.MoleculerError(`${this.model.modelName} doesn't exist.`, HttpStatus.NotFound, ErrorType.EntityNotFound, filter);
				}
				return this.transform(result);
			},

			async _update(filter: any, update: any, options?: any) {
				delete update.createdAt;
				delete update.updatedAt;

				if (options) {
					options.new = true;
				} else {
					options = { new: true };
				}

				let result: any;
				try {
					result = await this.model.findOneAndUpdate(filter, update, options).lean();
				} catch (error) {
					if (error.code === 11000) {
						throw new Errors.MoleculerError(
							`Duplicated ${this.model.modelName.toLowerCase()}.`,
							HttpStatus.Conflict,
							ErrorType.EntitiyConflict,
						);
					}
				}

				if (!result) {
					throw new Errors.MoleculerError(`${this.model.modelName} doesn't exist.`, HttpStatus.NotFound, ErrorType.EntityNotFound, filter);
				}

				return this.transform(result);
			},

			async _count(filter: any, limit?: number) {
				let result: number;
				if (limit) {
					result = await (<Model<any>>this.model).countDocuments(filter).limit(limit);
				} else {
					result = await (<Model<any>>this.model).countDocuments(filter);
				}

				return result;
			},

			async _updateMany(filter: any, update: any, options?: any) {
				delete update.createdAt;
				delete update.updatedAt;

				const values = Object.values(filter).filter((value: any) => {
					return value !== null && value !== undefined;
				});

				if (!values.length) {
					throw new Errors.MoleculerError(`Filter for _updateMany is invalid.`, HttpStatus.Conflict, ErrorType.EntitiyConflict);
				}
				const res = await this.model.updateMany(filter, update, options).lean();
				if (res.ok !== 1) {
					throw new Errors.MoleculerError(`Something went wrong`, HttpStatus.NotFound, ErrorType.EntityNotFound);
				}
				return {
					count: res.nModified,
				};
			},

			async _updateManyForeign(name: string, filter: any, update: any, options?: any) {
				delete update.createdAt;
				delete update.updatedAt;
				return mongoose.connection.db.collection(name).updateMany(filter, update, options);
			},

			async _remove(filter: any, options?: any) {
				const result = await this.model.findOneAndDelete(filter, options).lean();
				if (!result) {
					throw new Errors.MoleculerError(`${this.model.modelName} doesn't exist.`, HttpStatus.NotFound, ErrorType.EntityNotFound, filter);
				}

				return this.transform(result);
			},
		},
		actions: {
			create: {
				handler(ctx: Context<any>) {
					return this._create(ctx.params);
				},
			},

			find: {
				handler(ctx: Context<any>) {
					return this._find(ctx.params.filter, ctx.params.limit, ctx.params.sort, ctx.params.select, ctx.params.options);
				},
			},

			get: {
				handler(ctx: Context<any>) {
					return this._get(ctx.params.filter);
				},
			},

			remove: {
				handler(ctx: Context<any>) {
					return this._remove(ctx.params.filter);
				},
			},
			count: {
				handler(ctx: Context<any>) {
					return this._count(ctx.params.filter, ctx.params.limit);
				},
			},
		},
	};

	return schema;
}
