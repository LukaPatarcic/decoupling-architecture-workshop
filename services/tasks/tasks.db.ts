import { prop, modelOptions, getModelForClass, Severity, index } from '@typegoose/typegoose';
import nanoid from '../lib/nanoid'
@index({ title: 1 }, {})
@modelOptions({ schemaOptions: { timestamps: true }, options: { allowMixed: Severity.ALLOW } })
class Task {
  @prop({ default: nanoid })
  public _id: string;
  public id: string;
  public createdAt: number;

  @prop({ required: true })
  public title: string;

  @prop({ required: true })
  public description: string;

  @prop({ required: true })
  public userId: string;

}

export const TaskModel = getModelForClass(Task);
