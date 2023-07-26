import type { ServiceSchema } from "moleculer";
import type { DbServiceSettings } from "moleculer-db";
import MongooseMixin from "../../mixins/mongoose.mixin";
import {config} from "../lib/config";
import {TaskModel} from "./tasks.db";
import {Context} from "moleculer";

interface TaskSettings extends DbServiceSettings {}

const TasksService: ServiceSchema<TaskSettings> = {
	name: "tasks",
	authorization: true,
	authenticate: true,
	mixins: [MongooseMixin(TaskModel)],
	mongoUri: config.mongo.uri,
	hooks: {},
	actions: {
		create: {
			rest: "POST /",
			params: {
				title: { type: "string", required: true },
				description: { type: "string", required: true }
			},
			async handler(ctx: Context<any, any>) {
				const userId = ctx.meta.user.id;
				return this._create({ ...ctx.params, userId })
			}
		},
		get: {
			rest: "GET /",
			async handler(ctx: Context<any, any>) {
				const userId = ctx.meta.user.id;
				const user = await this.broker.call('users.get', { id: userId });
				const tasks = await this._find({ userId })
				return { user, tasks }
			}
		},
		delete: {
			rest: "DELETE /:id",
			params: {
				id: { type: "string", required: true }
			},
			async handler(ctx: Context<any, any>) {
				const _id = ctx.params.id;
				const userId = ctx.meta.user.id;

				return this._remove({ _id, userId })
			}
		}
	},
	methods: {},
};

export default TasksService;
