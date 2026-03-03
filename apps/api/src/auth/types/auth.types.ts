import { AccountType } from '@repo/types';
import { Request as ExpressRequest } from 'express';

/**
 * this is what is returned whenever a user's information has been validated,
 * meaning the password or email matches what we have in the database
 */
export type ValidUser = {
  id: string;
  ref: string;
  email: string;
  name: string;
  type: AccountType;
};

/**
 * this is what is returned in the user object when a user has been signed in, meaning a jwt token has been generated
 * and the user's sign in information has been recorded
 */
export type SigninResponseUser = {
  id: string;
  ref_id: string;
  display_name: string;
  avatar: string | undefined;
  email: string;
  type: AccountType;
  created_at: Date;
  is_email_verified: boolean;
};

/**
 * this is what is returned back to the user after a successful signin
 */
export type SigninResponse = {
  token: string;
  refresh: string;
  user: SigninResponseUser;
  expires: Date;
};

/**
 * this is the content of what is passed inside the express request user
 */
export type ReqValidUser = ValidUser & {
  token: string;
};

/**
 * this is an adjustment to the request body of the standard HTTP request, it
 * adds the user information,
 * This is passed inside the http request whenever a user goes through an endpoint
 * that is secured using jwt and has been validated as successful.
 *
 * The user is extracted from the jwt token passed in the request body headers and
 * the user is added inside the request body and forwarded to the next method/function
 * on the pipeline
 */
export type ReqExpress = ExpressRequest & {
  user: ReqValidUser;
};
