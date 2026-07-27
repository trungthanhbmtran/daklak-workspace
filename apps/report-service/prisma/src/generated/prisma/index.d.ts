
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
 * Model ReportTemplate
 * 
 */
export type ReportTemplate = $Result.DefaultSelection<Prisma.$ReportTemplatePayload>
/**
 * Model ReportWidget
 * 
 */
export type ReportWidget = $Result.DefaultSelection<Prisma.$ReportWidgetPayload>
/**
 * Model StatisticsSnapshot
 * 
 */
export type StatisticsSnapshot = $Result.DefaultSelection<Prisma.$StatisticsSnapshotPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more ReportTemplates
 * const reportTemplates = await prisma.reportTemplate.findMany()
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
   * // Fetch zero or more ReportTemplates
   * const reportTemplates = await prisma.reportTemplate.findMany()
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
   * `prisma.reportTemplate`: Exposes CRUD operations for the **ReportTemplate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReportTemplates
    * const reportTemplates = await prisma.reportTemplate.findMany()
    * ```
    */
  get reportTemplate(): Prisma.ReportTemplateDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.reportWidget`: Exposes CRUD operations for the **ReportWidget** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReportWidgets
    * const reportWidgets = await prisma.reportWidget.findMany()
    * ```
    */
  get reportWidget(): Prisma.ReportWidgetDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.statisticsSnapshot`: Exposes CRUD operations for the **StatisticsSnapshot** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more StatisticsSnapshots
    * const statisticsSnapshots = await prisma.statisticsSnapshot.findMany()
    * ```
    */
  get statisticsSnapshot(): Prisma.StatisticsSnapshotDelegate<ExtArgs, ClientOptions>;
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
    ReportTemplate: 'ReportTemplate',
    ReportWidget: 'ReportWidget',
    StatisticsSnapshot: 'StatisticsSnapshot'
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
      modelProps: "reportTemplate" | "reportWidget" | "statisticsSnapshot"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ReportTemplate: {
        payload: Prisma.$ReportTemplatePayload<ExtArgs>
        fields: Prisma.ReportTemplateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReportTemplateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportTemplatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReportTemplateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportTemplatePayload>
          }
          findFirst: {
            args: Prisma.ReportTemplateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportTemplatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReportTemplateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportTemplatePayload>
          }
          findMany: {
            args: Prisma.ReportTemplateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportTemplatePayload>[]
          }
          create: {
            args: Prisma.ReportTemplateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportTemplatePayload>
          }
          createMany: {
            args: Prisma.ReportTemplateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ReportTemplateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportTemplatePayload>
          }
          update: {
            args: Prisma.ReportTemplateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportTemplatePayload>
          }
          deleteMany: {
            args: Prisma.ReportTemplateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReportTemplateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ReportTemplateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportTemplatePayload>
          }
          aggregate: {
            args: Prisma.ReportTemplateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReportTemplate>
          }
          groupBy: {
            args: Prisma.ReportTemplateGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReportTemplateGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReportTemplateCountArgs<ExtArgs>
            result: $Utils.Optional<ReportTemplateCountAggregateOutputType> | number
          }
        }
      }
      ReportWidget: {
        payload: Prisma.$ReportWidgetPayload<ExtArgs>
        fields: Prisma.ReportWidgetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReportWidgetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWidgetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReportWidgetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWidgetPayload>
          }
          findFirst: {
            args: Prisma.ReportWidgetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWidgetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReportWidgetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWidgetPayload>
          }
          findMany: {
            args: Prisma.ReportWidgetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWidgetPayload>[]
          }
          create: {
            args: Prisma.ReportWidgetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWidgetPayload>
          }
          createMany: {
            args: Prisma.ReportWidgetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ReportWidgetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWidgetPayload>
          }
          update: {
            args: Prisma.ReportWidgetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWidgetPayload>
          }
          deleteMany: {
            args: Prisma.ReportWidgetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReportWidgetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ReportWidgetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReportWidgetPayload>
          }
          aggregate: {
            args: Prisma.ReportWidgetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReportWidget>
          }
          groupBy: {
            args: Prisma.ReportWidgetGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReportWidgetGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReportWidgetCountArgs<ExtArgs>
            result: $Utils.Optional<ReportWidgetCountAggregateOutputType> | number
          }
        }
      }
      StatisticsSnapshot: {
        payload: Prisma.$StatisticsSnapshotPayload<ExtArgs>
        fields: Prisma.StatisticsSnapshotFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StatisticsSnapshotFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatisticsSnapshotPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StatisticsSnapshotFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatisticsSnapshotPayload>
          }
          findFirst: {
            args: Prisma.StatisticsSnapshotFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatisticsSnapshotPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StatisticsSnapshotFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatisticsSnapshotPayload>
          }
          findMany: {
            args: Prisma.StatisticsSnapshotFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatisticsSnapshotPayload>[]
          }
          create: {
            args: Prisma.StatisticsSnapshotCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatisticsSnapshotPayload>
          }
          createMany: {
            args: Prisma.StatisticsSnapshotCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.StatisticsSnapshotDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatisticsSnapshotPayload>
          }
          update: {
            args: Prisma.StatisticsSnapshotUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatisticsSnapshotPayload>
          }
          deleteMany: {
            args: Prisma.StatisticsSnapshotDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StatisticsSnapshotUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.StatisticsSnapshotUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatisticsSnapshotPayload>
          }
          aggregate: {
            args: Prisma.StatisticsSnapshotAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStatisticsSnapshot>
          }
          groupBy: {
            args: Prisma.StatisticsSnapshotGroupByArgs<ExtArgs>
            result: $Utils.Optional<StatisticsSnapshotGroupByOutputType>[]
          }
          count: {
            args: Prisma.StatisticsSnapshotCountArgs<ExtArgs>
            result: $Utils.Optional<StatisticsSnapshotCountAggregateOutputType> | number
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
    reportTemplate?: ReportTemplateOmit
    reportWidget?: ReportWidgetOmit
    statisticsSnapshot?: StatisticsSnapshotOmit
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
   * Count Type ReportTemplateCountOutputType
   */

  export type ReportTemplateCountOutputType = {
    widgets: number
  }

  export type ReportTemplateCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    widgets?: boolean | ReportTemplateCountOutputTypeCountWidgetsArgs
  }

  // Custom InputTypes
  /**
   * ReportTemplateCountOutputType without action
   */
  export type ReportTemplateCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportTemplateCountOutputType
     */
    select?: ReportTemplateCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ReportTemplateCountOutputType without action
   */
  export type ReportTemplateCountOutputTypeCountWidgetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReportWidgetWhereInput
  }


  /**
   * Models
   */

  /**
   * Model ReportTemplate
   */

  export type AggregateReportTemplate = {
    _count: ReportTemplateCountAggregateOutputType | null
    _avg: ReportTemplateAvgAggregateOutputType | null
    _sum: ReportTemplateSumAggregateOutputType | null
    _min: ReportTemplateMinAggregateOutputType | null
    _max: ReportTemplateMaxAggregateOutputType | null
  }

  export type ReportTemplateAvgAggregateOutputType = {
    id: number | null
  }

  export type ReportTemplateSumAggregateOutputType = {
    id: number | null
  }

  export type ReportTemplateMinAggregateOutputType = {
    id: number | null
    title: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ReportTemplateMaxAggregateOutputType = {
    id: number | null
    title: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ReportTemplateCountAggregateOutputType = {
    id: number
    title: number
    description: number
    layout: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ReportTemplateAvgAggregateInputType = {
    id?: true
  }

  export type ReportTemplateSumAggregateInputType = {
    id?: true
  }

  export type ReportTemplateMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ReportTemplateMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ReportTemplateCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    layout?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ReportTemplateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReportTemplate to aggregate.
     */
    where?: ReportTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportTemplates to fetch.
     */
    orderBy?: ReportTemplateOrderByWithRelationInput | ReportTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReportTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReportTemplates
    **/
    _count?: true | ReportTemplateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReportTemplateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReportTemplateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReportTemplateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReportTemplateMaxAggregateInputType
  }

  export type GetReportTemplateAggregateType<T extends ReportTemplateAggregateArgs> = {
        [P in keyof T & keyof AggregateReportTemplate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReportTemplate[P]>
      : GetScalarType<T[P], AggregateReportTemplate[P]>
  }




  export type ReportTemplateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReportTemplateWhereInput
    orderBy?: ReportTemplateOrderByWithAggregationInput | ReportTemplateOrderByWithAggregationInput[]
    by: ReportTemplateScalarFieldEnum[] | ReportTemplateScalarFieldEnum
    having?: ReportTemplateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReportTemplateCountAggregateInputType | true
    _avg?: ReportTemplateAvgAggregateInputType
    _sum?: ReportTemplateSumAggregateInputType
    _min?: ReportTemplateMinAggregateInputType
    _max?: ReportTemplateMaxAggregateInputType
  }

  export type ReportTemplateGroupByOutputType = {
    id: number
    title: string
    description: string | null
    layout: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: ReportTemplateCountAggregateOutputType | null
    _avg: ReportTemplateAvgAggregateOutputType | null
    _sum: ReportTemplateSumAggregateOutputType | null
    _min: ReportTemplateMinAggregateOutputType | null
    _max: ReportTemplateMaxAggregateOutputType | null
  }

  type GetReportTemplateGroupByPayload<T extends ReportTemplateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReportTemplateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReportTemplateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReportTemplateGroupByOutputType[P]>
            : GetScalarType<T[P], ReportTemplateGroupByOutputType[P]>
        }
      >
    >


  export type ReportTemplateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    layout?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    widgets?: boolean | ReportTemplate$widgetsArgs<ExtArgs>
    _count?: boolean | ReportTemplateCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reportTemplate"]>



  export type ReportTemplateSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    layout?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ReportTemplateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "description" | "layout" | "createdAt" | "updatedAt", ExtArgs["result"]["reportTemplate"]>
  export type ReportTemplateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    widgets?: boolean | ReportTemplate$widgetsArgs<ExtArgs>
    _count?: boolean | ReportTemplateCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $ReportTemplatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReportTemplate"
    objects: {
      widgets: Prisma.$ReportWidgetPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      title: string
      description: string | null
      layout: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["reportTemplate"]>
    composites: {}
  }

  type ReportTemplateGetPayload<S extends boolean | null | undefined | ReportTemplateDefaultArgs> = $Result.GetResult<Prisma.$ReportTemplatePayload, S>

  type ReportTemplateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReportTemplateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReportTemplateCountAggregateInputType | true
    }

  export interface ReportTemplateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReportTemplate'], meta: { name: 'ReportTemplate' } }
    /**
     * Find zero or one ReportTemplate that matches the filter.
     * @param {ReportTemplateFindUniqueArgs} args - Arguments to find a ReportTemplate
     * @example
     * // Get one ReportTemplate
     * const reportTemplate = await prisma.reportTemplate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReportTemplateFindUniqueArgs>(args: SelectSubset<T, ReportTemplateFindUniqueArgs<ExtArgs>>): Prisma__ReportTemplateClient<$Result.GetResult<Prisma.$ReportTemplatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ReportTemplate that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReportTemplateFindUniqueOrThrowArgs} args - Arguments to find a ReportTemplate
     * @example
     * // Get one ReportTemplate
     * const reportTemplate = await prisma.reportTemplate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReportTemplateFindUniqueOrThrowArgs>(args: SelectSubset<T, ReportTemplateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReportTemplateClient<$Result.GetResult<Prisma.$ReportTemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReportTemplate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportTemplateFindFirstArgs} args - Arguments to find a ReportTemplate
     * @example
     * // Get one ReportTemplate
     * const reportTemplate = await prisma.reportTemplate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReportTemplateFindFirstArgs>(args?: SelectSubset<T, ReportTemplateFindFirstArgs<ExtArgs>>): Prisma__ReportTemplateClient<$Result.GetResult<Prisma.$ReportTemplatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReportTemplate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportTemplateFindFirstOrThrowArgs} args - Arguments to find a ReportTemplate
     * @example
     * // Get one ReportTemplate
     * const reportTemplate = await prisma.reportTemplate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReportTemplateFindFirstOrThrowArgs>(args?: SelectSubset<T, ReportTemplateFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReportTemplateClient<$Result.GetResult<Prisma.$ReportTemplatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ReportTemplates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportTemplateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReportTemplates
     * const reportTemplates = await prisma.reportTemplate.findMany()
     * 
     * // Get first 10 ReportTemplates
     * const reportTemplates = await prisma.reportTemplate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reportTemplateWithIdOnly = await prisma.reportTemplate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReportTemplateFindManyArgs>(args?: SelectSubset<T, ReportTemplateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportTemplatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ReportTemplate.
     * @param {ReportTemplateCreateArgs} args - Arguments to create a ReportTemplate.
     * @example
     * // Create one ReportTemplate
     * const ReportTemplate = await prisma.reportTemplate.create({
     *   data: {
     *     // ... data to create a ReportTemplate
     *   }
     * })
     * 
     */
    create<T extends ReportTemplateCreateArgs>(args: SelectSubset<T, ReportTemplateCreateArgs<ExtArgs>>): Prisma__ReportTemplateClient<$Result.GetResult<Prisma.$ReportTemplatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ReportTemplates.
     * @param {ReportTemplateCreateManyArgs} args - Arguments to create many ReportTemplates.
     * @example
     * // Create many ReportTemplates
     * const reportTemplate = await prisma.reportTemplate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReportTemplateCreateManyArgs>(args?: SelectSubset<T, ReportTemplateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ReportTemplate.
     * @param {ReportTemplateDeleteArgs} args - Arguments to delete one ReportTemplate.
     * @example
     * // Delete one ReportTemplate
     * const ReportTemplate = await prisma.reportTemplate.delete({
     *   where: {
     *     // ... filter to delete one ReportTemplate
     *   }
     * })
     * 
     */
    delete<T extends ReportTemplateDeleteArgs>(args: SelectSubset<T, ReportTemplateDeleteArgs<ExtArgs>>): Prisma__ReportTemplateClient<$Result.GetResult<Prisma.$ReportTemplatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ReportTemplate.
     * @param {ReportTemplateUpdateArgs} args - Arguments to update one ReportTemplate.
     * @example
     * // Update one ReportTemplate
     * const reportTemplate = await prisma.reportTemplate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReportTemplateUpdateArgs>(args: SelectSubset<T, ReportTemplateUpdateArgs<ExtArgs>>): Prisma__ReportTemplateClient<$Result.GetResult<Prisma.$ReportTemplatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ReportTemplates.
     * @param {ReportTemplateDeleteManyArgs} args - Arguments to filter ReportTemplates to delete.
     * @example
     * // Delete a few ReportTemplates
     * const { count } = await prisma.reportTemplate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReportTemplateDeleteManyArgs>(args?: SelectSubset<T, ReportTemplateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReportTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportTemplateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReportTemplates
     * const reportTemplate = await prisma.reportTemplate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReportTemplateUpdateManyArgs>(args: SelectSubset<T, ReportTemplateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ReportTemplate.
     * @param {ReportTemplateUpsertArgs} args - Arguments to update or create a ReportTemplate.
     * @example
     * // Update or create a ReportTemplate
     * const reportTemplate = await prisma.reportTemplate.upsert({
     *   create: {
     *     // ... data to create a ReportTemplate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReportTemplate we want to update
     *   }
     * })
     */
    upsert<T extends ReportTemplateUpsertArgs>(args: SelectSubset<T, ReportTemplateUpsertArgs<ExtArgs>>): Prisma__ReportTemplateClient<$Result.GetResult<Prisma.$ReportTemplatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ReportTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportTemplateCountArgs} args - Arguments to filter ReportTemplates to count.
     * @example
     * // Count the number of ReportTemplates
     * const count = await prisma.reportTemplate.count({
     *   where: {
     *     // ... the filter for the ReportTemplates we want to count
     *   }
     * })
    **/
    count<T extends ReportTemplateCountArgs>(
      args?: Subset<T, ReportTemplateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReportTemplateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReportTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportTemplateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ReportTemplateAggregateArgs>(args: Subset<T, ReportTemplateAggregateArgs>): Prisma.PrismaPromise<GetReportTemplateAggregateType<T>>

    /**
     * Group by ReportTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportTemplateGroupByArgs} args - Group by arguments.
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
      T extends ReportTemplateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReportTemplateGroupByArgs['orderBy'] }
        : { orderBy?: ReportTemplateGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ReportTemplateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReportTemplateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReportTemplate model
   */
  readonly fields: ReportTemplateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReportTemplate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReportTemplateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    widgets<T extends ReportTemplate$widgetsArgs<ExtArgs> = {}>(args?: Subset<T, ReportTemplate$widgetsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportWidgetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the ReportTemplate model
   */
  interface ReportTemplateFieldRefs {
    readonly id: FieldRef<"ReportTemplate", 'Int'>
    readonly title: FieldRef<"ReportTemplate", 'String'>
    readonly description: FieldRef<"ReportTemplate", 'String'>
    readonly layout: FieldRef<"ReportTemplate", 'Json'>
    readonly createdAt: FieldRef<"ReportTemplate", 'DateTime'>
    readonly updatedAt: FieldRef<"ReportTemplate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ReportTemplate findUnique
   */
  export type ReportTemplateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportTemplate
     */
    select?: ReportTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportTemplate
     */
    omit?: ReportTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportTemplateInclude<ExtArgs> | null
    /**
     * Filter, which ReportTemplate to fetch.
     */
    where: ReportTemplateWhereUniqueInput
  }

  /**
   * ReportTemplate findUniqueOrThrow
   */
  export type ReportTemplateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportTemplate
     */
    select?: ReportTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportTemplate
     */
    omit?: ReportTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportTemplateInclude<ExtArgs> | null
    /**
     * Filter, which ReportTemplate to fetch.
     */
    where: ReportTemplateWhereUniqueInput
  }

  /**
   * ReportTemplate findFirst
   */
  export type ReportTemplateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportTemplate
     */
    select?: ReportTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportTemplate
     */
    omit?: ReportTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportTemplateInclude<ExtArgs> | null
    /**
     * Filter, which ReportTemplate to fetch.
     */
    where?: ReportTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportTemplates to fetch.
     */
    orderBy?: ReportTemplateOrderByWithRelationInput | ReportTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReportTemplates.
     */
    cursor?: ReportTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReportTemplates.
     */
    distinct?: ReportTemplateScalarFieldEnum | ReportTemplateScalarFieldEnum[]
  }

  /**
   * ReportTemplate findFirstOrThrow
   */
  export type ReportTemplateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportTemplate
     */
    select?: ReportTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportTemplate
     */
    omit?: ReportTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportTemplateInclude<ExtArgs> | null
    /**
     * Filter, which ReportTemplate to fetch.
     */
    where?: ReportTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportTemplates to fetch.
     */
    orderBy?: ReportTemplateOrderByWithRelationInput | ReportTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReportTemplates.
     */
    cursor?: ReportTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReportTemplates.
     */
    distinct?: ReportTemplateScalarFieldEnum | ReportTemplateScalarFieldEnum[]
  }

  /**
   * ReportTemplate findMany
   */
  export type ReportTemplateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportTemplate
     */
    select?: ReportTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportTemplate
     */
    omit?: ReportTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportTemplateInclude<ExtArgs> | null
    /**
     * Filter, which ReportTemplates to fetch.
     */
    where?: ReportTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportTemplates to fetch.
     */
    orderBy?: ReportTemplateOrderByWithRelationInput | ReportTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReportTemplates.
     */
    cursor?: ReportTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReportTemplates.
     */
    distinct?: ReportTemplateScalarFieldEnum | ReportTemplateScalarFieldEnum[]
  }

  /**
   * ReportTemplate create
   */
  export type ReportTemplateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportTemplate
     */
    select?: ReportTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportTemplate
     */
    omit?: ReportTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportTemplateInclude<ExtArgs> | null
    /**
     * The data needed to create a ReportTemplate.
     */
    data: XOR<ReportTemplateCreateInput, ReportTemplateUncheckedCreateInput>
  }

  /**
   * ReportTemplate createMany
   */
  export type ReportTemplateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReportTemplates.
     */
    data: ReportTemplateCreateManyInput | ReportTemplateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReportTemplate update
   */
  export type ReportTemplateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportTemplate
     */
    select?: ReportTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportTemplate
     */
    omit?: ReportTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportTemplateInclude<ExtArgs> | null
    /**
     * The data needed to update a ReportTemplate.
     */
    data: XOR<ReportTemplateUpdateInput, ReportTemplateUncheckedUpdateInput>
    /**
     * Choose, which ReportTemplate to update.
     */
    where: ReportTemplateWhereUniqueInput
  }

  /**
   * ReportTemplate updateMany
   */
  export type ReportTemplateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReportTemplates.
     */
    data: XOR<ReportTemplateUpdateManyMutationInput, ReportTemplateUncheckedUpdateManyInput>
    /**
     * Filter which ReportTemplates to update
     */
    where?: ReportTemplateWhereInput
    /**
     * Limit how many ReportTemplates to update.
     */
    limit?: number
  }

  /**
   * ReportTemplate upsert
   */
  export type ReportTemplateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportTemplate
     */
    select?: ReportTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportTemplate
     */
    omit?: ReportTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportTemplateInclude<ExtArgs> | null
    /**
     * The filter to search for the ReportTemplate to update in case it exists.
     */
    where: ReportTemplateWhereUniqueInput
    /**
     * In case the ReportTemplate found by the `where` argument doesn't exist, create a new ReportTemplate with this data.
     */
    create: XOR<ReportTemplateCreateInput, ReportTemplateUncheckedCreateInput>
    /**
     * In case the ReportTemplate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReportTemplateUpdateInput, ReportTemplateUncheckedUpdateInput>
  }

  /**
   * ReportTemplate delete
   */
  export type ReportTemplateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportTemplate
     */
    select?: ReportTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportTemplate
     */
    omit?: ReportTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportTemplateInclude<ExtArgs> | null
    /**
     * Filter which ReportTemplate to delete.
     */
    where: ReportTemplateWhereUniqueInput
  }

  /**
   * ReportTemplate deleteMany
   */
  export type ReportTemplateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReportTemplates to delete
     */
    where?: ReportTemplateWhereInput
    /**
     * Limit how many ReportTemplates to delete.
     */
    limit?: number
  }

  /**
   * ReportTemplate.widgets
   */
  export type ReportTemplate$widgetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWidget
     */
    select?: ReportWidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWidget
     */
    omit?: ReportWidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWidgetInclude<ExtArgs> | null
    where?: ReportWidgetWhereInput
    orderBy?: ReportWidgetOrderByWithRelationInput | ReportWidgetOrderByWithRelationInput[]
    cursor?: ReportWidgetWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReportWidgetScalarFieldEnum | ReportWidgetScalarFieldEnum[]
  }

  /**
   * ReportTemplate without action
   */
  export type ReportTemplateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportTemplate
     */
    select?: ReportTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportTemplate
     */
    omit?: ReportTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportTemplateInclude<ExtArgs> | null
  }


  /**
   * Model ReportWidget
   */

  export type AggregateReportWidget = {
    _count: ReportWidgetCountAggregateOutputType | null
    _avg: ReportWidgetAvgAggregateOutputType | null
    _sum: ReportWidgetSumAggregateOutputType | null
    _min: ReportWidgetMinAggregateOutputType | null
    _max: ReportWidgetMaxAggregateOutputType | null
  }

  export type ReportWidgetAvgAggregateOutputType = {
    id: number | null
    templateId: number | null
  }

  export type ReportWidgetSumAggregateOutputType = {
    id: number | null
    templateId: number | null
  }

  export type ReportWidgetMinAggregateOutputType = {
    id: number | null
    templateId: number | null
    title: string | null
    chartType: string | null
    dataSourceCode: string | null
    xAxisKey: string | null
    yAxisKey: string | null
  }

  export type ReportWidgetMaxAggregateOutputType = {
    id: number | null
    templateId: number | null
    title: string | null
    chartType: string | null
    dataSourceCode: string | null
    xAxisKey: string | null
    yAxisKey: string | null
  }

  export type ReportWidgetCountAggregateOutputType = {
    id: number
    templateId: number
    title: number
    chartType: number
    dataSourceCode: number
    xAxisKey: number
    yAxisKey: number
    config: number
    _all: number
  }


  export type ReportWidgetAvgAggregateInputType = {
    id?: true
    templateId?: true
  }

  export type ReportWidgetSumAggregateInputType = {
    id?: true
    templateId?: true
  }

  export type ReportWidgetMinAggregateInputType = {
    id?: true
    templateId?: true
    title?: true
    chartType?: true
    dataSourceCode?: true
    xAxisKey?: true
    yAxisKey?: true
  }

  export type ReportWidgetMaxAggregateInputType = {
    id?: true
    templateId?: true
    title?: true
    chartType?: true
    dataSourceCode?: true
    xAxisKey?: true
    yAxisKey?: true
  }

  export type ReportWidgetCountAggregateInputType = {
    id?: true
    templateId?: true
    title?: true
    chartType?: true
    dataSourceCode?: true
    xAxisKey?: true
    yAxisKey?: true
    config?: true
    _all?: true
  }

  export type ReportWidgetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReportWidget to aggregate.
     */
    where?: ReportWidgetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportWidgets to fetch.
     */
    orderBy?: ReportWidgetOrderByWithRelationInput | ReportWidgetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReportWidgetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportWidgets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportWidgets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReportWidgets
    **/
    _count?: true | ReportWidgetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReportWidgetAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReportWidgetSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReportWidgetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReportWidgetMaxAggregateInputType
  }

  export type GetReportWidgetAggregateType<T extends ReportWidgetAggregateArgs> = {
        [P in keyof T & keyof AggregateReportWidget]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReportWidget[P]>
      : GetScalarType<T[P], AggregateReportWidget[P]>
  }




  export type ReportWidgetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReportWidgetWhereInput
    orderBy?: ReportWidgetOrderByWithAggregationInput | ReportWidgetOrderByWithAggregationInput[]
    by: ReportWidgetScalarFieldEnum[] | ReportWidgetScalarFieldEnum
    having?: ReportWidgetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReportWidgetCountAggregateInputType | true
    _avg?: ReportWidgetAvgAggregateInputType
    _sum?: ReportWidgetSumAggregateInputType
    _min?: ReportWidgetMinAggregateInputType
    _max?: ReportWidgetMaxAggregateInputType
  }

  export type ReportWidgetGroupByOutputType = {
    id: number
    templateId: number
    title: string
    chartType: string
    dataSourceCode: string
    xAxisKey: string
    yAxisKey: string
    config: JsonValue | null
    _count: ReportWidgetCountAggregateOutputType | null
    _avg: ReportWidgetAvgAggregateOutputType | null
    _sum: ReportWidgetSumAggregateOutputType | null
    _min: ReportWidgetMinAggregateOutputType | null
    _max: ReportWidgetMaxAggregateOutputType | null
  }

  type GetReportWidgetGroupByPayload<T extends ReportWidgetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReportWidgetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReportWidgetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReportWidgetGroupByOutputType[P]>
            : GetScalarType<T[P], ReportWidgetGroupByOutputType[P]>
        }
      >
    >


  export type ReportWidgetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    templateId?: boolean
    title?: boolean
    chartType?: boolean
    dataSourceCode?: boolean
    xAxisKey?: boolean
    yAxisKey?: boolean
    config?: boolean
    template?: boolean | ReportTemplateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reportWidget"]>



  export type ReportWidgetSelectScalar = {
    id?: boolean
    templateId?: boolean
    title?: boolean
    chartType?: boolean
    dataSourceCode?: boolean
    xAxisKey?: boolean
    yAxisKey?: boolean
    config?: boolean
  }

  export type ReportWidgetOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "templateId" | "title" | "chartType" | "dataSourceCode" | "xAxisKey" | "yAxisKey" | "config", ExtArgs["result"]["reportWidget"]>
  export type ReportWidgetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    template?: boolean | ReportTemplateDefaultArgs<ExtArgs>
  }

  export type $ReportWidgetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReportWidget"
    objects: {
      template: Prisma.$ReportTemplatePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      templateId: number
      title: string
      chartType: string
      dataSourceCode: string
      xAxisKey: string
      yAxisKey: string
      config: Prisma.JsonValue | null
    }, ExtArgs["result"]["reportWidget"]>
    composites: {}
  }

  type ReportWidgetGetPayload<S extends boolean | null | undefined | ReportWidgetDefaultArgs> = $Result.GetResult<Prisma.$ReportWidgetPayload, S>

  type ReportWidgetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReportWidgetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReportWidgetCountAggregateInputType | true
    }

  export interface ReportWidgetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReportWidget'], meta: { name: 'ReportWidget' } }
    /**
     * Find zero or one ReportWidget that matches the filter.
     * @param {ReportWidgetFindUniqueArgs} args - Arguments to find a ReportWidget
     * @example
     * // Get one ReportWidget
     * const reportWidget = await prisma.reportWidget.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReportWidgetFindUniqueArgs>(args: SelectSubset<T, ReportWidgetFindUniqueArgs<ExtArgs>>): Prisma__ReportWidgetClient<$Result.GetResult<Prisma.$ReportWidgetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ReportWidget that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReportWidgetFindUniqueOrThrowArgs} args - Arguments to find a ReportWidget
     * @example
     * // Get one ReportWidget
     * const reportWidget = await prisma.reportWidget.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReportWidgetFindUniqueOrThrowArgs>(args: SelectSubset<T, ReportWidgetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReportWidgetClient<$Result.GetResult<Prisma.$ReportWidgetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReportWidget that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportWidgetFindFirstArgs} args - Arguments to find a ReportWidget
     * @example
     * // Get one ReportWidget
     * const reportWidget = await prisma.reportWidget.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReportWidgetFindFirstArgs>(args?: SelectSubset<T, ReportWidgetFindFirstArgs<ExtArgs>>): Prisma__ReportWidgetClient<$Result.GetResult<Prisma.$ReportWidgetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReportWidget that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportWidgetFindFirstOrThrowArgs} args - Arguments to find a ReportWidget
     * @example
     * // Get one ReportWidget
     * const reportWidget = await prisma.reportWidget.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReportWidgetFindFirstOrThrowArgs>(args?: SelectSubset<T, ReportWidgetFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReportWidgetClient<$Result.GetResult<Prisma.$ReportWidgetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ReportWidgets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportWidgetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReportWidgets
     * const reportWidgets = await prisma.reportWidget.findMany()
     * 
     * // Get first 10 ReportWidgets
     * const reportWidgets = await prisma.reportWidget.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reportWidgetWithIdOnly = await prisma.reportWidget.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReportWidgetFindManyArgs>(args?: SelectSubset<T, ReportWidgetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReportWidgetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ReportWidget.
     * @param {ReportWidgetCreateArgs} args - Arguments to create a ReportWidget.
     * @example
     * // Create one ReportWidget
     * const ReportWidget = await prisma.reportWidget.create({
     *   data: {
     *     // ... data to create a ReportWidget
     *   }
     * })
     * 
     */
    create<T extends ReportWidgetCreateArgs>(args: SelectSubset<T, ReportWidgetCreateArgs<ExtArgs>>): Prisma__ReportWidgetClient<$Result.GetResult<Prisma.$ReportWidgetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ReportWidgets.
     * @param {ReportWidgetCreateManyArgs} args - Arguments to create many ReportWidgets.
     * @example
     * // Create many ReportWidgets
     * const reportWidget = await prisma.reportWidget.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReportWidgetCreateManyArgs>(args?: SelectSubset<T, ReportWidgetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ReportWidget.
     * @param {ReportWidgetDeleteArgs} args - Arguments to delete one ReportWidget.
     * @example
     * // Delete one ReportWidget
     * const ReportWidget = await prisma.reportWidget.delete({
     *   where: {
     *     // ... filter to delete one ReportWidget
     *   }
     * })
     * 
     */
    delete<T extends ReportWidgetDeleteArgs>(args: SelectSubset<T, ReportWidgetDeleteArgs<ExtArgs>>): Prisma__ReportWidgetClient<$Result.GetResult<Prisma.$ReportWidgetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ReportWidget.
     * @param {ReportWidgetUpdateArgs} args - Arguments to update one ReportWidget.
     * @example
     * // Update one ReportWidget
     * const reportWidget = await prisma.reportWidget.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReportWidgetUpdateArgs>(args: SelectSubset<T, ReportWidgetUpdateArgs<ExtArgs>>): Prisma__ReportWidgetClient<$Result.GetResult<Prisma.$ReportWidgetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ReportWidgets.
     * @param {ReportWidgetDeleteManyArgs} args - Arguments to filter ReportWidgets to delete.
     * @example
     * // Delete a few ReportWidgets
     * const { count } = await prisma.reportWidget.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReportWidgetDeleteManyArgs>(args?: SelectSubset<T, ReportWidgetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReportWidgets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportWidgetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReportWidgets
     * const reportWidget = await prisma.reportWidget.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReportWidgetUpdateManyArgs>(args: SelectSubset<T, ReportWidgetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ReportWidget.
     * @param {ReportWidgetUpsertArgs} args - Arguments to update or create a ReportWidget.
     * @example
     * // Update or create a ReportWidget
     * const reportWidget = await prisma.reportWidget.upsert({
     *   create: {
     *     // ... data to create a ReportWidget
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReportWidget we want to update
     *   }
     * })
     */
    upsert<T extends ReportWidgetUpsertArgs>(args: SelectSubset<T, ReportWidgetUpsertArgs<ExtArgs>>): Prisma__ReportWidgetClient<$Result.GetResult<Prisma.$ReportWidgetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ReportWidgets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportWidgetCountArgs} args - Arguments to filter ReportWidgets to count.
     * @example
     * // Count the number of ReportWidgets
     * const count = await prisma.reportWidget.count({
     *   where: {
     *     // ... the filter for the ReportWidgets we want to count
     *   }
     * })
    **/
    count<T extends ReportWidgetCountArgs>(
      args?: Subset<T, ReportWidgetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReportWidgetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReportWidget.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportWidgetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ReportWidgetAggregateArgs>(args: Subset<T, ReportWidgetAggregateArgs>): Prisma.PrismaPromise<GetReportWidgetAggregateType<T>>

    /**
     * Group by ReportWidget.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportWidgetGroupByArgs} args - Group by arguments.
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
      T extends ReportWidgetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReportWidgetGroupByArgs['orderBy'] }
        : { orderBy?: ReportWidgetGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ReportWidgetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReportWidgetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReportWidget model
   */
  readonly fields: ReportWidgetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReportWidget.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReportWidgetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    template<T extends ReportTemplateDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReportTemplateDefaultArgs<ExtArgs>>): Prisma__ReportTemplateClient<$Result.GetResult<Prisma.$ReportTemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the ReportWidget model
   */
  interface ReportWidgetFieldRefs {
    readonly id: FieldRef<"ReportWidget", 'Int'>
    readonly templateId: FieldRef<"ReportWidget", 'Int'>
    readonly title: FieldRef<"ReportWidget", 'String'>
    readonly chartType: FieldRef<"ReportWidget", 'String'>
    readonly dataSourceCode: FieldRef<"ReportWidget", 'String'>
    readonly xAxisKey: FieldRef<"ReportWidget", 'String'>
    readonly yAxisKey: FieldRef<"ReportWidget", 'String'>
    readonly config: FieldRef<"ReportWidget", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * ReportWidget findUnique
   */
  export type ReportWidgetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWidget
     */
    select?: ReportWidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWidget
     */
    omit?: ReportWidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWidgetInclude<ExtArgs> | null
    /**
     * Filter, which ReportWidget to fetch.
     */
    where: ReportWidgetWhereUniqueInput
  }

  /**
   * ReportWidget findUniqueOrThrow
   */
  export type ReportWidgetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWidget
     */
    select?: ReportWidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWidget
     */
    omit?: ReportWidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWidgetInclude<ExtArgs> | null
    /**
     * Filter, which ReportWidget to fetch.
     */
    where: ReportWidgetWhereUniqueInput
  }

  /**
   * ReportWidget findFirst
   */
  export type ReportWidgetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWidget
     */
    select?: ReportWidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWidget
     */
    omit?: ReportWidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWidgetInclude<ExtArgs> | null
    /**
     * Filter, which ReportWidget to fetch.
     */
    where?: ReportWidgetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportWidgets to fetch.
     */
    orderBy?: ReportWidgetOrderByWithRelationInput | ReportWidgetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReportWidgets.
     */
    cursor?: ReportWidgetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportWidgets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportWidgets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReportWidgets.
     */
    distinct?: ReportWidgetScalarFieldEnum | ReportWidgetScalarFieldEnum[]
  }

  /**
   * ReportWidget findFirstOrThrow
   */
  export type ReportWidgetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWidget
     */
    select?: ReportWidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWidget
     */
    omit?: ReportWidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWidgetInclude<ExtArgs> | null
    /**
     * Filter, which ReportWidget to fetch.
     */
    where?: ReportWidgetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportWidgets to fetch.
     */
    orderBy?: ReportWidgetOrderByWithRelationInput | ReportWidgetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReportWidgets.
     */
    cursor?: ReportWidgetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportWidgets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportWidgets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReportWidgets.
     */
    distinct?: ReportWidgetScalarFieldEnum | ReportWidgetScalarFieldEnum[]
  }

  /**
   * ReportWidget findMany
   */
  export type ReportWidgetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWidget
     */
    select?: ReportWidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWidget
     */
    omit?: ReportWidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWidgetInclude<ExtArgs> | null
    /**
     * Filter, which ReportWidgets to fetch.
     */
    where?: ReportWidgetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReportWidgets to fetch.
     */
    orderBy?: ReportWidgetOrderByWithRelationInput | ReportWidgetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReportWidgets.
     */
    cursor?: ReportWidgetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReportWidgets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReportWidgets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReportWidgets.
     */
    distinct?: ReportWidgetScalarFieldEnum | ReportWidgetScalarFieldEnum[]
  }

  /**
   * ReportWidget create
   */
  export type ReportWidgetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWidget
     */
    select?: ReportWidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWidget
     */
    omit?: ReportWidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWidgetInclude<ExtArgs> | null
    /**
     * The data needed to create a ReportWidget.
     */
    data: XOR<ReportWidgetCreateInput, ReportWidgetUncheckedCreateInput>
  }

  /**
   * ReportWidget createMany
   */
  export type ReportWidgetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReportWidgets.
     */
    data: ReportWidgetCreateManyInput | ReportWidgetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReportWidget update
   */
  export type ReportWidgetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWidget
     */
    select?: ReportWidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWidget
     */
    omit?: ReportWidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWidgetInclude<ExtArgs> | null
    /**
     * The data needed to update a ReportWidget.
     */
    data: XOR<ReportWidgetUpdateInput, ReportWidgetUncheckedUpdateInput>
    /**
     * Choose, which ReportWidget to update.
     */
    where: ReportWidgetWhereUniqueInput
  }

  /**
   * ReportWidget updateMany
   */
  export type ReportWidgetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReportWidgets.
     */
    data: XOR<ReportWidgetUpdateManyMutationInput, ReportWidgetUncheckedUpdateManyInput>
    /**
     * Filter which ReportWidgets to update
     */
    where?: ReportWidgetWhereInput
    /**
     * Limit how many ReportWidgets to update.
     */
    limit?: number
  }

  /**
   * ReportWidget upsert
   */
  export type ReportWidgetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWidget
     */
    select?: ReportWidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWidget
     */
    omit?: ReportWidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWidgetInclude<ExtArgs> | null
    /**
     * The filter to search for the ReportWidget to update in case it exists.
     */
    where: ReportWidgetWhereUniqueInput
    /**
     * In case the ReportWidget found by the `where` argument doesn't exist, create a new ReportWidget with this data.
     */
    create: XOR<ReportWidgetCreateInput, ReportWidgetUncheckedCreateInput>
    /**
     * In case the ReportWidget was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReportWidgetUpdateInput, ReportWidgetUncheckedUpdateInput>
  }

  /**
   * ReportWidget delete
   */
  export type ReportWidgetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWidget
     */
    select?: ReportWidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWidget
     */
    omit?: ReportWidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWidgetInclude<ExtArgs> | null
    /**
     * Filter which ReportWidget to delete.
     */
    where: ReportWidgetWhereUniqueInput
  }

  /**
   * ReportWidget deleteMany
   */
  export type ReportWidgetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReportWidgets to delete
     */
    where?: ReportWidgetWhereInput
    /**
     * Limit how many ReportWidgets to delete.
     */
    limit?: number
  }

  /**
   * ReportWidget without action
   */
  export type ReportWidgetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReportWidget
     */
    select?: ReportWidgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReportWidget
     */
    omit?: ReportWidgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReportWidgetInclude<ExtArgs> | null
  }


  /**
   * Model StatisticsSnapshot
   */

  export type AggregateStatisticsSnapshot = {
    _count: StatisticsSnapshotCountAggregateOutputType | null
    _avg: StatisticsSnapshotAvgAggregateOutputType | null
    _sum: StatisticsSnapshotSumAggregateOutputType | null
    _min: StatisticsSnapshotMinAggregateOutputType | null
    _max: StatisticsSnapshotMaxAggregateOutputType | null
  }

  export type StatisticsSnapshotAvgAggregateOutputType = {
    id: number | null
  }

  export type StatisticsSnapshotSumAggregateOutputType = {
    id: number | null
  }

  export type StatisticsSnapshotMinAggregateOutputType = {
    id: number | null
    dataSourceCode: string | null
    recordedAt: Date | null
  }

  export type StatisticsSnapshotMaxAggregateOutputType = {
    id: number | null
    dataSourceCode: string | null
    recordedAt: Date | null
  }

  export type StatisticsSnapshotCountAggregateOutputType = {
    id: number
    dataSourceCode: number
    data: number
    recordedAt: number
    _all: number
  }


  export type StatisticsSnapshotAvgAggregateInputType = {
    id?: true
  }

  export type StatisticsSnapshotSumAggregateInputType = {
    id?: true
  }

  export type StatisticsSnapshotMinAggregateInputType = {
    id?: true
    dataSourceCode?: true
    recordedAt?: true
  }

  export type StatisticsSnapshotMaxAggregateInputType = {
    id?: true
    dataSourceCode?: true
    recordedAt?: true
  }

  export type StatisticsSnapshotCountAggregateInputType = {
    id?: true
    dataSourceCode?: true
    data?: true
    recordedAt?: true
    _all?: true
  }

  export type StatisticsSnapshotAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StatisticsSnapshot to aggregate.
     */
    where?: StatisticsSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StatisticsSnapshots to fetch.
     */
    orderBy?: StatisticsSnapshotOrderByWithRelationInput | StatisticsSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StatisticsSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StatisticsSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StatisticsSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned StatisticsSnapshots
    **/
    _count?: true | StatisticsSnapshotCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: StatisticsSnapshotAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: StatisticsSnapshotSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StatisticsSnapshotMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StatisticsSnapshotMaxAggregateInputType
  }

  export type GetStatisticsSnapshotAggregateType<T extends StatisticsSnapshotAggregateArgs> = {
        [P in keyof T & keyof AggregateStatisticsSnapshot]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStatisticsSnapshot[P]>
      : GetScalarType<T[P], AggregateStatisticsSnapshot[P]>
  }




  export type StatisticsSnapshotGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StatisticsSnapshotWhereInput
    orderBy?: StatisticsSnapshotOrderByWithAggregationInput | StatisticsSnapshotOrderByWithAggregationInput[]
    by: StatisticsSnapshotScalarFieldEnum[] | StatisticsSnapshotScalarFieldEnum
    having?: StatisticsSnapshotScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StatisticsSnapshotCountAggregateInputType | true
    _avg?: StatisticsSnapshotAvgAggregateInputType
    _sum?: StatisticsSnapshotSumAggregateInputType
    _min?: StatisticsSnapshotMinAggregateInputType
    _max?: StatisticsSnapshotMaxAggregateInputType
  }

  export type StatisticsSnapshotGroupByOutputType = {
    id: number
    dataSourceCode: string
    data: JsonValue
    recordedAt: Date
    _count: StatisticsSnapshotCountAggregateOutputType | null
    _avg: StatisticsSnapshotAvgAggregateOutputType | null
    _sum: StatisticsSnapshotSumAggregateOutputType | null
    _min: StatisticsSnapshotMinAggregateOutputType | null
    _max: StatisticsSnapshotMaxAggregateOutputType | null
  }

  type GetStatisticsSnapshotGroupByPayload<T extends StatisticsSnapshotGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StatisticsSnapshotGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StatisticsSnapshotGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StatisticsSnapshotGroupByOutputType[P]>
            : GetScalarType<T[P], StatisticsSnapshotGroupByOutputType[P]>
        }
      >
    >


  export type StatisticsSnapshotSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dataSourceCode?: boolean
    data?: boolean
    recordedAt?: boolean
  }, ExtArgs["result"]["statisticsSnapshot"]>



  export type StatisticsSnapshotSelectScalar = {
    id?: boolean
    dataSourceCode?: boolean
    data?: boolean
    recordedAt?: boolean
  }

  export type StatisticsSnapshotOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "dataSourceCode" | "data" | "recordedAt", ExtArgs["result"]["statisticsSnapshot"]>

  export type $StatisticsSnapshotPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "StatisticsSnapshot"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      dataSourceCode: string
      data: Prisma.JsonValue
      recordedAt: Date
    }, ExtArgs["result"]["statisticsSnapshot"]>
    composites: {}
  }

  type StatisticsSnapshotGetPayload<S extends boolean | null | undefined | StatisticsSnapshotDefaultArgs> = $Result.GetResult<Prisma.$StatisticsSnapshotPayload, S>

  type StatisticsSnapshotCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StatisticsSnapshotFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: StatisticsSnapshotCountAggregateInputType | true
    }

  export interface StatisticsSnapshotDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['StatisticsSnapshot'], meta: { name: 'StatisticsSnapshot' } }
    /**
     * Find zero or one StatisticsSnapshot that matches the filter.
     * @param {StatisticsSnapshotFindUniqueArgs} args - Arguments to find a StatisticsSnapshot
     * @example
     * // Get one StatisticsSnapshot
     * const statisticsSnapshot = await prisma.statisticsSnapshot.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StatisticsSnapshotFindUniqueArgs>(args: SelectSubset<T, StatisticsSnapshotFindUniqueArgs<ExtArgs>>): Prisma__StatisticsSnapshotClient<$Result.GetResult<Prisma.$StatisticsSnapshotPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one StatisticsSnapshot that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StatisticsSnapshotFindUniqueOrThrowArgs} args - Arguments to find a StatisticsSnapshot
     * @example
     * // Get one StatisticsSnapshot
     * const statisticsSnapshot = await prisma.statisticsSnapshot.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StatisticsSnapshotFindUniqueOrThrowArgs>(args: SelectSubset<T, StatisticsSnapshotFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StatisticsSnapshotClient<$Result.GetResult<Prisma.$StatisticsSnapshotPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StatisticsSnapshot that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatisticsSnapshotFindFirstArgs} args - Arguments to find a StatisticsSnapshot
     * @example
     * // Get one StatisticsSnapshot
     * const statisticsSnapshot = await prisma.statisticsSnapshot.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StatisticsSnapshotFindFirstArgs>(args?: SelectSubset<T, StatisticsSnapshotFindFirstArgs<ExtArgs>>): Prisma__StatisticsSnapshotClient<$Result.GetResult<Prisma.$StatisticsSnapshotPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StatisticsSnapshot that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatisticsSnapshotFindFirstOrThrowArgs} args - Arguments to find a StatisticsSnapshot
     * @example
     * // Get one StatisticsSnapshot
     * const statisticsSnapshot = await prisma.statisticsSnapshot.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StatisticsSnapshotFindFirstOrThrowArgs>(args?: SelectSubset<T, StatisticsSnapshotFindFirstOrThrowArgs<ExtArgs>>): Prisma__StatisticsSnapshotClient<$Result.GetResult<Prisma.$StatisticsSnapshotPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more StatisticsSnapshots that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatisticsSnapshotFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all StatisticsSnapshots
     * const statisticsSnapshots = await prisma.statisticsSnapshot.findMany()
     * 
     * // Get first 10 StatisticsSnapshots
     * const statisticsSnapshots = await prisma.statisticsSnapshot.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const statisticsSnapshotWithIdOnly = await prisma.statisticsSnapshot.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StatisticsSnapshotFindManyArgs>(args?: SelectSubset<T, StatisticsSnapshotFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StatisticsSnapshotPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a StatisticsSnapshot.
     * @param {StatisticsSnapshotCreateArgs} args - Arguments to create a StatisticsSnapshot.
     * @example
     * // Create one StatisticsSnapshot
     * const StatisticsSnapshot = await prisma.statisticsSnapshot.create({
     *   data: {
     *     // ... data to create a StatisticsSnapshot
     *   }
     * })
     * 
     */
    create<T extends StatisticsSnapshotCreateArgs>(args: SelectSubset<T, StatisticsSnapshotCreateArgs<ExtArgs>>): Prisma__StatisticsSnapshotClient<$Result.GetResult<Prisma.$StatisticsSnapshotPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many StatisticsSnapshots.
     * @param {StatisticsSnapshotCreateManyArgs} args - Arguments to create many StatisticsSnapshots.
     * @example
     * // Create many StatisticsSnapshots
     * const statisticsSnapshot = await prisma.statisticsSnapshot.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StatisticsSnapshotCreateManyArgs>(args?: SelectSubset<T, StatisticsSnapshotCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a StatisticsSnapshot.
     * @param {StatisticsSnapshotDeleteArgs} args - Arguments to delete one StatisticsSnapshot.
     * @example
     * // Delete one StatisticsSnapshot
     * const StatisticsSnapshot = await prisma.statisticsSnapshot.delete({
     *   where: {
     *     // ... filter to delete one StatisticsSnapshot
     *   }
     * })
     * 
     */
    delete<T extends StatisticsSnapshotDeleteArgs>(args: SelectSubset<T, StatisticsSnapshotDeleteArgs<ExtArgs>>): Prisma__StatisticsSnapshotClient<$Result.GetResult<Prisma.$StatisticsSnapshotPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one StatisticsSnapshot.
     * @param {StatisticsSnapshotUpdateArgs} args - Arguments to update one StatisticsSnapshot.
     * @example
     * // Update one StatisticsSnapshot
     * const statisticsSnapshot = await prisma.statisticsSnapshot.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StatisticsSnapshotUpdateArgs>(args: SelectSubset<T, StatisticsSnapshotUpdateArgs<ExtArgs>>): Prisma__StatisticsSnapshotClient<$Result.GetResult<Prisma.$StatisticsSnapshotPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more StatisticsSnapshots.
     * @param {StatisticsSnapshotDeleteManyArgs} args - Arguments to filter StatisticsSnapshots to delete.
     * @example
     * // Delete a few StatisticsSnapshots
     * const { count } = await prisma.statisticsSnapshot.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StatisticsSnapshotDeleteManyArgs>(args?: SelectSubset<T, StatisticsSnapshotDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StatisticsSnapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatisticsSnapshotUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many StatisticsSnapshots
     * const statisticsSnapshot = await prisma.statisticsSnapshot.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StatisticsSnapshotUpdateManyArgs>(args: SelectSubset<T, StatisticsSnapshotUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one StatisticsSnapshot.
     * @param {StatisticsSnapshotUpsertArgs} args - Arguments to update or create a StatisticsSnapshot.
     * @example
     * // Update or create a StatisticsSnapshot
     * const statisticsSnapshot = await prisma.statisticsSnapshot.upsert({
     *   create: {
     *     // ... data to create a StatisticsSnapshot
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the StatisticsSnapshot we want to update
     *   }
     * })
     */
    upsert<T extends StatisticsSnapshotUpsertArgs>(args: SelectSubset<T, StatisticsSnapshotUpsertArgs<ExtArgs>>): Prisma__StatisticsSnapshotClient<$Result.GetResult<Prisma.$StatisticsSnapshotPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of StatisticsSnapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatisticsSnapshotCountArgs} args - Arguments to filter StatisticsSnapshots to count.
     * @example
     * // Count the number of StatisticsSnapshots
     * const count = await prisma.statisticsSnapshot.count({
     *   where: {
     *     // ... the filter for the StatisticsSnapshots we want to count
     *   }
     * })
    **/
    count<T extends StatisticsSnapshotCountArgs>(
      args?: Subset<T, StatisticsSnapshotCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StatisticsSnapshotCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a StatisticsSnapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatisticsSnapshotAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends StatisticsSnapshotAggregateArgs>(args: Subset<T, StatisticsSnapshotAggregateArgs>): Prisma.PrismaPromise<GetStatisticsSnapshotAggregateType<T>>

    /**
     * Group by StatisticsSnapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatisticsSnapshotGroupByArgs} args - Group by arguments.
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
      T extends StatisticsSnapshotGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StatisticsSnapshotGroupByArgs['orderBy'] }
        : { orderBy?: StatisticsSnapshotGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, StatisticsSnapshotGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStatisticsSnapshotGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the StatisticsSnapshot model
   */
  readonly fields: StatisticsSnapshotFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for StatisticsSnapshot.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StatisticsSnapshotClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the StatisticsSnapshot model
   */
  interface StatisticsSnapshotFieldRefs {
    readonly id: FieldRef<"StatisticsSnapshot", 'Int'>
    readonly dataSourceCode: FieldRef<"StatisticsSnapshot", 'String'>
    readonly data: FieldRef<"StatisticsSnapshot", 'Json'>
    readonly recordedAt: FieldRef<"StatisticsSnapshot", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * StatisticsSnapshot findUnique
   */
  export type StatisticsSnapshotFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatisticsSnapshot
     */
    select?: StatisticsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatisticsSnapshot
     */
    omit?: StatisticsSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which StatisticsSnapshot to fetch.
     */
    where: StatisticsSnapshotWhereUniqueInput
  }

  /**
   * StatisticsSnapshot findUniqueOrThrow
   */
  export type StatisticsSnapshotFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatisticsSnapshot
     */
    select?: StatisticsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatisticsSnapshot
     */
    omit?: StatisticsSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which StatisticsSnapshot to fetch.
     */
    where: StatisticsSnapshotWhereUniqueInput
  }

  /**
   * StatisticsSnapshot findFirst
   */
  export type StatisticsSnapshotFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatisticsSnapshot
     */
    select?: StatisticsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatisticsSnapshot
     */
    omit?: StatisticsSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which StatisticsSnapshot to fetch.
     */
    where?: StatisticsSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StatisticsSnapshots to fetch.
     */
    orderBy?: StatisticsSnapshotOrderByWithRelationInput | StatisticsSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StatisticsSnapshots.
     */
    cursor?: StatisticsSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StatisticsSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StatisticsSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StatisticsSnapshots.
     */
    distinct?: StatisticsSnapshotScalarFieldEnum | StatisticsSnapshotScalarFieldEnum[]
  }

  /**
   * StatisticsSnapshot findFirstOrThrow
   */
  export type StatisticsSnapshotFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatisticsSnapshot
     */
    select?: StatisticsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatisticsSnapshot
     */
    omit?: StatisticsSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which StatisticsSnapshot to fetch.
     */
    where?: StatisticsSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StatisticsSnapshots to fetch.
     */
    orderBy?: StatisticsSnapshotOrderByWithRelationInput | StatisticsSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StatisticsSnapshots.
     */
    cursor?: StatisticsSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StatisticsSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StatisticsSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StatisticsSnapshots.
     */
    distinct?: StatisticsSnapshotScalarFieldEnum | StatisticsSnapshotScalarFieldEnum[]
  }

  /**
   * StatisticsSnapshot findMany
   */
  export type StatisticsSnapshotFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatisticsSnapshot
     */
    select?: StatisticsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatisticsSnapshot
     */
    omit?: StatisticsSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which StatisticsSnapshots to fetch.
     */
    where?: StatisticsSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StatisticsSnapshots to fetch.
     */
    orderBy?: StatisticsSnapshotOrderByWithRelationInput | StatisticsSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing StatisticsSnapshots.
     */
    cursor?: StatisticsSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StatisticsSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StatisticsSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StatisticsSnapshots.
     */
    distinct?: StatisticsSnapshotScalarFieldEnum | StatisticsSnapshotScalarFieldEnum[]
  }

  /**
   * StatisticsSnapshot create
   */
  export type StatisticsSnapshotCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatisticsSnapshot
     */
    select?: StatisticsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatisticsSnapshot
     */
    omit?: StatisticsSnapshotOmit<ExtArgs> | null
    /**
     * The data needed to create a StatisticsSnapshot.
     */
    data: XOR<StatisticsSnapshotCreateInput, StatisticsSnapshotUncheckedCreateInput>
  }

  /**
   * StatisticsSnapshot createMany
   */
  export type StatisticsSnapshotCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many StatisticsSnapshots.
     */
    data: StatisticsSnapshotCreateManyInput | StatisticsSnapshotCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StatisticsSnapshot update
   */
  export type StatisticsSnapshotUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatisticsSnapshot
     */
    select?: StatisticsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatisticsSnapshot
     */
    omit?: StatisticsSnapshotOmit<ExtArgs> | null
    /**
     * The data needed to update a StatisticsSnapshot.
     */
    data: XOR<StatisticsSnapshotUpdateInput, StatisticsSnapshotUncheckedUpdateInput>
    /**
     * Choose, which StatisticsSnapshot to update.
     */
    where: StatisticsSnapshotWhereUniqueInput
  }

  /**
   * StatisticsSnapshot updateMany
   */
  export type StatisticsSnapshotUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update StatisticsSnapshots.
     */
    data: XOR<StatisticsSnapshotUpdateManyMutationInput, StatisticsSnapshotUncheckedUpdateManyInput>
    /**
     * Filter which StatisticsSnapshots to update
     */
    where?: StatisticsSnapshotWhereInput
    /**
     * Limit how many StatisticsSnapshots to update.
     */
    limit?: number
  }

  /**
   * StatisticsSnapshot upsert
   */
  export type StatisticsSnapshotUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatisticsSnapshot
     */
    select?: StatisticsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatisticsSnapshot
     */
    omit?: StatisticsSnapshotOmit<ExtArgs> | null
    /**
     * The filter to search for the StatisticsSnapshot to update in case it exists.
     */
    where: StatisticsSnapshotWhereUniqueInput
    /**
     * In case the StatisticsSnapshot found by the `where` argument doesn't exist, create a new StatisticsSnapshot with this data.
     */
    create: XOR<StatisticsSnapshotCreateInput, StatisticsSnapshotUncheckedCreateInput>
    /**
     * In case the StatisticsSnapshot was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StatisticsSnapshotUpdateInput, StatisticsSnapshotUncheckedUpdateInput>
  }

  /**
   * StatisticsSnapshot delete
   */
  export type StatisticsSnapshotDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatisticsSnapshot
     */
    select?: StatisticsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatisticsSnapshot
     */
    omit?: StatisticsSnapshotOmit<ExtArgs> | null
    /**
     * Filter which StatisticsSnapshot to delete.
     */
    where: StatisticsSnapshotWhereUniqueInput
  }

  /**
   * StatisticsSnapshot deleteMany
   */
  export type StatisticsSnapshotDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StatisticsSnapshots to delete
     */
    where?: StatisticsSnapshotWhereInput
    /**
     * Limit how many StatisticsSnapshots to delete.
     */
    limit?: number
  }

  /**
   * StatisticsSnapshot without action
   */
  export type StatisticsSnapshotDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatisticsSnapshot
     */
    select?: StatisticsSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatisticsSnapshot
     */
    omit?: StatisticsSnapshotOmit<ExtArgs> | null
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


  export const ReportTemplateScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    layout: 'layout',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ReportTemplateScalarFieldEnum = (typeof ReportTemplateScalarFieldEnum)[keyof typeof ReportTemplateScalarFieldEnum]


  export const ReportWidgetScalarFieldEnum: {
    id: 'id',
    templateId: 'templateId',
    title: 'title',
    chartType: 'chartType',
    dataSourceCode: 'dataSourceCode',
    xAxisKey: 'xAxisKey',
    yAxisKey: 'yAxisKey',
    config: 'config'
  };

  export type ReportWidgetScalarFieldEnum = (typeof ReportWidgetScalarFieldEnum)[keyof typeof ReportWidgetScalarFieldEnum]


  export const StatisticsSnapshotScalarFieldEnum: {
    id: 'id',
    dataSourceCode: 'dataSourceCode',
    data: 'data',
    recordedAt: 'recordedAt'
  };

  export type StatisticsSnapshotScalarFieldEnum = (typeof StatisticsSnapshotScalarFieldEnum)[keyof typeof StatisticsSnapshotScalarFieldEnum]


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


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


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


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const ReportTemplateOrderByRelevanceFieldEnum: {
    title: 'title',
    description: 'description'
  };

  export type ReportTemplateOrderByRelevanceFieldEnum = (typeof ReportTemplateOrderByRelevanceFieldEnum)[keyof typeof ReportTemplateOrderByRelevanceFieldEnum]


  export const ReportWidgetOrderByRelevanceFieldEnum: {
    title: 'title',
    chartType: 'chartType',
    dataSourceCode: 'dataSourceCode',
    xAxisKey: 'xAxisKey',
    yAxisKey: 'yAxisKey'
  };

  export type ReportWidgetOrderByRelevanceFieldEnum = (typeof ReportWidgetOrderByRelevanceFieldEnum)[keyof typeof ReportWidgetOrderByRelevanceFieldEnum]


  export const StatisticsSnapshotOrderByRelevanceFieldEnum: {
    dataSourceCode: 'dataSourceCode'
  };

  export type StatisticsSnapshotOrderByRelevanceFieldEnum = (typeof StatisticsSnapshotOrderByRelevanceFieldEnum)[keyof typeof StatisticsSnapshotOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


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
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type ReportTemplateWhereInput = {
    AND?: ReportTemplateWhereInput | ReportTemplateWhereInput[]
    OR?: ReportTemplateWhereInput[]
    NOT?: ReportTemplateWhereInput | ReportTemplateWhereInput[]
    id?: IntFilter<"ReportTemplate"> | number
    title?: StringFilter<"ReportTemplate"> | string
    description?: StringNullableFilter<"ReportTemplate"> | string | null
    layout?: JsonNullableFilter<"ReportTemplate">
    createdAt?: DateTimeFilter<"ReportTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"ReportTemplate"> | Date | string
    widgets?: ReportWidgetListRelationFilter
  }

  export type ReportTemplateOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    layout?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    widgets?: ReportWidgetOrderByRelationAggregateInput
    _relevance?: ReportTemplateOrderByRelevanceInput
  }

  export type ReportTemplateWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: ReportTemplateWhereInput | ReportTemplateWhereInput[]
    OR?: ReportTemplateWhereInput[]
    NOT?: ReportTemplateWhereInput | ReportTemplateWhereInput[]
    title?: StringFilter<"ReportTemplate"> | string
    description?: StringNullableFilter<"ReportTemplate"> | string | null
    layout?: JsonNullableFilter<"ReportTemplate">
    createdAt?: DateTimeFilter<"ReportTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"ReportTemplate"> | Date | string
    widgets?: ReportWidgetListRelationFilter
  }, "id">

  export type ReportTemplateOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    layout?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ReportTemplateCountOrderByAggregateInput
    _avg?: ReportTemplateAvgOrderByAggregateInput
    _max?: ReportTemplateMaxOrderByAggregateInput
    _min?: ReportTemplateMinOrderByAggregateInput
    _sum?: ReportTemplateSumOrderByAggregateInput
  }

  export type ReportTemplateScalarWhereWithAggregatesInput = {
    AND?: ReportTemplateScalarWhereWithAggregatesInput | ReportTemplateScalarWhereWithAggregatesInput[]
    OR?: ReportTemplateScalarWhereWithAggregatesInput[]
    NOT?: ReportTemplateScalarWhereWithAggregatesInput | ReportTemplateScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"ReportTemplate"> | number
    title?: StringWithAggregatesFilter<"ReportTemplate"> | string
    description?: StringNullableWithAggregatesFilter<"ReportTemplate"> | string | null
    layout?: JsonNullableWithAggregatesFilter<"ReportTemplate">
    createdAt?: DateTimeWithAggregatesFilter<"ReportTemplate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ReportTemplate"> | Date | string
  }

  export type ReportWidgetWhereInput = {
    AND?: ReportWidgetWhereInput | ReportWidgetWhereInput[]
    OR?: ReportWidgetWhereInput[]
    NOT?: ReportWidgetWhereInput | ReportWidgetWhereInput[]
    id?: IntFilter<"ReportWidget"> | number
    templateId?: IntFilter<"ReportWidget"> | number
    title?: StringFilter<"ReportWidget"> | string
    chartType?: StringFilter<"ReportWidget"> | string
    dataSourceCode?: StringFilter<"ReportWidget"> | string
    xAxisKey?: StringFilter<"ReportWidget"> | string
    yAxisKey?: StringFilter<"ReportWidget"> | string
    config?: JsonNullableFilter<"ReportWidget">
    template?: XOR<ReportTemplateScalarRelationFilter, ReportTemplateWhereInput>
  }

  export type ReportWidgetOrderByWithRelationInput = {
    id?: SortOrder
    templateId?: SortOrder
    title?: SortOrder
    chartType?: SortOrder
    dataSourceCode?: SortOrder
    xAxisKey?: SortOrder
    yAxisKey?: SortOrder
    config?: SortOrderInput | SortOrder
    template?: ReportTemplateOrderByWithRelationInput
    _relevance?: ReportWidgetOrderByRelevanceInput
  }

  export type ReportWidgetWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: ReportWidgetWhereInput | ReportWidgetWhereInput[]
    OR?: ReportWidgetWhereInput[]
    NOT?: ReportWidgetWhereInput | ReportWidgetWhereInput[]
    templateId?: IntFilter<"ReportWidget"> | number
    title?: StringFilter<"ReportWidget"> | string
    chartType?: StringFilter<"ReportWidget"> | string
    dataSourceCode?: StringFilter<"ReportWidget"> | string
    xAxisKey?: StringFilter<"ReportWidget"> | string
    yAxisKey?: StringFilter<"ReportWidget"> | string
    config?: JsonNullableFilter<"ReportWidget">
    template?: XOR<ReportTemplateScalarRelationFilter, ReportTemplateWhereInput>
  }, "id">

  export type ReportWidgetOrderByWithAggregationInput = {
    id?: SortOrder
    templateId?: SortOrder
    title?: SortOrder
    chartType?: SortOrder
    dataSourceCode?: SortOrder
    xAxisKey?: SortOrder
    yAxisKey?: SortOrder
    config?: SortOrderInput | SortOrder
    _count?: ReportWidgetCountOrderByAggregateInput
    _avg?: ReportWidgetAvgOrderByAggregateInput
    _max?: ReportWidgetMaxOrderByAggregateInput
    _min?: ReportWidgetMinOrderByAggregateInput
    _sum?: ReportWidgetSumOrderByAggregateInput
  }

  export type ReportWidgetScalarWhereWithAggregatesInput = {
    AND?: ReportWidgetScalarWhereWithAggregatesInput | ReportWidgetScalarWhereWithAggregatesInput[]
    OR?: ReportWidgetScalarWhereWithAggregatesInput[]
    NOT?: ReportWidgetScalarWhereWithAggregatesInput | ReportWidgetScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"ReportWidget"> | number
    templateId?: IntWithAggregatesFilter<"ReportWidget"> | number
    title?: StringWithAggregatesFilter<"ReportWidget"> | string
    chartType?: StringWithAggregatesFilter<"ReportWidget"> | string
    dataSourceCode?: StringWithAggregatesFilter<"ReportWidget"> | string
    xAxisKey?: StringWithAggregatesFilter<"ReportWidget"> | string
    yAxisKey?: StringWithAggregatesFilter<"ReportWidget"> | string
    config?: JsonNullableWithAggregatesFilter<"ReportWidget">
  }

  export type StatisticsSnapshotWhereInput = {
    AND?: StatisticsSnapshotWhereInput | StatisticsSnapshotWhereInput[]
    OR?: StatisticsSnapshotWhereInput[]
    NOT?: StatisticsSnapshotWhereInput | StatisticsSnapshotWhereInput[]
    id?: IntFilter<"StatisticsSnapshot"> | number
    dataSourceCode?: StringFilter<"StatisticsSnapshot"> | string
    data?: JsonFilter<"StatisticsSnapshot">
    recordedAt?: DateTimeFilter<"StatisticsSnapshot"> | Date | string
  }

  export type StatisticsSnapshotOrderByWithRelationInput = {
    id?: SortOrder
    dataSourceCode?: SortOrder
    data?: SortOrder
    recordedAt?: SortOrder
    _relevance?: StatisticsSnapshotOrderByRelevanceInput
  }

  export type StatisticsSnapshotWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: StatisticsSnapshotWhereInput | StatisticsSnapshotWhereInput[]
    OR?: StatisticsSnapshotWhereInput[]
    NOT?: StatisticsSnapshotWhereInput | StatisticsSnapshotWhereInput[]
    dataSourceCode?: StringFilter<"StatisticsSnapshot"> | string
    data?: JsonFilter<"StatisticsSnapshot">
    recordedAt?: DateTimeFilter<"StatisticsSnapshot"> | Date | string
  }, "id">

  export type StatisticsSnapshotOrderByWithAggregationInput = {
    id?: SortOrder
    dataSourceCode?: SortOrder
    data?: SortOrder
    recordedAt?: SortOrder
    _count?: StatisticsSnapshotCountOrderByAggregateInput
    _avg?: StatisticsSnapshotAvgOrderByAggregateInput
    _max?: StatisticsSnapshotMaxOrderByAggregateInput
    _min?: StatisticsSnapshotMinOrderByAggregateInput
    _sum?: StatisticsSnapshotSumOrderByAggregateInput
  }

  export type StatisticsSnapshotScalarWhereWithAggregatesInput = {
    AND?: StatisticsSnapshotScalarWhereWithAggregatesInput | StatisticsSnapshotScalarWhereWithAggregatesInput[]
    OR?: StatisticsSnapshotScalarWhereWithAggregatesInput[]
    NOT?: StatisticsSnapshotScalarWhereWithAggregatesInput | StatisticsSnapshotScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"StatisticsSnapshot"> | number
    dataSourceCode?: StringWithAggregatesFilter<"StatisticsSnapshot"> | string
    data?: JsonWithAggregatesFilter<"StatisticsSnapshot">
    recordedAt?: DateTimeWithAggregatesFilter<"StatisticsSnapshot"> | Date | string
  }

  export type ReportTemplateCreateInput = {
    title: string
    description?: string | null
    layout?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    widgets?: ReportWidgetCreateNestedManyWithoutTemplateInput
  }

  export type ReportTemplateUncheckedCreateInput = {
    id?: number
    title: string
    description?: string | null
    layout?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    widgets?: ReportWidgetUncheckedCreateNestedManyWithoutTemplateInput
  }

  export type ReportTemplateUpdateInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    layout?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    widgets?: ReportWidgetUpdateManyWithoutTemplateNestedInput
  }

  export type ReportTemplateUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    layout?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    widgets?: ReportWidgetUncheckedUpdateManyWithoutTemplateNestedInput
  }

  export type ReportTemplateCreateManyInput = {
    id?: number
    title: string
    description?: string | null
    layout?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReportTemplateUpdateManyMutationInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    layout?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReportTemplateUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    layout?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReportWidgetCreateInput = {
    title: string
    chartType: string
    dataSourceCode: string
    xAxisKey: string
    yAxisKey: string
    config?: NullableJsonNullValueInput | InputJsonValue
    template: ReportTemplateCreateNestedOneWithoutWidgetsInput
  }

  export type ReportWidgetUncheckedCreateInput = {
    id?: number
    templateId: number
    title: string
    chartType: string
    dataSourceCode: string
    xAxisKey: string
    yAxisKey: string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ReportWidgetUpdateInput = {
    title?: StringFieldUpdateOperationsInput | string
    chartType?: StringFieldUpdateOperationsInput | string
    dataSourceCode?: StringFieldUpdateOperationsInput | string
    xAxisKey?: StringFieldUpdateOperationsInput | string
    yAxisKey?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    template?: ReportTemplateUpdateOneRequiredWithoutWidgetsNestedInput
  }

  export type ReportWidgetUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    templateId?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    chartType?: StringFieldUpdateOperationsInput | string
    dataSourceCode?: StringFieldUpdateOperationsInput | string
    xAxisKey?: StringFieldUpdateOperationsInput | string
    yAxisKey?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ReportWidgetCreateManyInput = {
    id?: number
    templateId: number
    title: string
    chartType: string
    dataSourceCode: string
    xAxisKey: string
    yAxisKey: string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ReportWidgetUpdateManyMutationInput = {
    title?: StringFieldUpdateOperationsInput | string
    chartType?: StringFieldUpdateOperationsInput | string
    dataSourceCode?: StringFieldUpdateOperationsInput | string
    xAxisKey?: StringFieldUpdateOperationsInput | string
    yAxisKey?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ReportWidgetUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    templateId?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    chartType?: StringFieldUpdateOperationsInput | string
    dataSourceCode?: StringFieldUpdateOperationsInput | string
    xAxisKey?: StringFieldUpdateOperationsInput | string
    yAxisKey?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type StatisticsSnapshotCreateInput = {
    dataSourceCode: string
    data: JsonNullValueInput | InputJsonValue
    recordedAt?: Date | string
  }

  export type StatisticsSnapshotUncheckedCreateInput = {
    id?: number
    dataSourceCode: string
    data: JsonNullValueInput | InputJsonValue
    recordedAt?: Date | string
  }

  export type StatisticsSnapshotUpdateInput = {
    dataSourceCode?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    recordedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StatisticsSnapshotUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    dataSourceCode?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    recordedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StatisticsSnapshotCreateManyInput = {
    id?: number
    dataSourceCode: string
    data: JsonNullValueInput | InputJsonValue
    recordedAt?: Date | string
  }

  export type StatisticsSnapshotUpdateManyMutationInput = {
    dataSourceCode?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    recordedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StatisticsSnapshotUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    dataSourceCode?: StringFieldUpdateOperationsInput | string
    data?: JsonNullValueInput | InputJsonValue
    recordedAt?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type ReportWidgetListRelationFilter = {
    every?: ReportWidgetWhereInput
    some?: ReportWidgetWhereInput
    none?: ReportWidgetWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ReportWidgetOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReportTemplateOrderByRelevanceInput = {
    fields: ReportTemplateOrderByRelevanceFieldEnum | ReportTemplateOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ReportTemplateCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    layout?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReportTemplateAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type ReportTemplateMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReportTemplateMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReportTemplateSumOrderByAggregateInput = {
    id?: SortOrder
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

  export type ReportTemplateScalarRelationFilter = {
    is?: ReportTemplateWhereInput
    isNot?: ReportTemplateWhereInput
  }

  export type ReportWidgetOrderByRelevanceInput = {
    fields: ReportWidgetOrderByRelevanceFieldEnum | ReportWidgetOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ReportWidgetCountOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
    title?: SortOrder
    chartType?: SortOrder
    dataSourceCode?: SortOrder
    xAxisKey?: SortOrder
    yAxisKey?: SortOrder
    config?: SortOrder
  }

  export type ReportWidgetAvgOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
  }

  export type ReportWidgetMaxOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
    title?: SortOrder
    chartType?: SortOrder
    dataSourceCode?: SortOrder
    xAxisKey?: SortOrder
    yAxisKey?: SortOrder
  }

  export type ReportWidgetMinOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
    title?: SortOrder
    chartType?: SortOrder
    dataSourceCode?: SortOrder
    xAxisKey?: SortOrder
    yAxisKey?: SortOrder
  }

  export type ReportWidgetSumOrderByAggregateInput = {
    id?: SortOrder
    templateId?: SortOrder
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

  export type StatisticsSnapshotOrderByRelevanceInput = {
    fields: StatisticsSnapshotOrderByRelevanceFieldEnum | StatisticsSnapshotOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type StatisticsSnapshotCountOrderByAggregateInput = {
    id?: SortOrder
    dataSourceCode?: SortOrder
    data?: SortOrder
    recordedAt?: SortOrder
  }

  export type StatisticsSnapshotAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type StatisticsSnapshotMaxOrderByAggregateInput = {
    id?: SortOrder
    dataSourceCode?: SortOrder
    recordedAt?: SortOrder
  }

  export type StatisticsSnapshotMinOrderByAggregateInput = {
    id?: SortOrder
    dataSourceCode?: SortOrder
    recordedAt?: SortOrder
  }

  export type StatisticsSnapshotSumOrderByAggregateInput = {
    id?: SortOrder
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

  export type ReportWidgetCreateNestedManyWithoutTemplateInput = {
    create?: XOR<ReportWidgetCreateWithoutTemplateInput, ReportWidgetUncheckedCreateWithoutTemplateInput> | ReportWidgetCreateWithoutTemplateInput[] | ReportWidgetUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: ReportWidgetCreateOrConnectWithoutTemplateInput | ReportWidgetCreateOrConnectWithoutTemplateInput[]
    createMany?: ReportWidgetCreateManyTemplateInputEnvelope
    connect?: ReportWidgetWhereUniqueInput | ReportWidgetWhereUniqueInput[]
  }

  export type ReportWidgetUncheckedCreateNestedManyWithoutTemplateInput = {
    create?: XOR<ReportWidgetCreateWithoutTemplateInput, ReportWidgetUncheckedCreateWithoutTemplateInput> | ReportWidgetCreateWithoutTemplateInput[] | ReportWidgetUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: ReportWidgetCreateOrConnectWithoutTemplateInput | ReportWidgetCreateOrConnectWithoutTemplateInput[]
    createMany?: ReportWidgetCreateManyTemplateInputEnvelope
    connect?: ReportWidgetWhereUniqueInput | ReportWidgetWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ReportWidgetUpdateManyWithoutTemplateNestedInput = {
    create?: XOR<ReportWidgetCreateWithoutTemplateInput, ReportWidgetUncheckedCreateWithoutTemplateInput> | ReportWidgetCreateWithoutTemplateInput[] | ReportWidgetUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: ReportWidgetCreateOrConnectWithoutTemplateInput | ReportWidgetCreateOrConnectWithoutTemplateInput[]
    upsert?: ReportWidgetUpsertWithWhereUniqueWithoutTemplateInput | ReportWidgetUpsertWithWhereUniqueWithoutTemplateInput[]
    createMany?: ReportWidgetCreateManyTemplateInputEnvelope
    set?: ReportWidgetWhereUniqueInput | ReportWidgetWhereUniqueInput[]
    disconnect?: ReportWidgetWhereUniqueInput | ReportWidgetWhereUniqueInput[]
    delete?: ReportWidgetWhereUniqueInput | ReportWidgetWhereUniqueInput[]
    connect?: ReportWidgetWhereUniqueInput | ReportWidgetWhereUniqueInput[]
    update?: ReportWidgetUpdateWithWhereUniqueWithoutTemplateInput | ReportWidgetUpdateWithWhereUniqueWithoutTemplateInput[]
    updateMany?: ReportWidgetUpdateManyWithWhereWithoutTemplateInput | ReportWidgetUpdateManyWithWhereWithoutTemplateInput[]
    deleteMany?: ReportWidgetScalarWhereInput | ReportWidgetScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ReportWidgetUncheckedUpdateManyWithoutTemplateNestedInput = {
    create?: XOR<ReportWidgetCreateWithoutTemplateInput, ReportWidgetUncheckedCreateWithoutTemplateInput> | ReportWidgetCreateWithoutTemplateInput[] | ReportWidgetUncheckedCreateWithoutTemplateInput[]
    connectOrCreate?: ReportWidgetCreateOrConnectWithoutTemplateInput | ReportWidgetCreateOrConnectWithoutTemplateInput[]
    upsert?: ReportWidgetUpsertWithWhereUniqueWithoutTemplateInput | ReportWidgetUpsertWithWhereUniqueWithoutTemplateInput[]
    createMany?: ReportWidgetCreateManyTemplateInputEnvelope
    set?: ReportWidgetWhereUniqueInput | ReportWidgetWhereUniqueInput[]
    disconnect?: ReportWidgetWhereUniqueInput | ReportWidgetWhereUniqueInput[]
    delete?: ReportWidgetWhereUniqueInput | ReportWidgetWhereUniqueInput[]
    connect?: ReportWidgetWhereUniqueInput | ReportWidgetWhereUniqueInput[]
    update?: ReportWidgetUpdateWithWhereUniqueWithoutTemplateInput | ReportWidgetUpdateWithWhereUniqueWithoutTemplateInput[]
    updateMany?: ReportWidgetUpdateManyWithWhereWithoutTemplateInput | ReportWidgetUpdateManyWithWhereWithoutTemplateInput[]
    deleteMany?: ReportWidgetScalarWhereInput | ReportWidgetScalarWhereInput[]
  }

  export type ReportTemplateCreateNestedOneWithoutWidgetsInput = {
    create?: XOR<ReportTemplateCreateWithoutWidgetsInput, ReportTemplateUncheckedCreateWithoutWidgetsInput>
    connectOrCreate?: ReportTemplateCreateOrConnectWithoutWidgetsInput
    connect?: ReportTemplateWhereUniqueInput
  }

  export type ReportTemplateUpdateOneRequiredWithoutWidgetsNestedInput = {
    create?: XOR<ReportTemplateCreateWithoutWidgetsInput, ReportTemplateUncheckedCreateWithoutWidgetsInput>
    connectOrCreate?: ReportTemplateCreateOrConnectWithoutWidgetsInput
    upsert?: ReportTemplateUpsertWithoutWidgetsInput
    connect?: ReportTemplateWhereUniqueInput
    update?: XOR<XOR<ReportTemplateUpdateToOneWithWhereWithoutWidgetsInput, ReportTemplateUpdateWithoutWidgetsInput>, ReportTemplateUncheckedUpdateWithoutWidgetsInput>
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

  export type ReportWidgetCreateWithoutTemplateInput = {
    title: string
    chartType: string
    dataSourceCode: string
    xAxisKey: string
    yAxisKey: string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ReportWidgetUncheckedCreateWithoutTemplateInput = {
    id?: number
    title: string
    chartType: string
    dataSourceCode: string
    xAxisKey: string
    yAxisKey: string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ReportWidgetCreateOrConnectWithoutTemplateInput = {
    where: ReportWidgetWhereUniqueInput
    create: XOR<ReportWidgetCreateWithoutTemplateInput, ReportWidgetUncheckedCreateWithoutTemplateInput>
  }

  export type ReportWidgetCreateManyTemplateInputEnvelope = {
    data: ReportWidgetCreateManyTemplateInput | ReportWidgetCreateManyTemplateInput[]
    skipDuplicates?: boolean
  }

  export type ReportWidgetUpsertWithWhereUniqueWithoutTemplateInput = {
    where: ReportWidgetWhereUniqueInput
    update: XOR<ReportWidgetUpdateWithoutTemplateInput, ReportWidgetUncheckedUpdateWithoutTemplateInput>
    create: XOR<ReportWidgetCreateWithoutTemplateInput, ReportWidgetUncheckedCreateWithoutTemplateInput>
  }

  export type ReportWidgetUpdateWithWhereUniqueWithoutTemplateInput = {
    where: ReportWidgetWhereUniqueInput
    data: XOR<ReportWidgetUpdateWithoutTemplateInput, ReportWidgetUncheckedUpdateWithoutTemplateInput>
  }

  export type ReportWidgetUpdateManyWithWhereWithoutTemplateInput = {
    where: ReportWidgetScalarWhereInput
    data: XOR<ReportWidgetUpdateManyMutationInput, ReportWidgetUncheckedUpdateManyWithoutTemplateInput>
  }

  export type ReportWidgetScalarWhereInput = {
    AND?: ReportWidgetScalarWhereInput | ReportWidgetScalarWhereInput[]
    OR?: ReportWidgetScalarWhereInput[]
    NOT?: ReportWidgetScalarWhereInput | ReportWidgetScalarWhereInput[]
    id?: IntFilter<"ReportWidget"> | number
    templateId?: IntFilter<"ReportWidget"> | number
    title?: StringFilter<"ReportWidget"> | string
    chartType?: StringFilter<"ReportWidget"> | string
    dataSourceCode?: StringFilter<"ReportWidget"> | string
    xAxisKey?: StringFilter<"ReportWidget"> | string
    yAxisKey?: StringFilter<"ReportWidget"> | string
    config?: JsonNullableFilter<"ReportWidget">
  }

  export type ReportTemplateCreateWithoutWidgetsInput = {
    title: string
    description?: string | null
    layout?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReportTemplateUncheckedCreateWithoutWidgetsInput = {
    id?: number
    title: string
    description?: string | null
    layout?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReportTemplateCreateOrConnectWithoutWidgetsInput = {
    where: ReportTemplateWhereUniqueInput
    create: XOR<ReportTemplateCreateWithoutWidgetsInput, ReportTemplateUncheckedCreateWithoutWidgetsInput>
  }

  export type ReportTemplateUpsertWithoutWidgetsInput = {
    update: XOR<ReportTemplateUpdateWithoutWidgetsInput, ReportTemplateUncheckedUpdateWithoutWidgetsInput>
    create: XOR<ReportTemplateCreateWithoutWidgetsInput, ReportTemplateUncheckedCreateWithoutWidgetsInput>
    where?: ReportTemplateWhereInput
  }

  export type ReportTemplateUpdateToOneWithWhereWithoutWidgetsInput = {
    where?: ReportTemplateWhereInput
    data: XOR<ReportTemplateUpdateWithoutWidgetsInput, ReportTemplateUncheckedUpdateWithoutWidgetsInput>
  }

  export type ReportTemplateUpdateWithoutWidgetsInput = {
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    layout?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReportTemplateUncheckedUpdateWithoutWidgetsInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    layout?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReportWidgetCreateManyTemplateInput = {
    id?: number
    title: string
    chartType: string
    dataSourceCode: string
    xAxisKey: string
    yAxisKey: string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ReportWidgetUpdateWithoutTemplateInput = {
    title?: StringFieldUpdateOperationsInput | string
    chartType?: StringFieldUpdateOperationsInput | string
    dataSourceCode?: StringFieldUpdateOperationsInput | string
    xAxisKey?: StringFieldUpdateOperationsInput | string
    yAxisKey?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ReportWidgetUncheckedUpdateWithoutTemplateInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    chartType?: StringFieldUpdateOperationsInput | string
    dataSourceCode?: StringFieldUpdateOperationsInput | string
    xAxisKey?: StringFieldUpdateOperationsInput | string
    yAxisKey?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ReportWidgetUncheckedUpdateManyWithoutTemplateInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    chartType?: StringFieldUpdateOperationsInput | string
    dataSourceCode?: StringFieldUpdateOperationsInput | string
    xAxisKey?: StringFieldUpdateOperationsInput | string
    yAxisKey?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
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