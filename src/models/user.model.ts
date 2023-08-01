/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  id: { type:Number , required:true,unique:true},
  firstName: String,
  lastName: String,
  email: {type:String , required:[true,"Please provide email"], unique:[true,"This email is used."]},
  userName: { type:String , required:[true,"Please provide username"], unique:[true,"This username is used."]},
  password: { type:String , required:[true,"Please provide password"]},
  isVerified: {type:Boolean, default:false},
})

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
  isVerified: boolean;
}
