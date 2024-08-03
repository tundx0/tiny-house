/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type LogInInput = {
  code: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  logIn: Viewer;
  logOut: Viewer;
};


export type MutationLogInArgs = {
  input?: InputMaybe<LogInInput>;
};

export type Query = {
  __typename?: 'Query';
  authUrl: Scalars['String']['output'];
};

export type Viewer = {
  __typename?: 'Viewer';
  avatar?: Maybe<Scalars['String']['output']>;
  didRequest: Scalars['Boolean']['output'];
  hasWallet?: Maybe<Scalars['Boolean']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  token?: Maybe<Scalars['String']['output']>;
};
