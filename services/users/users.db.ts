import { prop, modelOptions, getModelForClass, Severity, index } from '@typegoose/typegoose';
import nanoid from "../lib/nanoid";

@modelOptions({ schemaOptions: { timestamps: true }, options: { allowMixed: Severity.ALLOW } })
class User {
  @prop({ default: nanoid })
  public _id: string;
  public id: string;
  public createdAt: number;

  @prop({ required: true, unique: true })
  public email: string;

  @prop()
  public password: { algorithm: string, hash: string, salt: string };
}

export const UserModel = getModelForClass(User);
