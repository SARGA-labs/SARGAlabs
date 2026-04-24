/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions from "../actions.js";
import type * as activities from "../activities.js";
import type * as auth from "../auth.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_passwords from "../lib/passwords.js";
import type * as linkPreview from "../linkPreview.js";
import type * as moodboards from "../moodboards.js";
import type * as projects from "../projects.js";
import type * as research from "../research.js";
import type * as users from "../users.js";
import type * as webauthn from "../webauthn.js";
import type * as webauthnHelpers from "../webauthnHelpers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  activities: typeof activities;
  auth: typeof auth;
  "lib/auth": typeof lib_auth;
  "lib/passwords": typeof lib_passwords;
  linkPreview: typeof linkPreview;
  moodboards: typeof moodboards;
  projects: typeof projects;
  research: typeof research;
  users: typeof users;
  webauthn: typeof webauthn;
  webauthnHelpers: typeof webauthnHelpers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
