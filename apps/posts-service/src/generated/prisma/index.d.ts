
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Banner
 * 
 */
export type Banner = $Result.DefaultSelection<Prisma.$BannerPayload>
/**
 * Model Category
 * 
 */
export type Category = $Result.DefaultSelection<Prisma.$CategoryPayload>
/**
 * Model Comment
 * 
 */
export type Comment = $Result.DefaultSelection<Prisma.$CommentPayload>
/**
 * Model CitizenQuestion
 * 
 */
export type CitizenQuestion = $Result.DefaultSelection<Prisma.$CitizenQuestionPayload>
/**
 * Model CitizenFeedback
 * 
 */
export type CitizenFeedback = $Result.DefaultSelection<Prisma.$CitizenFeedbackPayload>
/**
 * Model PortalConfig
 * 
 */
export type PortalConfig = $Result.DefaultSelection<Prisma.$PortalConfigPayload>
/**
 * Model PortalMenu
 * 
 */
export type PortalMenu = $Result.DefaultSelection<Prisma.$PortalMenuPayload>
/**
 * Model Post
 * 
 */
export type Post = $Result.DefaultSelection<Prisma.$PostPayload>
/**
 * Model Tag
 * 
 */
export type Tag = $Result.DefaultSelection<Prisma.$TagPayload>
/**
 * Model PostVersion
 * 
 */
export type PostVersion = $Result.DefaultSelection<Prisma.$PostVersionPayload>
/**
 * Model ModerationLog
 * 
 */
export type ModerationLog = $Result.DefaultSelection<Prisma.$ModerationLogPayload>
/**
 * Model AuditLog
 * 
 */
export type AuditLog = $Result.DefaultSelection<Prisma.$AuditLogPayload>
/**
 * Model PostTranslation
 * 
 */
export type PostTranslation = $Result.DefaultSelection<Prisma.$PostTranslationPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Banners
 * const banners = await prisma.banner.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Banners
   * const banners = await prisma.banner.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.PrismaClientConstructorArgs<ClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.banner`: Exposes CRUD operations for the **Banner** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Banners
    * const banners = await prisma.banner.findMany()
    * ```
    */
  get banner(): Prisma.BannerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.category`: Exposes CRUD operations for the **Category** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Categories
    * const categories = await prisma.category.findMany()
    * ```
    */
  get category(): Prisma.CategoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.comment`: Exposes CRUD operations for the **Comment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Comments
    * const comments = await prisma.comment.findMany()
    * ```
    */
  get comment(): Prisma.CommentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.citizenQuestion`: Exposes CRUD operations for the **CitizenQuestion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CitizenQuestions
    * const citizenQuestions = await prisma.citizenQuestion.findMany()
    * ```
    */
  get citizenQuestion(): Prisma.CitizenQuestionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.citizenFeedback`: Exposes CRUD operations for the **CitizenFeedback** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CitizenFeedbacks
    * const citizenFeedbacks = await prisma.citizenFeedback.findMany()
    * ```
    */
  get citizenFeedback(): Prisma.CitizenFeedbackDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.portalConfig`: Exposes CRUD operations for the **PortalConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PortalConfigs
    * const portalConfigs = await prisma.portalConfig.findMany()
    * ```
    */
  get portalConfig(): Prisma.PortalConfigDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.portalMenu`: Exposes CRUD operations for the **PortalMenu** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PortalMenus
    * const portalMenus = await prisma.portalMenu.findMany()
    * ```
    */
  get portalMenu(): Prisma.PortalMenuDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.post`: Exposes CRUD operations for the **Post** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Posts
    * const posts = await prisma.post.findMany()
    * ```
    */
  get post(): Prisma.PostDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tag`: Exposes CRUD operations for the **Tag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tags
    * const tags = await prisma.tag.findMany()
    * ```
    */
  get tag(): Prisma.TagDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.postVersion`: Exposes CRUD operations for the **PostVersion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PostVersions
    * const postVersions = await prisma.postVersion.findMany()
    * ```
    */
  get postVersion(): Prisma.PostVersionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.moderationLog`: Exposes CRUD operations for the **ModerationLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ModerationLogs
    * const moderationLogs = await prisma.moderationLog.findMany()
    * ```
    */
  get moderationLog(): Prisma.ModerationLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditLogs
    * const auditLogs = await prisma.auditLog.findMany()
    * ```
    */
  get auditLog(): Prisma.AuditLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.postTranslation`: Exposes CRUD operations for the **PostTranslation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PostTranslations
    * const postTranslations = await prisma.postTranslation.findMany()
    * ```
    */
  get postTranslation(): Prisma.PostTranslationDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.9.0
   * Query Engine version: e922089b7d7502aff4249d5da3420f6fa55fc6ad
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * Resolved type of the argument passed to the `PrismaClient` constructor.
   *
   * When called without a narrower options type (the common case), this resolves
   * to `PrismaClientOptions` directly, which produces a clear TypeScript error
   * message (`not assignable to parameter of type 'PrismaClientOptions'`) when
   * the argument is missing or incomplete. When the user supplies a narrower
   * options type (e.g. via a literal), it falls back to `Subset` to keep
   * filtering out unknown properties.
   */
  export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> =
    [PrismaClientOptions] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      ((Without<T, U> & U) | (Without<U, T> & T)) & object
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Banner: 'Banner',
    Category: 'Category',
    Comment: 'Comment',
    CitizenQuestion: 'CitizenQuestion',
    CitizenFeedback: 'CitizenFeedback',
    PortalConfig: 'PortalConfig',
    PortalMenu: 'PortalMenu',
    Post: 'Post',
    Tag: 'Tag',
    PostVersion: 'PostVersion',
    ModerationLog: 'ModerationLog',
    AuditLog: 'AuditLog',
    PostTranslation: 'PostTranslation'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "banner" | "category" | "comment" | "citizenQuestion" | "citizenFeedback" | "portalConfig" | "portalMenu" | "post" | "tag" | "postVersion" | "moderationLog" | "auditLog" | "postTranslation"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Banner: {
        payload: Prisma.$BannerPayload<ExtArgs>
        fields: Prisma.BannerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BannerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BannerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BannerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BannerPayload>
          }
          findFirst: {
            args: Prisma.BannerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BannerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BannerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BannerPayload>
          }
          findMany: {
            args: Prisma.BannerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BannerPayload>[]
          }
          create: {
            args: Prisma.BannerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BannerPayload>
          }
          createMany: {
            args: Prisma.BannerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.BannerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BannerPayload>
          }
          update: {
            args: Prisma.BannerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BannerPayload>
          }
          deleteMany: {
            args: Prisma.BannerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BannerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BannerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BannerPayload>
          }
          aggregate: {
            args: Prisma.BannerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBanner>
          }
          groupBy: {
            args: Prisma.BannerGroupByArgs<ExtArgs>
            result: $Utils.Optional<BannerGroupByOutputType>[]
          }
          count: {
            args: Prisma.BannerCountArgs<ExtArgs>
            result: $Utils.Optional<BannerCountAggregateOutputType> | number
          }
        }
      }
      Category: {
        payload: Prisma.$CategoryPayload<ExtArgs>
        fields: Prisma.CategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          findFirst: {
            args: Prisma.CategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          findMany: {
            args: Prisma.CategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[]
          }
          create: {
            args: Prisma.CategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          createMany: {
            args: Prisma.CategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.CategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          update: {
            args: Prisma.CategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          deleteMany: {
            args: Prisma.CategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          aggregate: {
            args: Prisma.CategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCategory>
          }
          groupBy: {
            args: Prisma.CategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<CategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.CategoryCountArgs<ExtArgs>
            result: $Utils.Optional<CategoryCountAggregateOutputType> | number
          }
        }
      }
      Comment: {
        payload: Prisma.$CommentPayload<ExtArgs>
        fields: Prisma.CommentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CommentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CommentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          findFirst: {
            args: Prisma.CommentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CommentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          findMany: {
            args: Prisma.CommentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>[]
          }
          create: {
            args: Prisma.CommentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          createMany: {
            args: Prisma.CommentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.CommentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          update: {
            args: Prisma.CommentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          deleteMany: {
            args: Prisma.CommentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CommentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CommentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          aggregate: {
            args: Prisma.CommentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateComment>
          }
          groupBy: {
            args: Prisma.CommentGroupByArgs<ExtArgs>
            result: $Utils.Optional<CommentGroupByOutputType>[]
          }
          count: {
            args: Prisma.CommentCountArgs<ExtArgs>
            result: $Utils.Optional<CommentCountAggregateOutputType> | number
          }
        }
      }
      CitizenQuestion: {
        payload: Prisma.$CitizenQuestionPayload<ExtArgs>
        fields: Prisma.CitizenQuestionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CitizenQuestionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenQuestionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CitizenQuestionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenQuestionPayload>
          }
          findFirst: {
            args: Prisma.CitizenQuestionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenQuestionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CitizenQuestionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenQuestionPayload>
          }
          findMany: {
            args: Prisma.CitizenQuestionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenQuestionPayload>[]
          }
          create: {
            args: Prisma.CitizenQuestionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenQuestionPayload>
          }
          createMany: {
            args: Prisma.CitizenQuestionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.CitizenQuestionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenQuestionPayload>
          }
          update: {
            args: Prisma.CitizenQuestionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenQuestionPayload>
          }
          deleteMany: {
            args: Prisma.CitizenQuestionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CitizenQuestionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CitizenQuestionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenQuestionPayload>
          }
          aggregate: {
            args: Prisma.CitizenQuestionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCitizenQuestion>
          }
          groupBy: {
            args: Prisma.CitizenQuestionGroupByArgs<ExtArgs>
            result: $Utils.Optional<CitizenQuestionGroupByOutputType>[]
          }
          count: {
            args: Prisma.CitizenQuestionCountArgs<ExtArgs>
            result: $Utils.Optional<CitizenQuestionCountAggregateOutputType> | number
          }
        }
      }
      CitizenFeedback: {
        payload: Prisma.$CitizenFeedbackPayload<ExtArgs>
        fields: Prisma.CitizenFeedbackFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CitizenFeedbackFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenFeedbackPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CitizenFeedbackFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenFeedbackPayload>
          }
          findFirst: {
            args: Prisma.CitizenFeedbackFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenFeedbackPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CitizenFeedbackFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenFeedbackPayload>
          }
          findMany: {
            args: Prisma.CitizenFeedbackFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenFeedbackPayload>[]
          }
          create: {
            args: Prisma.CitizenFeedbackCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenFeedbackPayload>
          }
          createMany: {
            args: Prisma.CitizenFeedbackCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.CitizenFeedbackDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenFeedbackPayload>
          }
          update: {
            args: Prisma.CitizenFeedbackUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenFeedbackPayload>
          }
          deleteMany: {
            args: Prisma.CitizenFeedbackDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CitizenFeedbackUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CitizenFeedbackUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitizenFeedbackPayload>
          }
          aggregate: {
            args: Prisma.CitizenFeedbackAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCitizenFeedback>
          }
          groupBy: {
            args: Prisma.CitizenFeedbackGroupByArgs<ExtArgs>
            result: $Utils.Optional<CitizenFeedbackGroupByOutputType>[]
          }
          count: {
            args: Prisma.CitizenFeedbackCountArgs<ExtArgs>
            result: $Utils.Optional<CitizenFeedbackCountAggregateOutputType> | number
          }
        }
      }
      PortalConfig: {
        payload: Prisma.$PortalConfigPayload<ExtArgs>
        fields: Prisma.PortalConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PortalConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PortalConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalConfigPayload>
          }
          findFirst: {
            args: Prisma.PortalConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PortalConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalConfigPayload>
          }
          findMany: {
            args: Prisma.PortalConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalConfigPayload>[]
          }
          create: {
            args: Prisma.PortalConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalConfigPayload>
          }
          createMany: {
            args: Prisma.PortalConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.PortalConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalConfigPayload>
          }
          update: {
            args: Prisma.PortalConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalConfigPayload>
          }
          deleteMany: {
            args: Prisma.PortalConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PortalConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PortalConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalConfigPayload>
          }
          aggregate: {
            args: Prisma.PortalConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePortalConfig>
          }
          groupBy: {
            args: Prisma.PortalConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<PortalConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.PortalConfigCountArgs<ExtArgs>
            result: $Utils.Optional<PortalConfigCountAggregateOutputType> | number
          }
        }
      }
      PortalMenu: {
        payload: Prisma.$PortalMenuPayload<ExtArgs>
        fields: Prisma.PortalMenuFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PortalMenuFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalMenuPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PortalMenuFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalMenuPayload>
          }
          findFirst: {
            args: Prisma.PortalMenuFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalMenuPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PortalMenuFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalMenuPayload>
          }
          findMany: {
            args: Prisma.PortalMenuFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalMenuPayload>[]
          }
          create: {
            args: Prisma.PortalMenuCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalMenuPayload>
          }
          createMany: {
            args: Prisma.PortalMenuCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.PortalMenuDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalMenuPayload>
          }
          update: {
            args: Prisma.PortalMenuUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalMenuPayload>
          }
          deleteMany: {
            args: Prisma.PortalMenuDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PortalMenuUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PortalMenuUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalMenuPayload>
          }
          aggregate: {
            args: Prisma.PortalMenuAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePortalMenu>
          }
          groupBy: {
            args: Prisma.PortalMenuGroupByArgs<ExtArgs>
            result: $Utils.Optional<PortalMenuGroupByOutputType>[]
          }
          count: {
            args: Prisma.PortalMenuCountArgs<ExtArgs>
            result: $Utils.Optional<PortalMenuCountAggregateOutputType> | number
          }
        }
      }
      Post: {
        payload: Prisma.$PostPayload<ExtArgs>
        fields: Prisma.PostFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PostFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PostFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          findFirst: {
            args: Prisma.PostFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PostFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          findMany: {
            args: Prisma.PostFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>[]
          }
          create: {
            args: Prisma.PostCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          createMany: {
            args: Prisma.PostCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.PostDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          update: {
            args: Prisma.PostUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          deleteMany: {
            args: Prisma.PostDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PostUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PostUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          aggregate: {
            args: Prisma.PostAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePost>
          }
          groupBy: {
            args: Prisma.PostGroupByArgs<ExtArgs>
            result: $Utils.Optional<PostGroupByOutputType>[]
          }
          count: {
            args: Prisma.PostCountArgs<ExtArgs>
            result: $Utils.Optional<PostCountAggregateOutputType> | number
          }
        }
      }
      Tag: {
        payload: Prisma.$TagPayload<ExtArgs>
        fields: Prisma.TagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TagFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TagFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          findFirst: {
            args: Prisma.TagFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TagFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          findMany: {
            args: Prisma.TagFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>[]
          }
          create: {
            args: Prisma.TagCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          createMany: {
            args: Prisma.TagCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.TagDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          update: {
            args: Prisma.TagUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          deleteMany: {
            args: Prisma.TagDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TagUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TagUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          aggregate: {
            args: Prisma.TagAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTag>
          }
          groupBy: {
            args: Prisma.TagGroupByArgs<ExtArgs>
            result: $Utils.Optional<TagGroupByOutputType>[]
          }
          count: {
            args: Prisma.TagCountArgs<ExtArgs>
            result: $Utils.Optional<TagCountAggregateOutputType> | number
          }
        }
      }
      PostVersion: {
        payload: Prisma.$PostVersionPayload<ExtArgs>
        fields: Prisma.PostVersionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PostVersionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostVersionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PostVersionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostVersionPayload>
          }
          findFirst: {
            args: Prisma.PostVersionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostVersionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PostVersionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostVersionPayload>
          }
          findMany: {
            args: Prisma.PostVersionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostVersionPayload>[]
          }
          create: {
            args: Prisma.PostVersionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostVersionPayload>
          }
          createMany: {
            args: Prisma.PostVersionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.PostVersionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostVersionPayload>
          }
          update: {
            args: Prisma.PostVersionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostVersionPayload>
          }
          deleteMany: {
            args: Prisma.PostVersionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PostVersionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PostVersionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostVersionPayload>
          }
          aggregate: {
            args: Prisma.PostVersionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePostVersion>
          }
          groupBy: {
            args: Prisma.PostVersionGroupByArgs<ExtArgs>
            result: $Utils.Optional<PostVersionGroupByOutputType>[]
          }
          count: {
            args: Prisma.PostVersionCountArgs<ExtArgs>
            result: $Utils.Optional<PostVersionCountAggregateOutputType> | number
          }
        }
      }
      ModerationLog: {
        payload: Prisma.$ModerationLogPayload<ExtArgs>
        fields: Prisma.ModerationLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ModerationLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModerationLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ModerationLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModerationLogPayload>
          }
          findFirst: {
            args: Prisma.ModerationLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModerationLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ModerationLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModerationLogPayload>
          }
          findMany: {
            args: Prisma.ModerationLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModerationLogPayload>[]
          }
          create: {
            args: Prisma.ModerationLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModerationLogPayload>
          }
          createMany: {
            args: Prisma.ModerationLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ModerationLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModerationLogPayload>
          }
          update: {
            args: Prisma.ModerationLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModerationLogPayload>
          }
          deleteMany: {
            args: Prisma.ModerationLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ModerationLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ModerationLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModerationLogPayload>
          }
          aggregate: {
            args: Prisma.ModerationLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateModerationLog>
          }
          groupBy: {
            args: Prisma.ModerationLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<ModerationLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.ModerationLogCountArgs<ExtArgs>
            result: $Utils.Optional<ModerationLogCountAggregateOutputType> | number
          }
        }
      }
      AuditLog: {
        payload: Prisma.$AuditLogPayload<ExtArgs>
        fields: Prisma.AuditLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          createMany: {
            args: Prisma.AuditLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditLog>
          }
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number
          }
        }
      }
      PostTranslation: {
        payload: Prisma.$PostTranslationPayload<ExtArgs>
        fields: Prisma.PostTranslationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PostTranslationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostTranslationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PostTranslationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostTranslationPayload>
          }
          findFirst: {
            args: Prisma.PostTranslationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostTranslationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PostTranslationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostTranslationPayload>
          }
          findMany: {
            args: Prisma.PostTranslationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostTranslationPayload>[]
          }
          create: {
            args: Prisma.PostTranslationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostTranslationPayload>
          }
          createMany: {
            args: Prisma.PostTranslationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.PostTranslationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostTranslationPayload>
          }
          update: {
            args: Prisma.PostTranslationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostTranslationPayload>
          }
          deleteMany: {
            args: Prisma.PostTranslationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PostTranslationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PostTranslationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostTranslationPayload>
          }
          aggregate: {
            args: Prisma.PostTranslationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePostTranslation>
          }
          groupBy: {
            args: Prisma.PostTranslationGroupByArgs<ExtArgs>
            result: $Utils.Optional<PostTranslationGroupByOutputType>[]
          }
          count: {
            args: Prisma.PostTranslationCountArgs<ExtArgs>
            result: $Utils.Optional<PostTranslationCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * A driver adapter that PrismaClient uses to connect to your database, such as the ones provided by `@prisma/adapter-pg`, `@prisma/adapter-libsql`, `@prisma/adapter-planetscale`, etc.
     * 
     * A driver adapter is **required** unless you connect to your database through Prisma Accelerate (in which case use `accelerateUrl` instead).
     * 
     * Learn more: https://pris.ly/d/driver-adapters
     * 
     * @example
     * ```ts
     * import { PrismaPg } from '@prisma/adapter-pg'
     * import { PrismaClient } from './generated/prisma/client'
     * 
     * const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
     * const prisma = new PrismaClient({ adapter })
     * ```
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * The Prisma Accelerate connection URL. Use this option to connect to your database through Prisma Accelerate instead of using a driver adapter to connect directly.
     * 
     * Learn more: https://pris.ly/d/accelerate
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    banner?: BannerOmit
    category?: CategoryOmit
    comment?: CommentOmit
    citizenQuestion?: CitizenQuestionOmit
    citizenFeedback?: CitizenFeedbackOmit
    portalConfig?: PortalConfigOmit
    portalMenu?: PortalMenuOmit
    post?: PostOmit
    tag?: TagOmit
    postVersion?: PostVersionOmit
    moderationLog?: ModerationLogOmit
    auditLog?: AuditLogOmit
    postTranslation?: PostTranslationOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CategoryCountOutputType
   */

  export type CategoryCountOutputType = {
    children: number
    posts: number
  }

  export type CategoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    children?: boolean | CategoryCountOutputTypeCountChildrenArgs
    posts?: boolean | CategoryCountOutputTypeCountPostsArgs
  }

  // Custom InputTypes
  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryCountOutputType
     */
    select?: CategoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountChildrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CategoryWhereInput
  }

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountPostsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostWhereInput
  }


  /**
   * Count Type CommentCountOutputType
   */

  export type CommentCountOutputType = {
    replies: number
  }

  export type CommentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    replies?: boolean | CommentCountOutputTypeCountRepliesArgs
  }

  // Custom InputTypes
  /**
   * CommentCountOutputType without action
   */
  export type CommentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommentCountOutputType
     */
    select?: CommentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CommentCountOutputType without action
   */
  export type CommentCountOutputTypeCountRepliesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CommentWhereInput
  }


  /**
   * Count Type PortalMenuCountOutputType
   */

  export type PortalMenuCountOutputType = {
    children: number
  }

  export type PortalMenuCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    children?: boolean | PortalMenuCountOutputTypeCountChildrenArgs
  }

  // Custom InputTypes
  /**
   * PortalMenuCountOutputType without action
   */
  export type PortalMenuCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalMenuCountOutputType
     */
    select?: PortalMenuCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PortalMenuCountOutputType without action
   */
  export type PortalMenuCountOutputTypeCountChildrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PortalMenuWhereInput
  }


  /**
   * Count Type PostCountOutputType
   */

  export type PostCountOutputType = {
    tags: number
    versions: number
    translations_rel: number
    comments: number
    moderationLogs: number
    auditLogs: number
  }

  export type PostCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tags?: boolean | PostCountOutputTypeCountTagsArgs
    versions?: boolean | PostCountOutputTypeCountVersionsArgs
    translations_rel?: boolean | PostCountOutputTypeCountTranslations_relArgs
    comments?: boolean | PostCountOutputTypeCountCommentsArgs
    moderationLogs?: boolean | PostCountOutputTypeCountModerationLogsArgs
    auditLogs?: boolean | PostCountOutputTypeCountAuditLogsArgs
  }

  // Custom InputTypes
  /**
   * PostCountOutputType without action
   */
  export type PostCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostCountOutputType
     */
    select?: PostCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PostCountOutputType without action
   */
  export type PostCountOutputTypeCountTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TagWhereInput
  }

  /**
   * PostCountOutputType without action
   */
  export type PostCountOutputTypeCountVersionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostVersionWhereInput
  }

  /**
   * PostCountOutputType without action
   */
  export type PostCountOutputTypeCountTranslations_relArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostTranslationWhereInput
  }

  /**
   * PostCountOutputType without action
   */
  export type PostCountOutputTypeCountCommentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CommentWhereInput
  }

  /**
   * PostCountOutputType without action
   */
  export type PostCountOutputTypeCountModerationLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ModerationLogWhereInput
  }

  /**
   * PostCountOutputType without action
   */
  export type PostCountOutputTypeCountAuditLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
  }


  /**
   * Count Type TagCountOutputType
   */

  export type TagCountOutputType = {
    posts: number
  }

  export type TagCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    posts?: boolean | TagCountOutputTypeCountPostsArgs
  }

  // Custom InputTypes
  /**
   * TagCountOutputType without action
   */
  export type TagCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TagCountOutputType
     */
    select?: TagCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TagCountOutputType without action
   */
  export type TagCountOutputTypeCountPostsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Banner
   */

  export type AggregateBanner = {
    _count: BannerCountAggregateOutputType | null
    _avg: BannerAvgAggregateOutputType | null
    _sum: BannerSumAggregateOutputType | null
    _min: BannerMinAggregateOutputType | null
    _max: BannerMaxAggregateOutputType | null
  }

  export type BannerAvgAggregateOutputType = {
    orderIndex: number | null
  }

  export type BannerSumAggregateOutputType = {
    orderIndex: number | null
  }

  export type BannerMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    description: string | null
    imageUrl: string | null
    linkType: string | null
    customUrl: string | null
    target: string | null
    position: string | null
    orderIndex: number | null
    status: boolean | null
    metaTitle: string | null
    metaDescription: string | null
    startAt: Date | null
    endAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BannerMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    description: string | null
    imageUrl: string | null
    linkType: string | null
    customUrl: string | null
    target: string | null
    position: string | null
    orderIndex: number | null
    status: boolean | null
    metaTitle: string | null
    metaDescription: string | null
    startAt: Date | null
    endAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BannerCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    description: number
    imageUrl: number
    linkType: number
    customUrl: number
    target: number
    position: number
    orderIndex: number
    status: number
    metaTitle: number
    metaDescription: number
    startAt: number
    endAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BannerAvgAggregateInputType = {
    orderIndex?: true
  }

  export type BannerSumAggregateInputType = {
    orderIndex?: true
  }

  export type BannerMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    imageUrl?: true
    linkType?: true
    customUrl?: true
    target?: true
    position?: true
    orderIndex?: true
    status?: true
    metaTitle?: true
    metaDescription?: true
    startAt?: true
    endAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BannerMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    imageUrl?: true
    linkType?: true
    customUrl?: true
    target?: true
    position?: true
    orderIndex?: true
    status?: true
    metaTitle?: true
    metaDescription?: true
    startAt?: true
    endAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BannerCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    imageUrl?: true
    linkType?: true
    customUrl?: true
    target?: true
    position?: true
    orderIndex?: true
    status?: true
    metaTitle?: true
    metaDescription?: true
    startAt?: true
    endAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BannerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Banner to aggregate.
     */
    where?: BannerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Banners to fetch.
     */
    orderBy?: BannerOrderByWithRelationInput | BannerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BannerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Banners from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Banners.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Banners
    **/
    _count?: true | BannerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BannerAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BannerSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BannerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BannerMaxAggregateInputType
  }

  export type GetBannerAggregateType<T extends BannerAggregateArgs> = {
        [P in keyof T & keyof AggregateBanner]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBanner[P]>
      : GetScalarType<T[P], AggregateBanner[P]>
  }




  export type BannerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BannerWhereInput
    orderBy?: BannerOrderByWithAggregationInput | BannerOrderByWithAggregationInput[]
    by: BannerScalarFieldEnum[] | BannerScalarFieldEnum
    having?: BannerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BannerCountAggregateInputType | true
    _avg?: BannerAvgAggregateInputType
    _sum?: BannerSumAggregateInputType
    _min?: BannerMinAggregateInputType
    _max?: BannerMaxAggregateInputType
  }

  export type BannerGroupByOutputType = {
    id: string
    name: string
    slug: string
    description: string | null
    imageUrl: string
    linkType: string | null
    customUrl: string | null
    target: string | null
    position: string | null
    orderIndex: number
    status: boolean
    metaTitle: string | null
    metaDescription: string | null
    startAt: Date | null
    endAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: BannerCountAggregateOutputType | null
    _avg: BannerAvgAggregateOutputType | null
    _sum: BannerSumAggregateOutputType | null
    _min: BannerMinAggregateOutputType | null
    _max: BannerMaxAggregateOutputType | null
  }

  type GetBannerGroupByPayload<T extends BannerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BannerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BannerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BannerGroupByOutputType[P]>
            : GetScalarType<T[P], BannerGroupByOutputType[P]>
        }
      >
    >


  export type BannerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    imageUrl?: boolean
    linkType?: boolean
    customUrl?: boolean
    target?: boolean
    position?: boolean
    orderIndex?: boolean
    status?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    startAt?: boolean
    endAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["banner"]>



  export type BannerSelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    imageUrl?: boolean
    linkType?: boolean
    customUrl?: boolean
    target?: boolean
    position?: boolean
    orderIndex?: boolean
    status?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    startAt?: boolean
    endAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BannerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "slug" | "description" | "imageUrl" | "linkType" | "customUrl" | "target" | "position" | "orderIndex" | "status" | "metaTitle" | "metaDescription" | "startAt" | "endAt" | "createdAt" | "updatedAt", ExtArgs["result"]["banner"]>

  export type $BannerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Banner"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      description: string | null
      imageUrl: string
      linkType: string | null
      customUrl: string | null
      target: string | null
      position: string | null
      orderIndex: number
      status: boolean
      metaTitle: string | null
      metaDescription: string | null
      startAt: Date | null
      endAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["banner"]>
    composites: {}
  }

  type BannerGetPayload<S extends boolean | null | undefined | BannerDefaultArgs> = $Result.GetResult<Prisma.$BannerPayload, S>

  type BannerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BannerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BannerCountAggregateInputType | true
    }

  export interface BannerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Banner'], meta: { name: 'Banner' } }
    /**
     * Find zero or one Banner that matches the filter.
     * @param {BannerFindUniqueArgs} args - Arguments to find a Banner
     * @example
     * // Get one Banner
     * const banner = await prisma.banner.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BannerFindUniqueArgs>(args: SelectSubset<T, BannerFindUniqueArgs<ExtArgs>>): Prisma__BannerClient<$Result.GetResult<Prisma.$BannerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Banner that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BannerFindUniqueOrThrowArgs} args - Arguments to find a Banner
     * @example
     * // Get one Banner
     * const banner = await prisma.banner.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BannerFindUniqueOrThrowArgs>(args: SelectSubset<T, BannerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BannerClient<$Result.GetResult<Prisma.$BannerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Banner that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BannerFindFirstArgs} args - Arguments to find a Banner
     * @example
     * // Get one Banner
     * const banner = await prisma.banner.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BannerFindFirstArgs>(args?: SelectSubset<T, BannerFindFirstArgs<ExtArgs>>): Prisma__BannerClient<$Result.GetResult<Prisma.$BannerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Banner that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BannerFindFirstOrThrowArgs} args - Arguments to find a Banner
     * @example
     * // Get one Banner
     * const banner = await prisma.banner.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BannerFindFirstOrThrowArgs>(args?: SelectSubset<T, BannerFindFirstOrThrowArgs<ExtArgs>>): Prisma__BannerClient<$Result.GetResult<Prisma.$BannerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Banners that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BannerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Banners
     * const banners = await prisma.banner.findMany()
     * 
     * // Get first 10 Banners
     * const banners = await prisma.banner.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bannerWithIdOnly = await prisma.banner.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BannerFindManyArgs>(args?: SelectSubset<T, BannerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BannerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Banner.
     * @param {BannerCreateArgs} args - Arguments to create a Banner.
     * @example
     * // Create one Banner
     * const Banner = await prisma.banner.create({
     *   data: {
     *     // ... data to create a Banner
     *   }
     * })
     * 
     */
    create<T extends BannerCreateArgs>(args: SelectSubset<T, BannerCreateArgs<ExtArgs>>): Prisma__BannerClient<$Result.GetResult<Prisma.$BannerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Banners.
     * @param {BannerCreateManyArgs} args - Arguments to create many Banners.
     * @example
     * // Create many Banners
     * const banner = await prisma.banner.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BannerCreateManyArgs>(args?: SelectSubset<T, BannerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Banner.
     * @param {BannerDeleteArgs} args - Arguments to delete one Banner.
     * @example
     * // Delete one Banner
     * const Banner = await prisma.banner.delete({
     *   where: {
     *     // ... filter to delete one Banner
     *   }
     * })
     * 
     */
    delete<T extends BannerDeleteArgs>(args: SelectSubset<T, BannerDeleteArgs<ExtArgs>>): Prisma__BannerClient<$Result.GetResult<Prisma.$BannerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Banner.
     * @param {BannerUpdateArgs} args - Arguments to update one Banner.
     * @example
     * // Update one Banner
     * const banner = await prisma.banner.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BannerUpdateArgs>(args: SelectSubset<T, BannerUpdateArgs<ExtArgs>>): Prisma__BannerClient<$Result.GetResult<Prisma.$BannerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Banners.
     * @param {BannerDeleteManyArgs} args - Arguments to filter Banners to delete.
     * @example
     * // Delete a few Banners
     * const { count } = await prisma.banner.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BannerDeleteManyArgs>(args?: SelectSubset<T, BannerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Banners.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BannerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Banners
     * const banner = await prisma.banner.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BannerUpdateManyArgs>(args: SelectSubset<T, BannerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Banner.
     * @param {BannerUpsertArgs} args - Arguments to update or create a Banner.
     * @example
     * // Update or create a Banner
     * const banner = await prisma.banner.upsert({
     *   create: {
     *     // ... data to create a Banner
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Banner we want to update
     *   }
     * })
     */
    upsert<T extends BannerUpsertArgs>(args: SelectSubset<T, BannerUpsertArgs<ExtArgs>>): Prisma__BannerClient<$Result.GetResult<Prisma.$BannerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Banners.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BannerCountArgs} args - Arguments to filter Banners to count.
     * @example
     * // Count the number of Banners
     * const count = await prisma.banner.count({
     *   where: {
     *     // ... the filter for the Banners we want to count
     *   }
     * })
    **/
    count<T extends BannerCountArgs>(
      args?: Subset<T, BannerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BannerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Banner.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BannerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BannerAggregateArgs>(args: Subset<T, BannerAggregateArgs>): Prisma.PrismaPromise<GetBannerAggregateType<T>>

    /**
     * Group by Banner.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BannerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BannerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BannerGroupByArgs['orderBy'] }
        : { orderBy?: BannerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BannerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBannerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Banner model
   */
  readonly fields: BannerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Banner.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BannerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Banner model
   */
  interface BannerFieldRefs {
    readonly id: FieldRef<"Banner", 'String'>
    readonly name: FieldRef<"Banner", 'String'>
    readonly slug: FieldRef<"Banner", 'String'>
    readonly description: FieldRef<"Banner", 'String'>
    readonly imageUrl: FieldRef<"Banner", 'String'>
    readonly linkType: FieldRef<"Banner", 'String'>
    readonly customUrl: FieldRef<"Banner", 'String'>
    readonly target: FieldRef<"Banner", 'String'>
    readonly position: FieldRef<"Banner", 'String'>
    readonly orderIndex: FieldRef<"Banner", 'Int'>
    readonly status: FieldRef<"Banner", 'Boolean'>
    readonly metaTitle: FieldRef<"Banner", 'String'>
    readonly metaDescription: FieldRef<"Banner", 'String'>
    readonly startAt: FieldRef<"Banner", 'DateTime'>
    readonly endAt: FieldRef<"Banner", 'DateTime'>
    readonly createdAt: FieldRef<"Banner", 'DateTime'>
    readonly updatedAt: FieldRef<"Banner", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Banner findUnique
   */
  export type BannerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Banner
     */
    select?: BannerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Banner
     */
    omit?: BannerOmit<ExtArgs> | null
    /**
     * Filter, which Banner to fetch.
     */
    where: BannerWhereUniqueInput
  }

  /**
   * Banner findUniqueOrThrow
   */
  export type BannerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Banner
     */
    select?: BannerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Banner
     */
    omit?: BannerOmit<ExtArgs> | null
    /**
     * Filter, which Banner to fetch.
     */
    where: BannerWhereUniqueInput
  }

  /**
   * Banner findFirst
   */
  export type BannerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Banner
     */
    select?: BannerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Banner
     */
    omit?: BannerOmit<ExtArgs> | null
    /**
     * Filter, which Banner to fetch.
     */
    where?: BannerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Banners to fetch.
     */
    orderBy?: BannerOrderByWithRelationInput | BannerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Banners.
     */
    cursor?: BannerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Banners from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Banners.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Banners.
     */
    distinct?: BannerScalarFieldEnum | BannerScalarFieldEnum[]
  }

  /**
   * Banner findFirstOrThrow
   */
  export type BannerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Banner
     */
    select?: BannerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Banner
     */
    omit?: BannerOmit<ExtArgs> | null
    /**
     * Filter, which Banner to fetch.
     */
    where?: BannerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Banners to fetch.
     */
    orderBy?: BannerOrderByWithRelationInput | BannerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Banners.
     */
    cursor?: BannerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Banners from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Banners.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Banners.
     */
    distinct?: BannerScalarFieldEnum | BannerScalarFieldEnum[]
  }

  /**
   * Banner findMany
   */
  export type BannerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Banner
     */
    select?: BannerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Banner
     */
    omit?: BannerOmit<ExtArgs> | null
    /**
     * Filter, which Banners to fetch.
     */
    where?: BannerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Banners to fetch.
     */
    orderBy?: BannerOrderByWithRelationInput | BannerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Banners.
     */
    cursor?: BannerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Banners from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Banners.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Banners.
     */
    distinct?: BannerScalarFieldEnum | BannerScalarFieldEnum[]
  }

  /**
   * Banner create
   */
  export type BannerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Banner
     */
    select?: BannerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Banner
     */
    omit?: BannerOmit<ExtArgs> | null
    /**
     * The data needed to create a Banner.
     */
    data: XOR<BannerCreateInput, BannerUncheckedCreateInput>
  }

  /**
   * Banner createMany
   */
  export type BannerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Banners.
     */
    data: BannerCreateManyInput | BannerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Banner update
   */
  export type BannerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Banner
     */
    select?: BannerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Banner
     */
    omit?: BannerOmit<ExtArgs> | null
    /**
     * The data needed to update a Banner.
     */
    data: XOR<BannerUpdateInput, BannerUncheckedUpdateInput>
    /**
     * Choose, which Banner to update.
     */
    where: BannerWhereUniqueInput
  }

  /**
   * Banner updateMany
   */
  export type BannerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Banners.
     */
    data: XOR<BannerUpdateManyMutationInput, BannerUncheckedUpdateManyInput>
    /**
     * Filter which Banners to update
     */
    where?: BannerWhereInput
    /**
     * Limit how many Banners to update.
     */
    limit?: number
  }

  /**
   * Banner upsert
   */
  export type BannerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Banner
     */
    select?: BannerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Banner
     */
    omit?: BannerOmit<ExtArgs> | null
    /**
     * The filter to search for the Banner to update in case it exists.
     */
    where: BannerWhereUniqueInput
    /**
     * In case the Banner found by the `where` argument doesn't exist, create a new Banner with this data.
     */
    create: XOR<BannerCreateInput, BannerUncheckedCreateInput>
    /**
     * In case the Banner was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BannerUpdateInput, BannerUncheckedUpdateInput>
  }

  /**
   * Banner delete
   */
  export type BannerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Banner
     */
    select?: BannerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Banner
     */
    omit?: BannerOmit<ExtArgs> | null
    /**
     * Filter which Banner to delete.
     */
    where: BannerWhereUniqueInput
  }

  /**
   * Banner deleteMany
   */
  export type BannerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Banners to delete
     */
    where?: BannerWhereInput
    /**
     * Limit how many Banners to delete.
     */
    limit?: number
  }

  /**
   * Banner without action
   */
  export type BannerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Banner
     */
    select?: BannerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Banner
     */
    omit?: BannerOmit<ExtArgs> | null
  }


  /**
   * Model Category
   */

  export type AggregateCategory = {
    _count: CategoryCountAggregateOutputType | null
    _avg: CategoryAvgAggregateOutputType | null
    _sum: CategorySumAggregateOutputType | null
    _min: CategoryMinAggregateOutputType | null
    _max: CategoryMaxAggregateOutputType | null
  }

  export type CategoryAvgAggregateOutputType = {
    lft: number | null
    rgt: number | null
    depth: number | null
    orderIndex: number | null
  }

  export type CategorySumAggregateOutputType = {
    lft: number | null
    rgt: number | null
    depth: number | null
    orderIndex: number | null
  }

  export type CategoryMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    parentId: string | null
    lft: number | null
    rgt: number | null
    depth: number | null
    status: boolean | null
    thumbnail: string | null
    attachmentId: string | null
    linkType: string | null
    customUrl: string | null
    target: string | null
    orderIndex: number | null
    description: string | null
    metaTitle: string | null
    metaDescription: string | null
    isGovStandard: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CategoryMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    parentId: string | null
    lft: number | null
    rgt: number | null
    depth: number | null
    status: boolean | null
    thumbnail: string | null
    attachmentId: string | null
    linkType: string | null
    customUrl: string | null
    target: string | null
    orderIndex: number | null
    description: string | null
    metaTitle: string | null
    metaDescription: string | null
    isGovStandard: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CategoryCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    parentId: number
    lft: number
    rgt: number
    depth: number
    status: number
    thumbnail: number
    attachmentId: number
    linkType: number
    customUrl: number
    target: number
    orderIndex: number
    description: number
    translations: number
    metaTitle: number
    metaDescription: number
    isGovStandard: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CategoryAvgAggregateInputType = {
    lft?: true
    rgt?: true
    depth?: true
    orderIndex?: true
  }

  export type CategorySumAggregateInputType = {
    lft?: true
    rgt?: true
    depth?: true
    orderIndex?: true
  }

  export type CategoryMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    parentId?: true
    lft?: true
    rgt?: true
    depth?: true
    status?: true
    thumbnail?: true
    attachmentId?: true
    linkType?: true
    customUrl?: true
    target?: true
    orderIndex?: true
    description?: true
    metaTitle?: true
    metaDescription?: true
    isGovStandard?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CategoryMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    parentId?: true
    lft?: true
    rgt?: true
    depth?: true
    status?: true
    thumbnail?: true
    attachmentId?: true
    linkType?: true
    customUrl?: true
    target?: true
    orderIndex?: true
    description?: true
    metaTitle?: true
    metaDescription?: true
    isGovStandard?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CategoryCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    parentId?: true
    lft?: true
    rgt?: true
    depth?: true
    status?: true
    thumbnail?: true
    attachmentId?: true
    linkType?: true
    customUrl?: true
    target?: true
    orderIndex?: true
    description?: true
    translations?: true
    metaTitle?: true
    metaDescription?: true
    isGovStandard?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Category to aggregate.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Categories
    **/
    _count?: true | CategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CategoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CategorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CategoryMaxAggregateInputType
  }

  export type GetCategoryAggregateType<T extends CategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCategory[P]>
      : GetScalarType<T[P], AggregateCategory[P]>
  }




  export type CategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CategoryWhereInput
    orderBy?: CategoryOrderByWithAggregationInput | CategoryOrderByWithAggregationInput[]
    by: CategoryScalarFieldEnum[] | CategoryScalarFieldEnum
    having?: CategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CategoryCountAggregateInputType | true
    _avg?: CategoryAvgAggregateInputType
    _sum?: CategorySumAggregateInputType
    _min?: CategoryMinAggregateInputType
    _max?: CategoryMaxAggregateInputType
  }

  export type CategoryGroupByOutputType = {
    id: string
    name: string
    slug: string
    parentId: string | null
    lft: number
    rgt: number
    depth: number
    status: boolean
    thumbnail: string | null
    attachmentId: string | null
    linkType: string | null
    customUrl: string | null
    target: string | null
    orderIndex: number
    description: string | null
    translations: JsonValue | null
    metaTitle: string | null
    metaDescription: string | null
    isGovStandard: boolean
    createdAt: Date
    updatedAt: Date
    _count: CategoryCountAggregateOutputType | null
    _avg: CategoryAvgAggregateOutputType | null
    _sum: CategorySumAggregateOutputType | null
    _min: CategoryMinAggregateOutputType | null
    _max: CategoryMaxAggregateOutputType | null
  }

  type GetCategoryGroupByPayload<T extends CategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CategoryGroupByOutputType[P]>
            : GetScalarType<T[P], CategoryGroupByOutputType[P]>
        }
      >
    >


  export type CategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    parentId?: boolean
    lft?: boolean
    rgt?: boolean
    depth?: boolean
    status?: boolean
    thumbnail?: boolean
    attachmentId?: boolean
    linkType?: boolean
    customUrl?: boolean
    target?: boolean
    orderIndex?: boolean
    description?: boolean
    translations?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    isGovStandard?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parent?: boolean | Category$parentArgs<ExtArgs>
    children?: boolean | Category$childrenArgs<ExtArgs>
    posts?: boolean | Category$postsArgs<ExtArgs>
    _count?: boolean | CategoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["category"]>



  export type CategorySelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    parentId?: boolean
    lft?: boolean
    rgt?: boolean
    depth?: boolean
    status?: boolean
    thumbnail?: boolean
    attachmentId?: boolean
    linkType?: boolean
    customUrl?: boolean
    target?: boolean
    orderIndex?: boolean
    description?: boolean
    translations?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    isGovStandard?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CategoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "slug" | "parentId" | "lft" | "rgt" | "depth" | "status" | "thumbnail" | "attachmentId" | "linkType" | "customUrl" | "target" | "orderIndex" | "description" | "translations" | "metaTitle" | "metaDescription" | "isGovStandard" | "createdAt" | "updatedAt", ExtArgs["result"]["category"]>
  export type CategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Category$parentArgs<ExtArgs>
    children?: boolean | Category$childrenArgs<ExtArgs>
    posts?: boolean | Category$postsArgs<ExtArgs>
    _count?: boolean | CategoryCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $CategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Category"
    objects: {
      parent: Prisma.$CategoryPayload<ExtArgs> | null
      children: Prisma.$CategoryPayload<ExtArgs>[]
      posts: Prisma.$PostPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      parentId: string | null
      lft: number
      rgt: number
      depth: number
      status: boolean
      thumbnail: string | null
      attachmentId: string | null
      linkType: string | null
      customUrl: string | null
      target: string | null
      orderIndex: number
      description: string | null
      translations: Prisma.JsonValue | null
      metaTitle: string | null
      metaDescription: string | null
      isGovStandard: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["category"]>
    composites: {}
  }

  type CategoryGetPayload<S extends boolean | null | undefined | CategoryDefaultArgs> = $Result.GetResult<Prisma.$CategoryPayload, S>

  type CategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CategoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CategoryCountAggregateInputType | true
    }

  export interface CategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Category'], meta: { name: 'Category' } }
    /**
     * Find zero or one Category that matches the filter.
     * @param {CategoryFindUniqueArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CategoryFindUniqueArgs>(args: SelectSubset<T, CategoryFindUniqueArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Category that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CategoryFindUniqueOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, CategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Category that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindFirstArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CategoryFindFirstArgs>(args?: SelectSubset<T, CategoryFindFirstArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Category that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindFirstOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, CategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Categories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Categories
     * const categories = await prisma.category.findMany()
     * 
     * // Get first 10 Categories
     * const categories = await prisma.category.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const categoryWithIdOnly = await prisma.category.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CategoryFindManyArgs>(args?: SelectSubset<T, CategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Category.
     * @param {CategoryCreateArgs} args - Arguments to create a Category.
     * @example
     * // Create one Category
     * const Category = await prisma.category.create({
     *   data: {
     *     // ... data to create a Category
     *   }
     * })
     * 
     */
    create<T extends CategoryCreateArgs>(args: SelectSubset<T, CategoryCreateArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Categories.
     * @param {CategoryCreateManyArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const category = await prisma.category.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CategoryCreateManyArgs>(args?: SelectSubset<T, CategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Category.
     * @param {CategoryDeleteArgs} args - Arguments to delete one Category.
     * @example
     * // Delete one Category
     * const Category = await prisma.category.delete({
     *   where: {
     *     // ... filter to delete one Category
     *   }
     * })
     * 
     */
    delete<T extends CategoryDeleteArgs>(args: SelectSubset<T, CategoryDeleteArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Category.
     * @param {CategoryUpdateArgs} args - Arguments to update one Category.
     * @example
     * // Update one Category
     * const category = await prisma.category.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CategoryUpdateArgs>(args: SelectSubset<T, CategoryUpdateArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Categories.
     * @param {CategoryDeleteManyArgs} args - Arguments to filter Categories to delete.
     * @example
     * // Delete a few Categories
     * const { count } = await prisma.category.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CategoryDeleteManyArgs>(args?: SelectSubset<T, CategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Categories
     * const category = await prisma.category.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CategoryUpdateManyArgs>(args: SelectSubset<T, CategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Category.
     * @param {CategoryUpsertArgs} args - Arguments to update or create a Category.
     * @example
     * // Update or create a Category
     * const category = await prisma.category.upsert({
     *   create: {
     *     // ... data to create a Category
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Category we want to update
     *   }
     * })
     */
    upsert<T extends CategoryUpsertArgs>(args: SelectSubset<T, CategoryUpsertArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryCountArgs} args - Arguments to filter Categories to count.
     * @example
     * // Count the number of Categories
     * const count = await prisma.category.count({
     *   where: {
     *     // ... the filter for the Categories we want to count
     *   }
     * })
    **/
    count<T extends CategoryCountArgs>(
      args?: Subset<T, CategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CategoryAggregateArgs>(args: Subset<T, CategoryAggregateArgs>): Prisma.PrismaPromise<GetCategoryAggregateType<T>>

    /**
     * Group by Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CategoryGroupByArgs['orderBy'] }
        : { orderBy?: CategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Category model
   */
  readonly fields: CategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Category.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    parent<T extends Category$parentArgs<ExtArgs> = {}>(args?: Subset<T, Category$parentArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    children<T extends Category$childrenArgs<ExtArgs> = {}>(args?: Subset<T, Category$childrenArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    posts<T extends Category$postsArgs<ExtArgs> = {}>(args?: Subset<T, Category$postsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Category model
   */
  interface CategoryFieldRefs {
    readonly id: FieldRef<"Category", 'String'>
    readonly name: FieldRef<"Category", 'String'>
    readonly slug: FieldRef<"Category", 'String'>
    readonly parentId: FieldRef<"Category", 'String'>
    readonly lft: FieldRef<"Category", 'Int'>
    readonly rgt: FieldRef<"Category", 'Int'>
    readonly depth: FieldRef<"Category", 'Int'>
    readonly status: FieldRef<"Category", 'Boolean'>
    readonly thumbnail: FieldRef<"Category", 'String'>
    readonly attachmentId: FieldRef<"Category", 'String'>
    readonly linkType: FieldRef<"Category", 'String'>
    readonly customUrl: FieldRef<"Category", 'String'>
    readonly target: FieldRef<"Category", 'String'>
    readonly orderIndex: FieldRef<"Category", 'Int'>
    readonly description: FieldRef<"Category", 'String'>
    readonly translations: FieldRef<"Category", 'Json'>
    readonly metaTitle: FieldRef<"Category", 'String'>
    readonly metaDescription: FieldRef<"Category", 'String'>
    readonly isGovStandard: FieldRef<"Category", 'Boolean'>
    readonly createdAt: FieldRef<"Category", 'DateTime'>
    readonly updatedAt: FieldRef<"Category", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Category findUnique
   */
  export type CategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category findUniqueOrThrow
   */
  export type CategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category findFirst
   */
  export type CategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category findFirstOrThrow
   */
  export type CategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category findMany
   */
  export type CategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Categories to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category create
   */
  export type CategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a Category.
     */
    data: XOR<CategoryCreateInput, CategoryUncheckedCreateInput>
  }

  /**
   * Category createMany
   */
  export type CategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Categories.
     */
    data: CategoryCreateManyInput | CategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Category update
   */
  export type CategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a Category.
     */
    data: XOR<CategoryUpdateInput, CategoryUncheckedUpdateInput>
    /**
     * Choose, which Category to update.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category updateMany
   */
  export type CategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Categories.
     */
    data: XOR<CategoryUpdateManyMutationInput, CategoryUncheckedUpdateManyInput>
    /**
     * Filter which Categories to update
     */
    where?: CategoryWhereInput
    /**
     * Limit how many Categories to update.
     */
    limit?: number
  }

  /**
   * Category upsert
   */
  export type CategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the Category to update in case it exists.
     */
    where: CategoryWhereUniqueInput
    /**
     * In case the Category found by the `where` argument doesn't exist, create a new Category with this data.
     */
    create: XOR<CategoryCreateInput, CategoryUncheckedCreateInput>
    /**
     * In case the Category was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CategoryUpdateInput, CategoryUncheckedUpdateInput>
  }

  /**
   * Category delete
   */
  export type CategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter which Category to delete.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category deleteMany
   */
  export type CategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Categories to delete
     */
    where?: CategoryWhereInput
    /**
     * Limit how many Categories to delete.
     */
    limit?: number
  }

  /**
   * Category.parent
   */
  export type Category$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    where?: CategoryWhereInput
  }

  /**
   * Category.children
   */
  export type Category$childrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    where?: CategoryWhereInput
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    cursor?: CategoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category.posts
   */
  export type Category$postsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    where?: PostWhereInput
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    cursor?: PostWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Category without action
   */
  export type CategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
  }


  /**
   * Model Comment
   */

  export type AggregateComment = {
    _count: CommentCountAggregateOutputType | null
    _min: CommentMinAggregateOutputType | null
    _max: CommentMaxAggregateOutputType | null
  }

  export type CommentMinAggregateOutputType = {
    id: string | null
    content: string | null
    status: string | null
    authorId: string | null
    authorName: string | null
    authorEmail: string | null
    authorIp: string | null
    postId: string | null
    parentId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CommentMaxAggregateOutputType = {
    id: string | null
    content: string | null
    status: string | null
    authorId: string | null
    authorName: string | null
    authorEmail: string | null
    authorIp: string | null
    postId: string | null
    parentId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CommentCountAggregateOutputType = {
    id: number
    content: number
    status: number
    authorId: number
    authorName: number
    authorEmail: number
    authorIp: number
    postId: number
    parentId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CommentMinAggregateInputType = {
    id?: true
    content?: true
    status?: true
    authorId?: true
    authorName?: true
    authorEmail?: true
    authorIp?: true
    postId?: true
    parentId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CommentMaxAggregateInputType = {
    id?: true
    content?: true
    status?: true
    authorId?: true
    authorName?: true
    authorEmail?: true
    authorIp?: true
    postId?: true
    parentId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CommentCountAggregateInputType = {
    id?: true
    content?: true
    status?: true
    authorId?: true
    authorName?: true
    authorEmail?: true
    authorIp?: true
    postId?: true
    parentId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CommentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Comment to aggregate.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Comments
    **/
    _count?: true | CommentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CommentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CommentMaxAggregateInputType
  }

  export type GetCommentAggregateType<T extends CommentAggregateArgs> = {
        [P in keyof T & keyof AggregateComment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateComment[P]>
      : GetScalarType<T[P], AggregateComment[P]>
  }




  export type CommentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CommentWhereInput
    orderBy?: CommentOrderByWithAggregationInput | CommentOrderByWithAggregationInput[]
    by: CommentScalarFieldEnum[] | CommentScalarFieldEnum
    having?: CommentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CommentCountAggregateInputType | true
    _min?: CommentMinAggregateInputType
    _max?: CommentMaxAggregateInputType
  }

  export type CommentGroupByOutputType = {
    id: string
    content: string
    status: string
    authorId: string | null
    authorName: string | null
    authorEmail: string | null
    authorIp: string | null
    postId: string
    parentId: string | null
    createdAt: Date
    updatedAt: Date
    _count: CommentCountAggregateOutputType | null
    _min: CommentMinAggregateOutputType | null
    _max: CommentMaxAggregateOutputType | null
  }

  type GetCommentGroupByPayload<T extends CommentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CommentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CommentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CommentGroupByOutputType[P]>
            : GetScalarType<T[P], CommentGroupByOutputType[P]>
        }
      >
    >


  export type CommentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    content?: boolean
    status?: boolean
    authorId?: boolean
    authorName?: boolean
    authorEmail?: boolean
    authorIp?: boolean
    postId?: boolean
    parentId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
    parent?: boolean | Comment$parentArgs<ExtArgs>
    replies?: boolean | Comment$repliesArgs<ExtArgs>
    _count?: boolean | CommentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["comment"]>



  export type CommentSelectScalar = {
    id?: boolean
    content?: boolean
    status?: boolean
    authorId?: boolean
    authorName?: boolean
    authorEmail?: boolean
    authorIp?: boolean
    postId?: boolean
    parentId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CommentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "content" | "status" | "authorId" | "authorName" | "authorEmail" | "authorIp" | "postId" | "parentId" | "createdAt" | "updatedAt", ExtArgs["result"]["comment"]>
  export type CommentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
    parent?: boolean | Comment$parentArgs<ExtArgs>
    replies?: boolean | Comment$repliesArgs<ExtArgs>
    _count?: boolean | CommentCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $CommentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Comment"
    objects: {
      post: Prisma.$PostPayload<ExtArgs>
      parent: Prisma.$CommentPayload<ExtArgs> | null
      replies: Prisma.$CommentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      content: string
      status: string
      authorId: string | null
      authorName: string | null
      authorEmail: string | null
      authorIp: string | null
      postId: string
      parentId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["comment"]>
    composites: {}
  }

  type CommentGetPayload<S extends boolean | null | undefined | CommentDefaultArgs> = $Result.GetResult<Prisma.$CommentPayload, S>

  type CommentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CommentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CommentCountAggregateInputType | true
    }

  export interface CommentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Comment'], meta: { name: 'Comment' } }
    /**
     * Find zero or one Comment that matches the filter.
     * @param {CommentFindUniqueArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CommentFindUniqueArgs>(args: SelectSubset<T, CommentFindUniqueArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Comment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CommentFindUniqueOrThrowArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CommentFindUniqueOrThrowArgs>(args: SelectSubset<T, CommentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Comment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentFindFirstArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CommentFindFirstArgs>(args?: SelectSubset<T, CommentFindFirstArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Comment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentFindFirstOrThrowArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CommentFindFirstOrThrowArgs>(args?: SelectSubset<T, CommentFindFirstOrThrowArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Comments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Comments
     * const comments = await prisma.comment.findMany()
     * 
     * // Get first 10 Comments
     * const comments = await prisma.comment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const commentWithIdOnly = await prisma.comment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CommentFindManyArgs>(args?: SelectSubset<T, CommentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Comment.
     * @param {CommentCreateArgs} args - Arguments to create a Comment.
     * @example
     * // Create one Comment
     * const Comment = await prisma.comment.create({
     *   data: {
     *     // ... data to create a Comment
     *   }
     * })
     * 
     */
    create<T extends CommentCreateArgs>(args: SelectSubset<T, CommentCreateArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Comments.
     * @param {CommentCreateManyArgs} args - Arguments to create many Comments.
     * @example
     * // Create many Comments
     * const comment = await prisma.comment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CommentCreateManyArgs>(args?: SelectSubset<T, CommentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Comment.
     * @param {CommentDeleteArgs} args - Arguments to delete one Comment.
     * @example
     * // Delete one Comment
     * const Comment = await prisma.comment.delete({
     *   where: {
     *     // ... filter to delete one Comment
     *   }
     * })
     * 
     */
    delete<T extends CommentDeleteArgs>(args: SelectSubset<T, CommentDeleteArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Comment.
     * @param {CommentUpdateArgs} args - Arguments to update one Comment.
     * @example
     * // Update one Comment
     * const comment = await prisma.comment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CommentUpdateArgs>(args: SelectSubset<T, CommentUpdateArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Comments.
     * @param {CommentDeleteManyArgs} args - Arguments to filter Comments to delete.
     * @example
     * // Delete a few Comments
     * const { count } = await prisma.comment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CommentDeleteManyArgs>(args?: SelectSubset<T, CommentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Comments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Comments
     * const comment = await prisma.comment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CommentUpdateManyArgs>(args: SelectSubset<T, CommentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Comment.
     * @param {CommentUpsertArgs} args - Arguments to update or create a Comment.
     * @example
     * // Update or create a Comment
     * const comment = await prisma.comment.upsert({
     *   create: {
     *     // ... data to create a Comment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Comment we want to update
     *   }
     * })
     */
    upsert<T extends CommentUpsertArgs>(args: SelectSubset<T, CommentUpsertArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Comments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentCountArgs} args - Arguments to filter Comments to count.
     * @example
     * // Count the number of Comments
     * const count = await prisma.comment.count({
     *   where: {
     *     // ... the filter for the Comments we want to count
     *   }
     * })
    **/
    count<T extends CommentCountArgs>(
      args?: Subset<T, CommentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CommentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Comment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CommentAggregateArgs>(args: Subset<T, CommentAggregateArgs>): Prisma.PrismaPromise<GetCommentAggregateType<T>>

    /**
     * Group by Comment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CommentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CommentGroupByArgs['orderBy'] }
        : { orderBy?: CommentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CommentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCommentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Comment model
   */
  readonly fields: CommentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Comment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CommentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    post<T extends PostDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PostDefaultArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    parent<T extends Comment$parentArgs<ExtArgs> = {}>(args?: Subset<T, Comment$parentArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    replies<T extends Comment$repliesArgs<ExtArgs> = {}>(args?: Subset<T, Comment$repliesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Comment model
   */
  interface CommentFieldRefs {
    readonly id: FieldRef<"Comment", 'String'>
    readonly content: FieldRef<"Comment", 'String'>
    readonly status: FieldRef<"Comment", 'String'>
    readonly authorId: FieldRef<"Comment", 'String'>
    readonly authorName: FieldRef<"Comment", 'String'>
    readonly authorEmail: FieldRef<"Comment", 'String'>
    readonly authorIp: FieldRef<"Comment", 'String'>
    readonly postId: FieldRef<"Comment", 'String'>
    readonly parentId: FieldRef<"Comment", 'String'>
    readonly createdAt: FieldRef<"Comment", 'DateTime'>
    readonly updatedAt: FieldRef<"Comment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Comment findUnique
   */
  export type CommentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment findUniqueOrThrow
   */
  export type CommentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment findFirst
   */
  export type CommentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Comments.
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Comments.
     */
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment findFirstOrThrow
   */
  export type CommentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Comments.
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Comments.
     */
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment findMany
   */
  export type CommentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comments to fetch.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Comments.
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Comments.
     */
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment create
   */
  export type CommentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * The data needed to create a Comment.
     */
    data: XOR<CommentCreateInput, CommentUncheckedCreateInput>
  }

  /**
   * Comment createMany
   */
  export type CommentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Comments.
     */
    data: CommentCreateManyInput | CommentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Comment update
   */
  export type CommentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * The data needed to update a Comment.
     */
    data: XOR<CommentUpdateInput, CommentUncheckedUpdateInput>
    /**
     * Choose, which Comment to update.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment updateMany
   */
  export type CommentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Comments.
     */
    data: XOR<CommentUpdateManyMutationInput, CommentUncheckedUpdateManyInput>
    /**
     * Filter which Comments to update
     */
    where?: CommentWhereInput
    /**
     * Limit how many Comments to update.
     */
    limit?: number
  }

  /**
   * Comment upsert
   */
  export type CommentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * The filter to search for the Comment to update in case it exists.
     */
    where: CommentWhereUniqueInput
    /**
     * In case the Comment found by the `where` argument doesn't exist, create a new Comment with this data.
     */
    create: XOR<CommentCreateInput, CommentUncheckedCreateInput>
    /**
     * In case the Comment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CommentUpdateInput, CommentUncheckedUpdateInput>
  }

  /**
   * Comment delete
   */
  export type CommentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter which Comment to delete.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment deleteMany
   */
  export type CommentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Comments to delete
     */
    where?: CommentWhereInput
    /**
     * Limit how many Comments to delete.
     */
    limit?: number
  }

  /**
   * Comment.parent
   */
  export type Comment$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    where?: CommentWhereInput
  }

  /**
   * Comment.replies
   */
  export type Comment$repliesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    where?: CommentWhereInput
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    cursor?: CommentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment without action
   */
  export type CommentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
  }


  /**
   * Model CitizenQuestion
   */

  export type AggregateCitizenQuestion = {
    _count: CitizenQuestionCountAggregateOutputType | null
    _min: CitizenQuestionMinAggregateOutputType | null
    _max: CitizenQuestionMaxAggregateOutputType | null
  }

  export type CitizenQuestionMinAggregateOutputType = {
    id: string | null
    title: string | null
    content: string | null
    askedByName: string | null
    askedByEmail: string | null
    askedByPhone: string | null
    address: string | null
    status: string | null
    answerContent: string | null
    answeredAt: Date | null
    answeredById: string | null
    isPublic: boolean | null
    categoryId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CitizenQuestionMaxAggregateOutputType = {
    id: string | null
    title: string | null
    content: string | null
    askedByName: string | null
    askedByEmail: string | null
    askedByPhone: string | null
    address: string | null
    status: string | null
    answerContent: string | null
    answeredAt: Date | null
    answeredById: string | null
    isPublic: boolean | null
    categoryId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CitizenQuestionCountAggregateOutputType = {
    id: number
    title: number
    content: number
    askedByName: number
    askedByEmail: number
    askedByPhone: number
    address: number
    status: number
    answerContent: number
    answeredAt: number
    answeredById: number
    isPublic: number
    categoryId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CitizenQuestionMinAggregateInputType = {
    id?: true
    title?: true
    content?: true
    askedByName?: true
    askedByEmail?: true
    askedByPhone?: true
    address?: true
    status?: true
    answerContent?: true
    answeredAt?: true
    answeredById?: true
    isPublic?: true
    categoryId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CitizenQuestionMaxAggregateInputType = {
    id?: true
    title?: true
    content?: true
    askedByName?: true
    askedByEmail?: true
    askedByPhone?: true
    address?: true
    status?: true
    answerContent?: true
    answeredAt?: true
    answeredById?: true
    isPublic?: true
    categoryId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CitizenQuestionCountAggregateInputType = {
    id?: true
    title?: true
    content?: true
    askedByName?: true
    askedByEmail?: true
    askedByPhone?: true
    address?: true
    status?: true
    answerContent?: true
    answeredAt?: true
    answeredById?: true
    isPublic?: true
    categoryId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CitizenQuestionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CitizenQuestion to aggregate.
     */
    where?: CitizenQuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CitizenQuestions to fetch.
     */
    orderBy?: CitizenQuestionOrderByWithRelationInput | CitizenQuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CitizenQuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CitizenQuestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CitizenQuestions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CitizenQuestions
    **/
    _count?: true | CitizenQuestionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CitizenQuestionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CitizenQuestionMaxAggregateInputType
  }

  export type GetCitizenQuestionAggregateType<T extends CitizenQuestionAggregateArgs> = {
        [P in keyof T & keyof AggregateCitizenQuestion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCitizenQuestion[P]>
      : GetScalarType<T[P], AggregateCitizenQuestion[P]>
  }




  export type CitizenQuestionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CitizenQuestionWhereInput
    orderBy?: CitizenQuestionOrderByWithAggregationInput | CitizenQuestionOrderByWithAggregationInput[]
    by: CitizenQuestionScalarFieldEnum[] | CitizenQuestionScalarFieldEnum
    having?: CitizenQuestionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CitizenQuestionCountAggregateInputType | true
    _min?: CitizenQuestionMinAggregateInputType
    _max?: CitizenQuestionMaxAggregateInputType
  }

  export type CitizenQuestionGroupByOutputType = {
    id: string
    title: string
    content: string
    askedByName: string
    askedByEmail: string | null
    askedByPhone: string | null
    address: string | null
    status: string
    answerContent: string | null
    answeredAt: Date | null
    answeredById: string | null
    isPublic: boolean
    categoryId: string | null
    createdAt: Date
    updatedAt: Date
    _count: CitizenQuestionCountAggregateOutputType | null
    _min: CitizenQuestionMinAggregateOutputType | null
    _max: CitizenQuestionMaxAggregateOutputType | null
  }

  type GetCitizenQuestionGroupByPayload<T extends CitizenQuestionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CitizenQuestionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CitizenQuestionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CitizenQuestionGroupByOutputType[P]>
            : GetScalarType<T[P], CitizenQuestionGroupByOutputType[P]>
        }
      >
    >


  export type CitizenQuestionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    content?: boolean
    askedByName?: boolean
    askedByEmail?: boolean
    askedByPhone?: boolean
    address?: boolean
    status?: boolean
    answerContent?: boolean
    answeredAt?: boolean
    answeredById?: boolean
    isPublic?: boolean
    categoryId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["citizenQuestion"]>



  export type CitizenQuestionSelectScalar = {
    id?: boolean
    title?: boolean
    content?: boolean
    askedByName?: boolean
    askedByEmail?: boolean
    askedByPhone?: boolean
    address?: boolean
    status?: boolean
    answerContent?: boolean
    answeredAt?: boolean
    answeredById?: boolean
    isPublic?: boolean
    categoryId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CitizenQuestionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "content" | "askedByName" | "askedByEmail" | "askedByPhone" | "address" | "status" | "answerContent" | "answeredAt" | "answeredById" | "isPublic" | "categoryId" | "createdAt" | "updatedAt", ExtArgs["result"]["citizenQuestion"]>

  export type $CitizenQuestionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CitizenQuestion"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      content: string
      askedByName: string
      askedByEmail: string | null
      askedByPhone: string | null
      address: string | null
      status: string
      answerContent: string | null
      answeredAt: Date | null
      answeredById: string | null
      isPublic: boolean
      categoryId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["citizenQuestion"]>
    composites: {}
  }

  type CitizenQuestionGetPayload<S extends boolean | null | undefined | CitizenQuestionDefaultArgs> = $Result.GetResult<Prisma.$CitizenQuestionPayload, S>

  type CitizenQuestionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CitizenQuestionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CitizenQuestionCountAggregateInputType | true
    }

  export interface CitizenQuestionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CitizenQuestion'], meta: { name: 'CitizenQuestion' } }
    /**
     * Find zero or one CitizenQuestion that matches the filter.
     * @param {CitizenQuestionFindUniqueArgs} args - Arguments to find a CitizenQuestion
     * @example
     * // Get one CitizenQuestion
     * const citizenQuestion = await prisma.citizenQuestion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CitizenQuestionFindUniqueArgs>(args: SelectSubset<T, CitizenQuestionFindUniqueArgs<ExtArgs>>): Prisma__CitizenQuestionClient<$Result.GetResult<Prisma.$CitizenQuestionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CitizenQuestion that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CitizenQuestionFindUniqueOrThrowArgs} args - Arguments to find a CitizenQuestion
     * @example
     * // Get one CitizenQuestion
     * const citizenQuestion = await prisma.citizenQuestion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CitizenQuestionFindUniqueOrThrowArgs>(args: SelectSubset<T, CitizenQuestionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CitizenQuestionClient<$Result.GetResult<Prisma.$CitizenQuestionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CitizenQuestion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitizenQuestionFindFirstArgs} args - Arguments to find a CitizenQuestion
     * @example
     * // Get one CitizenQuestion
     * const citizenQuestion = await prisma.citizenQuestion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CitizenQuestionFindFirstArgs>(args?: SelectSubset<T, CitizenQuestionFindFirstArgs<ExtArgs>>): Prisma__CitizenQuestionClient<$Result.GetResult<Prisma.$CitizenQuestionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CitizenQuestion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitizenQuestionFindFirstOrThrowArgs} args - Arguments to find a CitizenQuestion
     * @example
     * // Get one CitizenQuestion
     * const citizenQuestion = await prisma.citizenQuestion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CitizenQuestionFindFirstOrThrowArgs>(args?: SelectSubset<T, CitizenQuestionFindFirstOrThrowArgs<ExtArgs>>): Prisma__CitizenQuestionClient<$Result.GetResult<Prisma.$CitizenQuestionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CitizenQuestions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitizenQuestionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CitizenQuestions
     * const citizenQuestions = await prisma.citizenQuestion.findMany()
     * 
     * // Get first 10 CitizenQuestions
     * const citizenQuestions = await prisma.citizenQuestion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const citizenQuestionWithIdOnly = await prisma.citizenQuestion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CitizenQuestionFindManyArgs>(args?: SelectSubset<T, CitizenQuestionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CitizenQuestionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CitizenQuestion.
     * @param {CitizenQuestionCreateArgs} args - Arguments to create a CitizenQuestion.
     * @example
     * // Create one CitizenQuestion
     * const CitizenQuestion = await prisma.citizenQuestion.create({
     *   data: {
     *     // ... data to create a CitizenQuestion
     *   }
     * })
     * 
     */
    create<T extends CitizenQuestionCreateArgs>(args: SelectSubset<T, CitizenQuestionCreateArgs<ExtArgs>>): Prisma__CitizenQuestionClient<$Result.GetResult<Prisma.$CitizenQuestionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CitizenQuestions.
     * @param {CitizenQuestionCreateManyArgs} args - Arguments to create many CitizenQuestions.
     * @example
     * // Create many CitizenQuestions
     * const citizenQuestion = await prisma.citizenQuestion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CitizenQuestionCreateManyArgs>(args?: SelectSubset<T, CitizenQuestionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a CitizenQuestion.
     * @param {CitizenQuestionDeleteArgs} args - Arguments to delete one CitizenQuestion.
     * @example
     * // Delete one CitizenQuestion
     * const CitizenQuestion = await prisma.citizenQuestion.delete({
     *   where: {
     *     // ... filter to delete one CitizenQuestion
     *   }
     * })
     * 
     */
    delete<T extends CitizenQuestionDeleteArgs>(args: SelectSubset<T, CitizenQuestionDeleteArgs<ExtArgs>>): Prisma__CitizenQuestionClient<$Result.GetResult<Prisma.$CitizenQuestionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CitizenQuestion.
     * @param {CitizenQuestionUpdateArgs} args - Arguments to update one CitizenQuestion.
     * @example
     * // Update one CitizenQuestion
     * const citizenQuestion = await prisma.citizenQuestion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CitizenQuestionUpdateArgs>(args: SelectSubset<T, CitizenQuestionUpdateArgs<ExtArgs>>): Prisma__CitizenQuestionClient<$Result.GetResult<Prisma.$CitizenQuestionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CitizenQuestions.
     * @param {CitizenQuestionDeleteManyArgs} args - Arguments to filter CitizenQuestions to delete.
     * @example
     * // Delete a few CitizenQuestions
     * const { count } = await prisma.citizenQuestion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CitizenQuestionDeleteManyArgs>(args?: SelectSubset<T, CitizenQuestionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CitizenQuestions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitizenQuestionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CitizenQuestions
     * const citizenQuestion = await prisma.citizenQuestion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CitizenQuestionUpdateManyArgs>(args: SelectSubset<T, CitizenQuestionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CitizenQuestion.
     * @param {CitizenQuestionUpsertArgs} args - Arguments to update or create a CitizenQuestion.
     * @example
     * // Update or create a CitizenQuestion
     * const citizenQuestion = await prisma.citizenQuestion.upsert({
     *   create: {
     *     // ... data to create a CitizenQuestion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CitizenQuestion we want to update
     *   }
     * })
     */
    upsert<T extends CitizenQuestionUpsertArgs>(args: SelectSubset<T, CitizenQuestionUpsertArgs<ExtArgs>>): Prisma__CitizenQuestionClient<$Result.GetResult<Prisma.$CitizenQuestionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CitizenQuestions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitizenQuestionCountArgs} args - Arguments to filter CitizenQuestions to count.
     * @example
     * // Count the number of CitizenQuestions
     * const count = await prisma.citizenQuestion.count({
     *   where: {
     *     // ... the filter for the CitizenQuestions we want to count
     *   }
     * })
    **/
    count<T extends CitizenQuestionCountArgs>(
      args?: Subset<T, CitizenQuestionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CitizenQuestionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CitizenQuestion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitizenQuestionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CitizenQuestionAggregateArgs>(args: Subset<T, CitizenQuestionAggregateArgs>): Prisma.PrismaPromise<GetCitizenQuestionAggregateType<T>>

    /**
     * Group by CitizenQuestion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitizenQuestionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CitizenQuestionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CitizenQuestionGroupByArgs['orderBy'] }
        : { orderBy?: CitizenQuestionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CitizenQuestionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCitizenQuestionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CitizenQuestion model
   */
  readonly fields: CitizenQuestionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CitizenQuestion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CitizenQuestionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CitizenQuestion model
   */
  interface CitizenQuestionFieldRefs {
    readonly id: FieldRef<"CitizenQuestion", 'String'>
    readonly title: FieldRef<"CitizenQuestion", 'String'>
    readonly content: FieldRef<"CitizenQuestion", 'String'>
    readonly askedByName: FieldRef<"CitizenQuestion", 'String'>
    readonly askedByEmail: FieldRef<"CitizenQuestion", 'String'>
    readonly askedByPhone: FieldRef<"CitizenQuestion", 'String'>
    readonly address: FieldRef<"CitizenQuestion", 'String'>
    readonly status: FieldRef<"CitizenQuestion", 'String'>
    readonly answerContent: FieldRef<"CitizenQuestion", 'String'>
    readonly answeredAt: FieldRef<"CitizenQuestion", 'DateTime'>
    readonly answeredById: FieldRef<"CitizenQuestion", 'String'>
    readonly isPublic: FieldRef<"CitizenQuestion", 'Boolean'>
    readonly categoryId: FieldRef<"CitizenQuestion", 'String'>
    readonly createdAt: FieldRef<"CitizenQuestion", 'DateTime'>
    readonly updatedAt: FieldRef<"CitizenQuestion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CitizenQuestion findUnique
   */
  export type CitizenQuestionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenQuestion
     */
    select?: CitizenQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenQuestion
     */
    omit?: CitizenQuestionOmit<ExtArgs> | null
    /**
     * Filter, which CitizenQuestion to fetch.
     */
    where: CitizenQuestionWhereUniqueInput
  }

  /**
   * CitizenQuestion findUniqueOrThrow
   */
  export type CitizenQuestionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenQuestion
     */
    select?: CitizenQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenQuestion
     */
    omit?: CitizenQuestionOmit<ExtArgs> | null
    /**
     * Filter, which CitizenQuestion to fetch.
     */
    where: CitizenQuestionWhereUniqueInput
  }

  /**
   * CitizenQuestion findFirst
   */
  export type CitizenQuestionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenQuestion
     */
    select?: CitizenQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenQuestion
     */
    omit?: CitizenQuestionOmit<ExtArgs> | null
    /**
     * Filter, which CitizenQuestion to fetch.
     */
    where?: CitizenQuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CitizenQuestions to fetch.
     */
    orderBy?: CitizenQuestionOrderByWithRelationInput | CitizenQuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CitizenQuestions.
     */
    cursor?: CitizenQuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CitizenQuestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CitizenQuestions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CitizenQuestions.
     */
    distinct?: CitizenQuestionScalarFieldEnum | CitizenQuestionScalarFieldEnum[]
  }

  /**
   * CitizenQuestion findFirstOrThrow
   */
  export type CitizenQuestionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenQuestion
     */
    select?: CitizenQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenQuestion
     */
    omit?: CitizenQuestionOmit<ExtArgs> | null
    /**
     * Filter, which CitizenQuestion to fetch.
     */
    where?: CitizenQuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CitizenQuestions to fetch.
     */
    orderBy?: CitizenQuestionOrderByWithRelationInput | CitizenQuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CitizenQuestions.
     */
    cursor?: CitizenQuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CitizenQuestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CitizenQuestions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CitizenQuestions.
     */
    distinct?: CitizenQuestionScalarFieldEnum | CitizenQuestionScalarFieldEnum[]
  }

  /**
   * CitizenQuestion findMany
   */
  export type CitizenQuestionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenQuestion
     */
    select?: CitizenQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenQuestion
     */
    omit?: CitizenQuestionOmit<ExtArgs> | null
    /**
     * Filter, which CitizenQuestions to fetch.
     */
    where?: CitizenQuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CitizenQuestions to fetch.
     */
    orderBy?: CitizenQuestionOrderByWithRelationInput | CitizenQuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CitizenQuestions.
     */
    cursor?: CitizenQuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CitizenQuestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CitizenQuestions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CitizenQuestions.
     */
    distinct?: CitizenQuestionScalarFieldEnum | CitizenQuestionScalarFieldEnum[]
  }

  /**
   * CitizenQuestion create
   */
  export type CitizenQuestionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenQuestion
     */
    select?: CitizenQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenQuestion
     */
    omit?: CitizenQuestionOmit<ExtArgs> | null
    /**
     * The data needed to create a CitizenQuestion.
     */
    data: XOR<CitizenQuestionCreateInput, CitizenQuestionUncheckedCreateInput>
  }

  /**
   * CitizenQuestion createMany
   */
  export type CitizenQuestionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CitizenQuestions.
     */
    data: CitizenQuestionCreateManyInput | CitizenQuestionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CitizenQuestion update
   */
  export type CitizenQuestionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenQuestion
     */
    select?: CitizenQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenQuestion
     */
    omit?: CitizenQuestionOmit<ExtArgs> | null
    /**
     * The data needed to update a CitizenQuestion.
     */
    data: XOR<CitizenQuestionUpdateInput, CitizenQuestionUncheckedUpdateInput>
    /**
     * Choose, which CitizenQuestion to update.
     */
    where: CitizenQuestionWhereUniqueInput
  }

  /**
   * CitizenQuestion updateMany
   */
  export type CitizenQuestionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CitizenQuestions.
     */
    data: XOR<CitizenQuestionUpdateManyMutationInput, CitizenQuestionUncheckedUpdateManyInput>
    /**
     * Filter which CitizenQuestions to update
     */
    where?: CitizenQuestionWhereInput
    /**
     * Limit how many CitizenQuestions to update.
     */
    limit?: number
  }

  /**
   * CitizenQuestion upsert
   */
  export type CitizenQuestionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenQuestion
     */
    select?: CitizenQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenQuestion
     */
    omit?: CitizenQuestionOmit<ExtArgs> | null
    /**
     * The filter to search for the CitizenQuestion to update in case it exists.
     */
    where: CitizenQuestionWhereUniqueInput
    /**
     * In case the CitizenQuestion found by the `where` argument doesn't exist, create a new CitizenQuestion with this data.
     */
    create: XOR<CitizenQuestionCreateInput, CitizenQuestionUncheckedCreateInput>
    /**
     * In case the CitizenQuestion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CitizenQuestionUpdateInput, CitizenQuestionUncheckedUpdateInput>
  }

  /**
   * CitizenQuestion delete
   */
  export type CitizenQuestionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenQuestion
     */
    select?: CitizenQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenQuestion
     */
    omit?: CitizenQuestionOmit<ExtArgs> | null
    /**
     * Filter which CitizenQuestion to delete.
     */
    where: CitizenQuestionWhereUniqueInput
  }

  /**
   * CitizenQuestion deleteMany
   */
  export type CitizenQuestionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CitizenQuestions to delete
     */
    where?: CitizenQuestionWhereInput
    /**
     * Limit how many CitizenQuestions to delete.
     */
    limit?: number
  }

  /**
   * CitizenQuestion without action
   */
  export type CitizenQuestionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenQuestion
     */
    select?: CitizenQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenQuestion
     */
    omit?: CitizenQuestionOmit<ExtArgs> | null
  }


  /**
   * Model CitizenFeedback
   */

  export type AggregateCitizenFeedback = {
    _count: CitizenFeedbackCountAggregateOutputType | null
    _min: CitizenFeedbackMinAggregateOutputType | null
    _max: CitizenFeedbackMaxAggregateOutputType | null
  }

  export type CitizenFeedbackMinAggregateOutputType = {
    id: string | null
    title: string | null
    content: string | null
    feedbackType: string | null
    referenceId: string | null
    senderName: string | null
    senderEmail: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CitizenFeedbackMaxAggregateOutputType = {
    id: string | null
    title: string | null
    content: string | null
    feedbackType: string | null
    referenceId: string | null
    senderName: string | null
    senderEmail: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CitizenFeedbackCountAggregateOutputType = {
    id: number
    title: number
    content: number
    feedbackType: number
    referenceId: number
    senderName: number
    senderEmail: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CitizenFeedbackMinAggregateInputType = {
    id?: true
    title?: true
    content?: true
    feedbackType?: true
    referenceId?: true
    senderName?: true
    senderEmail?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CitizenFeedbackMaxAggregateInputType = {
    id?: true
    title?: true
    content?: true
    feedbackType?: true
    referenceId?: true
    senderName?: true
    senderEmail?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CitizenFeedbackCountAggregateInputType = {
    id?: true
    title?: true
    content?: true
    feedbackType?: true
    referenceId?: true
    senderName?: true
    senderEmail?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CitizenFeedbackAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CitizenFeedback to aggregate.
     */
    where?: CitizenFeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CitizenFeedbacks to fetch.
     */
    orderBy?: CitizenFeedbackOrderByWithRelationInput | CitizenFeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CitizenFeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CitizenFeedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CitizenFeedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CitizenFeedbacks
    **/
    _count?: true | CitizenFeedbackCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CitizenFeedbackMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CitizenFeedbackMaxAggregateInputType
  }

  export type GetCitizenFeedbackAggregateType<T extends CitizenFeedbackAggregateArgs> = {
        [P in keyof T & keyof AggregateCitizenFeedback]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCitizenFeedback[P]>
      : GetScalarType<T[P], AggregateCitizenFeedback[P]>
  }




  export type CitizenFeedbackGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CitizenFeedbackWhereInput
    orderBy?: CitizenFeedbackOrderByWithAggregationInput | CitizenFeedbackOrderByWithAggregationInput[]
    by: CitizenFeedbackScalarFieldEnum[] | CitizenFeedbackScalarFieldEnum
    having?: CitizenFeedbackScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CitizenFeedbackCountAggregateInputType | true
    _min?: CitizenFeedbackMinAggregateInputType
    _max?: CitizenFeedbackMaxAggregateInputType
  }

  export type CitizenFeedbackGroupByOutputType = {
    id: string
    title: string
    content: string
    feedbackType: string
    referenceId: string | null
    senderName: string
    senderEmail: string | null
    status: string
    createdAt: Date
    updatedAt: Date
    _count: CitizenFeedbackCountAggregateOutputType | null
    _min: CitizenFeedbackMinAggregateOutputType | null
    _max: CitizenFeedbackMaxAggregateOutputType | null
  }

  type GetCitizenFeedbackGroupByPayload<T extends CitizenFeedbackGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CitizenFeedbackGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CitizenFeedbackGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CitizenFeedbackGroupByOutputType[P]>
            : GetScalarType<T[P], CitizenFeedbackGroupByOutputType[P]>
        }
      >
    >


  export type CitizenFeedbackSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    content?: boolean
    feedbackType?: boolean
    referenceId?: boolean
    senderName?: boolean
    senderEmail?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["citizenFeedback"]>



  export type CitizenFeedbackSelectScalar = {
    id?: boolean
    title?: boolean
    content?: boolean
    feedbackType?: boolean
    referenceId?: boolean
    senderName?: boolean
    senderEmail?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CitizenFeedbackOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "content" | "feedbackType" | "referenceId" | "senderName" | "senderEmail" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["citizenFeedback"]>

  export type $CitizenFeedbackPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CitizenFeedback"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      content: string
      feedbackType: string
      referenceId: string | null
      senderName: string
      senderEmail: string | null
      status: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["citizenFeedback"]>
    composites: {}
  }

  type CitizenFeedbackGetPayload<S extends boolean | null | undefined | CitizenFeedbackDefaultArgs> = $Result.GetResult<Prisma.$CitizenFeedbackPayload, S>

  type CitizenFeedbackCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CitizenFeedbackFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CitizenFeedbackCountAggregateInputType | true
    }

  export interface CitizenFeedbackDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CitizenFeedback'], meta: { name: 'CitizenFeedback' } }
    /**
     * Find zero or one CitizenFeedback that matches the filter.
     * @param {CitizenFeedbackFindUniqueArgs} args - Arguments to find a CitizenFeedback
     * @example
     * // Get one CitizenFeedback
     * const citizenFeedback = await prisma.citizenFeedback.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CitizenFeedbackFindUniqueArgs>(args: SelectSubset<T, CitizenFeedbackFindUniqueArgs<ExtArgs>>): Prisma__CitizenFeedbackClient<$Result.GetResult<Prisma.$CitizenFeedbackPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CitizenFeedback that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CitizenFeedbackFindUniqueOrThrowArgs} args - Arguments to find a CitizenFeedback
     * @example
     * // Get one CitizenFeedback
     * const citizenFeedback = await prisma.citizenFeedback.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CitizenFeedbackFindUniqueOrThrowArgs>(args: SelectSubset<T, CitizenFeedbackFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CitizenFeedbackClient<$Result.GetResult<Prisma.$CitizenFeedbackPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CitizenFeedback that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitizenFeedbackFindFirstArgs} args - Arguments to find a CitizenFeedback
     * @example
     * // Get one CitizenFeedback
     * const citizenFeedback = await prisma.citizenFeedback.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CitizenFeedbackFindFirstArgs>(args?: SelectSubset<T, CitizenFeedbackFindFirstArgs<ExtArgs>>): Prisma__CitizenFeedbackClient<$Result.GetResult<Prisma.$CitizenFeedbackPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CitizenFeedback that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitizenFeedbackFindFirstOrThrowArgs} args - Arguments to find a CitizenFeedback
     * @example
     * // Get one CitizenFeedback
     * const citizenFeedback = await prisma.citizenFeedback.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CitizenFeedbackFindFirstOrThrowArgs>(args?: SelectSubset<T, CitizenFeedbackFindFirstOrThrowArgs<ExtArgs>>): Prisma__CitizenFeedbackClient<$Result.GetResult<Prisma.$CitizenFeedbackPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CitizenFeedbacks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitizenFeedbackFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CitizenFeedbacks
     * const citizenFeedbacks = await prisma.citizenFeedback.findMany()
     * 
     * // Get first 10 CitizenFeedbacks
     * const citizenFeedbacks = await prisma.citizenFeedback.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const citizenFeedbackWithIdOnly = await prisma.citizenFeedback.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CitizenFeedbackFindManyArgs>(args?: SelectSubset<T, CitizenFeedbackFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CitizenFeedbackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CitizenFeedback.
     * @param {CitizenFeedbackCreateArgs} args - Arguments to create a CitizenFeedback.
     * @example
     * // Create one CitizenFeedback
     * const CitizenFeedback = await prisma.citizenFeedback.create({
     *   data: {
     *     // ... data to create a CitizenFeedback
     *   }
     * })
     * 
     */
    create<T extends CitizenFeedbackCreateArgs>(args: SelectSubset<T, CitizenFeedbackCreateArgs<ExtArgs>>): Prisma__CitizenFeedbackClient<$Result.GetResult<Prisma.$CitizenFeedbackPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CitizenFeedbacks.
     * @param {CitizenFeedbackCreateManyArgs} args - Arguments to create many CitizenFeedbacks.
     * @example
     * // Create many CitizenFeedbacks
     * const citizenFeedback = await prisma.citizenFeedback.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CitizenFeedbackCreateManyArgs>(args?: SelectSubset<T, CitizenFeedbackCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a CitizenFeedback.
     * @param {CitizenFeedbackDeleteArgs} args - Arguments to delete one CitizenFeedback.
     * @example
     * // Delete one CitizenFeedback
     * const CitizenFeedback = await prisma.citizenFeedback.delete({
     *   where: {
     *     // ... filter to delete one CitizenFeedback
     *   }
     * })
     * 
     */
    delete<T extends CitizenFeedbackDeleteArgs>(args: SelectSubset<T, CitizenFeedbackDeleteArgs<ExtArgs>>): Prisma__CitizenFeedbackClient<$Result.GetResult<Prisma.$CitizenFeedbackPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CitizenFeedback.
     * @param {CitizenFeedbackUpdateArgs} args - Arguments to update one CitizenFeedback.
     * @example
     * // Update one CitizenFeedback
     * const citizenFeedback = await prisma.citizenFeedback.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CitizenFeedbackUpdateArgs>(args: SelectSubset<T, CitizenFeedbackUpdateArgs<ExtArgs>>): Prisma__CitizenFeedbackClient<$Result.GetResult<Prisma.$CitizenFeedbackPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CitizenFeedbacks.
     * @param {CitizenFeedbackDeleteManyArgs} args - Arguments to filter CitizenFeedbacks to delete.
     * @example
     * // Delete a few CitizenFeedbacks
     * const { count } = await prisma.citizenFeedback.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CitizenFeedbackDeleteManyArgs>(args?: SelectSubset<T, CitizenFeedbackDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CitizenFeedbacks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitizenFeedbackUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CitizenFeedbacks
     * const citizenFeedback = await prisma.citizenFeedback.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CitizenFeedbackUpdateManyArgs>(args: SelectSubset<T, CitizenFeedbackUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CitizenFeedback.
     * @param {CitizenFeedbackUpsertArgs} args - Arguments to update or create a CitizenFeedback.
     * @example
     * // Update or create a CitizenFeedback
     * const citizenFeedback = await prisma.citizenFeedback.upsert({
     *   create: {
     *     // ... data to create a CitizenFeedback
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CitizenFeedback we want to update
     *   }
     * })
     */
    upsert<T extends CitizenFeedbackUpsertArgs>(args: SelectSubset<T, CitizenFeedbackUpsertArgs<ExtArgs>>): Prisma__CitizenFeedbackClient<$Result.GetResult<Prisma.$CitizenFeedbackPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CitizenFeedbacks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitizenFeedbackCountArgs} args - Arguments to filter CitizenFeedbacks to count.
     * @example
     * // Count the number of CitizenFeedbacks
     * const count = await prisma.citizenFeedback.count({
     *   where: {
     *     // ... the filter for the CitizenFeedbacks we want to count
     *   }
     * })
    **/
    count<T extends CitizenFeedbackCountArgs>(
      args?: Subset<T, CitizenFeedbackCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CitizenFeedbackCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CitizenFeedback.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitizenFeedbackAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CitizenFeedbackAggregateArgs>(args: Subset<T, CitizenFeedbackAggregateArgs>): Prisma.PrismaPromise<GetCitizenFeedbackAggregateType<T>>

    /**
     * Group by CitizenFeedback.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitizenFeedbackGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CitizenFeedbackGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CitizenFeedbackGroupByArgs['orderBy'] }
        : { orderBy?: CitizenFeedbackGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CitizenFeedbackGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCitizenFeedbackGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CitizenFeedback model
   */
  readonly fields: CitizenFeedbackFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CitizenFeedback.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CitizenFeedbackClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CitizenFeedback model
   */
  interface CitizenFeedbackFieldRefs {
    readonly id: FieldRef<"CitizenFeedback", 'String'>
    readonly title: FieldRef<"CitizenFeedback", 'String'>
    readonly content: FieldRef<"CitizenFeedback", 'String'>
    readonly feedbackType: FieldRef<"CitizenFeedback", 'String'>
    readonly referenceId: FieldRef<"CitizenFeedback", 'String'>
    readonly senderName: FieldRef<"CitizenFeedback", 'String'>
    readonly senderEmail: FieldRef<"CitizenFeedback", 'String'>
    readonly status: FieldRef<"CitizenFeedback", 'String'>
    readonly createdAt: FieldRef<"CitizenFeedback", 'DateTime'>
    readonly updatedAt: FieldRef<"CitizenFeedback", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CitizenFeedback findUnique
   */
  export type CitizenFeedbackFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenFeedback
     */
    select?: CitizenFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenFeedback
     */
    omit?: CitizenFeedbackOmit<ExtArgs> | null
    /**
     * Filter, which CitizenFeedback to fetch.
     */
    where: CitizenFeedbackWhereUniqueInput
  }

  /**
   * CitizenFeedback findUniqueOrThrow
   */
  export type CitizenFeedbackFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenFeedback
     */
    select?: CitizenFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenFeedback
     */
    omit?: CitizenFeedbackOmit<ExtArgs> | null
    /**
     * Filter, which CitizenFeedback to fetch.
     */
    where: CitizenFeedbackWhereUniqueInput
  }

  /**
   * CitizenFeedback findFirst
   */
  export type CitizenFeedbackFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenFeedback
     */
    select?: CitizenFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenFeedback
     */
    omit?: CitizenFeedbackOmit<ExtArgs> | null
    /**
     * Filter, which CitizenFeedback to fetch.
     */
    where?: CitizenFeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CitizenFeedbacks to fetch.
     */
    orderBy?: CitizenFeedbackOrderByWithRelationInput | CitizenFeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CitizenFeedbacks.
     */
    cursor?: CitizenFeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CitizenFeedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CitizenFeedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CitizenFeedbacks.
     */
    distinct?: CitizenFeedbackScalarFieldEnum | CitizenFeedbackScalarFieldEnum[]
  }

  /**
   * CitizenFeedback findFirstOrThrow
   */
  export type CitizenFeedbackFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenFeedback
     */
    select?: CitizenFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenFeedback
     */
    omit?: CitizenFeedbackOmit<ExtArgs> | null
    /**
     * Filter, which CitizenFeedback to fetch.
     */
    where?: CitizenFeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CitizenFeedbacks to fetch.
     */
    orderBy?: CitizenFeedbackOrderByWithRelationInput | CitizenFeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CitizenFeedbacks.
     */
    cursor?: CitizenFeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CitizenFeedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CitizenFeedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CitizenFeedbacks.
     */
    distinct?: CitizenFeedbackScalarFieldEnum | CitizenFeedbackScalarFieldEnum[]
  }

  /**
   * CitizenFeedback findMany
   */
  export type CitizenFeedbackFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenFeedback
     */
    select?: CitizenFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenFeedback
     */
    omit?: CitizenFeedbackOmit<ExtArgs> | null
    /**
     * Filter, which CitizenFeedbacks to fetch.
     */
    where?: CitizenFeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CitizenFeedbacks to fetch.
     */
    orderBy?: CitizenFeedbackOrderByWithRelationInput | CitizenFeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CitizenFeedbacks.
     */
    cursor?: CitizenFeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CitizenFeedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CitizenFeedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CitizenFeedbacks.
     */
    distinct?: CitizenFeedbackScalarFieldEnum | CitizenFeedbackScalarFieldEnum[]
  }

  /**
   * CitizenFeedback create
   */
  export type CitizenFeedbackCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenFeedback
     */
    select?: CitizenFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenFeedback
     */
    omit?: CitizenFeedbackOmit<ExtArgs> | null
    /**
     * The data needed to create a CitizenFeedback.
     */
    data: XOR<CitizenFeedbackCreateInput, CitizenFeedbackUncheckedCreateInput>
  }

  /**
   * CitizenFeedback createMany
   */
  export type CitizenFeedbackCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CitizenFeedbacks.
     */
    data: CitizenFeedbackCreateManyInput | CitizenFeedbackCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CitizenFeedback update
   */
  export type CitizenFeedbackUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenFeedback
     */
    select?: CitizenFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenFeedback
     */
    omit?: CitizenFeedbackOmit<ExtArgs> | null
    /**
     * The data needed to update a CitizenFeedback.
     */
    data: XOR<CitizenFeedbackUpdateInput, CitizenFeedbackUncheckedUpdateInput>
    /**
     * Choose, which CitizenFeedback to update.
     */
    where: CitizenFeedbackWhereUniqueInput
  }

  /**
   * CitizenFeedback updateMany
   */
  export type CitizenFeedbackUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CitizenFeedbacks.
     */
    data: XOR<CitizenFeedbackUpdateManyMutationInput, CitizenFeedbackUncheckedUpdateManyInput>
    /**
     * Filter which CitizenFeedbacks to update
     */
    where?: CitizenFeedbackWhereInput
    /**
     * Limit how many CitizenFeedbacks to update.
     */
    limit?: number
  }

  /**
   * CitizenFeedback upsert
   */
  export type CitizenFeedbackUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenFeedback
     */
    select?: CitizenFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenFeedback
     */
    omit?: CitizenFeedbackOmit<ExtArgs> | null
    /**
     * The filter to search for the CitizenFeedback to update in case it exists.
     */
    where: CitizenFeedbackWhereUniqueInput
    /**
     * In case the CitizenFeedback found by the `where` argument doesn't exist, create a new CitizenFeedback with this data.
     */
    create: XOR<CitizenFeedbackCreateInput, CitizenFeedbackUncheckedCreateInput>
    /**
     * In case the CitizenFeedback was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CitizenFeedbackUpdateInput, CitizenFeedbackUncheckedUpdateInput>
  }

  /**
   * CitizenFeedback delete
   */
  export type CitizenFeedbackDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenFeedback
     */
    select?: CitizenFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenFeedback
     */
    omit?: CitizenFeedbackOmit<ExtArgs> | null
    /**
     * Filter which CitizenFeedback to delete.
     */
    where: CitizenFeedbackWhereUniqueInput
  }

  /**
   * CitizenFeedback deleteMany
   */
  export type CitizenFeedbackDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CitizenFeedbacks to delete
     */
    where?: CitizenFeedbackWhereInput
    /**
     * Limit how many CitizenFeedbacks to delete.
     */
    limit?: number
  }

  /**
   * CitizenFeedback without action
   */
  export type CitizenFeedbackDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CitizenFeedback
     */
    select?: CitizenFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CitizenFeedback
     */
    omit?: CitizenFeedbackOmit<ExtArgs> | null
  }


  /**
   * Model PortalConfig
   */

  export type AggregatePortalConfig = {
    _count: PortalConfigCountAggregateOutputType | null
    _avg: PortalConfigAvgAggregateOutputType | null
    _sum: PortalConfigSumAggregateOutputType | null
    _min: PortalConfigMinAggregateOutputType | null
    _max: PortalConfigMaxAggregateOutputType | null
  }

  export type PortalConfigAvgAggregateOutputType = {
    id: number | null
  }

  export type PortalConfigSumAggregateOutputType = {
    id: number | null
  }

  export type PortalConfigMinAggregateOutputType = {
    id: number | null
    code: string | null
    name: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PortalConfigMaxAggregateOutputType = {
    id: number | null
    code: string | null
    name: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PortalConfigCountAggregateOutputType = {
    id: number
    code: number
    name: number
    description: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PortalConfigAvgAggregateInputType = {
    id?: true
  }

  export type PortalConfigSumAggregateInputType = {
    id?: true
  }

  export type PortalConfigMinAggregateInputType = {
    id?: true
    code?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PortalConfigMaxAggregateInputType = {
    id?: true
    code?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PortalConfigCountAggregateInputType = {
    id?: true
    code?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PortalConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PortalConfig to aggregate.
     */
    where?: PortalConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortalConfigs to fetch.
     */
    orderBy?: PortalConfigOrderByWithRelationInput | PortalConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PortalConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortalConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortalConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PortalConfigs
    **/
    _count?: true | PortalConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PortalConfigAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PortalConfigSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PortalConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PortalConfigMaxAggregateInputType
  }

  export type GetPortalConfigAggregateType<T extends PortalConfigAggregateArgs> = {
        [P in keyof T & keyof AggregatePortalConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePortalConfig[P]>
      : GetScalarType<T[P], AggregatePortalConfig[P]>
  }




  export type PortalConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PortalConfigWhereInput
    orderBy?: PortalConfigOrderByWithAggregationInput | PortalConfigOrderByWithAggregationInput[]
    by: PortalConfigScalarFieldEnum[] | PortalConfigScalarFieldEnum
    having?: PortalConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PortalConfigCountAggregateInputType | true
    _avg?: PortalConfigAvgAggregateInputType
    _sum?: PortalConfigSumAggregateInputType
    _min?: PortalConfigMinAggregateInputType
    _max?: PortalConfigMaxAggregateInputType
  }

  export type PortalConfigGroupByOutputType = {
    id: number
    code: string
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    _count: PortalConfigCountAggregateOutputType | null
    _avg: PortalConfigAvgAggregateOutputType | null
    _sum: PortalConfigSumAggregateOutputType | null
    _min: PortalConfigMinAggregateOutputType | null
    _max: PortalConfigMaxAggregateOutputType | null
  }

  type GetPortalConfigGroupByPayload<T extends PortalConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PortalConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PortalConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PortalConfigGroupByOutputType[P]>
            : GetScalarType<T[P], PortalConfigGroupByOutputType[P]>
        }
      >
    >


  export type PortalConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["portalConfig"]>



  export type PortalConfigSelectScalar = {
    id?: boolean
    code?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PortalConfigOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "code" | "name" | "description" | "createdAt" | "updatedAt", ExtArgs["result"]["portalConfig"]>

  export type $PortalConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PortalConfig"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      code: string
      name: string
      description: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["portalConfig"]>
    composites: {}
  }

  type PortalConfigGetPayload<S extends boolean | null | undefined | PortalConfigDefaultArgs> = $Result.GetResult<Prisma.$PortalConfigPayload, S>

  type PortalConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PortalConfigFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PortalConfigCountAggregateInputType | true
    }

  export interface PortalConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PortalConfig'], meta: { name: 'PortalConfig' } }
    /**
     * Find zero or one PortalConfig that matches the filter.
     * @param {PortalConfigFindUniqueArgs} args - Arguments to find a PortalConfig
     * @example
     * // Get one PortalConfig
     * const portalConfig = await prisma.portalConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PortalConfigFindUniqueArgs>(args: SelectSubset<T, PortalConfigFindUniqueArgs<ExtArgs>>): Prisma__PortalConfigClient<$Result.GetResult<Prisma.$PortalConfigPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PortalConfig that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PortalConfigFindUniqueOrThrowArgs} args - Arguments to find a PortalConfig
     * @example
     * // Get one PortalConfig
     * const portalConfig = await prisma.portalConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PortalConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, PortalConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PortalConfigClient<$Result.GetResult<Prisma.$PortalConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PortalConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalConfigFindFirstArgs} args - Arguments to find a PortalConfig
     * @example
     * // Get one PortalConfig
     * const portalConfig = await prisma.portalConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PortalConfigFindFirstArgs>(args?: SelectSubset<T, PortalConfigFindFirstArgs<ExtArgs>>): Prisma__PortalConfigClient<$Result.GetResult<Prisma.$PortalConfigPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PortalConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalConfigFindFirstOrThrowArgs} args - Arguments to find a PortalConfig
     * @example
     * // Get one PortalConfig
     * const portalConfig = await prisma.portalConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PortalConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, PortalConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__PortalConfigClient<$Result.GetResult<Prisma.$PortalConfigPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PortalConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PortalConfigs
     * const portalConfigs = await prisma.portalConfig.findMany()
     * 
     * // Get first 10 PortalConfigs
     * const portalConfigs = await prisma.portalConfig.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const portalConfigWithIdOnly = await prisma.portalConfig.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PortalConfigFindManyArgs>(args?: SelectSubset<T, PortalConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortalConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PortalConfig.
     * @param {PortalConfigCreateArgs} args - Arguments to create a PortalConfig.
     * @example
     * // Create one PortalConfig
     * const PortalConfig = await prisma.portalConfig.create({
     *   data: {
     *     // ... data to create a PortalConfig
     *   }
     * })
     * 
     */
    create<T extends PortalConfigCreateArgs>(args: SelectSubset<T, PortalConfigCreateArgs<ExtArgs>>): Prisma__PortalConfigClient<$Result.GetResult<Prisma.$PortalConfigPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PortalConfigs.
     * @param {PortalConfigCreateManyArgs} args - Arguments to create many PortalConfigs.
     * @example
     * // Create many PortalConfigs
     * const portalConfig = await prisma.portalConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PortalConfigCreateManyArgs>(args?: SelectSubset<T, PortalConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a PortalConfig.
     * @param {PortalConfigDeleteArgs} args - Arguments to delete one PortalConfig.
     * @example
     * // Delete one PortalConfig
     * const PortalConfig = await prisma.portalConfig.delete({
     *   where: {
     *     // ... filter to delete one PortalConfig
     *   }
     * })
     * 
     */
    delete<T extends PortalConfigDeleteArgs>(args: SelectSubset<T, PortalConfigDeleteArgs<ExtArgs>>): Prisma__PortalConfigClient<$Result.GetResult<Prisma.$PortalConfigPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PortalConfig.
     * @param {PortalConfigUpdateArgs} args - Arguments to update one PortalConfig.
     * @example
     * // Update one PortalConfig
     * const portalConfig = await prisma.portalConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PortalConfigUpdateArgs>(args: SelectSubset<T, PortalConfigUpdateArgs<ExtArgs>>): Prisma__PortalConfigClient<$Result.GetResult<Prisma.$PortalConfigPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PortalConfigs.
     * @param {PortalConfigDeleteManyArgs} args - Arguments to filter PortalConfigs to delete.
     * @example
     * // Delete a few PortalConfigs
     * const { count } = await prisma.portalConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PortalConfigDeleteManyArgs>(args?: SelectSubset<T, PortalConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PortalConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PortalConfigs
     * const portalConfig = await prisma.portalConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PortalConfigUpdateManyArgs>(args: SelectSubset<T, PortalConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PortalConfig.
     * @param {PortalConfigUpsertArgs} args - Arguments to update or create a PortalConfig.
     * @example
     * // Update or create a PortalConfig
     * const portalConfig = await prisma.portalConfig.upsert({
     *   create: {
     *     // ... data to create a PortalConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PortalConfig we want to update
     *   }
     * })
     */
    upsert<T extends PortalConfigUpsertArgs>(args: SelectSubset<T, PortalConfigUpsertArgs<ExtArgs>>): Prisma__PortalConfigClient<$Result.GetResult<Prisma.$PortalConfigPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PortalConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalConfigCountArgs} args - Arguments to filter PortalConfigs to count.
     * @example
     * // Count the number of PortalConfigs
     * const count = await prisma.portalConfig.count({
     *   where: {
     *     // ... the filter for the PortalConfigs we want to count
     *   }
     * })
    **/
    count<T extends PortalConfigCountArgs>(
      args?: Subset<T, PortalConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PortalConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PortalConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PortalConfigAggregateArgs>(args: Subset<T, PortalConfigAggregateArgs>): Prisma.PrismaPromise<GetPortalConfigAggregateType<T>>

    /**
     * Group by PortalConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalConfigGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PortalConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PortalConfigGroupByArgs['orderBy'] }
        : { orderBy?: PortalConfigGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PortalConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPortalConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PortalConfig model
   */
  readonly fields: PortalConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PortalConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PortalConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PortalConfig model
   */
  interface PortalConfigFieldRefs {
    readonly id: FieldRef<"PortalConfig", 'Int'>
    readonly code: FieldRef<"PortalConfig", 'String'>
    readonly name: FieldRef<"PortalConfig", 'String'>
    readonly description: FieldRef<"PortalConfig", 'String'>
    readonly createdAt: FieldRef<"PortalConfig", 'DateTime'>
    readonly updatedAt: FieldRef<"PortalConfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PortalConfig findUnique
   */
  export type PortalConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalConfig
     */
    select?: PortalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalConfig
     */
    omit?: PortalConfigOmit<ExtArgs> | null
    /**
     * Filter, which PortalConfig to fetch.
     */
    where: PortalConfigWhereUniqueInput
  }

  /**
   * PortalConfig findUniqueOrThrow
   */
  export type PortalConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalConfig
     */
    select?: PortalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalConfig
     */
    omit?: PortalConfigOmit<ExtArgs> | null
    /**
     * Filter, which PortalConfig to fetch.
     */
    where: PortalConfigWhereUniqueInput
  }

  /**
   * PortalConfig findFirst
   */
  export type PortalConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalConfig
     */
    select?: PortalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalConfig
     */
    omit?: PortalConfigOmit<ExtArgs> | null
    /**
     * Filter, which PortalConfig to fetch.
     */
    where?: PortalConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortalConfigs to fetch.
     */
    orderBy?: PortalConfigOrderByWithRelationInput | PortalConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PortalConfigs.
     */
    cursor?: PortalConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortalConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortalConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PortalConfigs.
     */
    distinct?: PortalConfigScalarFieldEnum | PortalConfigScalarFieldEnum[]
  }

  /**
   * PortalConfig findFirstOrThrow
   */
  export type PortalConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalConfig
     */
    select?: PortalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalConfig
     */
    omit?: PortalConfigOmit<ExtArgs> | null
    /**
     * Filter, which PortalConfig to fetch.
     */
    where?: PortalConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortalConfigs to fetch.
     */
    orderBy?: PortalConfigOrderByWithRelationInput | PortalConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PortalConfigs.
     */
    cursor?: PortalConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortalConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortalConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PortalConfigs.
     */
    distinct?: PortalConfigScalarFieldEnum | PortalConfigScalarFieldEnum[]
  }

  /**
   * PortalConfig findMany
   */
  export type PortalConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalConfig
     */
    select?: PortalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalConfig
     */
    omit?: PortalConfigOmit<ExtArgs> | null
    /**
     * Filter, which PortalConfigs to fetch.
     */
    where?: PortalConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortalConfigs to fetch.
     */
    orderBy?: PortalConfigOrderByWithRelationInput | PortalConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PortalConfigs.
     */
    cursor?: PortalConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortalConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortalConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PortalConfigs.
     */
    distinct?: PortalConfigScalarFieldEnum | PortalConfigScalarFieldEnum[]
  }

  /**
   * PortalConfig create
   */
  export type PortalConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalConfig
     */
    select?: PortalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalConfig
     */
    omit?: PortalConfigOmit<ExtArgs> | null
    /**
     * The data needed to create a PortalConfig.
     */
    data: XOR<PortalConfigCreateInput, PortalConfigUncheckedCreateInput>
  }

  /**
   * PortalConfig createMany
   */
  export type PortalConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PortalConfigs.
     */
    data: PortalConfigCreateManyInput | PortalConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PortalConfig update
   */
  export type PortalConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalConfig
     */
    select?: PortalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalConfig
     */
    omit?: PortalConfigOmit<ExtArgs> | null
    /**
     * The data needed to update a PortalConfig.
     */
    data: XOR<PortalConfigUpdateInput, PortalConfigUncheckedUpdateInput>
    /**
     * Choose, which PortalConfig to update.
     */
    where: PortalConfigWhereUniqueInput
  }

  /**
   * PortalConfig updateMany
   */
  export type PortalConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PortalConfigs.
     */
    data: XOR<PortalConfigUpdateManyMutationInput, PortalConfigUncheckedUpdateManyInput>
    /**
     * Filter which PortalConfigs to update
     */
    where?: PortalConfigWhereInput
    /**
     * Limit how many PortalConfigs to update.
     */
    limit?: number
  }

  /**
   * PortalConfig upsert
   */
  export type PortalConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalConfig
     */
    select?: PortalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalConfig
     */
    omit?: PortalConfigOmit<ExtArgs> | null
    /**
     * The filter to search for the PortalConfig to update in case it exists.
     */
    where: PortalConfigWhereUniqueInput
    /**
     * In case the PortalConfig found by the `where` argument doesn't exist, create a new PortalConfig with this data.
     */
    create: XOR<PortalConfigCreateInput, PortalConfigUncheckedCreateInput>
    /**
     * In case the PortalConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PortalConfigUpdateInput, PortalConfigUncheckedUpdateInput>
  }

  /**
   * PortalConfig delete
   */
  export type PortalConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalConfig
     */
    select?: PortalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalConfig
     */
    omit?: PortalConfigOmit<ExtArgs> | null
    /**
     * Filter which PortalConfig to delete.
     */
    where: PortalConfigWhereUniqueInput
  }

  /**
   * PortalConfig deleteMany
   */
  export type PortalConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PortalConfigs to delete
     */
    where?: PortalConfigWhereInput
    /**
     * Limit how many PortalConfigs to delete.
     */
    limit?: number
  }

  /**
   * PortalConfig without action
   */
  export type PortalConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalConfig
     */
    select?: PortalConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalConfig
     */
    omit?: PortalConfigOmit<ExtArgs> | null
  }


  /**
   * Model PortalMenu
   */

  export type AggregatePortalMenu = {
    _count: PortalMenuCountAggregateOutputType | null
    _avg: PortalMenuAvgAggregateOutputType | null
    _sum: PortalMenuSumAggregateOutputType | null
    _min: PortalMenuMinAggregateOutputType | null
    _max: PortalMenuMaxAggregateOutputType | null
  }

  export type PortalMenuAvgAggregateOutputType = {
    order: number | null
  }

  export type PortalMenuSumAggregateOutputType = {
    order: number | null
  }

  export type PortalMenuMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    icon: string | null
    link: string | null
    order: number | null
    parentId: string | null
    isActive: boolean | null
    target: string | null
    type: string | null
    referenceId: string | null
    position: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PortalMenuMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    icon: string | null
    link: string | null
    order: number | null
    parentId: string | null
    isActive: boolean | null
    target: string | null
    type: string | null
    referenceId: string | null
    position: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PortalMenuCountAggregateOutputType = {
    id: number
    name: number
    description: number
    translations: number
    icon: number
    link: number
    order: number
    parentId: number
    isActive: number
    target: number
    type: number
    referenceId: number
    position: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PortalMenuAvgAggregateInputType = {
    order?: true
  }

  export type PortalMenuSumAggregateInputType = {
    order?: true
  }

  export type PortalMenuMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    icon?: true
    link?: true
    order?: true
    parentId?: true
    isActive?: true
    target?: true
    type?: true
    referenceId?: true
    position?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PortalMenuMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    icon?: true
    link?: true
    order?: true
    parentId?: true
    isActive?: true
    target?: true
    type?: true
    referenceId?: true
    position?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PortalMenuCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    translations?: true
    icon?: true
    link?: true
    order?: true
    parentId?: true
    isActive?: true
    target?: true
    type?: true
    referenceId?: true
    position?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PortalMenuAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PortalMenu to aggregate.
     */
    where?: PortalMenuWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortalMenus to fetch.
     */
    orderBy?: PortalMenuOrderByWithRelationInput | PortalMenuOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PortalMenuWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortalMenus from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortalMenus.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PortalMenus
    **/
    _count?: true | PortalMenuCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PortalMenuAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PortalMenuSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PortalMenuMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PortalMenuMaxAggregateInputType
  }

  export type GetPortalMenuAggregateType<T extends PortalMenuAggregateArgs> = {
        [P in keyof T & keyof AggregatePortalMenu]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePortalMenu[P]>
      : GetScalarType<T[P], AggregatePortalMenu[P]>
  }




  export type PortalMenuGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PortalMenuWhereInput
    orderBy?: PortalMenuOrderByWithAggregationInput | PortalMenuOrderByWithAggregationInput[]
    by: PortalMenuScalarFieldEnum[] | PortalMenuScalarFieldEnum
    having?: PortalMenuScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PortalMenuCountAggregateInputType | true
    _avg?: PortalMenuAvgAggregateInputType
    _sum?: PortalMenuSumAggregateInputType
    _min?: PortalMenuMinAggregateInputType
    _max?: PortalMenuMaxAggregateInputType
  }

  export type PortalMenuGroupByOutputType = {
    id: string
    name: string
    description: string | null
    translations: JsonValue | null
    icon: string | null
    link: string | null
    order: number
    parentId: string | null
    isActive: boolean
    target: string
    type: string
    referenceId: string | null
    position: string
    createdAt: Date
    updatedAt: Date
    _count: PortalMenuCountAggregateOutputType | null
    _avg: PortalMenuAvgAggregateOutputType | null
    _sum: PortalMenuSumAggregateOutputType | null
    _min: PortalMenuMinAggregateOutputType | null
    _max: PortalMenuMaxAggregateOutputType | null
  }

  type GetPortalMenuGroupByPayload<T extends PortalMenuGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PortalMenuGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PortalMenuGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PortalMenuGroupByOutputType[P]>
            : GetScalarType<T[P], PortalMenuGroupByOutputType[P]>
        }
      >
    >


  export type PortalMenuSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    translations?: boolean
    icon?: boolean
    link?: boolean
    order?: boolean
    parentId?: boolean
    isActive?: boolean
    target?: boolean
    type?: boolean
    referenceId?: boolean
    position?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parent?: boolean | PortalMenu$parentArgs<ExtArgs>
    children?: boolean | PortalMenu$childrenArgs<ExtArgs>
    _count?: boolean | PortalMenuCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["portalMenu"]>



  export type PortalMenuSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    translations?: boolean
    icon?: boolean
    link?: boolean
    order?: boolean
    parentId?: boolean
    isActive?: boolean
    target?: boolean
    type?: boolean
    referenceId?: boolean
    position?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PortalMenuOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "translations" | "icon" | "link" | "order" | "parentId" | "isActive" | "target" | "type" | "referenceId" | "position" | "createdAt" | "updatedAt", ExtArgs["result"]["portalMenu"]>
  export type PortalMenuInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | PortalMenu$parentArgs<ExtArgs>
    children?: boolean | PortalMenu$childrenArgs<ExtArgs>
    _count?: boolean | PortalMenuCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $PortalMenuPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PortalMenu"
    objects: {
      parent: Prisma.$PortalMenuPayload<ExtArgs> | null
      children: Prisma.$PortalMenuPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      translations: Prisma.JsonValue | null
      icon: string | null
      link: string | null
      order: number
      parentId: string | null
      isActive: boolean
      target: string
      type: string
      referenceId: string | null
      position: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["portalMenu"]>
    composites: {}
  }

  type PortalMenuGetPayload<S extends boolean | null | undefined | PortalMenuDefaultArgs> = $Result.GetResult<Prisma.$PortalMenuPayload, S>

  type PortalMenuCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PortalMenuFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PortalMenuCountAggregateInputType | true
    }

  export interface PortalMenuDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PortalMenu'], meta: { name: 'PortalMenu' } }
    /**
     * Find zero or one PortalMenu that matches the filter.
     * @param {PortalMenuFindUniqueArgs} args - Arguments to find a PortalMenu
     * @example
     * // Get one PortalMenu
     * const portalMenu = await prisma.portalMenu.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PortalMenuFindUniqueArgs>(args: SelectSubset<T, PortalMenuFindUniqueArgs<ExtArgs>>): Prisma__PortalMenuClient<$Result.GetResult<Prisma.$PortalMenuPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PortalMenu that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PortalMenuFindUniqueOrThrowArgs} args - Arguments to find a PortalMenu
     * @example
     * // Get one PortalMenu
     * const portalMenu = await prisma.portalMenu.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PortalMenuFindUniqueOrThrowArgs>(args: SelectSubset<T, PortalMenuFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PortalMenuClient<$Result.GetResult<Prisma.$PortalMenuPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PortalMenu that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalMenuFindFirstArgs} args - Arguments to find a PortalMenu
     * @example
     * // Get one PortalMenu
     * const portalMenu = await prisma.portalMenu.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PortalMenuFindFirstArgs>(args?: SelectSubset<T, PortalMenuFindFirstArgs<ExtArgs>>): Prisma__PortalMenuClient<$Result.GetResult<Prisma.$PortalMenuPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PortalMenu that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalMenuFindFirstOrThrowArgs} args - Arguments to find a PortalMenu
     * @example
     * // Get one PortalMenu
     * const portalMenu = await prisma.portalMenu.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PortalMenuFindFirstOrThrowArgs>(args?: SelectSubset<T, PortalMenuFindFirstOrThrowArgs<ExtArgs>>): Prisma__PortalMenuClient<$Result.GetResult<Prisma.$PortalMenuPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PortalMenus that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalMenuFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PortalMenus
     * const portalMenus = await prisma.portalMenu.findMany()
     * 
     * // Get first 10 PortalMenus
     * const portalMenus = await prisma.portalMenu.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const portalMenuWithIdOnly = await prisma.portalMenu.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PortalMenuFindManyArgs>(args?: SelectSubset<T, PortalMenuFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortalMenuPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PortalMenu.
     * @param {PortalMenuCreateArgs} args - Arguments to create a PortalMenu.
     * @example
     * // Create one PortalMenu
     * const PortalMenu = await prisma.portalMenu.create({
     *   data: {
     *     // ... data to create a PortalMenu
     *   }
     * })
     * 
     */
    create<T extends PortalMenuCreateArgs>(args: SelectSubset<T, PortalMenuCreateArgs<ExtArgs>>): Prisma__PortalMenuClient<$Result.GetResult<Prisma.$PortalMenuPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PortalMenus.
     * @param {PortalMenuCreateManyArgs} args - Arguments to create many PortalMenus.
     * @example
     * // Create many PortalMenus
     * const portalMenu = await prisma.portalMenu.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PortalMenuCreateManyArgs>(args?: SelectSubset<T, PortalMenuCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a PortalMenu.
     * @param {PortalMenuDeleteArgs} args - Arguments to delete one PortalMenu.
     * @example
     * // Delete one PortalMenu
     * const PortalMenu = await prisma.portalMenu.delete({
     *   where: {
     *     // ... filter to delete one PortalMenu
     *   }
     * })
     * 
     */
    delete<T extends PortalMenuDeleteArgs>(args: SelectSubset<T, PortalMenuDeleteArgs<ExtArgs>>): Prisma__PortalMenuClient<$Result.GetResult<Prisma.$PortalMenuPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PortalMenu.
     * @param {PortalMenuUpdateArgs} args - Arguments to update one PortalMenu.
     * @example
     * // Update one PortalMenu
     * const portalMenu = await prisma.portalMenu.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PortalMenuUpdateArgs>(args: SelectSubset<T, PortalMenuUpdateArgs<ExtArgs>>): Prisma__PortalMenuClient<$Result.GetResult<Prisma.$PortalMenuPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PortalMenus.
     * @param {PortalMenuDeleteManyArgs} args - Arguments to filter PortalMenus to delete.
     * @example
     * // Delete a few PortalMenus
     * const { count } = await prisma.portalMenu.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PortalMenuDeleteManyArgs>(args?: SelectSubset<T, PortalMenuDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PortalMenus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalMenuUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PortalMenus
     * const portalMenu = await prisma.portalMenu.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PortalMenuUpdateManyArgs>(args: SelectSubset<T, PortalMenuUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PortalMenu.
     * @param {PortalMenuUpsertArgs} args - Arguments to update or create a PortalMenu.
     * @example
     * // Update or create a PortalMenu
     * const portalMenu = await prisma.portalMenu.upsert({
     *   create: {
     *     // ... data to create a PortalMenu
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PortalMenu we want to update
     *   }
     * })
     */
    upsert<T extends PortalMenuUpsertArgs>(args: SelectSubset<T, PortalMenuUpsertArgs<ExtArgs>>): Prisma__PortalMenuClient<$Result.GetResult<Prisma.$PortalMenuPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PortalMenus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalMenuCountArgs} args - Arguments to filter PortalMenus to count.
     * @example
     * // Count the number of PortalMenus
     * const count = await prisma.portalMenu.count({
     *   where: {
     *     // ... the filter for the PortalMenus we want to count
     *   }
     * })
    **/
    count<T extends PortalMenuCountArgs>(
      args?: Subset<T, PortalMenuCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PortalMenuCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PortalMenu.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalMenuAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PortalMenuAggregateArgs>(args: Subset<T, PortalMenuAggregateArgs>): Prisma.PrismaPromise<GetPortalMenuAggregateType<T>>

    /**
     * Group by PortalMenu.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalMenuGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PortalMenuGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PortalMenuGroupByArgs['orderBy'] }
        : { orderBy?: PortalMenuGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PortalMenuGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPortalMenuGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PortalMenu model
   */
  readonly fields: PortalMenuFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PortalMenu.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PortalMenuClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    parent<T extends PortalMenu$parentArgs<ExtArgs> = {}>(args?: Subset<T, PortalMenu$parentArgs<ExtArgs>>): Prisma__PortalMenuClient<$Result.GetResult<Prisma.$PortalMenuPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    children<T extends PortalMenu$childrenArgs<ExtArgs> = {}>(args?: Subset<T, PortalMenu$childrenArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortalMenuPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PortalMenu model
   */
  interface PortalMenuFieldRefs {
    readonly id: FieldRef<"PortalMenu", 'String'>
    readonly name: FieldRef<"PortalMenu", 'String'>
    readonly description: FieldRef<"PortalMenu", 'String'>
    readonly translations: FieldRef<"PortalMenu", 'Json'>
    readonly icon: FieldRef<"PortalMenu", 'String'>
    readonly link: FieldRef<"PortalMenu", 'String'>
    readonly order: FieldRef<"PortalMenu", 'Int'>
    readonly parentId: FieldRef<"PortalMenu", 'String'>
    readonly isActive: FieldRef<"PortalMenu", 'Boolean'>
    readonly target: FieldRef<"PortalMenu", 'String'>
    readonly type: FieldRef<"PortalMenu", 'String'>
    readonly referenceId: FieldRef<"PortalMenu", 'String'>
    readonly position: FieldRef<"PortalMenu", 'String'>
    readonly createdAt: FieldRef<"PortalMenu", 'DateTime'>
    readonly updatedAt: FieldRef<"PortalMenu", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PortalMenu findUnique
   */
  export type PortalMenuFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalMenu
     */
    select?: PortalMenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalMenu
     */
    omit?: PortalMenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortalMenuInclude<ExtArgs> | null
    /**
     * Filter, which PortalMenu to fetch.
     */
    where: PortalMenuWhereUniqueInput
  }

  /**
   * PortalMenu findUniqueOrThrow
   */
  export type PortalMenuFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalMenu
     */
    select?: PortalMenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalMenu
     */
    omit?: PortalMenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortalMenuInclude<ExtArgs> | null
    /**
     * Filter, which PortalMenu to fetch.
     */
    where: PortalMenuWhereUniqueInput
  }

  /**
   * PortalMenu findFirst
   */
  export type PortalMenuFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalMenu
     */
    select?: PortalMenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalMenu
     */
    omit?: PortalMenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortalMenuInclude<ExtArgs> | null
    /**
     * Filter, which PortalMenu to fetch.
     */
    where?: PortalMenuWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortalMenus to fetch.
     */
    orderBy?: PortalMenuOrderByWithRelationInput | PortalMenuOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PortalMenus.
     */
    cursor?: PortalMenuWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortalMenus from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortalMenus.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PortalMenus.
     */
    distinct?: PortalMenuScalarFieldEnum | PortalMenuScalarFieldEnum[]
  }

  /**
   * PortalMenu findFirstOrThrow
   */
  export type PortalMenuFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalMenu
     */
    select?: PortalMenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalMenu
     */
    omit?: PortalMenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortalMenuInclude<ExtArgs> | null
    /**
     * Filter, which PortalMenu to fetch.
     */
    where?: PortalMenuWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortalMenus to fetch.
     */
    orderBy?: PortalMenuOrderByWithRelationInput | PortalMenuOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PortalMenus.
     */
    cursor?: PortalMenuWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortalMenus from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortalMenus.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PortalMenus.
     */
    distinct?: PortalMenuScalarFieldEnum | PortalMenuScalarFieldEnum[]
  }

  /**
   * PortalMenu findMany
   */
  export type PortalMenuFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalMenu
     */
    select?: PortalMenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalMenu
     */
    omit?: PortalMenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortalMenuInclude<ExtArgs> | null
    /**
     * Filter, which PortalMenus to fetch.
     */
    where?: PortalMenuWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortalMenus to fetch.
     */
    orderBy?: PortalMenuOrderByWithRelationInput | PortalMenuOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PortalMenus.
     */
    cursor?: PortalMenuWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortalMenus from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortalMenus.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PortalMenus.
     */
    distinct?: PortalMenuScalarFieldEnum | PortalMenuScalarFieldEnum[]
  }

  /**
   * PortalMenu create
   */
  export type PortalMenuCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalMenu
     */
    select?: PortalMenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalMenu
     */
    omit?: PortalMenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortalMenuInclude<ExtArgs> | null
    /**
     * The data needed to create a PortalMenu.
     */
    data: XOR<PortalMenuCreateInput, PortalMenuUncheckedCreateInput>
  }

  /**
   * PortalMenu createMany
   */
  export type PortalMenuCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PortalMenus.
     */
    data: PortalMenuCreateManyInput | PortalMenuCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PortalMenu update
   */
  export type PortalMenuUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalMenu
     */
    select?: PortalMenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalMenu
     */
    omit?: PortalMenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortalMenuInclude<ExtArgs> | null
    /**
     * The data needed to update a PortalMenu.
     */
    data: XOR<PortalMenuUpdateInput, PortalMenuUncheckedUpdateInput>
    /**
     * Choose, which PortalMenu to update.
     */
    where: PortalMenuWhereUniqueInput
  }

  /**
   * PortalMenu updateMany
   */
  export type PortalMenuUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PortalMenus.
     */
    data: XOR<PortalMenuUpdateManyMutationInput, PortalMenuUncheckedUpdateManyInput>
    /**
     * Filter which PortalMenus to update
     */
    where?: PortalMenuWhereInput
    /**
     * Limit how many PortalMenus to update.
     */
    limit?: number
  }

  /**
   * PortalMenu upsert
   */
  export type PortalMenuUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalMenu
     */
    select?: PortalMenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalMenu
     */
    omit?: PortalMenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortalMenuInclude<ExtArgs> | null
    /**
     * The filter to search for the PortalMenu to update in case it exists.
     */
    where: PortalMenuWhereUniqueInput
    /**
     * In case the PortalMenu found by the `where` argument doesn't exist, create a new PortalMenu with this data.
     */
    create: XOR<PortalMenuCreateInput, PortalMenuUncheckedCreateInput>
    /**
     * In case the PortalMenu was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PortalMenuUpdateInput, PortalMenuUncheckedUpdateInput>
  }

  /**
   * PortalMenu delete
   */
  export type PortalMenuDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalMenu
     */
    select?: PortalMenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalMenu
     */
    omit?: PortalMenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortalMenuInclude<ExtArgs> | null
    /**
     * Filter which PortalMenu to delete.
     */
    where: PortalMenuWhereUniqueInput
  }

  /**
   * PortalMenu deleteMany
   */
  export type PortalMenuDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PortalMenus to delete
     */
    where?: PortalMenuWhereInput
    /**
     * Limit how many PortalMenus to delete.
     */
    limit?: number
  }

  /**
   * PortalMenu.parent
   */
  export type PortalMenu$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalMenu
     */
    select?: PortalMenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalMenu
     */
    omit?: PortalMenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortalMenuInclude<ExtArgs> | null
    where?: PortalMenuWhereInput
  }

  /**
   * PortalMenu.children
   */
  export type PortalMenu$childrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalMenu
     */
    select?: PortalMenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalMenu
     */
    omit?: PortalMenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortalMenuInclude<ExtArgs> | null
    where?: PortalMenuWhereInput
    orderBy?: PortalMenuOrderByWithRelationInput | PortalMenuOrderByWithRelationInput[]
    cursor?: PortalMenuWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PortalMenuScalarFieldEnum | PortalMenuScalarFieldEnum[]
  }

  /**
   * PortalMenu without action
   */
  export type PortalMenuDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalMenu
     */
    select?: PortalMenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalMenu
     */
    omit?: PortalMenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortalMenuInclude<ExtArgs> | null
  }


  /**
   * Model Post
   */

  export type AggregatePost = {
    _count: PostCountAggregateOutputType | null
    _avg: PostAvgAggregateOutputType | null
    _sum: PostSumAggregateOutputType | null
    _min: PostMinAggregateOutputType | null
    _max: PostMaxAggregateOutputType | null
  }

  export type PostAvgAggregateOutputType = {
    currentVersion: number | null
    viewCount: number | null
  }

  export type PostSumAggregateOutputType = {
    currentVersion: number | null
    viewCount: number | null
  }

  export type PostMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    content: string | null
    contentHtml: string | null
    slug: string | null
    thumbnail: string | null
    authorId: string | null
    status: string | null
    currentVersion: number | null
    isFeatured: boolean | null
    isNotification: boolean | null
    viewCount: number | null
    isTranslated: boolean | null
    isCommentAllowed: boolean | null
    isDeleted: boolean | null
    publishedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
    categoryId: string | null
  }

  export type PostMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    content: string | null
    contentHtml: string | null
    slug: string | null
    thumbnail: string | null
    authorId: string | null
    status: string | null
    currentVersion: number | null
    isFeatured: boolean | null
    isNotification: boolean | null
    viewCount: number | null
    isTranslated: boolean | null
    isCommentAllowed: boolean | null
    isDeleted: boolean | null
    publishedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
    categoryId: string | null
  }

  export type PostCountAggregateOutputType = {
    id: number
    title: number
    description: number
    content: number
    contentHtml: number
    slug: number
    thumbnail: number
    authorId: number
    status: number
    currentVersion: number
    isFeatured: number
    isNotification: number
    viewCount: number
    isTranslated: number
    isCommentAllowed: number
    isDeleted: number
    publishedAt: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    categoryId: number
    _all: number
  }


  export type PostAvgAggregateInputType = {
    currentVersion?: true
    viewCount?: true
  }

  export type PostSumAggregateInputType = {
    currentVersion?: true
    viewCount?: true
  }

  export type PostMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    content?: true
    contentHtml?: true
    slug?: true
    thumbnail?: true
    authorId?: true
    status?: true
    currentVersion?: true
    isFeatured?: true
    isNotification?: true
    viewCount?: true
    isTranslated?: true
    isCommentAllowed?: true
    isDeleted?: true
    publishedAt?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    categoryId?: true
  }

  export type PostMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    content?: true
    contentHtml?: true
    slug?: true
    thumbnail?: true
    authorId?: true
    status?: true
    currentVersion?: true
    isFeatured?: true
    isNotification?: true
    viewCount?: true
    isTranslated?: true
    isCommentAllowed?: true
    isDeleted?: true
    publishedAt?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    categoryId?: true
  }

  export type PostCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    content?: true
    contentHtml?: true
    slug?: true
    thumbnail?: true
    authorId?: true
    status?: true
    currentVersion?: true
    isFeatured?: true
    isNotification?: true
    viewCount?: true
    isTranslated?: true
    isCommentAllowed?: true
    isDeleted?: true
    publishedAt?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    categoryId?: true
    _all?: true
  }

  export type PostAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Post to aggregate.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Posts
    **/
    _count?: true | PostCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PostAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PostSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PostMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PostMaxAggregateInputType
  }

  export type GetPostAggregateType<T extends PostAggregateArgs> = {
        [P in keyof T & keyof AggregatePost]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePost[P]>
      : GetScalarType<T[P], AggregatePost[P]>
  }




  export type PostGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostWhereInput
    orderBy?: PostOrderByWithAggregationInput | PostOrderByWithAggregationInput[]
    by: PostScalarFieldEnum[] | PostScalarFieldEnum
    having?: PostScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PostCountAggregateInputType | true
    _avg?: PostAvgAggregateInputType
    _sum?: PostSumAggregateInputType
    _min?: PostMinAggregateInputType
    _max?: PostMaxAggregateInputType
  }

  export type PostGroupByOutputType = {
    id: string
    title: string
    description: string | null
    content: string | null
    contentHtml: string | null
    slug: string
    thumbnail: string | null
    authorId: string
    status: string
    currentVersion: number
    isFeatured: boolean
    isNotification: boolean
    viewCount: number
    isTranslated: boolean
    isCommentAllowed: boolean
    isDeleted: boolean
    publishedAt: Date | null
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    categoryId: string | null
    _count: PostCountAggregateOutputType | null
    _avg: PostAvgAggregateOutputType | null
    _sum: PostSumAggregateOutputType | null
    _min: PostMinAggregateOutputType | null
    _max: PostMaxAggregateOutputType | null
  }

  type GetPostGroupByPayload<T extends PostGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PostGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PostGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PostGroupByOutputType[P]>
            : GetScalarType<T[P], PostGroupByOutputType[P]>
        }
      >
    >


  export type PostSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    content?: boolean
    contentHtml?: boolean
    slug?: boolean
    thumbnail?: boolean
    authorId?: boolean
    status?: boolean
    currentVersion?: boolean
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: boolean
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    categoryId?: boolean
    category?: boolean | Post$categoryArgs<ExtArgs>
    tags?: boolean | Post$tagsArgs<ExtArgs>
    versions?: boolean | Post$versionsArgs<ExtArgs>
    translations_rel?: boolean | Post$translations_relArgs<ExtArgs>
    comments?: boolean | Post$commentsArgs<ExtArgs>
    moderationLogs?: boolean | Post$moderationLogsArgs<ExtArgs>
    auditLogs?: boolean | Post$auditLogsArgs<ExtArgs>
    _count?: boolean | PostCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["post"]>



  export type PostSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    content?: boolean
    contentHtml?: boolean
    slug?: boolean
    thumbnail?: boolean
    authorId?: boolean
    status?: boolean
    currentVersion?: boolean
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: boolean
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
    categoryId?: boolean
  }

  export type PostOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "description" | "content" | "contentHtml" | "slug" | "thumbnail" | "authorId" | "status" | "currentVersion" | "isFeatured" | "isNotification" | "viewCount" | "isTranslated" | "isCommentAllowed" | "isDeleted" | "publishedAt" | "createdAt" | "updatedAt" | "deletedAt" | "categoryId", ExtArgs["result"]["post"]>
  export type PostInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | Post$categoryArgs<ExtArgs>
    tags?: boolean | Post$tagsArgs<ExtArgs>
    versions?: boolean | Post$versionsArgs<ExtArgs>
    translations_rel?: boolean | Post$translations_relArgs<ExtArgs>
    comments?: boolean | Post$commentsArgs<ExtArgs>
    moderationLogs?: boolean | Post$moderationLogsArgs<ExtArgs>
    auditLogs?: boolean | Post$auditLogsArgs<ExtArgs>
    _count?: boolean | PostCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $PostPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Post"
    objects: {
      category: Prisma.$CategoryPayload<ExtArgs> | null
      tags: Prisma.$TagPayload<ExtArgs>[]
      versions: Prisma.$PostVersionPayload<ExtArgs>[]
      translations_rel: Prisma.$PostTranslationPayload<ExtArgs>[]
      comments: Prisma.$CommentPayload<ExtArgs>[]
      moderationLogs: Prisma.$ModerationLogPayload<ExtArgs>[]
      auditLogs: Prisma.$AuditLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      description: string | null
      content: string | null
      contentHtml: string | null
      slug: string
      thumbnail: string | null
      authorId: string
      status: string
      currentVersion: number
      isFeatured: boolean
      isNotification: boolean
      viewCount: number
      isTranslated: boolean
      isCommentAllowed: boolean
      isDeleted: boolean
      publishedAt: Date | null
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
      categoryId: string | null
    }, ExtArgs["result"]["post"]>
    composites: {}
  }

  type PostGetPayload<S extends boolean | null | undefined | PostDefaultArgs> = $Result.GetResult<Prisma.$PostPayload, S>

  type PostCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PostFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PostCountAggregateInputType | true
    }

  export interface PostDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Post'], meta: { name: 'Post' } }
    /**
     * Find zero or one Post that matches the filter.
     * @param {PostFindUniqueArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PostFindUniqueArgs>(args: SelectSubset<T, PostFindUniqueArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Post that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PostFindUniqueOrThrowArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PostFindUniqueOrThrowArgs>(args: SelectSubset<T, PostFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Post that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostFindFirstArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PostFindFirstArgs>(args?: SelectSubset<T, PostFindFirstArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Post that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostFindFirstOrThrowArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PostFindFirstOrThrowArgs>(args?: SelectSubset<T, PostFindFirstOrThrowArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Posts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Posts
     * const posts = await prisma.post.findMany()
     * 
     * // Get first 10 Posts
     * const posts = await prisma.post.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const postWithIdOnly = await prisma.post.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PostFindManyArgs>(args?: SelectSubset<T, PostFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Post.
     * @param {PostCreateArgs} args - Arguments to create a Post.
     * @example
     * // Create one Post
     * const Post = await prisma.post.create({
     *   data: {
     *     // ... data to create a Post
     *   }
     * })
     * 
     */
    create<T extends PostCreateArgs>(args: SelectSubset<T, PostCreateArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Posts.
     * @param {PostCreateManyArgs} args - Arguments to create many Posts.
     * @example
     * // Create many Posts
     * const post = await prisma.post.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PostCreateManyArgs>(args?: SelectSubset<T, PostCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Post.
     * @param {PostDeleteArgs} args - Arguments to delete one Post.
     * @example
     * // Delete one Post
     * const Post = await prisma.post.delete({
     *   where: {
     *     // ... filter to delete one Post
     *   }
     * })
     * 
     */
    delete<T extends PostDeleteArgs>(args: SelectSubset<T, PostDeleteArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Post.
     * @param {PostUpdateArgs} args - Arguments to update one Post.
     * @example
     * // Update one Post
     * const post = await prisma.post.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PostUpdateArgs>(args: SelectSubset<T, PostUpdateArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Posts.
     * @param {PostDeleteManyArgs} args - Arguments to filter Posts to delete.
     * @example
     * // Delete a few Posts
     * const { count } = await prisma.post.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PostDeleteManyArgs>(args?: SelectSubset<T, PostDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Posts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Posts
     * const post = await prisma.post.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PostUpdateManyArgs>(args: SelectSubset<T, PostUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Post.
     * @param {PostUpsertArgs} args - Arguments to update or create a Post.
     * @example
     * // Update or create a Post
     * const post = await prisma.post.upsert({
     *   create: {
     *     // ... data to create a Post
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Post we want to update
     *   }
     * })
     */
    upsert<T extends PostUpsertArgs>(args: SelectSubset<T, PostUpsertArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Posts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostCountArgs} args - Arguments to filter Posts to count.
     * @example
     * // Count the number of Posts
     * const count = await prisma.post.count({
     *   where: {
     *     // ... the filter for the Posts we want to count
     *   }
     * })
    **/
    count<T extends PostCountArgs>(
      args?: Subset<T, PostCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PostCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Post.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PostAggregateArgs>(args: Subset<T, PostAggregateArgs>): Prisma.PrismaPromise<GetPostAggregateType<T>>

    /**
     * Group by Post.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PostGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PostGroupByArgs['orderBy'] }
        : { orderBy?: PostGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PostGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPostGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Post model
   */
  readonly fields: PostFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Post.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PostClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    category<T extends Post$categoryArgs<ExtArgs> = {}>(args?: Subset<T, Post$categoryArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    tags<T extends Post$tagsArgs<ExtArgs> = {}>(args?: Subset<T, Post$tagsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    versions<T extends Post$versionsArgs<ExtArgs> = {}>(args?: Subset<T, Post$versionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostVersionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    translations_rel<T extends Post$translations_relArgs<ExtArgs> = {}>(args?: Subset<T, Post$translations_relArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostTranslationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    comments<T extends Post$commentsArgs<ExtArgs> = {}>(args?: Subset<T, Post$commentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    moderationLogs<T extends Post$moderationLogsArgs<ExtArgs> = {}>(args?: Subset<T, Post$moderationLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ModerationLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    auditLogs<T extends Post$auditLogsArgs<ExtArgs> = {}>(args?: Subset<T, Post$auditLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Post model
   */
  interface PostFieldRefs {
    readonly id: FieldRef<"Post", 'String'>
    readonly title: FieldRef<"Post", 'String'>
    readonly description: FieldRef<"Post", 'String'>
    readonly content: FieldRef<"Post", 'String'>
    readonly contentHtml: FieldRef<"Post", 'String'>
    readonly slug: FieldRef<"Post", 'String'>
    readonly thumbnail: FieldRef<"Post", 'String'>
    readonly authorId: FieldRef<"Post", 'String'>
    readonly status: FieldRef<"Post", 'String'>
    readonly currentVersion: FieldRef<"Post", 'Int'>
    readonly isFeatured: FieldRef<"Post", 'Boolean'>
    readonly isNotification: FieldRef<"Post", 'Boolean'>
    readonly viewCount: FieldRef<"Post", 'Int'>
    readonly isTranslated: FieldRef<"Post", 'Boolean'>
    readonly isCommentAllowed: FieldRef<"Post", 'Boolean'>
    readonly isDeleted: FieldRef<"Post", 'Boolean'>
    readonly publishedAt: FieldRef<"Post", 'DateTime'>
    readonly createdAt: FieldRef<"Post", 'DateTime'>
    readonly updatedAt: FieldRef<"Post", 'DateTime'>
    readonly deletedAt: FieldRef<"Post", 'DateTime'>
    readonly categoryId: FieldRef<"Post", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Post findUnique
   */
  export type PostFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post findUniqueOrThrow
   */
  export type PostFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post findFirst
   */
  export type PostFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Posts.
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Posts.
     */
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Post findFirstOrThrow
   */
  export type PostFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Posts.
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Posts.
     */
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Post findMany
   */
  export type PostFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Posts to fetch.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Posts.
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Posts.
     */
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Post create
   */
  export type PostCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * The data needed to create a Post.
     */
    data: XOR<PostCreateInput, PostUncheckedCreateInput>
  }

  /**
   * Post createMany
   */
  export type PostCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Posts.
     */
    data: PostCreateManyInput | PostCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Post update
   */
  export type PostUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * The data needed to update a Post.
     */
    data: XOR<PostUpdateInput, PostUncheckedUpdateInput>
    /**
     * Choose, which Post to update.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post updateMany
   */
  export type PostUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Posts.
     */
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyInput>
    /**
     * Filter which Posts to update
     */
    where?: PostWhereInput
    /**
     * Limit how many Posts to update.
     */
    limit?: number
  }

  /**
   * Post upsert
   */
  export type PostUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * The filter to search for the Post to update in case it exists.
     */
    where: PostWhereUniqueInput
    /**
     * In case the Post found by the `where` argument doesn't exist, create a new Post with this data.
     */
    create: XOR<PostCreateInput, PostUncheckedCreateInput>
    /**
     * In case the Post was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PostUpdateInput, PostUncheckedUpdateInput>
  }

  /**
   * Post delete
   */
  export type PostDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter which Post to delete.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post deleteMany
   */
  export type PostDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Posts to delete
     */
    where?: PostWhereInput
    /**
     * Limit how many Posts to delete.
     */
    limit?: number
  }

  /**
   * Post.category
   */
  export type Post$categoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    where?: CategoryWhereInput
  }

  /**
   * Post.tags
   */
  export type Post$tagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    where?: TagWhereInput
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    cursor?: TagWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Post.versions
   */
  export type Post$versionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostVersion
     */
    select?: PostVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostVersion
     */
    omit?: PostVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostVersionInclude<ExtArgs> | null
    where?: PostVersionWhereInput
    orderBy?: PostVersionOrderByWithRelationInput | PostVersionOrderByWithRelationInput[]
    cursor?: PostVersionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PostVersionScalarFieldEnum | PostVersionScalarFieldEnum[]
  }

  /**
   * Post.translations_rel
   */
  export type Post$translations_relArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostTranslation
     */
    select?: PostTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostTranslation
     */
    omit?: PostTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostTranslationInclude<ExtArgs> | null
    where?: PostTranslationWhereInput
    orderBy?: PostTranslationOrderByWithRelationInput | PostTranslationOrderByWithRelationInput[]
    cursor?: PostTranslationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PostTranslationScalarFieldEnum | PostTranslationScalarFieldEnum[]
  }

  /**
   * Post.comments
   */
  export type Post$commentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    where?: CommentWhereInput
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    cursor?: CommentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Post.moderationLogs
   */
  export type Post$moderationLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModerationLog
     */
    select?: ModerationLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModerationLog
     */
    omit?: ModerationLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModerationLogInclude<ExtArgs> | null
    where?: ModerationLogWhereInput
    orderBy?: ModerationLogOrderByWithRelationInput | ModerationLogOrderByWithRelationInput[]
    cursor?: ModerationLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ModerationLogScalarFieldEnum | ModerationLogScalarFieldEnum[]
  }

  /**
   * Post.auditLogs
   */
  export type Post$auditLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    cursor?: AuditLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * Post without action
   */
  export type PostDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
  }


  /**
   * Model Tag
   */

  export type AggregateTag = {
    _count: TagCountAggregateOutputType | null
    _min: TagMinAggregateOutputType | null
    _max: TagMaxAggregateOutputType | null
  }

  export type TagMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
  }

  export type TagMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
  }

  export type TagCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    _all: number
  }


  export type TagMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
  }

  export type TagMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
  }

  export type TagCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    _all?: true
  }

  export type TagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tag to aggregate.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tags
    **/
    _count?: true | TagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TagMaxAggregateInputType
  }

  export type GetTagAggregateType<T extends TagAggregateArgs> = {
        [P in keyof T & keyof AggregateTag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTag[P]>
      : GetScalarType<T[P], AggregateTag[P]>
  }




  export type TagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TagWhereInput
    orderBy?: TagOrderByWithAggregationInput | TagOrderByWithAggregationInput[]
    by: TagScalarFieldEnum[] | TagScalarFieldEnum
    having?: TagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TagCountAggregateInputType | true
    _min?: TagMinAggregateInputType
    _max?: TagMaxAggregateInputType
  }

  export type TagGroupByOutputType = {
    id: string
    name: string
    slug: string
    _count: TagCountAggregateOutputType | null
    _min: TagMinAggregateOutputType | null
    _max: TagMaxAggregateOutputType | null
  }

  type GetTagGroupByPayload<T extends TagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TagGroupByOutputType[P]>
            : GetScalarType<T[P], TagGroupByOutputType[P]>
        }
      >
    >


  export type TagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    posts?: boolean | Tag$postsArgs<ExtArgs>
    _count?: boolean | TagCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tag"]>



  export type TagSelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
  }

  export type TagOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "slug", ExtArgs["result"]["tag"]>
  export type TagInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    posts?: boolean | Tag$postsArgs<ExtArgs>
    _count?: boolean | TagCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $TagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tag"
    objects: {
      posts: Prisma.$PostPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
    }, ExtArgs["result"]["tag"]>
    composites: {}
  }

  type TagGetPayload<S extends boolean | null | undefined | TagDefaultArgs> = $Result.GetResult<Prisma.$TagPayload, S>

  type TagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TagFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TagCountAggregateInputType | true
    }

  export interface TagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tag'], meta: { name: 'Tag' } }
    /**
     * Find zero or one Tag that matches the filter.
     * @param {TagFindUniqueArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TagFindUniqueArgs>(args: SelectSubset<T, TagFindUniqueArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tag that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TagFindUniqueOrThrowArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TagFindUniqueOrThrowArgs>(args: SelectSubset<T, TagFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindFirstArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TagFindFirstArgs>(args?: SelectSubset<T, TagFindFirstArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindFirstOrThrowArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TagFindFirstOrThrowArgs>(args?: SelectSubset<T, TagFindFirstOrThrowArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tags
     * const tags = await prisma.tag.findMany()
     * 
     * // Get first 10 Tags
     * const tags = await prisma.tag.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tagWithIdOnly = await prisma.tag.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TagFindManyArgs>(args?: SelectSubset<T, TagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tag.
     * @param {TagCreateArgs} args - Arguments to create a Tag.
     * @example
     * // Create one Tag
     * const Tag = await prisma.tag.create({
     *   data: {
     *     // ... data to create a Tag
     *   }
     * })
     * 
     */
    create<T extends TagCreateArgs>(args: SelectSubset<T, TagCreateArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tags.
     * @param {TagCreateManyArgs} args - Arguments to create many Tags.
     * @example
     * // Create many Tags
     * const tag = await prisma.tag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TagCreateManyArgs>(args?: SelectSubset<T, TagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tag.
     * @param {TagDeleteArgs} args - Arguments to delete one Tag.
     * @example
     * // Delete one Tag
     * const Tag = await prisma.tag.delete({
     *   where: {
     *     // ... filter to delete one Tag
     *   }
     * })
     * 
     */
    delete<T extends TagDeleteArgs>(args: SelectSubset<T, TagDeleteArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tag.
     * @param {TagUpdateArgs} args - Arguments to update one Tag.
     * @example
     * // Update one Tag
     * const tag = await prisma.tag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TagUpdateArgs>(args: SelectSubset<T, TagUpdateArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tags.
     * @param {TagDeleteManyArgs} args - Arguments to filter Tags to delete.
     * @example
     * // Delete a few Tags
     * const { count } = await prisma.tag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TagDeleteManyArgs>(args?: SelectSubset<T, TagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tags
     * const tag = await prisma.tag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TagUpdateManyArgs>(args: SelectSubset<T, TagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tag.
     * @param {TagUpsertArgs} args - Arguments to update or create a Tag.
     * @example
     * // Update or create a Tag
     * const tag = await prisma.tag.upsert({
     *   create: {
     *     // ... data to create a Tag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tag we want to update
     *   }
     * })
     */
    upsert<T extends TagUpsertArgs>(args: SelectSubset<T, TagUpsertArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagCountArgs} args - Arguments to filter Tags to count.
     * @example
     * // Count the number of Tags
     * const count = await prisma.tag.count({
     *   where: {
     *     // ... the filter for the Tags we want to count
     *   }
     * })
    **/
    count<T extends TagCountArgs>(
      args?: Subset<T, TagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TagAggregateArgs>(args: Subset<T, TagAggregateArgs>): Prisma.PrismaPromise<GetTagAggregateType<T>>

    /**
     * Group by Tag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TagGroupByArgs['orderBy'] }
        : { orderBy?: TagGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tag model
   */
  readonly fields: TagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    posts<T extends Tag$postsArgs<ExtArgs> = {}>(args?: Subset<T, Tag$postsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tag model
   */
  interface TagFieldRefs {
    readonly id: FieldRef<"Tag", 'String'>
    readonly name: FieldRef<"Tag", 'String'>
    readonly slug: FieldRef<"Tag", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Tag findUnique
   */
  export type TagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag findUniqueOrThrow
   */
  export type TagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag findFirst
   */
  export type TagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tags.
     */
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag findFirstOrThrow
   */
  export type TagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tags.
     */
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag findMany
   */
  export type TagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tags to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tags.
     */
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag create
   */
  export type TagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * The data needed to create a Tag.
     */
    data: XOR<TagCreateInput, TagUncheckedCreateInput>
  }

  /**
   * Tag createMany
   */
  export type TagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tags.
     */
    data: TagCreateManyInput | TagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tag update
   */
  export type TagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * The data needed to update a Tag.
     */
    data: XOR<TagUpdateInput, TagUncheckedUpdateInput>
    /**
     * Choose, which Tag to update.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag updateMany
   */
  export type TagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tags.
     */
    data: XOR<TagUpdateManyMutationInput, TagUncheckedUpdateManyInput>
    /**
     * Filter which Tags to update
     */
    where?: TagWhereInput
    /**
     * Limit how many Tags to update.
     */
    limit?: number
  }

  /**
   * Tag upsert
   */
  export type TagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * The filter to search for the Tag to update in case it exists.
     */
    where: TagWhereUniqueInput
    /**
     * In case the Tag found by the `where` argument doesn't exist, create a new Tag with this data.
     */
    create: XOR<TagCreateInput, TagUncheckedCreateInput>
    /**
     * In case the Tag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TagUpdateInput, TagUncheckedUpdateInput>
  }

  /**
   * Tag delete
   */
  export type TagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter which Tag to delete.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag deleteMany
   */
  export type TagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tags to delete
     */
    where?: TagWhereInput
    /**
     * Limit how many Tags to delete.
     */
    limit?: number
  }

  /**
   * Tag.posts
   */
  export type Tag$postsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    where?: PostWhereInput
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    cursor?: PostWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Tag without action
   */
  export type TagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
  }


  /**
   * Model PostVersion
   */

  export type AggregatePostVersion = {
    _count: PostVersionCountAggregateOutputType | null
    _avg: PostVersionAvgAggregateOutputType | null
    _sum: PostVersionSumAggregateOutputType | null
    _min: PostVersionMinAggregateOutputType | null
    _max: PostVersionMaxAggregateOutputType | null
  }

  export type PostVersionAvgAggregateOutputType = {
    version: number | null
  }

  export type PostVersionSumAggregateOutputType = {
    version: number | null
  }

  export type PostVersionMinAggregateOutputType = {
    id: string | null
    postId: string | null
    version: number | null
    title: string | null
    description: string | null
    content: string | null
    editorId: string | null
    changeNote: string | null
    createdAt: Date | null
  }

  export type PostVersionMaxAggregateOutputType = {
    id: string | null
    postId: string | null
    version: number | null
    title: string | null
    description: string | null
    content: string | null
    editorId: string | null
    changeNote: string | null
    createdAt: Date | null
  }

  export type PostVersionCountAggregateOutputType = {
    id: number
    postId: number
    version: number
    title: number
    description: number
    content: number
    editorId: number
    changeNote: number
    createdAt: number
    _all: number
  }


  export type PostVersionAvgAggregateInputType = {
    version?: true
  }

  export type PostVersionSumAggregateInputType = {
    version?: true
  }

  export type PostVersionMinAggregateInputType = {
    id?: true
    postId?: true
    version?: true
    title?: true
    description?: true
    content?: true
    editorId?: true
    changeNote?: true
    createdAt?: true
  }

  export type PostVersionMaxAggregateInputType = {
    id?: true
    postId?: true
    version?: true
    title?: true
    description?: true
    content?: true
    editorId?: true
    changeNote?: true
    createdAt?: true
  }

  export type PostVersionCountAggregateInputType = {
    id?: true
    postId?: true
    version?: true
    title?: true
    description?: true
    content?: true
    editorId?: true
    changeNote?: true
    createdAt?: true
    _all?: true
  }

  export type PostVersionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PostVersion to aggregate.
     */
    where?: PostVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PostVersions to fetch.
     */
    orderBy?: PostVersionOrderByWithRelationInput | PostVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PostVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PostVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PostVersions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PostVersions
    **/
    _count?: true | PostVersionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PostVersionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PostVersionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PostVersionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PostVersionMaxAggregateInputType
  }

  export type GetPostVersionAggregateType<T extends PostVersionAggregateArgs> = {
        [P in keyof T & keyof AggregatePostVersion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePostVersion[P]>
      : GetScalarType<T[P], AggregatePostVersion[P]>
  }




  export type PostVersionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostVersionWhereInput
    orderBy?: PostVersionOrderByWithAggregationInput | PostVersionOrderByWithAggregationInput[]
    by: PostVersionScalarFieldEnum[] | PostVersionScalarFieldEnum
    having?: PostVersionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PostVersionCountAggregateInputType | true
    _avg?: PostVersionAvgAggregateInputType
    _sum?: PostVersionSumAggregateInputType
    _min?: PostVersionMinAggregateInputType
    _max?: PostVersionMaxAggregateInputType
  }

  export type PostVersionGroupByOutputType = {
    id: string
    postId: string
    version: number
    title: string
    description: string | null
    content: string | null
    editorId: string
    changeNote: string | null
    createdAt: Date
    _count: PostVersionCountAggregateOutputType | null
    _avg: PostVersionAvgAggregateOutputType | null
    _sum: PostVersionSumAggregateOutputType | null
    _min: PostVersionMinAggregateOutputType | null
    _max: PostVersionMaxAggregateOutputType | null
  }

  type GetPostVersionGroupByPayload<T extends PostVersionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PostVersionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PostVersionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PostVersionGroupByOutputType[P]>
            : GetScalarType<T[P], PostVersionGroupByOutputType[P]>
        }
      >
    >


  export type PostVersionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    postId?: boolean
    version?: boolean
    title?: boolean
    description?: boolean
    content?: boolean
    editorId?: boolean
    changeNote?: boolean
    createdAt?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["postVersion"]>



  export type PostVersionSelectScalar = {
    id?: boolean
    postId?: boolean
    version?: boolean
    title?: boolean
    description?: boolean
    content?: boolean
    editorId?: boolean
    changeNote?: boolean
    createdAt?: boolean
  }

  export type PostVersionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "postId" | "version" | "title" | "description" | "content" | "editorId" | "changeNote" | "createdAt", ExtArgs["result"]["postVersion"]>
  export type PostVersionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
  }

  export type $PostVersionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PostVersion"
    objects: {
      post: Prisma.$PostPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      postId: string
      version: number
      title: string
      description: string | null
      content: string | null
      editorId: string
      changeNote: string | null
      createdAt: Date
    }, ExtArgs["result"]["postVersion"]>
    composites: {}
  }

  type PostVersionGetPayload<S extends boolean | null | undefined | PostVersionDefaultArgs> = $Result.GetResult<Prisma.$PostVersionPayload, S>

  type PostVersionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PostVersionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PostVersionCountAggregateInputType | true
    }

  export interface PostVersionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PostVersion'], meta: { name: 'PostVersion' } }
    /**
     * Find zero or one PostVersion that matches the filter.
     * @param {PostVersionFindUniqueArgs} args - Arguments to find a PostVersion
     * @example
     * // Get one PostVersion
     * const postVersion = await prisma.postVersion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PostVersionFindUniqueArgs>(args: SelectSubset<T, PostVersionFindUniqueArgs<ExtArgs>>): Prisma__PostVersionClient<$Result.GetResult<Prisma.$PostVersionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PostVersion that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PostVersionFindUniqueOrThrowArgs} args - Arguments to find a PostVersion
     * @example
     * // Get one PostVersion
     * const postVersion = await prisma.postVersion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PostVersionFindUniqueOrThrowArgs>(args: SelectSubset<T, PostVersionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PostVersionClient<$Result.GetResult<Prisma.$PostVersionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PostVersion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostVersionFindFirstArgs} args - Arguments to find a PostVersion
     * @example
     * // Get one PostVersion
     * const postVersion = await prisma.postVersion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PostVersionFindFirstArgs>(args?: SelectSubset<T, PostVersionFindFirstArgs<ExtArgs>>): Prisma__PostVersionClient<$Result.GetResult<Prisma.$PostVersionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PostVersion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostVersionFindFirstOrThrowArgs} args - Arguments to find a PostVersion
     * @example
     * // Get one PostVersion
     * const postVersion = await prisma.postVersion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PostVersionFindFirstOrThrowArgs>(args?: SelectSubset<T, PostVersionFindFirstOrThrowArgs<ExtArgs>>): Prisma__PostVersionClient<$Result.GetResult<Prisma.$PostVersionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PostVersions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostVersionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PostVersions
     * const postVersions = await prisma.postVersion.findMany()
     * 
     * // Get first 10 PostVersions
     * const postVersions = await prisma.postVersion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const postVersionWithIdOnly = await prisma.postVersion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PostVersionFindManyArgs>(args?: SelectSubset<T, PostVersionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostVersionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PostVersion.
     * @param {PostVersionCreateArgs} args - Arguments to create a PostVersion.
     * @example
     * // Create one PostVersion
     * const PostVersion = await prisma.postVersion.create({
     *   data: {
     *     // ... data to create a PostVersion
     *   }
     * })
     * 
     */
    create<T extends PostVersionCreateArgs>(args: SelectSubset<T, PostVersionCreateArgs<ExtArgs>>): Prisma__PostVersionClient<$Result.GetResult<Prisma.$PostVersionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PostVersions.
     * @param {PostVersionCreateManyArgs} args - Arguments to create many PostVersions.
     * @example
     * // Create many PostVersions
     * const postVersion = await prisma.postVersion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PostVersionCreateManyArgs>(args?: SelectSubset<T, PostVersionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a PostVersion.
     * @param {PostVersionDeleteArgs} args - Arguments to delete one PostVersion.
     * @example
     * // Delete one PostVersion
     * const PostVersion = await prisma.postVersion.delete({
     *   where: {
     *     // ... filter to delete one PostVersion
     *   }
     * })
     * 
     */
    delete<T extends PostVersionDeleteArgs>(args: SelectSubset<T, PostVersionDeleteArgs<ExtArgs>>): Prisma__PostVersionClient<$Result.GetResult<Prisma.$PostVersionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PostVersion.
     * @param {PostVersionUpdateArgs} args - Arguments to update one PostVersion.
     * @example
     * // Update one PostVersion
     * const postVersion = await prisma.postVersion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PostVersionUpdateArgs>(args: SelectSubset<T, PostVersionUpdateArgs<ExtArgs>>): Prisma__PostVersionClient<$Result.GetResult<Prisma.$PostVersionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PostVersions.
     * @param {PostVersionDeleteManyArgs} args - Arguments to filter PostVersions to delete.
     * @example
     * // Delete a few PostVersions
     * const { count } = await prisma.postVersion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PostVersionDeleteManyArgs>(args?: SelectSubset<T, PostVersionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PostVersions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostVersionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PostVersions
     * const postVersion = await prisma.postVersion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PostVersionUpdateManyArgs>(args: SelectSubset<T, PostVersionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PostVersion.
     * @param {PostVersionUpsertArgs} args - Arguments to update or create a PostVersion.
     * @example
     * // Update or create a PostVersion
     * const postVersion = await prisma.postVersion.upsert({
     *   create: {
     *     // ... data to create a PostVersion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PostVersion we want to update
     *   }
     * })
     */
    upsert<T extends PostVersionUpsertArgs>(args: SelectSubset<T, PostVersionUpsertArgs<ExtArgs>>): Prisma__PostVersionClient<$Result.GetResult<Prisma.$PostVersionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PostVersions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostVersionCountArgs} args - Arguments to filter PostVersions to count.
     * @example
     * // Count the number of PostVersions
     * const count = await prisma.postVersion.count({
     *   where: {
     *     // ... the filter for the PostVersions we want to count
     *   }
     * })
    **/
    count<T extends PostVersionCountArgs>(
      args?: Subset<T, PostVersionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PostVersionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PostVersion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostVersionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PostVersionAggregateArgs>(args: Subset<T, PostVersionAggregateArgs>): Prisma.PrismaPromise<GetPostVersionAggregateType<T>>

    /**
     * Group by PostVersion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostVersionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PostVersionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PostVersionGroupByArgs['orderBy'] }
        : { orderBy?: PostVersionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PostVersionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPostVersionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PostVersion model
   */
  readonly fields: PostVersionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PostVersion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PostVersionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    post<T extends PostDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PostDefaultArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PostVersion model
   */
  interface PostVersionFieldRefs {
    readonly id: FieldRef<"PostVersion", 'String'>
    readonly postId: FieldRef<"PostVersion", 'String'>
    readonly version: FieldRef<"PostVersion", 'Int'>
    readonly title: FieldRef<"PostVersion", 'String'>
    readonly description: FieldRef<"PostVersion", 'String'>
    readonly content: FieldRef<"PostVersion", 'String'>
    readonly editorId: FieldRef<"PostVersion", 'String'>
    readonly changeNote: FieldRef<"PostVersion", 'String'>
    readonly createdAt: FieldRef<"PostVersion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PostVersion findUnique
   */
  export type PostVersionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostVersion
     */
    select?: PostVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostVersion
     */
    omit?: PostVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostVersionInclude<ExtArgs> | null
    /**
     * Filter, which PostVersion to fetch.
     */
    where: PostVersionWhereUniqueInput
  }

  /**
   * PostVersion findUniqueOrThrow
   */
  export type PostVersionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostVersion
     */
    select?: PostVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostVersion
     */
    omit?: PostVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostVersionInclude<ExtArgs> | null
    /**
     * Filter, which PostVersion to fetch.
     */
    where: PostVersionWhereUniqueInput
  }

  /**
   * PostVersion findFirst
   */
  export type PostVersionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostVersion
     */
    select?: PostVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostVersion
     */
    omit?: PostVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostVersionInclude<ExtArgs> | null
    /**
     * Filter, which PostVersion to fetch.
     */
    where?: PostVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PostVersions to fetch.
     */
    orderBy?: PostVersionOrderByWithRelationInput | PostVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PostVersions.
     */
    cursor?: PostVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PostVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PostVersions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PostVersions.
     */
    distinct?: PostVersionScalarFieldEnum | PostVersionScalarFieldEnum[]
  }

  /**
   * PostVersion findFirstOrThrow
   */
  export type PostVersionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostVersion
     */
    select?: PostVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostVersion
     */
    omit?: PostVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostVersionInclude<ExtArgs> | null
    /**
     * Filter, which PostVersion to fetch.
     */
    where?: PostVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PostVersions to fetch.
     */
    orderBy?: PostVersionOrderByWithRelationInput | PostVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PostVersions.
     */
    cursor?: PostVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PostVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PostVersions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PostVersions.
     */
    distinct?: PostVersionScalarFieldEnum | PostVersionScalarFieldEnum[]
  }

  /**
   * PostVersion findMany
   */
  export type PostVersionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostVersion
     */
    select?: PostVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostVersion
     */
    omit?: PostVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostVersionInclude<ExtArgs> | null
    /**
     * Filter, which PostVersions to fetch.
     */
    where?: PostVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PostVersions to fetch.
     */
    orderBy?: PostVersionOrderByWithRelationInput | PostVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PostVersions.
     */
    cursor?: PostVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PostVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PostVersions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PostVersions.
     */
    distinct?: PostVersionScalarFieldEnum | PostVersionScalarFieldEnum[]
  }

  /**
   * PostVersion create
   */
  export type PostVersionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostVersion
     */
    select?: PostVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostVersion
     */
    omit?: PostVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostVersionInclude<ExtArgs> | null
    /**
     * The data needed to create a PostVersion.
     */
    data: XOR<PostVersionCreateInput, PostVersionUncheckedCreateInput>
  }

  /**
   * PostVersion createMany
   */
  export type PostVersionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PostVersions.
     */
    data: PostVersionCreateManyInput | PostVersionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PostVersion update
   */
  export type PostVersionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostVersion
     */
    select?: PostVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostVersion
     */
    omit?: PostVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostVersionInclude<ExtArgs> | null
    /**
     * The data needed to update a PostVersion.
     */
    data: XOR<PostVersionUpdateInput, PostVersionUncheckedUpdateInput>
    /**
     * Choose, which PostVersion to update.
     */
    where: PostVersionWhereUniqueInput
  }

  /**
   * PostVersion updateMany
   */
  export type PostVersionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PostVersions.
     */
    data: XOR<PostVersionUpdateManyMutationInput, PostVersionUncheckedUpdateManyInput>
    /**
     * Filter which PostVersions to update
     */
    where?: PostVersionWhereInput
    /**
     * Limit how many PostVersions to update.
     */
    limit?: number
  }

  /**
   * PostVersion upsert
   */
  export type PostVersionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostVersion
     */
    select?: PostVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostVersion
     */
    omit?: PostVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostVersionInclude<ExtArgs> | null
    /**
     * The filter to search for the PostVersion to update in case it exists.
     */
    where: PostVersionWhereUniqueInput
    /**
     * In case the PostVersion found by the `where` argument doesn't exist, create a new PostVersion with this data.
     */
    create: XOR<PostVersionCreateInput, PostVersionUncheckedCreateInput>
    /**
     * In case the PostVersion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PostVersionUpdateInput, PostVersionUncheckedUpdateInput>
  }

  /**
   * PostVersion delete
   */
  export type PostVersionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostVersion
     */
    select?: PostVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostVersion
     */
    omit?: PostVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostVersionInclude<ExtArgs> | null
    /**
     * Filter which PostVersion to delete.
     */
    where: PostVersionWhereUniqueInput
  }

  /**
   * PostVersion deleteMany
   */
  export type PostVersionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PostVersions to delete
     */
    where?: PostVersionWhereInput
    /**
     * Limit how many PostVersions to delete.
     */
    limit?: number
  }

  /**
   * PostVersion without action
   */
  export type PostVersionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostVersion
     */
    select?: PostVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostVersion
     */
    omit?: PostVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostVersionInclude<ExtArgs> | null
  }


  /**
   * Model ModerationLog
   */

  export type AggregateModerationLog = {
    _count: ModerationLogCountAggregateOutputType | null
    _min: ModerationLogMinAggregateOutputType | null
    _max: ModerationLogMaxAggregateOutputType | null
  }

  export type ModerationLogMinAggregateOutputType = {
    id: string | null
    postId: string | null
    reviewerId: string | null
    oldStatus: string | null
    newStatus: string | null
    decision: string | null
    note: string | null
    createdAt: Date | null
  }

  export type ModerationLogMaxAggregateOutputType = {
    id: string | null
    postId: string | null
    reviewerId: string | null
    oldStatus: string | null
    newStatus: string | null
    decision: string | null
    note: string | null
    createdAt: Date | null
  }

  export type ModerationLogCountAggregateOutputType = {
    id: number
    postId: number
    reviewerId: number
    oldStatus: number
    newStatus: number
    decision: number
    note: number
    createdAt: number
    _all: number
  }


  export type ModerationLogMinAggregateInputType = {
    id?: true
    postId?: true
    reviewerId?: true
    oldStatus?: true
    newStatus?: true
    decision?: true
    note?: true
    createdAt?: true
  }

  export type ModerationLogMaxAggregateInputType = {
    id?: true
    postId?: true
    reviewerId?: true
    oldStatus?: true
    newStatus?: true
    decision?: true
    note?: true
    createdAt?: true
  }

  export type ModerationLogCountAggregateInputType = {
    id?: true
    postId?: true
    reviewerId?: true
    oldStatus?: true
    newStatus?: true
    decision?: true
    note?: true
    createdAt?: true
    _all?: true
  }

  export type ModerationLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ModerationLog to aggregate.
     */
    where?: ModerationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModerationLogs to fetch.
     */
    orderBy?: ModerationLogOrderByWithRelationInput | ModerationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ModerationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModerationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModerationLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ModerationLogs
    **/
    _count?: true | ModerationLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ModerationLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ModerationLogMaxAggregateInputType
  }

  export type GetModerationLogAggregateType<T extends ModerationLogAggregateArgs> = {
        [P in keyof T & keyof AggregateModerationLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateModerationLog[P]>
      : GetScalarType<T[P], AggregateModerationLog[P]>
  }




  export type ModerationLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ModerationLogWhereInput
    orderBy?: ModerationLogOrderByWithAggregationInput | ModerationLogOrderByWithAggregationInput[]
    by: ModerationLogScalarFieldEnum[] | ModerationLogScalarFieldEnum
    having?: ModerationLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ModerationLogCountAggregateInputType | true
    _min?: ModerationLogMinAggregateInputType
    _max?: ModerationLogMaxAggregateInputType
  }

  export type ModerationLogGroupByOutputType = {
    id: string
    postId: string
    reviewerId: string
    oldStatus: string
    newStatus: string
    decision: string
    note: string | null
    createdAt: Date
    _count: ModerationLogCountAggregateOutputType | null
    _min: ModerationLogMinAggregateOutputType | null
    _max: ModerationLogMaxAggregateOutputType | null
  }

  type GetModerationLogGroupByPayload<T extends ModerationLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ModerationLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ModerationLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ModerationLogGroupByOutputType[P]>
            : GetScalarType<T[P], ModerationLogGroupByOutputType[P]>
        }
      >
    >


  export type ModerationLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    postId?: boolean
    reviewerId?: boolean
    oldStatus?: boolean
    newStatus?: boolean
    decision?: boolean
    note?: boolean
    createdAt?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["moderationLog"]>



  export type ModerationLogSelectScalar = {
    id?: boolean
    postId?: boolean
    reviewerId?: boolean
    oldStatus?: boolean
    newStatus?: boolean
    decision?: boolean
    note?: boolean
    createdAt?: boolean
  }

  export type ModerationLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "postId" | "reviewerId" | "oldStatus" | "newStatus" | "decision" | "note" | "createdAt", ExtArgs["result"]["moderationLog"]>
  export type ModerationLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
  }

  export type $ModerationLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ModerationLog"
    objects: {
      post: Prisma.$PostPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      postId: string
      reviewerId: string
      oldStatus: string
      newStatus: string
      decision: string
      note: string | null
      createdAt: Date
    }, ExtArgs["result"]["moderationLog"]>
    composites: {}
  }

  type ModerationLogGetPayload<S extends boolean | null | undefined | ModerationLogDefaultArgs> = $Result.GetResult<Prisma.$ModerationLogPayload, S>

  type ModerationLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ModerationLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ModerationLogCountAggregateInputType | true
    }

  export interface ModerationLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ModerationLog'], meta: { name: 'ModerationLog' } }
    /**
     * Find zero or one ModerationLog that matches the filter.
     * @param {ModerationLogFindUniqueArgs} args - Arguments to find a ModerationLog
     * @example
     * // Get one ModerationLog
     * const moderationLog = await prisma.moderationLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ModerationLogFindUniqueArgs>(args: SelectSubset<T, ModerationLogFindUniqueArgs<ExtArgs>>): Prisma__ModerationLogClient<$Result.GetResult<Prisma.$ModerationLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ModerationLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ModerationLogFindUniqueOrThrowArgs} args - Arguments to find a ModerationLog
     * @example
     * // Get one ModerationLog
     * const moderationLog = await prisma.moderationLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ModerationLogFindUniqueOrThrowArgs>(args: SelectSubset<T, ModerationLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ModerationLogClient<$Result.GetResult<Prisma.$ModerationLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ModerationLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModerationLogFindFirstArgs} args - Arguments to find a ModerationLog
     * @example
     * // Get one ModerationLog
     * const moderationLog = await prisma.moderationLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ModerationLogFindFirstArgs>(args?: SelectSubset<T, ModerationLogFindFirstArgs<ExtArgs>>): Prisma__ModerationLogClient<$Result.GetResult<Prisma.$ModerationLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ModerationLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModerationLogFindFirstOrThrowArgs} args - Arguments to find a ModerationLog
     * @example
     * // Get one ModerationLog
     * const moderationLog = await prisma.moderationLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ModerationLogFindFirstOrThrowArgs>(args?: SelectSubset<T, ModerationLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__ModerationLogClient<$Result.GetResult<Prisma.$ModerationLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ModerationLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModerationLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ModerationLogs
     * const moderationLogs = await prisma.moderationLog.findMany()
     * 
     * // Get first 10 ModerationLogs
     * const moderationLogs = await prisma.moderationLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const moderationLogWithIdOnly = await prisma.moderationLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ModerationLogFindManyArgs>(args?: SelectSubset<T, ModerationLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ModerationLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ModerationLog.
     * @param {ModerationLogCreateArgs} args - Arguments to create a ModerationLog.
     * @example
     * // Create one ModerationLog
     * const ModerationLog = await prisma.moderationLog.create({
     *   data: {
     *     // ... data to create a ModerationLog
     *   }
     * })
     * 
     */
    create<T extends ModerationLogCreateArgs>(args: SelectSubset<T, ModerationLogCreateArgs<ExtArgs>>): Prisma__ModerationLogClient<$Result.GetResult<Prisma.$ModerationLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ModerationLogs.
     * @param {ModerationLogCreateManyArgs} args - Arguments to create many ModerationLogs.
     * @example
     * // Create many ModerationLogs
     * const moderationLog = await prisma.moderationLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ModerationLogCreateManyArgs>(args?: SelectSubset<T, ModerationLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ModerationLog.
     * @param {ModerationLogDeleteArgs} args - Arguments to delete one ModerationLog.
     * @example
     * // Delete one ModerationLog
     * const ModerationLog = await prisma.moderationLog.delete({
     *   where: {
     *     // ... filter to delete one ModerationLog
     *   }
     * })
     * 
     */
    delete<T extends ModerationLogDeleteArgs>(args: SelectSubset<T, ModerationLogDeleteArgs<ExtArgs>>): Prisma__ModerationLogClient<$Result.GetResult<Prisma.$ModerationLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ModerationLog.
     * @param {ModerationLogUpdateArgs} args - Arguments to update one ModerationLog.
     * @example
     * // Update one ModerationLog
     * const moderationLog = await prisma.moderationLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ModerationLogUpdateArgs>(args: SelectSubset<T, ModerationLogUpdateArgs<ExtArgs>>): Prisma__ModerationLogClient<$Result.GetResult<Prisma.$ModerationLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ModerationLogs.
     * @param {ModerationLogDeleteManyArgs} args - Arguments to filter ModerationLogs to delete.
     * @example
     * // Delete a few ModerationLogs
     * const { count } = await prisma.moderationLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ModerationLogDeleteManyArgs>(args?: SelectSubset<T, ModerationLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ModerationLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModerationLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ModerationLogs
     * const moderationLog = await prisma.moderationLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ModerationLogUpdateManyArgs>(args: SelectSubset<T, ModerationLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ModerationLog.
     * @param {ModerationLogUpsertArgs} args - Arguments to update or create a ModerationLog.
     * @example
     * // Update or create a ModerationLog
     * const moderationLog = await prisma.moderationLog.upsert({
     *   create: {
     *     // ... data to create a ModerationLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ModerationLog we want to update
     *   }
     * })
     */
    upsert<T extends ModerationLogUpsertArgs>(args: SelectSubset<T, ModerationLogUpsertArgs<ExtArgs>>): Prisma__ModerationLogClient<$Result.GetResult<Prisma.$ModerationLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ModerationLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModerationLogCountArgs} args - Arguments to filter ModerationLogs to count.
     * @example
     * // Count the number of ModerationLogs
     * const count = await prisma.moderationLog.count({
     *   where: {
     *     // ... the filter for the ModerationLogs we want to count
     *   }
     * })
    **/
    count<T extends ModerationLogCountArgs>(
      args?: Subset<T, ModerationLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ModerationLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ModerationLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModerationLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ModerationLogAggregateArgs>(args: Subset<T, ModerationLogAggregateArgs>): Prisma.PrismaPromise<GetModerationLogAggregateType<T>>

    /**
     * Group by ModerationLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModerationLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ModerationLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ModerationLogGroupByArgs['orderBy'] }
        : { orderBy?: ModerationLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ModerationLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetModerationLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ModerationLog model
   */
  readonly fields: ModerationLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ModerationLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ModerationLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    post<T extends PostDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PostDefaultArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ModerationLog model
   */
  interface ModerationLogFieldRefs {
    readonly id: FieldRef<"ModerationLog", 'String'>
    readonly postId: FieldRef<"ModerationLog", 'String'>
    readonly reviewerId: FieldRef<"ModerationLog", 'String'>
    readonly oldStatus: FieldRef<"ModerationLog", 'String'>
    readonly newStatus: FieldRef<"ModerationLog", 'String'>
    readonly decision: FieldRef<"ModerationLog", 'String'>
    readonly note: FieldRef<"ModerationLog", 'String'>
    readonly createdAt: FieldRef<"ModerationLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ModerationLog findUnique
   */
  export type ModerationLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModerationLog
     */
    select?: ModerationLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModerationLog
     */
    omit?: ModerationLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModerationLogInclude<ExtArgs> | null
    /**
     * Filter, which ModerationLog to fetch.
     */
    where: ModerationLogWhereUniqueInput
  }

  /**
   * ModerationLog findUniqueOrThrow
   */
  export type ModerationLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModerationLog
     */
    select?: ModerationLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModerationLog
     */
    omit?: ModerationLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModerationLogInclude<ExtArgs> | null
    /**
     * Filter, which ModerationLog to fetch.
     */
    where: ModerationLogWhereUniqueInput
  }

  /**
   * ModerationLog findFirst
   */
  export type ModerationLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModerationLog
     */
    select?: ModerationLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModerationLog
     */
    omit?: ModerationLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModerationLogInclude<ExtArgs> | null
    /**
     * Filter, which ModerationLog to fetch.
     */
    where?: ModerationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModerationLogs to fetch.
     */
    orderBy?: ModerationLogOrderByWithRelationInput | ModerationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ModerationLogs.
     */
    cursor?: ModerationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModerationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModerationLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ModerationLogs.
     */
    distinct?: ModerationLogScalarFieldEnum | ModerationLogScalarFieldEnum[]
  }

  /**
   * ModerationLog findFirstOrThrow
   */
  export type ModerationLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModerationLog
     */
    select?: ModerationLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModerationLog
     */
    omit?: ModerationLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModerationLogInclude<ExtArgs> | null
    /**
     * Filter, which ModerationLog to fetch.
     */
    where?: ModerationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModerationLogs to fetch.
     */
    orderBy?: ModerationLogOrderByWithRelationInput | ModerationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ModerationLogs.
     */
    cursor?: ModerationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModerationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModerationLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ModerationLogs.
     */
    distinct?: ModerationLogScalarFieldEnum | ModerationLogScalarFieldEnum[]
  }

  /**
   * ModerationLog findMany
   */
  export type ModerationLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModerationLog
     */
    select?: ModerationLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModerationLog
     */
    omit?: ModerationLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModerationLogInclude<ExtArgs> | null
    /**
     * Filter, which ModerationLogs to fetch.
     */
    where?: ModerationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModerationLogs to fetch.
     */
    orderBy?: ModerationLogOrderByWithRelationInput | ModerationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ModerationLogs.
     */
    cursor?: ModerationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModerationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModerationLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ModerationLogs.
     */
    distinct?: ModerationLogScalarFieldEnum | ModerationLogScalarFieldEnum[]
  }

  /**
   * ModerationLog create
   */
  export type ModerationLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModerationLog
     */
    select?: ModerationLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModerationLog
     */
    omit?: ModerationLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModerationLogInclude<ExtArgs> | null
    /**
     * The data needed to create a ModerationLog.
     */
    data: XOR<ModerationLogCreateInput, ModerationLogUncheckedCreateInput>
  }

  /**
   * ModerationLog createMany
   */
  export type ModerationLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ModerationLogs.
     */
    data: ModerationLogCreateManyInput | ModerationLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ModerationLog update
   */
  export type ModerationLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModerationLog
     */
    select?: ModerationLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModerationLog
     */
    omit?: ModerationLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModerationLogInclude<ExtArgs> | null
    /**
     * The data needed to update a ModerationLog.
     */
    data: XOR<ModerationLogUpdateInput, ModerationLogUncheckedUpdateInput>
    /**
     * Choose, which ModerationLog to update.
     */
    where: ModerationLogWhereUniqueInput
  }

  /**
   * ModerationLog updateMany
   */
  export type ModerationLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ModerationLogs.
     */
    data: XOR<ModerationLogUpdateManyMutationInput, ModerationLogUncheckedUpdateManyInput>
    /**
     * Filter which ModerationLogs to update
     */
    where?: ModerationLogWhereInput
    /**
     * Limit how many ModerationLogs to update.
     */
    limit?: number
  }

  /**
   * ModerationLog upsert
   */
  export type ModerationLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModerationLog
     */
    select?: ModerationLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModerationLog
     */
    omit?: ModerationLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModerationLogInclude<ExtArgs> | null
    /**
     * The filter to search for the ModerationLog to update in case it exists.
     */
    where: ModerationLogWhereUniqueInput
    /**
     * In case the ModerationLog found by the `where` argument doesn't exist, create a new ModerationLog with this data.
     */
    create: XOR<ModerationLogCreateInput, ModerationLogUncheckedCreateInput>
    /**
     * In case the ModerationLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ModerationLogUpdateInput, ModerationLogUncheckedUpdateInput>
  }

  /**
   * ModerationLog delete
   */
  export type ModerationLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModerationLog
     */
    select?: ModerationLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModerationLog
     */
    omit?: ModerationLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModerationLogInclude<ExtArgs> | null
    /**
     * Filter which ModerationLog to delete.
     */
    where: ModerationLogWhereUniqueInput
  }

  /**
   * ModerationLog deleteMany
   */
  export type ModerationLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ModerationLogs to delete
     */
    where?: ModerationLogWhereInput
    /**
     * Limit how many ModerationLogs to delete.
     */
    limit?: number
  }

  /**
   * ModerationLog without action
   */
  export type ModerationLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModerationLog
     */
    select?: ModerationLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModerationLog
     */
    omit?: ModerationLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModerationLogInclude<ExtArgs> | null
  }


  /**
   * Model AuditLog
   */

  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  export type AuditLogMinAggregateOutputType = {
    id: string | null
    postId: string | null
    actorId: string | null
    action: string | null
    entityType: string | null
    entityId: string | null
    metadata: string | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date | null
  }

  export type AuditLogMaxAggregateOutputType = {
    id: string | null
    postId: string | null
    actorId: string | null
    action: string | null
    entityType: string | null
    entityId: string | null
    metadata: string | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date | null
  }

  export type AuditLogCountAggregateOutputType = {
    id: number
    postId: number
    actorId: number
    action: number
    entityType: number
    entityId: number
    metadata: number
    ipAddress: number
    userAgent: number
    createdAt: number
    _all: number
  }


  export type AuditLogMinAggregateInputType = {
    id?: true
    postId?: true
    actorId?: true
    action?: true
    entityType?: true
    entityId?: true
    metadata?: true
    ipAddress?: true
    userAgent?: true
    createdAt?: true
  }

  export type AuditLogMaxAggregateInputType = {
    id?: true
    postId?: true
    actorId?: true
    action?: true
    entityType?: true
    entityId?: true
    metadata?: true
    ipAddress?: true
    userAgent?: true
    createdAt?: true
  }

  export type AuditLogCountAggregateInputType = {
    id?: true
    postId?: true
    actorId?: true
    action?: true
    entityType?: true
    entityId?: true
    metadata?: true
    ipAddress?: true
    userAgent?: true
    createdAt?: true
    _all?: true
  }

  export type AuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditLogs
    **/
    _count?: true | AuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditLogMaxAggregateInputType
  }

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>
  }




  export type AuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithAggregationInput | AuditLogOrderByWithAggregationInput[]
    by: AuditLogScalarFieldEnum[] | AuditLogScalarFieldEnum
    having?: AuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditLogCountAggregateInputType | true
    _min?: AuditLogMinAggregateInputType
    _max?: AuditLogMaxAggregateInputType
  }

  export type AuditLogGroupByOutputType = {
    id: string
    postId: string | null
    actorId: string
    action: string
    entityType: string
    entityId: string
    metadata: string | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
        }
      >
    >


  export type AuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    postId?: boolean
    actorId?: boolean
    action?: boolean
    entityType?: boolean
    entityId?: boolean
    metadata?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
    post?: boolean | AuditLog$postArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>



  export type AuditLogSelectScalar = {
    id?: boolean
    postId?: boolean
    actorId?: boolean
    action?: boolean
    entityType?: boolean
    entityId?: boolean
    metadata?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
  }

  export type AuditLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "postId" | "actorId" | "action" | "entityType" | "entityId" | "metadata" | "ipAddress" | "userAgent" | "createdAt", ExtArgs["result"]["auditLog"]>
  export type AuditLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | AuditLog$postArgs<ExtArgs>
  }

  export type $AuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditLog"
    objects: {
      post: Prisma.$PostPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      postId: string | null
      actorId: string
      action: string
      entityType: string
      entityId: string
      metadata: string | null
      ipAddress: string | null
      userAgent: string | null
      createdAt: Date
    }, ExtArgs["result"]["auditLog"]>
    composites: {}
  }

  type AuditLogGetPayload<S extends boolean | null | undefined | AuditLogDefaultArgs> = $Result.GetResult<Prisma.$AuditLogPayload, S>

  type AuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuditLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuditLogCountAggregateInputType | true
    }

  export interface AuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditLog'], meta: { name: 'AuditLog' } }
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditLogFindUniqueArgs>(args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuditLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditLogFindFirstArgs>(args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     * 
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuditLogFindManyArgs>(args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     * 
     */
    create<T extends AuditLogCreateArgs>(args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuditLogs.
     * @param {AuditLogCreateManyArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditLogCreateManyArgs>(args?: SelectSubset<T, AuditLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     * 
     */
    delete<T extends AuditLogDeleteArgs>(args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditLogUpdateArgs>(args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditLogDeleteManyArgs>(args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditLogUpdateManyArgs>(args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
     */
    upsert<T extends AuditLogUpsertArgs>(args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
    **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuditLogAggregateArgs>(args: Subset<T, AuditLogAggregateArgs>): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditLog model
   */
  readonly fields: AuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    post<T extends AuditLog$postArgs<ExtArgs> = {}>(args?: Subset<T, AuditLog$postArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuditLog model
   */
  interface AuditLogFieldRefs {
    readonly id: FieldRef<"AuditLog", 'String'>
    readonly postId: FieldRef<"AuditLog", 'String'>
    readonly actorId: FieldRef<"AuditLog", 'String'>
    readonly action: FieldRef<"AuditLog", 'String'>
    readonly entityType: FieldRef<"AuditLog", 'String'>
    readonly entityId: FieldRef<"AuditLog", 'String'>
    readonly metadata: FieldRef<"AuditLog", 'String'>
    readonly ipAddress: FieldRef<"AuditLog", 'String'>
    readonly userAgent: FieldRef<"AuditLog", 'String'>
    readonly createdAt: FieldRef<"AuditLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuditLog findUnique
   */
  export type AuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findFirst
   */
  export type AuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
  }

  /**
   * AuditLog createMany
   */
  export type AuditLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
  }

  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
  }

  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to delete.
     */
    limit?: number
  }

  /**
   * AuditLog.post
   */
  export type AuditLog$postArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    where?: PostWhereInput
  }

  /**
   * AuditLog without action
   */
  export type AuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
  }


  /**
   * Model PostTranslation
   */

  export type AggregatePostTranslation = {
    _count: PostTranslationCountAggregateOutputType | null
    _avg: PostTranslationAvgAggregateOutputType | null
    _sum: PostTranslationSumAggregateOutputType | null
    _min: PostTranslationMinAggregateOutputType | null
    _max: PostTranslationMaxAggregateOutputType | null
  }

  export type PostTranslationAvgAggregateOutputType = {
    version: number | null
    mainVersionRef: number | null
  }

  export type PostTranslationSumAggregateOutputType = {
    version: number | null
    mainVersionRef: number | null
  }

  export type PostTranslationMinAggregateOutputType = {
    id: string | null
    postId: string | null
    langCode: string | null
    title: string | null
    slug: string | null
    description: string | null
    content: string | null
    contentHtml: string | null
    version: number | null
    mainVersionRef: number | null
    isPublished: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PostTranslationMaxAggregateOutputType = {
    id: string | null
    postId: string | null
    langCode: string | null
    title: string | null
    slug: string | null
    description: string | null
    content: string | null
    contentHtml: string | null
    version: number | null
    mainVersionRef: number | null
    isPublished: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PostTranslationCountAggregateOutputType = {
    id: number
    postId: number
    langCode: number
    title: number
    slug: number
    description: number
    content: number
    contentHtml: number
    version: number
    mainVersionRef: number
    isPublished: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PostTranslationAvgAggregateInputType = {
    version?: true
    mainVersionRef?: true
  }

  export type PostTranslationSumAggregateInputType = {
    version?: true
    mainVersionRef?: true
  }

  export type PostTranslationMinAggregateInputType = {
    id?: true
    postId?: true
    langCode?: true
    title?: true
    slug?: true
    description?: true
    content?: true
    contentHtml?: true
    version?: true
    mainVersionRef?: true
    isPublished?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PostTranslationMaxAggregateInputType = {
    id?: true
    postId?: true
    langCode?: true
    title?: true
    slug?: true
    description?: true
    content?: true
    contentHtml?: true
    version?: true
    mainVersionRef?: true
    isPublished?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PostTranslationCountAggregateInputType = {
    id?: true
    postId?: true
    langCode?: true
    title?: true
    slug?: true
    description?: true
    content?: true
    contentHtml?: true
    version?: true
    mainVersionRef?: true
    isPublished?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PostTranslationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PostTranslation to aggregate.
     */
    where?: PostTranslationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PostTranslations to fetch.
     */
    orderBy?: PostTranslationOrderByWithRelationInput | PostTranslationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PostTranslationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PostTranslations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PostTranslations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PostTranslations
    **/
    _count?: true | PostTranslationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PostTranslationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PostTranslationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PostTranslationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PostTranslationMaxAggregateInputType
  }

  export type GetPostTranslationAggregateType<T extends PostTranslationAggregateArgs> = {
        [P in keyof T & keyof AggregatePostTranslation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePostTranslation[P]>
      : GetScalarType<T[P], AggregatePostTranslation[P]>
  }




  export type PostTranslationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostTranslationWhereInput
    orderBy?: PostTranslationOrderByWithAggregationInput | PostTranslationOrderByWithAggregationInput[]
    by: PostTranslationScalarFieldEnum[] | PostTranslationScalarFieldEnum
    having?: PostTranslationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PostTranslationCountAggregateInputType | true
    _avg?: PostTranslationAvgAggregateInputType
    _sum?: PostTranslationSumAggregateInputType
    _min?: PostTranslationMinAggregateInputType
    _max?: PostTranslationMaxAggregateInputType
  }

  export type PostTranslationGroupByOutputType = {
    id: string
    postId: string
    langCode: string
    title: string
    slug: string | null
    description: string | null
    content: string | null
    contentHtml: string | null
    version: number
    mainVersionRef: number
    isPublished: boolean
    createdAt: Date
    updatedAt: Date
    _count: PostTranslationCountAggregateOutputType | null
    _avg: PostTranslationAvgAggregateOutputType | null
    _sum: PostTranslationSumAggregateOutputType | null
    _min: PostTranslationMinAggregateOutputType | null
    _max: PostTranslationMaxAggregateOutputType | null
  }

  type GetPostTranslationGroupByPayload<T extends PostTranslationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PostTranslationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PostTranslationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PostTranslationGroupByOutputType[P]>
            : GetScalarType<T[P], PostTranslationGroupByOutputType[P]>
        }
      >
    >


  export type PostTranslationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    postId?: boolean
    langCode?: boolean
    title?: boolean
    slug?: boolean
    description?: boolean
    content?: boolean
    contentHtml?: boolean
    version?: boolean
    mainVersionRef?: boolean
    isPublished?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["postTranslation"]>



  export type PostTranslationSelectScalar = {
    id?: boolean
    postId?: boolean
    langCode?: boolean
    title?: boolean
    slug?: boolean
    description?: boolean
    content?: boolean
    contentHtml?: boolean
    version?: boolean
    mainVersionRef?: boolean
    isPublished?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PostTranslationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "postId" | "langCode" | "title" | "slug" | "description" | "content" | "contentHtml" | "version" | "mainVersionRef" | "isPublished" | "createdAt" | "updatedAt", ExtArgs["result"]["postTranslation"]>
  export type PostTranslationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
  }

  export type $PostTranslationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PostTranslation"
    objects: {
      post: Prisma.$PostPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      postId: string
      langCode: string
      title: string
      slug: string | null
      description: string | null
      content: string | null
      contentHtml: string | null
      version: number
      mainVersionRef: number
      isPublished: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["postTranslation"]>
    composites: {}
  }

  type PostTranslationGetPayload<S extends boolean | null | undefined | PostTranslationDefaultArgs> = $Result.GetResult<Prisma.$PostTranslationPayload, S>

  type PostTranslationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PostTranslationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PostTranslationCountAggregateInputType | true
    }

  export interface PostTranslationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PostTranslation'], meta: { name: 'PostTranslation' } }
    /**
     * Find zero or one PostTranslation that matches the filter.
     * @param {PostTranslationFindUniqueArgs} args - Arguments to find a PostTranslation
     * @example
     * // Get one PostTranslation
     * const postTranslation = await prisma.postTranslation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PostTranslationFindUniqueArgs>(args: SelectSubset<T, PostTranslationFindUniqueArgs<ExtArgs>>): Prisma__PostTranslationClient<$Result.GetResult<Prisma.$PostTranslationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PostTranslation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PostTranslationFindUniqueOrThrowArgs} args - Arguments to find a PostTranslation
     * @example
     * // Get one PostTranslation
     * const postTranslation = await prisma.postTranslation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PostTranslationFindUniqueOrThrowArgs>(args: SelectSubset<T, PostTranslationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PostTranslationClient<$Result.GetResult<Prisma.$PostTranslationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PostTranslation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostTranslationFindFirstArgs} args - Arguments to find a PostTranslation
     * @example
     * // Get one PostTranslation
     * const postTranslation = await prisma.postTranslation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PostTranslationFindFirstArgs>(args?: SelectSubset<T, PostTranslationFindFirstArgs<ExtArgs>>): Prisma__PostTranslationClient<$Result.GetResult<Prisma.$PostTranslationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PostTranslation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostTranslationFindFirstOrThrowArgs} args - Arguments to find a PostTranslation
     * @example
     * // Get one PostTranslation
     * const postTranslation = await prisma.postTranslation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PostTranslationFindFirstOrThrowArgs>(args?: SelectSubset<T, PostTranslationFindFirstOrThrowArgs<ExtArgs>>): Prisma__PostTranslationClient<$Result.GetResult<Prisma.$PostTranslationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PostTranslations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostTranslationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PostTranslations
     * const postTranslations = await prisma.postTranslation.findMany()
     * 
     * // Get first 10 PostTranslations
     * const postTranslations = await prisma.postTranslation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const postTranslationWithIdOnly = await prisma.postTranslation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PostTranslationFindManyArgs>(args?: SelectSubset<T, PostTranslationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostTranslationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PostTranslation.
     * @param {PostTranslationCreateArgs} args - Arguments to create a PostTranslation.
     * @example
     * // Create one PostTranslation
     * const PostTranslation = await prisma.postTranslation.create({
     *   data: {
     *     // ... data to create a PostTranslation
     *   }
     * })
     * 
     */
    create<T extends PostTranslationCreateArgs>(args: SelectSubset<T, PostTranslationCreateArgs<ExtArgs>>): Prisma__PostTranslationClient<$Result.GetResult<Prisma.$PostTranslationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PostTranslations.
     * @param {PostTranslationCreateManyArgs} args - Arguments to create many PostTranslations.
     * @example
     * // Create many PostTranslations
     * const postTranslation = await prisma.postTranslation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PostTranslationCreateManyArgs>(args?: SelectSubset<T, PostTranslationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a PostTranslation.
     * @param {PostTranslationDeleteArgs} args - Arguments to delete one PostTranslation.
     * @example
     * // Delete one PostTranslation
     * const PostTranslation = await prisma.postTranslation.delete({
     *   where: {
     *     // ... filter to delete one PostTranslation
     *   }
     * })
     * 
     */
    delete<T extends PostTranslationDeleteArgs>(args: SelectSubset<T, PostTranslationDeleteArgs<ExtArgs>>): Prisma__PostTranslationClient<$Result.GetResult<Prisma.$PostTranslationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PostTranslation.
     * @param {PostTranslationUpdateArgs} args - Arguments to update one PostTranslation.
     * @example
     * // Update one PostTranslation
     * const postTranslation = await prisma.postTranslation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PostTranslationUpdateArgs>(args: SelectSubset<T, PostTranslationUpdateArgs<ExtArgs>>): Prisma__PostTranslationClient<$Result.GetResult<Prisma.$PostTranslationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PostTranslations.
     * @param {PostTranslationDeleteManyArgs} args - Arguments to filter PostTranslations to delete.
     * @example
     * // Delete a few PostTranslations
     * const { count } = await prisma.postTranslation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PostTranslationDeleteManyArgs>(args?: SelectSubset<T, PostTranslationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PostTranslations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostTranslationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PostTranslations
     * const postTranslation = await prisma.postTranslation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PostTranslationUpdateManyArgs>(args: SelectSubset<T, PostTranslationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PostTranslation.
     * @param {PostTranslationUpsertArgs} args - Arguments to update or create a PostTranslation.
     * @example
     * // Update or create a PostTranslation
     * const postTranslation = await prisma.postTranslation.upsert({
     *   create: {
     *     // ... data to create a PostTranslation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PostTranslation we want to update
     *   }
     * })
     */
    upsert<T extends PostTranslationUpsertArgs>(args: SelectSubset<T, PostTranslationUpsertArgs<ExtArgs>>): Prisma__PostTranslationClient<$Result.GetResult<Prisma.$PostTranslationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PostTranslations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostTranslationCountArgs} args - Arguments to filter PostTranslations to count.
     * @example
     * // Count the number of PostTranslations
     * const count = await prisma.postTranslation.count({
     *   where: {
     *     // ... the filter for the PostTranslations we want to count
     *   }
     * })
    **/
    count<T extends PostTranslationCountArgs>(
      args?: Subset<T, PostTranslationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PostTranslationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PostTranslation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostTranslationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PostTranslationAggregateArgs>(args: Subset<T, PostTranslationAggregateArgs>): Prisma.PrismaPromise<GetPostTranslationAggregateType<T>>

    /**
     * Group by PostTranslation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostTranslationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PostTranslationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PostTranslationGroupByArgs['orderBy'] }
        : { orderBy?: PostTranslationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PostTranslationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPostTranslationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PostTranslation model
   */
  readonly fields: PostTranslationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PostTranslation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PostTranslationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    post<T extends PostDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PostDefaultArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PostTranslation model
   */
  interface PostTranslationFieldRefs {
    readonly id: FieldRef<"PostTranslation", 'String'>
    readonly postId: FieldRef<"PostTranslation", 'String'>
    readonly langCode: FieldRef<"PostTranslation", 'String'>
    readonly title: FieldRef<"PostTranslation", 'String'>
    readonly slug: FieldRef<"PostTranslation", 'String'>
    readonly description: FieldRef<"PostTranslation", 'String'>
    readonly content: FieldRef<"PostTranslation", 'String'>
    readonly contentHtml: FieldRef<"PostTranslation", 'String'>
    readonly version: FieldRef<"PostTranslation", 'Int'>
    readonly mainVersionRef: FieldRef<"PostTranslation", 'Int'>
    readonly isPublished: FieldRef<"PostTranslation", 'Boolean'>
    readonly createdAt: FieldRef<"PostTranslation", 'DateTime'>
    readonly updatedAt: FieldRef<"PostTranslation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PostTranslation findUnique
   */
  export type PostTranslationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostTranslation
     */
    select?: PostTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostTranslation
     */
    omit?: PostTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostTranslationInclude<ExtArgs> | null
    /**
     * Filter, which PostTranslation to fetch.
     */
    where: PostTranslationWhereUniqueInput
  }

  /**
   * PostTranslation findUniqueOrThrow
   */
  export type PostTranslationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostTranslation
     */
    select?: PostTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostTranslation
     */
    omit?: PostTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostTranslationInclude<ExtArgs> | null
    /**
     * Filter, which PostTranslation to fetch.
     */
    where: PostTranslationWhereUniqueInput
  }

  /**
   * PostTranslation findFirst
   */
  export type PostTranslationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostTranslation
     */
    select?: PostTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostTranslation
     */
    omit?: PostTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostTranslationInclude<ExtArgs> | null
    /**
     * Filter, which PostTranslation to fetch.
     */
    where?: PostTranslationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PostTranslations to fetch.
     */
    orderBy?: PostTranslationOrderByWithRelationInput | PostTranslationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PostTranslations.
     */
    cursor?: PostTranslationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PostTranslations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PostTranslations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PostTranslations.
     */
    distinct?: PostTranslationScalarFieldEnum | PostTranslationScalarFieldEnum[]
  }

  /**
   * PostTranslation findFirstOrThrow
   */
  export type PostTranslationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostTranslation
     */
    select?: PostTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostTranslation
     */
    omit?: PostTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostTranslationInclude<ExtArgs> | null
    /**
     * Filter, which PostTranslation to fetch.
     */
    where?: PostTranslationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PostTranslations to fetch.
     */
    orderBy?: PostTranslationOrderByWithRelationInput | PostTranslationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PostTranslations.
     */
    cursor?: PostTranslationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PostTranslations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PostTranslations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PostTranslations.
     */
    distinct?: PostTranslationScalarFieldEnum | PostTranslationScalarFieldEnum[]
  }

  /**
   * PostTranslation findMany
   */
  export type PostTranslationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostTranslation
     */
    select?: PostTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostTranslation
     */
    omit?: PostTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostTranslationInclude<ExtArgs> | null
    /**
     * Filter, which PostTranslations to fetch.
     */
    where?: PostTranslationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PostTranslations to fetch.
     */
    orderBy?: PostTranslationOrderByWithRelationInput | PostTranslationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PostTranslations.
     */
    cursor?: PostTranslationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PostTranslations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PostTranslations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PostTranslations.
     */
    distinct?: PostTranslationScalarFieldEnum | PostTranslationScalarFieldEnum[]
  }

  /**
   * PostTranslation create
   */
  export type PostTranslationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostTranslation
     */
    select?: PostTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostTranslation
     */
    omit?: PostTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostTranslationInclude<ExtArgs> | null
    /**
     * The data needed to create a PostTranslation.
     */
    data: XOR<PostTranslationCreateInput, PostTranslationUncheckedCreateInput>
  }

  /**
   * PostTranslation createMany
   */
  export type PostTranslationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PostTranslations.
     */
    data: PostTranslationCreateManyInput | PostTranslationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PostTranslation update
   */
  export type PostTranslationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostTranslation
     */
    select?: PostTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostTranslation
     */
    omit?: PostTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostTranslationInclude<ExtArgs> | null
    /**
     * The data needed to update a PostTranslation.
     */
    data: XOR<PostTranslationUpdateInput, PostTranslationUncheckedUpdateInput>
    /**
     * Choose, which PostTranslation to update.
     */
    where: PostTranslationWhereUniqueInput
  }

  /**
   * PostTranslation updateMany
   */
  export type PostTranslationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PostTranslations.
     */
    data: XOR<PostTranslationUpdateManyMutationInput, PostTranslationUncheckedUpdateManyInput>
    /**
     * Filter which PostTranslations to update
     */
    where?: PostTranslationWhereInput
    /**
     * Limit how many PostTranslations to update.
     */
    limit?: number
  }

  /**
   * PostTranslation upsert
   */
  export type PostTranslationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostTranslation
     */
    select?: PostTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostTranslation
     */
    omit?: PostTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostTranslationInclude<ExtArgs> | null
    /**
     * The filter to search for the PostTranslation to update in case it exists.
     */
    where: PostTranslationWhereUniqueInput
    /**
     * In case the PostTranslation found by the `where` argument doesn't exist, create a new PostTranslation with this data.
     */
    create: XOR<PostTranslationCreateInput, PostTranslationUncheckedCreateInput>
    /**
     * In case the PostTranslation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PostTranslationUpdateInput, PostTranslationUncheckedUpdateInput>
  }

  /**
   * PostTranslation delete
   */
  export type PostTranslationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostTranslation
     */
    select?: PostTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostTranslation
     */
    omit?: PostTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostTranslationInclude<ExtArgs> | null
    /**
     * Filter which PostTranslation to delete.
     */
    where: PostTranslationWhereUniqueInput
  }

  /**
   * PostTranslation deleteMany
   */
  export type PostTranslationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PostTranslations to delete
     */
    where?: PostTranslationWhereInput
    /**
     * Limit how many PostTranslations to delete.
     */
    limit?: number
  }

  /**
   * PostTranslation without action
   */
  export type PostTranslationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostTranslation
     */
    select?: PostTranslationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostTranslation
     */
    omit?: PostTranslationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostTranslationInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const BannerScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    description: 'description',
    imageUrl: 'imageUrl',
    linkType: 'linkType',
    customUrl: 'customUrl',
    target: 'target',
    position: 'position',
    orderIndex: 'orderIndex',
    status: 'status',
    metaTitle: 'metaTitle',
    metaDescription: 'metaDescription',
    startAt: 'startAt',
    endAt: 'endAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BannerScalarFieldEnum = (typeof BannerScalarFieldEnum)[keyof typeof BannerScalarFieldEnum]


  export const CategoryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    parentId: 'parentId',
    lft: 'lft',
    rgt: 'rgt',
    depth: 'depth',
    status: 'status',
    thumbnail: 'thumbnail',
    attachmentId: 'attachmentId',
    linkType: 'linkType',
    customUrl: 'customUrl',
    target: 'target',
    orderIndex: 'orderIndex',
    description: 'description',
    translations: 'translations',
    metaTitle: 'metaTitle',
    metaDescription: 'metaDescription',
    isGovStandard: 'isGovStandard',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CategoryScalarFieldEnum = (typeof CategoryScalarFieldEnum)[keyof typeof CategoryScalarFieldEnum]


  export const CommentScalarFieldEnum: {
    id: 'id',
    content: 'content',
    status: 'status',
    authorId: 'authorId',
    authorName: 'authorName',
    authorEmail: 'authorEmail',
    authorIp: 'authorIp',
    postId: 'postId',
    parentId: 'parentId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CommentScalarFieldEnum = (typeof CommentScalarFieldEnum)[keyof typeof CommentScalarFieldEnum]


  export const CitizenQuestionScalarFieldEnum: {
    id: 'id',
    title: 'title',
    content: 'content',
    askedByName: 'askedByName',
    askedByEmail: 'askedByEmail',
    askedByPhone: 'askedByPhone',
    address: 'address',
    status: 'status',
    answerContent: 'answerContent',
    answeredAt: 'answeredAt',
    answeredById: 'answeredById',
    isPublic: 'isPublic',
    categoryId: 'categoryId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CitizenQuestionScalarFieldEnum = (typeof CitizenQuestionScalarFieldEnum)[keyof typeof CitizenQuestionScalarFieldEnum]


  export const CitizenFeedbackScalarFieldEnum: {
    id: 'id',
    title: 'title',
    content: 'content',
    feedbackType: 'feedbackType',
    referenceId: 'referenceId',
    senderName: 'senderName',
    senderEmail: 'senderEmail',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CitizenFeedbackScalarFieldEnum = (typeof CitizenFeedbackScalarFieldEnum)[keyof typeof CitizenFeedbackScalarFieldEnum]


  export const PortalConfigScalarFieldEnum: {
    id: 'id',
    code: 'code',
    name: 'name',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PortalConfigScalarFieldEnum = (typeof PortalConfigScalarFieldEnum)[keyof typeof PortalConfigScalarFieldEnum]


  export const PortalMenuScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    translations: 'translations',
    icon: 'icon',
    link: 'link',
    order: 'order',
    parentId: 'parentId',
    isActive: 'isActive',
    target: 'target',
    type: 'type',
    referenceId: 'referenceId',
    position: 'position',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PortalMenuScalarFieldEnum = (typeof PortalMenuScalarFieldEnum)[keyof typeof PortalMenuScalarFieldEnum]


  export const PostScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    content: 'content',
    contentHtml: 'contentHtml',
    slug: 'slug',
    thumbnail: 'thumbnail',
    authorId: 'authorId',
    status: 'status',
    currentVersion: 'currentVersion',
    isFeatured: 'isFeatured',
    isNotification: 'isNotification',
    viewCount: 'viewCount',
    isTranslated: 'isTranslated',
    isCommentAllowed: 'isCommentAllowed',
    isDeleted: 'isDeleted',
    publishedAt: 'publishedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
    categoryId: 'categoryId'
  };

  export type PostScalarFieldEnum = (typeof PostScalarFieldEnum)[keyof typeof PostScalarFieldEnum]


  export const TagScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug'
  };

  export type TagScalarFieldEnum = (typeof TagScalarFieldEnum)[keyof typeof TagScalarFieldEnum]


  export const PostVersionScalarFieldEnum: {
    id: 'id',
    postId: 'postId',
    version: 'version',
    title: 'title',
    description: 'description',
    content: 'content',
    editorId: 'editorId',
    changeNote: 'changeNote',
    createdAt: 'createdAt'
  };

  export type PostVersionScalarFieldEnum = (typeof PostVersionScalarFieldEnum)[keyof typeof PostVersionScalarFieldEnum]


  export const ModerationLogScalarFieldEnum: {
    id: 'id',
    postId: 'postId',
    reviewerId: 'reviewerId',
    oldStatus: 'oldStatus',
    newStatus: 'newStatus',
    decision: 'decision',
    note: 'note',
    createdAt: 'createdAt'
  };

  export type ModerationLogScalarFieldEnum = (typeof ModerationLogScalarFieldEnum)[keyof typeof ModerationLogScalarFieldEnum]


  export const AuditLogScalarFieldEnum: {
    id: 'id',
    postId: 'postId',
    actorId: 'actorId',
    action: 'action',
    entityType: 'entityType',
    entityId: 'entityId',
    metadata: 'metadata',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    createdAt: 'createdAt'
  };

  export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum]


  export const PostTranslationScalarFieldEnum: {
    id: 'id',
    postId: 'postId',
    langCode: 'langCode',
    title: 'title',
    slug: 'slug',
    description: 'description',
    content: 'content',
    contentHtml: 'contentHtml',
    version: 'version',
    mainVersionRef: 'mainVersionRef',
    isPublished: 'isPublished',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PostTranslationScalarFieldEnum = (typeof PostTranslationScalarFieldEnum)[keyof typeof PostTranslationScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const BannerOrderByRelevanceFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    description: 'description',
    imageUrl: 'imageUrl',
    linkType: 'linkType',
    customUrl: 'customUrl',
    target: 'target',
    position: 'position',
    metaTitle: 'metaTitle',
    metaDescription: 'metaDescription'
  };

  export type BannerOrderByRelevanceFieldEnum = (typeof BannerOrderByRelevanceFieldEnum)[keyof typeof BannerOrderByRelevanceFieldEnum]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const CategoryOrderByRelevanceFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    parentId: 'parentId',
    thumbnail: 'thumbnail',
    attachmentId: 'attachmentId',
    linkType: 'linkType',
    customUrl: 'customUrl',
    target: 'target',
    description: 'description',
    metaTitle: 'metaTitle',
    metaDescription: 'metaDescription'
  };

  export type CategoryOrderByRelevanceFieldEnum = (typeof CategoryOrderByRelevanceFieldEnum)[keyof typeof CategoryOrderByRelevanceFieldEnum]


  export const CommentOrderByRelevanceFieldEnum: {
    id: 'id',
    content: 'content',
    status: 'status',
    authorId: 'authorId',
    authorName: 'authorName',
    authorEmail: 'authorEmail',
    authorIp: 'authorIp',
    postId: 'postId',
    parentId: 'parentId'
  };

  export type CommentOrderByRelevanceFieldEnum = (typeof CommentOrderByRelevanceFieldEnum)[keyof typeof CommentOrderByRelevanceFieldEnum]


  export const CitizenQuestionOrderByRelevanceFieldEnum: {
    id: 'id',
    title: 'title',
    content: 'content',
    askedByName: 'askedByName',
    askedByEmail: 'askedByEmail',
    askedByPhone: 'askedByPhone',
    address: 'address',
    status: 'status',
    answerContent: 'answerContent',
    answeredById: 'answeredById',
    categoryId: 'categoryId'
  };

  export type CitizenQuestionOrderByRelevanceFieldEnum = (typeof CitizenQuestionOrderByRelevanceFieldEnum)[keyof typeof CitizenQuestionOrderByRelevanceFieldEnum]


  export const CitizenFeedbackOrderByRelevanceFieldEnum: {
    id: 'id',
    title: 'title',
    content: 'content',
    feedbackType: 'feedbackType',
    referenceId: 'referenceId',
    senderName: 'senderName',
    senderEmail: 'senderEmail',
    status: 'status'
  };

  export type CitizenFeedbackOrderByRelevanceFieldEnum = (typeof CitizenFeedbackOrderByRelevanceFieldEnum)[keyof typeof CitizenFeedbackOrderByRelevanceFieldEnum]


  export const PortalConfigOrderByRelevanceFieldEnum: {
    code: 'code',
    name: 'name',
    description: 'description'
  };

  export type PortalConfigOrderByRelevanceFieldEnum = (typeof PortalConfigOrderByRelevanceFieldEnum)[keyof typeof PortalConfigOrderByRelevanceFieldEnum]


  export const PortalMenuOrderByRelevanceFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    icon: 'icon',
    link: 'link',
    parentId: 'parentId',
    target: 'target',
    type: 'type',
    referenceId: 'referenceId',
    position: 'position'
  };

  export type PortalMenuOrderByRelevanceFieldEnum = (typeof PortalMenuOrderByRelevanceFieldEnum)[keyof typeof PortalMenuOrderByRelevanceFieldEnum]


  export const PostOrderByRelevanceFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    content: 'content',
    contentHtml: 'contentHtml',
    slug: 'slug',
    thumbnail: 'thumbnail',
    authorId: 'authorId',
    status: 'status',
    categoryId: 'categoryId'
  };

  export type PostOrderByRelevanceFieldEnum = (typeof PostOrderByRelevanceFieldEnum)[keyof typeof PostOrderByRelevanceFieldEnum]


  export const TagOrderByRelevanceFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug'
  };

  export type TagOrderByRelevanceFieldEnum = (typeof TagOrderByRelevanceFieldEnum)[keyof typeof TagOrderByRelevanceFieldEnum]


  export const PostVersionOrderByRelevanceFieldEnum: {
    id: 'id',
    postId: 'postId',
    title: 'title',
    description: 'description',
    content: 'content',
    editorId: 'editorId',
    changeNote: 'changeNote'
  };

  export type PostVersionOrderByRelevanceFieldEnum = (typeof PostVersionOrderByRelevanceFieldEnum)[keyof typeof PostVersionOrderByRelevanceFieldEnum]


  export const ModerationLogOrderByRelevanceFieldEnum: {
    id: 'id',
    postId: 'postId',
    reviewerId: 'reviewerId',
    oldStatus: 'oldStatus',
    newStatus: 'newStatus',
    decision: 'decision',
    note: 'note'
  };

  export type ModerationLogOrderByRelevanceFieldEnum = (typeof ModerationLogOrderByRelevanceFieldEnum)[keyof typeof ModerationLogOrderByRelevanceFieldEnum]


  export const AuditLogOrderByRelevanceFieldEnum: {
    id: 'id',
    postId: 'postId',
    actorId: 'actorId',
    action: 'action',
    entityType: 'entityType',
    entityId: 'entityId',
    metadata: 'metadata',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent'
  };

  export type AuditLogOrderByRelevanceFieldEnum = (typeof AuditLogOrderByRelevanceFieldEnum)[keyof typeof AuditLogOrderByRelevanceFieldEnum]


  export const PostTranslationOrderByRelevanceFieldEnum: {
    id: 'id',
    postId: 'postId',
    langCode: 'langCode',
    title: 'title',
    slug: 'slug',
    description: 'description',
    content: 'content',
    contentHtml: 'contentHtml'
  };

  export type PostTranslationOrderByRelevanceFieldEnum = (typeof PostTranslationOrderByRelevanceFieldEnum)[keyof typeof PostTranslationOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type BannerWhereInput = {
    AND?: BannerWhereInput | BannerWhereInput[]
    OR?: BannerWhereInput[]
    NOT?: BannerWhereInput | BannerWhereInput[]
    id?: StringFilter<"Banner"> | string
    name?: StringFilter<"Banner"> | string
    slug?: StringFilter<"Banner"> | string
    description?: StringNullableFilter<"Banner"> | string | null
    imageUrl?: StringFilter<"Banner"> | string
    linkType?: StringNullableFilter<"Banner"> | string | null
    customUrl?: StringNullableFilter<"Banner"> | string | null
    target?: StringNullableFilter<"Banner"> | string | null
    position?: StringNullableFilter<"Banner"> | string | null
    orderIndex?: IntFilter<"Banner"> | number
    status?: BoolFilter<"Banner"> | boolean
    metaTitle?: StringNullableFilter<"Banner"> | string | null
    metaDescription?: StringNullableFilter<"Banner"> | string | null
    startAt?: DateTimeNullableFilter<"Banner"> | Date | string | null
    endAt?: DateTimeNullableFilter<"Banner"> | Date | string | null
    createdAt?: DateTimeFilter<"Banner"> | Date | string
    updatedAt?: DateTimeFilter<"Banner"> | Date | string
  }

  export type BannerOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    imageUrl?: SortOrder
    linkType?: SortOrderInput | SortOrder
    customUrl?: SortOrderInput | SortOrder
    target?: SortOrderInput | SortOrder
    position?: SortOrderInput | SortOrder
    orderIndex?: SortOrder
    status?: SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    startAt?: SortOrderInput | SortOrder
    endAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: BannerOrderByRelevanceInput
  }

  export type BannerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: BannerWhereInput | BannerWhereInput[]
    OR?: BannerWhereInput[]
    NOT?: BannerWhereInput | BannerWhereInput[]
    name?: StringFilter<"Banner"> | string
    description?: StringNullableFilter<"Banner"> | string | null
    imageUrl?: StringFilter<"Banner"> | string
    linkType?: StringNullableFilter<"Banner"> | string | null
    customUrl?: StringNullableFilter<"Banner"> | string | null
    target?: StringNullableFilter<"Banner"> | string | null
    position?: StringNullableFilter<"Banner"> | string | null
    orderIndex?: IntFilter<"Banner"> | number
    status?: BoolFilter<"Banner"> | boolean
    metaTitle?: StringNullableFilter<"Banner"> | string | null
    metaDescription?: StringNullableFilter<"Banner"> | string | null
    startAt?: DateTimeNullableFilter<"Banner"> | Date | string | null
    endAt?: DateTimeNullableFilter<"Banner"> | Date | string | null
    createdAt?: DateTimeFilter<"Banner"> | Date | string
    updatedAt?: DateTimeFilter<"Banner"> | Date | string
  }, "id" | "slug">

  export type BannerOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    imageUrl?: SortOrder
    linkType?: SortOrderInput | SortOrder
    customUrl?: SortOrderInput | SortOrder
    target?: SortOrderInput | SortOrder
    position?: SortOrderInput | SortOrder
    orderIndex?: SortOrder
    status?: SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    startAt?: SortOrderInput | SortOrder
    endAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BannerCountOrderByAggregateInput
    _avg?: BannerAvgOrderByAggregateInput
    _max?: BannerMaxOrderByAggregateInput
    _min?: BannerMinOrderByAggregateInput
    _sum?: BannerSumOrderByAggregateInput
  }

  export type BannerScalarWhereWithAggregatesInput = {
    AND?: BannerScalarWhereWithAggregatesInput | BannerScalarWhereWithAggregatesInput[]
    OR?: BannerScalarWhereWithAggregatesInput[]
    NOT?: BannerScalarWhereWithAggregatesInput | BannerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Banner"> | string
    name?: StringWithAggregatesFilter<"Banner"> | string
    slug?: StringWithAggregatesFilter<"Banner"> | string
    description?: StringNullableWithAggregatesFilter<"Banner"> | string | null
    imageUrl?: StringWithAggregatesFilter<"Banner"> | string
    linkType?: StringNullableWithAggregatesFilter<"Banner"> | string | null
    customUrl?: StringNullableWithAggregatesFilter<"Banner"> | string | null
    target?: StringNullableWithAggregatesFilter<"Banner"> | string | null
    position?: StringNullableWithAggregatesFilter<"Banner"> | string | null
    orderIndex?: IntWithAggregatesFilter<"Banner"> | number
    status?: BoolWithAggregatesFilter<"Banner"> | boolean
    metaTitle?: StringNullableWithAggregatesFilter<"Banner"> | string | null
    metaDescription?: StringNullableWithAggregatesFilter<"Banner"> | string | null
    startAt?: DateTimeNullableWithAggregatesFilter<"Banner"> | Date | string | null
    endAt?: DateTimeNullableWithAggregatesFilter<"Banner"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Banner"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Banner"> | Date | string
  }

  export type CategoryWhereInput = {
    AND?: CategoryWhereInput | CategoryWhereInput[]
    OR?: CategoryWhereInput[]
    NOT?: CategoryWhereInput | CategoryWhereInput[]
    id?: StringFilter<"Category"> | string
    name?: StringFilter<"Category"> | string
    slug?: StringFilter<"Category"> | string
    parentId?: StringNullableFilter<"Category"> | string | null
    lft?: IntFilter<"Category"> | number
    rgt?: IntFilter<"Category"> | number
    depth?: IntFilter<"Category"> | number
    status?: BoolFilter<"Category"> | boolean
    thumbnail?: StringNullableFilter<"Category"> | string | null
    attachmentId?: StringNullableFilter<"Category"> | string | null
    linkType?: StringNullableFilter<"Category"> | string | null
    customUrl?: StringNullableFilter<"Category"> | string | null
    target?: StringNullableFilter<"Category"> | string | null
    orderIndex?: IntFilter<"Category"> | number
    description?: StringNullableFilter<"Category"> | string | null
    translations?: JsonNullableFilter<"Category">
    metaTitle?: StringNullableFilter<"Category"> | string | null
    metaDescription?: StringNullableFilter<"Category"> | string | null
    isGovStandard?: BoolFilter<"Category"> | boolean
    createdAt?: DateTimeFilter<"Category"> | Date | string
    updatedAt?: DateTimeFilter<"Category"> | Date | string
    parent?: XOR<CategoryNullableScalarRelationFilter, CategoryWhereInput> | null
    children?: CategoryListRelationFilter
    posts?: PostListRelationFilter
  }

  export type CategoryOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    parentId?: SortOrderInput | SortOrder
    lft?: SortOrder
    rgt?: SortOrder
    depth?: SortOrder
    status?: SortOrder
    thumbnail?: SortOrderInput | SortOrder
    attachmentId?: SortOrderInput | SortOrder
    linkType?: SortOrderInput | SortOrder
    customUrl?: SortOrderInput | SortOrder
    target?: SortOrderInput | SortOrder
    orderIndex?: SortOrder
    description?: SortOrderInput | SortOrder
    translations?: SortOrderInput | SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    isGovStandard?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    parent?: CategoryOrderByWithRelationInput
    children?: CategoryOrderByRelationAggregateInput
    posts?: PostOrderByRelationAggregateInput
    _relevance?: CategoryOrderByRelevanceInput
  }

  export type CategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: CategoryWhereInput | CategoryWhereInput[]
    OR?: CategoryWhereInput[]
    NOT?: CategoryWhereInput | CategoryWhereInput[]
    name?: StringFilter<"Category"> | string
    parentId?: StringNullableFilter<"Category"> | string | null
    lft?: IntFilter<"Category"> | number
    rgt?: IntFilter<"Category"> | number
    depth?: IntFilter<"Category"> | number
    status?: BoolFilter<"Category"> | boolean
    thumbnail?: StringNullableFilter<"Category"> | string | null
    attachmentId?: StringNullableFilter<"Category"> | string | null
    linkType?: StringNullableFilter<"Category"> | string | null
    customUrl?: StringNullableFilter<"Category"> | string | null
    target?: StringNullableFilter<"Category"> | string | null
    orderIndex?: IntFilter<"Category"> | number
    description?: StringNullableFilter<"Category"> | string | null
    translations?: JsonNullableFilter<"Category">
    metaTitle?: StringNullableFilter<"Category"> | string | null
    metaDescription?: StringNullableFilter<"Category"> | string | null
    isGovStandard?: BoolFilter<"Category"> | boolean
    createdAt?: DateTimeFilter<"Category"> | Date | string
    updatedAt?: DateTimeFilter<"Category"> | Date | string
    parent?: XOR<CategoryNullableScalarRelationFilter, CategoryWhereInput> | null
    children?: CategoryListRelationFilter
    posts?: PostListRelationFilter
  }, "id" | "slug">

  export type CategoryOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    parentId?: SortOrderInput | SortOrder
    lft?: SortOrder
    rgt?: SortOrder
    depth?: SortOrder
    status?: SortOrder
    thumbnail?: SortOrderInput | SortOrder
    attachmentId?: SortOrderInput | SortOrder
    linkType?: SortOrderInput | SortOrder
    customUrl?: SortOrderInput | SortOrder
    target?: SortOrderInput | SortOrder
    orderIndex?: SortOrder
    description?: SortOrderInput | SortOrder
    translations?: SortOrderInput | SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    isGovStandard?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CategoryCountOrderByAggregateInput
    _avg?: CategoryAvgOrderByAggregateInput
    _max?: CategoryMaxOrderByAggregateInput
    _min?: CategoryMinOrderByAggregateInput
    _sum?: CategorySumOrderByAggregateInput
  }

  export type CategoryScalarWhereWithAggregatesInput = {
    AND?: CategoryScalarWhereWithAggregatesInput | CategoryScalarWhereWithAggregatesInput[]
    OR?: CategoryScalarWhereWithAggregatesInput[]
    NOT?: CategoryScalarWhereWithAggregatesInput | CategoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Category"> | string
    name?: StringWithAggregatesFilter<"Category"> | string
    slug?: StringWithAggregatesFilter<"Category"> | string
    parentId?: StringNullableWithAggregatesFilter<"Category"> | string | null
    lft?: IntWithAggregatesFilter<"Category"> | number
    rgt?: IntWithAggregatesFilter<"Category"> | number
    depth?: IntWithAggregatesFilter<"Category"> | number
    status?: BoolWithAggregatesFilter<"Category"> | boolean
    thumbnail?: StringNullableWithAggregatesFilter<"Category"> | string | null
    attachmentId?: StringNullableWithAggregatesFilter<"Category"> | string | null
    linkType?: StringNullableWithAggregatesFilter<"Category"> | string | null
    customUrl?: StringNullableWithAggregatesFilter<"Category"> | string | null
    target?: StringNullableWithAggregatesFilter<"Category"> | string | null
    orderIndex?: IntWithAggregatesFilter<"Category"> | number
    description?: StringNullableWithAggregatesFilter<"Category"> | string | null
    translations?: JsonNullableWithAggregatesFilter<"Category">
    metaTitle?: StringNullableWithAggregatesFilter<"Category"> | string | null
    metaDescription?: StringNullableWithAggregatesFilter<"Category"> | string | null
    isGovStandard?: BoolWithAggregatesFilter<"Category"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Category"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Category"> | Date | string
  }

  export type CommentWhereInput = {
    AND?: CommentWhereInput | CommentWhereInput[]
    OR?: CommentWhereInput[]
    NOT?: CommentWhereInput | CommentWhereInput[]
    id?: StringFilter<"Comment"> | string
    content?: StringFilter<"Comment"> | string
    status?: StringFilter<"Comment"> | string
    authorId?: StringNullableFilter<"Comment"> | string | null
    authorName?: StringNullableFilter<"Comment"> | string | null
    authorEmail?: StringNullableFilter<"Comment"> | string | null
    authorIp?: StringNullableFilter<"Comment"> | string | null
    postId?: StringFilter<"Comment"> | string
    parentId?: StringNullableFilter<"Comment"> | string | null
    createdAt?: DateTimeFilter<"Comment"> | Date | string
    updatedAt?: DateTimeFilter<"Comment"> | Date | string
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
    parent?: XOR<CommentNullableScalarRelationFilter, CommentWhereInput> | null
    replies?: CommentListRelationFilter
  }

  export type CommentOrderByWithRelationInput = {
    id?: SortOrder
    content?: SortOrder
    status?: SortOrder
    authorId?: SortOrderInput | SortOrder
    authorName?: SortOrderInput | SortOrder
    authorEmail?: SortOrderInput | SortOrder
    authorIp?: SortOrderInput | SortOrder
    postId?: SortOrder
    parentId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    post?: PostOrderByWithRelationInput
    parent?: CommentOrderByWithRelationInput
    replies?: CommentOrderByRelationAggregateInput
    _relevance?: CommentOrderByRelevanceInput
  }

  export type CommentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CommentWhereInput | CommentWhereInput[]
    OR?: CommentWhereInput[]
    NOT?: CommentWhereInput | CommentWhereInput[]
    content?: StringFilter<"Comment"> | string
    status?: StringFilter<"Comment"> | string
    authorId?: StringNullableFilter<"Comment"> | string | null
    authorName?: StringNullableFilter<"Comment"> | string | null
    authorEmail?: StringNullableFilter<"Comment"> | string | null
    authorIp?: StringNullableFilter<"Comment"> | string | null
    postId?: StringFilter<"Comment"> | string
    parentId?: StringNullableFilter<"Comment"> | string | null
    createdAt?: DateTimeFilter<"Comment"> | Date | string
    updatedAt?: DateTimeFilter<"Comment"> | Date | string
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
    parent?: XOR<CommentNullableScalarRelationFilter, CommentWhereInput> | null
    replies?: CommentListRelationFilter
  }, "id">

  export type CommentOrderByWithAggregationInput = {
    id?: SortOrder
    content?: SortOrder
    status?: SortOrder
    authorId?: SortOrderInput | SortOrder
    authorName?: SortOrderInput | SortOrder
    authorEmail?: SortOrderInput | SortOrder
    authorIp?: SortOrderInput | SortOrder
    postId?: SortOrder
    parentId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CommentCountOrderByAggregateInput
    _max?: CommentMaxOrderByAggregateInput
    _min?: CommentMinOrderByAggregateInput
  }

  export type CommentScalarWhereWithAggregatesInput = {
    AND?: CommentScalarWhereWithAggregatesInput | CommentScalarWhereWithAggregatesInput[]
    OR?: CommentScalarWhereWithAggregatesInput[]
    NOT?: CommentScalarWhereWithAggregatesInput | CommentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Comment"> | string
    content?: StringWithAggregatesFilter<"Comment"> | string
    status?: StringWithAggregatesFilter<"Comment"> | string
    authorId?: StringNullableWithAggregatesFilter<"Comment"> | string | null
    authorName?: StringNullableWithAggregatesFilter<"Comment"> | string | null
    authorEmail?: StringNullableWithAggregatesFilter<"Comment"> | string | null
    authorIp?: StringNullableWithAggregatesFilter<"Comment"> | string | null
    postId?: StringWithAggregatesFilter<"Comment"> | string
    parentId?: StringNullableWithAggregatesFilter<"Comment"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Comment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Comment"> | Date | string
  }

  export type CitizenQuestionWhereInput = {
    AND?: CitizenQuestionWhereInput | CitizenQuestionWhereInput[]
    OR?: CitizenQuestionWhereInput[]
    NOT?: CitizenQuestionWhereInput | CitizenQuestionWhereInput[]
    id?: StringFilter<"CitizenQuestion"> | string
    title?: StringFilter<"CitizenQuestion"> | string
    content?: StringFilter<"CitizenQuestion"> | string
    askedByName?: StringFilter<"CitizenQuestion"> | string
    askedByEmail?: StringNullableFilter<"CitizenQuestion"> | string | null
    askedByPhone?: StringNullableFilter<"CitizenQuestion"> | string | null
    address?: StringNullableFilter<"CitizenQuestion"> | string | null
    status?: StringFilter<"CitizenQuestion"> | string
    answerContent?: StringNullableFilter<"CitizenQuestion"> | string | null
    answeredAt?: DateTimeNullableFilter<"CitizenQuestion"> | Date | string | null
    answeredById?: StringNullableFilter<"CitizenQuestion"> | string | null
    isPublic?: BoolFilter<"CitizenQuestion"> | boolean
    categoryId?: StringNullableFilter<"CitizenQuestion"> | string | null
    createdAt?: DateTimeFilter<"CitizenQuestion"> | Date | string
    updatedAt?: DateTimeFilter<"CitizenQuestion"> | Date | string
  }

  export type CitizenQuestionOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    askedByName?: SortOrder
    askedByEmail?: SortOrderInput | SortOrder
    askedByPhone?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    status?: SortOrder
    answerContent?: SortOrderInput | SortOrder
    answeredAt?: SortOrderInput | SortOrder
    answeredById?: SortOrderInput | SortOrder
    isPublic?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: CitizenQuestionOrderByRelevanceInput
  }

  export type CitizenQuestionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CitizenQuestionWhereInput | CitizenQuestionWhereInput[]
    OR?: CitizenQuestionWhereInput[]
    NOT?: CitizenQuestionWhereInput | CitizenQuestionWhereInput[]
    title?: StringFilter<"CitizenQuestion"> | string
    content?: StringFilter<"CitizenQuestion"> | string
    askedByName?: StringFilter<"CitizenQuestion"> | string
    askedByEmail?: StringNullableFilter<"CitizenQuestion"> | string | null
    askedByPhone?: StringNullableFilter<"CitizenQuestion"> | string | null
    address?: StringNullableFilter<"CitizenQuestion"> | string | null
    status?: StringFilter<"CitizenQuestion"> | string
    answerContent?: StringNullableFilter<"CitizenQuestion"> | string | null
    answeredAt?: DateTimeNullableFilter<"CitizenQuestion"> | Date | string | null
    answeredById?: StringNullableFilter<"CitizenQuestion"> | string | null
    isPublic?: BoolFilter<"CitizenQuestion"> | boolean
    categoryId?: StringNullableFilter<"CitizenQuestion"> | string | null
    createdAt?: DateTimeFilter<"CitizenQuestion"> | Date | string
    updatedAt?: DateTimeFilter<"CitizenQuestion"> | Date | string
  }, "id">

  export type CitizenQuestionOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    askedByName?: SortOrder
    askedByEmail?: SortOrderInput | SortOrder
    askedByPhone?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    status?: SortOrder
    answerContent?: SortOrderInput | SortOrder
    answeredAt?: SortOrderInput | SortOrder
    answeredById?: SortOrderInput | SortOrder
    isPublic?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CitizenQuestionCountOrderByAggregateInput
    _max?: CitizenQuestionMaxOrderByAggregateInput
    _min?: CitizenQuestionMinOrderByAggregateInput
  }

  export type CitizenQuestionScalarWhereWithAggregatesInput = {
    AND?: CitizenQuestionScalarWhereWithAggregatesInput | CitizenQuestionScalarWhereWithAggregatesInput[]
    OR?: CitizenQuestionScalarWhereWithAggregatesInput[]
    NOT?: CitizenQuestionScalarWhereWithAggregatesInput | CitizenQuestionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CitizenQuestion"> | string
    title?: StringWithAggregatesFilter<"CitizenQuestion"> | string
    content?: StringWithAggregatesFilter<"CitizenQuestion"> | string
    askedByName?: StringWithAggregatesFilter<"CitizenQuestion"> | string
    askedByEmail?: StringNullableWithAggregatesFilter<"CitizenQuestion"> | string | null
    askedByPhone?: StringNullableWithAggregatesFilter<"CitizenQuestion"> | string | null
    address?: StringNullableWithAggregatesFilter<"CitizenQuestion"> | string | null
    status?: StringWithAggregatesFilter<"CitizenQuestion"> | string
    answerContent?: StringNullableWithAggregatesFilter<"CitizenQuestion"> | string | null
    answeredAt?: DateTimeNullableWithAggregatesFilter<"CitizenQuestion"> | Date | string | null
    answeredById?: StringNullableWithAggregatesFilter<"CitizenQuestion"> | string | null
    isPublic?: BoolWithAggregatesFilter<"CitizenQuestion"> | boolean
    categoryId?: StringNullableWithAggregatesFilter<"CitizenQuestion"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"CitizenQuestion"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CitizenQuestion"> | Date | string
  }

  export type CitizenFeedbackWhereInput = {
    AND?: CitizenFeedbackWhereInput | CitizenFeedbackWhereInput[]
    OR?: CitizenFeedbackWhereInput[]
    NOT?: CitizenFeedbackWhereInput | CitizenFeedbackWhereInput[]
    id?: StringFilter<"CitizenFeedback"> | string
    title?: StringFilter<"CitizenFeedback"> | string
    content?: StringFilter<"CitizenFeedback"> | string
    feedbackType?: StringFilter<"CitizenFeedback"> | string
    referenceId?: StringNullableFilter<"CitizenFeedback"> | string | null
    senderName?: StringFilter<"CitizenFeedback"> | string
    senderEmail?: StringNullableFilter<"CitizenFeedback"> | string | null
    status?: StringFilter<"CitizenFeedback"> | string
    createdAt?: DateTimeFilter<"CitizenFeedback"> | Date | string
    updatedAt?: DateTimeFilter<"CitizenFeedback"> | Date | string
  }

  export type CitizenFeedbackOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    feedbackType?: SortOrder
    referenceId?: SortOrderInput | SortOrder
    senderName?: SortOrder
    senderEmail?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: CitizenFeedbackOrderByRelevanceInput
  }

  export type CitizenFeedbackWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CitizenFeedbackWhereInput | CitizenFeedbackWhereInput[]
    OR?: CitizenFeedbackWhereInput[]
    NOT?: CitizenFeedbackWhereInput | CitizenFeedbackWhereInput[]
    title?: StringFilter<"CitizenFeedback"> | string
    content?: StringFilter<"CitizenFeedback"> | string
    feedbackType?: StringFilter<"CitizenFeedback"> | string
    referenceId?: StringNullableFilter<"CitizenFeedback"> | string | null
    senderName?: StringFilter<"CitizenFeedback"> | string
    senderEmail?: StringNullableFilter<"CitizenFeedback"> | string | null
    status?: StringFilter<"CitizenFeedback"> | string
    createdAt?: DateTimeFilter<"CitizenFeedback"> | Date | string
    updatedAt?: DateTimeFilter<"CitizenFeedback"> | Date | string
  }, "id">

  export type CitizenFeedbackOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    feedbackType?: SortOrder
    referenceId?: SortOrderInput | SortOrder
    senderName?: SortOrder
    senderEmail?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CitizenFeedbackCountOrderByAggregateInput
    _max?: CitizenFeedbackMaxOrderByAggregateInput
    _min?: CitizenFeedbackMinOrderByAggregateInput
  }

  export type CitizenFeedbackScalarWhereWithAggregatesInput = {
    AND?: CitizenFeedbackScalarWhereWithAggregatesInput | CitizenFeedbackScalarWhereWithAggregatesInput[]
    OR?: CitizenFeedbackScalarWhereWithAggregatesInput[]
    NOT?: CitizenFeedbackScalarWhereWithAggregatesInput | CitizenFeedbackScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CitizenFeedback"> | string
    title?: StringWithAggregatesFilter<"CitizenFeedback"> | string
    content?: StringWithAggregatesFilter<"CitizenFeedback"> | string
    feedbackType?: StringWithAggregatesFilter<"CitizenFeedback"> | string
    referenceId?: StringNullableWithAggregatesFilter<"CitizenFeedback"> | string | null
    senderName?: StringWithAggregatesFilter<"CitizenFeedback"> | string
    senderEmail?: StringNullableWithAggregatesFilter<"CitizenFeedback"> | string | null
    status?: StringWithAggregatesFilter<"CitizenFeedback"> | string
    createdAt?: DateTimeWithAggregatesFilter<"CitizenFeedback"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CitizenFeedback"> | Date | string
  }

  export type PortalConfigWhereInput = {
    AND?: PortalConfigWhereInput | PortalConfigWhereInput[]
    OR?: PortalConfigWhereInput[]
    NOT?: PortalConfigWhereInput | PortalConfigWhereInput[]
    id?: IntFilter<"PortalConfig"> | number
    code?: StringFilter<"PortalConfig"> | string
    name?: StringFilter<"PortalConfig"> | string
    description?: StringNullableFilter<"PortalConfig"> | string | null
    createdAt?: DateTimeFilter<"PortalConfig"> | Date | string
    updatedAt?: DateTimeFilter<"PortalConfig"> | Date | string
  }

  export type PortalConfigOrderByWithRelationInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: PortalConfigOrderByRelevanceInput
  }

  export type PortalConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    code?: string
    AND?: PortalConfigWhereInput | PortalConfigWhereInput[]
    OR?: PortalConfigWhereInput[]
    NOT?: PortalConfigWhereInput | PortalConfigWhereInput[]
    name?: StringFilter<"PortalConfig"> | string
    description?: StringNullableFilter<"PortalConfig"> | string | null
    createdAt?: DateTimeFilter<"PortalConfig"> | Date | string
    updatedAt?: DateTimeFilter<"PortalConfig"> | Date | string
  }, "id" | "code">

  export type PortalConfigOrderByWithAggregationInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PortalConfigCountOrderByAggregateInput
    _avg?: PortalConfigAvgOrderByAggregateInput
    _max?: PortalConfigMaxOrderByAggregateInput
    _min?: PortalConfigMinOrderByAggregateInput
    _sum?: PortalConfigSumOrderByAggregateInput
  }

  export type PortalConfigScalarWhereWithAggregatesInput = {
    AND?: PortalConfigScalarWhereWithAggregatesInput | PortalConfigScalarWhereWithAggregatesInput[]
    OR?: PortalConfigScalarWhereWithAggregatesInput[]
    NOT?: PortalConfigScalarWhereWithAggregatesInput | PortalConfigScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"PortalConfig"> | number
    code?: StringWithAggregatesFilter<"PortalConfig"> | string
    name?: StringWithAggregatesFilter<"PortalConfig"> | string
    description?: StringNullableWithAggregatesFilter<"PortalConfig"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PortalConfig"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PortalConfig"> | Date | string
  }

  export type PortalMenuWhereInput = {
    AND?: PortalMenuWhereInput | PortalMenuWhereInput[]
    OR?: PortalMenuWhereInput[]
    NOT?: PortalMenuWhereInput | PortalMenuWhereInput[]
    id?: StringFilter<"PortalMenu"> | string
    name?: StringFilter<"PortalMenu"> | string
    description?: StringNullableFilter<"PortalMenu"> | string | null
    translations?: JsonNullableFilter<"PortalMenu">
    icon?: StringNullableFilter<"PortalMenu"> | string | null
    link?: StringNullableFilter<"PortalMenu"> | string | null
    order?: IntFilter<"PortalMenu"> | number
    parentId?: StringNullableFilter<"PortalMenu"> | string | null
    isActive?: BoolFilter<"PortalMenu"> | boolean
    target?: StringFilter<"PortalMenu"> | string
    type?: StringFilter<"PortalMenu"> | string
    referenceId?: StringNullableFilter<"PortalMenu"> | string | null
    position?: StringFilter<"PortalMenu"> | string
    createdAt?: DateTimeFilter<"PortalMenu"> | Date | string
    updatedAt?: DateTimeFilter<"PortalMenu"> | Date | string
    parent?: XOR<PortalMenuNullableScalarRelationFilter, PortalMenuWhereInput> | null
    children?: PortalMenuListRelationFilter
  }

  export type PortalMenuOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    translations?: SortOrderInput | SortOrder
    icon?: SortOrderInput | SortOrder
    link?: SortOrderInput | SortOrder
    order?: SortOrder
    parentId?: SortOrderInput | SortOrder
    isActive?: SortOrder
    target?: SortOrder
    type?: SortOrder
    referenceId?: SortOrderInput | SortOrder
    position?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    parent?: PortalMenuOrderByWithRelationInput
    children?: PortalMenuOrderByRelationAggregateInput
    _relevance?: PortalMenuOrderByRelevanceInput
  }

  export type PortalMenuWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PortalMenuWhereInput | PortalMenuWhereInput[]
    OR?: PortalMenuWhereInput[]
    NOT?: PortalMenuWhereInput | PortalMenuWhereInput[]
    name?: StringFilter<"PortalMenu"> | string
    description?: StringNullableFilter<"PortalMenu"> | string | null
    translations?: JsonNullableFilter<"PortalMenu">
    icon?: StringNullableFilter<"PortalMenu"> | string | null
    link?: StringNullableFilter<"PortalMenu"> | string | null
    order?: IntFilter<"PortalMenu"> | number
    parentId?: StringNullableFilter<"PortalMenu"> | string | null
    isActive?: BoolFilter<"PortalMenu"> | boolean
    target?: StringFilter<"PortalMenu"> | string
    type?: StringFilter<"PortalMenu"> | string
    referenceId?: StringNullableFilter<"PortalMenu"> | string | null
    position?: StringFilter<"PortalMenu"> | string
    createdAt?: DateTimeFilter<"PortalMenu"> | Date | string
    updatedAt?: DateTimeFilter<"PortalMenu"> | Date | string
    parent?: XOR<PortalMenuNullableScalarRelationFilter, PortalMenuWhereInput> | null
    children?: PortalMenuListRelationFilter
  }, "id">

  export type PortalMenuOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    translations?: SortOrderInput | SortOrder
    icon?: SortOrderInput | SortOrder
    link?: SortOrderInput | SortOrder
    order?: SortOrder
    parentId?: SortOrderInput | SortOrder
    isActive?: SortOrder
    target?: SortOrder
    type?: SortOrder
    referenceId?: SortOrderInput | SortOrder
    position?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PortalMenuCountOrderByAggregateInput
    _avg?: PortalMenuAvgOrderByAggregateInput
    _max?: PortalMenuMaxOrderByAggregateInput
    _min?: PortalMenuMinOrderByAggregateInput
    _sum?: PortalMenuSumOrderByAggregateInput
  }

  export type PortalMenuScalarWhereWithAggregatesInput = {
    AND?: PortalMenuScalarWhereWithAggregatesInput | PortalMenuScalarWhereWithAggregatesInput[]
    OR?: PortalMenuScalarWhereWithAggregatesInput[]
    NOT?: PortalMenuScalarWhereWithAggregatesInput | PortalMenuScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PortalMenu"> | string
    name?: StringWithAggregatesFilter<"PortalMenu"> | string
    description?: StringNullableWithAggregatesFilter<"PortalMenu"> | string | null
    translations?: JsonNullableWithAggregatesFilter<"PortalMenu">
    icon?: StringNullableWithAggregatesFilter<"PortalMenu"> | string | null
    link?: StringNullableWithAggregatesFilter<"PortalMenu"> | string | null
    order?: IntWithAggregatesFilter<"PortalMenu"> | number
    parentId?: StringNullableWithAggregatesFilter<"PortalMenu"> | string | null
    isActive?: BoolWithAggregatesFilter<"PortalMenu"> | boolean
    target?: StringWithAggregatesFilter<"PortalMenu"> | string
    type?: StringWithAggregatesFilter<"PortalMenu"> | string
    referenceId?: StringNullableWithAggregatesFilter<"PortalMenu"> | string | null
    position?: StringWithAggregatesFilter<"PortalMenu"> | string
    createdAt?: DateTimeWithAggregatesFilter<"PortalMenu"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PortalMenu"> | Date | string
  }

  export type PostWhereInput = {
    AND?: PostWhereInput | PostWhereInput[]
    OR?: PostWhereInput[]
    NOT?: PostWhereInput | PostWhereInput[]
    id?: StringFilter<"Post"> | string
    title?: StringFilter<"Post"> | string
    description?: StringNullableFilter<"Post"> | string | null
    content?: StringNullableFilter<"Post"> | string | null
    contentHtml?: StringNullableFilter<"Post"> | string | null
    slug?: StringFilter<"Post"> | string
    thumbnail?: StringNullableFilter<"Post"> | string | null
    authorId?: StringFilter<"Post"> | string
    status?: StringFilter<"Post"> | string
    currentVersion?: IntFilter<"Post"> | number
    isFeatured?: BoolFilter<"Post"> | boolean
    isNotification?: BoolFilter<"Post"> | boolean
    viewCount?: IntFilter<"Post"> | number
    isTranslated?: BoolFilter<"Post"> | boolean
    isCommentAllowed?: BoolFilter<"Post"> | boolean
    isDeleted?: BoolFilter<"Post"> | boolean
    publishedAt?: DateTimeNullableFilter<"Post"> | Date | string | null
    createdAt?: DateTimeFilter<"Post"> | Date | string
    updatedAt?: DateTimeFilter<"Post"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Post"> | Date | string | null
    categoryId?: StringNullableFilter<"Post"> | string | null
    category?: XOR<CategoryNullableScalarRelationFilter, CategoryWhereInput> | null
    tags?: TagListRelationFilter
    versions?: PostVersionListRelationFilter
    translations_rel?: PostTranslationListRelationFilter
    comments?: CommentListRelationFilter
    moderationLogs?: ModerationLogListRelationFilter
    auditLogs?: AuditLogListRelationFilter
  }

  export type PostOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    content?: SortOrderInput | SortOrder
    contentHtml?: SortOrderInput | SortOrder
    slug?: SortOrder
    thumbnail?: SortOrderInput | SortOrder
    authorId?: SortOrder
    status?: SortOrder
    currentVersion?: SortOrder
    isFeatured?: SortOrder
    isNotification?: SortOrder
    viewCount?: SortOrder
    isTranslated?: SortOrder
    isCommentAllowed?: SortOrder
    isDeleted?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    categoryId?: SortOrderInput | SortOrder
    category?: CategoryOrderByWithRelationInput
    tags?: TagOrderByRelationAggregateInput
    versions?: PostVersionOrderByRelationAggregateInput
    translations_rel?: PostTranslationOrderByRelationAggregateInput
    comments?: CommentOrderByRelationAggregateInput
    moderationLogs?: ModerationLogOrderByRelationAggregateInput
    auditLogs?: AuditLogOrderByRelationAggregateInput
    _relevance?: PostOrderByRelevanceInput
  }

  export type PostWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: PostWhereInput | PostWhereInput[]
    OR?: PostWhereInput[]
    NOT?: PostWhereInput | PostWhereInput[]
    title?: StringFilter<"Post"> | string
    description?: StringNullableFilter<"Post"> | string | null
    content?: StringNullableFilter<"Post"> | string | null
    contentHtml?: StringNullableFilter<"Post"> | string | null
    thumbnail?: StringNullableFilter<"Post"> | string | null
    authorId?: StringFilter<"Post"> | string
    status?: StringFilter<"Post"> | string
    currentVersion?: IntFilter<"Post"> | number
    isFeatured?: BoolFilter<"Post"> | boolean
    isNotification?: BoolFilter<"Post"> | boolean
    viewCount?: IntFilter<"Post"> | number
    isTranslated?: BoolFilter<"Post"> | boolean
    isCommentAllowed?: BoolFilter<"Post"> | boolean
    isDeleted?: BoolFilter<"Post"> | boolean
    publishedAt?: DateTimeNullableFilter<"Post"> | Date | string | null
    createdAt?: DateTimeFilter<"Post"> | Date | string
    updatedAt?: DateTimeFilter<"Post"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Post"> | Date | string | null
    categoryId?: StringNullableFilter<"Post"> | string | null
    category?: XOR<CategoryNullableScalarRelationFilter, CategoryWhereInput> | null
    tags?: TagListRelationFilter
    versions?: PostVersionListRelationFilter
    translations_rel?: PostTranslationListRelationFilter
    comments?: CommentListRelationFilter
    moderationLogs?: ModerationLogListRelationFilter
    auditLogs?: AuditLogListRelationFilter
  }, "id" | "slug">

  export type PostOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    content?: SortOrderInput | SortOrder
    contentHtml?: SortOrderInput | SortOrder
    slug?: SortOrder
    thumbnail?: SortOrderInput | SortOrder
    authorId?: SortOrder
    status?: SortOrder
    currentVersion?: SortOrder
    isFeatured?: SortOrder
    isNotification?: SortOrder
    viewCount?: SortOrder
    isTranslated?: SortOrder
    isCommentAllowed?: SortOrder
    isDeleted?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    categoryId?: SortOrderInput | SortOrder
    _count?: PostCountOrderByAggregateInput
    _avg?: PostAvgOrderByAggregateInput
    _max?: PostMaxOrderByAggregateInput
    _min?: PostMinOrderByAggregateInput
    _sum?: PostSumOrderByAggregateInput
  }

  export type PostScalarWhereWithAggregatesInput = {
    AND?: PostScalarWhereWithAggregatesInput | PostScalarWhereWithAggregatesInput[]
    OR?: PostScalarWhereWithAggregatesInput[]
    NOT?: PostScalarWhereWithAggregatesInput | PostScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Post"> | string
    title?: StringWithAggregatesFilter<"Post"> | string
    description?: StringNullableWithAggregatesFilter<"Post"> | string | null
    content?: StringNullableWithAggregatesFilter<"Post"> | string | null
    contentHtml?: StringNullableWithAggregatesFilter<"Post"> | string | null
    slug?: StringWithAggregatesFilter<"Post"> | string
    thumbnail?: StringNullableWithAggregatesFilter<"Post"> | string | null
    authorId?: StringWithAggregatesFilter<"Post"> | string
    status?: StringWithAggregatesFilter<"Post"> | string
    currentVersion?: IntWithAggregatesFilter<"Post"> | number
    isFeatured?: BoolWithAggregatesFilter<"Post"> | boolean
    isNotification?: BoolWithAggregatesFilter<"Post"> | boolean
    viewCount?: IntWithAggregatesFilter<"Post"> | number
    isTranslated?: BoolWithAggregatesFilter<"Post"> | boolean
    isCommentAllowed?: BoolWithAggregatesFilter<"Post"> | boolean
    isDeleted?: BoolWithAggregatesFilter<"Post"> | boolean
    publishedAt?: DateTimeNullableWithAggregatesFilter<"Post"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Post"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Post"> | Date | string
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Post"> | Date | string | null
    categoryId?: StringNullableWithAggregatesFilter<"Post"> | string | null
  }

  export type TagWhereInput = {
    AND?: TagWhereInput | TagWhereInput[]
    OR?: TagWhereInput[]
    NOT?: TagWhereInput | TagWhereInput[]
    id?: StringFilter<"Tag"> | string
    name?: StringFilter<"Tag"> | string
    slug?: StringFilter<"Tag"> | string
    posts?: PostListRelationFilter
  }

  export type TagOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    posts?: PostOrderByRelationAggregateInput
    _relevance?: TagOrderByRelevanceInput
  }

  export type TagWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    slug?: string
    AND?: TagWhereInput | TagWhereInput[]
    OR?: TagWhereInput[]
    NOT?: TagWhereInput | TagWhereInput[]
    posts?: PostListRelationFilter
  }, "id" | "name" | "slug">

  export type TagOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    _count?: TagCountOrderByAggregateInput
    _max?: TagMaxOrderByAggregateInput
    _min?: TagMinOrderByAggregateInput
  }

  export type TagScalarWhereWithAggregatesInput = {
    AND?: TagScalarWhereWithAggregatesInput | TagScalarWhereWithAggregatesInput[]
    OR?: TagScalarWhereWithAggregatesInput[]
    NOT?: TagScalarWhereWithAggregatesInput | TagScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Tag"> | string
    name?: StringWithAggregatesFilter<"Tag"> | string
    slug?: StringWithAggregatesFilter<"Tag"> | string
  }

  export type PostVersionWhereInput = {
    AND?: PostVersionWhereInput | PostVersionWhereInput[]
    OR?: PostVersionWhereInput[]
    NOT?: PostVersionWhereInput | PostVersionWhereInput[]
    id?: StringFilter<"PostVersion"> | string
    postId?: StringFilter<"PostVersion"> | string
    version?: IntFilter<"PostVersion"> | number
    title?: StringFilter<"PostVersion"> | string
    description?: StringNullableFilter<"PostVersion"> | string | null
    content?: StringNullableFilter<"PostVersion"> | string | null
    editorId?: StringFilter<"PostVersion"> | string
    changeNote?: StringNullableFilter<"PostVersion"> | string | null
    createdAt?: DateTimeFilter<"PostVersion"> | Date | string
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
  }

  export type PostVersionOrderByWithRelationInput = {
    id?: SortOrder
    postId?: SortOrder
    version?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    content?: SortOrderInput | SortOrder
    editorId?: SortOrder
    changeNote?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    post?: PostOrderByWithRelationInput
    _relevance?: PostVersionOrderByRelevanceInput
  }

  export type PostVersionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PostVersionWhereInput | PostVersionWhereInput[]
    OR?: PostVersionWhereInput[]
    NOT?: PostVersionWhereInput | PostVersionWhereInput[]
    postId?: StringFilter<"PostVersion"> | string
    version?: IntFilter<"PostVersion"> | number
    title?: StringFilter<"PostVersion"> | string
    description?: StringNullableFilter<"PostVersion"> | string | null
    content?: StringNullableFilter<"PostVersion"> | string | null
    editorId?: StringFilter<"PostVersion"> | string
    changeNote?: StringNullableFilter<"PostVersion"> | string | null
    createdAt?: DateTimeFilter<"PostVersion"> | Date | string
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
  }, "id">

  export type PostVersionOrderByWithAggregationInput = {
    id?: SortOrder
    postId?: SortOrder
    version?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    content?: SortOrderInput | SortOrder
    editorId?: SortOrder
    changeNote?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: PostVersionCountOrderByAggregateInput
    _avg?: PostVersionAvgOrderByAggregateInput
    _max?: PostVersionMaxOrderByAggregateInput
    _min?: PostVersionMinOrderByAggregateInput
    _sum?: PostVersionSumOrderByAggregateInput
  }

  export type PostVersionScalarWhereWithAggregatesInput = {
    AND?: PostVersionScalarWhereWithAggregatesInput | PostVersionScalarWhereWithAggregatesInput[]
    OR?: PostVersionScalarWhereWithAggregatesInput[]
    NOT?: PostVersionScalarWhereWithAggregatesInput | PostVersionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PostVersion"> | string
    postId?: StringWithAggregatesFilter<"PostVersion"> | string
    version?: IntWithAggregatesFilter<"PostVersion"> | number
    title?: StringWithAggregatesFilter<"PostVersion"> | string
    description?: StringNullableWithAggregatesFilter<"PostVersion"> | string | null
    content?: StringNullableWithAggregatesFilter<"PostVersion"> | string | null
    editorId?: StringWithAggregatesFilter<"PostVersion"> | string
    changeNote?: StringNullableWithAggregatesFilter<"PostVersion"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PostVersion"> | Date | string
  }

  export type ModerationLogWhereInput = {
    AND?: ModerationLogWhereInput | ModerationLogWhereInput[]
    OR?: ModerationLogWhereInput[]
    NOT?: ModerationLogWhereInput | ModerationLogWhereInput[]
    id?: StringFilter<"ModerationLog"> | string
    postId?: StringFilter<"ModerationLog"> | string
    reviewerId?: StringFilter<"ModerationLog"> | string
    oldStatus?: StringFilter<"ModerationLog"> | string
    newStatus?: StringFilter<"ModerationLog"> | string
    decision?: StringFilter<"ModerationLog"> | string
    note?: StringNullableFilter<"ModerationLog"> | string | null
    createdAt?: DateTimeFilter<"ModerationLog"> | Date | string
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
  }

  export type ModerationLogOrderByWithRelationInput = {
    id?: SortOrder
    postId?: SortOrder
    reviewerId?: SortOrder
    oldStatus?: SortOrder
    newStatus?: SortOrder
    decision?: SortOrder
    note?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    post?: PostOrderByWithRelationInput
    _relevance?: ModerationLogOrderByRelevanceInput
  }

  export type ModerationLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ModerationLogWhereInput | ModerationLogWhereInput[]
    OR?: ModerationLogWhereInput[]
    NOT?: ModerationLogWhereInput | ModerationLogWhereInput[]
    postId?: StringFilter<"ModerationLog"> | string
    reviewerId?: StringFilter<"ModerationLog"> | string
    oldStatus?: StringFilter<"ModerationLog"> | string
    newStatus?: StringFilter<"ModerationLog"> | string
    decision?: StringFilter<"ModerationLog"> | string
    note?: StringNullableFilter<"ModerationLog"> | string | null
    createdAt?: DateTimeFilter<"ModerationLog"> | Date | string
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
  }, "id">

  export type ModerationLogOrderByWithAggregationInput = {
    id?: SortOrder
    postId?: SortOrder
    reviewerId?: SortOrder
    oldStatus?: SortOrder
    newStatus?: SortOrder
    decision?: SortOrder
    note?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ModerationLogCountOrderByAggregateInput
    _max?: ModerationLogMaxOrderByAggregateInput
    _min?: ModerationLogMinOrderByAggregateInput
  }

  export type ModerationLogScalarWhereWithAggregatesInput = {
    AND?: ModerationLogScalarWhereWithAggregatesInput | ModerationLogScalarWhereWithAggregatesInput[]
    OR?: ModerationLogScalarWhereWithAggregatesInput[]
    NOT?: ModerationLogScalarWhereWithAggregatesInput | ModerationLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ModerationLog"> | string
    postId?: StringWithAggregatesFilter<"ModerationLog"> | string
    reviewerId?: StringWithAggregatesFilter<"ModerationLog"> | string
    oldStatus?: StringWithAggregatesFilter<"ModerationLog"> | string
    newStatus?: StringWithAggregatesFilter<"ModerationLog"> | string
    decision?: StringWithAggregatesFilter<"ModerationLog"> | string
    note?: StringNullableWithAggregatesFilter<"ModerationLog"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ModerationLog"> | Date | string
  }

  export type AuditLogWhereInput = {
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    id?: StringFilter<"AuditLog"> | string
    postId?: StringNullableFilter<"AuditLog"> | string | null
    actorId?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    entityType?: StringFilter<"AuditLog"> | string
    entityId?: StringFilter<"AuditLog"> | string
    metadata?: StringNullableFilter<"AuditLog"> | string | null
    ipAddress?: StringNullableFilter<"AuditLog"> | string | null
    userAgent?: StringNullableFilter<"AuditLog"> | string | null
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
    post?: XOR<PostNullableScalarRelationFilter, PostWhereInput> | null
  }

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder
    postId?: SortOrderInput | SortOrder
    actorId?: SortOrder
    action?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    metadata?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    post?: PostOrderByWithRelationInput
    _relevance?: AuditLogOrderByRelevanceInput
  }

  export type AuditLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    postId?: StringNullableFilter<"AuditLog"> | string | null
    actorId?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    entityType?: StringFilter<"AuditLog"> | string
    entityId?: StringFilter<"AuditLog"> | string
    metadata?: StringNullableFilter<"AuditLog"> | string | null
    ipAddress?: StringNullableFilter<"AuditLog"> | string | null
    userAgent?: StringNullableFilter<"AuditLog"> | string | null
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
    post?: XOR<PostNullableScalarRelationFilter, PostWhereInput> | null
  }, "id">

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    postId?: SortOrderInput | SortOrder
    actorId?: SortOrder
    action?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    metadata?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AuditLogCountOrderByAggregateInput
    _max?: AuditLogMaxOrderByAggregateInput
    _min?: AuditLogMinOrderByAggregateInput
  }

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    OR?: AuditLogScalarWhereWithAggregatesInput[]
    NOT?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuditLog"> | string
    postId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    actorId?: StringWithAggregatesFilter<"AuditLog"> | string
    action?: StringWithAggregatesFilter<"AuditLog"> | string
    entityType?: StringWithAggregatesFilter<"AuditLog"> | string
    entityId?: StringWithAggregatesFilter<"AuditLog"> | string
    metadata?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    ipAddress?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AuditLog"> | Date | string
  }

  export type PostTranslationWhereInput = {
    AND?: PostTranslationWhereInput | PostTranslationWhereInput[]
    OR?: PostTranslationWhereInput[]
    NOT?: PostTranslationWhereInput | PostTranslationWhereInput[]
    id?: StringFilter<"PostTranslation"> | string
    postId?: StringFilter<"PostTranslation"> | string
    langCode?: StringFilter<"PostTranslation"> | string
    title?: StringFilter<"PostTranslation"> | string
    slug?: StringNullableFilter<"PostTranslation"> | string | null
    description?: StringNullableFilter<"PostTranslation"> | string | null
    content?: StringNullableFilter<"PostTranslation"> | string | null
    contentHtml?: StringNullableFilter<"PostTranslation"> | string | null
    version?: IntFilter<"PostTranslation"> | number
    mainVersionRef?: IntFilter<"PostTranslation"> | number
    isPublished?: BoolFilter<"PostTranslation"> | boolean
    createdAt?: DateTimeFilter<"PostTranslation"> | Date | string
    updatedAt?: DateTimeFilter<"PostTranslation"> | Date | string
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
  }

  export type PostTranslationOrderByWithRelationInput = {
    id?: SortOrder
    postId?: SortOrder
    langCode?: SortOrder
    title?: SortOrder
    slug?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    content?: SortOrderInput | SortOrder
    contentHtml?: SortOrderInput | SortOrder
    version?: SortOrder
    mainVersionRef?: SortOrder
    isPublished?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    post?: PostOrderByWithRelationInput
    _relevance?: PostTranslationOrderByRelevanceInput
  }

  export type PostTranslationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PostTranslationWhereInput | PostTranslationWhereInput[]
    OR?: PostTranslationWhereInput[]
    NOT?: PostTranslationWhereInput | PostTranslationWhereInput[]
    postId?: StringFilter<"PostTranslation"> | string
    langCode?: StringFilter<"PostTranslation"> | string
    title?: StringFilter<"PostTranslation"> | string
    slug?: StringNullableFilter<"PostTranslation"> | string | null
    description?: StringNullableFilter<"PostTranslation"> | string | null
    content?: StringNullableFilter<"PostTranslation"> | string | null
    contentHtml?: StringNullableFilter<"PostTranslation"> | string | null
    version?: IntFilter<"PostTranslation"> | number
    mainVersionRef?: IntFilter<"PostTranslation"> | number
    isPublished?: BoolFilter<"PostTranslation"> | boolean
    createdAt?: DateTimeFilter<"PostTranslation"> | Date | string
    updatedAt?: DateTimeFilter<"PostTranslation"> | Date | string
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
  }, "id">

  export type PostTranslationOrderByWithAggregationInput = {
    id?: SortOrder
    postId?: SortOrder
    langCode?: SortOrder
    title?: SortOrder
    slug?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    content?: SortOrderInput | SortOrder
    contentHtml?: SortOrderInput | SortOrder
    version?: SortOrder
    mainVersionRef?: SortOrder
    isPublished?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PostTranslationCountOrderByAggregateInput
    _avg?: PostTranslationAvgOrderByAggregateInput
    _max?: PostTranslationMaxOrderByAggregateInput
    _min?: PostTranslationMinOrderByAggregateInput
    _sum?: PostTranslationSumOrderByAggregateInput
  }

  export type PostTranslationScalarWhereWithAggregatesInput = {
    AND?: PostTranslationScalarWhereWithAggregatesInput | PostTranslationScalarWhereWithAggregatesInput[]
    OR?: PostTranslationScalarWhereWithAggregatesInput[]
    NOT?: PostTranslationScalarWhereWithAggregatesInput | PostTranslationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PostTranslation"> | string
    postId?: StringWithAggregatesFilter<"PostTranslation"> | string
    langCode?: StringWithAggregatesFilter<"PostTranslation"> | string
    title?: StringWithAggregatesFilter<"PostTranslation"> | string
    slug?: StringNullableWithAggregatesFilter<"PostTranslation"> | string | null
    description?: StringNullableWithAggregatesFilter<"PostTranslation"> | string | null
    content?: StringNullableWithAggregatesFilter<"PostTranslation"> | string | null
    contentHtml?: StringNullableWithAggregatesFilter<"PostTranslation"> | string | null
    version?: IntWithAggregatesFilter<"PostTranslation"> | number
    mainVersionRef?: IntWithAggregatesFilter<"PostTranslation"> | number
    isPublished?: BoolWithAggregatesFilter<"PostTranslation"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"PostTranslation"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PostTranslation"> | Date | string
  }

  export type BannerCreateInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    imageUrl: string
    linkType?: string | null
    customUrl?: string | null
    target?: string | null
    position?: string | null
    orderIndex?: number
    status?: boolean
    metaTitle?: string | null
    metaDescription?: string | null
    startAt?: Date | string | null
    endAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BannerUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    imageUrl: string
    linkType?: string | null
    customUrl?: string | null
    target?: string | null
    position?: string | null
    orderIndex?: number
    status?: boolean
    metaTitle?: string | null
    metaDescription?: string | null
    startAt?: Date | string | null
    endAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BannerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    linkType?: NullableStringFieldUpdateOperationsInput | string | null
    customUrl?: NullableStringFieldUpdateOperationsInput | string | null
    target?: NullableStringFieldUpdateOperationsInput | string | null
    position?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    startAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BannerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    linkType?: NullableStringFieldUpdateOperationsInput | string | null
    customUrl?: NullableStringFieldUpdateOperationsInput | string | null
    target?: NullableStringFieldUpdateOperationsInput | string | null
    position?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    startAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BannerCreateManyInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    imageUrl: string
    linkType?: string | null
    customUrl?: string | null
    target?: string | null
    position?: string | null
    orderIndex?: number
    status?: boolean
    metaTitle?: string | null
    metaDescription?: string | null
    startAt?: Date | string | null
    endAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BannerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    linkType?: NullableStringFieldUpdateOperationsInput | string | null
    customUrl?: NullableStringFieldUpdateOperationsInput | string | null
    target?: NullableStringFieldUpdateOperationsInput | string | null
    position?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    startAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BannerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    linkType?: NullableStringFieldUpdateOperationsInput | string | null
    customUrl?: NullableStringFieldUpdateOperationsInput | string | null
    target?: NullableStringFieldUpdateOperationsInput | string | null
    position?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    startAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryCreateInput = {
    id?: string
    name: string
    slug: string
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    thumbnail?: string | null
    attachmentId?: string | null
    linkType?: string | null
    customUrl?: string | null
    target?: string | null
    orderIndex?: number
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: string | null
    metaDescription?: string | null
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: CategoryCreateNestedOneWithoutChildrenInput
    children?: CategoryCreateNestedManyWithoutParentInput
    posts?: PostCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    parentId?: string | null
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    thumbnail?: string | null
    attachmentId?: string | null
    linkType?: string | null
    customUrl?: string | null
    target?: string | null
    orderIndex?: number
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: string | null
    metaDescription?: string | null
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput
    posts?: PostUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    linkType?: NullableStringFieldUpdateOperationsInput | string | null
    customUrl?: NullableStringFieldUpdateOperationsInput | string | null
    target?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: CategoryUpdateOneWithoutChildrenNestedInput
    children?: CategoryUpdateManyWithoutParentNestedInput
    posts?: PostUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    linkType?: NullableStringFieldUpdateOperationsInput | string | null
    customUrl?: NullableStringFieldUpdateOperationsInput | string | null
    target?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput
    posts?: PostUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryCreateManyInput = {
    id?: string
    name: string
    slug: string
    parentId?: string | null
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    thumbnail?: string | null
    attachmentId?: string | null
    linkType?: string | null
    customUrl?: string | null
    target?: string | null
    orderIndex?: number
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: string | null
    metaDescription?: string | null
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CategoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    linkType?: NullableStringFieldUpdateOperationsInput | string | null
    customUrl?: NullableStringFieldUpdateOperationsInput | string | null
    target?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    linkType?: NullableStringFieldUpdateOperationsInput | string | null
    customUrl?: NullableStringFieldUpdateOperationsInput | string | null
    target?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentCreateInput = {
    id?: string
    content: string
    status?: string
    authorId?: string | null
    authorName?: string | null
    authorEmail?: string | null
    authorIp?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    post: PostCreateNestedOneWithoutCommentsInput
    parent?: CommentCreateNestedOneWithoutRepliesInput
    replies?: CommentCreateNestedManyWithoutParentInput
  }

  export type CommentUncheckedCreateInput = {
    id?: string
    content: string
    status?: string
    authorId?: string | null
    authorName?: string | null
    authorEmail?: string | null
    authorIp?: string | null
    postId: string
    parentId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    replies?: CommentUncheckedCreateNestedManyWithoutParentInput
  }

  export type CommentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    authorEmail?: NullableStringFieldUpdateOperationsInput | string | null
    authorIp?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    post?: PostUpdateOneRequiredWithoutCommentsNestedInput
    parent?: CommentUpdateOneWithoutRepliesNestedInput
    replies?: CommentUpdateManyWithoutParentNestedInput
  }

  export type CommentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    authorEmail?: NullableStringFieldUpdateOperationsInput | string | null
    authorIp?: NullableStringFieldUpdateOperationsInput | string | null
    postId?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    replies?: CommentUncheckedUpdateManyWithoutParentNestedInput
  }

  export type CommentCreateManyInput = {
    id?: string
    content: string
    status?: string
    authorId?: string | null
    authorName?: string | null
    authorEmail?: string | null
    authorIp?: string | null
    postId: string
    parentId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CommentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    authorEmail?: NullableStringFieldUpdateOperationsInput | string | null
    authorIp?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    authorEmail?: NullableStringFieldUpdateOperationsInput | string | null
    authorIp?: NullableStringFieldUpdateOperationsInput | string | null
    postId?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitizenQuestionCreateInput = {
    id?: string
    title: string
    content: string
    askedByName: string
    askedByEmail?: string | null
    askedByPhone?: string | null
    address?: string | null
    status?: string
    answerContent?: string | null
    answeredAt?: Date | string | null
    answeredById?: string | null
    isPublic?: boolean
    categoryId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CitizenQuestionUncheckedCreateInput = {
    id?: string
    title: string
    content: string
    askedByName: string
    askedByEmail?: string | null
    askedByPhone?: string | null
    address?: string | null
    status?: string
    answerContent?: string | null
    answeredAt?: Date | string | null
    answeredById?: string | null
    isPublic?: boolean
    categoryId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CitizenQuestionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    askedByName?: StringFieldUpdateOperationsInput | string
    askedByEmail?: NullableStringFieldUpdateOperationsInput | string | null
    askedByPhone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    answerContent?: NullableStringFieldUpdateOperationsInput | string | null
    answeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    answeredById?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitizenQuestionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    askedByName?: StringFieldUpdateOperationsInput | string
    askedByEmail?: NullableStringFieldUpdateOperationsInput | string | null
    askedByPhone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    answerContent?: NullableStringFieldUpdateOperationsInput | string | null
    answeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    answeredById?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitizenQuestionCreateManyInput = {
    id?: string
    title: string
    content: string
    askedByName: string
    askedByEmail?: string | null
    askedByPhone?: string | null
    address?: string | null
    status?: string
    answerContent?: string | null
    answeredAt?: Date | string | null
    answeredById?: string | null
    isPublic?: boolean
    categoryId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CitizenQuestionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    askedByName?: StringFieldUpdateOperationsInput | string
    askedByEmail?: NullableStringFieldUpdateOperationsInput | string | null
    askedByPhone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    answerContent?: NullableStringFieldUpdateOperationsInput | string | null
    answeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    answeredById?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitizenQuestionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    askedByName?: StringFieldUpdateOperationsInput | string
    askedByEmail?: NullableStringFieldUpdateOperationsInput | string | null
    askedByPhone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    answerContent?: NullableStringFieldUpdateOperationsInput | string | null
    answeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    answeredById?: NullableStringFieldUpdateOperationsInput | string | null
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitizenFeedbackCreateInput = {
    id?: string
    title: string
    content: string
    feedbackType?: string
    referenceId?: string | null
    senderName: string
    senderEmail?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CitizenFeedbackUncheckedCreateInput = {
    id?: string
    title: string
    content: string
    feedbackType?: string
    referenceId?: string | null
    senderName: string
    senderEmail?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CitizenFeedbackUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    feedbackType?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    senderName?: StringFieldUpdateOperationsInput | string
    senderEmail?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitizenFeedbackUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    feedbackType?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    senderName?: StringFieldUpdateOperationsInput | string
    senderEmail?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitizenFeedbackCreateManyInput = {
    id?: string
    title: string
    content: string
    feedbackType?: string
    referenceId?: string | null
    senderName: string
    senderEmail?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CitizenFeedbackUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    feedbackType?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    senderName?: StringFieldUpdateOperationsInput | string
    senderEmail?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitizenFeedbackUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    feedbackType?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    senderName?: StringFieldUpdateOperationsInput | string
    senderEmail?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortalConfigCreateInput = {
    code: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PortalConfigUncheckedCreateInput = {
    id?: number
    code: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PortalConfigUpdateInput = {
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortalConfigUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortalConfigCreateManyInput = {
    id?: number
    code: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PortalConfigUpdateManyMutationInput = {
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortalConfigUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortalMenuCreateInput = {
    id?: string
    name: string
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: string | null
    link?: string | null
    order?: number
    isActive?: boolean
    target?: string
    type?: string
    referenceId?: string | null
    position?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: PortalMenuCreateNestedOneWithoutChildrenInput
    children?: PortalMenuCreateNestedManyWithoutParentInput
  }

  export type PortalMenuUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: string | null
    link?: string | null
    order?: number
    parentId?: string | null
    isActive?: boolean
    target?: string
    type?: string
    referenceId?: string | null
    position?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: PortalMenuUncheckedCreateNestedManyWithoutParentInput
  }

  export type PortalMenuUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    target?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: PortalMenuUpdateOneWithoutChildrenNestedInput
    children?: PortalMenuUpdateManyWithoutParentNestedInput
  }

  export type PortalMenuUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    target?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: PortalMenuUncheckedUpdateManyWithoutParentNestedInput
  }

  export type PortalMenuCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: string | null
    link?: string | null
    order?: number
    parentId?: string | null
    isActive?: boolean
    target?: string
    type?: string
    referenceId?: string | null
    position?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PortalMenuUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    target?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortalMenuUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    target?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostCreateInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    category?: CategoryCreateNestedOneWithoutPostsInput
    tags?: TagCreateNestedManyWithoutPostsInput
    versions?: PostVersionCreateNestedManyWithoutPostInput
    translations_rel?: PostTranslationCreateNestedManyWithoutPostInput
    comments?: CommentCreateNestedManyWithoutPostInput
    moderationLogs?: ModerationLogCreateNestedManyWithoutPostInput
    auditLogs?: AuditLogCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    categoryId?: string | null
    tags?: TagUncheckedCreateNestedManyWithoutPostsInput
    versions?: PostVersionUncheckedCreateNestedManyWithoutPostInput
    translations_rel?: PostTranslationUncheckedCreateNestedManyWithoutPostInput
    comments?: CommentUncheckedCreateNestedManyWithoutPostInput
    moderationLogs?: ModerationLogUncheckedCreateNestedManyWithoutPostInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    category?: CategoryUpdateOneWithoutPostsNestedInput
    tags?: TagUpdateManyWithoutPostsNestedInput
    versions?: PostVersionUpdateManyWithoutPostNestedInput
    translations_rel?: PostTranslationUpdateManyWithoutPostNestedInput
    comments?: CommentUpdateManyWithoutPostNestedInput
    moderationLogs?: ModerationLogUpdateManyWithoutPostNestedInput
    auditLogs?: AuditLogUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TagUncheckedUpdateManyWithoutPostsNestedInput
    versions?: PostVersionUncheckedUpdateManyWithoutPostNestedInput
    translations_rel?: PostTranslationUncheckedUpdateManyWithoutPostNestedInput
    comments?: CommentUncheckedUpdateManyWithoutPostNestedInput
    moderationLogs?: ModerationLogUncheckedUpdateManyWithoutPostNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutPostNestedInput
  }

  export type PostCreateManyInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    categoryId?: string | null
  }

  export type PostUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PostUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TagCreateInput = {
    id?: string
    name: string
    slug: string
    posts?: PostCreateNestedManyWithoutTagsInput
  }

  export type TagUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    posts?: PostUncheckedCreateNestedManyWithoutTagsInput
  }

  export type TagUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    posts?: PostUpdateManyWithoutTagsNestedInput
  }

  export type TagUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    posts?: PostUncheckedUpdateManyWithoutTagsNestedInput
  }

  export type TagCreateManyInput = {
    id?: string
    name: string
    slug: string
  }

  export type TagUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
  }

  export type TagUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
  }

  export type PostVersionCreateInput = {
    id?: string
    version: number
    title: string
    description?: string | null
    content?: string | null
    editorId: string
    changeNote?: string | null
    createdAt?: Date | string
    post: PostCreateNestedOneWithoutVersionsInput
  }

  export type PostVersionUncheckedCreateInput = {
    id?: string
    postId: string
    version: number
    title: string
    description?: string | null
    content?: string | null
    editorId: string
    changeNote?: string | null
    createdAt?: Date | string
  }

  export type PostVersionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    editorId?: StringFieldUpdateOperationsInput | string
    changeNote?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    post?: PostUpdateOneRequiredWithoutVersionsNestedInput
  }

  export type PostVersionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    editorId?: StringFieldUpdateOperationsInput | string
    changeNote?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostVersionCreateManyInput = {
    id?: string
    postId: string
    version: number
    title: string
    description?: string | null
    content?: string | null
    editorId: string
    changeNote?: string | null
    createdAt?: Date | string
  }

  export type PostVersionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    editorId?: StringFieldUpdateOperationsInput | string
    changeNote?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostVersionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    editorId?: StringFieldUpdateOperationsInput | string
    changeNote?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModerationLogCreateInput = {
    id?: string
    reviewerId: string
    oldStatus: string
    newStatus: string
    decision: string
    note?: string | null
    createdAt?: Date | string
    post: PostCreateNestedOneWithoutModerationLogsInput
  }

  export type ModerationLogUncheckedCreateInput = {
    id?: string
    postId: string
    reviewerId: string
    oldStatus: string
    newStatus: string
    decision: string
    note?: string | null
    createdAt?: Date | string
  }

  export type ModerationLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    oldStatus?: StringFieldUpdateOperationsInput | string
    newStatus?: StringFieldUpdateOperationsInput | string
    decision?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    post?: PostUpdateOneRequiredWithoutModerationLogsNestedInput
  }

  export type ModerationLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    oldStatus?: StringFieldUpdateOperationsInput | string
    newStatus?: StringFieldUpdateOperationsInput | string
    decision?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModerationLogCreateManyInput = {
    id?: string
    postId: string
    reviewerId: string
    oldStatus: string
    newStatus: string
    decision: string
    note?: string | null
    createdAt?: Date | string
  }

  export type ModerationLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    oldStatus?: StringFieldUpdateOperationsInput | string
    newStatus?: StringFieldUpdateOperationsInput | string
    decision?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModerationLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    oldStatus?: StringFieldUpdateOperationsInput | string
    newStatus?: StringFieldUpdateOperationsInput | string
    decision?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateInput = {
    id?: string
    actorId: string
    action: string
    entityType?: string
    entityId: string
    metadata?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
    post?: PostCreateNestedOneWithoutAuditLogsInput
  }

  export type AuditLogUncheckedCreateInput = {
    id?: string
    postId?: string | null
    actorId: string
    action: string
    entityType?: string
    entityId: string
    metadata?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type AuditLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entityType?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    post?: PostUpdateOneWithoutAuditLogsNestedInput
  }

  export type AuditLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: NullableStringFieldUpdateOperationsInput | string | null
    actorId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entityType?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateManyInput = {
    id?: string
    postId?: string | null
    actorId: string
    action: string
    entityType?: string
    entityId: string
    metadata?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type AuditLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entityType?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: NullableStringFieldUpdateOperationsInput | string | null
    actorId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entityType?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostTranslationCreateInput = {
    id?: string
    langCode: string
    title: string
    slug?: string | null
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    version?: number
    mainVersionRef: number
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    post: PostCreateNestedOneWithoutTranslations_relInput
  }

  export type PostTranslationUncheckedCreateInput = {
    id?: string
    postId: string
    langCode: string
    title: string
    slug?: string | null
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    version?: number
    mainVersionRef: number
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PostTranslationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    langCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    version?: IntFieldUpdateOperationsInput | number
    mainVersionRef?: IntFieldUpdateOperationsInput | number
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    post?: PostUpdateOneRequiredWithoutTranslations_relNestedInput
  }

  export type PostTranslationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: StringFieldUpdateOperationsInput | string
    langCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    version?: IntFieldUpdateOperationsInput | number
    mainVersionRef?: IntFieldUpdateOperationsInput | number
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostTranslationCreateManyInput = {
    id?: string
    postId: string
    langCode: string
    title: string
    slug?: string | null
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    version?: number
    mainVersionRef: number
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PostTranslationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    langCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    version?: IntFieldUpdateOperationsInput | number
    mainVersionRef?: IntFieldUpdateOperationsInput | number
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostTranslationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: StringFieldUpdateOperationsInput | string
    langCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    version?: IntFieldUpdateOperationsInput | number
    mainVersionRef?: IntFieldUpdateOperationsInput | number
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type BannerOrderByRelevanceInput = {
    fields: BannerOrderByRelevanceFieldEnum | BannerOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type BannerCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    linkType?: SortOrder
    customUrl?: SortOrder
    target?: SortOrder
    position?: SortOrder
    orderIndex?: SortOrder
    status?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    startAt?: SortOrder
    endAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BannerAvgOrderByAggregateInput = {
    orderIndex?: SortOrder
  }

  export type BannerMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    linkType?: SortOrder
    customUrl?: SortOrder
    target?: SortOrder
    position?: SortOrder
    orderIndex?: SortOrder
    status?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    startAt?: SortOrder
    endAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BannerMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    linkType?: SortOrder
    customUrl?: SortOrder
    target?: SortOrder
    position?: SortOrder
    orderIndex?: SortOrder
    status?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    startAt?: SortOrder
    endAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BannerSumOrderByAggregateInput = {
    orderIndex?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type CategoryNullableScalarRelationFilter = {
    is?: CategoryWhereInput | null
    isNot?: CategoryWhereInput | null
  }

  export type CategoryListRelationFilter = {
    every?: CategoryWhereInput
    some?: CategoryWhereInput
    none?: CategoryWhereInput
  }

  export type PostListRelationFilter = {
    every?: PostWhereInput
    some?: PostWhereInput
    none?: PostWhereInput
  }

  export type CategoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PostOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CategoryOrderByRelevanceInput = {
    fields: CategoryOrderByRelevanceFieldEnum | CategoryOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type CategoryCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    parentId?: SortOrder
    lft?: SortOrder
    rgt?: SortOrder
    depth?: SortOrder
    status?: SortOrder
    thumbnail?: SortOrder
    attachmentId?: SortOrder
    linkType?: SortOrder
    customUrl?: SortOrder
    target?: SortOrder
    orderIndex?: SortOrder
    description?: SortOrder
    translations?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    isGovStandard?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategoryAvgOrderByAggregateInput = {
    lft?: SortOrder
    rgt?: SortOrder
    depth?: SortOrder
    orderIndex?: SortOrder
  }

  export type CategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    parentId?: SortOrder
    lft?: SortOrder
    rgt?: SortOrder
    depth?: SortOrder
    status?: SortOrder
    thumbnail?: SortOrder
    attachmentId?: SortOrder
    linkType?: SortOrder
    customUrl?: SortOrder
    target?: SortOrder
    orderIndex?: SortOrder
    description?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    isGovStandard?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategoryMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    parentId?: SortOrder
    lft?: SortOrder
    rgt?: SortOrder
    depth?: SortOrder
    status?: SortOrder
    thumbnail?: SortOrder
    attachmentId?: SortOrder
    linkType?: SortOrder
    customUrl?: SortOrder
    target?: SortOrder
    orderIndex?: SortOrder
    description?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    isGovStandard?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategorySumOrderByAggregateInput = {
    lft?: SortOrder
    rgt?: SortOrder
    depth?: SortOrder
    orderIndex?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type PostScalarRelationFilter = {
    is?: PostWhereInput
    isNot?: PostWhereInput
  }

  export type CommentNullableScalarRelationFilter = {
    is?: CommentWhereInput | null
    isNot?: CommentWhereInput | null
  }

  export type CommentListRelationFilter = {
    every?: CommentWhereInput
    some?: CommentWhereInput
    none?: CommentWhereInput
  }

  export type CommentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CommentOrderByRelevanceInput = {
    fields: CommentOrderByRelevanceFieldEnum | CommentOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type CommentCountOrderByAggregateInput = {
    id?: SortOrder
    content?: SortOrder
    status?: SortOrder
    authorId?: SortOrder
    authorName?: SortOrder
    authorEmail?: SortOrder
    authorIp?: SortOrder
    postId?: SortOrder
    parentId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CommentMaxOrderByAggregateInput = {
    id?: SortOrder
    content?: SortOrder
    status?: SortOrder
    authorId?: SortOrder
    authorName?: SortOrder
    authorEmail?: SortOrder
    authorIp?: SortOrder
    postId?: SortOrder
    parentId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CommentMinOrderByAggregateInput = {
    id?: SortOrder
    content?: SortOrder
    status?: SortOrder
    authorId?: SortOrder
    authorName?: SortOrder
    authorEmail?: SortOrder
    authorIp?: SortOrder
    postId?: SortOrder
    parentId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CitizenQuestionOrderByRelevanceInput = {
    fields: CitizenQuestionOrderByRelevanceFieldEnum | CitizenQuestionOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type CitizenQuestionCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    askedByName?: SortOrder
    askedByEmail?: SortOrder
    askedByPhone?: SortOrder
    address?: SortOrder
    status?: SortOrder
    answerContent?: SortOrder
    answeredAt?: SortOrder
    answeredById?: SortOrder
    isPublic?: SortOrder
    categoryId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CitizenQuestionMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    askedByName?: SortOrder
    askedByEmail?: SortOrder
    askedByPhone?: SortOrder
    address?: SortOrder
    status?: SortOrder
    answerContent?: SortOrder
    answeredAt?: SortOrder
    answeredById?: SortOrder
    isPublic?: SortOrder
    categoryId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CitizenQuestionMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    askedByName?: SortOrder
    askedByEmail?: SortOrder
    askedByPhone?: SortOrder
    address?: SortOrder
    status?: SortOrder
    answerContent?: SortOrder
    answeredAt?: SortOrder
    answeredById?: SortOrder
    isPublic?: SortOrder
    categoryId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CitizenFeedbackOrderByRelevanceInput = {
    fields: CitizenFeedbackOrderByRelevanceFieldEnum | CitizenFeedbackOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type CitizenFeedbackCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    feedbackType?: SortOrder
    referenceId?: SortOrder
    senderName?: SortOrder
    senderEmail?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CitizenFeedbackMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    feedbackType?: SortOrder
    referenceId?: SortOrder
    senderName?: SortOrder
    senderEmail?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CitizenFeedbackMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    feedbackType?: SortOrder
    referenceId?: SortOrder
    senderName?: SortOrder
    senderEmail?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PortalConfigOrderByRelevanceInput = {
    fields: PortalConfigOrderByRelevanceFieldEnum | PortalConfigOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type PortalConfigCountOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PortalConfigAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type PortalConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PortalConfigMinOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PortalConfigSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type PortalMenuNullableScalarRelationFilter = {
    is?: PortalMenuWhereInput | null
    isNot?: PortalMenuWhereInput | null
  }

  export type PortalMenuListRelationFilter = {
    every?: PortalMenuWhereInput
    some?: PortalMenuWhereInput
    none?: PortalMenuWhereInput
  }

  export type PortalMenuOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PortalMenuOrderByRelevanceInput = {
    fields: PortalMenuOrderByRelevanceFieldEnum | PortalMenuOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type PortalMenuCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    translations?: SortOrder
    icon?: SortOrder
    link?: SortOrder
    order?: SortOrder
    parentId?: SortOrder
    isActive?: SortOrder
    target?: SortOrder
    type?: SortOrder
    referenceId?: SortOrder
    position?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PortalMenuAvgOrderByAggregateInput = {
    order?: SortOrder
  }

  export type PortalMenuMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    icon?: SortOrder
    link?: SortOrder
    order?: SortOrder
    parentId?: SortOrder
    isActive?: SortOrder
    target?: SortOrder
    type?: SortOrder
    referenceId?: SortOrder
    position?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PortalMenuMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    icon?: SortOrder
    link?: SortOrder
    order?: SortOrder
    parentId?: SortOrder
    isActive?: SortOrder
    target?: SortOrder
    type?: SortOrder
    referenceId?: SortOrder
    position?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PortalMenuSumOrderByAggregateInput = {
    order?: SortOrder
  }

  export type TagListRelationFilter = {
    every?: TagWhereInput
    some?: TagWhereInput
    none?: TagWhereInput
  }

  export type PostVersionListRelationFilter = {
    every?: PostVersionWhereInput
    some?: PostVersionWhereInput
    none?: PostVersionWhereInput
  }

  export type PostTranslationListRelationFilter = {
    every?: PostTranslationWhereInput
    some?: PostTranslationWhereInput
    none?: PostTranslationWhereInput
  }

  export type ModerationLogListRelationFilter = {
    every?: ModerationLogWhereInput
    some?: ModerationLogWhereInput
    none?: ModerationLogWhereInput
  }

  export type AuditLogListRelationFilter = {
    every?: AuditLogWhereInput
    some?: AuditLogWhereInput
    none?: AuditLogWhereInput
  }

  export type TagOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PostVersionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PostTranslationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ModerationLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AuditLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PostOrderByRelevanceInput = {
    fields: PostOrderByRelevanceFieldEnum | PostOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type PostCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    content?: SortOrder
    contentHtml?: SortOrder
    slug?: SortOrder
    thumbnail?: SortOrder
    authorId?: SortOrder
    status?: SortOrder
    currentVersion?: SortOrder
    isFeatured?: SortOrder
    isNotification?: SortOrder
    viewCount?: SortOrder
    isTranslated?: SortOrder
    isCommentAllowed?: SortOrder
    isDeleted?: SortOrder
    publishedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
    categoryId?: SortOrder
  }

  export type PostAvgOrderByAggregateInput = {
    currentVersion?: SortOrder
    viewCount?: SortOrder
  }

  export type PostMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    content?: SortOrder
    contentHtml?: SortOrder
    slug?: SortOrder
    thumbnail?: SortOrder
    authorId?: SortOrder
    status?: SortOrder
    currentVersion?: SortOrder
    isFeatured?: SortOrder
    isNotification?: SortOrder
    viewCount?: SortOrder
    isTranslated?: SortOrder
    isCommentAllowed?: SortOrder
    isDeleted?: SortOrder
    publishedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
    categoryId?: SortOrder
  }

  export type PostMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    content?: SortOrder
    contentHtml?: SortOrder
    slug?: SortOrder
    thumbnail?: SortOrder
    authorId?: SortOrder
    status?: SortOrder
    currentVersion?: SortOrder
    isFeatured?: SortOrder
    isNotification?: SortOrder
    viewCount?: SortOrder
    isTranslated?: SortOrder
    isCommentAllowed?: SortOrder
    isDeleted?: SortOrder
    publishedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
    categoryId?: SortOrder
  }

  export type PostSumOrderByAggregateInput = {
    currentVersion?: SortOrder
    viewCount?: SortOrder
  }

  export type TagOrderByRelevanceInput = {
    fields: TagOrderByRelevanceFieldEnum | TagOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type TagCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
  }

  export type TagMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
  }

  export type TagMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
  }

  export type PostVersionOrderByRelevanceInput = {
    fields: PostVersionOrderByRelevanceFieldEnum | PostVersionOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type PostVersionCountOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    version?: SortOrder
    title?: SortOrder
    description?: SortOrder
    content?: SortOrder
    editorId?: SortOrder
    changeNote?: SortOrder
    createdAt?: SortOrder
  }

  export type PostVersionAvgOrderByAggregateInput = {
    version?: SortOrder
  }

  export type PostVersionMaxOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    version?: SortOrder
    title?: SortOrder
    description?: SortOrder
    content?: SortOrder
    editorId?: SortOrder
    changeNote?: SortOrder
    createdAt?: SortOrder
  }

  export type PostVersionMinOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    version?: SortOrder
    title?: SortOrder
    description?: SortOrder
    content?: SortOrder
    editorId?: SortOrder
    changeNote?: SortOrder
    createdAt?: SortOrder
  }

  export type PostVersionSumOrderByAggregateInput = {
    version?: SortOrder
  }

  export type ModerationLogOrderByRelevanceInput = {
    fields: ModerationLogOrderByRelevanceFieldEnum | ModerationLogOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ModerationLogCountOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    reviewerId?: SortOrder
    oldStatus?: SortOrder
    newStatus?: SortOrder
    decision?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
  }

  export type ModerationLogMaxOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    reviewerId?: SortOrder
    oldStatus?: SortOrder
    newStatus?: SortOrder
    decision?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
  }

  export type ModerationLogMinOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    reviewerId?: SortOrder
    oldStatus?: SortOrder
    newStatus?: SortOrder
    decision?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
  }

  export type PostNullableScalarRelationFilter = {
    is?: PostWhereInput | null
    isNot?: PostWhereInput | null
  }

  export type AuditLogOrderByRelevanceInput = {
    fields: AuditLogOrderByRelevanceFieldEnum | AuditLogOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    actorId?: SortOrder
    action?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    metadata?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    actorId?: SortOrder
    action?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    metadata?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    actorId?: SortOrder
    action?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    metadata?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
  }

  export type PostTranslationOrderByRelevanceInput = {
    fields: PostTranslationOrderByRelevanceFieldEnum | PostTranslationOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type PostTranslationCountOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    langCode?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    content?: SortOrder
    contentHtml?: SortOrder
    version?: SortOrder
    mainVersionRef?: SortOrder
    isPublished?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PostTranslationAvgOrderByAggregateInput = {
    version?: SortOrder
    mainVersionRef?: SortOrder
  }

  export type PostTranslationMaxOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    langCode?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    content?: SortOrder
    contentHtml?: SortOrder
    version?: SortOrder
    mainVersionRef?: SortOrder
    isPublished?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PostTranslationMinOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    langCode?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    content?: SortOrder
    contentHtml?: SortOrder
    version?: SortOrder
    mainVersionRef?: SortOrder
    isPublished?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PostTranslationSumOrderByAggregateInput = {
    version?: SortOrder
    mainVersionRef?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CategoryCreateNestedOneWithoutChildrenInput = {
    create?: XOR<CategoryCreateWithoutChildrenInput, CategoryUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutChildrenInput
    connect?: CategoryWhereUniqueInput
  }

  export type CategoryCreateNestedManyWithoutParentInput = {
    create?: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput> | CategoryCreateWithoutParentInput[] | CategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutParentInput | CategoryCreateOrConnectWithoutParentInput[]
    createMany?: CategoryCreateManyParentInputEnvelope
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
  }

  export type PostCreateNestedManyWithoutCategoryInput = {
    create?: XOR<PostCreateWithoutCategoryInput, PostUncheckedCreateWithoutCategoryInput> | PostCreateWithoutCategoryInput[] | PostUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: PostCreateOrConnectWithoutCategoryInput | PostCreateOrConnectWithoutCategoryInput[]
    createMany?: PostCreateManyCategoryInputEnvelope
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type CategoryUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput> | CategoryCreateWithoutParentInput[] | CategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutParentInput | CategoryCreateOrConnectWithoutParentInput[]
    createMany?: CategoryCreateManyParentInputEnvelope
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
  }

  export type PostUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<PostCreateWithoutCategoryInput, PostUncheckedCreateWithoutCategoryInput> | PostCreateWithoutCategoryInput[] | PostUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: PostCreateOrConnectWithoutCategoryInput | PostCreateOrConnectWithoutCategoryInput[]
    createMany?: PostCreateManyCategoryInputEnvelope
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type CategoryUpdateOneWithoutChildrenNestedInput = {
    create?: XOR<CategoryCreateWithoutChildrenInput, CategoryUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutChildrenInput
    upsert?: CategoryUpsertWithoutChildrenInput
    disconnect?: CategoryWhereInput | boolean
    delete?: CategoryWhereInput | boolean
    connect?: CategoryWhereUniqueInput
    update?: XOR<XOR<CategoryUpdateToOneWithWhereWithoutChildrenInput, CategoryUpdateWithoutChildrenInput>, CategoryUncheckedUpdateWithoutChildrenInput>
  }

  export type CategoryUpdateManyWithoutParentNestedInput = {
    create?: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput> | CategoryCreateWithoutParentInput[] | CategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutParentInput | CategoryCreateOrConnectWithoutParentInput[]
    upsert?: CategoryUpsertWithWhereUniqueWithoutParentInput | CategoryUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: CategoryCreateManyParentInputEnvelope
    set?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    disconnect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    delete?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    update?: CategoryUpdateWithWhereUniqueWithoutParentInput | CategoryUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: CategoryUpdateManyWithWhereWithoutParentInput | CategoryUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: CategoryScalarWhereInput | CategoryScalarWhereInput[]
  }

  export type PostUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<PostCreateWithoutCategoryInput, PostUncheckedCreateWithoutCategoryInput> | PostCreateWithoutCategoryInput[] | PostUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: PostCreateOrConnectWithoutCategoryInput | PostCreateOrConnectWithoutCategoryInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutCategoryInput | PostUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: PostCreateManyCategoryInputEnvelope
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutCategoryInput | PostUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: PostUpdateManyWithWhereWithoutCategoryInput | PostUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type CategoryUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput> | CategoryCreateWithoutParentInput[] | CategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutParentInput | CategoryCreateOrConnectWithoutParentInput[]
    upsert?: CategoryUpsertWithWhereUniqueWithoutParentInput | CategoryUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: CategoryCreateManyParentInputEnvelope
    set?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    disconnect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    delete?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    update?: CategoryUpdateWithWhereUniqueWithoutParentInput | CategoryUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: CategoryUpdateManyWithWhereWithoutParentInput | CategoryUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: CategoryScalarWhereInput | CategoryScalarWhereInput[]
  }

  export type PostUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<PostCreateWithoutCategoryInput, PostUncheckedCreateWithoutCategoryInput> | PostCreateWithoutCategoryInput[] | PostUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: PostCreateOrConnectWithoutCategoryInput | PostCreateOrConnectWithoutCategoryInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutCategoryInput | PostUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: PostCreateManyCategoryInputEnvelope
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutCategoryInput | PostUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: PostUpdateManyWithWhereWithoutCategoryInput | PostUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type PostCreateNestedOneWithoutCommentsInput = {
    create?: XOR<PostCreateWithoutCommentsInput, PostUncheckedCreateWithoutCommentsInput>
    connectOrCreate?: PostCreateOrConnectWithoutCommentsInput
    connect?: PostWhereUniqueInput
  }

  export type CommentCreateNestedOneWithoutRepliesInput = {
    create?: XOR<CommentCreateWithoutRepliesInput, CommentUncheckedCreateWithoutRepliesInput>
    connectOrCreate?: CommentCreateOrConnectWithoutRepliesInput
    connect?: CommentWhereUniqueInput
  }

  export type CommentCreateNestedManyWithoutParentInput = {
    create?: XOR<CommentCreateWithoutParentInput, CommentUncheckedCreateWithoutParentInput> | CommentCreateWithoutParentInput[] | CommentUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutParentInput | CommentCreateOrConnectWithoutParentInput[]
    createMany?: CommentCreateManyParentInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type CommentUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<CommentCreateWithoutParentInput, CommentUncheckedCreateWithoutParentInput> | CommentCreateWithoutParentInput[] | CommentUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutParentInput | CommentCreateOrConnectWithoutParentInput[]
    createMany?: CommentCreateManyParentInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type PostUpdateOneRequiredWithoutCommentsNestedInput = {
    create?: XOR<PostCreateWithoutCommentsInput, PostUncheckedCreateWithoutCommentsInput>
    connectOrCreate?: PostCreateOrConnectWithoutCommentsInput
    upsert?: PostUpsertWithoutCommentsInput
    connect?: PostWhereUniqueInput
    update?: XOR<XOR<PostUpdateToOneWithWhereWithoutCommentsInput, PostUpdateWithoutCommentsInput>, PostUncheckedUpdateWithoutCommentsInput>
  }

  export type CommentUpdateOneWithoutRepliesNestedInput = {
    create?: XOR<CommentCreateWithoutRepliesInput, CommentUncheckedCreateWithoutRepliesInput>
    connectOrCreate?: CommentCreateOrConnectWithoutRepliesInput
    upsert?: CommentUpsertWithoutRepliesInput
    disconnect?: CommentWhereInput | boolean
    delete?: CommentWhereInput | boolean
    connect?: CommentWhereUniqueInput
    update?: XOR<XOR<CommentUpdateToOneWithWhereWithoutRepliesInput, CommentUpdateWithoutRepliesInput>, CommentUncheckedUpdateWithoutRepliesInput>
  }

  export type CommentUpdateManyWithoutParentNestedInput = {
    create?: XOR<CommentCreateWithoutParentInput, CommentUncheckedCreateWithoutParentInput> | CommentCreateWithoutParentInput[] | CommentUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutParentInput | CommentCreateOrConnectWithoutParentInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutParentInput | CommentUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: CommentCreateManyParentInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutParentInput | CommentUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutParentInput | CommentUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type CommentUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<CommentCreateWithoutParentInput, CommentUncheckedCreateWithoutParentInput> | CommentCreateWithoutParentInput[] | CommentUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutParentInput | CommentCreateOrConnectWithoutParentInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutParentInput | CommentUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: CommentCreateManyParentInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutParentInput | CommentUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutParentInput | CommentUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type PortalMenuCreateNestedOneWithoutChildrenInput = {
    create?: XOR<PortalMenuCreateWithoutChildrenInput, PortalMenuUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: PortalMenuCreateOrConnectWithoutChildrenInput
    connect?: PortalMenuWhereUniqueInput
  }

  export type PortalMenuCreateNestedManyWithoutParentInput = {
    create?: XOR<PortalMenuCreateWithoutParentInput, PortalMenuUncheckedCreateWithoutParentInput> | PortalMenuCreateWithoutParentInput[] | PortalMenuUncheckedCreateWithoutParentInput[]
    connectOrCreate?: PortalMenuCreateOrConnectWithoutParentInput | PortalMenuCreateOrConnectWithoutParentInput[]
    createMany?: PortalMenuCreateManyParentInputEnvelope
    connect?: PortalMenuWhereUniqueInput | PortalMenuWhereUniqueInput[]
  }

  export type PortalMenuUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<PortalMenuCreateWithoutParentInput, PortalMenuUncheckedCreateWithoutParentInput> | PortalMenuCreateWithoutParentInput[] | PortalMenuUncheckedCreateWithoutParentInput[]
    connectOrCreate?: PortalMenuCreateOrConnectWithoutParentInput | PortalMenuCreateOrConnectWithoutParentInput[]
    createMany?: PortalMenuCreateManyParentInputEnvelope
    connect?: PortalMenuWhereUniqueInput | PortalMenuWhereUniqueInput[]
  }

  export type PortalMenuUpdateOneWithoutChildrenNestedInput = {
    create?: XOR<PortalMenuCreateWithoutChildrenInput, PortalMenuUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: PortalMenuCreateOrConnectWithoutChildrenInput
    upsert?: PortalMenuUpsertWithoutChildrenInput
    disconnect?: PortalMenuWhereInput | boolean
    delete?: PortalMenuWhereInput | boolean
    connect?: PortalMenuWhereUniqueInput
    update?: XOR<XOR<PortalMenuUpdateToOneWithWhereWithoutChildrenInput, PortalMenuUpdateWithoutChildrenInput>, PortalMenuUncheckedUpdateWithoutChildrenInput>
  }

  export type PortalMenuUpdateManyWithoutParentNestedInput = {
    create?: XOR<PortalMenuCreateWithoutParentInput, PortalMenuUncheckedCreateWithoutParentInput> | PortalMenuCreateWithoutParentInput[] | PortalMenuUncheckedCreateWithoutParentInput[]
    connectOrCreate?: PortalMenuCreateOrConnectWithoutParentInput | PortalMenuCreateOrConnectWithoutParentInput[]
    upsert?: PortalMenuUpsertWithWhereUniqueWithoutParentInput | PortalMenuUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: PortalMenuCreateManyParentInputEnvelope
    set?: PortalMenuWhereUniqueInput | PortalMenuWhereUniqueInput[]
    disconnect?: PortalMenuWhereUniqueInput | PortalMenuWhereUniqueInput[]
    delete?: PortalMenuWhereUniqueInput | PortalMenuWhereUniqueInput[]
    connect?: PortalMenuWhereUniqueInput | PortalMenuWhereUniqueInput[]
    update?: PortalMenuUpdateWithWhereUniqueWithoutParentInput | PortalMenuUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: PortalMenuUpdateManyWithWhereWithoutParentInput | PortalMenuUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: PortalMenuScalarWhereInput | PortalMenuScalarWhereInput[]
  }

  export type PortalMenuUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<PortalMenuCreateWithoutParentInput, PortalMenuUncheckedCreateWithoutParentInput> | PortalMenuCreateWithoutParentInput[] | PortalMenuUncheckedCreateWithoutParentInput[]
    connectOrCreate?: PortalMenuCreateOrConnectWithoutParentInput | PortalMenuCreateOrConnectWithoutParentInput[]
    upsert?: PortalMenuUpsertWithWhereUniqueWithoutParentInput | PortalMenuUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: PortalMenuCreateManyParentInputEnvelope
    set?: PortalMenuWhereUniqueInput | PortalMenuWhereUniqueInput[]
    disconnect?: PortalMenuWhereUniqueInput | PortalMenuWhereUniqueInput[]
    delete?: PortalMenuWhereUniqueInput | PortalMenuWhereUniqueInput[]
    connect?: PortalMenuWhereUniqueInput | PortalMenuWhereUniqueInput[]
    update?: PortalMenuUpdateWithWhereUniqueWithoutParentInput | PortalMenuUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: PortalMenuUpdateManyWithWhereWithoutParentInput | PortalMenuUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: PortalMenuScalarWhereInput | PortalMenuScalarWhereInput[]
  }

  export type CategoryCreateNestedOneWithoutPostsInput = {
    create?: XOR<CategoryCreateWithoutPostsInput, CategoryUncheckedCreateWithoutPostsInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutPostsInput
    connect?: CategoryWhereUniqueInput
  }

  export type TagCreateNestedManyWithoutPostsInput = {
    create?: XOR<TagCreateWithoutPostsInput, TagUncheckedCreateWithoutPostsInput> | TagCreateWithoutPostsInput[] | TagUncheckedCreateWithoutPostsInput[]
    connectOrCreate?: TagCreateOrConnectWithoutPostsInput | TagCreateOrConnectWithoutPostsInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
  }

  export type PostVersionCreateNestedManyWithoutPostInput = {
    create?: XOR<PostVersionCreateWithoutPostInput, PostVersionUncheckedCreateWithoutPostInput> | PostVersionCreateWithoutPostInput[] | PostVersionUncheckedCreateWithoutPostInput[]
    connectOrCreate?: PostVersionCreateOrConnectWithoutPostInput | PostVersionCreateOrConnectWithoutPostInput[]
    createMany?: PostVersionCreateManyPostInputEnvelope
    connect?: PostVersionWhereUniqueInput | PostVersionWhereUniqueInput[]
  }

  export type PostTranslationCreateNestedManyWithoutPostInput = {
    create?: XOR<PostTranslationCreateWithoutPostInput, PostTranslationUncheckedCreateWithoutPostInput> | PostTranslationCreateWithoutPostInput[] | PostTranslationUncheckedCreateWithoutPostInput[]
    connectOrCreate?: PostTranslationCreateOrConnectWithoutPostInput | PostTranslationCreateOrConnectWithoutPostInput[]
    createMany?: PostTranslationCreateManyPostInputEnvelope
    connect?: PostTranslationWhereUniqueInput | PostTranslationWhereUniqueInput[]
  }

  export type CommentCreateNestedManyWithoutPostInput = {
    create?: XOR<CommentCreateWithoutPostInput, CommentUncheckedCreateWithoutPostInput> | CommentCreateWithoutPostInput[] | CommentUncheckedCreateWithoutPostInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutPostInput | CommentCreateOrConnectWithoutPostInput[]
    createMany?: CommentCreateManyPostInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type ModerationLogCreateNestedManyWithoutPostInput = {
    create?: XOR<ModerationLogCreateWithoutPostInput, ModerationLogUncheckedCreateWithoutPostInput> | ModerationLogCreateWithoutPostInput[] | ModerationLogUncheckedCreateWithoutPostInput[]
    connectOrCreate?: ModerationLogCreateOrConnectWithoutPostInput | ModerationLogCreateOrConnectWithoutPostInput[]
    createMany?: ModerationLogCreateManyPostInputEnvelope
    connect?: ModerationLogWhereUniqueInput | ModerationLogWhereUniqueInput[]
  }

  export type AuditLogCreateNestedManyWithoutPostInput = {
    create?: XOR<AuditLogCreateWithoutPostInput, AuditLogUncheckedCreateWithoutPostInput> | AuditLogCreateWithoutPostInput[] | AuditLogUncheckedCreateWithoutPostInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutPostInput | AuditLogCreateOrConnectWithoutPostInput[]
    createMany?: AuditLogCreateManyPostInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type TagUncheckedCreateNestedManyWithoutPostsInput = {
    create?: XOR<TagCreateWithoutPostsInput, TagUncheckedCreateWithoutPostsInput> | TagCreateWithoutPostsInput[] | TagUncheckedCreateWithoutPostsInput[]
    connectOrCreate?: TagCreateOrConnectWithoutPostsInput | TagCreateOrConnectWithoutPostsInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
  }

  export type PostVersionUncheckedCreateNestedManyWithoutPostInput = {
    create?: XOR<PostVersionCreateWithoutPostInput, PostVersionUncheckedCreateWithoutPostInput> | PostVersionCreateWithoutPostInput[] | PostVersionUncheckedCreateWithoutPostInput[]
    connectOrCreate?: PostVersionCreateOrConnectWithoutPostInput | PostVersionCreateOrConnectWithoutPostInput[]
    createMany?: PostVersionCreateManyPostInputEnvelope
    connect?: PostVersionWhereUniqueInput | PostVersionWhereUniqueInput[]
  }

  export type PostTranslationUncheckedCreateNestedManyWithoutPostInput = {
    create?: XOR<PostTranslationCreateWithoutPostInput, PostTranslationUncheckedCreateWithoutPostInput> | PostTranslationCreateWithoutPostInput[] | PostTranslationUncheckedCreateWithoutPostInput[]
    connectOrCreate?: PostTranslationCreateOrConnectWithoutPostInput | PostTranslationCreateOrConnectWithoutPostInput[]
    createMany?: PostTranslationCreateManyPostInputEnvelope
    connect?: PostTranslationWhereUniqueInput | PostTranslationWhereUniqueInput[]
  }

  export type CommentUncheckedCreateNestedManyWithoutPostInput = {
    create?: XOR<CommentCreateWithoutPostInput, CommentUncheckedCreateWithoutPostInput> | CommentCreateWithoutPostInput[] | CommentUncheckedCreateWithoutPostInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutPostInput | CommentCreateOrConnectWithoutPostInput[]
    createMany?: CommentCreateManyPostInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type ModerationLogUncheckedCreateNestedManyWithoutPostInput = {
    create?: XOR<ModerationLogCreateWithoutPostInput, ModerationLogUncheckedCreateWithoutPostInput> | ModerationLogCreateWithoutPostInput[] | ModerationLogUncheckedCreateWithoutPostInput[]
    connectOrCreate?: ModerationLogCreateOrConnectWithoutPostInput | ModerationLogCreateOrConnectWithoutPostInput[]
    createMany?: ModerationLogCreateManyPostInputEnvelope
    connect?: ModerationLogWhereUniqueInput | ModerationLogWhereUniqueInput[]
  }

  export type AuditLogUncheckedCreateNestedManyWithoutPostInput = {
    create?: XOR<AuditLogCreateWithoutPostInput, AuditLogUncheckedCreateWithoutPostInput> | AuditLogCreateWithoutPostInput[] | AuditLogUncheckedCreateWithoutPostInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutPostInput | AuditLogCreateOrConnectWithoutPostInput[]
    createMany?: AuditLogCreateManyPostInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type CategoryUpdateOneWithoutPostsNestedInput = {
    create?: XOR<CategoryCreateWithoutPostsInput, CategoryUncheckedCreateWithoutPostsInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutPostsInput
    upsert?: CategoryUpsertWithoutPostsInput
    disconnect?: CategoryWhereInput | boolean
    delete?: CategoryWhereInput | boolean
    connect?: CategoryWhereUniqueInput
    update?: XOR<XOR<CategoryUpdateToOneWithWhereWithoutPostsInput, CategoryUpdateWithoutPostsInput>, CategoryUncheckedUpdateWithoutPostsInput>
  }

  export type TagUpdateManyWithoutPostsNestedInput = {
    create?: XOR<TagCreateWithoutPostsInput, TagUncheckedCreateWithoutPostsInput> | TagCreateWithoutPostsInput[] | TagUncheckedCreateWithoutPostsInput[]
    connectOrCreate?: TagCreateOrConnectWithoutPostsInput | TagCreateOrConnectWithoutPostsInput[]
    upsert?: TagUpsertWithWhereUniqueWithoutPostsInput | TagUpsertWithWhereUniqueWithoutPostsInput[]
    set?: TagWhereUniqueInput | TagWhereUniqueInput[]
    disconnect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    delete?: TagWhereUniqueInput | TagWhereUniqueInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    update?: TagUpdateWithWhereUniqueWithoutPostsInput | TagUpdateWithWhereUniqueWithoutPostsInput[]
    updateMany?: TagUpdateManyWithWhereWithoutPostsInput | TagUpdateManyWithWhereWithoutPostsInput[]
    deleteMany?: TagScalarWhereInput | TagScalarWhereInput[]
  }

  export type PostVersionUpdateManyWithoutPostNestedInput = {
    create?: XOR<PostVersionCreateWithoutPostInput, PostVersionUncheckedCreateWithoutPostInput> | PostVersionCreateWithoutPostInput[] | PostVersionUncheckedCreateWithoutPostInput[]
    connectOrCreate?: PostVersionCreateOrConnectWithoutPostInput | PostVersionCreateOrConnectWithoutPostInput[]
    upsert?: PostVersionUpsertWithWhereUniqueWithoutPostInput | PostVersionUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: PostVersionCreateManyPostInputEnvelope
    set?: PostVersionWhereUniqueInput | PostVersionWhereUniqueInput[]
    disconnect?: PostVersionWhereUniqueInput | PostVersionWhereUniqueInput[]
    delete?: PostVersionWhereUniqueInput | PostVersionWhereUniqueInput[]
    connect?: PostVersionWhereUniqueInput | PostVersionWhereUniqueInput[]
    update?: PostVersionUpdateWithWhereUniqueWithoutPostInput | PostVersionUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: PostVersionUpdateManyWithWhereWithoutPostInput | PostVersionUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: PostVersionScalarWhereInput | PostVersionScalarWhereInput[]
  }

  export type PostTranslationUpdateManyWithoutPostNestedInput = {
    create?: XOR<PostTranslationCreateWithoutPostInput, PostTranslationUncheckedCreateWithoutPostInput> | PostTranslationCreateWithoutPostInput[] | PostTranslationUncheckedCreateWithoutPostInput[]
    connectOrCreate?: PostTranslationCreateOrConnectWithoutPostInput | PostTranslationCreateOrConnectWithoutPostInput[]
    upsert?: PostTranslationUpsertWithWhereUniqueWithoutPostInput | PostTranslationUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: PostTranslationCreateManyPostInputEnvelope
    set?: PostTranslationWhereUniqueInput | PostTranslationWhereUniqueInput[]
    disconnect?: PostTranslationWhereUniqueInput | PostTranslationWhereUniqueInput[]
    delete?: PostTranslationWhereUniqueInput | PostTranslationWhereUniqueInput[]
    connect?: PostTranslationWhereUniqueInput | PostTranslationWhereUniqueInput[]
    update?: PostTranslationUpdateWithWhereUniqueWithoutPostInput | PostTranslationUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: PostTranslationUpdateManyWithWhereWithoutPostInput | PostTranslationUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: PostTranslationScalarWhereInput | PostTranslationScalarWhereInput[]
  }

  export type CommentUpdateManyWithoutPostNestedInput = {
    create?: XOR<CommentCreateWithoutPostInput, CommentUncheckedCreateWithoutPostInput> | CommentCreateWithoutPostInput[] | CommentUncheckedCreateWithoutPostInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutPostInput | CommentCreateOrConnectWithoutPostInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutPostInput | CommentUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: CommentCreateManyPostInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutPostInput | CommentUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutPostInput | CommentUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type ModerationLogUpdateManyWithoutPostNestedInput = {
    create?: XOR<ModerationLogCreateWithoutPostInput, ModerationLogUncheckedCreateWithoutPostInput> | ModerationLogCreateWithoutPostInput[] | ModerationLogUncheckedCreateWithoutPostInput[]
    connectOrCreate?: ModerationLogCreateOrConnectWithoutPostInput | ModerationLogCreateOrConnectWithoutPostInput[]
    upsert?: ModerationLogUpsertWithWhereUniqueWithoutPostInput | ModerationLogUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: ModerationLogCreateManyPostInputEnvelope
    set?: ModerationLogWhereUniqueInput | ModerationLogWhereUniqueInput[]
    disconnect?: ModerationLogWhereUniqueInput | ModerationLogWhereUniqueInput[]
    delete?: ModerationLogWhereUniqueInput | ModerationLogWhereUniqueInput[]
    connect?: ModerationLogWhereUniqueInput | ModerationLogWhereUniqueInput[]
    update?: ModerationLogUpdateWithWhereUniqueWithoutPostInput | ModerationLogUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: ModerationLogUpdateManyWithWhereWithoutPostInput | ModerationLogUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: ModerationLogScalarWhereInput | ModerationLogScalarWhereInput[]
  }

  export type AuditLogUpdateManyWithoutPostNestedInput = {
    create?: XOR<AuditLogCreateWithoutPostInput, AuditLogUncheckedCreateWithoutPostInput> | AuditLogCreateWithoutPostInput[] | AuditLogUncheckedCreateWithoutPostInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutPostInput | AuditLogCreateOrConnectWithoutPostInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutPostInput | AuditLogUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: AuditLogCreateManyPostInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutPostInput | AuditLogUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutPostInput | AuditLogUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type TagUncheckedUpdateManyWithoutPostsNestedInput = {
    create?: XOR<TagCreateWithoutPostsInput, TagUncheckedCreateWithoutPostsInput> | TagCreateWithoutPostsInput[] | TagUncheckedCreateWithoutPostsInput[]
    connectOrCreate?: TagCreateOrConnectWithoutPostsInput | TagCreateOrConnectWithoutPostsInput[]
    upsert?: TagUpsertWithWhereUniqueWithoutPostsInput | TagUpsertWithWhereUniqueWithoutPostsInput[]
    set?: TagWhereUniqueInput | TagWhereUniqueInput[]
    disconnect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    delete?: TagWhereUniqueInput | TagWhereUniqueInput[]
    connect?: TagWhereUniqueInput | TagWhereUniqueInput[]
    update?: TagUpdateWithWhereUniqueWithoutPostsInput | TagUpdateWithWhereUniqueWithoutPostsInput[]
    updateMany?: TagUpdateManyWithWhereWithoutPostsInput | TagUpdateManyWithWhereWithoutPostsInput[]
    deleteMany?: TagScalarWhereInput | TagScalarWhereInput[]
  }

  export type PostVersionUncheckedUpdateManyWithoutPostNestedInput = {
    create?: XOR<PostVersionCreateWithoutPostInput, PostVersionUncheckedCreateWithoutPostInput> | PostVersionCreateWithoutPostInput[] | PostVersionUncheckedCreateWithoutPostInput[]
    connectOrCreate?: PostVersionCreateOrConnectWithoutPostInput | PostVersionCreateOrConnectWithoutPostInput[]
    upsert?: PostVersionUpsertWithWhereUniqueWithoutPostInput | PostVersionUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: PostVersionCreateManyPostInputEnvelope
    set?: PostVersionWhereUniqueInput | PostVersionWhereUniqueInput[]
    disconnect?: PostVersionWhereUniqueInput | PostVersionWhereUniqueInput[]
    delete?: PostVersionWhereUniqueInput | PostVersionWhereUniqueInput[]
    connect?: PostVersionWhereUniqueInput | PostVersionWhereUniqueInput[]
    update?: PostVersionUpdateWithWhereUniqueWithoutPostInput | PostVersionUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: PostVersionUpdateManyWithWhereWithoutPostInput | PostVersionUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: PostVersionScalarWhereInput | PostVersionScalarWhereInput[]
  }

  export type PostTranslationUncheckedUpdateManyWithoutPostNestedInput = {
    create?: XOR<PostTranslationCreateWithoutPostInput, PostTranslationUncheckedCreateWithoutPostInput> | PostTranslationCreateWithoutPostInput[] | PostTranslationUncheckedCreateWithoutPostInput[]
    connectOrCreate?: PostTranslationCreateOrConnectWithoutPostInput | PostTranslationCreateOrConnectWithoutPostInput[]
    upsert?: PostTranslationUpsertWithWhereUniqueWithoutPostInput | PostTranslationUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: PostTranslationCreateManyPostInputEnvelope
    set?: PostTranslationWhereUniqueInput | PostTranslationWhereUniqueInput[]
    disconnect?: PostTranslationWhereUniqueInput | PostTranslationWhereUniqueInput[]
    delete?: PostTranslationWhereUniqueInput | PostTranslationWhereUniqueInput[]
    connect?: PostTranslationWhereUniqueInput | PostTranslationWhereUniqueInput[]
    update?: PostTranslationUpdateWithWhereUniqueWithoutPostInput | PostTranslationUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: PostTranslationUpdateManyWithWhereWithoutPostInput | PostTranslationUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: PostTranslationScalarWhereInput | PostTranslationScalarWhereInput[]
  }

  export type CommentUncheckedUpdateManyWithoutPostNestedInput = {
    create?: XOR<CommentCreateWithoutPostInput, CommentUncheckedCreateWithoutPostInput> | CommentCreateWithoutPostInput[] | CommentUncheckedCreateWithoutPostInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutPostInput | CommentCreateOrConnectWithoutPostInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutPostInput | CommentUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: CommentCreateManyPostInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutPostInput | CommentUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutPostInput | CommentUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type ModerationLogUncheckedUpdateManyWithoutPostNestedInput = {
    create?: XOR<ModerationLogCreateWithoutPostInput, ModerationLogUncheckedCreateWithoutPostInput> | ModerationLogCreateWithoutPostInput[] | ModerationLogUncheckedCreateWithoutPostInput[]
    connectOrCreate?: ModerationLogCreateOrConnectWithoutPostInput | ModerationLogCreateOrConnectWithoutPostInput[]
    upsert?: ModerationLogUpsertWithWhereUniqueWithoutPostInput | ModerationLogUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: ModerationLogCreateManyPostInputEnvelope
    set?: ModerationLogWhereUniqueInput | ModerationLogWhereUniqueInput[]
    disconnect?: ModerationLogWhereUniqueInput | ModerationLogWhereUniqueInput[]
    delete?: ModerationLogWhereUniqueInput | ModerationLogWhereUniqueInput[]
    connect?: ModerationLogWhereUniqueInput | ModerationLogWhereUniqueInput[]
    update?: ModerationLogUpdateWithWhereUniqueWithoutPostInput | ModerationLogUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: ModerationLogUpdateManyWithWhereWithoutPostInput | ModerationLogUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: ModerationLogScalarWhereInput | ModerationLogScalarWhereInput[]
  }

  export type AuditLogUncheckedUpdateManyWithoutPostNestedInput = {
    create?: XOR<AuditLogCreateWithoutPostInput, AuditLogUncheckedCreateWithoutPostInput> | AuditLogCreateWithoutPostInput[] | AuditLogUncheckedCreateWithoutPostInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutPostInput | AuditLogCreateOrConnectWithoutPostInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutPostInput | AuditLogUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: AuditLogCreateManyPostInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutPostInput | AuditLogUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutPostInput | AuditLogUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type PostCreateNestedManyWithoutTagsInput = {
    create?: XOR<PostCreateWithoutTagsInput, PostUncheckedCreateWithoutTagsInput> | PostCreateWithoutTagsInput[] | PostUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: PostCreateOrConnectWithoutTagsInput | PostCreateOrConnectWithoutTagsInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type PostUncheckedCreateNestedManyWithoutTagsInput = {
    create?: XOR<PostCreateWithoutTagsInput, PostUncheckedCreateWithoutTagsInput> | PostCreateWithoutTagsInput[] | PostUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: PostCreateOrConnectWithoutTagsInput | PostCreateOrConnectWithoutTagsInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type PostUpdateManyWithoutTagsNestedInput = {
    create?: XOR<PostCreateWithoutTagsInput, PostUncheckedCreateWithoutTagsInput> | PostCreateWithoutTagsInput[] | PostUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: PostCreateOrConnectWithoutTagsInput | PostCreateOrConnectWithoutTagsInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutTagsInput | PostUpsertWithWhereUniqueWithoutTagsInput[]
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutTagsInput | PostUpdateWithWhereUniqueWithoutTagsInput[]
    updateMany?: PostUpdateManyWithWhereWithoutTagsInput | PostUpdateManyWithWhereWithoutTagsInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type PostUncheckedUpdateManyWithoutTagsNestedInput = {
    create?: XOR<PostCreateWithoutTagsInput, PostUncheckedCreateWithoutTagsInput> | PostCreateWithoutTagsInput[] | PostUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: PostCreateOrConnectWithoutTagsInput | PostCreateOrConnectWithoutTagsInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutTagsInput | PostUpsertWithWhereUniqueWithoutTagsInput[]
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutTagsInput | PostUpdateWithWhereUniqueWithoutTagsInput[]
    updateMany?: PostUpdateManyWithWhereWithoutTagsInput | PostUpdateManyWithWhereWithoutTagsInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type PostCreateNestedOneWithoutVersionsInput = {
    create?: XOR<PostCreateWithoutVersionsInput, PostUncheckedCreateWithoutVersionsInput>
    connectOrCreate?: PostCreateOrConnectWithoutVersionsInput
    connect?: PostWhereUniqueInput
  }

  export type PostUpdateOneRequiredWithoutVersionsNestedInput = {
    create?: XOR<PostCreateWithoutVersionsInput, PostUncheckedCreateWithoutVersionsInput>
    connectOrCreate?: PostCreateOrConnectWithoutVersionsInput
    upsert?: PostUpsertWithoutVersionsInput
    connect?: PostWhereUniqueInput
    update?: XOR<XOR<PostUpdateToOneWithWhereWithoutVersionsInput, PostUpdateWithoutVersionsInput>, PostUncheckedUpdateWithoutVersionsInput>
  }

  export type PostCreateNestedOneWithoutModerationLogsInput = {
    create?: XOR<PostCreateWithoutModerationLogsInput, PostUncheckedCreateWithoutModerationLogsInput>
    connectOrCreate?: PostCreateOrConnectWithoutModerationLogsInput
    connect?: PostWhereUniqueInput
  }

  export type PostUpdateOneRequiredWithoutModerationLogsNestedInput = {
    create?: XOR<PostCreateWithoutModerationLogsInput, PostUncheckedCreateWithoutModerationLogsInput>
    connectOrCreate?: PostCreateOrConnectWithoutModerationLogsInput
    upsert?: PostUpsertWithoutModerationLogsInput
    connect?: PostWhereUniqueInput
    update?: XOR<XOR<PostUpdateToOneWithWhereWithoutModerationLogsInput, PostUpdateWithoutModerationLogsInput>, PostUncheckedUpdateWithoutModerationLogsInput>
  }

  export type PostCreateNestedOneWithoutAuditLogsInput = {
    create?: XOR<PostCreateWithoutAuditLogsInput, PostUncheckedCreateWithoutAuditLogsInput>
    connectOrCreate?: PostCreateOrConnectWithoutAuditLogsInput
    connect?: PostWhereUniqueInput
  }

  export type PostUpdateOneWithoutAuditLogsNestedInput = {
    create?: XOR<PostCreateWithoutAuditLogsInput, PostUncheckedCreateWithoutAuditLogsInput>
    connectOrCreate?: PostCreateOrConnectWithoutAuditLogsInput
    upsert?: PostUpsertWithoutAuditLogsInput
    disconnect?: PostWhereInput | boolean
    delete?: PostWhereInput | boolean
    connect?: PostWhereUniqueInput
    update?: XOR<XOR<PostUpdateToOneWithWhereWithoutAuditLogsInput, PostUpdateWithoutAuditLogsInput>, PostUncheckedUpdateWithoutAuditLogsInput>
  }

  export type PostCreateNestedOneWithoutTranslations_relInput = {
    create?: XOR<PostCreateWithoutTranslations_relInput, PostUncheckedCreateWithoutTranslations_relInput>
    connectOrCreate?: PostCreateOrConnectWithoutTranslations_relInput
    connect?: PostWhereUniqueInput
  }

  export type PostUpdateOneRequiredWithoutTranslations_relNestedInput = {
    create?: XOR<PostCreateWithoutTranslations_relInput, PostUncheckedCreateWithoutTranslations_relInput>
    connectOrCreate?: PostCreateOrConnectWithoutTranslations_relInput
    upsert?: PostUpsertWithoutTranslations_relInput
    connect?: PostWhereUniqueInput
    update?: XOR<XOR<PostUpdateToOneWithWhereWithoutTranslations_relInput, PostUpdateWithoutTranslations_relInput>, PostUncheckedUpdateWithoutTranslations_relInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type CategoryCreateWithoutChildrenInput = {
    id?: string
    name: string
    slug: string
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    thumbnail?: string | null
    attachmentId?: string | null
    linkType?: string | null
    customUrl?: string | null
    target?: string | null
    orderIndex?: number
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: string | null
    metaDescription?: string | null
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: CategoryCreateNestedOneWithoutChildrenInput
    posts?: PostCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUncheckedCreateWithoutChildrenInput = {
    id?: string
    name: string
    slug: string
    parentId?: string | null
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    thumbnail?: string | null
    attachmentId?: string | null
    linkType?: string | null
    customUrl?: string | null
    target?: string | null
    orderIndex?: number
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: string | null
    metaDescription?: string | null
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    posts?: PostUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type CategoryCreateOrConnectWithoutChildrenInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutChildrenInput, CategoryUncheckedCreateWithoutChildrenInput>
  }

  export type CategoryCreateWithoutParentInput = {
    id?: string
    name: string
    slug: string
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    thumbnail?: string | null
    attachmentId?: string | null
    linkType?: string | null
    customUrl?: string | null
    target?: string | null
    orderIndex?: number
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: string | null
    metaDescription?: string | null
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: CategoryCreateNestedManyWithoutParentInput
    posts?: PostCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUncheckedCreateWithoutParentInput = {
    id?: string
    name: string
    slug: string
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    thumbnail?: string | null
    attachmentId?: string | null
    linkType?: string | null
    customUrl?: string | null
    target?: string | null
    orderIndex?: number
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: string | null
    metaDescription?: string | null
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput
    posts?: PostUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type CategoryCreateOrConnectWithoutParentInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput>
  }

  export type CategoryCreateManyParentInputEnvelope = {
    data: CategoryCreateManyParentInput | CategoryCreateManyParentInput[]
    skipDuplicates?: boolean
  }

  export type PostCreateWithoutCategoryInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    tags?: TagCreateNestedManyWithoutPostsInput
    versions?: PostVersionCreateNestedManyWithoutPostInput
    translations_rel?: PostTranslationCreateNestedManyWithoutPostInput
    comments?: CommentCreateNestedManyWithoutPostInput
    moderationLogs?: ModerationLogCreateNestedManyWithoutPostInput
    auditLogs?: AuditLogCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateWithoutCategoryInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    tags?: TagUncheckedCreateNestedManyWithoutPostsInput
    versions?: PostVersionUncheckedCreateNestedManyWithoutPostInput
    translations_rel?: PostTranslationUncheckedCreateNestedManyWithoutPostInput
    comments?: CommentUncheckedCreateNestedManyWithoutPostInput
    moderationLogs?: ModerationLogUncheckedCreateNestedManyWithoutPostInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostCreateOrConnectWithoutCategoryInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutCategoryInput, PostUncheckedCreateWithoutCategoryInput>
  }

  export type PostCreateManyCategoryInputEnvelope = {
    data: PostCreateManyCategoryInput | PostCreateManyCategoryInput[]
    skipDuplicates?: boolean
  }

  export type CategoryUpsertWithoutChildrenInput = {
    update: XOR<CategoryUpdateWithoutChildrenInput, CategoryUncheckedUpdateWithoutChildrenInput>
    create: XOR<CategoryCreateWithoutChildrenInput, CategoryUncheckedCreateWithoutChildrenInput>
    where?: CategoryWhereInput
  }

  export type CategoryUpdateToOneWithWhereWithoutChildrenInput = {
    where?: CategoryWhereInput
    data: XOR<CategoryUpdateWithoutChildrenInput, CategoryUncheckedUpdateWithoutChildrenInput>
  }

  export type CategoryUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    linkType?: NullableStringFieldUpdateOperationsInput | string | null
    customUrl?: NullableStringFieldUpdateOperationsInput | string | null
    target?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: CategoryUpdateOneWithoutChildrenNestedInput
    posts?: PostUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    linkType?: NullableStringFieldUpdateOperationsInput | string | null
    customUrl?: NullableStringFieldUpdateOperationsInput | string | null
    target?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    posts?: PostUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUpsertWithWhereUniqueWithoutParentInput = {
    where: CategoryWhereUniqueInput
    update: XOR<CategoryUpdateWithoutParentInput, CategoryUncheckedUpdateWithoutParentInput>
    create: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput>
  }

  export type CategoryUpdateWithWhereUniqueWithoutParentInput = {
    where: CategoryWhereUniqueInput
    data: XOR<CategoryUpdateWithoutParentInput, CategoryUncheckedUpdateWithoutParentInput>
  }

  export type CategoryUpdateManyWithWhereWithoutParentInput = {
    where: CategoryScalarWhereInput
    data: XOR<CategoryUpdateManyMutationInput, CategoryUncheckedUpdateManyWithoutParentInput>
  }

  export type CategoryScalarWhereInput = {
    AND?: CategoryScalarWhereInput | CategoryScalarWhereInput[]
    OR?: CategoryScalarWhereInput[]
    NOT?: CategoryScalarWhereInput | CategoryScalarWhereInput[]
    id?: StringFilter<"Category"> | string
    name?: StringFilter<"Category"> | string
    slug?: StringFilter<"Category"> | string
    parentId?: StringNullableFilter<"Category"> | string | null
    lft?: IntFilter<"Category"> | number
    rgt?: IntFilter<"Category"> | number
    depth?: IntFilter<"Category"> | number
    status?: BoolFilter<"Category"> | boolean
    thumbnail?: StringNullableFilter<"Category"> | string | null
    attachmentId?: StringNullableFilter<"Category"> | string | null
    linkType?: StringNullableFilter<"Category"> | string | null
    customUrl?: StringNullableFilter<"Category"> | string | null
    target?: StringNullableFilter<"Category"> | string | null
    orderIndex?: IntFilter<"Category"> | number
    description?: StringNullableFilter<"Category"> | string | null
    translations?: JsonNullableFilter<"Category">
    metaTitle?: StringNullableFilter<"Category"> | string | null
    metaDescription?: StringNullableFilter<"Category"> | string | null
    isGovStandard?: BoolFilter<"Category"> | boolean
    createdAt?: DateTimeFilter<"Category"> | Date | string
    updatedAt?: DateTimeFilter<"Category"> | Date | string
  }

  export type PostUpsertWithWhereUniqueWithoutCategoryInput = {
    where: PostWhereUniqueInput
    update: XOR<PostUpdateWithoutCategoryInput, PostUncheckedUpdateWithoutCategoryInput>
    create: XOR<PostCreateWithoutCategoryInput, PostUncheckedCreateWithoutCategoryInput>
  }

  export type PostUpdateWithWhereUniqueWithoutCategoryInput = {
    where: PostWhereUniqueInput
    data: XOR<PostUpdateWithoutCategoryInput, PostUncheckedUpdateWithoutCategoryInput>
  }

  export type PostUpdateManyWithWhereWithoutCategoryInput = {
    where: PostScalarWhereInput
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyWithoutCategoryInput>
  }

  export type PostScalarWhereInput = {
    AND?: PostScalarWhereInput | PostScalarWhereInput[]
    OR?: PostScalarWhereInput[]
    NOT?: PostScalarWhereInput | PostScalarWhereInput[]
    id?: StringFilter<"Post"> | string
    title?: StringFilter<"Post"> | string
    description?: StringNullableFilter<"Post"> | string | null
    content?: StringNullableFilter<"Post"> | string | null
    contentHtml?: StringNullableFilter<"Post"> | string | null
    slug?: StringFilter<"Post"> | string
    thumbnail?: StringNullableFilter<"Post"> | string | null
    authorId?: StringFilter<"Post"> | string
    status?: StringFilter<"Post"> | string
    currentVersion?: IntFilter<"Post"> | number
    isFeatured?: BoolFilter<"Post"> | boolean
    isNotification?: BoolFilter<"Post"> | boolean
    viewCount?: IntFilter<"Post"> | number
    isTranslated?: BoolFilter<"Post"> | boolean
    isCommentAllowed?: BoolFilter<"Post"> | boolean
    isDeleted?: BoolFilter<"Post"> | boolean
    publishedAt?: DateTimeNullableFilter<"Post"> | Date | string | null
    createdAt?: DateTimeFilter<"Post"> | Date | string
    updatedAt?: DateTimeFilter<"Post"> | Date | string
    deletedAt?: DateTimeNullableFilter<"Post"> | Date | string | null
    categoryId?: StringNullableFilter<"Post"> | string | null
  }

  export type PostCreateWithoutCommentsInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    category?: CategoryCreateNestedOneWithoutPostsInput
    tags?: TagCreateNestedManyWithoutPostsInput
    versions?: PostVersionCreateNestedManyWithoutPostInput
    translations_rel?: PostTranslationCreateNestedManyWithoutPostInput
    moderationLogs?: ModerationLogCreateNestedManyWithoutPostInput
    auditLogs?: AuditLogCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateWithoutCommentsInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    categoryId?: string | null
    tags?: TagUncheckedCreateNestedManyWithoutPostsInput
    versions?: PostVersionUncheckedCreateNestedManyWithoutPostInput
    translations_rel?: PostTranslationUncheckedCreateNestedManyWithoutPostInput
    moderationLogs?: ModerationLogUncheckedCreateNestedManyWithoutPostInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostCreateOrConnectWithoutCommentsInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutCommentsInput, PostUncheckedCreateWithoutCommentsInput>
  }

  export type CommentCreateWithoutRepliesInput = {
    id?: string
    content: string
    status?: string
    authorId?: string | null
    authorName?: string | null
    authorEmail?: string | null
    authorIp?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    post: PostCreateNestedOneWithoutCommentsInput
    parent?: CommentCreateNestedOneWithoutRepliesInput
  }

  export type CommentUncheckedCreateWithoutRepliesInput = {
    id?: string
    content: string
    status?: string
    authorId?: string | null
    authorName?: string | null
    authorEmail?: string | null
    authorIp?: string | null
    postId: string
    parentId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CommentCreateOrConnectWithoutRepliesInput = {
    where: CommentWhereUniqueInput
    create: XOR<CommentCreateWithoutRepliesInput, CommentUncheckedCreateWithoutRepliesInput>
  }

  export type CommentCreateWithoutParentInput = {
    id?: string
    content: string
    status?: string
    authorId?: string | null
    authorName?: string | null
    authorEmail?: string | null
    authorIp?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    post: PostCreateNestedOneWithoutCommentsInput
    replies?: CommentCreateNestedManyWithoutParentInput
  }

  export type CommentUncheckedCreateWithoutParentInput = {
    id?: string
    content: string
    status?: string
    authorId?: string | null
    authorName?: string | null
    authorEmail?: string | null
    authorIp?: string | null
    postId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    replies?: CommentUncheckedCreateNestedManyWithoutParentInput
  }

  export type CommentCreateOrConnectWithoutParentInput = {
    where: CommentWhereUniqueInput
    create: XOR<CommentCreateWithoutParentInput, CommentUncheckedCreateWithoutParentInput>
  }

  export type CommentCreateManyParentInputEnvelope = {
    data: CommentCreateManyParentInput | CommentCreateManyParentInput[]
    skipDuplicates?: boolean
  }

  export type PostUpsertWithoutCommentsInput = {
    update: XOR<PostUpdateWithoutCommentsInput, PostUncheckedUpdateWithoutCommentsInput>
    create: XOR<PostCreateWithoutCommentsInput, PostUncheckedCreateWithoutCommentsInput>
    where?: PostWhereInput
  }

  export type PostUpdateToOneWithWhereWithoutCommentsInput = {
    where?: PostWhereInput
    data: XOR<PostUpdateWithoutCommentsInput, PostUncheckedUpdateWithoutCommentsInput>
  }

  export type PostUpdateWithoutCommentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    category?: CategoryUpdateOneWithoutPostsNestedInput
    tags?: TagUpdateManyWithoutPostsNestedInput
    versions?: PostVersionUpdateManyWithoutPostNestedInput
    translations_rel?: PostTranslationUpdateManyWithoutPostNestedInput
    moderationLogs?: ModerationLogUpdateManyWithoutPostNestedInput
    auditLogs?: AuditLogUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutCommentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TagUncheckedUpdateManyWithoutPostsNestedInput
    versions?: PostVersionUncheckedUpdateManyWithoutPostNestedInput
    translations_rel?: PostTranslationUncheckedUpdateManyWithoutPostNestedInput
    moderationLogs?: ModerationLogUncheckedUpdateManyWithoutPostNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutPostNestedInput
  }

  export type CommentUpsertWithoutRepliesInput = {
    update: XOR<CommentUpdateWithoutRepliesInput, CommentUncheckedUpdateWithoutRepliesInput>
    create: XOR<CommentCreateWithoutRepliesInput, CommentUncheckedCreateWithoutRepliesInput>
    where?: CommentWhereInput
  }

  export type CommentUpdateToOneWithWhereWithoutRepliesInput = {
    where?: CommentWhereInput
    data: XOR<CommentUpdateWithoutRepliesInput, CommentUncheckedUpdateWithoutRepliesInput>
  }

  export type CommentUpdateWithoutRepliesInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    authorEmail?: NullableStringFieldUpdateOperationsInput | string | null
    authorIp?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    post?: PostUpdateOneRequiredWithoutCommentsNestedInput
    parent?: CommentUpdateOneWithoutRepliesNestedInput
  }

  export type CommentUncheckedUpdateWithoutRepliesInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    authorEmail?: NullableStringFieldUpdateOperationsInput | string | null
    authorIp?: NullableStringFieldUpdateOperationsInput | string | null
    postId?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentUpsertWithWhereUniqueWithoutParentInput = {
    where: CommentWhereUniqueInput
    update: XOR<CommentUpdateWithoutParentInput, CommentUncheckedUpdateWithoutParentInput>
    create: XOR<CommentCreateWithoutParentInput, CommentUncheckedCreateWithoutParentInput>
  }

  export type CommentUpdateWithWhereUniqueWithoutParentInput = {
    where: CommentWhereUniqueInput
    data: XOR<CommentUpdateWithoutParentInput, CommentUncheckedUpdateWithoutParentInput>
  }

  export type CommentUpdateManyWithWhereWithoutParentInput = {
    where: CommentScalarWhereInput
    data: XOR<CommentUpdateManyMutationInput, CommentUncheckedUpdateManyWithoutParentInput>
  }

  export type CommentScalarWhereInput = {
    AND?: CommentScalarWhereInput | CommentScalarWhereInput[]
    OR?: CommentScalarWhereInput[]
    NOT?: CommentScalarWhereInput | CommentScalarWhereInput[]
    id?: StringFilter<"Comment"> | string
    content?: StringFilter<"Comment"> | string
    status?: StringFilter<"Comment"> | string
    authorId?: StringNullableFilter<"Comment"> | string | null
    authorName?: StringNullableFilter<"Comment"> | string | null
    authorEmail?: StringNullableFilter<"Comment"> | string | null
    authorIp?: StringNullableFilter<"Comment"> | string | null
    postId?: StringFilter<"Comment"> | string
    parentId?: StringNullableFilter<"Comment"> | string | null
    createdAt?: DateTimeFilter<"Comment"> | Date | string
    updatedAt?: DateTimeFilter<"Comment"> | Date | string
  }

  export type PortalMenuCreateWithoutChildrenInput = {
    id?: string
    name: string
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: string | null
    link?: string | null
    order?: number
    isActive?: boolean
    target?: string
    type?: string
    referenceId?: string | null
    position?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: PortalMenuCreateNestedOneWithoutChildrenInput
  }

  export type PortalMenuUncheckedCreateWithoutChildrenInput = {
    id?: string
    name: string
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: string | null
    link?: string | null
    order?: number
    parentId?: string | null
    isActive?: boolean
    target?: string
    type?: string
    referenceId?: string | null
    position?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PortalMenuCreateOrConnectWithoutChildrenInput = {
    where: PortalMenuWhereUniqueInput
    create: XOR<PortalMenuCreateWithoutChildrenInput, PortalMenuUncheckedCreateWithoutChildrenInput>
  }

  export type PortalMenuCreateWithoutParentInput = {
    id?: string
    name: string
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: string | null
    link?: string | null
    order?: number
    isActive?: boolean
    target?: string
    type?: string
    referenceId?: string | null
    position?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: PortalMenuCreateNestedManyWithoutParentInput
  }

  export type PortalMenuUncheckedCreateWithoutParentInput = {
    id?: string
    name: string
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: string | null
    link?: string | null
    order?: number
    isActive?: boolean
    target?: string
    type?: string
    referenceId?: string | null
    position?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: PortalMenuUncheckedCreateNestedManyWithoutParentInput
  }

  export type PortalMenuCreateOrConnectWithoutParentInput = {
    where: PortalMenuWhereUniqueInput
    create: XOR<PortalMenuCreateWithoutParentInput, PortalMenuUncheckedCreateWithoutParentInput>
  }

  export type PortalMenuCreateManyParentInputEnvelope = {
    data: PortalMenuCreateManyParentInput | PortalMenuCreateManyParentInput[]
    skipDuplicates?: boolean
  }

  export type PortalMenuUpsertWithoutChildrenInput = {
    update: XOR<PortalMenuUpdateWithoutChildrenInput, PortalMenuUncheckedUpdateWithoutChildrenInput>
    create: XOR<PortalMenuCreateWithoutChildrenInput, PortalMenuUncheckedCreateWithoutChildrenInput>
    where?: PortalMenuWhereInput
  }

  export type PortalMenuUpdateToOneWithWhereWithoutChildrenInput = {
    where?: PortalMenuWhereInput
    data: XOR<PortalMenuUpdateWithoutChildrenInput, PortalMenuUncheckedUpdateWithoutChildrenInput>
  }

  export type PortalMenuUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    target?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: PortalMenuUpdateOneWithoutChildrenNestedInput
  }

  export type PortalMenuUncheckedUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    target?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortalMenuUpsertWithWhereUniqueWithoutParentInput = {
    where: PortalMenuWhereUniqueInput
    update: XOR<PortalMenuUpdateWithoutParentInput, PortalMenuUncheckedUpdateWithoutParentInput>
    create: XOR<PortalMenuCreateWithoutParentInput, PortalMenuUncheckedCreateWithoutParentInput>
  }

  export type PortalMenuUpdateWithWhereUniqueWithoutParentInput = {
    where: PortalMenuWhereUniqueInput
    data: XOR<PortalMenuUpdateWithoutParentInput, PortalMenuUncheckedUpdateWithoutParentInput>
  }

  export type PortalMenuUpdateManyWithWhereWithoutParentInput = {
    where: PortalMenuScalarWhereInput
    data: XOR<PortalMenuUpdateManyMutationInput, PortalMenuUncheckedUpdateManyWithoutParentInput>
  }

  export type PortalMenuScalarWhereInput = {
    AND?: PortalMenuScalarWhereInput | PortalMenuScalarWhereInput[]
    OR?: PortalMenuScalarWhereInput[]
    NOT?: PortalMenuScalarWhereInput | PortalMenuScalarWhereInput[]
    id?: StringFilter<"PortalMenu"> | string
    name?: StringFilter<"PortalMenu"> | string
    description?: StringNullableFilter<"PortalMenu"> | string | null
    translations?: JsonNullableFilter<"PortalMenu">
    icon?: StringNullableFilter<"PortalMenu"> | string | null
    link?: StringNullableFilter<"PortalMenu"> | string | null
    order?: IntFilter<"PortalMenu"> | number
    parentId?: StringNullableFilter<"PortalMenu"> | string | null
    isActive?: BoolFilter<"PortalMenu"> | boolean
    target?: StringFilter<"PortalMenu"> | string
    type?: StringFilter<"PortalMenu"> | string
    referenceId?: StringNullableFilter<"PortalMenu"> | string | null
    position?: StringFilter<"PortalMenu"> | string
    createdAt?: DateTimeFilter<"PortalMenu"> | Date | string
    updatedAt?: DateTimeFilter<"PortalMenu"> | Date | string
  }

  export type CategoryCreateWithoutPostsInput = {
    id?: string
    name: string
    slug: string
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    thumbnail?: string | null
    attachmentId?: string | null
    linkType?: string | null
    customUrl?: string | null
    target?: string | null
    orderIndex?: number
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: string | null
    metaDescription?: string | null
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: CategoryCreateNestedOneWithoutChildrenInput
    children?: CategoryCreateNestedManyWithoutParentInput
  }

  export type CategoryUncheckedCreateWithoutPostsInput = {
    id?: string
    name: string
    slug: string
    parentId?: string | null
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    thumbnail?: string | null
    attachmentId?: string | null
    linkType?: string | null
    customUrl?: string | null
    target?: string | null
    orderIndex?: number
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: string | null
    metaDescription?: string | null
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput
  }

  export type CategoryCreateOrConnectWithoutPostsInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutPostsInput, CategoryUncheckedCreateWithoutPostsInput>
  }

  export type TagCreateWithoutPostsInput = {
    id?: string
    name: string
    slug: string
  }

  export type TagUncheckedCreateWithoutPostsInput = {
    id?: string
    name: string
    slug: string
  }

  export type TagCreateOrConnectWithoutPostsInput = {
    where: TagWhereUniqueInput
    create: XOR<TagCreateWithoutPostsInput, TagUncheckedCreateWithoutPostsInput>
  }

  export type PostVersionCreateWithoutPostInput = {
    id?: string
    version: number
    title: string
    description?: string | null
    content?: string | null
    editorId: string
    changeNote?: string | null
    createdAt?: Date | string
  }

  export type PostVersionUncheckedCreateWithoutPostInput = {
    id?: string
    version: number
    title: string
    description?: string | null
    content?: string | null
    editorId: string
    changeNote?: string | null
    createdAt?: Date | string
  }

  export type PostVersionCreateOrConnectWithoutPostInput = {
    where: PostVersionWhereUniqueInput
    create: XOR<PostVersionCreateWithoutPostInput, PostVersionUncheckedCreateWithoutPostInput>
  }

  export type PostVersionCreateManyPostInputEnvelope = {
    data: PostVersionCreateManyPostInput | PostVersionCreateManyPostInput[]
    skipDuplicates?: boolean
  }

  export type PostTranslationCreateWithoutPostInput = {
    id?: string
    langCode: string
    title: string
    slug?: string | null
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    version?: number
    mainVersionRef: number
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PostTranslationUncheckedCreateWithoutPostInput = {
    id?: string
    langCode: string
    title: string
    slug?: string | null
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    version?: number
    mainVersionRef: number
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PostTranslationCreateOrConnectWithoutPostInput = {
    where: PostTranslationWhereUniqueInput
    create: XOR<PostTranslationCreateWithoutPostInput, PostTranslationUncheckedCreateWithoutPostInput>
  }

  export type PostTranslationCreateManyPostInputEnvelope = {
    data: PostTranslationCreateManyPostInput | PostTranslationCreateManyPostInput[]
    skipDuplicates?: boolean
  }

  export type CommentCreateWithoutPostInput = {
    id?: string
    content: string
    status?: string
    authorId?: string | null
    authorName?: string | null
    authorEmail?: string | null
    authorIp?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: CommentCreateNestedOneWithoutRepliesInput
    replies?: CommentCreateNestedManyWithoutParentInput
  }

  export type CommentUncheckedCreateWithoutPostInput = {
    id?: string
    content: string
    status?: string
    authorId?: string | null
    authorName?: string | null
    authorEmail?: string | null
    authorIp?: string | null
    parentId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    replies?: CommentUncheckedCreateNestedManyWithoutParentInput
  }

  export type CommentCreateOrConnectWithoutPostInput = {
    where: CommentWhereUniqueInput
    create: XOR<CommentCreateWithoutPostInput, CommentUncheckedCreateWithoutPostInput>
  }

  export type CommentCreateManyPostInputEnvelope = {
    data: CommentCreateManyPostInput | CommentCreateManyPostInput[]
    skipDuplicates?: boolean
  }

  export type ModerationLogCreateWithoutPostInput = {
    id?: string
    reviewerId: string
    oldStatus: string
    newStatus: string
    decision: string
    note?: string | null
    createdAt?: Date | string
  }

  export type ModerationLogUncheckedCreateWithoutPostInput = {
    id?: string
    reviewerId: string
    oldStatus: string
    newStatus: string
    decision: string
    note?: string | null
    createdAt?: Date | string
  }

  export type ModerationLogCreateOrConnectWithoutPostInput = {
    where: ModerationLogWhereUniqueInput
    create: XOR<ModerationLogCreateWithoutPostInput, ModerationLogUncheckedCreateWithoutPostInput>
  }

  export type ModerationLogCreateManyPostInputEnvelope = {
    data: ModerationLogCreateManyPostInput | ModerationLogCreateManyPostInput[]
    skipDuplicates?: boolean
  }

  export type AuditLogCreateWithoutPostInput = {
    id?: string
    actorId: string
    action: string
    entityType?: string
    entityId: string
    metadata?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type AuditLogUncheckedCreateWithoutPostInput = {
    id?: string
    actorId: string
    action: string
    entityType?: string
    entityId: string
    metadata?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type AuditLogCreateOrConnectWithoutPostInput = {
    where: AuditLogWhereUniqueInput
    create: XOR<AuditLogCreateWithoutPostInput, AuditLogUncheckedCreateWithoutPostInput>
  }

  export type AuditLogCreateManyPostInputEnvelope = {
    data: AuditLogCreateManyPostInput | AuditLogCreateManyPostInput[]
    skipDuplicates?: boolean
  }

  export type CategoryUpsertWithoutPostsInput = {
    update: XOR<CategoryUpdateWithoutPostsInput, CategoryUncheckedUpdateWithoutPostsInput>
    create: XOR<CategoryCreateWithoutPostsInput, CategoryUncheckedCreateWithoutPostsInput>
    where?: CategoryWhereInput
  }

  export type CategoryUpdateToOneWithWhereWithoutPostsInput = {
    where?: CategoryWhereInput
    data: XOR<CategoryUpdateWithoutPostsInput, CategoryUncheckedUpdateWithoutPostsInput>
  }

  export type CategoryUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    linkType?: NullableStringFieldUpdateOperationsInput | string | null
    customUrl?: NullableStringFieldUpdateOperationsInput | string | null
    target?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: CategoryUpdateOneWithoutChildrenNestedInput
    children?: CategoryUpdateManyWithoutParentNestedInput
  }

  export type CategoryUncheckedUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    linkType?: NullableStringFieldUpdateOperationsInput | string | null
    customUrl?: NullableStringFieldUpdateOperationsInput | string | null
    target?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput
  }

  export type TagUpsertWithWhereUniqueWithoutPostsInput = {
    where: TagWhereUniqueInput
    update: XOR<TagUpdateWithoutPostsInput, TagUncheckedUpdateWithoutPostsInput>
    create: XOR<TagCreateWithoutPostsInput, TagUncheckedCreateWithoutPostsInput>
  }

  export type TagUpdateWithWhereUniqueWithoutPostsInput = {
    where: TagWhereUniqueInput
    data: XOR<TagUpdateWithoutPostsInput, TagUncheckedUpdateWithoutPostsInput>
  }

  export type TagUpdateManyWithWhereWithoutPostsInput = {
    where: TagScalarWhereInput
    data: XOR<TagUpdateManyMutationInput, TagUncheckedUpdateManyWithoutPostsInput>
  }

  export type TagScalarWhereInput = {
    AND?: TagScalarWhereInput | TagScalarWhereInput[]
    OR?: TagScalarWhereInput[]
    NOT?: TagScalarWhereInput | TagScalarWhereInput[]
    id?: StringFilter<"Tag"> | string
    name?: StringFilter<"Tag"> | string
    slug?: StringFilter<"Tag"> | string
  }

  export type PostVersionUpsertWithWhereUniqueWithoutPostInput = {
    where: PostVersionWhereUniqueInput
    update: XOR<PostVersionUpdateWithoutPostInput, PostVersionUncheckedUpdateWithoutPostInput>
    create: XOR<PostVersionCreateWithoutPostInput, PostVersionUncheckedCreateWithoutPostInput>
  }

  export type PostVersionUpdateWithWhereUniqueWithoutPostInput = {
    where: PostVersionWhereUniqueInput
    data: XOR<PostVersionUpdateWithoutPostInput, PostVersionUncheckedUpdateWithoutPostInput>
  }

  export type PostVersionUpdateManyWithWhereWithoutPostInput = {
    where: PostVersionScalarWhereInput
    data: XOR<PostVersionUpdateManyMutationInput, PostVersionUncheckedUpdateManyWithoutPostInput>
  }

  export type PostVersionScalarWhereInput = {
    AND?: PostVersionScalarWhereInput | PostVersionScalarWhereInput[]
    OR?: PostVersionScalarWhereInput[]
    NOT?: PostVersionScalarWhereInput | PostVersionScalarWhereInput[]
    id?: StringFilter<"PostVersion"> | string
    postId?: StringFilter<"PostVersion"> | string
    version?: IntFilter<"PostVersion"> | number
    title?: StringFilter<"PostVersion"> | string
    description?: StringNullableFilter<"PostVersion"> | string | null
    content?: StringNullableFilter<"PostVersion"> | string | null
    editorId?: StringFilter<"PostVersion"> | string
    changeNote?: StringNullableFilter<"PostVersion"> | string | null
    createdAt?: DateTimeFilter<"PostVersion"> | Date | string
  }

  export type PostTranslationUpsertWithWhereUniqueWithoutPostInput = {
    where: PostTranslationWhereUniqueInput
    update: XOR<PostTranslationUpdateWithoutPostInput, PostTranslationUncheckedUpdateWithoutPostInput>
    create: XOR<PostTranslationCreateWithoutPostInput, PostTranslationUncheckedCreateWithoutPostInput>
  }

  export type PostTranslationUpdateWithWhereUniqueWithoutPostInput = {
    where: PostTranslationWhereUniqueInput
    data: XOR<PostTranslationUpdateWithoutPostInput, PostTranslationUncheckedUpdateWithoutPostInput>
  }

  export type PostTranslationUpdateManyWithWhereWithoutPostInput = {
    where: PostTranslationScalarWhereInput
    data: XOR<PostTranslationUpdateManyMutationInput, PostTranslationUncheckedUpdateManyWithoutPostInput>
  }

  export type PostTranslationScalarWhereInput = {
    AND?: PostTranslationScalarWhereInput | PostTranslationScalarWhereInput[]
    OR?: PostTranslationScalarWhereInput[]
    NOT?: PostTranslationScalarWhereInput | PostTranslationScalarWhereInput[]
    id?: StringFilter<"PostTranslation"> | string
    postId?: StringFilter<"PostTranslation"> | string
    langCode?: StringFilter<"PostTranslation"> | string
    title?: StringFilter<"PostTranslation"> | string
    slug?: StringNullableFilter<"PostTranslation"> | string | null
    description?: StringNullableFilter<"PostTranslation"> | string | null
    content?: StringNullableFilter<"PostTranslation"> | string | null
    contentHtml?: StringNullableFilter<"PostTranslation"> | string | null
    version?: IntFilter<"PostTranslation"> | number
    mainVersionRef?: IntFilter<"PostTranslation"> | number
    isPublished?: BoolFilter<"PostTranslation"> | boolean
    createdAt?: DateTimeFilter<"PostTranslation"> | Date | string
    updatedAt?: DateTimeFilter<"PostTranslation"> | Date | string
  }

  export type CommentUpsertWithWhereUniqueWithoutPostInput = {
    where: CommentWhereUniqueInput
    update: XOR<CommentUpdateWithoutPostInput, CommentUncheckedUpdateWithoutPostInput>
    create: XOR<CommentCreateWithoutPostInput, CommentUncheckedCreateWithoutPostInput>
  }

  export type CommentUpdateWithWhereUniqueWithoutPostInput = {
    where: CommentWhereUniqueInput
    data: XOR<CommentUpdateWithoutPostInput, CommentUncheckedUpdateWithoutPostInput>
  }

  export type CommentUpdateManyWithWhereWithoutPostInput = {
    where: CommentScalarWhereInput
    data: XOR<CommentUpdateManyMutationInput, CommentUncheckedUpdateManyWithoutPostInput>
  }

  export type ModerationLogUpsertWithWhereUniqueWithoutPostInput = {
    where: ModerationLogWhereUniqueInput
    update: XOR<ModerationLogUpdateWithoutPostInput, ModerationLogUncheckedUpdateWithoutPostInput>
    create: XOR<ModerationLogCreateWithoutPostInput, ModerationLogUncheckedCreateWithoutPostInput>
  }

  export type ModerationLogUpdateWithWhereUniqueWithoutPostInput = {
    where: ModerationLogWhereUniqueInput
    data: XOR<ModerationLogUpdateWithoutPostInput, ModerationLogUncheckedUpdateWithoutPostInput>
  }

  export type ModerationLogUpdateManyWithWhereWithoutPostInput = {
    where: ModerationLogScalarWhereInput
    data: XOR<ModerationLogUpdateManyMutationInput, ModerationLogUncheckedUpdateManyWithoutPostInput>
  }

  export type ModerationLogScalarWhereInput = {
    AND?: ModerationLogScalarWhereInput | ModerationLogScalarWhereInput[]
    OR?: ModerationLogScalarWhereInput[]
    NOT?: ModerationLogScalarWhereInput | ModerationLogScalarWhereInput[]
    id?: StringFilter<"ModerationLog"> | string
    postId?: StringFilter<"ModerationLog"> | string
    reviewerId?: StringFilter<"ModerationLog"> | string
    oldStatus?: StringFilter<"ModerationLog"> | string
    newStatus?: StringFilter<"ModerationLog"> | string
    decision?: StringFilter<"ModerationLog"> | string
    note?: StringNullableFilter<"ModerationLog"> | string | null
    createdAt?: DateTimeFilter<"ModerationLog"> | Date | string
  }

  export type AuditLogUpsertWithWhereUniqueWithoutPostInput = {
    where: AuditLogWhereUniqueInput
    update: XOR<AuditLogUpdateWithoutPostInput, AuditLogUncheckedUpdateWithoutPostInput>
    create: XOR<AuditLogCreateWithoutPostInput, AuditLogUncheckedCreateWithoutPostInput>
  }

  export type AuditLogUpdateWithWhereUniqueWithoutPostInput = {
    where: AuditLogWhereUniqueInput
    data: XOR<AuditLogUpdateWithoutPostInput, AuditLogUncheckedUpdateWithoutPostInput>
  }

  export type AuditLogUpdateManyWithWhereWithoutPostInput = {
    where: AuditLogScalarWhereInput
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyWithoutPostInput>
  }

  export type AuditLogScalarWhereInput = {
    AND?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
    OR?: AuditLogScalarWhereInput[]
    NOT?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
    id?: StringFilter<"AuditLog"> | string
    postId?: StringNullableFilter<"AuditLog"> | string | null
    actorId?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    entityType?: StringFilter<"AuditLog"> | string
    entityId?: StringFilter<"AuditLog"> | string
    metadata?: StringNullableFilter<"AuditLog"> | string | null
    ipAddress?: StringNullableFilter<"AuditLog"> | string | null
    userAgent?: StringNullableFilter<"AuditLog"> | string | null
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
  }

  export type PostCreateWithoutTagsInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    category?: CategoryCreateNestedOneWithoutPostsInput
    versions?: PostVersionCreateNestedManyWithoutPostInput
    translations_rel?: PostTranslationCreateNestedManyWithoutPostInput
    comments?: CommentCreateNestedManyWithoutPostInput
    moderationLogs?: ModerationLogCreateNestedManyWithoutPostInput
    auditLogs?: AuditLogCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateWithoutTagsInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    categoryId?: string | null
    versions?: PostVersionUncheckedCreateNestedManyWithoutPostInput
    translations_rel?: PostTranslationUncheckedCreateNestedManyWithoutPostInput
    comments?: CommentUncheckedCreateNestedManyWithoutPostInput
    moderationLogs?: ModerationLogUncheckedCreateNestedManyWithoutPostInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostCreateOrConnectWithoutTagsInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutTagsInput, PostUncheckedCreateWithoutTagsInput>
  }

  export type PostUpsertWithWhereUniqueWithoutTagsInput = {
    where: PostWhereUniqueInput
    update: XOR<PostUpdateWithoutTagsInput, PostUncheckedUpdateWithoutTagsInput>
    create: XOR<PostCreateWithoutTagsInput, PostUncheckedCreateWithoutTagsInput>
  }

  export type PostUpdateWithWhereUniqueWithoutTagsInput = {
    where: PostWhereUniqueInput
    data: XOR<PostUpdateWithoutTagsInput, PostUncheckedUpdateWithoutTagsInput>
  }

  export type PostUpdateManyWithWhereWithoutTagsInput = {
    where: PostScalarWhereInput
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyWithoutTagsInput>
  }

  export type PostCreateWithoutVersionsInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    category?: CategoryCreateNestedOneWithoutPostsInput
    tags?: TagCreateNestedManyWithoutPostsInput
    translations_rel?: PostTranslationCreateNestedManyWithoutPostInput
    comments?: CommentCreateNestedManyWithoutPostInput
    moderationLogs?: ModerationLogCreateNestedManyWithoutPostInput
    auditLogs?: AuditLogCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateWithoutVersionsInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    categoryId?: string | null
    tags?: TagUncheckedCreateNestedManyWithoutPostsInput
    translations_rel?: PostTranslationUncheckedCreateNestedManyWithoutPostInput
    comments?: CommentUncheckedCreateNestedManyWithoutPostInput
    moderationLogs?: ModerationLogUncheckedCreateNestedManyWithoutPostInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostCreateOrConnectWithoutVersionsInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutVersionsInput, PostUncheckedCreateWithoutVersionsInput>
  }

  export type PostUpsertWithoutVersionsInput = {
    update: XOR<PostUpdateWithoutVersionsInput, PostUncheckedUpdateWithoutVersionsInput>
    create: XOR<PostCreateWithoutVersionsInput, PostUncheckedCreateWithoutVersionsInput>
    where?: PostWhereInput
  }

  export type PostUpdateToOneWithWhereWithoutVersionsInput = {
    where?: PostWhereInput
    data: XOR<PostUpdateWithoutVersionsInput, PostUncheckedUpdateWithoutVersionsInput>
  }

  export type PostUpdateWithoutVersionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    category?: CategoryUpdateOneWithoutPostsNestedInput
    tags?: TagUpdateManyWithoutPostsNestedInput
    translations_rel?: PostTranslationUpdateManyWithoutPostNestedInput
    comments?: CommentUpdateManyWithoutPostNestedInput
    moderationLogs?: ModerationLogUpdateManyWithoutPostNestedInput
    auditLogs?: AuditLogUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutVersionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TagUncheckedUpdateManyWithoutPostsNestedInput
    translations_rel?: PostTranslationUncheckedUpdateManyWithoutPostNestedInput
    comments?: CommentUncheckedUpdateManyWithoutPostNestedInput
    moderationLogs?: ModerationLogUncheckedUpdateManyWithoutPostNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutPostNestedInput
  }

  export type PostCreateWithoutModerationLogsInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    category?: CategoryCreateNestedOneWithoutPostsInput
    tags?: TagCreateNestedManyWithoutPostsInput
    versions?: PostVersionCreateNestedManyWithoutPostInput
    translations_rel?: PostTranslationCreateNestedManyWithoutPostInput
    comments?: CommentCreateNestedManyWithoutPostInput
    auditLogs?: AuditLogCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateWithoutModerationLogsInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    categoryId?: string | null
    tags?: TagUncheckedCreateNestedManyWithoutPostsInput
    versions?: PostVersionUncheckedCreateNestedManyWithoutPostInput
    translations_rel?: PostTranslationUncheckedCreateNestedManyWithoutPostInput
    comments?: CommentUncheckedCreateNestedManyWithoutPostInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostCreateOrConnectWithoutModerationLogsInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutModerationLogsInput, PostUncheckedCreateWithoutModerationLogsInput>
  }

  export type PostUpsertWithoutModerationLogsInput = {
    update: XOR<PostUpdateWithoutModerationLogsInput, PostUncheckedUpdateWithoutModerationLogsInput>
    create: XOR<PostCreateWithoutModerationLogsInput, PostUncheckedCreateWithoutModerationLogsInput>
    where?: PostWhereInput
  }

  export type PostUpdateToOneWithWhereWithoutModerationLogsInput = {
    where?: PostWhereInput
    data: XOR<PostUpdateWithoutModerationLogsInput, PostUncheckedUpdateWithoutModerationLogsInput>
  }

  export type PostUpdateWithoutModerationLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    category?: CategoryUpdateOneWithoutPostsNestedInput
    tags?: TagUpdateManyWithoutPostsNestedInput
    versions?: PostVersionUpdateManyWithoutPostNestedInput
    translations_rel?: PostTranslationUpdateManyWithoutPostNestedInput
    comments?: CommentUpdateManyWithoutPostNestedInput
    auditLogs?: AuditLogUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutModerationLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TagUncheckedUpdateManyWithoutPostsNestedInput
    versions?: PostVersionUncheckedUpdateManyWithoutPostNestedInput
    translations_rel?: PostTranslationUncheckedUpdateManyWithoutPostNestedInput
    comments?: CommentUncheckedUpdateManyWithoutPostNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutPostNestedInput
  }

  export type PostCreateWithoutAuditLogsInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    category?: CategoryCreateNestedOneWithoutPostsInput
    tags?: TagCreateNestedManyWithoutPostsInput
    versions?: PostVersionCreateNestedManyWithoutPostInput
    translations_rel?: PostTranslationCreateNestedManyWithoutPostInput
    comments?: CommentCreateNestedManyWithoutPostInput
    moderationLogs?: ModerationLogCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateWithoutAuditLogsInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    categoryId?: string | null
    tags?: TagUncheckedCreateNestedManyWithoutPostsInput
    versions?: PostVersionUncheckedCreateNestedManyWithoutPostInput
    translations_rel?: PostTranslationUncheckedCreateNestedManyWithoutPostInput
    comments?: CommentUncheckedCreateNestedManyWithoutPostInput
    moderationLogs?: ModerationLogUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostCreateOrConnectWithoutAuditLogsInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutAuditLogsInput, PostUncheckedCreateWithoutAuditLogsInput>
  }

  export type PostUpsertWithoutAuditLogsInput = {
    update: XOR<PostUpdateWithoutAuditLogsInput, PostUncheckedUpdateWithoutAuditLogsInput>
    create: XOR<PostCreateWithoutAuditLogsInput, PostUncheckedCreateWithoutAuditLogsInput>
    where?: PostWhereInput
  }

  export type PostUpdateToOneWithWhereWithoutAuditLogsInput = {
    where?: PostWhereInput
    data: XOR<PostUpdateWithoutAuditLogsInput, PostUncheckedUpdateWithoutAuditLogsInput>
  }

  export type PostUpdateWithoutAuditLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    category?: CategoryUpdateOneWithoutPostsNestedInput
    tags?: TagUpdateManyWithoutPostsNestedInput
    versions?: PostVersionUpdateManyWithoutPostNestedInput
    translations_rel?: PostTranslationUpdateManyWithoutPostNestedInput
    comments?: CommentUpdateManyWithoutPostNestedInput
    moderationLogs?: ModerationLogUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutAuditLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TagUncheckedUpdateManyWithoutPostsNestedInput
    versions?: PostVersionUncheckedUpdateManyWithoutPostNestedInput
    translations_rel?: PostTranslationUncheckedUpdateManyWithoutPostNestedInput
    comments?: CommentUncheckedUpdateManyWithoutPostNestedInput
    moderationLogs?: ModerationLogUncheckedUpdateManyWithoutPostNestedInput
  }

  export type PostCreateWithoutTranslations_relInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    category?: CategoryCreateNestedOneWithoutPostsInput
    tags?: TagCreateNestedManyWithoutPostsInput
    versions?: PostVersionCreateNestedManyWithoutPostInput
    comments?: CommentCreateNestedManyWithoutPostInput
    moderationLogs?: ModerationLogCreateNestedManyWithoutPostInput
    auditLogs?: AuditLogCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateWithoutTranslations_relInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
    categoryId?: string | null
    tags?: TagUncheckedCreateNestedManyWithoutPostsInput
    versions?: PostVersionUncheckedCreateNestedManyWithoutPostInput
    comments?: CommentUncheckedCreateNestedManyWithoutPostInput
    moderationLogs?: ModerationLogUncheckedCreateNestedManyWithoutPostInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostCreateOrConnectWithoutTranslations_relInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutTranslations_relInput, PostUncheckedCreateWithoutTranslations_relInput>
  }

  export type PostUpsertWithoutTranslations_relInput = {
    update: XOR<PostUpdateWithoutTranslations_relInput, PostUncheckedUpdateWithoutTranslations_relInput>
    create: XOR<PostCreateWithoutTranslations_relInput, PostUncheckedCreateWithoutTranslations_relInput>
    where?: PostWhereInput
  }

  export type PostUpdateToOneWithWhereWithoutTranslations_relInput = {
    where?: PostWhereInput
    data: XOR<PostUpdateWithoutTranslations_relInput, PostUncheckedUpdateWithoutTranslations_relInput>
  }

  export type PostUpdateWithoutTranslations_relInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    category?: CategoryUpdateOneWithoutPostsNestedInput
    tags?: TagUpdateManyWithoutPostsNestedInput
    versions?: PostVersionUpdateManyWithoutPostNestedInput
    comments?: CommentUpdateManyWithoutPostNestedInput
    moderationLogs?: ModerationLogUpdateManyWithoutPostNestedInput
    auditLogs?: AuditLogUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutTranslations_relInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TagUncheckedUpdateManyWithoutPostsNestedInput
    versions?: PostVersionUncheckedUpdateManyWithoutPostNestedInput
    comments?: CommentUncheckedUpdateManyWithoutPostNestedInput
    moderationLogs?: ModerationLogUncheckedUpdateManyWithoutPostNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutPostNestedInput
  }

  export type CategoryCreateManyParentInput = {
    id?: string
    name: string
    slug: string
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    thumbnail?: string | null
    attachmentId?: string | null
    linkType?: string | null
    customUrl?: string | null
    target?: string | null
    orderIndex?: number
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: string | null
    metaDescription?: string | null
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PostCreateManyCategoryInput = {
    id?: string
    title: string
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    slug: string
    thumbnail?: string | null
    authorId: string
    status?: string
    currentVersion?: number
    isFeatured?: boolean
    isNotification?: boolean
    viewCount?: number
    isTranslated?: boolean
    isCommentAllowed?: boolean
    isDeleted?: boolean
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    deletedAt?: Date | string | null
  }

  export type CategoryUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    linkType?: NullableStringFieldUpdateOperationsInput | string | null
    customUrl?: NullableStringFieldUpdateOperationsInput | string | null
    target?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: CategoryUpdateManyWithoutParentNestedInput
    posts?: PostUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    linkType?: NullableStringFieldUpdateOperationsInput | string | null
    customUrl?: NullableStringFieldUpdateOperationsInput | string | null
    target?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput
    posts?: PostUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateManyWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    attachmentId?: NullableStringFieldUpdateOperationsInput | string | null
    linkType?: NullableStringFieldUpdateOperationsInput | string | null
    customUrl?: NullableStringFieldUpdateOperationsInput | string | null
    target?: NullableStringFieldUpdateOperationsInput | string | null
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tags?: TagUpdateManyWithoutPostsNestedInput
    versions?: PostVersionUpdateManyWithoutPostNestedInput
    translations_rel?: PostTranslationUpdateManyWithoutPostNestedInput
    comments?: CommentUpdateManyWithoutPostNestedInput
    moderationLogs?: ModerationLogUpdateManyWithoutPostNestedInput
    auditLogs?: AuditLogUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tags?: TagUncheckedUpdateManyWithoutPostsNestedInput
    versions?: PostVersionUncheckedUpdateManyWithoutPostNestedInput
    translations_rel?: PostTranslationUncheckedUpdateManyWithoutPostNestedInput
    comments?: CommentUncheckedUpdateManyWithoutPostNestedInput
    moderationLogs?: ModerationLogUncheckedUpdateManyWithoutPostNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CommentCreateManyParentInput = {
    id?: string
    content: string
    status?: string
    authorId?: string | null
    authorName?: string | null
    authorEmail?: string | null
    authorIp?: string | null
    postId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CommentUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    authorEmail?: NullableStringFieldUpdateOperationsInput | string | null
    authorIp?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    post?: PostUpdateOneRequiredWithoutCommentsNestedInput
    replies?: CommentUpdateManyWithoutParentNestedInput
  }

  export type CommentUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    authorEmail?: NullableStringFieldUpdateOperationsInput | string | null
    authorIp?: NullableStringFieldUpdateOperationsInput | string | null
    postId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    replies?: CommentUncheckedUpdateManyWithoutParentNestedInput
  }

  export type CommentUncheckedUpdateManyWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    authorEmail?: NullableStringFieldUpdateOperationsInput | string | null
    authorIp?: NullableStringFieldUpdateOperationsInput | string | null
    postId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortalMenuCreateManyParentInput = {
    id?: string
    name: string
    description?: string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: string | null
    link?: string | null
    order?: number
    isActive?: boolean
    target?: string
    type?: string
    referenceId?: string | null
    position?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PortalMenuUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    target?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: PortalMenuUpdateManyWithoutParentNestedInput
  }

  export type PortalMenuUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    target?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: PortalMenuUncheckedUpdateManyWithoutParentNestedInput
  }

  export type PortalMenuUncheckedUpdateManyWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    translations?: NullableJsonNullValueInput | InputJsonValue
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    target?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostVersionCreateManyPostInput = {
    id?: string
    version: number
    title: string
    description?: string | null
    content?: string | null
    editorId: string
    changeNote?: string | null
    createdAt?: Date | string
  }

  export type PostTranslationCreateManyPostInput = {
    id?: string
    langCode: string
    title: string
    slug?: string | null
    description?: string | null
    content?: string | null
    contentHtml?: string | null
    version?: number
    mainVersionRef: number
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CommentCreateManyPostInput = {
    id?: string
    content: string
    status?: string
    authorId?: string | null
    authorName?: string | null
    authorEmail?: string | null
    authorIp?: string | null
    parentId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ModerationLogCreateManyPostInput = {
    id?: string
    reviewerId: string
    oldStatus: string
    newStatus: string
    decision: string
    note?: string | null
    createdAt?: Date | string
  }

  export type AuditLogCreateManyPostInput = {
    id?: string
    actorId: string
    action: string
    entityType?: string
    entityId: string
    metadata?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type TagUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
  }

  export type TagUncheckedUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
  }

  export type TagUncheckedUpdateManyWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
  }

  export type PostVersionUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    editorId?: StringFieldUpdateOperationsInput | string
    changeNote?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostVersionUncheckedUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    editorId?: StringFieldUpdateOperationsInput | string
    changeNote?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostVersionUncheckedUpdateManyWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    version?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    editorId?: StringFieldUpdateOperationsInput | string
    changeNote?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostTranslationUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    langCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    version?: IntFieldUpdateOperationsInput | number
    mainVersionRef?: IntFieldUpdateOperationsInput | number
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostTranslationUncheckedUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    langCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    version?: IntFieldUpdateOperationsInput | number
    mainVersionRef?: IntFieldUpdateOperationsInput | number
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostTranslationUncheckedUpdateManyWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    langCode?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    version?: IntFieldUpdateOperationsInput | number
    mainVersionRef?: IntFieldUpdateOperationsInput | number
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    authorEmail?: NullableStringFieldUpdateOperationsInput | string | null
    authorIp?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: CommentUpdateOneWithoutRepliesNestedInput
    replies?: CommentUpdateManyWithoutParentNestedInput
  }

  export type CommentUncheckedUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    authorEmail?: NullableStringFieldUpdateOperationsInput | string | null
    authorIp?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    replies?: CommentUncheckedUpdateManyWithoutParentNestedInput
  }

  export type CommentUncheckedUpdateManyWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    authorId?: NullableStringFieldUpdateOperationsInput | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    authorEmail?: NullableStringFieldUpdateOperationsInput | string | null
    authorIp?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModerationLogUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    oldStatus?: StringFieldUpdateOperationsInput | string
    newStatus?: StringFieldUpdateOperationsInput | string
    decision?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModerationLogUncheckedUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    oldStatus?: StringFieldUpdateOperationsInput | string
    newStatus?: StringFieldUpdateOperationsInput | string
    decision?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModerationLogUncheckedUpdateManyWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    reviewerId?: StringFieldUpdateOperationsInput | string
    oldStatus?: StringFieldUpdateOperationsInput | string
    newStatus?: StringFieldUpdateOperationsInput | string
    decision?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entityType?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entityType?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entityType?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    metadata?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    category?: CategoryUpdateOneWithoutPostsNestedInput
    versions?: PostVersionUpdateManyWithoutPostNestedInput
    translations_rel?: PostTranslationUpdateManyWithoutPostNestedInput
    comments?: CommentUpdateManyWithoutPostNestedInput
    moderationLogs?: ModerationLogUpdateManyWithoutPostNestedInput
    auditLogs?: AuditLogUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    versions?: PostVersionUncheckedUpdateManyWithoutPostNestedInput
    translations_rel?: PostTranslationUncheckedUpdateManyWithoutPostNestedInput
    comments?: CommentUncheckedUpdateManyWithoutPostNestedInput
    moderationLogs?: ModerationLogUncheckedUpdateManyWithoutPostNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateManyWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    slug?: StringFieldUpdateOperationsInput | string
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentVersion?: IntFieldUpdateOperationsInput | number
    isFeatured?: BoolFieldUpdateOperationsInput | boolean
    isNotification?: BoolFieldUpdateOperationsInput | boolean
    viewCount?: IntFieldUpdateOperationsInput | number
    isTranslated?: BoolFieldUpdateOperationsInput | boolean
    isCommentAllowed?: BoolFieldUpdateOperationsInput | boolean
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}