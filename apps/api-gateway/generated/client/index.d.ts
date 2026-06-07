
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
 * Model ApiPermission
 * 
 */
export type ApiPermission = $Result.DefaultSelection<Prisma.$ApiPermissionPayload>
/**
 * Model ServiceEndpoint
 * 
 */
export type ServiceEndpoint = $Result.DefaultSelection<Prisma.$ServiceEndpointPayload>
/**
 * Model LgspIntegrationConfig
 * 
 */
export type LgspIntegrationConfig = $Result.DefaultSelection<Prisma.$LgspIntegrationConfigPayload>
/**
 * Model GatewayConfig
 * 
 */
export type GatewayConfig = $Result.DefaultSelection<Prisma.$GatewayConfigPayload>
/**
 * Model GatewayRoute
 * 
 */
export type GatewayRoute = $Result.DefaultSelection<Prisma.$GatewayRoutePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more ApiPermissions
 * const apiPermissions = await prisma.apiPermission.findMany()
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
   * // Fetch zero or more ApiPermissions
   * const apiPermissions = await prisma.apiPermission.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
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
   * `prisma.apiPermission`: Exposes CRUD operations for the **ApiPermission** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ApiPermissions
    * const apiPermissions = await prisma.apiPermission.findMany()
    * ```
    */
  get apiPermission(): Prisma.ApiPermissionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.serviceEndpoint`: Exposes CRUD operations for the **ServiceEndpoint** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ServiceEndpoints
    * const serviceEndpoints = await prisma.serviceEndpoint.findMany()
    * ```
    */
  get serviceEndpoint(): Prisma.ServiceEndpointDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.lgspIntegrationConfig`: Exposes CRUD operations for the **LgspIntegrationConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LgspIntegrationConfigs
    * const lgspIntegrationConfigs = await prisma.lgspIntegrationConfig.findMany()
    * ```
    */
  get lgspIntegrationConfig(): Prisma.LgspIntegrationConfigDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.gatewayConfig`: Exposes CRUD operations for the **GatewayConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GatewayConfigs
    * const gatewayConfigs = await prisma.gatewayConfig.findMany()
    * ```
    */
  get gatewayConfig(): Prisma.GatewayConfigDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.gatewayRoute`: Exposes CRUD operations for the **GatewayRoute** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GatewayRoutes
    * const gatewayRoutes = await prisma.gatewayRoute.findMany()
    * ```
    */
  get gatewayRoute(): Prisma.GatewayRouteDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 7.8.0
   * Query Engine version: 3c6e192761c0362d496ed980de936e2f3cebcd3a
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
      (Without<T, U> & U) | (Without<U, T> & T)
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
    ApiPermission: 'ApiPermission',
    ServiceEndpoint: 'ServiceEndpoint',
    LgspIntegrationConfig: 'LgspIntegrationConfig',
    GatewayConfig: 'GatewayConfig',
    GatewayRoute: 'GatewayRoute'
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
      modelProps: "apiPermission" | "serviceEndpoint" | "lgspIntegrationConfig" | "gatewayConfig" | "gatewayRoute"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ApiPermission: {
        payload: Prisma.$ApiPermissionPayload<ExtArgs>
        fields: Prisma.ApiPermissionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApiPermissionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPermissionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApiPermissionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPermissionPayload>
          }
          findFirst: {
            args: Prisma.ApiPermissionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPermissionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApiPermissionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPermissionPayload>
          }
          findMany: {
            args: Prisma.ApiPermissionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPermissionPayload>[]
          }
          create: {
            args: Prisma.ApiPermissionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPermissionPayload>
          }
          createMany: {
            args: Prisma.ApiPermissionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ApiPermissionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPermissionPayload>
          }
          update: {
            args: Prisma.ApiPermissionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPermissionPayload>
          }
          deleteMany: {
            args: Prisma.ApiPermissionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApiPermissionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ApiPermissionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPermissionPayload>
          }
          aggregate: {
            args: Prisma.ApiPermissionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApiPermission>
          }
          groupBy: {
            args: Prisma.ApiPermissionGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApiPermissionGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApiPermissionCountArgs<ExtArgs>
            result: $Utils.Optional<ApiPermissionCountAggregateOutputType> | number
          }
        }
      }
      ServiceEndpoint: {
        payload: Prisma.$ServiceEndpointPayload<ExtArgs>
        fields: Prisma.ServiceEndpointFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ServiceEndpointFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceEndpointPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ServiceEndpointFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceEndpointPayload>
          }
          findFirst: {
            args: Prisma.ServiceEndpointFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceEndpointPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ServiceEndpointFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceEndpointPayload>
          }
          findMany: {
            args: Prisma.ServiceEndpointFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceEndpointPayload>[]
          }
          create: {
            args: Prisma.ServiceEndpointCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceEndpointPayload>
          }
          createMany: {
            args: Prisma.ServiceEndpointCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ServiceEndpointDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceEndpointPayload>
          }
          update: {
            args: Prisma.ServiceEndpointUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceEndpointPayload>
          }
          deleteMany: {
            args: Prisma.ServiceEndpointDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ServiceEndpointUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ServiceEndpointUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceEndpointPayload>
          }
          aggregate: {
            args: Prisma.ServiceEndpointAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateServiceEndpoint>
          }
          groupBy: {
            args: Prisma.ServiceEndpointGroupByArgs<ExtArgs>
            result: $Utils.Optional<ServiceEndpointGroupByOutputType>[]
          }
          count: {
            args: Prisma.ServiceEndpointCountArgs<ExtArgs>
            result: $Utils.Optional<ServiceEndpointCountAggregateOutputType> | number
          }
        }
      }
      LgspIntegrationConfig: {
        payload: Prisma.$LgspIntegrationConfigPayload<ExtArgs>
        fields: Prisma.LgspIntegrationConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LgspIntegrationConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LgspIntegrationConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LgspIntegrationConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LgspIntegrationConfigPayload>
          }
          findFirst: {
            args: Prisma.LgspIntegrationConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LgspIntegrationConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LgspIntegrationConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LgspIntegrationConfigPayload>
          }
          findMany: {
            args: Prisma.LgspIntegrationConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LgspIntegrationConfigPayload>[]
          }
          create: {
            args: Prisma.LgspIntegrationConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LgspIntegrationConfigPayload>
          }
          createMany: {
            args: Prisma.LgspIntegrationConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.LgspIntegrationConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LgspIntegrationConfigPayload>
          }
          update: {
            args: Prisma.LgspIntegrationConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LgspIntegrationConfigPayload>
          }
          deleteMany: {
            args: Prisma.LgspIntegrationConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LgspIntegrationConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.LgspIntegrationConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LgspIntegrationConfigPayload>
          }
          aggregate: {
            args: Prisma.LgspIntegrationConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLgspIntegrationConfig>
          }
          groupBy: {
            args: Prisma.LgspIntegrationConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<LgspIntegrationConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.LgspIntegrationConfigCountArgs<ExtArgs>
            result: $Utils.Optional<LgspIntegrationConfigCountAggregateOutputType> | number
          }
        }
      }
      GatewayConfig: {
        payload: Prisma.$GatewayConfigPayload<ExtArgs>
        fields: Prisma.GatewayConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GatewayConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GatewayConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayConfigPayload>
          }
          findFirst: {
            args: Prisma.GatewayConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GatewayConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayConfigPayload>
          }
          findMany: {
            args: Prisma.GatewayConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayConfigPayload>[]
          }
          create: {
            args: Prisma.GatewayConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayConfigPayload>
          }
          createMany: {
            args: Prisma.GatewayConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.GatewayConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayConfigPayload>
          }
          update: {
            args: Prisma.GatewayConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayConfigPayload>
          }
          deleteMany: {
            args: Prisma.GatewayConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GatewayConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GatewayConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayConfigPayload>
          }
          aggregate: {
            args: Prisma.GatewayConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGatewayConfig>
          }
          groupBy: {
            args: Prisma.GatewayConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<GatewayConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.GatewayConfigCountArgs<ExtArgs>
            result: $Utils.Optional<GatewayConfigCountAggregateOutputType> | number
          }
        }
      }
      GatewayRoute: {
        payload: Prisma.$GatewayRoutePayload<ExtArgs>
        fields: Prisma.GatewayRouteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GatewayRouteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayRoutePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GatewayRouteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayRoutePayload>
          }
          findFirst: {
            args: Prisma.GatewayRouteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayRoutePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GatewayRouteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayRoutePayload>
          }
          findMany: {
            args: Prisma.GatewayRouteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayRoutePayload>[]
          }
          create: {
            args: Prisma.GatewayRouteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayRoutePayload>
          }
          createMany: {
            args: Prisma.GatewayRouteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.GatewayRouteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayRoutePayload>
          }
          update: {
            args: Prisma.GatewayRouteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayRoutePayload>
          }
          deleteMany: {
            args: Prisma.GatewayRouteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GatewayRouteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GatewayRouteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GatewayRoutePayload>
          }
          aggregate: {
            args: Prisma.GatewayRouteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGatewayRoute>
          }
          groupBy: {
            args: Prisma.GatewayRouteGroupByArgs<ExtArgs>
            result: $Utils.Optional<GatewayRouteGroupByOutputType>[]
          }
          count: {
            args: Prisma.GatewayRouteCountArgs<ExtArgs>
            result: $Utils.Optional<GatewayRouteCountAggregateOutputType> | number
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
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
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
    apiPermission?: ApiPermissionOmit
    serviceEndpoint?: ServiceEndpointOmit
    lgspIntegrationConfig?: LgspIntegrationConfigOmit
    gatewayConfig?: GatewayConfigOmit
    gatewayRoute?: GatewayRouteOmit
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
   * Count Type GatewayConfigCountOutputType
   */

  export type GatewayConfigCountOutputType = {
    routes: number
  }

  export type GatewayConfigCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    routes?: boolean | GatewayConfigCountOutputTypeCountRoutesArgs
  }

  // Custom InputTypes
  /**
   * GatewayConfigCountOutputType without action
   */
  export type GatewayConfigCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayConfigCountOutputType
     */
    select?: GatewayConfigCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GatewayConfigCountOutputType without action
   */
  export type GatewayConfigCountOutputTypeCountRoutesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GatewayRouteWhereInput
  }


  /**
   * Models
   */

  /**
   * Model ApiPermission
   */

  export type AggregateApiPermission = {
    _count: ApiPermissionCountAggregateOutputType | null
    _min: ApiPermissionMinAggregateOutputType | null
    _max: ApiPermissionMaxAggregateOutputType | null
  }

  export type ApiPermissionMinAggregateOutputType = {
    id: string | null
    path: string | null
    method: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ApiPermissionMaxAggregateOutputType = {
    id: string | null
    path: string | null
    method: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ApiPermissionCountAggregateOutputType = {
    id: number
    path: number
    method: number
    permissions: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ApiPermissionMinAggregateInputType = {
    id?: true
    path?: true
    method?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ApiPermissionMaxAggregateInputType = {
    id?: true
    path?: true
    method?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ApiPermissionCountAggregateInputType = {
    id?: true
    path?: true
    method?: true
    permissions?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ApiPermissionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiPermission to aggregate.
     */
    where?: ApiPermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiPermissions to fetch.
     */
    orderBy?: ApiPermissionOrderByWithRelationInput | ApiPermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApiPermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiPermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiPermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ApiPermissions
    **/
    _count?: true | ApiPermissionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApiPermissionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApiPermissionMaxAggregateInputType
  }

  export type GetApiPermissionAggregateType<T extends ApiPermissionAggregateArgs> = {
        [P in keyof T & keyof AggregateApiPermission]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApiPermission[P]>
      : GetScalarType<T[P], AggregateApiPermission[P]>
  }




  export type ApiPermissionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApiPermissionWhereInput
    orderBy?: ApiPermissionOrderByWithAggregationInput | ApiPermissionOrderByWithAggregationInput[]
    by: ApiPermissionScalarFieldEnum[] | ApiPermissionScalarFieldEnum
    having?: ApiPermissionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApiPermissionCountAggregateInputType | true
    _min?: ApiPermissionMinAggregateInputType
    _max?: ApiPermissionMaxAggregateInputType
  }

  export type ApiPermissionGroupByOutputType = {
    id: string
    path: string
    method: string
    permissions: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: ApiPermissionCountAggregateOutputType | null
    _min: ApiPermissionMinAggregateOutputType | null
    _max: ApiPermissionMaxAggregateOutputType | null
  }

  type GetApiPermissionGroupByPayload<T extends ApiPermissionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApiPermissionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApiPermissionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApiPermissionGroupByOutputType[P]>
            : GetScalarType<T[P], ApiPermissionGroupByOutputType[P]>
        }
      >
    >


  export type ApiPermissionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    path?: boolean
    method?: boolean
    permissions?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["apiPermission"]>



  export type ApiPermissionSelectScalar = {
    id?: boolean
    path?: boolean
    method?: boolean
    permissions?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ApiPermissionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "path" | "method" | "permissions" | "createdAt" | "updatedAt", ExtArgs["result"]["apiPermission"]>

  export type $ApiPermissionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ApiPermission"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      path: string
      method: string
      permissions: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["apiPermission"]>
    composites: {}
  }

  type ApiPermissionGetPayload<S extends boolean | null | undefined | ApiPermissionDefaultArgs> = $Result.GetResult<Prisma.$ApiPermissionPayload, S>

  type ApiPermissionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ApiPermissionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ApiPermissionCountAggregateInputType | true
    }

  export interface ApiPermissionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ApiPermission'], meta: { name: 'ApiPermission' } }
    /**
     * Find zero or one ApiPermission that matches the filter.
     * @param {ApiPermissionFindUniqueArgs} args - Arguments to find a ApiPermission
     * @example
     * // Get one ApiPermission
     * const apiPermission = await prisma.apiPermission.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApiPermissionFindUniqueArgs>(args: SelectSubset<T, ApiPermissionFindUniqueArgs<ExtArgs>>): Prisma__ApiPermissionClient<$Result.GetResult<Prisma.$ApiPermissionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ApiPermission that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApiPermissionFindUniqueOrThrowArgs} args - Arguments to find a ApiPermission
     * @example
     * // Get one ApiPermission
     * const apiPermission = await prisma.apiPermission.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApiPermissionFindUniqueOrThrowArgs>(args: SelectSubset<T, ApiPermissionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApiPermissionClient<$Result.GetResult<Prisma.$ApiPermissionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApiPermission that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiPermissionFindFirstArgs} args - Arguments to find a ApiPermission
     * @example
     * // Get one ApiPermission
     * const apiPermission = await prisma.apiPermission.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApiPermissionFindFirstArgs>(args?: SelectSubset<T, ApiPermissionFindFirstArgs<ExtArgs>>): Prisma__ApiPermissionClient<$Result.GetResult<Prisma.$ApiPermissionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApiPermission that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiPermissionFindFirstOrThrowArgs} args - Arguments to find a ApiPermission
     * @example
     * // Get one ApiPermission
     * const apiPermission = await prisma.apiPermission.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApiPermissionFindFirstOrThrowArgs>(args?: SelectSubset<T, ApiPermissionFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApiPermissionClient<$Result.GetResult<Prisma.$ApiPermissionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ApiPermissions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiPermissionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ApiPermissions
     * const apiPermissions = await prisma.apiPermission.findMany()
     * 
     * // Get first 10 ApiPermissions
     * const apiPermissions = await prisma.apiPermission.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const apiPermissionWithIdOnly = await prisma.apiPermission.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApiPermissionFindManyArgs>(args?: SelectSubset<T, ApiPermissionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiPermissionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ApiPermission.
     * @param {ApiPermissionCreateArgs} args - Arguments to create a ApiPermission.
     * @example
     * // Create one ApiPermission
     * const ApiPermission = await prisma.apiPermission.create({
     *   data: {
     *     // ... data to create a ApiPermission
     *   }
     * })
     * 
     */
    create<T extends ApiPermissionCreateArgs>(args: SelectSubset<T, ApiPermissionCreateArgs<ExtArgs>>): Prisma__ApiPermissionClient<$Result.GetResult<Prisma.$ApiPermissionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ApiPermissions.
     * @param {ApiPermissionCreateManyArgs} args - Arguments to create many ApiPermissions.
     * @example
     * // Create many ApiPermissions
     * const apiPermission = await prisma.apiPermission.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApiPermissionCreateManyArgs>(args?: SelectSubset<T, ApiPermissionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ApiPermission.
     * @param {ApiPermissionDeleteArgs} args - Arguments to delete one ApiPermission.
     * @example
     * // Delete one ApiPermission
     * const ApiPermission = await prisma.apiPermission.delete({
     *   where: {
     *     // ... filter to delete one ApiPermission
     *   }
     * })
     * 
     */
    delete<T extends ApiPermissionDeleteArgs>(args: SelectSubset<T, ApiPermissionDeleteArgs<ExtArgs>>): Prisma__ApiPermissionClient<$Result.GetResult<Prisma.$ApiPermissionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ApiPermission.
     * @param {ApiPermissionUpdateArgs} args - Arguments to update one ApiPermission.
     * @example
     * // Update one ApiPermission
     * const apiPermission = await prisma.apiPermission.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApiPermissionUpdateArgs>(args: SelectSubset<T, ApiPermissionUpdateArgs<ExtArgs>>): Prisma__ApiPermissionClient<$Result.GetResult<Prisma.$ApiPermissionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ApiPermissions.
     * @param {ApiPermissionDeleteManyArgs} args - Arguments to filter ApiPermissions to delete.
     * @example
     * // Delete a few ApiPermissions
     * const { count } = await prisma.apiPermission.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApiPermissionDeleteManyArgs>(args?: SelectSubset<T, ApiPermissionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApiPermissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiPermissionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ApiPermissions
     * const apiPermission = await prisma.apiPermission.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApiPermissionUpdateManyArgs>(args: SelectSubset<T, ApiPermissionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ApiPermission.
     * @param {ApiPermissionUpsertArgs} args - Arguments to update or create a ApiPermission.
     * @example
     * // Update or create a ApiPermission
     * const apiPermission = await prisma.apiPermission.upsert({
     *   create: {
     *     // ... data to create a ApiPermission
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ApiPermission we want to update
     *   }
     * })
     */
    upsert<T extends ApiPermissionUpsertArgs>(args: SelectSubset<T, ApiPermissionUpsertArgs<ExtArgs>>): Prisma__ApiPermissionClient<$Result.GetResult<Prisma.$ApiPermissionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ApiPermissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiPermissionCountArgs} args - Arguments to filter ApiPermissions to count.
     * @example
     * // Count the number of ApiPermissions
     * const count = await prisma.apiPermission.count({
     *   where: {
     *     // ... the filter for the ApiPermissions we want to count
     *   }
     * })
    **/
    count<T extends ApiPermissionCountArgs>(
      args?: Subset<T, ApiPermissionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApiPermissionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ApiPermission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiPermissionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ApiPermissionAggregateArgs>(args: Subset<T, ApiPermissionAggregateArgs>): Prisma.PrismaPromise<GetApiPermissionAggregateType<T>>

    /**
     * Group by ApiPermission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiPermissionGroupByArgs} args - Group by arguments.
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
      T extends ApiPermissionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApiPermissionGroupByArgs['orderBy'] }
        : { orderBy?: ApiPermissionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ApiPermissionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApiPermissionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ApiPermission model
   */
  readonly fields: ApiPermissionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ApiPermission.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApiPermissionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ApiPermission model
   */
  interface ApiPermissionFieldRefs {
    readonly id: FieldRef<"ApiPermission", 'String'>
    readonly path: FieldRef<"ApiPermission", 'String'>
    readonly method: FieldRef<"ApiPermission", 'String'>
    readonly permissions: FieldRef<"ApiPermission", 'Json'>
    readonly createdAt: FieldRef<"ApiPermission", 'DateTime'>
    readonly updatedAt: FieldRef<"ApiPermission", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ApiPermission findUnique
   */
  export type ApiPermissionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPermission
     */
    select?: ApiPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPermission
     */
    omit?: ApiPermissionOmit<ExtArgs> | null
    /**
     * Filter, which ApiPermission to fetch.
     */
    where: ApiPermissionWhereUniqueInput
  }

  /**
   * ApiPermission findUniqueOrThrow
   */
  export type ApiPermissionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPermission
     */
    select?: ApiPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPermission
     */
    omit?: ApiPermissionOmit<ExtArgs> | null
    /**
     * Filter, which ApiPermission to fetch.
     */
    where: ApiPermissionWhereUniqueInput
  }

  /**
   * ApiPermission findFirst
   */
  export type ApiPermissionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPermission
     */
    select?: ApiPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPermission
     */
    omit?: ApiPermissionOmit<ExtArgs> | null
    /**
     * Filter, which ApiPermission to fetch.
     */
    where?: ApiPermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiPermissions to fetch.
     */
    orderBy?: ApiPermissionOrderByWithRelationInput | ApiPermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiPermissions.
     */
    cursor?: ApiPermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiPermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiPermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiPermissions.
     */
    distinct?: ApiPermissionScalarFieldEnum | ApiPermissionScalarFieldEnum[]
  }

  /**
   * ApiPermission findFirstOrThrow
   */
  export type ApiPermissionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPermission
     */
    select?: ApiPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPermission
     */
    omit?: ApiPermissionOmit<ExtArgs> | null
    /**
     * Filter, which ApiPermission to fetch.
     */
    where?: ApiPermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiPermissions to fetch.
     */
    orderBy?: ApiPermissionOrderByWithRelationInput | ApiPermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiPermissions.
     */
    cursor?: ApiPermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiPermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiPermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiPermissions.
     */
    distinct?: ApiPermissionScalarFieldEnum | ApiPermissionScalarFieldEnum[]
  }

  /**
   * ApiPermission findMany
   */
  export type ApiPermissionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPermission
     */
    select?: ApiPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPermission
     */
    omit?: ApiPermissionOmit<ExtArgs> | null
    /**
     * Filter, which ApiPermissions to fetch.
     */
    where?: ApiPermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiPermissions to fetch.
     */
    orderBy?: ApiPermissionOrderByWithRelationInput | ApiPermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ApiPermissions.
     */
    cursor?: ApiPermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiPermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiPermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiPermissions.
     */
    distinct?: ApiPermissionScalarFieldEnum | ApiPermissionScalarFieldEnum[]
  }

  /**
   * ApiPermission create
   */
  export type ApiPermissionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPermission
     */
    select?: ApiPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPermission
     */
    omit?: ApiPermissionOmit<ExtArgs> | null
    /**
     * The data needed to create a ApiPermission.
     */
    data: XOR<ApiPermissionCreateInput, ApiPermissionUncheckedCreateInput>
  }

  /**
   * ApiPermission createMany
   */
  export type ApiPermissionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ApiPermissions.
     */
    data: ApiPermissionCreateManyInput | ApiPermissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ApiPermission update
   */
  export type ApiPermissionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPermission
     */
    select?: ApiPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPermission
     */
    omit?: ApiPermissionOmit<ExtArgs> | null
    /**
     * The data needed to update a ApiPermission.
     */
    data: XOR<ApiPermissionUpdateInput, ApiPermissionUncheckedUpdateInput>
    /**
     * Choose, which ApiPermission to update.
     */
    where: ApiPermissionWhereUniqueInput
  }

  /**
   * ApiPermission updateMany
   */
  export type ApiPermissionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ApiPermissions.
     */
    data: XOR<ApiPermissionUpdateManyMutationInput, ApiPermissionUncheckedUpdateManyInput>
    /**
     * Filter which ApiPermissions to update
     */
    where?: ApiPermissionWhereInput
    /**
     * Limit how many ApiPermissions to update.
     */
    limit?: number
  }

  /**
   * ApiPermission upsert
   */
  export type ApiPermissionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPermission
     */
    select?: ApiPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPermission
     */
    omit?: ApiPermissionOmit<ExtArgs> | null
    /**
     * The filter to search for the ApiPermission to update in case it exists.
     */
    where: ApiPermissionWhereUniqueInput
    /**
     * In case the ApiPermission found by the `where` argument doesn't exist, create a new ApiPermission with this data.
     */
    create: XOR<ApiPermissionCreateInput, ApiPermissionUncheckedCreateInput>
    /**
     * In case the ApiPermission was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApiPermissionUpdateInput, ApiPermissionUncheckedUpdateInput>
  }

  /**
   * ApiPermission delete
   */
  export type ApiPermissionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPermission
     */
    select?: ApiPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPermission
     */
    omit?: ApiPermissionOmit<ExtArgs> | null
    /**
     * Filter which ApiPermission to delete.
     */
    where: ApiPermissionWhereUniqueInput
  }

  /**
   * ApiPermission deleteMany
   */
  export type ApiPermissionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiPermissions to delete
     */
    where?: ApiPermissionWhereInput
    /**
     * Limit how many ApiPermissions to delete.
     */
    limit?: number
  }

  /**
   * ApiPermission without action
   */
  export type ApiPermissionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPermission
     */
    select?: ApiPermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPermission
     */
    omit?: ApiPermissionOmit<ExtArgs> | null
  }


  /**
   * Model ServiceEndpoint
   */

  export type AggregateServiceEndpoint = {
    _count: ServiceEndpointCountAggregateOutputType | null
    _min: ServiceEndpointMinAggregateOutputType | null
    _max: ServiceEndpointMaxAggregateOutputType | null
  }

  export type ServiceEndpointMinAggregateOutputType = {
    id: string | null
    serviceName: string | null
    endpoint: string | null
    status: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ServiceEndpointMaxAggregateOutputType = {
    id: string | null
    serviceName: string | null
    endpoint: string | null
    status: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ServiceEndpointCountAggregateOutputType = {
    id: number
    serviceName: number
    endpoint: number
    status: number
    description: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ServiceEndpointMinAggregateInputType = {
    id?: true
    serviceName?: true
    endpoint?: true
    status?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ServiceEndpointMaxAggregateInputType = {
    id?: true
    serviceName?: true
    endpoint?: true
    status?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ServiceEndpointCountAggregateInputType = {
    id?: true
    serviceName?: true
    endpoint?: true
    status?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ServiceEndpointAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ServiceEndpoint to aggregate.
     */
    where?: ServiceEndpointWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServiceEndpoints to fetch.
     */
    orderBy?: ServiceEndpointOrderByWithRelationInput | ServiceEndpointOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ServiceEndpointWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServiceEndpoints from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServiceEndpoints.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ServiceEndpoints
    **/
    _count?: true | ServiceEndpointCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ServiceEndpointMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ServiceEndpointMaxAggregateInputType
  }

  export type GetServiceEndpointAggregateType<T extends ServiceEndpointAggregateArgs> = {
        [P in keyof T & keyof AggregateServiceEndpoint]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateServiceEndpoint[P]>
      : GetScalarType<T[P], AggregateServiceEndpoint[P]>
  }




  export type ServiceEndpointGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ServiceEndpointWhereInput
    orderBy?: ServiceEndpointOrderByWithAggregationInput | ServiceEndpointOrderByWithAggregationInput[]
    by: ServiceEndpointScalarFieldEnum[] | ServiceEndpointScalarFieldEnum
    having?: ServiceEndpointScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ServiceEndpointCountAggregateInputType | true
    _min?: ServiceEndpointMinAggregateInputType
    _max?: ServiceEndpointMaxAggregateInputType
  }

  export type ServiceEndpointGroupByOutputType = {
    id: string
    serviceName: string
    endpoint: string
    status: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    _count: ServiceEndpointCountAggregateOutputType | null
    _min: ServiceEndpointMinAggregateOutputType | null
    _max: ServiceEndpointMaxAggregateOutputType | null
  }

  type GetServiceEndpointGroupByPayload<T extends ServiceEndpointGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ServiceEndpointGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ServiceEndpointGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ServiceEndpointGroupByOutputType[P]>
            : GetScalarType<T[P], ServiceEndpointGroupByOutputType[P]>
        }
      >
    >


  export type ServiceEndpointSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    serviceName?: boolean
    endpoint?: boolean
    status?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["serviceEndpoint"]>



  export type ServiceEndpointSelectScalar = {
    id?: boolean
    serviceName?: boolean
    endpoint?: boolean
    status?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ServiceEndpointOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "serviceName" | "endpoint" | "status" | "description" | "createdAt" | "updatedAt", ExtArgs["result"]["serviceEndpoint"]>

  export type $ServiceEndpointPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ServiceEndpoint"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      serviceName: string
      endpoint: string
      status: string
      description: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["serviceEndpoint"]>
    composites: {}
  }

  type ServiceEndpointGetPayload<S extends boolean | null | undefined | ServiceEndpointDefaultArgs> = $Result.GetResult<Prisma.$ServiceEndpointPayload, S>

  type ServiceEndpointCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ServiceEndpointFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ServiceEndpointCountAggregateInputType | true
    }

  export interface ServiceEndpointDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ServiceEndpoint'], meta: { name: 'ServiceEndpoint' } }
    /**
     * Find zero or one ServiceEndpoint that matches the filter.
     * @param {ServiceEndpointFindUniqueArgs} args - Arguments to find a ServiceEndpoint
     * @example
     * // Get one ServiceEndpoint
     * const serviceEndpoint = await prisma.serviceEndpoint.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ServiceEndpointFindUniqueArgs>(args: SelectSubset<T, ServiceEndpointFindUniqueArgs<ExtArgs>>): Prisma__ServiceEndpointClient<$Result.GetResult<Prisma.$ServiceEndpointPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ServiceEndpoint that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ServiceEndpointFindUniqueOrThrowArgs} args - Arguments to find a ServiceEndpoint
     * @example
     * // Get one ServiceEndpoint
     * const serviceEndpoint = await prisma.serviceEndpoint.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ServiceEndpointFindUniqueOrThrowArgs>(args: SelectSubset<T, ServiceEndpointFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ServiceEndpointClient<$Result.GetResult<Prisma.$ServiceEndpointPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ServiceEndpoint that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceEndpointFindFirstArgs} args - Arguments to find a ServiceEndpoint
     * @example
     * // Get one ServiceEndpoint
     * const serviceEndpoint = await prisma.serviceEndpoint.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ServiceEndpointFindFirstArgs>(args?: SelectSubset<T, ServiceEndpointFindFirstArgs<ExtArgs>>): Prisma__ServiceEndpointClient<$Result.GetResult<Prisma.$ServiceEndpointPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ServiceEndpoint that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceEndpointFindFirstOrThrowArgs} args - Arguments to find a ServiceEndpoint
     * @example
     * // Get one ServiceEndpoint
     * const serviceEndpoint = await prisma.serviceEndpoint.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ServiceEndpointFindFirstOrThrowArgs>(args?: SelectSubset<T, ServiceEndpointFindFirstOrThrowArgs<ExtArgs>>): Prisma__ServiceEndpointClient<$Result.GetResult<Prisma.$ServiceEndpointPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ServiceEndpoints that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceEndpointFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ServiceEndpoints
     * const serviceEndpoints = await prisma.serviceEndpoint.findMany()
     * 
     * // Get first 10 ServiceEndpoints
     * const serviceEndpoints = await prisma.serviceEndpoint.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const serviceEndpointWithIdOnly = await prisma.serviceEndpoint.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ServiceEndpointFindManyArgs>(args?: SelectSubset<T, ServiceEndpointFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServiceEndpointPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ServiceEndpoint.
     * @param {ServiceEndpointCreateArgs} args - Arguments to create a ServiceEndpoint.
     * @example
     * // Create one ServiceEndpoint
     * const ServiceEndpoint = await prisma.serviceEndpoint.create({
     *   data: {
     *     // ... data to create a ServiceEndpoint
     *   }
     * })
     * 
     */
    create<T extends ServiceEndpointCreateArgs>(args: SelectSubset<T, ServiceEndpointCreateArgs<ExtArgs>>): Prisma__ServiceEndpointClient<$Result.GetResult<Prisma.$ServiceEndpointPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ServiceEndpoints.
     * @param {ServiceEndpointCreateManyArgs} args - Arguments to create many ServiceEndpoints.
     * @example
     * // Create many ServiceEndpoints
     * const serviceEndpoint = await prisma.serviceEndpoint.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ServiceEndpointCreateManyArgs>(args?: SelectSubset<T, ServiceEndpointCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ServiceEndpoint.
     * @param {ServiceEndpointDeleteArgs} args - Arguments to delete one ServiceEndpoint.
     * @example
     * // Delete one ServiceEndpoint
     * const ServiceEndpoint = await prisma.serviceEndpoint.delete({
     *   where: {
     *     // ... filter to delete one ServiceEndpoint
     *   }
     * })
     * 
     */
    delete<T extends ServiceEndpointDeleteArgs>(args: SelectSubset<T, ServiceEndpointDeleteArgs<ExtArgs>>): Prisma__ServiceEndpointClient<$Result.GetResult<Prisma.$ServiceEndpointPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ServiceEndpoint.
     * @param {ServiceEndpointUpdateArgs} args - Arguments to update one ServiceEndpoint.
     * @example
     * // Update one ServiceEndpoint
     * const serviceEndpoint = await prisma.serviceEndpoint.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ServiceEndpointUpdateArgs>(args: SelectSubset<T, ServiceEndpointUpdateArgs<ExtArgs>>): Prisma__ServiceEndpointClient<$Result.GetResult<Prisma.$ServiceEndpointPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ServiceEndpoints.
     * @param {ServiceEndpointDeleteManyArgs} args - Arguments to filter ServiceEndpoints to delete.
     * @example
     * // Delete a few ServiceEndpoints
     * const { count } = await prisma.serviceEndpoint.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ServiceEndpointDeleteManyArgs>(args?: SelectSubset<T, ServiceEndpointDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ServiceEndpoints.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceEndpointUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ServiceEndpoints
     * const serviceEndpoint = await prisma.serviceEndpoint.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ServiceEndpointUpdateManyArgs>(args: SelectSubset<T, ServiceEndpointUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ServiceEndpoint.
     * @param {ServiceEndpointUpsertArgs} args - Arguments to update or create a ServiceEndpoint.
     * @example
     * // Update or create a ServiceEndpoint
     * const serviceEndpoint = await prisma.serviceEndpoint.upsert({
     *   create: {
     *     // ... data to create a ServiceEndpoint
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ServiceEndpoint we want to update
     *   }
     * })
     */
    upsert<T extends ServiceEndpointUpsertArgs>(args: SelectSubset<T, ServiceEndpointUpsertArgs<ExtArgs>>): Prisma__ServiceEndpointClient<$Result.GetResult<Prisma.$ServiceEndpointPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ServiceEndpoints.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceEndpointCountArgs} args - Arguments to filter ServiceEndpoints to count.
     * @example
     * // Count the number of ServiceEndpoints
     * const count = await prisma.serviceEndpoint.count({
     *   where: {
     *     // ... the filter for the ServiceEndpoints we want to count
     *   }
     * })
    **/
    count<T extends ServiceEndpointCountArgs>(
      args?: Subset<T, ServiceEndpointCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ServiceEndpointCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ServiceEndpoint.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceEndpointAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ServiceEndpointAggregateArgs>(args: Subset<T, ServiceEndpointAggregateArgs>): Prisma.PrismaPromise<GetServiceEndpointAggregateType<T>>

    /**
     * Group by ServiceEndpoint.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceEndpointGroupByArgs} args - Group by arguments.
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
      T extends ServiceEndpointGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ServiceEndpointGroupByArgs['orderBy'] }
        : { orderBy?: ServiceEndpointGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ServiceEndpointGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetServiceEndpointGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ServiceEndpoint model
   */
  readonly fields: ServiceEndpointFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ServiceEndpoint.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ServiceEndpointClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ServiceEndpoint model
   */
  interface ServiceEndpointFieldRefs {
    readonly id: FieldRef<"ServiceEndpoint", 'String'>
    readonly serviceName: FieldRef<"ServiceEndpoint", 'String'>
    readonly endpoint: FieldRef<"ServiceEndpoint", 'String'>
    readonly status: FieldRef<"ServiceEndpoint", 'String'>
    readonly description: FieldRef<"ServiceEndpoint", 'String'>
    readonly createdAt: FieldRef<"ServiceEndpoint", 'DateTime'>
    readonly updatedAt: FieldRef<"ServiceEndpoint", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ServiceEndpoint findUnique
   */
  export type ServiceEndpointFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceEndpoint
     */
    select?: ServiceEndpointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceEndpoint
     */
    omit?: ServiceEndpointOmit<ExtArgs> | null
    /**
     * Filter, which ServiceEndpoint to fetch.
     */
    where: ServiceEndpointWhereUniqueInput
  }

  /**
   * ServiceEndpoint findUniqueOrThrow
   */
  export type ServiceEndpointFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceEndpoint
     */
    select?: ServiceEndpointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceEndpoint
     */
    omit?: ServiceEndpointOmit<ExtArgs> | null
    /**
     * Filter, which ServiceEndpoint to fetch.
     */
    where: ServiceEndpointWhereUniqueInput
  }

  /**
   * ServiceEndpoint findFirst
   */
  export type ServiceEndpointFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceEndpoint
     */
    select?: ServiceEndpointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceEndpoint
     */
    omit?: ServiceEndpointOmit<ExtArgs> | null
    /**
     * Filter, which ServiceEndpoint to fetch.
     */
    where?: ServiceEndpointWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServiceEndpoints to fetch.
     */
    orderBy?: ServiceEndpointOrderByWithRelationInput | ServiceEndpointOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ServiceEndpoints.
     */
    cursor?: ServiceEndpointWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServiceEndpoints from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServiceEndpoints.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ServiceEndpoints.
     */
    distinct?: ServiceEndpointScalarFieldEnum | ServiceEndpointScalarFieldEnum[]
  }

  /**
   * ServiceEndpoint findFirstOrThrow
   */
  export type ServiceEndpointFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceEndpoint
     */
    select?: ServiceEndpointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceEndpoint
     */
    omit?: ServiceEndpointOmit<ExtArgs> | null
    /**
     * Filter, which ServiceEndpoint to fetch.
     */
    where?: ServiceEndpointWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServiceEndpoints to fetch.
     */
    orderBy?: ServiceEndpointOrderByWithRelationInput | ServiceEndpointOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ServiceEndpoints.
     */
    cursor?: ServiceEndpointWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServiceEndpoints from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServiceEndpoints.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ServiceEndpoints.
     */
    distinct?: ServiceEndpointScalarFieldEnum | ServiceEndpointScalarFieldEnum[]
  }

  /**
   * ServiceEndpoint findMany
   */
  export type ServiceEndpointFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceEndpoint
     */
    select?: ServiceEndpointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceEndpoint
     */
    omit?: ServiceEndpointOmit<ExtArgs> | null
    /**
     * Filter, which ServiceEndpoints to fetch.
     */
    where?: ServiceEndpointWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServiceEndpoints to fetch.
     */
    orderBy?: ServiceEndpointOrderByWithRelationInput | ServiceEndpointOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ServiceEndpoints.
     */
    cursor?: ServiceEndpointWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServiceEndpoints from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServiceEndpoints.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ServiceEndpoints.
     */
    distinct?: ServiceEndpointScalarFieldEnum | ServiceEndpointScalarFieldEnum[]
  }

  /**
   * ServiceEndpoint create
   */
  export type ServiceEndpointCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceEndpoint
     */
    select?: ServiceEndpointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceEndpoint
     */
    omit?: ServiceEndpointOmit<ExtArgs> | null
    /**
     * The data needed to create a ServiceEndpoint.
     */
    data: XOR<ServiceEndpointCreateInput, ServiceEndpointUncheckedCreateInput>
  }

  /**
   * ServiceEndpoint createMany
   */
  export type ServiceEndpointCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ServiceEndpoints.
     */
    data: ServiceEndpointCreateManyInput | ServiceEndpointCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ServiceEndpoint update
   */
  export type ServiceEndpointUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceEndpoint
     */
    select?: ServiceEndpointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceEndpoint
     */
    omit?: ServiceEndpointOmit<ExtArgs> | null
    /**
     * The data needed to update a ServiceEndpoint.
     */
    data: XOR<ServiceEndpointUpdateInput, ServiceEndpointUncheckedUpdateInput>
    /**
     * Choose, which ServiceEndpoint to update.
     */
    where: ServiceEndpointWhereUniqueInput
  }

  /**
   * ServiceEndpoint updateMany
   */
  export type ServiceEndpointUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ServiceEndpoints.
     */
    data: XOR<ServiceEndpointUpdateManyMutationInput, ServiceEndpointUncheckedUpdateManyInput>
    /**
     * Filter which ServiceEndpoints to update
     */
    where?: ServiceEndpointWhereInput
    /**
     * Limit how many ServiceEndpoints to update.
     */
    limit?: number
  }

  /**
   * ServiceEndpoint upsert
   */
  export type ServiceEndpointUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceEndpoint
     */
    select?: ServiceEndpointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceEndpoint
     */
    omit?: ServiceEndpointOmit<ExtArgs> | null
    /**
     * The filter to search for the ServiceEndpoint to update in case it exists.
     */
    where: ServiceEndpointWhereUniqueInput
    /**
     * In case the ServiceEndpoint found by the `where` argument doesn't exist, create a new ServiceEndpoint with this data.
     */
    create: XOR<ServiceEndpointCreateInput, ServiceEndpointUncheckedCreateInput>
    /**
     * In case the ServiceEndpoint was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ServiceEndpointUpdateInput, ServiceEndpointUncheckedUpdateInput>
  }

  /**
   * ServiceEndpoint delete
   */
  export type ServiceEndpointDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceEndpoint
     */
    select?: ServiceEndpointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceEndpoint
     */
    omit?: ServiceEndpointOmit<ExtArgs> | null
    /**
     * Filter which ServiceEndpoint to delete.
     */
    where: ServiceEndpointWhereUniqueInput
  }

  /**
   * ServiceEndpoint deleteMany
   */
  export type ServiceEndpointDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ServiceEndpoints to delete
     */
    where?: ServiceEndpointWhereInput
    /**
     * Limit how many ServiceEndpoints to delete.
     */
    limit?: number
  }

  /**
   * ServiceEndpoint without action
   */
  export type ServiceEndpointDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceEndpoint
     */
    select?: ServiceEndpointSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ServiceEndpoint
     */
    omit?: ServiceEndpointOmit<ExtArgs> | null
  }


  /**
   * Model LgspIntegrationConfig
   */

  export type AggregateLgspIntegrationConfig = {
    _count: LgspIntegrationConfigCountAggregateOutputType | null
    _min: LgspIntegrationConfigMinAggregateOutputType | null
    _max: LgspIntegrationConfigMaxAggregateOutputType | null
  }

  export type LgspIntegrationConfigMinAggregateOutputType = {
    id: string | null
    name: string | null
    serviceCode: string | null
    apiUrl: string | null
    authType: string | null
    authUrl: string | null
    tokenPath: string | null
    cachedToken: string | null
    tokenExpiresAt: Date | null
    requestMethod: string | null
    displayType: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LgspIntegrationConfigMaxAggregateOutputType = {
    id: string | null
    name: string | null
    serviceCode: string | null
    apiUrl: string | null
    authType: string | null
    authUrl: string | null
    tokenPath: string | null
    cachedToken: string | null
    tokenExpiresAt: Date | null
    requestMethod: string | null
    displayType: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LgspIntegrationConfigCountAggregateOutputType = {
    id: number
    name: number
    serviceCode: number
    apiUrl: number
    authType: number
    authUrl: number
    authPayload: number
    tokenPath: number
    cachedToken: number
    tokenExpiresAt: number
    requestMethod: number
    requestParams: number
    displayType: number
    chartConfig: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type LgspIntegrationConfigMinAggregateInputType = {
    id?: true
    name?: true
    serviceCode?: true
    apiUrl?: true
    authType?: true
    authUrl?: true
    tokenPath?: true
    cachedToken?: true
    tokenExpiresAt?: true
    requestMethod?: true
    displayType?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LgspIntegrationConfigMaxAggregateInputType = {
    id?: true
    name?: true
    serviceCode?: true
    apiUrl?: true
    authType?: true
    authUrl?: true
    tokenPath?: true
    cachedToken?: true
    tokenExpiresAt?: true
    requestMethod?: true
    displayType?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LgspIntegrationConfigCountAggregateInputType = {
    id?: true
    name?: true
    serviceCode?: true
    apiUrl?: true
    authType?: true
    authUrl?: true
    authPayload?: true
    tokenPath?: true
    cachedToken?: true
    tokenExpiresAt?: true
    requestMethod?: true
    requestParams?: true
    displayType?: true
    chartConfig?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type LgspIntegrationConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LgspIntegrationConfig to aggregate.
     */
    where?: LgspIntegrationConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LgspIntegrationConfigs to fetch.
     */
    orderBy?: LgspIntegrationConfigOrderByWithRelationInput | LgspIntegrationConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LgspIntegrationConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LgspIntegrationConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LgspIntegrationConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LgspIntegrationConfigs
    **/
    _count?: true | LgspIntegrationConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LgspIntegrationConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LgspIntegrationConfigMaxAggregateInputType
  }

  export type GetLgspIntegrationConfigAggregateType<T extends LgspIntegrationConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateLgspIntegrationConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLgspIntegrationConfig[P]>
      : GetScalarType<T[P], AggregateLgspIntegrationConfig[P]>
  }




  export type LgspIntegrationConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LgspIntegrationConfigWhereInput
    orderBy?: LgspIntegrationConfigOrderByWithAggregationInput | LgspIntegrationConfigOrderByWithAggregationInput[]
    by: LgspIntegrationConfigScalarFieldEnum[] | LgspIntegrationConfigScalarFieldEnum
    having?: LgspIntegrationConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LgspIntegrationConfigCountAggregateInputType | true
    _min?: LgspIntegrationConfigMinAggregateInputType
    _max?: LgspIntegrationConfigMaxAggregateInputType
  }

  export type LgspIntegrationConfigGroupByOutputType = {
    id: string
    name: string
    serviceCode: string
    apiUrl: string
    authType: string
    authUrl: string | null
    authPayload: JsonValue | null
    tokenPath: string | null
    cachedToken: string | null
    tokenExpiresAt: Date | null
    requestMethod: string
    requestParams: JsonValue | null
    displayType: string
    chartConfig: JsonValue | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: LgspIntegrationConfigCountAggregateOutputType | null
    _min: LgspIntegrationConfigMinAggregateOutputType | null
    _max: LgspIntegrationConfigMaxAggregateOutputType | null
  }

  type GetLgspIntegrationConfigGroupByPayload<T extends LgspIntegrationConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LgspIntegrationConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LgspIntegrationConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LgspIntegrationConfigGroupByOutputType[P]>
            : GetScalarType<T[P], LgspIntegrationConfigGroupByOutputType[P]>
        }
      >
    >


  export type LgspIntegrationConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    serviceCode?: boolean
    apiUrl?: boolean
    authType?: boolean
    authUrl?: boolean
    authPayload?: boolean
    tokenPath?: boolean
    cachedToken?: boolean
    tokenExpiresAt?: boolean
    requestMethod?: boolean
    requestParams?: boolean
    displayType?: boolean
    chartConfig?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["lgspIntegrationConfig"]>



  export type LgspIntegrationConfigSelectScalar = {
    id?: boolean
    name?: boolean
    serviceCode?: boolean
    apiUrl?: boolean
    authType?: boolean
    authUrl?: boolean
    authPayload?: boolean
    tokenPath?: boolean
    cachedToken?: boolean
    tokenExpiresAt?: boolean
    requestMethod?: boolean
    requestParams?: boolean
    displayType?: boolean
    chartConfig?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type LgspIntegrationConfigOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "serviceCode" | "apiUrl" | "authType" | "authUrl" | "authPayload" | "tokenPath" | "cachedToken" | "tokenExpiresAt" | "requestMethod" | "requestParams" | "displayType" | "chartConfig" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["lgspIntegrationConfig"]>

  export type $LgspIntegrationConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LgspIntegrationConfig"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      serviceCode: string
      apiUrl: string
      authType: string
      authUrl: string | null
      authPayload: Prisma.JsonValue | null
      tokenPath: string | null
      cachedToken: string | null
      tokenExpiresAt: Date | null
      requestMethod: string
      requestParams: Prisma.JsonValue | null
      displayType: string
      chartConfig: Prisma.JsonValue | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["lgspIntegrationConfig"]>
    composites: {}
  }

  type LgspIntegrationConfigGetPayload<S extends boolean | null | undefined | LgspIntegrationConfigDefaultArgs> = $Result.GetResult<Prisma.$LgspIntegrationConfigPayload, S>

  type LgspIntegrationConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LgspIntegrationConfigFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LgspIntegrationConfigCountAggregateInputType | true
    }

  export interface LgspIntegrationConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LgspIntegrationConfig'], meta: { name: 'LgspIntegrationConfig' } }
    /**
     * Find zero or one LgspIntegrationConfig that matches the filter.
     * @param {LgspIntegrationConfigFindUniqueArgs} args - Arguments to find a LgspIntegrationConfig
     * @example
     * // Get one LgspIntegrationConfig
     * const lgspIntegrationConfig = await prisma.lgspIntegrationConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LgspIntegrationConfigFindUniqueArgs>(args: SelectSubset<T, LgspIntegrationConfigFindUniqueArgs<ExtArgs>>): Prisma__LgspIntegrationConfigClient<$Result.GetResult<Prisma.$LgspIntegrationConfigPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LgspIntegrationConfig that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LgspIntegrationConfigFindUniqueOrThrowArgs} args - Arguments to find a LgspIntegrationConfig
     * @example
     * // Get one LgspIntegrationConfig
     * const lgspIntegrationConfig = await prisma.lgspIntegrationConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LgspIntegrationConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, LgspIntegrationConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LgspIntegrationConfigClient<$Result.GetResult<Prisma.$LgspIntegrationConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LgspIntegrationConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LgspIntegrationConfigFindFirstArgs} args - Arguments to find a LgspIntegrationConfig
     * @example
     * // Get one LgspIntegrationConfig
     * const lgspIntegrationConfig = await prisma.lgspIntegrationConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LgspIntegrationConfigFindFirstArgs>(args?: SelectSubset<T, LgspIntegrationConfigFindFirstArgs<ExtArgs>>): Prisma__LgspIntegrationConfigClient<$Result.GetResult<Prisma.$LgspIntegrationConfigPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LgspIntegrationConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LgspIntegrationConfigFindFirstOrThrowArgs} args - Arguments to find a LgspIntegrationConfig
     * @example
     * // Get one LgspIntegrationConfig
     * const lgspIntegrationConfig = await prisma.lgspIntegrationConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LgspIntegrationConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, LgspIntegrationConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__LgspIntegrationConfigClient<$Result.GetResult<Prisma.$LgspIntegrationConfigPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LgspIntegrationConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LgspIntegrationConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LgspIntegrationConfigs
     * const lgspIntegrationConfigs = await prisma.lgspIntegrationConfig.findMany()
     * 
     * // Get first 10 LgspIntegrationConfigs
     * const lgspIntegrationConfigs = await prisma.lgspIntegrationConfig.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const lgspIntegrationConfigWithIdOnly = await prisma.lgspIntegrationConfig.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LgspIntegrationConfigFindManyArgs>(args?: SelectSubset<T, LgspIntegrationConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LgspIntegrationConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LgspIntegrationConfig.
     * @param {LgspIntegrationConfigCreateArgs} args - Arguments to create a LgspIntegrationConfig.
     * @example
     * // Create one LgspIntegrationConfig
     * const LgspIntegrationConfig = await prisma.lgspIntegrationConfig.create({
     *   data: {
     *     // ... data to create a LgspIntegrationConfig
     *   }
     * })
     * 
     */
    create<T extends LgspIntegrationConfigCreateArgs>(args: SelectSubset<T, LgspIntegrationConfigCreateArgs<ExtArgs>>): Prisma__LgspIntegrationConfigClient<$Result.GetResult<Prisma.$LgspIntegrationConfigPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LgspIntegrationConfigs.
     * @param {LgspIntegrationConfigCreateManyArgs} args - Arguments to create many LgspIntegrationConfigs.
     * @example
     * // Create many LgspIntegrationConfigs
     * const lgspIntegrationConfig = await prisma.lgspIntegrationConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LgspIntegrationConfigCreateManyArgs>(args?: SelectSubset<T, LgspIntegrationConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a LgspIntegrationConfig.
     * @param {LgspIntegrationConfigDeleteArgs} args - Arguments to delete one LgspIntegrationConfig.
     * @example
     * // Delete one LgspIntegrationConfig
     * const LgspIntegrationConfig = await prisma.lgspIntegrationConfig.delete({
     *   where: {
     *     // ... filter to delete one LgspIntegrationConfig
     *   }
     * })
     * 
     */
    delete<T extends LgspIntegrationConfigDeleteArgs>(args: SelectSubset<T, LgspIntegrationConfigDeleteArgs<ExtArgs>>): Prisma__LgspIntegrationConfigClient<$Result.GetResult<Prisma.$LgspIntegrationConfigPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LgspIntegrationConfig.
     * @param {LgspIntegrationConfigUpdateArgs} args - Arguments to update one LgspIntegrationConfig.
     * @example
     * // Update one LgspIntegrationConfig
     * const lgspIntegrationConfig = await prisma.lgspIntegrationConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LgspIntegrationConfigUpdateArgs>(args: SelectSubset<T, LgspIntegrationConfigUpdateArgs<ExtArgs>>): Prisma__LgspIntegrationConfigClient<$Result.GetResult<Prisma.$LgspIntegrationConfigPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LgspIntegrationConfigs.
     * @param {LgspIntegrationConfigDeleteManyArgs} args - Arguments to filter LgspIntegrationConfigs to delete.
     * @example
     * // Delete a few LgspIntegrationConfigs
     * const { count } = await prisma.lgspIntegrationConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LgspIntegrationConfigDeleteManyArgs>(args?: SelectSubset<T, LgspIntegrationConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LgspIntegrationConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LgspIntegrationConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LgspIntegrationConfigs
     * const lgspIntegrationConfig = await prisma.lgspIntegrationConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LgspIntegrationConfigUpdateManyArgs>(args: SelectSubset<T, LgspIntegrationConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one LgspIntegrationConfig.
     * @param {LgspIntegrationConfigUpsertArgs} args - Arguments to update or create a LgspIntegrationConfig.
     * @example
     * // Update or create a LgspIntegrationConfig
     * const lgspIntegrationConfig = await prisma.lgspIntegrationConfig.upsert({
     *   create: {
     *     // ... data to create a LgspIntegrationConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LgspIntegrationConfig we want to update
     *   }
     * })
     */
    upsert<T extends LgspIntegrationConfigUpsertArgs>(args: SelectSubset<T, LgspIntegrationConfigUpsertArgs<ExtArgs>>): Prisma__LgspIntegrationConfigClient<$Result.GetResult<Prisma.$LgspIntegrationConfigPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LgspIntegrationConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LgspIntegrationConfigCountArgs} args - Arguments to filter LgspIntegrationConfigs to count.
     * @example
     * // Count the number of LgspIntegrationConfigs
     * const count = await prisma.lgspIntegrationConfig.count({
     *   where: {
     *     // ... the filter for the LgspIntegrationConfigs we want to count
     *   }
     * })
    **/
    count<T extends LgspIntegrationConfigCountArgs>(
      args?: Subset<T, LgspIntegrationConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LgspIntegrationConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LgspIntegrationConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LgspIntegrationConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends LgspIntegrationConfigAggregateArgs>(args: Subset<T, LgspIntegrationConfigAggregateArgs>): Prisma.PrismaPromise<GetLgspIntegrationConfigAggregateType<T>>

    /**
     * Group by LgspIntegrationConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LgspIntegrationConfigGroupByArgs} args - Group by arguments.
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
      T extends LgspIntegrationConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LgspIntegrationConfigGroupByArgs['orderBy'] }
        : { orderBy?: LgspIntegrationConfigGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, LgspIntegrationConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLgspIntegrationConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LgspIntegrationConfig model
   */
  readonly fields: LgspIntegrationConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LgspIntegrationConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LgspIntegrationConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the LgspIntegrationConfig model
   */
  interface LgspIntegrationConfigFieldRefs {
    readonly id: FieldRef<"LgspIntegrationConfig", 'String'>
    readonly name: FieldRef<"LgspIntegrationConfig", 'String'>
    readonly serviceCode: FieldRef<"LgspIntegrationConfig", 'String'>
    readonly apiUrl: FieldRef<"LgspIntegrationConfig", 'String'>
    readonly authType: FieldRef<"LgspIntegrationConfig", 'String'>
    readonly authUrl: FieldRef<"LgspIntegrationConfig", 'String'>
    readonly authPayload: FieldRef<"LgspIntegrationConfig", 'Json'>
    readonly tokenPath: FieldRef<"LgspIntegrationConfig", 'String'>
    readonly cachedToken: FieldRef<"LgspIntegrationConfig", 'String'>
    readonly tokenExpiresAt: FieldRef<"LgspIntegrationConfig", 'DateTime'>
    readonly requestMethod: FieldRef<"LgspIntegrationConfig", 'String'>
    readonly requestParams: FieldRef<"LgspIntegrationConfig", 'Json'>
    readonly displayType: FieldRef<"LgspIntegrationConfig", 'String'>
    readonly chartConfig: FieldRef<"LgspIntegrationConfig", 'Json'>
    readonly isActive: FieldRef<"LgspIntegrationConfig", 'Boolean'>
    readonly createdAt: FieldRef<"LgspIntegrationConfig", 'DateTime'>
    readonly updatedAt: FieldRef<"LgspIntegrationConfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LgspIntegrationConfig findUnique
   */
  export type LgspIntegrationConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LgspIntegrationConfig
     */
    select?: LgspIntegrationConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LgspIntegrationConfig
     */
    omit?: LgspIntegrationConfigOmit<ExtArgs> | null
    /**
     * Filter, which LgspIntegrationConfig to fetch.
     */
    where: LgspIntegrationConfigWhereUniqueInput
  }

  /**
   * LgspIntegrationConfig findUniqueOrThrow
   */
  export type LgspIntegrationConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LgspIntegrationConfig
     */
    select?: LgspIntegrationConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LgspIntegrationConfig
     */
    omit?: LgspIntegrationConfigOmit<ExtArgs> | null
    /**
     * Filter, which LgspIntegrationConfig to fetch.
     */
    where: LgspIntegrationConfigWhereUniqueInput
  }

  /**
   * LgspIntegrationConfig findFirst
   */
  export type LgspIntegrationConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LgspIntegrationConfig
     */
    select?: LgspIntegrationConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LgspIntegrationConfig
     */
    omit?: LgspIntegrationConfigOmit<ExtArgs> | null
    /**
     * Filter, which LgspIntegrationConfig to fetch.
     */
    where?: LgspIntegrationConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LgspIntegrationConfigs to fetch.
     */
    orderBy?: LgspIntegrationConfigOrderByWithRelationInput | LgspIntegrationConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LgspIntegrationConfigs.
     */
    cursor?: LgspIntegrationConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LgspIntegrationConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LgspIntegrationConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LgspIntegrationConfigs.
     */
    distinct?: LgspIntegrationConfigScalarFieldEnum | LgspIntegrationConfigScalarFieldEnum[]
  }

  /**
   * LgspIntegrationConfig findFirstOrThrow
   */
  export type LgspIntegrationConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LgspIntegrationConfig
     */
    select?: LgspIntegrationConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LgspIntegrationConfig
     */
    omit?: LgspIntegrationConfigOmit<ExtArgs> | null
    /**
     * Filter, which LgspIntegrationConfig to fetch.
     */
    where?: LgspIntegrationConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LgspIntegrationConfigs to fetch.
     */
    orderBy?: LgspIntegrationConfigOrderByWithRelationInput | LgspIntegrationConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LgspIntegrationConfigs.
     */
    cursor?: LgspIntegrationConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LgspIntegrationConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LgspIntegrationConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LgspIntegrationConfigs.
     */
    distinct?: LgspIntegrationConfigScalarFieldEnum | LgspIntegrationConfigScalarFieldEnum[]
  }

  /**
   * LgspIntegrationConfig findMany
   */
  export type LgspIntegrationConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LgspIntegrationConfig
     */
    select?: LgspIntegrationConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LgspIntegrationConfig
     */
    omit?: LgspIntegrationConfigOmit<ExtArgs> | null
    /**
     * Filter, which LgspIntegrationConfigs to fetch.
     */
    where?: LgspIntegrationConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LgspIntegrationConfigs to fetch.
     */
    orderBy?: LgspIntegrationConfigOrderByWithRelationInput | LgspIntegrationConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LgspIntegrationConfigs.
     */
    cursor?: LgspIntegrationConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LgspIntegrationConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LgspIntegrationConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LgspIntegrationConfigs.
     */
    distinct?: LgspIntegrationConfigScalarFieldEnum | LgspIntegrationConfigScalarFieldEnum[]
  }

  /**
   * LgspIntegrationConfig create
   */
  export type LgspIntegrationConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LgspIntegrationConfig
     */
    select?: LgspIntegrationConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LgspIntegrationConfig
     */
    omit?: LgspIntegrationConfigOmit<ExtArgs> | null
    /**
     * The data needed to create a LgspIntegrationConfig.
     */
    data: XOR<LgspIntegrationConfigCreateInput, LgspIntegrationConfigUncheckedCreateInput>
  }

  /**
   * LgspIntegrationConfig createMany
   */
  export type LgspIntegrationConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LgspIntegrationConfigs.
     */
    data: LgspIntegrationConfigCreateManyInput | LgspIntegrationConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LgspIntegrationConfig update
   */
  export type LgspIntegrationConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LgspIntegrationConfig
     */
    select?: LgspIntegrationConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LgspIntegrationConfig
     */
    omit?: LgspIntegrationConfigOmit<ExtArgs> | null
    /**
     * The data needed to update a LgspIntegrationConfig.
     */
    data: XOR<LgspIntegrationConfigUpdateInput, LgspIntegrationConfigUncheckedUpdateInput>
    /**
     * Choose, which LgspIntegrationConfig to update.
     */
    where: LgspIntegrationConfigWhereUniqueInput
  }

  /**
   * LgspIntegrationConfig updateMany
   */
  export type LgspIntegrationConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LgspIntegrationConfigs.
     */
    data: XOR<LgspIntegrationConfigUpdateManyMutationInput, LgspIntegrationConfigUncheckedUpdateManyInput>
    /**
     * Filter which LgspIntegrationConfigs to update
     */
    where?: LgspIntegrationConfigWhereInput
    /**
     * Limit how many LgspIntegrationConfigs to update.
     */
    limit?: number
  }

  /**
   * LgspIntegrationConfig upsert
   */
  export type LgspIntegrationConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LgspIntegrationConfig
     */
    select?: LgspIntegrationConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LgspIntegrationConfig
     */
    omit?: LgspIntegrationConfigOmit<ExtArgs> | null
    /**
     * The filter to search for the LgspIntegrationConfig to update in case it exists.
     */
    where: LgspIntegrationConfigWhereUniqueInput
    /**
     * In case the LgspIntegrationConfig found by the `where` argument doesn't exist, create a new LgspIntegrationConfig with this data.
     */
    create: XOR<LgspIntegrationConfigCreateInput, LgspIntegrationConfigUncheckedCreateInput>
    /**
     * In case the LgspIntegrationConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LgspIntegrationConfigUpdateInput, LgspIntegrationConfigUncheckedUpdateInput>
  }

  /**
   * LgspIntegrationConfig delete
   */
  export type LgspIntegrationConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LgspIntegrationConfig
     */
    select?: LgspIntegrationConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LgspIntegrationConfig
     */
    omit?: LgspIntegrationConfigOmit<ExtArgs> | null
    /**
     * Filter which LgspIntegrationConfig to delete.
     */
    where: LgspIntegrationConfigWhereUniqueInput
  }

  /**
   * LgspIntegrationConfig deleteMany
   */
  export type LgspIntegrationConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LgspIntegrationConfigs to delete
     */
    where?: LgspIntegrationConfigWhereInput
    /**
     * Limit how many LgspIntegrationConfigs to delete.
     */
    limit?: number
  }

  /**
   * LgspIntegrationConfig without action
   */
  export type LgspIntegrationConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LgspIntegrationConfig
     */
    select?: LgspIntegrationConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LgspIntegrationConfig
     */
    omit?: LgspIntegrationConfigOmit<ExtArgs> | null
  }


  /**
   * Model GatewayConfig
   */

  export type AggregateGatewayConfig = {
    _count: GatewayConfigCountAggregateOutputType | null
    _avg: GatewayConfigAvgAggregateOutputType | null
    _sum: GatewayConfigSumAggregateOutputType | null
    _min: GatewayConfigMinAggregateOutputType | null
    _max: GatewayConfigMaxAggregateOutputType | null
  }

  export type GatewayConfigAvgAggregateOutputType = {
    httpPort: number | null
    httpsPort: number | null
    version: number | null
  }

  export type GatewayConfigSumAggregateOutputType = {
    httpPort: number | null
    httpsPort: number | null
    version: number | null
  }

  export type GatewayConfigMinAggregateOutputType = {
    id: string | null
    name: string | null
    provider: string | null
    httpPort: number | null
    httpsPort: number | null
    enableHttps: boolean | null
    sslCert: string | null
    sslKey: string | null
    rawConfig: string | null
    isActive: boolean | null
    version: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GatewayConfigMaxAggregateOutputType = {
    id: string | null
    name: string | null
    provider: string | null
    httpPort: number | null
    httpsPort: number | null
    enableHttps: boolean | null
    sslCert: string | null
    sslKey: string | null
    rawConfig: string | null
    isActive: boolean | null
    version: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GatewayConfigCountAggregateOutputType = {
    id: number
    name: number
    provider: number
    httpPort: number
    httpsPort: number
    enableHttps: number
    sslCert: number
    sslKey: number
    rawConfig: number
    isActive: number
    version: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GatewayConfigAvgAggregateInputType = {
    httpPort?: true
    httpsPort?: true
    version?: true
  }

  export type GatewayConfigSumAggregateInputType = {
    httpPort?: true
    httpsPort?: true
    version?: true
  }

  export type GatewayConfigMinAggregateInputType = {
    id?: true
    name?: true
    provider?: true
    httpPort?: true
    httpsPort?: true
    enableHttps?: true
    sslCert?: true
    sslKey?: true
    rawConfig?: true
    isActive?: true
    version?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GatewayConfigMaxAggregateInputType = {
    id?: true
    name?: true
    provider?: true
    httpPort?: true
    httpsPort?: true
    enableHttps?: true
    sslCert?: true
    sslKey?: true
    rawConfig?: true
    isActive?: true
    version?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GatewayConfigCountAggregateInputType = {
    id?: true
    name?: true
    provider?: true
    httpPort?: true
    httpsPort?: true
    enableHttps?: true
    sslCert?: true
    sslKey?: true
    rawConfig?: true
    isActive?: true
    version?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GatewayConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GatewayConfig to aggregate.
     */
    where?: GatewayConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GatewayConfigs to fetch.
     */
    orderBy?: GatewayConfigOrderByWithRelationInput | GatewayConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GatewayConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GatewayConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GatewayConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GatewayConfigs
    **/
    _count?: true | GatewayConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GatewayConfigAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GatewayConfigSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GatewayConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GatewayConfigMaxAggregateInputType
  }

  export type GetGatewayConfigAggregateType<T extends GatewayConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateGatewayConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGatewayConfig[P]>
      : GetScalarType<T[P], AggregateGatewayConfig[P]>
  }




  export type GatewayConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GatewayConfigWhereInput
    orderBy?: GatewayConfigOrderByWithAggregationInput | GatewayConfigOrderByWithAggregationInput[]
    by: GatewayConfigScalarFieldEnum[] | GatewayConfigScalarFieldEnum
    having?: GatewayConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GatewayConfigCountAggregateInputType | true
    _avg?: GatewayConfigAvgAggregateInputType
    _sum?: GatewayConfigSumAggregateInputType
    _min?: GatewayConfigMinAggregateInputType
    _max?: GatewayConfigMaxAggregateInputType
  }

  export type GatewayConfigGroupByOutputType = {
    id: string
    name: string
    provider: string
    httpPort: number
    httpsPort: number
    enableHttps: boolean
    sslCert: string | null
    sslKey: string | null
    rawConfig: string | null
    isActive: boolean
    version: number
    createdAt: Date
    updatedAt: Date
    _count: GatewayConfigCountAggregateOutputType | null
    _avg: GatewayConfigAvgAggregateOutputType | null
    _sum: GatewayConfigSumAggregateOutputType | null
    _min: GatewayConfigMinAggregateOutputType | null
    _max: GatewayConfigMaxAggregateOutputType | null
  }

  type GetGatewayConfigGroupByPayload<T extends GatewayConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GatewayConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GatewayConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GatewayConfigGroupByOutputType[P]>
            : GetScalarType<T[P], GatewayConfigGroupByOutputType[P]>
        }
      >
    >


  export type GatewayConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    provider?: boolean
    httpPort?: boolean
    httpsPort?: boolean
    enableHttps?: boolean
    sslCert?: boolean
    sslKey?: boolean
    rawConfig?: boolean
    isActive?: boolean
    version?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    routes?: boolean | GatewayConfig$routesArgs<ExtArgs>
    _count?: boolean | GatewayConfigCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gatewayConfig"]>



  export type GatewayConfigSelectScalar = {
    id?: boolean
    name?: boolean
    provider?: boolean
    httpPort?: boolean
    httpsPort?: boolean
    enableHttps?: boolean
    sslCert?: boolean
    sslKey?: boolean
    rawConfig?: boolean
    isActive?: boolean
    version?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GatewayConfigOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "provider" | "httpPort" | "httpsPort" | "enableHttps" | "sslCert" | "sslKey" | "rawConfig" | "isActive" | "version" | "createdAt" | "updatedAt", ExtArgs["result"]["gatewayConfig"]>
  export type GatewayConfigInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    routes?: boolean | GatewayConfig$routesArgs<ExtArgs>
    _count?: boolean | GatewayConfigCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $GatewayConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GatewayConfig"
    objects: {
      routes: Prisma.$GatewayRoutePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      provider: string
      httpPort: number
      httpsPort: number
      enableHttps: boolean
      sslCert: string | null
      sslKey: string | null
      rawConfig: string | null
      isActive: boolean
      version: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["gatewayConfig"]>
    composites: {}
  }

  type GatewayConfigGetPayload<S extends boolean | null | undefined | GatewayConfigDefaultArgs> = $Result.GetResult<Prisma.$GatewayConfigPayload, S>

  type GatewayConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GatewayConfigFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GatewayConfigCountAggregateInputType | true
    }

  export interface GatewayConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GatewayConfig'], meta: { name: 'GatewayConfig' } }
    /**
     * Find zero or one GatewayConfig that matches the filter.
     * @param {GatewayConfigFindUniqueArgs} args - Arguments to find a GatewayConfig
     * @example
     * // Get one GatewayConfig
     * const gatewayConfig = await prisma.gatewayConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GatewayConfigFindUniqueArgs>(args: SelectSubset<T, GatewayConfigFindUniqueArgs<ExtArgs>>): Prisma__GatewayConfigClient<$Result.GetResult<Prisma.$GatewayConfigPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GatewayConfig that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GatewayConfigFindUniqueOrThrowArgs} args - Arguments to find a GatewayConfig
     * @example
     * // Get one GatewayConfig
     * const gatewayConfig = await prisma.gatewayConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GatewayConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, GatewayConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GatewayConfigClient<$Result.GetResult<Prisma.$GatewayConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GatewayConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GatewayConfigFindFirstArgs} args - Arguments to find a GatewayConfig
     * @example
     * // Get one GatewayConfig
     * const gatewayConfig = await prisma.gatewayConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GatewayConfigFindFirstArgs>(args?: SelectSubset<T, GatewayConfigFindFirstArgs<ExtArgs>>): Prisma__GatewayConfigClient<$Result.GetResult<Prisma.$GatewayConfigPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GatewayConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GatewayConfigFindFirstOrThrowArgs} args - Arguments to find a GatewayConfig
     * @example
     * // Get one GatewayConfig
     * const gatewayConfig = await prisma.gatewayConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GatewayConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, GatewayConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__GatewayConfigClient<$Result.GetResult<Prisma.$GatewayConfigPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GatewayConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GatewayConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GatewayConfigs
     * const gatewayConfigs = await prisma.gatewayConfig.findMany()
     * 
     * // Get first 10 GatewayConfigs
     * const gatewayConfigs = await prisma.gatewayConfig.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gatewayConfigWithIdOnly = await prisma.gatewayConfig.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GatewayConfigFindManyArgs>(args?: SelectSubset<T, GatewayConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GatewayConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GatewayConfig.
     * @param {GatewayConfigCreateArgs} args - Arguments to create a GatewayConfig.
     * @example
     * // Create one GatewayConfig
     * const GatewayConfig = await prisma.gatewayConfig.create({
     *   data: {
     *     // ... data to create a GatewayConfig
     *   }
     * })
     * 
     */
    create<T extends GatewayConfigCreateArgs>(args: SelectSubset<T, GatewayConfigCreateArgs<ExtArgs>>): Prisma__GatewayConfigClient<$Result.GetResult<Prisma.$GatewayConfigPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GatewayConfigs.
     * @param {GatewayConfigCreateManyArgs} args - Arguments to create many GatewayConfigs.
     * @example
     * // Create many GatewayConfigs
     * const gatewayConfig = await prisma.gatewayConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GatewayConfigCreateManyArgs>(args?: SelectSubset<T, GatewayConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a GatewayConfig.
     * @param {GatewayConfigDeleteArgs} args - Arguments to delete one GatewayConfig.
     * @example
     * // Delete one GatewayConfig
     * const GatewayConfig = await prisma.gatewayConfig.delete({
     *   where: {
     *     // ... filter to delete one GatewayConfig
     *   }
     * })
     * 
     */
    delete<T extends GatewayConfigDeleteArgs>(args: SelectSubset<T, GatewayConfigDeleteArgs<ExtArgs>>): Prisma__GatewayConfigClient<$Result.GetResult<Prisma.$GatewayConfigPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GatewayConfig.
     * @param {GatewayConfigUpdateArgs} args - Arguments to update one GatewayConfig.
     * @example
     * // Update one GatewayConfig
     * const gatewayConfig = await prisma.gatewayConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GatewayConfigUpdateArgs>(args: SelectSubset<T, GatewayConfigUpdateArgs<ExtArgs>>): Prisma__GatewayConfigClient<$Result.GetResult<Prisma.$GatewayConfigPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GatewayConfigs.
     * @param {GatewayConfigDeleteManyArgs} args - Arguments to filter GatewayConfigs to delete.
     * @example
     * // Delete a few GatewayConfigs
     * const { count } = await prisma.gatewayConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GatewayConfigDeleteManyArgs>(args?: SelectSubset<T, GatewayConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GatewayConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GatewayConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GatewayConfigs
     * const gatewayConfig = await prisma.gatewayConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GatewayConfigUpdateManyArgs>(args: SelectSubset<T, GatewayConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GatewayConfig.
     * @param {GatewayConfigUpsertArgs} args - Arguments to update or create a GatewayConfig.
     * @example
     * // Update or create a GatewayConfig
     * const gatewayConfig = await prisma.gatewayConfig.upsert({
     *   create: {
     *     // ... data to create a GatewayConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GatewayConfig we want to update
     *   }
     * })
     */
    upsert<T extends GatewayConfigUpsertArgs>(args: SelectSubset<T, GatewayConfigUpsertArgs<ExtArgs>>): Prisma__GatewayConfigClient<$Result.GetResult<Prisma.$GatewayConfigPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GatewayConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GatewayConfigCountArgs} args - Arguments to filter GatewayConfigs to count.
     * @example
     * // Count the number of GatewayConfigs
     * const count = await prisma.gatewayConfig.count({
     *   where: {
     *     // ... the filter for the GatewayConfigs we want to count
     *   }
     * })
    **/
    count<T extends GatewayConfigCountArgs>(
      args?: Subset<T, GatewayConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GatewayConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GatewayConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GatewayConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends GatewayConfigAggregateArgs>(args: Subset<T, GatewayConfigAggregateArgs>): Prisma.PrismaPromise<GetGatewayConfigAggregateType<T>>

    /**
     * Group by GatewayConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GatewayConfigGroupByArgs} args - Group by arguments.
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
      T extends GatewayConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GatewayConfigGroupByArgs['orderBy'] }
        : { orderBy?: GatewayConfigGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, GatewayConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGatewayConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GatewayConfig model
   */
  readonly fields: GatewayConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GatewayConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GatewayConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    routes<T extends GatewayConfig$routesArgs<ExtArgs> = {}>(args?: Subset<T, GatewayConfig$routesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GatewayRoutePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the GatewayConfig model
   */
  interface GatewayConfigFieldRefs {
    readonly id: FieldRef<"GatewayConfig", 'String'>
    readonly name: FieldRef<"GatewayConfig", 'String'>
    readonly provider: FieldRef<"GatewayConfig", 'String'>
    readonly httpPort: FieldRef<"GatewayConfig", 'Int'>
    readonly httpsPort: FieldRef<"GatewayConfig", 'Int'>
    readonly enableHttps: FieldRef<"GatewayConfig", 'Boolean'>
    readonly sslCert: FieldRef<"GatewayConfig", 'String'>
    readonly sslKey: FieldRef<"GatewayConfig", 'String'>
    readonly rawConfig: FieldRef<"GatewayConfig", 'String'>
    readonly isActive: FieldRef<"GatewayConfig", 'Boolean'>
    readonly version: FieldRef<"GatewayConfig", 'Int'>
    readonly createdAt: FieldRef<"GatewayConfig", 'DateTime'>
    readonly updatedAt: FieldRef<"GatewayConfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GatewayConfig findUnique
   */
  export type GatewayConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayConfig
     */
    select?: GatewayConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayConfig
     */
    omit?: GatewayConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayConfigInclude<ExtArgs> | null
    /**
     * Filter, which GatewayConfig to fetch.
     */
    where: GatewayConfigWhereUniqueInput
  }

  /**
   * GatewayConfig findUniqueOrThrow
   */
  export type GatewayConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayConfig
     */
    select?: GatewayConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayConfig
     */
    omit?: GatewayConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayConfigInclude<ExtArgs> | null
    /**
     * Filter, which GatewayConfig to fetch.
     */
    where: GatewayConfigWhereUniqueInput
  }

  /**
   * GatewayConfig findFirst
   */
  export type GatewayConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayConfig
     */
    select?: GatewayConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayConfig
     */
    omit?: GatewayConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayConfigInclude<ExtArgs> | null
    /**
     * Filter, which GatewayConfig to fetch.
     */
    where?: GatewayConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GatewayConfigs to fetch.
     */
    orderBy?: GatewayConfigOrderByWithRelationInput | GatewayConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GatewayConfigs.
     */
    cursor?: GatewayConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GatewayConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GatewayConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GatewayConfigs.
     */
    distinct?: GatewayConfigScalarFieldEnum | GatewayConfigScalarFieldEnum[]
  }

  /**
   * GatewayConfig findFirstOrThrow
   */
  export type GatewayConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayConfig
     */
    select?: GatewayConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayConfig
     */
    omit?: GatewayConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayConfigInclude<ExtArgs> | null
    /**
     * Filter, which GatewayConfig to fetch.
     */
    where?: GatewayConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GatewayConfigs to fetch.
     */
    orderBy?: GatewayConfigOrderByWithRelationInput | GatewayConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GatewayConfigs.
     */
    cursor?: GatewayConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GatewayConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GatewayConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GatewayConfigs.
     */
    distinct?: GatewayConfigScalarFieldEnum | GatewayConfigScalarFieldEnum[]
  }

  /**
   * GatewayConfig findMany
   */
  export type GatewayConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayConfig
     */
    select?: GatewayConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayConfig
     */
    omit?: GatewayConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayConfigInclude<ExtArgs> | null
    /**
     * Filter, which GatewayConfigs to fetch.
     */
    where?: GatewayConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GatewayConfigs to fetch.
     */
    orderBy?: GatewayConfigOrderByWithRelationInput | GatewayConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GatewayConfigs.
     */
    cursor?: GatewayConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GatewayConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GatewayConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GatewayConfigs.
     */
    distinct?: GatewayConfigScalarFieldEnum | GatewayConfigScalarFieldEnum[]
  }

  /**
   * GatewayConfig create
   */
  export type GatewayConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayConfig
     */
    select?: GatewayConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayConfig
     */
    omit?: GatewayConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayConfigInclude<ExtArgs> | null
    /**
     * The data needed to create a GatewayConfig.
     */
    data: XOR<GatewayConfigCreateInput, GatewayConfigUncheckedCreateInput>
  }

  /**
   * GatewayConfig createMany
   */
  export type GatewayConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GatewayConfigs.
     */
    data: GatewayConfigCreateManyInput | GatewayConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GatewayConfig update
   */
  export type GatewayConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayConfig
     */
    select?: GatewayConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayConfig
     */
    omit?: GatewayConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayConfigInclude<ExtArgs> | null
    /**
     * The data needed to update a GatewayConfig.
     */
    data: XOR<GatewayConfigUpdateInput, GatewayConfigUncheckedUpdateInput>
    /**
     * Choose, which GatewayConfig to update.
     */
    where: GatewayConfigWhereUniqueInput
  }

  /**
   * GatewayConfig updateMany
   */
  export type GatewayConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GatewayConfigs.
     */
    data: XOR<GatewayConfigUpdateManyMutationInput, GatewayConfigUncheckedUpdateManyInput>
    /**
     * Filter which GatewayConfigs to update
     */
    where?: GatewayConfigWhereInput
    /**
     * Limit how many GatewayConfigs to update.
     */
    limit?: number
  }

  /**
   * GatewayConfig upsert
   */
  export type GatewayConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayConfig
     */
    select?: GatewayConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayConfig
     */
    omit?: GatewayConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayConfigInclude<ExtArgs> | null
    /**
     * The filter to search for the GatewayConfig to update in case it exists.
     */
    where: GatewayConfigWhereUniqueInput
    /**
     * In case the GatewayConfig found by the `where` argument doesn't exist, create a new GatewayConfig with this data.
     */
    create: XOR<GatewayConfigCreateInput, GatewayConfigUncheckedCreateInput>
    /**
     * In case the GatewayConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GatewayConfigUpdateInput, GatewayConfigUncheckedUpdateInput>
  }

  /**
   * GatewayConfig delete
   */
  export type GatewayConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayConfig
     */
    select?: GatewayConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayConfig
     */
    omit?: GatewayConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayConfigInclude<ExtArgs> | null
    /**
     * Filter which GatewayConfig to delete.
     */
    where: GatewayConfigWhereUniqueInput
  }

  /**
   * GatewayConfig deleteMany
   */
  export type GatewayConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GatewayConfigs to delete
     */
    where?: GatewayConfigWhereInput
    /**
     * Limit how many GatewayConfigs to delete.
     */
    limit?: number
  }

  /**
   * GatewayConfig.routes
   */
  export type GatewayConfig$routesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayRoute
     */
    select?: GatewayRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayRoute
     */
    omit?: GatewayRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayRouteInclude<ExtArgs> | null
    where?: GatewayRouteWhereInput
    orderBy?: GatewayRouteOrderByWithRelationInput | GatewayRouteOrderByWithRelationInput[]
    cursor?: GatewayRouteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GatewayRouteScalarFieldEnum | GatewayRouteScalarFieldEnum[]
  }

  /**
   * GatewayConfig without action
   */
  export type GatewayConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayConfig
     */
    select?: GatewayConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayConfig
     */
    omit?: GatewayConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayConfigInclude<ExtArgs> | null
  }


  /**
   * Model GatewayRoute
   */

  export type AggregateGatewayRoute = {
    _count: GatewayRouteCountAggregateOutputType | null
    _avg: GatewayRouteAvgAggregateOutputType | null
    _sum: GatewayRouteSumAggregateOutputType | null
    _min: GatewayRouteMinAggregateOutputType | null
    _max: GatewayRouteMaxAggregateOutputType | null
  }

  export type GatewayRouteAvgAggregateOutputType = {
    rateLimit: number | null
    timeout: number | null
    order: number | null
  }

  export type GatewayRouteSumAggregateOutputType = {
    rateLimit: number | null
    timeout: number | null
    order: number | null
  }

  export type GatewayRouteMinAggregateOutputType = {
    id: string | null
    gatewayId: string | null
    path: string | null
    targetService: string | null
    stripPrefix: boolean | null
    rateLimit: number | null
    timeout: number | null
    order: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GatewayRouteMaxAggregateOutputType = {
    id: string | null
    gatewayId: string | null
    path: string | null
    targetService: string | null
    stripPrefix: boolean | null
    rateLimit: number | null
    timeout: number | null
    order: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GatewayRouteCountAggregateOutputType = {
    id: number
    gatewayId: number
    path: number
    targetService: number
    stripPrefix: number
    rateLimit: number
    timeout: number
    order: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GatewayRouteAvgAggregateInputType = {
    rateLimit?: true
    timeout?: true
    order?: true
  }

  export type GatewayRouteSumAggregateInputType = {
    rateLimit?: true
    timeout?: true
    order?: true
  }

  export type GatewayRouteMinAggregateInputType = {
    id?: true
    gatewayId?: true
    path?: true
    targetService?: true
    stripPrefix?: true
    rateLimit?: true
    timeout?: true
    order?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GatewayRouteMaxAggregateInputType = {
    id?: true
    gatewayId?: true
    path?: true
    targetService?: true
    stripPrefix?: true
    rateLimit?: true
    timeout?: true
    order?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GatewayRouteCountAggregateInputType = {
    id?: true
    gatewayId?: true
    path?: true
    targetService?: true
    stripPrefix?: true
    rateLimit?: true
    timeout?: true
    order?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GatewayRouteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GatewayRoute to aggregate.
     */
    where?: GatewayRouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GatewayRoutes to fetch.
     */
    orderBy?: GatewayRouteOrderByWithRelationInput | GatewayRouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GatewayRouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GatewayRoutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GatewayRoutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GatewayRoutes
    **/
    _count?: true | GatewayRouteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GatewayRouteAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GatewayRouteSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GatewayRouteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GatewayRouteMaxAggregateInputType
  }

  export type GetGatewayRouteAggregateType<T extends GatewayRouteAggregateArgs> = {
        [P in keyof T & keyof AggregateGatewayRoute]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGatewayRoute[P]>
      : GetScalarType<T[P], AggregateGatewayRoute[P]>
  }




  export type GatewayRouteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GatewayRouteWhereInput
    orderBy?: GatewayRouteOrderByWithAggregationInput | GatewayRouteOrderByWithAggregationInput[]
    by: GatewayRouteScalarFieldEnum[] | GatewayRouteScalarFieldEnum
    having?: GatewayRouteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GatewayRouteCountAggregateInputType | true
    _avg?: GatewayRouteAvgAggregateInputType
    _sum?: GatewayRouteSumAggregateInputType
    _min?: GatewayRouteMinAggregateInputType
    _max?: GatewayRouteMaxAggregateInputType
  }

  export type GatewayRouteGroupByOutputType = {
    id: string
    gatewayId: string
    path: string
    targetService: string
    stripPrefix: boolean
    rateLimit: number | null
    timeout: number | null
    order: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: GatewayRouteCountAggregateOutputType | null
    _avg: GatewayRouteAvgAggregateOutputType | null
    _sum: GatewayRouteSumAggregateOutputType | null
    _min: GatewayRouteMinAggregateOutputType | null
    _max: GatewayRouteMaxAggregateOutputType | null
  }

  type GetGatewayRouteGroupByPayload<T extends GatewayRouteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GatewayRouteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GatewayRouteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GatewayRouteGroupByOutputType[P]>
            : GetScalarType<T[P], GatewayRouteGroupByOutputType[P]>
        }
      >
    >


  export type GatewayRouteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    gatewayId?: boolean
    path?: boolean
    targetService?: boolean
    stripPrefix?: boolean
    rateLimit?: boolean
    timeout?: boolean
    order?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    gateway?: boolean | GatewayConfigDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gatewayRoute"]>



  export type GatewayRouteSelectScalar = {
    id?: boolean
    gatewayId?: boolean
    path?: boolean
    targetService?: boolean
    stripPrefix?: boolean
    rateLimit?: boolean
    timeout?: boolean
    order?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GatewayRouteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "gatewayId" | "path" | "targetService" | "stripPrefix" | "rateLimit" | "timeout" | "order" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["gatewayRoute"]>
  export type GatewayRouteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gateway?: boolean | GatewayConfigDefaultArgs<ExtArgs>
  }

  export type $GatewayRoutePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GatewayRoute"
    objects: {
      gateway: Prisma.$GatewayConfigPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      gatewayId: string
      path: string
      targetService: string
      stripPrefix: boolean
      rateLimit: number | null
      timeout: number | null
      order: number
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["gatewayRoute"]>
    composites: {}
  }

  type GatewayRouteGetPayload<S extends boolean | null | undefined | GatewayRouteDefaultArgs> = $Result.GetResult<Prisma.$GatewayRoutePayload, S>

  type GatewayRouteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GatewayRouteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GatewayRouteCountAggregateInputType | true
    }

  export interface GatewayRouteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GatewayRoute'], meta: { name: 'GatewayRoute' } }
    /**
     * Find zero or one GatewayRoute that matches the filter.
     * @param {GatewayRouteFindUniqueArgs} args - Arguments to find a GatewayRoute
     * @example
     * // Get one GatewayRoute
     * const gatewayRoute = await prisma.gatewayRoute.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GatewayRouteFindUniqueArgs>(args: SelectSubset<T, GatewayRouteFindUniqueArgs<ExtArgs>>): Prisma__GatewayRouteClient<$Result.GetResult<Prisma.$GatewayRoutePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GatewayRoute that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GatewayRouteFindUniqueOrThrowArgs} args - Arguments to find a GatewayRoute
     * @example
     * // Get one GatewayRoute
     * const gatewayRoute = await prisma.gatewayRoute.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GatewayRouteFindUniqueOrThrowArgs>(args: SelectSubset<T, GatewayRouteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GatewayRouteClient<$Result.GetResult<Prisma.$GatewayRoutePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GatewayRoute that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GatewayRouteFindFirstArgs} args - Arguments to find a GatewayRoute
     * @example
     * // Get one GatewayRoute
     * const gatewayRoute = await prisma.gatewayRoute.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GatewayRouteFindFirstArgs>(args?: SelectSubset<T, GatewayRouteFindFirstArgs<ExtArgs>>): Prisma__GatewayRouteClient<$Result.GetResult<Prisma.$GatewayRoutePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GatewayRoute that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GatewayRouteFindFirstOrThrowArgs} args - Arguments to find a GatewayRoute
     * @example
     * // Get one GatewayRoute
     * const gatewayRoute = await prisma.gatewayRoute.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GatewayRouteFindFirstOrThrowArgs>(args?: SelectSubset<T, GatewayRouteFindFirstOrThrowArgs<ExtArgs>>): Prisma__GatewayRouteClient<$Result.GetResult<Prisma.$GatewayRoutePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GatewayRoutes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GatewayRouteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GatewayRoutes
     * const gatewayRoutes = await prisma.gatewayRoute.findMany()
     * 
     * // Get first 10 GatewayRoutes
     * const gatewayRoutes = await prisma.gatewayRoute.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gatewayRouteWithIdOnly = await prisma.gatewayRoute.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GatewayRouteFindManyArgs>(args?: SelectSubset<T, GatewayRouteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GatewayRoutePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GatewayRoute.
     * @param {GatewayRouteCreateArgs} args - Arguments to create a GatewayRoute.
     * @example
     * // Create one GatewayRoute
     * const GatewayRoute = await prisma.gatewayRoute.create({
     *   data: {
     *     // ... data to create a GatewayRoute
     *   }
     * })
     * 
     */
    create<T extends GatewayRouteCreateArgs>(args: SelectSubset<T, GatewayRouteCreateArgs<ExtArgs>>): Prisma__GatewayRouteClient<$Result.GetResult<Prisma.$GatewayRoutePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GatewayRoutes.
     * @param {GatewayRouteCreateManyArgs} args - Arguments to create many GatewayRoutes.
     * @example
     * // Create many GatewayRoutes
     * const gatewayRoute = await prisma.gatewayRoute.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GatewayRouteCreateManyArgs>(args?: SelectSubset<T, GatewayRouteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a GatewayRoute.
     * @param {GatewayRouteDeleteArgs} args - Arguments to delete one GatewayRoute.
     * @example
     * // Delete one GatewayRoute
     * const GatewayRoute = await prisma.gatewayRoute.delete({
     *   where: {
     *     // ... filter to delete one GatewayRoute
     *   }
     * })
     * 
     */
    delete<T extends GatewayRouteDeleteArgs>(args: SelectSubset<T, GatewayRouteDeleteArgs<ExtArgs>>): Prisma__GatewayRouteClient<$Result.GetResult<Prisma.$GatewayRoutePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GatewayRoute.
     * @param {GatewayRouteUpdateArgs} args - Arguments to update one GatewayRoute.
     * @example
     * // Update one GatewayRoute
     * const gatewayRoute = await prisma.gatewayRoute.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GatewayRouteUpdateArgs>(args: SelectSubset<T, GatewayRouteUpdateArgs<ExtArgs>>): Prisma__GatewayRouteClient<$Result.GetResult<Prisma.$GatewayRoutePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GatewayRoutes.
     * @param {GatewayRouteDeleteManyArgs} args - Arguments to filter GatewayRoutes to delete.
     * @example
     * // Delete a few GatewayRoutes
     * const { count } = await prisma.gatewayRoute.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GatewayRouteDeleteManyArgs>(args?: SelectSubset<T, GatewayRouteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GatewayRoutes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GatewayRouteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GatewayRoutes
     * const gatewayRoute = await prisma.gatewayRoute.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GatewayRouteUpdateManyArgs>(args: SelectSubset<T, GatewayRouteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GatewayRoute.
     * @param {GatewayRouteUpsertArgs} args - Arguments to update or create a GatewayRoute.
     * @example
     * // Update or create a GatewayRoute
     * const gatewayRoute = await prisma.gatewayRoute.upsert({
     *   create: {
     *     // ... data to create a GatewayRoute
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GatewayRoute we want to update
     *   }
     * })
     */
    upsert<T extends GatewayRouteUpsertArgs>(args: SelectSubset<T, GatewayRouteUpsertArgs<ExtArgs>>): Prisma__GatewayRouteClient<$Result.GetResult<Prisma.$GatewayRoutePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GatewayRoutes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GatewayRouteCountArgs} args - Arguments to filter GatewayRoutes to count.
     * @example
     * // Count the number of GatewayRoutes
     * const count = await prisma.gatewayRoute.count({
     *   where: {
     *     // ... the filter for the GatewayRoutes we want to count
     *   }
     * })
    **/
    count<T extends GatewayRouteCountArgs>(
      args?: Subset<T, GatewayRouteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GatewayRouteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GatewayRoute.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GatewayRouteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends GatewayRouteAggregateArgs>(args: Subset<T, GatewayRouteAggregateArgs>): Prisma.PrismaPromise<GetGatewayRouteAggregateType<T>>

    /**
     * Group by GatewayRoute.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GatewayRouteGroupByArgs} args - Group by arguments.
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
      T extends GatewayRouteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GatewayRouteGroupByArgs['orderBy'] }
        : { orderBy?: GatewayRouteGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, GatewayRouteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGatewayRouteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GatewayRoute model
   */
  readonly fields: GatewayRouteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GatewayRoute.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GatewayRouteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    gateway<T extends GatewayConfigDefaultArgs<ExtArgs> = {}>(args?: Subset<T, GatewayConfigDefaultArgs<ExtArgs>>): Prisma__GatewayConfigClient<$Result.GetResult<Prisma.$GatewayConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the GatewayRoute model
   */
  interface GatewayRouteFieldRefs {
    readonly id: FieldRef<"GatewayRoute", 'String'>
    readonly gatewayId: FieldRef<"GatewayRoute", 'String'>
    readonly path: FieldRef<"GatewayRoute", 'String'>
    readonly targetService: FieldRef<"GatewayRoute", 'String'>
    readonly stripPrefix: FieldRef<"GatewayRoute", 'Boolean'>
    readonly rateLimit: FieldRef<"GatewayRoute", 'Int'>
    readonly timeout: FieldRef<"GatewayRoute", 'Int'>
    readonly order: FieldRef<"GatewayRoute", 'Int'>
    readonly isActive: FieldRef<"GatewayRoute", 'Boolean'>
    readonly createdAt: FieldRef<"GatewayRoute", 'DateTime'>
    readonly updatedAt: FieldRef<"GatewayRoute", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GatewayRoute findUnique
   */
  export type GatewayRouteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayRoute
     */
    select?: GatewayRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayRoute
     */
    omit?: GatewayRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayRouteInclude<ExtArgs> | null
    /**
     * Filter, which GatewayRoute to fetch.
     */
    where: GatewayRouteWhereUniqueInput
  }

  /**
   * GatewayRoute findUniqueOrThrow
   */
  export type GatewayRouteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayRoute
     */
    select?: GatewayRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayRoute
     */
    omit?: GatewayRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayRouteInclude<ExtArgs> | null
    /**
     * Filter, which GatewayRoute to fetch.
     */
    where: GatewayRouteWhereUniqueInput
  }

  /**
   * GatewayRoute findFirst
   */
  export type GatewayRouteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayRoute
     */
    select?: GatewayRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayRoute
     */
    omit?: GatewayRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayRouteInclude<ExtArgs> | null
    /**
     * Filter, which GatewayRoute to fetch.
     */
    where?: GatewayRouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GatewayRoutes to fetch.
     */
    orderBy?: GatewayRouteOrderByWithRelationInput | GatewayRouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GatewayRoutes.
     */
    cursor?: GatewayRouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GatewayRoutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GatewayRoutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GatewayRoutes.
     */
    distinct?: GatewayRouteScalarFieldEnum | GatewayRouteScalarFieldEnum[]
  }

  /**
   * GatewayRoute findFirstOrThrow
   */
  export type GatewayRouteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayRoute
     */
    select?: GatewayRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayRoute
     */
    omit?: GatewayRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayRouteInclude<ExtArgs> | null
    /**
     * Filter, which GatewayRoute to fetch.
     */
    where?: GatewayRouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GatewayRoutes to fetch.
     */
    orderBy?: GatewayRouteOrderByWithRelationInput | GatewayRouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GatewayRoutes.
     */
    cursor?: GatewayRouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GatewayRoutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GatewayRoutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GatewayRoutes.
     */
    distinct?: GatewayRouteScalarFieldEnum | GatewayRouteScalarFieldEnum[]
  }

  /**
   * GatewayRoute findMany
   */
  export type GatewayRouteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayRoute
     */
    select?: GatewayRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayRoute
     */
    omit?: GatewayRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayRouteInclude<ExtArgs> | null
    /**
     * Filter, which GatewayRoutes to fetch.
     */
    where?: GatewayRouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GatewayRoutes to fetch.
     */
    orderBy?: GatewayRouteOrderByWithRelationInput | GatewayRouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GatewayRoutes.
     */
    cursor?: GatewayRouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GatewayRoutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GatewayRoutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GatewayRoutes.
     */
    distinct?: GatewayRouteScalarFieldEnum | GatewayRouteScalarFieldEnum[]
  }

  /**
   * GatewayRoute create
   */
  export type GatewayRouteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayRoute
     */
    select?: GatewayRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayRoute
     */
    omit?: GatewayRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayRouteInclude<ExtArgs> | null
    /**
     * The data needed to create a GatewayRoute.
     */
    data: XOR<GatewayRouteCreateInput, GatewayRouteUncheckedCreateInput>
  }

  /**
   * GatewayRoute createMany
   */
  export type GatewayRouteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GatewayRoutes.
     */
    data: GatewayRouteCreateManyInput | GatewayRouteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GatewayRoute update
   */
  export type GatewayRouteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayRoute
     */
    select?: GatewayRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayRoute
     */
    omit?: GatewayRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayRouteInclude<ExtArgs> | null
    /**
     * The data needed to update a GatewayRoute.
     */
    data: XOR<GatewayRouteUpdateInput, GatewayRouteUncheckedUpdateInput>
    /**
     * Choose, which GatewayRoute to update.
     */
    where: GatewayRouteWhereUniqueInput
  }

  /**
   * GatewayRoute updateMany
   */
  export type GatewayRouteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GatewayRoutes.
     */
    data: XOR<GatewayRouteUpdateManyMutationInput, GatewayRouteUncheckedUpdateManyInput>
    /**
     * Filter which GatewayRoutes to update
     */
    where?: GatewayRouteWhereInput
    /**
     * Limit how many GatewayRoutes to update.
     */
    limit?: number
  }

  /**
   * GatewayRoute upsert
   */
  export type GatewayRouteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayRoute
     */
    select?: GatewayRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayRoute
     */
    omit?: GatewayRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayRouteInclude<ExtArgs> | null
    /**
     * The filter to search for the GatewayRoute to update in case it exists.
     */
    where: GatewayRouteWhereUniqueInput
    /**
     * In case the GatewayRoute found by the `where` argument doesn't exist, create a new GatewayRoute with this data.
     */
    create: XOR<GatewayRouteCreateInput, GatewayRouteUncheckedCreateInput>
    /**
     * In case the GatewayRoute was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GatewayRouteUpdateInput, GatewayRouteUncheckedUpdateInput>
  }

  /**
   * GatewayRoute delete
   */
  export type GatewayRouteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayRoute
     */
    select?: GatewayRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayRoute
     */
    omit?: GatewayRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayRouteInclude<ExtArgs> | null
    /**
     * Filter which GatewayRoute to delete.
     */
    where: GatewayRouteWhereUniqueInput
  }

  /**
   * GatewayRoute deleteMany
   */
  export type GatewayRouteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GatewayRoutes to delete
     */
    where?: GatewayRouteWhereInput
    /**
     * Limit how many GatewayRoutes to delete.
     */
    limit?: number
  }

  /**
   * GatewayRoute without action
   */
  export type GatewayRouteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GatewayRoute
     */
    select?: GatewayRouteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GatewayRoute
     */
    omit?: GatewayRouteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GatewayRouteInclude<ExtArgs> | null
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


  export const ApiPermissionScalarFieldEnum: {
    id: 'id',
    path: 'path',
    method: 'method',
    permissions: 'permissions',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ApiPermissionScalarFieldEnum = (typeof ApiPermissionScalarFieldEnum)[keyof typeof ApiPermissionScalarFieldEnum]


  export const ServiceEndpointScalarFieldEnum: {
    id: 'id',
    serviceName: 'serviceName',
    endpoint: 'endpoint',
    status: 'status',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ServiceEndpointScalarFieldEnum = (typeof ServiceEndpointScalarFieldEnum)[keyof typeof ServiceEndpointScalarFieldEnum]


  export const LgspIntegrationConfigScalarFieldEnum: {
    id: 'id',
    name: 'name',
    serviceCode: 'serviceCode',
    apiUrl: 'apiUrl',
    authType: 'authType',
    authUrl: 'authUrl',
    authPayload: 'authPayload',
    tokenPath: 'tokenPath',
    cachedToken: 'cachedToken',
    tokenExpiresAt: 'tokenExpiresAt',
    requestMethod: 'requestMethod',
    requestParams: 'requestParams',
    displayType: 'displayType',
    chartConfig: 'chartConfig',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type LgspIntegrationConfigScalarFieldEnum = (typeof LgspIntegrationConfigScalarFieldEnum)[keyof typeof LgspIntegrationConfigScalarFieldEnum]


  export const GatewayConfigScalarFieldEnum: {
    id: 'id',
    name: 'name',
    provider: 'provider',
    httpPort: 'httpPort',
    httpsPort: 'httpsPort',
    enableHttps: 'enableHttps',
    sslCert: 'sslCert',
    sslKey: 'sslKey',
    rawConfig: 'rawConfig',
    isActive: 'isActive',
    version: 'version',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GatewayConfigScalarFieldEnum = (typeof GatewayConfigScalarFieldEnum)[keyof typeof GatewayConfigScalarFieldEnum]


  export const GatewayRouteScalarFieldEnum: {
    id: 'id',
    gatewayId: 'gatewayId',
    path: 'path',
    targetService: 'targetService',
    stripPrefix: 'stripPrefix',
    rateLimit: 'rateLimit',
    timeout: 'timeout',
    order: 'order',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GatewayRouteScalarFieldEnum = (typeof GatewayRouteScalarFieldEnum)[keyof typeof GatewayRouteScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


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


  export const ApiPermissionOrderByRelevanceFieldEnum: {
    id: 'id',
    path: 'path',
    method: 'method'
  };

  export type ApiPermissionOrderByRelevanceFieldEnum = (typeof ApiPermissionOrderByRelevanceFieldEnum)[keyof typeof ApiPermissionOrderByRelevanceFieldEnum]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const ServiceEndpointOrderByRelevanceFieldEnum: {
    id: 'id',
    serviceName: 'serviceName',
    endpoint: 'endpoint',
    status: 'status',
    description: 'description'
  };

  export type ServiceEndpointOrderByRelevanceFieldEnum = (typeof ServiceEndpointOrderByRelevanceFieldEnum)[keyof typeof ServiceEndpointOrderByRelevanceFieldEnum]


  export const LgspIntegrationConfigOrderByRelevanceFieldEnum: {
    id: 'id',
    name: 'name',
    serviceCode: 'serviceCode',
    apiUrl: 'apiUrl',
    authType: 'authType',
    authUrl: 'authUrl',
    tokenPath: 'tokenPath',
    cachedToken: 'cachedToken',
    requestMethod: 'requestMethod',
    displayType: 'displayType'
  };

  export type LgspIntegrationConfigOrderByRelevanceFieldEnum = (typeof LgspIntegrationConfigOrderByRelevanceFieldEnum)[keyof typeof LgspIntegrationConfigOrderByRelevanceFieldEnum]


  export const GatewayConfigOrderByRelevanceFieldEnum: {
    id: 'id',
    name: 'name',
    provider: 'provider',
    sslCert: 'sslCert',
    sslKey: 'sslKey',
    rawConfig: 'rawConfig'
  };

  export type GatewayConfigOrderByRelevanceFieldEnum = (typeof GatewayConfigOrderByRelevanceFieldEnum)[keyof typeof GatewayConfigOrderByRelevanceFieldEnum]


  export const GatewayRouteOrderByRelevanceFieldEnum: {
    id: 'id',
    gatewayId: 'gatewayId',
    path: 'path',
    targetService: 'targetService'
  };

  export type GatewayRouteOrderByRelevanceFieldEnum = (typeof GatewayRouteOrderByRelevanceFieldEnum)[keyof typeof GatewayRouteOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type ApiPermissionWhereInput = {
    AND?: ApiPermissionWhereInput | ApiPermissionWhereInput[]
    OR?: ApiPermissionWhereInput[]
    NOT?: ApiPermissionWhereInput | ApiPermissionWhereInput[]
    id?: StringFilter<"ApiPermission"> | string
    path?: StringFilter<"ApiPermission"> | string
    method?: StringFilter<"ApiPermission"> | string
    permissions?: JsonFilter<"ApiPermission">
    createdAt?: DateTimeFilter<"ApiPermission"> | Date | string
    updatedAt?: DateTimeFilter<"ApiPermission"> | Date | string
  }

  export type ApiPermissionOrderByWithRelationInput = {
    id?: SortOrder
    path?: SortOrder
    method?: SortOrder
    permissions?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: ApiPermissionOrderByRelevanceInput
  }

  export type ApiPermissionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ApiPermissionWhereInput | ApiPermissionWhereInput[]
    OR?: ApiPermissionWhereInput[]
    NOT?: ApiPermissionWhereInput | ApiPermissionWhereInput[]
    path?: StringFilter<"ApiPermission"> | string
    method?: StringFilter<"ApiPermission"> | string
    permissions?: JsonFilter<"ApiPermission">
    createdAt?: DateTimeFilter<"ApiPermission"> | Date | string
    updatedAt?: DateTimeFilter<"ApiPermission"> | Date | string
  }, "id">

  export type ApiPermissionOrderByWithAggregationInput = {
    id?: SortOrder
    path?: SortOrder
    method?: SortOrder
    permissions?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ApiPermissionCountOrderByAggregateInput
    _max?: ApiPermissionMaxOrderByAggregateInput
    _min?: ApiPermissionMinOrderByAggregateInput
  }

  export type ApiPermissionScalarWhereWithAggregatesInput = {
    AND?: ApiPermissionScalarWhereWithAggregatesInput | ApiPermissionScalarWhereWithAggregatesInput[]
    OR?: ApiPermissionScalarWhereWithAggregatesInput[]
    NOT?: ApiPermissionScalarWhereWithAggregatesInput | ApiPermissionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ApiPermission"> | string
    path?: StringWithAggregatesFilter<"ApiPermission"> | string
    method?: StringWithAggregatesFilter<"ApiPermission"> | string
    permissions?: JsonWithAggregatesFilter<"ApiPermission">
    createdAt?: DateTimeWithAggregatesFilter<"ApiPermission"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ApiPermission"> | Date | string
  }

  export type ServiceEndpointWhereInput = {
    AND?: ServiceEndpointWhereInput | ServiceEndpointWhereInput[]
    OR?: ServiceEndpointWhereInput[]
    NOT?: ServiceEndpointWhereInput | ServiceEndpointWhereInput[]
    id?: StringFilter<"ServiceEndpoint"> | string
    serviceName?: StringFilter<"ServiceEndpoint"> | string
    endpoint?: StringFilter<"ServiceEndpoint"> | string
    status?: StringFilter<"ServiceEndpoint"> | string
    description?: StringNullableFilter<"ServiceEndpoint"> | string | null
    createdAt?: DateTimeFilter<"ServiceEndpoint"> | Date | string
    updatedAt?: DateTimeFilter<"ServiceEndpoint"> | Date | string
  }

  export type ServiceEndpointOrderByWithRelationInput = {
    id?: SortOrder
    serviceName?: SortOrder
    endpoint?: SortOrder
    status?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: ServiceEndpointOrderByRelevanceInput
  }

  export type ServiceEndpointWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ServiceEndpointWhereInput | ServiceEndpointWhereInput[]
    OR?: ServiceEndpointWhereInput[]
    NOT?: ServiceEndpointWhereInput | ServiceEndpointWhereInput[]
    serviceName?: StringFilter<"ServiceEndpoint"> | string
    endpoint?: StringFilter<"ServiceEndpoint"> | string
    status?: StringFilter<"ServiceEndpoint"> | string
    description?: StringNullableFilter<"ServiceEndpoint"> | string | null
    createdAt?: DateTimeFilter<"ServiceEndpoint"> | Date | string
    updatedAt?: DateTimeFilter<"ServiceEndpoint"> | Date | string
  }, "id">

  export type ServiceEndpointOrderByWithAggregationInput = {
    id?: SortOrder
    serviceName?: SortOrder
    endpoint?: SortOrder
    status?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ServiceEndpointCountOrderByAggregateInput
    _max?: ServiceEndpointMaxOrderByAggregateInput
    _min?: ServiceEndpointMinOrderByAggregateInput
  }

  export type ServiceEndpointScalarWhereWithAggregatesInput = {
    AND?: ServiceEndpointScalarWhereWithAggregatesInput | ServiceEndpointScalarWhereWithAggregatesInput[]
    OR?: ServiceEndpointScalarWhereWithAggregatesInput[]
    NOT?: ServiceEndpointScalarWhereWithAggregatesInput | ServiceEndpointScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ServiceEndpoint"> | string
    serviceName?: StringWithAggregatesFilter<"ServiceEndpoint"> | string
    endpoint?: StringWithAggregatesFilter<"ServiceEndpoint"> | string
    status?: StringWithAggregatesFilter<"ServiceEndpoint"> | string
    description?: StringNullableWithAggregatesFilter<"ServiceEndpoint"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ServiceEndpoint"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ServiceEndpoint"> | Date | string
  }

  export type LgspIntegrationConfigWhereInput = {
    AND?: LgspIntegrationConfigWhereInput | LgspIntegrationConfigWhereInput[]
    OR?: LgspIntegrationConfigWhereInput[]
    NOT?: LgspIntegrationConfigWhereInput | LgspIntegrationConfigWhereInput[]
    id?: StringFilter<"LgspIntegrationConfig"> | string
    name?: StringFilter<"LgspIntegrationConfig"> | string
    serviceCode?: StringFilter<"LgspIntegrationConfig"> | string
    apiUrl?: StringFilter<"LgspIntegrationConfig"> | string
    authType?: StringFilter<"LgspIntegrationConfig"> | string
    authUrl?: StringNullableFilter<"LgspIntegrationConfig"> | string | null
    authPayload?: JsonNullableFilter<"LgspIntegrationConfig">
    tokenPath?: StringNullableFilter<"LgspIntegrationConfig"> | string | null
    cachedToken?: StringNullableFilter<"LgspIntegrationConfig"> | string | null
    tokenExpiresAt?: DateTimeNullableFilter<"LgspIntegrationConfig"> | Date | string | null
    requestMethod?: StringFilter<"LgspIntegrationConfig"> | string
    requestParams?: JsonNullableFilter<"LgspIntegrationConfig">
    displayType?: StringFilter<"LgspIntegrationConfig"> | string
    chartConfig?: JsonNullableFilter<"LgspIntegrationConfig">
    isActive?: BoolFilter<"LgspIntegrationConfig"> | boolean
    createdAt?: DateTimeFilter<"LgspIntegrationConfig"> | Date | string
    updatedAt?: DateTimeFilter<"LgspIntegrationConfig"> | Date | string
  }

  export type LgspIntegrationConfigOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    serviceCode?: SortOrder
    apiUrl?: SortOrder
    authType?: SortOrder
    authUrl?: SortOrderInput | SortOrder
    authPayload?: SortOrderInput | SortOrder
    tokenPath?: SortOrderInput | SortOrder
    cachedToken?: SortOrderInput | SortOrder
    tokenExpiresAt?: SortOrderInput | SortOrder
    requestMethod?: SortOrder
    requestParams?: SortOrderInput | SortOrder
    displayType?: SortOrder
    chartConfig?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: LgspIntegrationConfigOrderByRelevanceInput
  }

  export type LgspIntegrationConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    serviceCode?: string
    AND?: LgspIntegrationConfigWhereInput | LgspIntegrationConfigWhereInput[]
    OR?: LgspIntegrationConfigWhereInput[]
    NOT?: LgspIntegrationConfigWhereInput | LgspIntegrationConfigWhereInput[]
    name?: StringFilter<"LgspIntegrationConfig"> | string
    apiUrl?: StringFilter<"LgspIntegrationConfig"> | string
    authType?: StringFilter<"LgspIntegrationConfig"> | string
    authUrl?: StringNullableFilter<"LgspIntegrationConfig"> | string | null
    authPayload?: JsonNullableFilter<"LgspIntegrationConfig">
    tokenPath?: StringNullableFilter<"LgspIntegrationConfig"> | string | null
    cachedToken?: StringNullableFilter<"LgspIntegrationConfig"> | string | null
    tokenExpiresAt?: DateTimeNullableFilter<"LgspIntegrationConfig"> | Date | string | null
    requestMethod?: StringFilter<"LgspIntegrationConfig"> | string
    requestParams?: JsonNullableFilter<"LgspIntegrationConfig">
    displayType?: StringFilter<"LgspIntegrationConfig"> | string
    chartConfig?: JsonNullableFilter<"LgspIntegrationConfig">
    isActive?: BoolFilter<"LgspIntegrationConfig"> | boolean
    createdAt?: DateTimeFilter<"LgspIntegrationConfig"> | Date | string
    updatedAt?: DateTimeFilter<"LgspIntegrationConfig"> | Date | string
  }, "id" | "serviceCode">

  export type LgspIntegrationConfigOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    serviceCode?: SortOrder
    apiUrl?: SortOrder
    authType?: SortOrder
    authUrl?: SortOrderInput | SortOrder
    authPayload?: SortOrderInput | SortOrder
    tokenPath?: SortOrderInput | SortOrder
    cachedToken?: SortOrderInput | SortOrder
    tokenExpiresAt?: SortOrderInput | SortOrder
    requestMethod?: SortOrder
    requestParams?: SortOrderInput | SortOrder
    displayType?: SortOrder
    chartConfig?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: LgspIntegrationConfigCountOrderByAggregateInput
    _max?: LgspIntegrationConfigMaxOrderByAggregateInput
    _min?: LgspIntegrationConfigMinOrderByAggregateInput
  }

  export type LgspIntegrationConfigScalarWhereWithAggregatesInput = {
    AND?: LgspIntegrationConfigScalarWhereWithAggregatesInput | LgspIntegrationConfigScalarWhereWithAggregatesInput[]
    OR?: LgspIntegrationConfigScalarWhereWithAggregatesInput[]
    NOT?: LgspIntegrationConfigScalarWhereWithAggregatesInput | LgspIntegrationConfigScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LgspIntegrationConfig"> | string
    name?: StringWithAggregatesFilter<"LgspIntegrationConfig"> | string
    serviceCode?: StringWithAggregatesFilter<"LgspIntegrationConfig"> | string
    apiUrl?: StringWithAggregatesFilter<"LgspIntegrationConfig"> | string
    authType?: StringWithAggregatesFilter<"LgspIntegrationConfig"> | string
    authUrl?: StringNullableWithAggregatesFilter<"LgspIntegrationConfig"> | string | null
    authPayload?: JsonNullableWithAggregatesFilter<"LgspIntegrationConfig">
    tokenPath?: StringNullableWithAggregatesFilter<"LgspIntegrationConfig"> | string | null
    cachedToken?: StringNullableWithAggregatesFilter<"LgspIntegrationConfig"> | string | null
    tokenExpiresAt?: DateTimeNullableWithAggregatesFilter<"LgspIntegrationConfig"> | Date | string | null
    requestMethod?: StringWithAggregatesFilter<"LgspIntegrationConfig"> | string
    requestParams?: JsonNullableWithAggregatesFilter<"LgspIntegrationConfig">
    displayType?: StringWithAggregatesFilter<"LgspIntegrationConfig"> | string
    chartConfig?: JsonNullableWithAggregatesFilter<"LgspIntegrationConfig">
    isActive?: BoolWithAggregatesFilter<"LgspIntegrationConfig"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"LgspIntegrationConfig"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"LgspIntegrationConfig"> | Date | string
  }

  export type GatewayConfigWhereInput = {
    AND?: GatewayConfigWhereInput | GatewayConfigWhereInput[]
    OR?: GatewayConfigWhereInput[]
    NOT?: GatewayConfigWhereInput | GatewayConfigWhereInput[]
    id?: StringFilter<"GatewayConfig"> | string
    name?: StringFilter<"GatewayConfig"> | string
    provider?: StringFilter<"GatewayConfig"> | string
    httpPort?: IntFilter<"GatewayConfig"> | number
    httpsPort?: IntFilter<"GatewayConfig"> | number
    enableHttps?: BoolFilter<"GatewayConfig"> | boolean
    sslCert?: StringNullableFilter<"GatewayConfig"> | string | null
    sslKey?: StringNullableFilter<"GatewayConfig"> | string | null
    rawConfig?: StringNullableFilter<"GatewayConfig"> | string | null
    isActive?: BoolFilter<"GatewayConfig"> | boolean
    version?: IntFilter<"GatewayConfig"> | number
    createdAt?: DateTimeFilter<"GatewayConfig"> | Date | string
    updatedAt?: DateTimeFilter<"GatewayConfig"> | Date | string
    routes?: GatewayRouteListRelationFilter
  }

  export type GatewayConfigOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    provider?: SortOrder
    httpPort?: SortOrder
    httpsPort?: SortOrder
    enableHttps?: SortOrder
    sslCert?: SortOrderInput | SortOrder
    sslKey?: SortOrderInput | SortOrder
    rawConfig?: SortOrderInput | SortOrder
    isActive?: SortOrder
    version?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    routes?: GatewayRouteOrderByRelationAggregateInput
    _relevance?: GatewayConfigOrderByRelevanceInput
  }

  export type GatewayConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GatewayConfigWhereInput | GatewayConfigWhereInput[]
    OR?: GatewayConfigWhereInput[]
    NOT?: GatewayConfigWhereInput | GatewayConfigWhereInput[]
    name?: StringFilter<"GatewayConfig"> | string
    provider?: StringFilter<"GatewayConfig"> | string
    httpPort?: IntFilter<"GatewayConfig"> | number
    httpsPort?: IntFilter<"GatewayConfig"> | number
    enableHttps?: BoolFilter<"GatewayConfig"> | boolean
    sslCert?: StringNullableFilter<"GatewayConfig"> | string | null
    sslKey?: StringNullableFilter<"GatewayConfig"> | string | null
    rawConfig?: StringNullableFilter<"GatewayConfig"> | string | null
    isActive?: BoolFilter<"GatewayConfig"> | boolean
    version?: IntFilter<"GatewayConfig"> | number
    createdAt?: DateTimeFilter<"GatewayConfig"> | Date | string
    updatedAt?: DateTimeFilter<"GatewayConfig"> | Date | string
    routes?: GatewayRouteListRelationFilter
  }, "id">

  export type GatewayConfigOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    provider?: SortOrder
    httpPort?: SortOrder
    httpsPort?: SortOrder
    enableHttps?: SortOrder
    sslCert?: SortOrderInput | SortOrder
    sslKey?: SortOrderInput | SortOrder
    rawConfig?: SortOrderInput | SortOrder
    isActive?: SortOrder
    version?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GatewayConfigCountOrderByAggregateInput
    _avg?: GatewayConfigAvgOrderByAggregateInput
    _max?: GatewayConfigMaxOrderByAggregateInput
    _min?: GatewayConfigMinOrderByAggregateInput
    _sum?: GatewayConfigSumOrderByAggregateInput
  }

  export type GatewayConfigScalarWhereWithAggregatesInput = {
    AND?: GatewayConfigScalarWhereWithAggregatesInput | GatewayConfigScalarWhereWithAggregatesInput[]
    OR?: GatewayConfigScalarWhereWithAggregatesInput[]
    NOT?: GatewayConfigScalarWhereWithAggregatesInput | GatewayConfigScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GatewayConfig"> | string
    name?: StringWithAggregatesFilter<"GatewayConfig"> | string
    provider?: StringWithAggregatesFilter<"GatewayConfig"> | string
    httpPort?: IntWithAggregatesFilter<"GatewayConfig"> | number
    httpsPort?: IntWithAggregatesFilter<"GatewayConfig"> | number
    enableHttps?: BoolWithAggregatesFilter<"GatewayConfig"> | boolean
    sslCert?: StringNullableWithAggregatesFilter<"GatewayConfig"> | string | null
    sslKey?: StringNullableWithAggregatesFilter<"GatewayConfig"> | string | null
    rawConfig?: StringNullableWithAggregatesFilter<"GatewayConfig"> | string | null
    isActive?: BoolWithAggregatesFilter<"GatewayConfig"> | boolean
    version?: IntWithAggregatesFilter<"GatewayConfig"> | number
    createdAt?: DateTimeWithAggregatesFilter<"GatewayConfig"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"GatewayConfig"> | Date | string
  }

  export type GatewayRouteWhereInput = {
    AND?: GatewayRouteWhereInput | GatewayRouteWhereInput[]
    OR?: GatewayRouteWhereInput[]
    NOT?: GatewayRouteWhereInput | GatewayRouteWhereInput[]
    id?: StringFilter<"GatewayRoute"> | string
    gatewayId?: StringFilter<"GatewayRoute"> | string
    path?: StringFilter<"GatewayRoute"> | string
    targetService?: StringFilter<"GatewayRoute"> | string
    stripPrefix?: BoolFilter<"GatewayRoute"> | boolean
    rateLimit?: IntNullableFilter<"GatewayRoute"> | number | null
    timeout?: IntNullableFilter<"GatewayRoute"> | number | null
    order?: IntFilter<"GatewayRoute"> | number
    isActive?: BoolFilter<"GatewayRoute"> | boolean
    createdAt?: DateTimeFilter<"GatewayRoute"> | Date | string
    updatedAt?: DateTimeFilter<"GatewayRoute"> | Date | string
    gateway?: XOR<GatewayConfigScalarRelationFilter, GatewayConfigWhereInput>
  }

  export type GatewayRouteOrderByWithRelationInput = {
    id?: SortOrder
    gatewayId?: SortOrder
    path?: SortOrder
    targetService?: SortOrder
    stripPrefix?: SortOrder
    rateLimit?: SortOrderInput | SortOrder
    timeout?: SortOrderInput | SortOrder
    order?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    gateway?: GatewayConfigOrderByWithRelationInput
    _relevance?: GatewayRouteOrderByRelevanceInput
  }

  export type GatewayRouteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GatewayRouteWhereInput | GatewayRouteWhereInput[]
    OR?: GatewayRouteWhereInput[]
    NOT?: GatewayRouteWhereInput | GatewayRouteWhereInput[]
    gatewayId?: StringFilter<"GatewayRoute"> | string
    path?: StringFilter<"GatewayRoute"> | string
    targetService?: StringFilter<"GatewayRoute"> | string
    stripPrefix?: BoolFilter<"GatewayRoute"> | boolean
    rateLimit?: IntNullableFilter<"GatewayRoute"> | number | null
    timeout?: IntNullableFilter<"GatewayRoute"> | number | null
    order?: IntFilter<"GatewayRoute"> | number
    isActive?: BoolFilter<"GatewayRoute"> | boolean
    createdAt?: DateTimeFilter<"GatewayRoute"> | Date | string
    updatedAt?: DateTimeFilter<"GatewayRoute"> | Date | string
    gateway?: XOR<GatewayConfigScalarRelationFilter, GatewayConfigWhereInput>
  }, "id">

  export type GatewayRouteOrderByWithAggregationInput = {
    id?: SortOrder
    gatewayId?: SortOrder
    path?: SortOrder
    targetService?: SortOrder
    stripPrefix?: SortOrder
    rateLimit?: SortOrderInput | SortOrder
    timeout?: SortOrderInput | SortOrder
    order?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GatewayRouteCountOrderByAggregateInput
    _avg?: GatewayRouteAvgOrderByAggregateInput
    _max?: GatewayRouteMaxOrderByAggregateInput
    _min?: GatewayRouteMinOrderByAggregateInput
    _sum?: GatewayRouteSumOrderByAggregateInput
  }

  export type GatewayRouteScalarWhereWithAggregatesInput = {
    AND?: GatewayRouteScalarWhereWithAggregatesInput | GatewayRouteScalarWhereWithAggregatesInput[]
    OR?: GatewayRouteScalarWhereWithAggregatesInput[]
    NOT?: GatewayRouteScalarWhereWithAggregatesInput | GatewayRouteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GatewayRoute"> | string
    gatewayId?: StringWithAggregatesFilter<"GatewayRoute"> | string
    path?: StringWithAggregatesFilter<"GatewayRoute"> | string
    targetService?: StringWithAggregatesFilter<"GatewayRoute"> | string
    stripPrefix?: BoolWithAggregatesFilter<"GatewayRoute"> | boolean
    rateLimit?: IntNullableWithAggregatesFilter<"GatewayRoute"> | number | null
    timeout?: IntNullableWithAggregatesFilter<"GatewayRoute"> | number | null
    order?: IntWithAggregatesFilter<"GatewayRoute"> | number
    isActive?: BoolWithAggregatesFilter<"GatewayRoute"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"GatewayRoute"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"GatewayRoute"> | Date | string
  }

  export type ApiPermissionCreateInput = {
    id?: string
    path: string
    method: string
    permissions: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApiPermissionUncheckedCreateInput = {
    id?: string
    path: string
    method: string
    permissions: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApiPermissionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    permissions?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApiPermissionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    permissions?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApiPermissionCreateManyInput = {
    id?: string
    path: string
    method: string
    permissions: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApiPermissionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    permissions?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApiPermissionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    permissions?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceEndpointCreateInput = {
    id?: string
    serviceName: string
    endpoint: string
    status?: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ServiceEndpointUncheckedCreateInput = {
    id?: string
    serviceName: string
    endpoint: string
    status?: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ServiceEndpointUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    endpoint?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceEndpointUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    endpoint?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceEndpointCreateManyInput = {
    id?: string
    serviceName: string
    endpoint: string
    status?: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ServiceEndpointUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    endpoint?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceEndpointUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    endpoint?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LgspIntegrationConfigCreateInput = {
    id?: string
    name: string
    serviceCode: string
    apiUrl: string
    authType?: string
    authUrl?: string | null
    authPayload?: NullableJsonNullValueInput | InputJsonValue
    tokenPath?: string | null
    cachedToken?: string | null
    tokenExpiresAt?: Date | string | null
    requestMethod?: string
    requestParams?: NullableJsonNullValueInput | InputJsonValue
    displayType?: string
    chartConfig?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LgspIntegrationConfigUncheckedCreateInput = {
    id?: string
    name: string
    serviceCode: string
    apiUrl: string
    authType?: string
    authUrl?: string | null
    authPayload?: NullableJsonNullValueInput | InputJsonValue
    tokenPath?: string | null
    cachedToken?: string | null
    tokenExpiresAt?: Date | string | null
    requestMethod?: string
    requestParams?: NullableJsonNullValueInput | InputJsonValue
    displayType?: string
    chartConfig?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LgspIntegrationConfigUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    apiUrl?: StringFieldUpdateOperationsInput | string
    authType?: StringFieldUpdateOperationsInput | string
    authUrl?: NullableStringFieldUpdateOperationsInput | string | null
    authPayload?: NullableJsonNullValueInput | InputJsonValue
    tokenPath?: NullableStringFieldUpdateOperationsInput | string | null
    cachedToken?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    requestMethod?: StringFieldUpdateOperationsInput | string
    requestParams?: NullableJsonNullValueInput | InputJsonValue
    displayType?: StringFieldUpdateOperationsInput | string
    chartConfig?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LgspIntegrationConfigUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    apiUrl?: StringFieldUpdateOperationsInput | string
    authType?: StringFieldUpdateOperationsInput | string
    authUrl?: NullableStringFieldUpdateOperationsInput | string | null
    authPayload?: NullableJsonNullValueInput | InputJsonValue
    tokenPath?: NullableStringFieldUpdateOperationsInput | string | null
    cachedToken?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    requestMethod?: StringFieldUpdateOperationsInput | string
    requestParams?: NullableJsonNullValueInput | InputJsonValue
    displayType?: StringFieldUpdateOperationsInput | string
    chartConfig?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LgspIntegrationConfigCreateManyInput = {
    id?: string
    name: string
    serviceCode: string
    apiUrl: string
    authType?: string
    authUrl?: string | null
    authPayload?: NullableJsonNullValueInput | InputJsonValue
    tokenPath?: string | null
    cachedToken?: string | null
    tokenExpiresAt?: Date | string | null
    requestMethod?: string
    requestParams?: NullableJsonNullValueInput | InputJsonValue
    displayType?: string
    chartConfig?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LgspIntegrationConfigUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    apiUrl?: StringFieldUpdateOperationsInput | string
    authType?: StringFieldUpdateOperationsInput | string
    authUrl?: NullableStringFieldUpdateOperationsInput | string | null
    authPayload?: NullableJsonNullValueInput | InputJsonValue
    tokenPath?: NullableStringFieldUpdateOperationsInput | string | null
    cachedToken?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    requestMethod?: StringFieldUpdateOperationsInput | string
    requestParams?: NullableJsonNullValueInput | InputJsonValue
    displayType?: StringFieldUpdateOperationsInput | string
    chartConfig?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LgspIntegrationConfigUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    apiUrl?: StringFieldUpdateOperationsInput | string
    authType?: StringFieldUpdateOperationsInput | string
    authUrl?: NullableStringFieldUpdateOperationsInput | string | null
    authPayload?: NullableJsonNullValueInput | InputJsonValue
    tokenPath?: NullableStringFieldUpdateOperationsInput | string | null
    cachedToken?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    requestMethod?: StringFieldUpdateOperationsInput | string
    requestParams?: NullableJsonNullValueInput | InputJsonValue
    displayType?: StringFieldUpdateOperationsInput | string
    chartConfig?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GatewayConfigCreateInput = {
    id?: string
    name?: string
    provider?: string
    httpPort?: number
    httpsPort?: number
    enableHttps?: boolean
    sslCert?: string | null
    sslKey?: string | null
    rawConfig?: string | null
    isActive?: boolean
    version?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    routes?: GatewayRouteCreateNestedManyWithoutGatewayInput
  }

  export type GatewayConfigUncheckedCreateInput = {
    id?: string
    name?: string
    provider?: string
    httpPort?: number
    httpsPort?: number
    enableHttps?: boolean
    sslCert?: string | null
    sslKey?: string | null
    rawConfig?: string | null
    isActive?: boolean
    version?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    routes?: GatewayRouteUncheckedCreateNestedManyWithoutGatewayInput
  }

  export type GatewayConfigUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    httpPort?: IntFieldUpdateOperationsInput | number
    httpsPort?: IntFieldUpdateOperationsInput | number
    enableHttps?: BoolFieldUpdateOperationsInput | boolean
    sslCert?: NullableStringFieldUpdateOperationsInput | string | null
    sslKey?: NullableStringFieldUpdateOperationsInput | string | null
    rawConfig?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    version?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    routes?: GatewayRouteUpdateManyWithoutGatewayNestedInput
  }

  export type GatewayConfigUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    httpPort?: IntFieldUpdateOperationsInput | number
    httpsPort?: IntFieldUpdateOperationsInput | number
    enableHttps?: BoolFieldUpdateOperationsInput | boolean
    sslCert?: NullableStringFieldUpdateOperationsInput | string | null
    sslKey?: NullableStringFieldUpdateOperationsInput | string | null
    rawConfig?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    version?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    routes?: GatewayRouteUncheckedUpdateManyWithoutGatewayNestedInput
  }

  export type GatewayConfigCreateManyInput = {
    id?: string
    name?: string
    provider?: string
    httpPort?: number
    httpsPort?: number
    enableHttps?: boolean
    sslCert?: string | null
    sslKey?: string | null
    rawConfig?: string | null
    isActive?: boolean
    version?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GatewayConfigUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    httpPort?: IntFieldUpdateOperationsInput | number
    httpsPort?: IntFieldUpdateOperationsInput | number
    enableHttps?: BoolFieldUpdateOperationsInput | boolean
    sslCert?: NullableStringFieldUpdateOperationsInput | string | null
    sslKey?: NullableStringFieldUpdateOperationsInput | string | null
    rawConfig?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    version?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GatewayConfigUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    httpPort?: IntFieldUpdateOperationsInput | number
    httpsPort?: IntFieldUpdateOperationsInput | number
    enableHttps?: BoolFieldUpdateOperationsInput | boolean
    sslCert?: NullableStringFieldUpdateOperationsInput | string | null
    sslKey?: NullableStringFieldUpdateOperationsInput | string | null
    rawConfig?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    version?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GatewayRouteCreateInput = {
    id?: string
    path: string
    targetService: string
    stripPrefix?: boolean
    rateLimit?: number | null
    timeout?: number | null
    order?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    gateway: GatewayConfigCreateNestedOneWithoutRoutesInput
  }

  export type GatewayRouteUncheckedCreateInput = {
    id?: string
    gatewayId: string
    path: string
    targetService: string
    stripPrefix?: boolean
    rateLimit?: number | null
    timeout?: number | null
    order?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GatewayRouteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    targetService?: StringFieldUpdateOperationsInput | string
    stripPrefix?: BoolFieldUpdateOperationsInput | boolean
    rateLimit?: NullableIntFieldUpdateOperationsInput | number | null
    timeout?: NullableIntFieldUpdateOperationsInput | number | null
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    gateway?: GatewayConfigUpdateOneRequiredWithoutRoutesNestedInput
  }

  export type GatewayRouteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    gatewayId?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    targetService?: StringFieldUpdateOperationsInput | string
    stripPrefix?: BoolFieldUpdateOperationsInput | boolean
    rateLimit?: NullableIntFieldUpdateOperationsInput | number | null
    timeout?: NullableIntFieldUpdateOperationsInput | number | null
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GatewayRouteCreateManyInput = {
    id?: string
    gatewayId: string
    path: string
    targetService: string
    stripPrefix?: boolean
    rateLimit?: number | null
    timeout?: number | null
    order?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GatewayRouteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    targetService?: StringFieldUpdateOperationsInput | string
    stripPrefix?: BoolFieldUpdateOperationsInput | boolean
    rateLimit?: NullableIntFieldUpdateOperationsInput | number | null
    timeout?: NullableIntFieldUpdateOperationsInput | number | null
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GatewayRouteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    gatewayId?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    targetService?: StringFieldUpdateOperationsInput | string
    stripPrefix?: BoolFieldUpdateOperationsInput | boolean
    rateLimit?: NullableIntFieldUpdateOperationsInput | number | null
    timeout?: NullableIntFieldUpdateOperationsInput | number | null
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
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
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
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

  export type ApiPermissionOrderByRelevanceInput = {
    fields: ApiPermissionOrderByRelevanceFieldEnum | ApiPermissionOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ApiPermissionCountOrderByAggregateInput = {
    id?: SortOrder
    path?: SortOrder
    method?: SortOrder
    permissions?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ApiPermissionMaxOrderByAggregateInput = {
    id?: SortOrder
    path?: SortOrder
    method?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ApiPermissionMinOrderByAggregateInput = {
    id?: SortOrder
    path?: SortOrder
    method?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
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
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
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

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ServiceEndpointOrderByRelevanceInput = {
    fields: ServiceEndpointOrderByRelevanceFieldEnum | ServiceEndpointOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ServiceEndpointCountOrderByAggregateInput = {
    id?: SortOrder
    serviceName?: SortOrder
    endpoint?: SortOrder
    status?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ServiceEndpointMaxOrderByAggregateInput = {
    id?: SortOrder
    serviceName?: SortOrder
    endpoint?: SortOrder
    status?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ServiceEndpointMinOrderByAggregateInput = {
    id?: SortOrder
    serviceName?: SortOrder
    endpoint?: SortOrder
    status?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type LgspIntegrationConfigOrderByRelevanceInput = {
    fields: LgspIntegrationConfigOrderByRelevanceFieldEnum | LgspIntegrationConfigOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type LgspIntegrationConfigCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    serviceCode?: SortOrder
    apiUrl?: SortOrder
    authType?: SortOrder
    authUrl?: SortOrder
    authPayload?: SortOrder
    tokenPath?: SortOrder
    cachedToken?: SortOrder
    tokenExpiresAt?: SortOrder
    requestMethod?: SortOrder
    requestParams?: SortOrder
    displayType?: SortOrder
    chartConfig?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LgspIntegrationConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    serviceCode?: SortOrder
    apiUrl?: SortOrder
    authType?: SortOrder
    authUrl?: SortOrder
    tokenPath?: SortOrder
    cachedToken?: SortOrder
    tokenExpiresAt?: SortOrder
    requestMethod?: SortOrder
    displayType?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LgspIntegrationConfigMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    serviceCode?: SortOrder
    apiUrl?: SortOrder
    authType?: SortOrder
    authUrl?: SortOrder
    tokenPath?: SortOrder
    cachedToken?: SortOrder
    tokenExpiresAt?: SortOrder
    requestMethod?: SortOrder
    displayType?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type GatewayRouteListRelationFilter = {
    every?: GatewayRouteWhereInput
    some?: GatewayRouteWhereInput
    none?: GatewayRouteWhereInput
  }

  export type GatewayRouteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GatewayConfigOrderByRelevanceInput = {
    fields: GatewayConfigOrderByRelevanceFieldEnum | GatewayConfigOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type GatewayConfigCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    provider?: SortOrder
    httpPort?: SortOrder
    httpsPort?: SortOrder
    enableHttps?: SortOrder
    sslCert?: SortOrder
    sslKey?: SortOrder
    rawConfig?: SortOrder
    isActive?: SortOrder
    version?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GatewayConfigAvgOrderByAggregateInput = {
    httpPort?: SortOrder
    httpsPort?: SortOrder
    version?: SortOrder
  }

  export type GatewayConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    provider?: SortOrder
    httpPort?: SortOrder
    httpsPort?: SortOrder
    enableHttps?: SortOrder
    sslCert?: SortOrder
    sslKey?: SortOrder
    rawConfig?: SortOrder
    isActive?: SortOrder
    version?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GatewayConfigMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    provider?: SortOrder
    httpPort?: SortOrder
    httpsPort?: SortOrder
    enableHttps?: SortOrder
    sslCert?: SortOrder
    sslKey?: SortOrder
    rawConfig?: SortOrder
    isActive?: SortOrder
    version?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GatewayConfigSumOrderByAggregateInput = {
    httpPort?: SortOrder
    httpsPort?: SortOrder
    version?: SortOrder
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

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type GatewayConfigScalarRelationFilter = {
    is?: GatewayConfigWhereInput
    isNot?: GatewayConfigWhereInput
  }

  export type GatewayRouteOrderByRelevanceInput = {
    fields: GatewayRouteOrderByRelevanceFieldEnum | GatewayRouteOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type GatewayRouteCountOrderByAggregateInput = {
    id?: SortOrder
    gatewayId?: SortOrder
    path?: SortOrder
    targetService?: SortOrder
    stripPrefix?: SortOrder
    rateLimit?: SortOrder
    timeout?: SortOrder
    order?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GatewayRouteAvgOrderByAggregateInput = {
    rateLimit?: SortOrder
    timeout?: SortOrder
    order?: SortOrder
  }

  export type GatewayRouteMaxOrderByAggregateInput = {
    id?: SortOrder
    gatewayId?: SortOrder
    path?: SortOrder
    targetService?: SortOrder
    stripPrefix?: SortOrder
    rateLimit?: SortOrder
    timeout?: SortOrder
    order?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GatewayRouteMinOrderByAggregateInput = {
    id?: SortOrder
    gatewayId?: SortOrder
    path?: SortOrder
    targetService?: SortOrder
    stripPrefix?: SortOrder
    rateLimit?: SortOrder
    timeout?: SortOrder
    order?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GatewayRouteSumOrderByAggregateInput = {
    rateLimit?: SortOrder
    timeout?: SortOrder
    order?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type GatewayRouteCreateNestedManyWithoutGatewayInput = {
    create?: XOR<GatewayRouteCreateWithoutGatewayInput, GatewayRouteUncheckedCreateWithoutGatewayInput> | GatewayRouteCreateWithoutGatewayInput[] | GatewayRouteUncheckedCreateWithoutGatewayInput[]
    connectOrCreate?: GatewayRouteCreateOrConnectWithoutGatewayInput | GatewayRouteCreateOrConnectWithoutGatewayInput[]
    createMany?: GatewayRouteCreateManyGatewayInputEnvelope
    connect?: GatewayRouteWhereUniqueInput | GatewayRouteWhereUniqueInput[]
  }

  export type GatewayRouteUncheckedCreateNestedManyWithoutGatewayInput = {
    create?: XOR<GatewayRouteCreateWithoutGatewayInput, GatewayRouteUncheckedCreateWithoutGatewayInput> | GatewayRouteCreateWithoutGatewayInput[] | GatewayRouteUncheckedCreateWithoutGatewayInput[]
    connectOrCreate?: GatewayRouteCreateOrConnectWithoutGatewayInput | GatewayRouteCreateOrConnectWithoutGatewayInput[]
    createMany?: GatewayRouteCreateManyGatewayInputEnvelope
    connect?: GatewayRouteWhereUniqueInput | GatewayRouteWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type GatewayRouteUpdateManyWithoutGatewayNestedInput = {
    create?: XOR<GatewayRouteCreateWithoutGatewayInput, GatewayRouteUncheckedCreateWithoutGatewayInput> | GatewayRouteCreateWithoutGatewayInput[] | GatewayRouteUncheckedCreateWithoutGatewayInput[]
    connectOrCreate?: GatewayRouteCreateOrConnectWithoutGatewayInput | GatewayRouteCreateOrConnectWithoutGatewayInput[]
    upsert?: GatewayRouteUpsertWithWhereUniqueWithoutGatewayInput | GatewayRouteUpsertWithWhereUniqueWithoutGatewayInput[]
    createMany?: GatewayRouteCreateManyGatewayInputEnvelope
    set?: GatewayRouteWhereUniqueInput | GatewayRouteWhereUniqueInput[]
    disconnect?: GatewayRouteWhereUniqueInput | GatewayRouteWhereUniqueInput[]
    delete?: GatewayRouteWhereUniqueInput | GatewayRouteWhereUniqueInput[]
    connect?: GatewayRouteWhereUniqueInput | GatewayRouteWhereUniqueInput[]
    update?: GatewayRouteUpdateWithWhereUniqueWithoutGatewayInput | GatewayRouteUpdateWithWhereUniqueWithoutGatewayInput[]
    updateMany?: GatewayRouteUpdateManyWithWhereWithoutGatewayInput | GatewayRouteUpdateManyWithWhereWithoutGatewayInput[]
    deleteMany?: GatewayRouteScalarWhereInput | GatewayRouteScalarWhereInput[]
  }

  export type GatewayRouteUncheckedUpdateManyWithoutGatewayNestedInput = {
    create?: XOR<GatewayRouteCreateWithoutGatewayInput, GatewayRouteUncheckedCreateWithoutGatewayInput> | GatewayRouteCreateWithoutGatewayInput[] | GatewayRouteUncheckedCreateWithoutGatewayInput[]
    connectOrCreate?: GatewayRouteCreateOrConnectWithoutGatewayInput | GatewayRouteCreateOrConnectWithoutGatewayInput[]
    upsert?: GatewayRouteUpsertWithWhereUniqueWithoutGatewayInput | GatewayRouteUpsertWithWhereUniqueWithoutGatewayInput[]
    createMany?: GatewayRouteCreateManyGatewayInputEnvelope
    set?: GatewayRouteWhereUniqueInput | GatewayRouteWhereUniqueInput[]
    disconnect?: GatewayRouteWhereUniqueInput | GatewayRouteWhereUniqueInput[]
    delete?: GatewayRouteWhereUniqueInput | GatewayRouteWhereUniqueInput[]
    connect?: GatewayRouteWhereUniqueInput | GatewayRouteWhereUniqueInput[]
    update?: GatewayRouteUpdateWithWhereUniqueWithoutGatewayInput | GatewayRouteUpdateWithWhereUniqueWithoutGatewayInput[]
    updateMany?: GatewayRouteUpdateManyWithWhereWithoutGatewayInput | GatewayRouteUpdateManyWithWhereWithoutGatewayInput[]
    deleteMany?: GatewayRouteScalarWhereInput | GatewayRouteScalarWhereInput[]
  }

  export type GatewayConfigCreateNestedOneWithoutRoutesInput = {
    create?: XOR<GatewayConfigCreateWithoutRoutesInput, GatewayConfigUncheckedCreateWithoutRoutesInput>
    connectOrCreate?: GatewayConfigCreateOrConnectWithoutRoutesInput
    connect?: GatewayConfigWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type GatewayConfigUpdateOneRequiredWithoutRoutesNestedInput = {
    create?: XOR<GatewayConfigCreateWithoutRoutesInput, GatewayConfigUncheckedCreateWithoutRoutesInput>
    connectOrCreate?: GatewayConfigCreateOrConnectWithoutRoutesInput
    upsert?: GatewayConfigUpsertWithoutRoutesInput
    connect?: GatewayConfigWhereUniqueInput
    update?: XOR<XOR<GatewayConfigUpdateToOneWithWhereWithoutRoutesInput, GatewayConfigUpdateWithoutRoutesInput>, GatewayConfigUncheckedUpdateWithoutRoutesInput>
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
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type GatewayRouteCreateWithoutGatewayInput = {
    id?: string
    path: string
    targetService: string
    stripPrefix?: boolean
    rateLimit?: number | null
    timeout?: number | null
    order?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GatewayRouteUncheckedCreateWithoutGatewayInput = {
    id?: string
    path: string
    targetService: string
    stripPrefix?: boolean
    rateLimit?: number | null
    timeout?: number | null
    order?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GatewayRouteCreateOrConnectWithoutGatewayInput = {
    where: GatewayRouteWhereUniqueInput
    create: XOR<GatewayRouteCreateWithoutGatewayInput, GatewayRouteUncheckedCreateWithoutGatewayInput>
  }

  export type GatewayRouteCreateManyGatewayInputEnvelope = {
    data: GatewayRouteCreateManyGatewayInput | GatewayRouteCreateManyGatewayInput[]
    skipDuplicates?: boolean
  }

  export type GatewayRouteUpsertWithWhereUniqueWithoutGatewayInput = {
    where: GatewayRouteWhereUniqueInput
    update: XOR<GatewayRouteUpdateWithoutGatewayInput, GatewayRouteUncheckedUpdateWithoutGatewayInput>
    create: XOR<GatewayRouteCreateWithoutGatewayInput, GatewayRouteUncheckedCreateWithoutGatewayInput>
  }

  export type GatewayRouteUpdateWithWhereUniqueWithoutGatewayInput = {
    where: GatewayRouteWhereUniqueInput
    data: XOR<GatewayRouteUpdateWithoutGatewayInput, GatewayRouteUncheckedUpdateWithoutGatewayInput>
  }

  export type GatewayRouteUpdateManyWithWhereWithoutGatewayInput = {
    where: GatewayRouteScalarWhereInput
    data: XOR<GatewayRouteUpdateManyMutationInput, GatewayRouteUncheckedUpdateManyWithoutGatewayInput>
  }

  export type GatewayRouteScalarWhereInput = {
    AND?: GatewayRouteScalarWhereInput | GatewayRouteScalarWhereInput[]
    OR?: GatewayRouteScalarWhereInput[]
    NOT?: GatewayRouteScalarWhereInput | GatewayRouteScalarWhereInput[]
    id?: StringFilter<"GatewayRoute"> | string
    gatewayId?: StringFilter<"GatewayRoute"> | string
    path?: StringFilter<"GatewayRoute"> | string
    targetService?: StringFilter<"GatewayRoute"> | string
    stripPrefix?: BoolFilter<"GatewayRoute"> | boolean
    rateLimit?: IntNullableFilter<"GatewayRoute"> | number | null
    timeout?: IntNullableFilter<"GatewayRoute"> | number | null
    order?: IntFilter<"GatewayRoute"> | number
    isActive?: BoolFilter<"GatewayRoute"> | boolean
    createdAt?: DateTimeFilter<"GatewayRoute"> | Date | string
    updatedAt?: DateTimeFilter<"GatewayRoute"> | Date | string
  }

  export type GatewayConfigCreateWithoutRoutesInput = {
    id?: string
    name?: string
    provider?: string
    httpPort?: number
    httpsPort?: number
    enableHttps?: boolean
    sslCert?: string | null
    sslKey?: string | null
    rawConfig?: string | null
    isActive?: boolean
    version?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GatewayConfigUncheckedCreateWithoutRoutesInput = {
    id?: string
    name?: string
    provider?: string
    httpPort?: number
    httpsPort?: number
    enableHttps?: boolean
    sslCert?: string | null
    sslKey?: string | null
    rawConfig?: string | null
    isActive?: boolean
    version?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GatewayConfigCreateOrConnectWithoutRoutesInput = {
    where: GatewayConfigWhereUniqueInput
    create: XOR<GatewayConfigCreateWithoutRoutesInput, GatewayConfigUncheckedCreateWithoutRoutesInput>
  }

  export type GatewayConfigUpsertWithoutRoutesInput = {
    update: XOR<GatewayConfigUpdateWithoutRoutesInput, GatewayConfigUncheckedUpdateWithoutRoutesInput>
    create: XOR<GatewayConfigCreateWithoutRoutesInput, GatewayConfigUncheckedCreateWithoutRoutesInput>
    where?: GatewayConfigWhereInput
  }

  export type GatewayConfigUpdateToOneWithWhereWithoutRoutesInput = {
    where?: GatewayConfigWhereInput
    data: XOR<GatewayConfigUpdateWithoutRoutesInput, GatewayConfigUncheckedUpdateWithoutRoutesInput>
  }

  export type GatewayConfigUpdateWithoutRoutesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    httpPort?: IntFieldUpdateOperationsInput | number
    httpsPort?: IntFieldUpdateOperationsInput | number
    enableHttps?: BoolFieldUpdateOperationsInput | boolean
    sslCert?: NullableStringFieldUpdateOperationsInput | string | null
    sslKey?: NullableStringFieldUpdateOperationsInput | string | null
    rawConfig?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    version?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GatewayConfigUncheckedUpdateWithoutRoutesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    httpPort?: IntFieldUpdateOperationsInput | number
    httpsPort?: IntFieldUpdateOperationsInput | number
    enableHttps?: BoolFieldUpdateOperationsInput | boolean
    sslCert?: NullableStringFieldUpdateOperationsInput | string | null
    sslKey?: NullableStringFieldUpdateOperationsInput | string | null
    rawConfig?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    version?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GatewayRouteCreateManyGatewayInput = {
    id?: string
    path: string
    targetService: string
    stripPrefix?: boolean
    rateLimit?: number | null
    timeout?: number | null
    order?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GatewayRouteUpdateWithoutGatewayInput = {
    id?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    targetService?: StringFieldUpdateOperationsInput | string
    stripPrefix?: BoolFieldUpdateOperationsInput | boolean
    rateLimit?: NullableIntFieldUpdateOperationsInput | number | null
    timeout?: NullableIntFieldUpdateOperationsInput | number | null
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GatewayRouteUncheckedUpdateWithoutGatewayInput = {
    id?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    targetService?: StringFieldUpdateOperationsInput | string
    stripPrefix?: BoolFieldUpdateOperationsInput | boolean
    rateLimit?: NullableIntFieldUpdateOperationsInput | number | null
    timeout?: NullableIntFieldUpdateOperationsInput | number | null
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GatewayRouteUncheckedUpdateManyWithoutGatewayInput = {
    id?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    targetService?: StringFieldUpdateOperationsInput | string
    stripPrefix?: BoolFieldUpdateOperationsInput | boolean
    rateLimit?: NullableIntFieldUpdateOperationsInput | number | null
    timeout?: NullableIntFieldUpdateOperationsInput | number | null
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
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