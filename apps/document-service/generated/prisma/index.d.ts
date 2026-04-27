
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
 * Model Category
 * 
 */
export type Category = $Result.DefaultSelection<Prisma.$CategoryPayload>
/**
 * Model Consultation
 * 
 */
export type Consultation = $Result.DefaultSelection<Prisma.$ConsultationPayload>
/**
 * Model ConsultationResponse
 * 
 */
export type ConsultationResponse = $Result.DefaultSelection<Prisma.$ConsultationResponsePayload>
/**
 * Model Document
 * 
 */
export type Document = $Result.DefaultSelection<Prisma.$DocumentPayload>
/**
 * Model Minutes
 * 
 */
export type Minutes = $Result.DefaultSelection<Prisma.$MinutesPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Categories
 * const categories = await prisma.category.findMany()
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
   * // Fetch zero or more Categories
   * const categories = await prisma.category.findMany()
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
   * `prisma.category`: Exposes CRUD operations for the **Category** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Categories
    * const categories = await prisma.category.findMany()
    * ```
    */
  get category(): Prisma.CategoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.consultation`: Exposes CRUD operations for the **Consultation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Consultations
    * const consultations = await prisma.consultation.findMany()
    * ```
    */
  get consultation(): Prisma.ConsultationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.consultationResponse`: Exposes CRUD operations for the **ConsultationResponse** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ConsultationResponses
    * const consultationResponses = await prisma.consultationResponse.findMany()
    * ```
    */
  get consultationResponse(): Prisma.ConsultationResponseDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.document`: Exposes CRUD operations for the **Document** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Documents
    * const documents = await prisma.document.findMany()
    * ```
    */
  get document(): Prisma.DocumentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.minutes`: Exposes CRUD operations for the **Minutes** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Minutes
    * const minutes = await prisma.minutes.findMany()
    * ```
    */
  get minutes(): Prisma.MinutesDelegate<ExtArgs, ClientOptions>;
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
    Category: 'Category',
    Consultation: 'Consultation',
    ConsultationResponse: 'ConsultationResponse',
    Document: 'Document',
    Minutes: 'Minutes'
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
      modelProps: "category" | "consultation" | "consultationResponse" | "document" | "minutes"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
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
      Consultation: {
        payload: Prisma.$ConsultationPayload<ExtArgs>
        fields: Prisma.ConsultationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConsultationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConsultationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationPayload>
          }
          findFirst: {
            args: Prisma.ConsultationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConsultationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationPayload>
          }
          findMany: {
            args: Prisma.ConsultationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationPayload>[]
          }
          create: {
            args: Prisma.ConsultationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationPayload>
          }
          createMany: {
            args: Prisma.ConsultationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ConsultationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationPayload>
          }
          update: {
            args: Prisma.ConsultationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationPayload>
          }
          deleteMany: {
            args: Prisma.ConsultationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConsultationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ConsultationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationPayload>
          }
          aggregate: {
            args: Prisma.ConsultationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConsultation>
          }
          groupBy: {
            args: Prisma.ConsultationGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConsultationGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConsultationCountArgs<ExtArgs>
            result: $Utils.Optional<ConsultationCountAggregateOutputType> | number
          }
        }
      }
      ConsultationResponse: {
        payload: Prisma.$ConsultationResponsePayload<ExtArgs>
        fields: Prisma.ConsultationResponseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConsultationResponseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationResponsePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConsultationResponseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationResponsePayload>
          }
          findFirst: {
            args: Prisma.ConsultationResponseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationResponsePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConsultationResponseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationResponsePayload>
          }
          findMany: {
            args: Prisma.ConsultationResponseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationResponsePayload>[]
          }
          create: {
            args: Prisma.ConsultationResponseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationResponsePayload>
          }
          createMany: {
            args: Prisma.ConsultationResponseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ConsultationResponseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationResponsePayload>
          }
          update: {
            args: Prisma.ConsultationResponseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationResponsePayload>
          }
          deleteMany: {
            args: Prisma.ConsultationResponseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConsultationResponseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ConsultationResponseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsultationResponsePayload>
          }
          aggregate: {
            args: Prisma.ConsultationResponseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConsultationResponse>
          }
          groupBy: {
            args: Prisma.ConsultationResponseGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConsultationResponseGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConsultationResponseCountArgs<ExtArgs>
            result: $Utils.Optional<ConsultationResponseCountAggregateOutputType> | number
          }
        }
      }
      Document: {
        payload: Prisma.$DocumentPayload<ExtArgs>
        fields: Prisma.DocumentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DocumentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DocumentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload>
          }
          findFirst: {
            args: Prisma.DocumentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DocumentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload>
          }
          findMany: {
            args: Prisma.DocumentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload>[]
          }
          create: {
            args: Prisma.DocumentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload>
          }
          createMany: {
            args: Prisma.DocumentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.DocumentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload>
          }
          update: {
            args: Prisma.DocumentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload>
          }
          deleteMany: {
            args: Prisma.DocumentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DocumentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DocumentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentPayload>
          }
          aggregate: {
            args: Prisma.DocumentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDocument>
          }
          groupBy: {
            args: Prisma.DocumentGroupByArgs<ExtArgs>
            result: $Utils.Optional<DocumentGroupByOutputType>[]
          }
          count: {
            args: Prisma.DocumentCountArgs<ExtArgs>
            result: $Utils.Optional<DocumentCountAggregateOutputType> | number
          }
        }
      }
      Minutes: {
        payload: Prisma.$MinutesPayload<ExtArgs>
        fields: Prisma.MinutesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MinutesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MinutesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MinutesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MinutesPayload>
          }
          findFirst: {
            args: Prisma.MinutesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MinutesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MinutesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MinutesPayload>
          }
          findMany: {
            args: Prisma.MinutesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MinutesPayload>[]
          }
          create: {
            args: Prisma.MinutesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MinutesPayload>
          }
          createMany: {
            args: Prisma.MinutesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.MinutesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MinutesPayload>
          }
          update: {
            args: Prisma.MinutesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MinutesPayload>
          }
          deleteMany: {
            args: Prisma.MinutesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MinutesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MinutesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MinutesPayload>
          }
          aggregate: {
            args: Prisma.MinutesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMinutes>
          }
          groupBy: {
            args: Prisma.MinutesGroupByArgs<ExtArgs>
            result: $Utils.Optional<MinutesGroupByOutputType>[]
          }
          count: {
            args: Prisma.MinutesCountArgs<ExtArgs>
            result: $Utils.Optional<MinutesCountAggregateOutputType> | number
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
    category?: CategoryOmit
    consultation?: ConsultationOmit
    consultationResponse?: ConsultationResponseOmit
    document?: DocumentOmit
    minutes?: MinutesOmit
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
    documentsByType: number
    documentsByField: number
  }

  export type CategoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    children?: boolean | CategoryCountOutputTypeCountChildrenArgs
    documentsByType?: boolean | CategoryCountOutputTypeCountDocumentsByTypeArgs
    documentsByField?: boolean | CategoryCountOutputTypeCountDocumentsByFieldArgs
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
  export type CategoryCountOutputTypeCountDocumentsByTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentWhereInput
  }

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountDocumentsByFieldArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentWhereInput
  }


  /**
   * Count Type ConsultationCountOutputType
   */

  export type ConsultationCountOutputType = {
    responses: number
  }

  export type ConsultationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    responses?: boolean | ConsultationCountOutputTypeCountResponsesArgs
  }

  // Custom InputTypes
  /**
   * ConsultationCountOutputType without action
   */
  export type ConsultationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsultationCountOutputType
     */
    select?: ConsultationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ConsultationCountOutputType without action
   */
  export type ConsultationCountOutputTypeCountResponsesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConsultationResponseWhereInput
  }


  /**
   * Models
   */

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
    orderIndex: number | null
    description: string | null
    type: string | null
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
    orderIndex: number | null
    description: string | null
    type: string | null
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
    orderIndex: number
    description: number
    type: number
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
    orderIndex?: true
    description?: true
    type?: true
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
    orderIndex?: true
    description?: true
    type?: true
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
    orderIndex?: true
    description?: true
    type?: true
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
    orderIndex: number
    description: string | null
    type: string
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
    orderIndex?: boolean
    description?: boolean
    type?: boolean
    isGovStandard?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parent?: boolean | Category$parentArgs<ExtArgs>
    children?: boolean | Category$childrenArgs<ExtArgs>
    documentsByType?: boolean | Category$documentsByTypeArgs<ExtArgs>
    documentsByField?: boolean | Category$documentsByFieldArgs<ExtArgs>
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
    orderIndex?: boolean
    description?: boolean
    type?: boolean
    isGovStandard?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CategoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "slug" | "parentId" | "lft" | "rgt" | "depth" | "status" | "orderIndex" | "description" | "type" | "isGovStandard" | "createdAt" | "updatedAt", ExtArgs["result"]["category"]>
  export type CategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Category$parentArgs<ExtArgs>
    children?: boolean | Category$childrenArgs<ExtArgs>
    documentsByType?: boolean | Category$documentsByTypeArgs<ExtArgs>
    documentsByField?: boolean | Category$documentsByFieldArgs<ExtArgs>
    _count?: boolean | CategoryCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $CategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Category"
    objects: {
      parent: Prisma.$CategoryPayload<ExtArgs> | null
      children: Prisma.$CategoryPayload<ExtArgs>[]
      documentsByType: Prisma.$DocumentPayload<ExtArgs>[]
      documentsByField: Prisma.$DocumentPayload<ExtArgs>[]
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
      orderIndex: number
      description: string | null
      type: string
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
    documentsByType<T extends Category$documentsByTypeArgs<ExtArgs> = {}>(args?: Subset<T, Category$documentsByTypeArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    documentsByField<T extends Category$documentsByFieldArgs<ExtArgs> = {}>(args?: Subset<T, Category$documentsByFieldArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
    readonly orderIndex: FieldRef<"Category", 'Int'>
    readonly description: FieldRef<"Category", 'String'>
    readonly type: FieldRef<"Category", 'String'>
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
   * Category.documentsByType
   */
  export type Category$documentsByTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    where?: DocumentWhereInput
    orderBy?: DocumentOrderByWithRelationInput | DocumentOrderByWithRelationInput[]
    cursor?: DocumentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DocumentScalarFieldEnum | DocumentScalarFieldEnum[]
  }

  /**
   * Category.documentsByField
   */
  export type Category$documentsByFieldArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    where?: DocumentWhereInput
    orderBy?: DocumentOrderByWithRelationInput | DocumentOrderByWithRelationInput[]
    cursor?: DocumentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DocumentScalarFieldEnum | DocumentScalarFieldEnum[]
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
   * Model Consultation
   */

  export type AggregateConsultation = {
    _count: ConsultationCountAggregateOutputType | null
    _min: ConsultationMinAggregateOutputType | null
    _max: ConsultationMaxAggregateOutputType | null
  }

  export type ConsultationMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    documentId: string | null
    deadline: Date | null
    status: string | null
    issuerId: string | null
    issuerName: string | null
    isUrgent: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ConsultationMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    documentId: string | null
    deadline: Date | null
    status: string | null
    issuerId: string | null
    issuerName: string | null
    isUrgent: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ConsultationCountAggregateOutputType = {
    id: number
    title: number
    description: number
    documentId: number
    deadline: number
    status: number
    issuerId: number
    issuerName: number
    isUrgent: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ConsultationMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    documentId?: true
    deadline?: true
    status?: true
    issuerId?: true
    issuerName?: true
    isUrgent?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ConsultationMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    documentId?: true
    deadline?: true
    status?: true
    issuerId?: true
    issuerName?: true
    isUrgent?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ConsultationCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    documentId?: true
    deadline?: true
    status?: true
    issuerId?: true
    issuerName?: true
    isUrgent?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ConsultationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Consultation to aggregate.
     */
    where?: ConsultationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Consultations to fetch.
     */
    orderBy?: ConsultationOrderByWithRelationInput | ConsultationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConsultationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Consultations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Consultations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Consultations
    **/
    _count?: true | ConsultationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConsultationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConsultationMaxAggregateInputType
  }

  export type GetConsultationAggregateType<T extends ConsultationAggregateArgs> = {
        [P in keyof T & keyof AggregateConsultation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConsultation[P]>
      : GetScalarType<T[P], AggregateConsultation[P]>
  }




  export type ConsultationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConsultationWhereInput
    orderBy?: ConsultationOrderByWithAggregationInput | ConsultationOrderByWithAggregationInput[]
    by: ConsultationScalarFieldEnum[] | ConsultationScalarFieldEnum
    having?: ConsultationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConsultationCountAggregateInputType | true
    _min?: ConsultationMinAggregateInputType
    _max?: ConsultationMaxAggregateInputType
  }

  export type ConsultationGroupByOutputType = {
    id: string
    title: string
    description: string | null
    documentId: string | null
    deadline: Date
    status: string
    issuerId: string | null
    issuerName: string | null
    isUrgent: boolean
    createdAt: Date
    updatedAt: Date
    _count: ConsultationCountAggregateOutputType | null
    _min: ConsultationMinAggregateOutputType | null
    _max: ConsultationMaxAggregateOutputType | null
  }

  type GetConsultationGroupByPayload<T extends ConsultationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConsultationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConsultationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConsultationGroupByOutputType[P]>
            : GetScalarType<T[P], ConsultationGroupByOutputType[P]>
        }
      >
    >


  export type ConsultationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    documentId?: boolean
    deadline?: boolean
    status?: boolean
    issuerId?: boolean
    issuerName?: boolean
    isUrgent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    responses?: boolean | Consultation$responsesArgs<ExtArgs>
    _count?: boolean | ConsultationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["consultation"]>



  export type ConsultationSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    documentId?: boolean
    deadline?: boolean
    status?: boolean
    issuerId?: boolean
    issuerName?: boolean
    isUrgent?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ConsultationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "description" | "documentId" | "deadline" | "status" | "issuerId" | "issuerName" | "isUrgent" | "createdAt" | "updatedAt", ExtArgs["result"]["consultation"]>
  export type ConsultationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    responses?: boolean | Consultation$responsesArgs<ExtArgs>
    _count?: boolean | ConsultationCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $ConsultationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Consultation"
    objects: {
      responses: Prisma.$ConsultationResponsePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      description: string | null
      documentId: string | null
      deadline: Date
      status: string
      issuerId: string | null
      issuerName: string | null
      isUrgent: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["consultation"]>
    composites: {}
  }

  type ConsultationGetPayload<S extends boolean | null | undefined | ConsultationDefaultArgs> = $Result.GetResult<Prisma.$ConsultationPayload, S>

  type ConsultationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ConsultationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConsultationCountAggregateInputType | true
    }

  export interface ConsultationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Consultation'], meta: { name: 'Consultation' } }
    /**
     * Find zero or one Consultation that matches the filter.
     * @param {ConsultationFindUniqueArgs} args - Arguments to find a Consultation
     * @example
     * // Get one Consultation
     * const consultation = await prisma.consultation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConsultationFindUniqueArgs>(args: SelectSubset<T, ConsultationFindUniqueArgs<ExtArgs>>): Prisma__ConsultationClient<$Result.GetResult<Prisma.$ConsultationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Consultation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ConsultationFindUniqueOrThrowArgs} args - Arguments to find a Consultation
     * @example
     * // Get one Consultation
     * const consultation = await prisma.consultation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConsultationFindUniqueOrThrowArgs>(args: SelectSubset<T, ConsultationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConsultationClient<$Result.GetResult<Prisma.$ConsultationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Consultation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsultationFindFirstArgs} args - Arguments to find a Consultation
     * @example
     * // Get one Consultation
     * const consultation = await prisma.consultation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConsultationFindFirstArgs>(args?: SelectSubset<T, ConsultationFindFirstArgs<ExtArgs>>): Prisma__ConsultationClient<$Result.GetResult<Prisma.$ConsultationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Consultation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsultationFindFirstOrThrowArgs} args - Arguments to find a Consultation
     * @example
     * // Get one Consultation
     * const consultation = await prisma.consultation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConsultationFindFirstOrThrowArgs>(args?: SelectSubset<T, ConsultationFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConsultationClient<$Result.GetResult<Prisma.$ConsultationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Consultations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsultationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Consultations
     * const consultations = await prisma.consultation.findMany()
     * 
     * // Get first 10 Consultations
     * const consultations = await prisma.consultation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const consultationWithIdOnly = await prisma.consultation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConsultationFindManyArgs>(args?: SelectSubset<T, ConsultationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConsultationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Consultation.
     * @param {ConsultationCreateArgs} args - Arguments to create a Consultation.
     * @example
     * // Create one Consultation
     * const Consultation = await prisma.consultation.create({
     *   data: {
     *     // ... data to create a Consultation
     *   }
     * })
     * 
     */
    create<T extends ConsultationCreateArgs>(args: SelectSubset<T, ConsultationCreateArgs<ExtArgs>>): Prisma__ConsultationClient<$Result.GetResult<Prisma.$ConsultationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Consultations.
     * @param {ConsultationCreateManyArgs} args - Arguments to create many Consultations.
     * @example
     * // Create many Consultations
     * const consultation = await prisma.consultation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConsultationCreateManyArgs>(args?: SelectSubset<T, ConsultationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Consultation.
     * @param {ConsultationDeleteArgs} args - Arguments to delete one Consultation.
     * @example
     * // Delete one Consultation
     * const Consultation = await prisma.consultation.delete({
     *   where: {
     *     // ... filter to delete one Consultation
     *   }
     * })
     * 
     */
    delete<T extends ConsultationDeleteArgs>(args: SelectSubset<T, ConsultationDeleteArgs<ExtArgs>>): Prisma__ConsultationClient<$Result.GetResult<Prisma.$ConsultationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Consultation.
     * @param {ConsultationUpdateArgs} args - Arguments to update one Consultation.
     * @example
     * // Update one Consultation
     * const consultation = await prisma.consultation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConsultationUpdateArgs>(args: SelectSubset<T, ConsultationUpdateArgs<ExtArgs>>): Prisma__ConsultationClient<$Result.GetResult<Prisma.$ConsultationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Consultations.
     * @param {ConsultationDeleteManyArgs} args - Arguments to filter Consultations to delete.
     * @example
     * // Delete a few Consultations
     * const { count } = await prisma.consultation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConsultationDeleteManyArgs>(args?: SelectSubset<T, ConsultationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Consultations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsultationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Consultations
     * const consultation = await prisma.consultation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConsultationUpdateManyArgs>(args: SelectSubset<T, ConsultationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Consultation.
     * @param {ConsultationUpsertArgs} args - Arguments to update or create a Consultation.
     * @example
     * // Update or create a Consultation
     * const consultation = await prisma.consultation.upsert({
     *   create: {
     *     // ... data to create a Consultation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Consultation we want to update
     *   }
     * })
     */
    upsert<T extends ConsultationUpsertArgs>(args: SelectSubset<T, ConsultationUpsertArgs<ExtArgs>>): Prisma__ConsultationClient<$Result.GetResult<Prisma.$ConsultationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Consultations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsultationCountArgs} args - Arguments to filter Consultations to count.
     * @example
     * // Count the number of Consultations
     * const count = await prisma.consultation.count({
     *   where: {
     *     // ... the filter for the Consultations we want to count
     *   }
     * })
    **/
    count<T extends ConsultationCountArgs>(
      args?: Subset<T, ConsultationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConsultationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Consultation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsultationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ConsultationAggregateArgs>(args: Subset<T, ConsultationAggregateArgs>): Prisma.PrismaPromise<GetConsultationAggregateType<T>>

    /**
     * Group by Consultation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsultationGroupByArgs} args - Group by arguments.
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
      T extends ConsultationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConsultationGroupByArgs['orderBy'] }
        : { orderBy?: ConsultationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ConsultationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConsultationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Consultation model
   */
  readonly fields: ConsultationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Consultation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConsultationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    responses<T extends Consultation$responsesArgs<ExtArgs> = {}>(args?: Subset<T, Consultation$responsesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConsultationResponsePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Consultation model
   */
  interface ConsultationFieldRefs {
    readonly id: FieldRef<"Consultation", 'String'>
    readonly title: FieldRef<"Consultation", 'String'>
    readonly description: FieldRef<"Consultation", 'String'>
    readonly documentId: FieldRef<"Consultation", 'String'>
    readonly deadline: FieldRef<"Consultation", 'DateTime'>
    readonly status: FieldRef<"Consultation", 'String'>
    readonly issuerId: FieldRef<"Consultation", 'String'>
    readonly issuerName: FieldRef<"Consultation", 'String'>
    readonly isUrgent: FieldRef<"Consultation", 'Boolean'>
    readonly createdAt: FieldRef<"Consultation", 'DateTime'>
    readonly updatedAt: FieldRef<"Consultation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Consultation findUnique
   */
  export type ConsultationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Consultation
     */
    select?: ConsultationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Consultation
     */
    omit?: ConsultationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationInclude<ExtArgs> | null
    /**
     * Filter, which Consultation to fetch.
     */
    where: ConsultationWhereUniqueInput
  }

  /**
   * Consultation findUniqueOrThrow
   */
  export type ConsultationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Consultation
     */
    select?: ConsultationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Consultation
     */
    omit?: ConsultationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationInclude<ExtArgs> | null
    /**
     * Filter, which Consultation to fetch.
     */
    where: ConsultationWhereUniqueInput
  }

  /**
   * Consultation findFirst
   */
  export type ConsultationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Consultation
     */
    select?: ConsultationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Consultation
     */
    omit?: ConsultationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationInclude<ExtArgs> | null
    /**
     * Filter, which Consultation to fetch.
     */
    where?: ConsultationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Consultations to fetch.
     */
    orderBy?: ConsultationOrderByWithRelationInput | ConsultationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Consultations.
     */
    cursor?: ConsultationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Consultations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Consultations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Consultations.
     */
    distinct?: ConsultationScalarFieldEnum | ConsultationScalarFieldEnum[]
  }

  /**
   * Consultation findFirstOrThrow
   */
  export type ConsultationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Consultation
     */
    select?: ConsultationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Consultation
     */
    omit?: ConsultationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationInclude<ExtArgs> | null
    /**
     * Filter, which Consultation to fetch.
     */
    where?: ConsultationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Consultations to fetch.
     */
    orderBy?: ConsultationOrderByWithRelationInput | ConsultationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Consultations.
     */
    cursor?: ConsultationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Consultations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Consultations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Consultations.
     */
    distinct?: ConsultationScalarFieldEnum | ConsultationScalarFieldEnum[]
  }

  /**
   * Consultation findMany
   */
  export type ConsultationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Consultation
     */
    select?: ConsultationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Consultation
     */
    omit?: ConsultationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationInclude<ExtArgs> | null
    /**
     * Filter, which Consultations to fetch.
     */
    where?: ConsultationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Consultations to fetch.
     */
    orderBy?: ConsultationOrderByWithRelationInput | ConsultationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Consultations.
     */
    cursor?: ConsultationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Consultations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Consultations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Consultations.
     */
    distinct?: ConsultationScalarFieldEnum | ConsultationScalarFieldEnum[]
  }

  /**
   * Consultation create
   */
  export type ConsultationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Consultation
     */
    select?: ConsultationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Consultation
     */
    omit?: ConsultationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationInclude<ExtArgs> | null
    /**
     * The data needed to create a Consultation.
     */
    data: XOR<ConsultationCreateInput, ConsultationUncheckedCreateInput>
  }

  /**
   * Consultation createMany
   */
  export type ConsultationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Consultations.
     */
    data: ConsultationCreateManyInput | ConsultationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Consultation update
   */
  export type ConsultationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Consultation
     */
    select?: ConsultationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Consultation
     */
    omit?: ConsultationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationInclude<ExtArgs> | null
    /**
     * The data needed to update a Consultation.
     */
    data: XOR<ConsultationUpdateInput, ConsultationUncheckedUpdateInput>
    /**
     * Choose, which Consultation to update.
     */
    where: ConsultationWhereUniqueInput
  }

  /**
   * Consultation updateMany
   */
  export type ConsultationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Consultations.
     */
    data: XOR<ConsultationUpdateManyMutationInput, ConsultationUncheckedUpdateManyInput>
    /**
     * Filter which Consultations to update
     */
    where?: ConsultationWhereInput
    /**
     * Limit how many Consultations to update.
     */
    limit?: number
  }

  /**
   * Consultation upsert
   */
  export type ConsultationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Consultation
     */
    select?: ConsultationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Consultation
     */
    omit?: ConsultationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationInclude<ExtArgs> | null
    /**
     * The filter to search for the Consultation to update in case it exists.
     */
    where: ConsultationWhereUniqueInput
    /**
     * In case the Consultation found by the `where` argument doesn't exist, create a new Consultation with this data.
     */
    create: XOR<ConsultationCreateInput, ConsultationUncheckedCreateInput>
    /**
     * In case the Consultation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConsultationUpdateInput, ConsultationUncheckedUpdateInput>
  }

  /**
   * Consultation delete
   */
  export type ConsultationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Consultation
     */
    select?: ConsultationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Consultation
     */
    omit?: ConsultationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationInclude<ExtArgs> | null
    /**
     * Filter which Consultation to delete.
     */
    where: ConsultationWhereUniqueInput
  }

  /**
   * Consultation deleteMany
   */
  export type ConsultationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Consultations to delete
     */
    where?: ConsultationWhereInput
    /**
     * Limit how many Consultations to delete.
     */
    limit?: number
  }

  /**
   * Consultation.responses
   */
  export type Consultation$responsesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsultationResponse
     */
    select?: ConsultationResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsultationResponse
     */
    omit?: ConsultationResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationResponseInclude<ExtArgs> | null
    where?: ConsultationResponseWhereInput
    orderBy?: ConsultationResponseOrderByWithRelationInput | ConsultationResponseOrderByWithRelationInput[]
    cursor?: ConsultationResponseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ConsultationResponseScalarFieldEnum | ConsultationResponseScalarFieldEnum[]
  }

  /**
   * Consultation without action
   */
  export type ConsultationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Consultation
     */
    select?: ConsultationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Consultation
     */
    omit?: ConsultationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationInclude<ExtArgs> | null
  }


  /**
   * Model ConsultationResponse
   */

  export type AggregateConsultationResponse = {
    _count: ConsultationResponseCountAggregateOutputType | null
    _min: ConsultationResponseMinAggregateOutputType | null
    _max: ConsultationResponseMaxAggregateOutputType | null
  }

  export type ConsultationResponseMinAggregateOutputType = {
    id: string | null
    consultationId: string | null
    unitId: string | null
    unitName: string | null
    userId: string | null
    content: string | null
    fileId: string | null
    status: string | null
    respondedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ConsultationResponseMaxAggregateOutputType = {
    id: string | null
    consultationId: string | null
    unitId: string | null
    unitName: string | null
    userId: string | null
    content: string | null
    fileId: string | null
    status: string | null
    respondedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ConsultationResponseCountAggregateOutputType = {
    id: number
    consultationId: number
    unitId: number
    unitName: number
    userId: number
    content: number
    fileId: number
    status: number
    respondedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ConsultationResponseMinAggregateInputType = {
    id?: true
    consultationId?: true
    unitId?: true
    unitName?: true
    userId?: true
    content?: true
    fileId?: true
    status?: true
    respondedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ConsultationResponseMaxAggregateInputType = {
    id?: true
    consultationId?: true
    unitId?: true
    unitName?: true
    userId?: true
    content?: true
    fileId?: true
    status?: true
    respondedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ConsultationResponseCountAggregateInputType = {
    id?: true
    consultationId?: true
    unitId?: true
    unitName?: true
    userId?: true
    content?: true
    fileId?: true
    status?: true
    respondedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ConsultationResponseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConsultationResponse to aggregate.
     */
    where?: ConsultationResponseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConsultationResponses to fetch.
     */
    orderBy?: ConsultationResponseOrderByWithRelationInput | ConsultationResponseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConsultationResponseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConsultationResponses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConsultationResponses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ConsultationResponses
    **/
    _count?: true | ConsultationResponseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConsultationResponseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConsultationResponseMaxAggregateInputType
  }

  export type GetConsultationResponseAggregateType<T extends ConsultationResponseAggregateArgs> = {
        [P in keyof T & keyof AggregateConsultationResponse]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConsultationResponse[P]>
      : GetScalarType<T[P], AggregateConsultationResponse[P]>
  }




  export type ConsultationResponseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConsultationResponseWhereInput
    orderBy?: ConsultationResponseOrderByWithAggregationInput | ConsultationResponseOrderByWithAggregationInput[]
    by: ConsultationResponseScalarFieldEnum[] | ConsultationResponseScalarFieldEnum
    having?: ConsultationResponseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConsultationResponseCountAggregateInputType | true
    _min?: ConsultationResponseMinAggregateInputType
    _max?: ConsultationResponseMaxAggregateInputType
  }

  export type ConsultationResponseGroupByOutputType = {
    id: string
    consultationId: string
    unitId: string
    unitName: string | null
    userId: string | null
    content: string | null
    fileId: string | null
    status: string
    respondedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: ConsultationResponseCountAggregateOutputType | null
    _min: ConsultationResponseMinAggregateOutputType | null
    _max: ConsultationResponseMaxAggregateOutputType | null
  }

  type GetConsultationResponseGroupByPayload<T extends ConsultationResponseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConsultationResponseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConsultationResponseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConsultationResponseGroupByOutputType[P]>
            : GetScalarType<T[P], ConsultationResponseGroupByOutputType[P]>
        }
      >
    >


  export type ConsultationResponseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    consultationId?: boolean
    unitId?: boolean
    unitName?: boolean
    userId?: boolean
    content?: boolean
    fileId?: boolean
    status?: boolean
    respondedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    consultation?: boolean | ConsultationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["consultationResponse"]>



  export type ConsultationResponseSelectScalar = {
    id?: boolean
    consultationId?: boolean
    unitId?: boolean
    unitName?: boolean
    userId?: boolean
    content?: boolean
    fileId?: boolean
    status?: boolean
    respondedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ConsultationResponseOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "consultationId" | "unitId" | "unitName" | "userId" | "content" | "fileId" | "status" | "respondedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["consultationResponse"]>
  export type ConsultationResponseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    consultation?: boolean | ConsultationDefaultArgs<ExtArgs>
  }

  export type $ConsultationResponsePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ConsultationResponse"
    objects: {
      consultation: Prisma.$ConsultationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      consultationId: string
      unitId: string
      unitName: string | null
      userId: string | null
      content: string | null
      fileId: string | null
      status: string
      respondedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["consultationResponse"]>
    composites: {}
  }

  type ConsultationResponseGetPayload<S extends boolean | null | undefined | ConsultationResponseDefaultArgs> = $Result.GetResult<Prisma.$ConsultationResponsePayload, S>

  type ConsultationResponseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ConsultationResponseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConsultationResponseCountAggregateInputType | true
    }

  export interface ConsultationResponseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ConsultationResponse'], meta: { name: 'ConsultationResponse' } }
    /**
     * Find zero or one ConsultationResponse that matches the filter.
     * @param {ConsultationResponseFindUniqueArgs} args - Arguments to find a ConsultationResponse
     * @example
     * // Get one ConsultationResponse
     * const consultationResponse = await prisma.consultationResponse.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConsultationResponseFindUniqueArgs>(args: SelectSubset<T, ConsultationResponseFindUniqueArgs<ExtArgs>>): Prisma__ConsultationResponseClient<$Result.GetResult<Prisma.$ConsultationResponsePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ConsultationResponse that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ConsultationResponseFindUniqueOrThrowArgs} args - Arguments to find a ConsultationResponse
     * @example
     * // Get one ConsultationResponse
     * const consultationResponse = await prisma.consultationResponse.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConsultationResponseFindUniqueOrThrowArgs>(args: SelectSubset<T, ConsultationResponseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConsultationResponseClient<$Result.GetResult<Prisma.$ConsultationResponsePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConsultationResponse that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsultationResponseFindFirstArgs} args - Arguments to find a ConsultationResponse
     * @example
     * // Get one ConsultationResponse
     * const consultationResponse = await prisma.consultationResponse.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConsultationResponseFindFirstArgs>(args?: SelectSubset<T, ConsultationResponseFindFirstArgs<ExtArgs>>): Prisma__ConsultationResponseClient<$Result.GetResult<Prisma.$ConsultationResponsePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConsultationResponse that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsultationResponseFindFirstOrThrowArgs} args - Arguments to find a ConsultationResponse
     * @example
     * // Get one ConsultationResponse
     * const consultationResponse = await prisma.consultationResponse.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConsultationResponseFindFirstOrThrowArgs>(args?: SelectSubset<T, ConsultationResponseFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConsultationResponseClient<$Result.GetResult<Prisma.$ConsultationResponsePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ConsultationResponses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsultationResponseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ConsultationResponses
     * const consultationResponses = await prisma.consultationResponse.findMany()
     * 
     * // Get first 10 ConsultationResponses
     * const consultationResponses = await prisma.consultationResponse.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const consultationResponseWithIdOnly = await prisma.consultationResponse.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConsultationResponseFindManyArgs>(args?: SelectSubset<T, ConsultationResponseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConsultationResponsePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ConsultationResponse.
     * @param {ConsultationResponseCreateArgs} args - Arguments to create a ConsultationResponse.
     * @example
     * // Create one ConsultationResponse
     * const ConsultationResponse = await prisma.consultationResponse.create({
     *   data: {
     *     // ... data to create a ConsultationResponse
     *   }
     * })
     * 
     */
    create<T extends ConsultationResponseCreateArgs>(args: SelectSubset<T, ConsultationResponseCreateArgs<ExtArgs>>): Prisma__ConsultationResponseClient<$Result.GetResult<Prisma.$ConsultationResponsePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ConsultationResponses.
     * @param {ConsultationResponseCreateManyArgs} args - Arguments to create many ConsultationResponses.
     * @example
     * // Create many ConsultationResponses
     * const consultationResponse = await prisma.consultationResponse.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConsultationResponseCreateManyArgs>(args?: SelectSubset<T, ConsultationResponseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ConsultationResponse.
     * @param {ConsultationResponseDeleteArgs} args - Arguments to delete one ConsultationResponse.
     * @example
     * // Delete one ConsultationResponse
     * const ConsultationResponse = await prisma.consultationResponse.delete({
     *   where: {
     *     // ... filter to delete one ConsultationResponse
     *   }
     * })
     * 
     */
    delete<T extends ConsultationResponseDeleteArgs>(args: SelectSubset<T, ConsultationResponseDeleteArgs<ExtArgs>>): Prisma__ConsultationResponseClient<$Result.GetResult<Prisma.$ConsultationResponsePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ConsultationResponse.
     * @param {ConsultationResponseUpdateArgs} args - Arguments to update one ConsultationResponse.
     * @example
     * // Update one ConsultationResponse
     * const consultationResponse = await prisma.consultationResponse.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConsultationResponseUpdateArgs>(args: SelectSubset<T, ConsultationResponseUpdateArgs<ExtArgs>>): Prisma__ConsultationResponseClient<$Result.GetResult<Prisma.$ConsultationResponsePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ConsultationResponses.
     * @param {ConsultationResponseDeleteManyArgs} args - Arguments to filter ConsultationResponses to delete.
     * @example
     * // Delete a few ConsultationResponses
     * const { count } = await prisma.consultationResponse.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConsultationResponseDeleteManyArgs>(args?: SelectSubset<T, ConsultationResponseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConsultationResponses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsultationResponseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ConsultationResponses
     * const consultationResponse = await prisma.consultationResponse.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConsultationResponseUpdateManyArgs>(args: SelectSubset<T, ConsultationResponseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ConsultationResponse.
     * @param {ConsultationResponseUpsertArgs} args - Arguments to update or create a ConsultationResponse.
     * @example
     * // Update or create a ConsultationResponse
     * const consultationResponse = await prisma.consultationResponse.upsert({
     *   create: {
     *     // ... data to create a ConsultationResponse
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ConsultationResponse we want to update
     *   }
     * })
     */
    upsert<T extends ConsultationResponseUpsertArgs>(args: SelectSubset<T, ConsultationResponseUpsertArgs<ExtArgs>>): Prisma__ConsultationResponseClient<$Result.GetResult<Prisma.$ConsultationResponsePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ConsultationResponses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsultationResponseCountArgs} args - Arguments to filter ConsultationResponses to count.
     * @example
     * // Count the number of ConsultationResponses
     * const count = await prisma.consultationResponse.count({
     *   where: {
     *     // ... the filter for the ConsultationResponses we want to count
     *   }
     * })
    **/
    count<T extends ConsultationResponseCountArgs>(
      args?: Subset<T, ConsultationResponseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConsultationResponseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ConsultationResponse.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsultationResponseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ConsultationResponseAggregateArgs>(args: Subset<T, ConsultationResponseAggregateArgs>): Prisma.PrismaPromise<GetConsultationResponseAggregateType<T>>

    /**
     * Group by ConsultationResponse.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsultationResponseGroupByArgs} args - Group by arguments.
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
      T extends ConsultationResponseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConsultationResponseGroupByArgs['orderBy'] }
        : { orderBy?: ConsultationResponseGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ConsultationResponseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConsultationResponseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ConsultationResponse model
   */
  readonly fields: ConsultationResponseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ConsultationResponse.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConsultationResponseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    consultation<T extends ConsultationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ConsultationDefaultArgs<ExtArgs>>): Prisma__ConsultationClient<$Result.GetResult<Prisma.$ConsultationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the ConsultationResponse model
   */
  interface ConsultationResponseFieldRefs {
    readonly id: FieldRef<"ConsultationResponse", 'String'>
    readonly consultationId: FieldRef<"ConsultationResponse", 'String'>
    readonly unitId: FieldRef<"ConsultationResponse", 'String'>
    readonly unitName: FieldRef<"ConsultationResponse", 'String'>
    readonly userId: FieldRef<"ConsultationResponse", 'String'>
    readonly content: FieldRef<"ConsultationResponse", 'String'>
    readonly fileId: FieldRef<"ConsultationResponse", 'String'>
    readonly status: FieldRef<"ConsultationResponse", 'String'>
    readonly respondedAt: FieldRef<"ConsultationResponse", 'DateTime'>
    readonly createdAt: FieldRef<"ConsultationResponse", 'DateTime'>
    readonly updatedAt: FieldRef<"ConsultationResponse", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ConsultationResponse findUnique
   */
  export type ConsultationResponseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsultationResponse
     */
    select?: ConsultationResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsultationResponse
     */
    omit?: ConsultationResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationResponseInclude<ExtArgs> | null
    /**
     * Filter, which ConsultationResponse to fetch.
     */
    where: ConsultationResponseWhereUniqueInput
  }

  /**
   * ConsultationResponse findUniqueOrThrow
   */
  export type ConsultationResponseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsultationResponse
     */
    select?: ConsultationResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsultationResponse
     */
    omit?: ConsultationResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationResponseInclude<ExtArgs> | null
    /**
     * Filter, which ConsultationResponse to fetch.
     */
    where: ConsultationResponseWhereUniqueInput
  }

  /**
   * ConsultationResponse findFirst
   */
  export type ConsultationResponseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsultationResponse
     */
    select?: ConsultationResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsultationResponse
     */
    omit?: ConsultationResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationResponseInclude<ExtArgs> | null
    /**
     * Filter, which ConsultationResponse to fetch.
     */
    where?: ConsultationResponseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConsultationResponses to fetch.
     */
    orderBy?: ConsultationResponseOrderByWithRelationInput | ConsultationResponseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConsultationResponses.
     */
    cursor?: ConsultationResponseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConsultationResponses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConsultationResponses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConsultationResponses.
     */
    distinct?: ConsultationResponseScalarFieldEnum | ConsultationResponseScalarFieldEnum[]
  }

  /**
   * ConsultationResponse findFirstOrThrow
   */
  export type ConsultationResponseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsultationResponse
     */
    select?: ConsultationResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsultationResponse
     */
    omit?: ConsultationResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationResponseInclude<ExtArgs> | null
    /**
     * Filter, which ConsultationResponse to fetch.
     */
    where?: ConsultationResponseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConsultationResponses to fetch.
     */
    orderBy?: ConsultationResponseOrderByWithRelationInput | ConsultationResponseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConsultationResponses.
     */
    cursor?: ConsultationResponseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConsultationResponses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConsultationResponses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConsultationResponses.
     */
    distinct?: ConsultationResponseScalarFieldEnum | ConsultationResponseScalarFieldEnum[]
  }

  /**
   * ConsultationResponse findMany
   */
  export type ConsultationResponseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsultationResponse
     */
    select?: ConsultationResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsultationResponse
     */
    omit?: ConsultationResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationResponseInclude<ExtArgs> | null
    /**
     * Filter, which ConsultationResponses to fetch.
     */
    where?: ConsultationResponseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConsultationResponses to fetch.
     */
    orderBy?: ConsultationResponseOrderByWithRelationInput | ConsultationResponseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ConsultationResponses.
     */
    cursor?: ConsultationResponseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConsultationResponses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConsultationResponses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConsultationResponses.
     */
    distinct?: ConsultationResponseScalarFieldEnum | ConsultationResponseScalarFieldEnum[]
  }

  /**
   * ConsultationResponse create
   */
  export type ConsultationResponseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsultationResponse
     */
    select?: ConsultationResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsultationResponse
     */
    omit?: ConsultationResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationResponseInclude<ExtArgs> | null
    /**
     * The data needed to create a ConsultationResponse.
     */
    data: XOR<ConsultationResponseCreateInput, ConsultationResponseUncheckedCreateInput>
  }

  /**
   * ConsultationResponse createMany
   */
  export type ConsultationResponseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ConsultationResponses.
     */
    data: ConsultationResponseCreateManyInput | ConsultationResponseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConsultationResponse update
   */
  export type ConsultationResponseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsultationResponse
     */
    select?: ConsultationResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsultationResponse
     */
    omit?: ConsultationResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationResponseInclude<ExtArgs> | null
    /**
     * The data needed to update a ConsultationResponse.
     */
    data: XOR<ConsultationResponseUpdateInput, ConsultationResponseUncheckedUpdateInput>
    /**
     * Choose, which ConsultationResponse to update.
     */
    where: ConsultationResponseWhereUniqueInput
  }

  /**
   * ConsultationResponse updateMany
   */
  export type ConsultationResponseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ConsultationResponses.
     */
    data: XOR<ConsultationResponseUpdateManyMutationInput, ConsultationResponseUncheckedUpdateManyInput>
    /**
     * Filter which ConsultationResponses to update
     */
    where?: ConsultationResponseWhereInput
    /**
     * Limit how many ConsultationResponses to update.
     */
    limit?: number
  }

  /**
   * ConsultationResponse upsert
   */
  export type ConsultationResponseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsultationResponse
     */
    select?: ConsultationResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsultationResponse
     */
    omit?: ConsultationResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationResponseInclude<ExtArgs> | null
    /**
     * The filter to search for the ConsultationResponse to update in case it exists.
     */
    where: ConsultationResponseWhereUniqueInput
    /**
     * In case the ConsultationResponse found by the `where` argument doesn't exist, create a new ConsultationResponse with this data.
     */
    create: XOR<ConsultationResponseCreateInput, ConsultationResponseUncheckedCreateInput>
    /**
     * In case the ConsultationResponse was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConsultationResponseUpdateInput, ConsultationResponseUncheckedUpdateInput>
  }

  /**
   * ConsultationResponse delete
   */
  export type ConsultationResponseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsultationResponse
     */
    select?: ConsultationResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsultationResponse
     */
    omit?: ConsultationResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationResponseInclude<ExtArgs> | null
    /**
     * Filter which ConsultationResponse to delete.
     */
    where: ConsultationResponseWhereUniqueInput
  }

  /**
   * ConsultationResponse deleteMany
   */
  export type ConsultationResponseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConsultationResponses to delete
     */
    where?: ConsultationResponseWhereInput
    /**
     * Limit how many ConsultationResponses to delete.
     */
    limit?: number
  }

  /**
   * ConsultationResponse without action
   */
  export type ConsultationResponseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsultationResponse
     */
    select?: ConsultationResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsultationResponse
     */
    omit?: ConsultationResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConsultationResponseInclude<ExtArgs> | null
  }


  /**
   * Model Document
   */

  export type AggregateDocument = {
    _count: DocumentCountAggregateOutputType | null
    _avg: DocumentAvgAggregateOutputType | null
    _sum: DocumentSumAggregateOutputType | null
    _min: DocumentMinAggregateOutputType | null
    _max: DocumentMaxAggregateOutputType | null
  }

  export type DocumentAvgAggregateOutputType = {
    pageCount: number | null
    attachmentCount: number | null
    fiscalYear: number | null
  }

  export type DocumentSumAggregateOutputType = {
    pageCount: number | null
    attachmentCount: number | null
    fiscalYear: number | null
  }

  export type DocumentMinAggregateOutputType = {
    id: string | null
    documentNumber: string | null
    notation: string | null
    abstract: string | null
    content: string | null
    typeId: string | null
    fieldId: string | null
    issuingAuthorityId: string | null
    issuerName: string | null
    signerId: string | null
    signerName: string | null
    signerPosition: string | null
    issueDate: Date | null
    arrivalDate: Date | null
    arrivalNumber: string | null
    processingDeadline: Date | null
    recipients: string | null
    urgency: string | null
    securityLevel: string | null
    status: string | null
    isPublic: boolean | null
    fileId: string | null
    signatureValid: boolean | null
    pageCount: number | null
    attachmentCount: number | null
    linkedDocumentId: string | null
    fiscalYear: number | null
    transparencyCategory: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DocumentMaxAggregateOutputType = {
    id: string | null
    documentNumber: string | null
    notation: string | null
    abstract: string | null
    content: string | null
    typeId: string | null
    fieldId: string | null
    issuingAuthorityId: string | null
    issuerName: string | null
    signerId: string | null
    signerName: string | null
    signerPosition: string | null
    issueDate: Date | null
    arrivalDate: Date | null
    arrivalNumber: string | null
    processingDeadline: Date | null
    recipients: string | null
    urgency: string | null
    securityLevel: string | null
    status: string | null
    isPublic: boolean | null
    fileId: string | null
    signatureValid: boolean | null
    pageCount: number | null
    attachmentCount: number | null
    linkedDocumentId: string | null
    fiscalYear: number | null
    transparencyCategory: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DocumentCountAggregateOutputType = {
    id: number
    documentNumber: number
    notation: number
    abstract: number
    content: number
    typeId: number
    fieldId: number
    issuingAuthorityId: number
    issuerName: number
    signerId: number
    signerName: number
    signerPosition: number
    issueDate: number
    arrivalDate: number
    arrivalNumber: number
    processingDeadline: number
    recipients: number
    urgency: number
    securityLevel: number
    status: number
    isPublic: number
    fileId: number
    signatureValid: number
    pageCount: number
    attachmentCount: number
    linkedDocumentId: number
    fiscalYear: number
    transparencyCategory: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DocumentAvgAggregateInputType = {
    pageCount?: true
    attachmentCount?: true
    fiscalYear?: true
  }

  export type DocumentSumAggregateInputType = {
    pageCount?: true
    attachmentCount?: true
    fiscalYear?: true
  }

  export type DocumentMinAggregateInputType = {
    id?: true
    documentNumber?: true
    notation?: true
    abstract?: true
    content?: true
    typeId?: true
    fieldId?: true
    issuingAuthorityId?: true
    issuerName?: true
    signerId?: true
    signerName?: true
    signerPosition?: true
    issueDate?: true
    arrivalDate?: true
    arrivalNumber?: true
    processingDeadline?: true
    recipients?: true
    urgency?: true
    securityLevel?: true
    status?: true
    isPublic?: true
    fileId?: true
    signatureValid?: true
    pageCount?: true
    attachmentCount?: true
    linkedDocumentId?: true
    fiscalYear?: true
    transparencyCategory?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DocumentMaxAggregateInputType = {
    id?: true
    documentNumber?: true
    notation?: true
    abstract?: true
    content?: true
    typeId?: true
    fieldId?: true
    issuingAuthorityId?: true
    issuerName?: true
    signerId?: true
    signerName?: true
    signerPosition?: true
    issueDate?: true
    arrivalDate?: true
    arrivalNumber?: true
    processingDeadline?: true
    recipients?: true
    urgency?: true
    securityLevel?: true
    status?: true
    isPublic?: true
    fileId?: true
    signatureValid?: true
    pageCount?: true
    attachmentCount?: true
    linkedDocumentId?: true
    fiscalYear?: true
    transparencyCategory?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DocumentCountAggregateInputType = {
    id?: true
    documentNumber?: true
    notation?: true
    abstract?: true
    content?: true
    typeId?: true
    fieldId?: true
    issuingAuthorityId?: true
    issuerName?: true
    signerId?: true
    signerName?: true
    signerPosition?: true
    issueDate?: true
    arrivalDate?: true
    arrivalNumber?: true
    processingDeadline?: true
    recipients?: true
    urgency?: true
    securityLevel?: true
    status?: true
    isPublic?: true
    fileId?: true
    signatureValid?: true
    pageCount?: true
    attachmentCount?: true
    linkedDocumentId?: true
    fiscalYear?: true
    transparencyCategory?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DocumentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Document to aggregate.
     */
    where?: DocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documents to fetch.
     */
    orderBy?: DocumentOrderByWithRelationInput | DocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Documents
    **/
    _count?: true | DocumentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DocumentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DocumentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DocumentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DocumentMaxAggregateInputType
  }

  export type GetDocumentAggregateType<T extends DocumentAggregateArgs> = {
        [P in keyof T & keyof AggregateDocument]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDocument[P]>
      : GetScalarType<T[P], AggregateDocument[P]>
  }




  export type DocumentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentWhereInput
    orderBy?: DocumentOrderByWithAggregationInput | DocumentOrderByWithAggregationInput[]
    by: DocumentScalarFieldEnum[] | DocumentScalarFieldEnum
    having?: DocumentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DocumentCountAggregateInputType | true
    _avg?: DocumentAvgAggregateInputType
    _sum?: DocumentSumAggregateInputType
    _min?: DocumentMinAggregateInputType
    _max?: DocumentMaxAggregateInputType
  }

  export type DocumentGroupByOutputType = {
    id: string
    documentNumber: string
    notation: string | null
    abstract: string
    content: string | null
    typeId: string | null
    fieldId: string | null
    issuingAuthorityId: string | null
    issuerName: string | null
    signerId: string | null
    signerName: string | null
    signerPosition: string | null
    issueDate: Date | null
    arrivalDate: Date | null
    arrivalNumber: string | null
    processingDeadline: Date | null
    recipients: string | null
    urgency: string
    securityLevel: string
    status: string
    isPublic: boolean
    fileId: string | null
    signatureValid: boolean
    pageCount: number
    attachmentCount: number
    linkedDocumentId: string | null
    fiscalYear: number | null
    transparencyCategory: string | null
    createdAt: Date
    updatedAt: Date
    _count: DocumentCountAggregateOutputType | null
    _avg: DocumentAvgAggregateOutputType | null
    _sum: DocumentSumAggregateOutputType | null
    _min: DocumentMinAggregateOutputType | null
    _max: DocumentMaxAggregateOutputType | null
  }

  type GetDocumentGroupByPayload<T extends DocumentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DocumentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DocumentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DocumentGroupByOutputType[P]>
            : GetScalarType<T[P], DocumentGroupByOutputType[P]>
        }
      >
    >


  export type DocumentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    documentNumber?: boolean
    notation?: boolean
    abstract?: boolean
    content?: boolean
    typeId?: boolean
    fieldId?: boolean
    issuingAuthorityId?: boolean
    issuerName?: boolean
    signerId?: boolean
    signerName?: boolean
    signerPosition?: boolean
    issueDate?: boolean
    arrivalDate?: boolean
    arrivalNumber?: boolean
    processingDeadline?: boolean
    recipients?: boolean
    urgency?: boolean
    securityLevel?: boolean
    status?: boolean
    isPublic?: boolean
    fileId?: boolean
    signatureValid?: boolean
    pageCount?: boolean
    attachmentCount?: boolean
    linkedDocumentId?: boolean
    fiscalYear?: boolean
    transparencyCategory?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    type?: boolean | Document$typeArgs<ExtArgs>
    field?: boolean | Document$fieldArgs<ExtArgs>
  }, ExtArgs["result"]["document"]>



  export type DocumentSelectScalar = {
    id?: boolean
    documentNumber?: boolean
    notation?: boolean
    abstract?: boolean
    content?: boolean
    typeId?: boolean
    fieldId?: boolean
    issuingAuthorityId?: boolean
    issuerName?: boolean
    signerId?: boolean
    signerName?: boolean
    signerPosition?: boolean
    issueDate?: boolean
    arrivalDate?: boolean
    arrivalNumber?: boolean
    processingDeadline?: boolean
    recipients?: boolean
    urgency?: boolean
    securityLevel?: boolean
    status?: boolean
    isPublic?: boolean
    fileId?: boolean
    signatureValid?: boolean
    pageCount?: boolean
    attachmentCount?: boolean
    linkedDocumentId?: boolean
    fiscalYear?: boolean
    transparencyCategory?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DocumentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "documentNumber" | "notation" | "abstract" | "content" | "typeId" | "fieldId" | "issuingAuthorityId" | "issuerName" | "signerId" | "signerName" | "signerPosition" | "issueDate" | "arrivalDate" | "arrivalNumber" | "processingDeadline" | "recipients" | "urgency" | "securityLevel" | "status" | "isPublic" | "fileId" | "signatureValid" | "pageCount" | "attachmentCount" | "linkedDocumentId" | "fiscalYear" | "transparencyCategory" | "createdAt" | "updatedAt", ExtArgs["result"]["document"]>
  export type DocumentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    type?: boolean | Document$typeArgs<ExtArgs>
    field?: boolean | Document$fieldArgs<ExtArgs>
  }

  export type $DocumentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Document"
    objects: {
      type: Prisma.$CategoryPayload<ExtArgs> | null
      field: Prisma.$CategoryPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      documentNumber: string
      notation: string | null
      abstract: string
      content: string | null
      typeId: string | null
      fieldId: string | null
      issuingAuthorityId: string | null
      issuerName: string | null
      signerId: string | null
      signerName: string | null
      signerPosition: string | null
      issueDate: Date | null
      arrivalDate: Date | null
      arrivalNumber: string | null
      processingDeadline: Date | null
      recipients: string | null
      urgency: string
      securityLevel: string
      status: string
      isPublic: boolean
      fileId: string | null
      signatureValid: boolean
      pageCount: number
      attachmentCount: number
      linkedDocumentId: string | null
      fiscalYear: number | null
      transparencyCategory: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["document"]>
    composites: {}
  }

  type DocumentGetPayload<S extends boolean | null | undefined | DocumentDefaultArgs> = $Result.GetResult<Prisma.$DocumentPayload, S>

  type DocumentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DocumentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DocumentCountAggregateInputType | true
    }

  export interface DocumentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Document'], meta: { name: 'Document' } }
    /**
     * Find zero or one Document that matches the filter.
     * @param {DocumentFindUniqueArgs} args - Arguments to find a Document
     * @example
     * // Get one Document
     * const document = await prisma.document.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DocumentFindUniqueArgs>(args: SelectSubset<T, DocumentFindUniqueArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Document that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DocumentFindUniqueOrThrowArgs} args - Arguments to find a Document
     * @example
     * // Get one Document
     * const document = await prisma.document.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DocumentFindUniqueOrThrowArgs>(args: SelectSubset<T, DocumentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Document that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentFindFirstArgs} args - Arguments to find a Document
     * @example
     * // Get one Document
     * const document = await prisma.document.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DocumentFindFirstArgs>(args?: SelectSubset<T, DocumentFindFirstArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Document that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentFindFirstOrThrowArgs} args - Arguments to find a Document
     * @example
     * // Get one Document
     * const document = await prisma.document.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DocumentFindFirstOrThrowArgs>(args?: SelectSubset<T, DocumentFindFirstOrThrowArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Documents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Documents
     * const documents = await prisma.document.findMany()
     * 
     * // Get first 10 Documents
     * const documents = await prisma.document.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const documentWithIdOnly = await prisma.document.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DocumentFindManyArgs>(args?: SelectSubset<T, DocumentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Document.
     * @param {DocumentCreateArgs} args - Arguments to create a Document.
     * @example
     * // Create one Document
     * const Document = await prisma.document.create({
     *   data: {
     *     // ... data to create a Document
     *   }
     * })
     * 
     */
    create<T extends DocumentCreateArgs>(args: SelectSubset<T, DocumentCreateArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Documents.
     * @param {DocumentCreateManyArgs} args - Arguments to create many Documents.
     * @example
     * // Create many Documents
     * const document = await prisma.document.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DocumentCreateManyArgs>(args?: SelectSubset<T, DocumentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Document.
     * @param {DocumentDeleteArgs} args - Arguments to delete one Document.
     * @example
     * // Delete one Document
     * const Document = await prisma.document.delete({
     *   where: {
     *     // ... filter to delete one Document
     *   }
     * })
     * 
     */
    delete<T extends DocumentDeleteArgs>(args: SelectSubset<T, DocumentDeleteArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Document.
     * @param {DocumentUpdateArgs} args - Arguments to update one Document.
     * @example
     * // Update one Document
     * const document = await prisma.document.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DocumentUpdateArgs>(args: SelectSubset<T, DocumentUpdateArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Documents.
     * @param {DocumentDeleteManyArgs} args - Arguments to filter Documents to delete.
     * @example
     * // Delete a few Documents
     * const { count } = await prisma.document.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DocumentDeleteManyArgs>(args?: SelectSubset<T, DocumentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Documents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Documents
     * const document = await prisma.document.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DocumentUpdateManyArgs>(args: SelectSubset<T, DocumentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Document.
     * @param {DocumentUpsertArgs} args - Arguments to update or create a Document.
     * @example
     * // Update or create a Document
     * const document = await prisma.document.upsert({
     *   create: {
     *     // ... data to create a Document
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Document we want to update
     *   }
     * })
     */
    upsert<T extends DocumentUpsertArgs>(args: SelectSubset<T, DocumentUpsertArgs<ExtArgs>>): Prisma__DocumentClient<$Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Documents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentCountArgs} args - Arguments to filter Documents to count.
     * @example
     * // Count the number of Documents
     * const count = await prisma.document.count({
     *   where: {
     *     // ... the filter for the Documents we want to count
     *   }
     * })
    **/
    count<T extends DocumentCountArgs>(
      args?: Subset<T, DocumentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DocumentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Document.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DocumentAggregateArgs>(args: Subset<T, DocumentAggregateArgs>): Prisma.PrismaPromise<GetDocumentAggregateType<T>>

    /**
     * Group by Document.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentGroupByArgs} args - Group by arguments.
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
      T extends DocumentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DocumentGroupByArgs['orderBy'] }
        : { orderBy?: DocumentGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DocumentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDocumentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Document model
   */
  readonly fields: DocumentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Document.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DocumentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    type<T extends Document$typeArgs<ExtArgs> = {}>(args?: Subset<T, Document$typeArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    field<T extends Document$fieldArgs<ExtArgs> = {}>(args?: Subset<T, Document$fieldArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Document model
   */
  interface DocumentFieldRefs {
    readonly id: FieldRef<"Document", 'String'>
    readonly documentNumber: FieldRef<"Document", 'String'>
    readonly notation: FieldRef<"Document", 'String'>
    readonly abstract: FieldRef<"Document", 'String'>
    readonly content: FieldRef<"Document", 'String'>
    readonly typeId: FieldRef<"Document", 'String'>
    readonly fieldId: FieldRef<"Document", 'String'>
    readonly issuingAuthorityId: FieldRef<"Document", 'String'>
    readonly issuerName: FieldRef<"Document", 'String'>
    readonly signerId: FieldRef<"Document", 'String'>
    readonly signerName: FieldRef<"Document", 'String'>
    readonly signerPosition: FieldRef<"Document", 'String'>
    readonly issueDate: FieldRef<"Document", 'DateTime'>
    readonly arrivalDate: FieldRef<"Document", 'DateTime'>
    readonly arrivalNumber: FieldRef<"Document", 'String'>
    readonly processingDeadline: FieldRef<"Document", 'DateTime'>
    readonly recipients: FieldRef<"Document", 'String'>
    readonly urgency: FieldRef<"Document", 'String'>
    readonly securityLevel: FieldRef<"Document", 'String'>
    readonly status: FieldRef<"Document", 'String'>
    readonly isPublic: FieldRef<"Document", 'Boolean'>
    readonly fileId: FieldRef<"Document", 'String'>
    readonly signatureValid: FieldRef<"Document", 'Boolean'>
    readonly pageCount: FieldRef<"Document", 'Int'>
    readonly attachmentCount: FieldRef<"Document", 'Int'>
    readonly linkedDocumentId: FieldRef<"Document", 'String'>
    readonly fiscalYear: FieldRef<"Document", 'Int'>
    readonly transparencyCategory: FieldRef<"Document", 'String'>
    readonly createdAt: FieldRef<"Document", 'DateTime'>
    readonly updatedAt: FieldRef<"Document", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Document findUnique
   */
  export type DocumentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * Filter, which Document to fetch.
     */
    where: DocumentWhereUniqueInput
  }

  /**
   * Document findUniqueOrThrow
   */
  export type DocumentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * Filter, which Document to fetch.
     */
    where: DocumentWhereUniqueInput
  }

  /**
   * Document findFirst
   */
  export type DocumentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * Filter, which Document to fetch.
     */
    where?: DocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documents to fetch.
     */
    orderBy?: DocumentOrderByWithRelationInput | DocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Documents.
     */
    cursor?: DocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Documents.
     */
    distinct?: DocumentScalarFieldEnum | DocumentScalarFieldEnum[]
  }

  /**
   * Document findFirstOrThrow
   */
  export type DocumentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * Filter, which Document to fetch.
     */
    where?: DocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documents to fetch.
     */
    orderBy?: DocumentOrderByWithRelationInput | DocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Documents.
     */
    cursor?: DocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Documents.
     */
    distinct?: DocumentScalarFieldEnum | DocumentScalarFieldEnum[]
  }

  /**
   * Document findMany
   */
  export type DocumentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * Filter, which Documents to fetch.
     */
    where?: DocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documents to fetch.
     */
    orderBy?: DocumentOrderByWithRelationInput | DocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Documents.
     */
    cursor?: DocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Documents.
     */
    distinct?: DocumentScalarFieldEnum | DocumentScalarFieldEnum[]
  }

  /**
   * Document create
   */
  export type DocumentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * The data needed to create a Document.
     */
    data: XOR<DocumentCreateInput, DocumentUncheckedCreateInput>
  }

  /**
   * Document createMany
   */
  export type DocumentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Documents.
     */
    data: DocumentCreateManyInput | DocumentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Document update
   */
  export type DocumentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * The data needed to update a Document.
     */
    data: XOR<DocumentUpdateInput, DocumentUncheckedUpdateInput>
    /**
     * Choose, which Document to update.
     */
    where: DocumentWhereUniqueInput
  }

  /**
   * Document updateMany
   */
  export type DocumentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Documents.
     */
    data: XOR<DocumentUpdateManyMutationInput, DocumentUncheckedUpdateManyInput>
    /**
     * Filter which Documents to update
     */
    where?: DocumentWhereInput
    /**
     * Limit how many Documents to update.
     */
    limit?: number
  }

  /**
   * Document upsert
   */
  export type DocumentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * The filter to search for the Document to update in case it exists.
     */
    where: DocumentWhereUniqueInput
    /**
     * In case the Document found by the `where` argument doesn't exist, create a new Document with this data.
     */
    create: XOR<DocumentCreateInput, DocumentUncheckedCreateInput>
    /**
     * In case the Document was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DocumentUpdateInput, DocumentUncheckedUpdateInput>
  }

  /**
   * Document delete
   */
  export type DocumentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
    /**
     * Filter which Document to delete.
     */
    where: DocumentWhereUniqueInput
  }

  /**
   * Document deleteMany
   */
  export type DocumentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Documents to delete
     */
    where?: DocumentWhereInput
    /**
     * Limit how many Documents to delete.
     */
    limit?: number
  }

  /**
   * Document.type
   */
  export type Document$typeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * Document.field
   */
  export type Document$fieldArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * Document without action
   */
  export type DocumentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: DocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Document
     */
    omit?: DocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentInclude<ExtArgs> | null
  }


  /**
   * Model Minutes
   */

  export type AggregateMinutes = {
    _count: MinutesCountAggregateOutputType | null
    _min: MinutesMinAggregateOutputType | null
    _max: MinutesMaxAggregateOutputType | null
  }

  export type MinutesMinAggregateOutputType = {
    id: string | null
    title: string | null
    startTime: Date | null
    endTime: Date | null
    location: string | null
    chairman: string | null
    secretary: string | null
    attendees: string | null
    content: string | null
    conclusion: string | null
    documentId: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MinutesMaxAggregateOutputType = {
    id: string | null
    title: string | null
    startTime: Date | null
    endTime: Date | null
    location: string | null
    chairman: string | null
    secretary: string | null
    attendees: string | null
    content: string | null
    conclusion: string | null
    documentId: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MinutesCountAggregateOutputType = {
    id: number
    title: number
    startTime: number
    endTime: number
    location: number
    chairman: number
    secretary: number
    attendees: number
    content: number
    conclusion: number
    documentId: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MinutesMinAggregateInputType = {
    id?: true
    title?: true
    startTime?: true
    endTime?: true
    location?: true
    chairman?: true
    secretary?: true
    attendees?: true
    content?: true
    conclusion?: true
    documentId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MinutesMaxAggregateInputType = {
    id?: true
    title?: true
    startTime?: true
    endTime?: true
    location?: true
    chairman?: true
    secretary?: true
    attendees?: true
    content?: true
    conclusion?: true
    documentId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MinutesCountAggregateInputType = {
    id?: true
    title?: true
    startTime?: true
    endTime?: true
    location?: true
    chairman?: true
    secretary?: true
    attendees?: true
    content?: true
    conclusion?: true
    documentId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MinutesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Minutes to aggregate.
     */
    where?: MinutesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Minutes to fetch.
     */
    orderBy?: MinutesOrderByWithRelationInput | MinutesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MinutesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Minutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Minutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Minutes
    **/
    _count?: true | MinutesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MinutesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MinutesMaxAggregateInputType
  }

  export type GetMinutesAggregateType<T extends MinutesAggregateArgs> = {
        [P in keyof T & keyof AggregateMinutes]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMinutes[P]>
      : GetScalarType<T[P], AggregateMinutes[P]>
  }




  export type MinutesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MinutesWhereInput
    orderBy?: MinutesOrderByWithAggregationInput | MinutesOrderByWithAggregationInput[]
    by: MinutesScalarFieldEnum[] | MinutesScalarFieldEnum
    having?: MinutesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MinutesCountAggregateInputType | true
    _min?: MinutesMinAggregateInputType
    _max?: MinutesMaxAggregateInputType
  }

  export type MinutesGroupByOutputType = {
    id: string
    title: string
    startTime: Date
    endTime: Date | null
    location: string | null
    chairman: string | null
    secretary: string | null
    attendees: string | null
    content: string | null
    conclusion: string | null
    documentId: string | null
    status: string
    createdAt: Date
    updatedAt: Date
    _count: MinutesCountAggregateOutputType | null
    _min: MinutesMinAggregateOutputType | null
    _max: MinutesMaxAggregateOutputType | null
  }

  type GetMinutesGroupByPayload<T extends MinutesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MinutesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MinutesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MinutesGroupByOutputType[P]>
            : GetScalarType<T[P], MinutesGroupByOutputType[P]>
        }
      >
    >


  export type MinutesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    startTime?: boolean
    endTime?: boolean
    location?: boolean
    chairman?: boolean
    secretary?: boolean
    attendees?: boolean
    content?: boolean
    conclusion?: boolean
    documentId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["minutes"]>



  export type MinutesSelectScalar = {
    id?: boolean
    title?: boolean
    startTime?: boolean
    endTime?: boolean
    location?: boolean
    chairman?: boolean
    secretary?: boolean
    attendees?: boolean
    content?: boolean
    conclusion?: boolean
    documentId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MinutesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "startTime" | "endTime" | "location" | "chairman" | "secretary" | "attendees" | "content" | "conclusion" | "documentId" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["minutes"]>

  export type $MinutesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Minutes"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      startTime: Date
      endTime: Date | null
      location: string | null
      chairman: string | null
      secretary: string | null
      attendees: string | null
      content: string | null
      conclusion: string | null
      documentId: string | null
      status: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["minutes"]>
    composites: {}
  }

  type MinutesGetPayload<S extends boolean | null | undefined | MinutesDefaultArgs> = $Result.GetResult<Prisma.$MinutesPayload, S>

  type MinutesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MinutesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MinutesCountAggregateInputType | true
    }

  export interface MinutesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Minutes'], meta: { name: 'Minutes' } }
    /**
     * Find zero or one Minutes that matches the filter.
     * @param {MinutesFindUniqueArgs} args - Arguments to find a Minutes
     * @example
     * // Get one Minutes
     * const minutes = await prisma.minutes.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MinutesFindUniqueArgs>(args: SelectSubset<T, MinutesFindUniqueArgs<ExtArgs>>): Prisma__MinutesClient<$Result.GetResult<Prisma.$MinutesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Minutes that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MinutesFindUniqueOrThrowArgs} args - Arguments to find a Minutes
     * @example
     * // Get one Minutes
     * const minutes = await prisma.minutes.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MinutesFindUniqueOrThrowArgs>(args: SelectSubset<T, MinutesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MinutesClient<$Result.GetResult<Prisma.$MinutesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Minutes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MinutesFindFirstArgs} args - Arguments to find a Minutes
     * @example
     * // Get one Minutes
     * const minutes = await prisma.minutes.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MinutesFindFirstArgs>(args?: SelectSubset<T, MinutesFindFirstArgs<ExtArgs>>): Prisma__MinutesClient<$Result.GetResult<Prisma.$MinutesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Minutes that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MinutesFindFirstOrThrowArgs} args - Arguments to find a Minutes
     * @example
     * // Get one Minutes
     * const minutes = await prisma.minutes.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MinutesFindFirstOrThrowArgs>(args?: SelectSubset<T, MinutesFindFirstOrThrowArgs<ExtArgs>>): Prisma__MinutesClient<$Result.GetResult<Prisma.$MinutesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Minutes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MinutesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Minutes
     * const minutes = await prisma.minutes.findMany()
     * 
     * // Get first 10 Minutes
     * const minutes = await prisma.minutes.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const minutesWithIdOnly = await prisma.minutes.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MinutesFindManyArgs>(args?: SelectSubset<T, MinutesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MinutesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Minutes.
     * @param {MinutesCreateArgs} args - Arguments to create a Minutes.
     * @example
     * // Create one Minutes
     * const Minutes = await prisma.minutes.create({
     *   data: {
     *     // ... data to create a Minutes
     *   }
     * })
     * 
     */
    create<T extends MinutesCreateArgs>(args: SelectSubset<T, MinutesCreateArgs<ExtArgs>>): Prisma__MinutesClient<$Result.GetResult<Prisma.$MinutesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Minutes.
     * @param {MinutesCreateManyArgs} args - Arguments to create many Minutes.
     * @example
     * // Create many Minutes
     * const minutes = await prisma.minutes.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MinutesCreateManyArgs>(args?: SelectSubset<T, MinutesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Minutes.
     * @param {MinutesDeleteArgs} args - Arguments to delete one Minutes.
     * @example
     * // Delete one Minutes
     * const Minutes = await prisma.minutes.delete({
     *   where: {
     *     // ... filter to delete one Minutes
     *   }
     * })
     * 
     */
    delete<T extends MinutesDeleteArgs>(args: SelectSubset<T, MinutesDeleteArgs<ExtArgs>>): Prisma__MinutesClient<$Result.GetResult<Prisma.$MinutesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Minutes.
     * @param {MinutesUpdateArgs} args - Arguments to update one Minutes.
     * @example
     * // Update one Minutes
     * const minutes = await prisma.minutes.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MinutesUpdateArgs>(args: SelectSubset<T, MinutesUpdateArgs<ExtArgs>>): Prisma__MinutesClient<$Result.GetResult<Prisma.$MinutesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Minutes.
     * @param {MinutesDeleteManyArgs} args - Arguments to filter Minutes to delete.
     * @example
     * // Delete a few Minutes
     * const { count } = await prisma.minutes.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MinutesDeleteManyArgs>(args?: SelectSubset<T, MinutesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Minutes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MinutesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Minutes
     * const minutes = await prisma.minutes.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MinutesUpdateManyArgs>(args: SelectSubset<T, MinutesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Minutes.
     * @param {MinutesUpsertArgs} args - Arguments to update or create a Minutes.
     * @example
     * // Update or create a Minutes
     * const minutes = await prisma.minutes.upsert({
     *   create: {
     *     // ... data to create a Minutes
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Minutes we want to update
     *   }
     * })
     */
    upsert<T extends MinutesUpsertArgs>(args: SelectSubset<T, MinutesUpsertArgs<ExtArgs>>): Prisma__MinutesClient<$Result.GetResult<Prisma.$MinutesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Minutes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MinutesCountArgs} args - Arguments to filter Minutes to count.
     * @example
     * // Count the number of Minutes
     * const count = await prisma.minutes.count({
     *   where: {
     *     // ... the filter for the Minutes we want to count
     *   }
     * })
    **/
    count<T extends MinutesCountArgs>(
      args?: Subset<T, MinutesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MinutesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Minutes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MinutesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MinutesAggregateArgs>(args: Subset<T, MinutesAggregateArgs>): Prisma.PrismaPromise<GetMinutesAggregateType<T>>

    /**
     * Group by Minutes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MinutesGroupByArgs} args - Group by arguments.
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
      T extends MinutesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MinutesGroupByArgs['orderBy'] }
        : { orderBy?: MinutesGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, MinutesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMinutesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Minutes model
   */
  readonly fields: MinutesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Minutes.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MinutesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the Minutes model
   */
  interface MinutesFieldRefs {
    readonly id: FieldRef<"Minutes", 'String'>
    readonly title: FieldRef<"Minutes", 'String'>
    readonly startTime: FieldRef<"Minutes", 'DateTime'>
    readonly endTime: FieldRef<"Minutes", 'DateTime'>
    readonly location: FieldRef<"Minutes", 'String'>
    readonly chairman: FieldRef<"Minutes", 'String'>
    readonly secretary: FieldRef<"Minutes", 'String'>
    readonly attendees: FieldRef<"Minutes", 'String'>
    readonly content: FieldRef<"Minutes", 'String'>
    readonly conclusion: FieldRef<"Minutes", 'String'>
    readonly documentId: FieldRef<"Minutes", 'String'>
    readonly status: FieldRef<"Minutes", 'String'>
    readonly createdAt: FieldRef<"Minutes", 'DateTime'>
    readonly updatedAt: FieldRef<"Minutes", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Minutes findUnique
   */
  export type MinutesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Minutes
     */
    select?: MinutesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Minutes
     */
    omit?: MinutesOmit<ExtArgs> | null
    /**
     * Filter, which Minutes to fetch.
     */
    where: MinutesWhereUniqueInput
  }

  /**
   * Minutes findUniqueOrThrow
   */
  export type MinutesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Minutes
     */
    select?: MinutesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Minutes
     */
    omit?: MinutesOmit<ExtArgs> | null
    /**
     * Filter, which Minutes to fetch.
     */
    where: MinutesWhereUniqueInput
  }

  /**
   * Minutes findFirst
   */
  export type MinutesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Minutes
     */
    select?: MinutesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Minutes
     */
    omit?: MinutesOmit<ExtArgs> | null
    /**
     * Filter, which Minutes to fetch.
     */
    where?: MinutesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Minutes to fetch.
     */
    orderBy?: MinutesOrderByWithRelationInput | MinutesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Minutes.
     */
    cursor?: MinutesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Minutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Minutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Minutes.
     */
    distinct?: MinutesScalarFieldEnum | MinutesScalarFieldEnum[]
  }

  /**
   * Minutes findFirstOrThrow
   */
  export type MinutesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Minutes
     */
    select?: MinutesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Minutes
     */
    omit?: MinutesOmit<ExtArgs> | null
    /**
     * Filter, which Minutes to fetch.
     */
    where?: MinutesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Minutes to fetch.
     */
    orderBy?: MinutesOrderByWithRelationInput | MinutesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Minutes.
     */
    cursor?: MinutesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Minutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Minutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Minutes.
     */
    distinct?: MinutesScalarFieldEnum | MinutesScalarFieldEnum[]
  }

  /**
   * Minutes findMany
   */
  export type MinutesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Minutes
     */
    select?: MinutesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Minutes
     */
    omit?: MinutesOmit<ExtArgs> | null
    /**
     * Filter, which Minutes to fetch.
     */
    where?: MinutesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Minutes to fetch.
     */
    orderBy?: MinutesOrderByWithRelationInput | MinutesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Minutes.
     */
    cursor?: MinutesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Minutes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Minutes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Minutes.
     */
    distinct?: MinutesScalarFieldEnum | MinutesScalarFieldEnum[]
  }

  /**
   * Minutes create
   */
  export type MinutesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Minutes
     */
    select?: MinutesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Minutes
     */
    omit?: MinutesOmit<ExtArgs> | null
    /**
     * The data needed to create a Minutes.
     */
    data: XOR<MinutesCreateInput, MinutesUncheckedCreateInput>
  }

  /**
   * Minutes createMany
   */
  export type MinutesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Minutes.
     */
    data: MinutesCreateManyInput | MinutesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Minutes update
   */
  export type MinutesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Minutes
     */
    select?: MinutesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Minutes
     */
    omit?: MinutesOmit<ExtArgs> | null
    /**
     * The data needed to update a Minutes.
     */
    data: XOR<MinutesUpdateInput, MinutesUncheckedUpdateInput>
    /**
     * Choose, which Minutes to update.
     */
    where: MinutesWhereUniqueInput
  }

  /**
   * Minutes updateMany
   */
  export type MinutesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Minutes.
     */
    data: XOR<MinutesUpdateManyMutationInput, MinutesUncheckedUpdateManyInput>
    /**
     * Filter which Minutes to update
     */
    where?: MinutesWhereInput
    /**
     * Limit how many Minutes to update.
     */
    limit?: number
  }

  /**
   * Minutes upsert
   */
  export type MinutesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Minutes
     */
    select?: MinutesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Minutes
     */
    omit?: MinutesOmit<ExtArgs> | null
    /**
     * The filter to search for the Minutes to update in case it exists.
     */
    where: MinutesWhereUniqueInput
    /**
     * In case the Minutes found by the `where` argument doesn't exist, create a new Minutes with this data.
     */
    create: XOR<MinutesCreateInput, MinutesUncheckedCreateInput>
    /**
     * In case the Minutes was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MinutesUpdateInput, MinutesUncheckedUpdateInput>
  }

  /**
   * Minutes delete
   */
  export type MinutesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Minutes
     */
    select?: MinutesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Minutes
     */
    omit?: MinutesOmit<ExtArgs> | null
    /**
     * Filter which Minutes to delete.
     */
    where: MinutesWhereUniqueInput
  }

  /**
   * Minutes deleteMany
   */
  export type MinutesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Minutes to delete
     */
    where?: MinutesWhereInput
    /**
     * Limit how many Minutes to delete.
     */
    limit?: number
  }

  /**
   * Minutes without action
   */
  export type MinutesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Minutes
     */
    select?: MinutesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Minutes
     */
    omit?: MinutesOmit<ExtArgs> | null
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


  export const CategoryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    parentId: 'parentId',
    lft: 'lft',
    rgt: 'rgt',
    depth: 'depth',
    status: 'status',
    orderIndex: 'orderIndex',
    description: 'description',
    type: 'type',
    isGovStandard: 'isGovStandard',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CategoryScalarFieldEnum = (typeof CategoryScalarFieldEnum)[keyof typeof CategoryScalarFieldEnum]


  export const ConsultationScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    documentId: 'documentId',
    deadline: 'deadline',
    status: 'status',
    issuerId: 'issuerId',
    issuerName: 'issuerName',
    isUrgent: 'isUrgent',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ConsultationScalarFieldEnum = (typeof ConsultationScalarFieldEnum)[keyof typeof ConsultationScalarFieldEnum]


  export const ConsultationResponseScalarFieldEnum: {
    id: 'id',
    consultationId: 'consultationId',
    unitId: 'unitId',
    unitName: 'unitName',
    userId: 'userId',
    content: 'content',
    fileId: 'fileId',
    status: 'status',
    respondedAt: 'respondedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ConsultationResponseScalarFieldEnum = (typeof ConsultationResponseScalarFieldEnum)[keyof typeof ConsultationResponseScalarFieldEnum]


  export const DocumentScalarFieldEnum: {
    id: 'id',
    documentNumber: 'documentNumber',
    notation: 'notation',
    abstract: 'abstract',
    content: 'content',
    typeId: 'typeId',
    fieldId: 'fieldId',
    issuingAuthorityId: 'issuingAuthorityId',
    issuerName: 'issuerName',
    signerId: 'signerId',
    signerName: 'signerName',
    signerPosition: 'signerPosition',
    issueDate: 'issueDate',
    arrivalDate: 'arrivalDate',
    arrivalNumber: 'arrivalNumber',
    processingDeadline: 'processingDeadline',
    recipients: 'recipients',
    urgency: 'urgency',
    securityLevel: 'securityLevel',
    status: 'status',
    isPublic: 'isPublic',
    fileId: 'fileId',
    signatureValid: 'signatureValid',
    pageCount: 'pageCount',
    attachmentCount: 'attachmentCount',
    linkedDocumentId: 'linkedDocumentId',
    fiscalYear: 'fiscalYear',
    transparencyCategory: 'transparencyCategory',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DocumentScalarFieldEnum = (typeof DocumentScalarFieldEnum)[keyof typeof DocumentScalarFieldEnum]


  export const MinutesScalarFieldEnum: {
    id: 'id',
    title: 'title',
    startTime: 'startTime',
    endTime: 'endTime',
    location: 'location',
    chairman: 'chairman',
    secretary: 'secretary',
    attendees: 'attendees',
    content: 'content',
    conclusion: 'conclusion',
    documentId: 'documentId',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MinutesScalarFieldEnum = (typeof MinutesScalarFieldEnum)[keyof typeof MinutesScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const CategoryOrderByRelevanceFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    parentId: 'parentId',
    description: 'description',
    type: 'type'
  };

  export type CategoryOrderByRelevanceFieldEnum = (typeof CategoryOrderByRelevanceFieldEnum)[keyof typeof CategoryOrderByRelevanceFieldEnum]


  export const ConsultationOrderByRelevanceFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    documentId: 'documentId',
    status: 'status',
    issuerId: 'issuerId',
    issuerName: 'issuerName'
  };

  export type ConsultationOrderByRelevanceFieldEnum = (typeof ConsultationOrderByRelevanceFieldEnum)[keyof typeof ConsultationOrderByRelevanceFieldEnum]


  export const ConsultationResponseOrderByRelevanceFieldEnum: {
    id: 'id',
    consultationId: 'consultationId',
    unitId: 'unitId',
    unitName: 'unitName',
    userId: 'userId',
    content: 'content',
    fileId: 'fileId',
    status: 'status'
  };

  export type ConsultationResponseOrderByRelevanceFieldEnum = (typeof ConsultationResponseOrderByRelevanceFieldEnum)[keyof typeof ConsultationResponseOrderByRelevanceFieldEnum]


  export const DocumentOrderByRelevanceFieldEnum: {
    id: 'id',
    documentNumber: 'documentNumber',
    notation: 'notation',
    abstract: 'abstract',
    content: 'content',
    typeId: 'typeId',
    fieldId: 'fieldId',
    issuingAuthorityId: 'issuingAuthorityId',
    issuerName: 'issuerName',
    signerId: 'signerId',
    signerName: 'signerName',
    signerPosition: 'signerPosition',
    arrivalNumber: 'arrivalNumber',
    recipients: 'recipients',
    urgency: 'urgency',
    securityLevel: 'securityLevel',
    status: 'status',
    fileId: 'fileId',
    linkedDocumentId: 'linkedDocumentId',
    transparencyCategory: 'transparencyCategory'
  };

  export type DocumentOrderByRelevanceFieldEnum = (typeof DocumentOrderByRelevanceFieldEnum)[keyof typeof DocumentOrderByRelevanceFieldEnum]


  export const MinutesOrderByRelevanceFieldEnum: {
    id: 'id',
    title: 'title',
    location: 'location',
    chairman: 'chairman',
    secretary: 'secretary',
    attendees: 'attendees',
    content: 'content',
    conclusion: 'conclusion',
    documentId: 'documentId',
    status: 'status'
  };

  export type MinutesOrderByRelevanceFieldEnum = (typeof MinutesOrderByRelevanceFieldEnum)[keyof typeof MinutesOrderByRelevanceFieldEnum]


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
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


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
    orderIndex?: IntFilter<"Category"> | number
    description?: StringNullableFilter<"Category"> | string | null
    type?: StringFilter<"Category"> | string
    isGovStandard?: BoolFilter<"Category"> | boolean
    createdAt?: DateTimeFilter<"Category"> | Date | string
    updatedAt?: DateTimeFilter<"Category"> | Date | string
    parent?: XOR<CategoryNullableScalarRelationFilter, CategoryWhereInput> | null
    children?: CategoryListRelationFilter
    documentsByType?: DocumentListRelationFilter
    documentsByField?: DocumentListRelationFilter
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
    orderIndex?: SortOrder
    description?: SortOrderInput | SortOrder
    type?: SortOrder
    isGovStandard?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    parent?: CategoryOrderByWithRelationInput
    children?: CategoryOrderByRelationAggregateInput
    documentsByType?: DocumentOrderByRelationAggregateInput
    documentsByField?: DocumentOrderByRelationAggregateInput
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
    orderIndex?: IntFilter<"Category"> | number
    description?: StringNullableFilter<"Category"> | string | null
    type?: StringFilter<"Category"> | string
    isGovStandard?: BoolFilter<"Category"> | boolean
    createdAt?: DateTimeFilter<"Category"> | Date | string
    updatedAt?: DateTimeFilter<"Category"> | Date | string
    parent?: XOR<CategoryNullableScalarRelationFilter, CategoryWhereInput> | null
    children?: CategoryListRelationFilter
    documentsByType?: DocumentListRelationFilter
    documentsByField?: DocumentListRelationFilter
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
    orderIndex?: SortOrder
    description?: SortOrderInput | SortOrder
    type?: SortOrder
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
    orderIndex?: IntWithAggregatesFilter<"Category"> | number
    description?: StringNullableWithAggregatesFilter<"Category"> | string | null
    type?: StringWithAggregatesFilter<"Category"> | string
    isGovStandard?: BoolWithAggregatesFilter<"Category"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Category"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Category"> | Date | string
  }

  export type ConsultationWhereInput = {
    AND?: ConsultationWhereInput | ConsultationWhereInput[]
    OR?: ConsultationWhereInput[]
    NOT?: ConsultationWhereInput | ConsultationWhereInput[]
    id?: StringFilter<"Consultation"> | string
    title?: StringFilter<"Consultation"> | string
    description?: StringNullableFilter<"Consultation"> | string | null
    documentId?: StringNullableFilter<"Consultation"> | string | null
    deadline?: DateTimeFilter<"Consultation"> | Date | string
    status?: StringFilter<"Consultation"> | string
    issuerId?: StringNullableFilter<"Consultation"> | string | null
    issuerName?: StringNullableFilter<"Consultation"> | string | null
    isUrgent?: BoolFilter<"Consultation"> | boolean
    createdAt?: DateTimeFilter<"Consultation"> | Date | string
    updatedAt?: DateTimeFilter<"Consultation"> | Date | string
    responses?: ConsultationResponseListRelationFilter
  }

  export type ConsultationOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    documentId?: SortOrderInput | SortOrder
    deadline?: SortOrder
    status?: SortOrder
    issuerId?: SortOrderInput | SortOrder
    issuerName?: SortOrderInput | SortOrder
    isUrgent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    responses?: ConsultationResponseOrderByRelationAggregateInput
    _relevance?: ConsultationOrderByRelevanceInput
  }

  export type ConsultationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConsultationWhereInput | ConsultationWhereInput[]
    OR?: ConsultationWhereInput[]
    NOT?: ConsultationWhereInput | ConsultationWhereInput[]
    title?: StringFilter<"Consultation"> | string
    description?: StringNullableFilter<"Consultation"> | string | null
    documentId?: StringNullableFilter<"Consultation"> | string | null
    deadline?: DateTimeFilter<"Consultation"> | Date | string
    status?: StringFilter<"Consultation"> | string
    issuerId?: StringNullableFilter<"Consultation"> | string | null
    issuerName?: StringNullableFilter<"Consultation"> | string | null
    isUrgent?: BoolFilter<"Consultation"> | boolean
    createdAt?: DateTimeFilter<"Consultation"> | Date | string
    updatedAt?: DateTimeFilter<"Consultation"> | Date | string
    responses?: ConsultationResponseListRelationFilter
  }, "id">

  export type ConsultationOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    documentId?: SortOrderInput | SortOrder
    deadline?: SortOrder
    status?: SortOrder
    issuerId?: SortOrderInput | SortOrder
    issuerName?: SortOrderInput | SortOrder
    isUrgent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ConsultationCountOrderByAggregateInput
    _max?: ConsultationMaxOrderByAggregateInput
    _min?: ConsultationMinOrderByAggregateInput
  }

  export type ConsultationScalarWhereWithAggregatesInput = {
    AND?: ConsultationScalarWhereWithAggregatesInput | ConsultationScalarWhereWithAggregatesInput[]
    OR?: ConsultationScalarWhereWithAggregatesInput[]
    NOT?: ConsultationScalarWhereWithAggregatesInput | ConsultationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Consultation"> | string
    title?: StringWithAggregatesFilter<"Consultation"> | string
    description?: StringNullableWithAggregatesFilter<"Consultation"> | string | null
    documentId?: StringNullableWithAggregatesFilter<"Consultation"> | string | null
    deadline?: DateTimeWithAggregatesFilter<"Consultation"> | Date | string
    status?: StringWithAggregatesFilter<"Consultation"> | string
    issuerId?: StringNullableWithAggregatesFilter<"Consultation"> | string | null
    issuerName?: StringNullableWithAggregatesFilter<"Consultation"> | string | null
    isUrgent?: BoolWithAggregatesFilter<"Consultation"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Consultation"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Consultation"> | Date | string
  }

  export type ConsultationResponseWhereInput = {
    AND?: ConsultationResponseWhereInput | ConsultationResponseWhereInput[]
    OR?: ConsultationResponseWhereInput[]
    NOT?: ConsultationResponseWhereInput | ConsultationResponseWhereInput[]
    id?: StringFilter<"ConsultationResponse"> | string
    consultationId?: StringFilter<"ConsultationResponse"> | string
    unitId?: StringFilter<"ConsultationResponse"> | string
    unitName?: StringNullableFilter<"ConsultationResponse"> | string | null
    userId?: StringNullableFilter<"ConsultationResponse"> | string | null
    content?: StringNullableFilter<"ConsultationResponse"> | string | null
    fileId?: StringNullableFilter<"ConsultationResponse"> | string | null
    status?: StringFilter<"ConsultationResponse"> | string
    respondedAt?: DateTimeNullableFilter<"ConsultationResponse"> | Date | string | null
    createdAt?: DateTimeFilter<"ConsultationResponse"> | Date | string
    updatedAt?: DateTimeFilter<"ConsultationResponse"> | Date | string
    consultation?: XOR<ConsultationScalarRelationFilter, ConsultationWhereInput>
  }

  export type ConsultationResponseOrderByWithRelationInput = {
    id?: SortOrder
    consultationId?: SortOrder
    unitId?: SortOrder
    unitName?: SortOrderInput | SortOrder
    userId?: SortOrderInput | SortOrder
    content?: SortOrderInput | SortOrder
    fileId?: SortOrderInput | SortOrder
    status?: SortOrder
    respondedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    consultation?: ConsultationOrderByWithRelationInput
    _relevance?: ConsultationResponseOrderByRelevanceInput
  }

  export type ConsultationResponseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConsultationResponseWhereInput | ConsultationResponseWhereInput[]
    OR?: ConsultationResponseWhereInput[]
    NOT?: ConsultationResponseWhereInput | ConsultationResponseWhereInput[]
    consultationId?: StringFilter<"ConsultationResponse"> | string
    unitId?: StringFilter<"ConsultationResponse"> | string
    unitName?: StringNullableFilter<"ConsultationResponse"> | string | null
    userId?: StringNullableFilter<"ConsultationResponse"> | string | null
    content?: StringNullableFilter<"ConsultationResponse"> | string | null
    fileId?: StringNullableFilter<"ConsultationResponse"> | string | null
    status?: StringFilter<"ConsultationResponse"> | string
    respondedAt?: DateTimeNullableFilter<"ConsultationResponse"> | Date | string | null
    createdAt?: DateTimeFilter<"ConsultationResponse"> | Date | string
    updatedAt?: DateTimeFilter<"ConsultationResponse"> | Date | string
    consultation?: XOR<ConsultationScalarRelationFilter, ConsultationWhereInput>
  }, "id">

  export type ConsultationResponseOrderByWithAggregationInput = {
    id?: SortOrder
    consultationId?: SortOrder
    unitId?: SortOrder
    unitName?: SortOrderInput | SortOrder
    userId?: SortOrderInput | SortOrder
    content?: SortOrderInput | SortOrder
    fileId?: SortOrderInput | SortOrder
    status?: SortOrder
    respondedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ConsultationResponseCountOrderByAggregateInput
    _max?: ConsultationResponseMaxOrderByAggregateInput
    _min?: ConsultationResponseMinOrderByAggregateInput
  }

  export type ConsultationResponseScalarWhereWithAggregatesInput = {
    AND?: ConsultationResponseScalarWhereWithAggregatesInput | ConsultationResponseScalarWhereWithAggregatesInput[]
    OR?: ConsultationResponseScalarWhereWithAggregatesInput[]
    NOT?: ConsultationResponseScalarWhereWithAggregatesInput | ConsultationResponseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ConsultationResponse"> | string
    consultationId?: StringWithAggregatesFilter<"ConsultationResponse"> | string
    unitId?: StringWithAggregatesFilter<"ConsultationResponse"> | string
    unitName?: StringNullableWithAggregatesFilter<"ConsultationResponse"> | string | null
    userId?: StringNullableWithAggregatesFilter<"ConsultationResponse"> | string | null
    content?: StringNullableWithAggregatesFilter<"ConsultationResponse"> | string | null
    fileId?: StringNullableWithAggregatesFilter<"ConsultationResponse"> | string | null
    status?: StringWithAggregatesFilter<"ConsultationResponse"> | string
    respondedAt?: DateTimeNullableWithAggregatesFilter<"ConsultationResponse"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ConsultationResponse"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ConsultationResponse"> | Date | string
  }

  export type DocumentWhereInput = {
    AND?: DocumentWhereInput | DocumentWhereInput[]
    OR?: DocumentWhereInput[]
    NOT?: DocumentWhereInput | DocumentWhereInput[]
    id?: StringFilter<"Document"> | string
    documentNumber?: StringFilter<"Document"> | string
    notation?: StringNullableFilter<"Document"> | string | null
    abstract?: StringFilter<"Document"> | string
    content?: StringNullableFilter<"Document"> | string | null
    typeId?: StringNullableFilter<"Document"> | string | null
    fieldId?: StringNullableFilter<"Document"> | string | null
    issuingAuthorityId?: StringNullableFilter<"Document"> | string | null
    issuerName?: StringNullableFilter<"Document"> | string | null
    signerId?: StringNullableFilter<"Document"> | string | null
    signerName?: StringNullableFilter<"Document"> | string | null
    signerPosition?: StringNullableFilter<"Document"> | string | null
    issueDate?: DateTimeNullableFilter<"Document"> | Date | string | null
    arrivalDate?: DateTimeNullableFilter<"Document"> | Date | string | null
    arrivalNumber?: StringNullableFilter<"Document"> | string | null
    processingDeadline?: DateTimeNullableFilter<"Document"> | Date | string | null
    recipients?: StringNullableFilter<"Document"> | string | null
    urgency?: StringFilter<"Document"> | string
    securityLevel?: StringFilter<"Document"> | string
    status?: StringFilter<"Document"> | string
    isPublic?: BoolFilter<"Document"> | boolean
    fileId?: StringNullableFilter<"Document"> | string | null
    signatureValid?: BoolFilter<"Document"> | boolean
    pageCount?: IntFilter<"Document"> | number
    attachmentCount?: IntFilter<"Document"> | number
    linkedDocumentId?: StringNullableFilter<"Document"> | string | null
    fiscalYear?: IntNullableFilter<"Document"> | number | null
    transparencyCategory?: StringNullableFilter<"Document"> | string | null
    createdAt?: DateTimeFilter<"Document"> | Date | string
    updatedAt?: DateTimeFilter<"Document"> | Date | string
    type?: XOR<CategoryNullableScalarRelationFilter, CategoryWhereInput> | null
    field?: XOR<CategoryNullableScalarRelationFilter, CategoryWhereInput> | null
  }

  export type DocumentOrderByWithRelationInput = {
    id?: SortOrder
    documentNumber?: SortOrder
    notation?: SortOrderInput | SortOrder
    abstract?: SortOrder
    content?: SortOrderInput | SortOrder
    typeId?: SortOrderInput | SortOrder
    fieldId?: SortOrderInput | SortOrder
    issuingAuthorityId?: SortOrderInput | SortOrder
    issuerName?: SortOrderInput | SortOrder
    signerId?: SortOrderInput | SortOrder
    signerName?: SortOrderInput | SortOrder
    signerPosition?: SortOrderInput | SortOrder
    issueDate?: SortOrderInput | SortOrder
    arrivalDate?: SortOrderInput | SortOrder
    arrivalNumber?: SortOrderInput | SortOrder
    processingDeadline?: SortOrderInput | SortOrder
    recipients?: SortOrderInput | SortOrder
    urgency?: SortOrder
    securityLevel?: SortOrder
    status?: SortOrder
    isPublic?: SortOrder
    fileId?: SortOrderInput | SortOrder
    signatureValid?: SortOrder
    pageCount?: SortOrder
    attachmentCount?: SortOrder
    linkedDocumentId?: SortOrderInput | SortOrder
    fiscalYear?: SortOrderInput | SortOrder
    transparencyCategory?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    type?: CategoryOrderByWithRelationInput
    field?: CategoryOrderByWithRelationInput
    _relevance?: DocumentOrderByRelevanceInput
  }

  export type DocumentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DocumentWhereInput | DocumentWhereInput[]
    OR?: DocumentWhereInput[]
    NOT?: DocumentWhereInput | DocumentWhereInput[]
    documentNumber?: StringFilter<"Document"> | string
    notation?: StringNullableFilter<"Document"> | string | null
    abstract?: StringFilter<"Document"> | string
    content?: StringNullableFilter<"Document"> | string | null
    typeId?: StringNullableFilter<"Document"> | string | null
    fieldId?: StringNullableFilter<"Document"> | string | null
    issuingAuthorityId?: StringNullableFilter<"Document"> | string | null
    issuerName?: StringNullableFilter<"Document"> | string | null
    signerId?: StringNullableFilter<"Document"> | string | null
    signerName?: StringNullableFilter<"Document"> | string | null
    signerPosition?: StringNullableFilter<"Document"> | string | null
    issueDate?: DateTimeNullableFilter<"Document"> | Date | string | null
    arrivalDate?: DateTimeNullableFilter<"Document"> | Date | string | null
    arrivalNumber?: StringNullableFilter<"Document"> | string | null
    processingDeadline?: DateTimeNullableFilter<"Document"> | Date | string | null
    recipients?: StringNullableFilter<"Document"> | string | null
    urgency?: StringFilter<"Document"> | string
    securityLevel?: StringFilter<"Document"> | string
    status?: StringFilter<"Document"> | string
    isPublic?: BoolFilter<"Document"> | boolean
    fileId?: StringNullableFilter<"Document"> | string | null
    signatureValid?: BoolFilter<"Document"> | boolean
    pageCount?: IntFilter<"Document"> | number
    attachmentCount?: IntFilter<"Document"> | number
    linkedDocumentId?: StringNullableFilter<"Document"> | string | null
    fiscalYear?: IntNullableFilter<"Document"> | number | null
    transparencyCategory?: StringNullableFilter<"Document"> | string | null
    createdAt?: DateTimeFilter<"Document"> | Date | string
    updatedAt?: DateTimeFilter<"Document"> | Date | string
    type?: XOR<CategoryNullableScalarRelationFilter, CategoryWhereInput> | null
    field?: XOR<CategoryNullableScalarRelationFilter, CategoryWhereInput> | null
  }, "id">

  export type DocumentOrderByWithAggregationInput = {
    id?: SortOrder
    documentNumber?: SortOrder
    notation?: SortOrderInput | SortOrder
    abstract?: SortOrder
    content?: SortOrderInput | SortOrder
    typeId?: SortOrderInput | SortOrder
    fieldId?: SortOrderInput | SortOrder
    issuingAuthorityId?: SortOrderInput | SortOrder
    issuerName?: SortOrderInput | SortOrder
    signerId?: SortOrderInput | SortOrder
    signerName?: SortOrderInput | SortOrder
    signerPosition?: SortOrderInput | SortOrder
    issueDate?: SortOrderInput | SortOrder
    arrivalDate?: SortOrderInput | SortOrder
    arrivalNumber?: SortOrderInput | SortOrder
    processingDeadline?: SortOrderInput | SortOrder
    recipients?: SortOrderInput | SortOrder
    urgency?: SortOrder
    securityLevel?: SortOrder
    status?: SortOrder
    isPublic?: SortOrder
    fileId?: SortOrderInput | SortOrder
    signatureValid?: SortOrder
    pageCount?: SortOrder
    attachmentCount?: SortOrder
    linkedDocumentId?: SortOrderInput | SortOrder
    fiscalYear?: SortOrderInput | SortOrder
    transparencyCategory?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DocumentCountOrderByAggregateInput
    _avg?: DocumentAvgOrderByAggregateInput
    _max?: DocumentMaxOrderByAggregateInput
    _min?: DocumentMinOrderByAggregateInput
    _sum?: DocumentSumOrderByAggregateInput
  }

  export type DocumentScalarWhereWithAggregatesInput = {
    AND?: DocumentScalarWhereWithAggregatesInput | DocumentScalarWhereWithAggregatesInput[]
    OR?: DocumentScalarWhereWithAggregatesInput[]
    NOT?: DocumentScalarWhereWithAggregatesInput | DocumentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Document"> | string
    documentNumber?: StringWithAggregatesFilter<"Document"> | string
    notation?: StringNullableWithAggregatesFilter<"Document"> | string | null
    abstract?: StringWithAggregatesFilter<"Document"> | string
    content?: StringNullableWithAggregatesFilter<"Document"> | string | null
    typeId?: StringNullableWithAggregatesFilter<"Document"> | string | null
    fieldId?: StringNullableWithAggregatesFilter<"Document"> | string | null
    issuingAuthorityId?: StringNullableWithAggregatesFilter<"Document"> | string | null
    issuerName?: StringNullableWithAggregatesFilter<"Document"> | string | null
    signerId?: StringNullableWithAggregatesFilter<"Document"> | string | null
    signerName?: StringNullableWithAggregatesFilter<"Document"> | string | null
    signerPosition?: StringNullableWithAggregatesFilter<"Document"> | string | null
    issueDate?: DateTimeNullableWithAggregatesFilter<"Document"> | Date | string | null
    arrivalDate?: DateTimeNullableWithAggregatesFilter<"Document"> | Date | string | null
    arrivalNumber?: StringNullableWithAggregatesFilter<"Document"> | string | null
    processingDeadline?: DateTimeNullableWithAggregatesFilter<"Document"> | Date | string | null
    recipients?: StringNullableWithAggregatesFilter<"Document"> | string | null
    urgency?: StringWithAggregatesFilter<"Document"> | string
    securityLevel?: StringWithAggregatesFilter<"Document"> | string
    status?: StringWithAggregatesFilter<"Document"> | string
    isPublic?: BoolWithAggregatesFilter<"Document"> | boolean
    fileId?: StringNullableWithAggregatesFilter<"Document"> | string | null
    signatureValid?: BoolWithAggregatesFilter<"Document"> | boolean
    pageCount?: IntWithAggregatesFilter<"Document"> | number
    attachmentCount?: IntWithAggregatesFilter<"Document"> | number
    linkedDocumentId?: StringNullableWithAggregatesFilter<"Document"> | string | null
    fiscalYear?: IntNullableWithAggregatesFilter<"Document"> | number | null
    transparencyCategory?: StringNullableWithAggregatesFilter<"Document"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Document"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Document"> | Date | string
  }

  export type MinutesWhereInput = {
    AND?: MinutesWhereInput | MinutesWhereInput[]
    OR?: MinutesWhereInput[]
    NOT?: MinutesWhereInput | MinutesWhereInput[]
    id?: StringFilter<"Minutes"> | string
    title?: StringFilter<"Minutes"> | string
    startTime?: DateTimeFilter<"Minutes"> | Date | string
    endTime?: DateTimeNullableFilter<"Minutes"> | Date | string | null
    location?: StringNullableFilter<"Minutes"> | string | null
    chairman?: StringNullableFilter<"Minutes"> | string | null
    secretary?: StringNullableFilter<"Minutes"> | string | null
    attendees?: StringNullableFilter<"Minutes"> | string | null
    content?: StringNullableFilter<"Minutes"> | string | null
    conclusion?: StringNullableFilter<"Minutes"> | string | null
    documentId?: StringNullableFilter<"Minutes"> | string | null
    status?: StringFilter<"Minutes"> | string
    createdAt?: DateTimeFilter<"Minutes"> | Date | string
    updatedAt?: DateTimeFilter<"Minutes"> | Date | string
  }

  export type MinutesOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    chairman?: SortOrderInput | SortOrder
    secretary?: SortOrderInput | SortOrder
    attendees?: SortOrderInput | SortOrder
    content?: SortOrderInput | SortOrder
    conclusion?: SortOrderInput | SortOrder
    documentId?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: MinutesOrderByRelevanceInput
  }

  export type MinutesWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MinutesWhereInput | MinutesWhereInput[]
    OR?: MinutesWhereInput[]
    NOT?: MinutesWhereInput | MinutesWhereInput[]
    title?: StringFilter<"Minutes"> | string
    startTime?: DateTimeFilter<"Minutes"> | Date | string
    endTime?: DateTimeNullableFilter<"Minutes"> | Date | string | null
    location?: StringNullableFilter<"Minutes"> | string | null
    chairman?: StringNullableFilter<"Minutes"> | string | null
    secretary?: StringNullableFilter<"Minutes"> | string | null
    attendees?: StringNullableFilter<"Minutes"> | string | null
    content?: StringNullableFilter<"Minutes"> | string | null
    conclusion?: StringNullableFilter<"Minutes"> | string | null
    documentId?: StringNullableFilter<"Minutes"> | string | null
    status?: StringFilter<"Minutes"> | string
    createdAt?: DateTimeFilter<"Minutes"> | Date | string
    updatedAt?: DateTimeFilter<"Minutes"> | Date | string
  }, "id">

  export type MinutesOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    chairman?: SortOrderInput | SortOrder
    secretary?: SortOrderInput | SortOrder
    attendees?: SortOrderInput | SortOrder
    content?: SortOrderInput | SortOrder
    conclusion?: SortOrderInput | SortOrder
    documentId?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MinutesCountOrderByAggregateInput
    _max?: MinutesMaxOrderByAggregateInput
    _min?: MinutesMinOrderByAggregateInput
  }

  export type MinutesScalarWhereWithAggregatesInput = {
    AND?: MinutesScalarWhereWithAggregatesInput | MinutesScalarWhereWithAggregatesInput[]
    OR?: MinutesScalarWhereWithAggregatesInput[]
    NOT?: MinutesScalarWhereWithAggregatesInput | MinutesScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Minutes"> | string
    title?: StringWithAggregatesFilter<"Minutes"> | string
    startTime?: DateTimeWithAggregatesFilter<"Minutes"> | Date | string
    endTime?: DateTimeNullableWithAggregatesFilter<"Minutes"> | Date | string | null
    location?: StringNullableWithAggregatesFilter<"Minutes"> | string | null
    chairman?: StringNullableWithAggregatesFilter<"Minutes"> | string | null
    secretary?: StringNullableWithAggregatesFilter<"Minutes"> | string | null
    attendees?: StringNullableWithAggregatesFilter<"Minutes"> | string | null
    content?: StringNullableWithAggregatesFilter<"Minutes"> | string | null
    conclusion?: StringNullableWithAggregatesFilter<"Minutes"> | string | null
    documentId?: StringNullableWithAggregatesFilter<"Minutes"> | string | null
    status?: StringWithAggregatesFilter<"Minutes"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Minutes"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Minutes"> | Date | string
  }

  export type CategoryCreateInput = {
    id?: string
    name: string
    slug: string
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    orderIndex?: number
    description?: string | null
    type: string
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: CategoryCreateNestedOneWithoutChildrenInput
    children?: CategoryCreateNestedManyWithoutParentInput
    documentsByType?: DocumentCreateNestedManyWithoutTypeInput
    documentsByField?: DocumentCreateNestedManyWithoutFieldInput
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
    orderIndex?: number
    description?: string | null
    type: string
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput
    documentsByType?: DocumentUncheckedCreateNestedManyWithoutTypeInput
    documentsByField?: DocumentUncheckedCreateNestedManyWithoutFieldInput
  }

  export type CategoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: CategoryUpdateOneWithoutChildrenNestedInput
    children?: CategoryUpdateManyWithoutParentNestedInput
    documentsByType?: DocumentUpdateManyWithoutTypeNestedInput
    documentsByField?: DocumentUpdateManyWithoutFieldNestedInput
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
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput
    documentsByType?: DocumentUncheckedUpdateManyWithoutTypeNestedInput
    documentsByField?: DocumentUncheckedUpdateManyWithoutFieldNestedInput
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
    orderIndex?: number
    description?: string | null
    type: string
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
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
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
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConsultationCreateInput = {
    id?: string
    title: string
    description?: string | null
    documentId?: string | null
    deadline: Date | string
    status?: string
    issuerId?: string | null
    issuerName?: string | null
    isUrgent?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    responses?: ConsultationResponseCreateNestedManyWithoutConsultationInput
  }

  export type ConsultationUncheckedCreateInput = {
    id?: string
    title: string
    description?: string | null
    documentId?: string | null
    deadline: Date | string
    status?: string
    issuerId?: string | null
    issuerName?: string | null
    isUrgent?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    responses?: ConsultationResponseUncheckedCreateNestedManyWithoutConsultationInput
  }

  export type ConsultationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    documentId?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    issuerId?: NullableStringFieldUpdateOperationsInput | string | null
    issuerName?: NullableStringFieldUpdateOperationsInput | string | null
    isUrgent?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    responses?: ConsultationResponseUpdateManyWithoutConsultationNestedInput
  }

  export type ConsultationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    documentId?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    issuerId?: NullableStringFieldUpdateOperationsInput | string | null
    issuerName?: NullableStringFieldUpdateOperationsInput | string | null
    isUrgent?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    responses?: ConsultationResponseUncheckedUpdateManyWithoutConsultationNestedInput
  }

  export type ConsultationCreateManyInput = {
    id?: string
    title: string
    description?: string | null
    documentId?: string | null
    deadline: Date | string
    status?: string
    issuerId?: string | null
    issuerName?: string | null
    isUrgent?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConsultationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    documentId?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    issuerId?: NullableStringFieldUpdateOperationsInput | string | null
    issuerName?: NullableStringFieldUpdateOperationsInput | string | null
    isUrgent?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConsultationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    documentId?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    issuerId?: NullableStringFieldUpdateOperationsInput | string | null
    issuerName?: NullableStringFieldUpdateOperationsInput | string | null
    isUrgent?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConsultationResponseCreateInput = {
    id?: string
    unitId: string
    unitName?: string | null
    userId?: string | null
    content?: string | null
    fileId?: string | null
    status?: string
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    consultation: ConsultationCreateNestedOneWithoutResponsesInput
  }

  export type ConsultationResponseUncheckedCreateInput = {
    id?: string
    consultationId: string
    unitId: string
    unitName?: string | null
    userId?: string | null
    content?: string | null
    fileId?: string | null
    status?: string
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConsultationResponseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    unitId?: StringFieldUpdateOperationsInput | string
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consultation?: ConsultationUpdateOneRequiredWithoutResponsesNestedInput
  }

  export type ConsultationResponseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    consultationId?: StringFieldUpdateOperationsInput | string
    unitId?: StringFieldUpdateOperationsInput | string
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConsultationResponseCreateManyInput = {
    id?: string
    consultationId: string
    unitId: string
    unitName?: string | null
    userId?: string | null
    content?: string | null
    fileId?: string | null
    status?: string
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConsultationResponseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    unitId?: StringFieldUpdateOperationsInput | string
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConsultationResponseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    consultationId?: StringFieldUpdateOperationsInput | string
    unitId?: StringFieldUpdateOperationsInput | string
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentCreateInput = {
    id?: string
    documentNumber: string
    notation?: string | null
    abstract: string
    content?: string | null
    issuingAuthorityId?: string | null
    issuerName?: string | null
    signerId?: string | null
    signerName?: string | null
    signerPosition?: string | null
    issueDate?: Date | string | null
    arrivalDate?: Date | string | null
    arrivalNumber?: string | null
    processingDeadline?: Date | string | null
    recipients?: string | null
    urgency?: string
    securityLevel?: string
    status?: string
    isPublic?: boolean
    fileId?: string | null
    signatureValid?: boolean
    pageCount?: number
    attachmentCount?: number
    linkedDocumentId?: string | null
    fiscalYear?: number | null
    transparencyCategory?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    type?: CategoryCreateNestedOneWithoutDocumentsByTypeInput
    field?: CategoryCreateNestedOneWithoutDocumentsByFieldInput
  }

  export type DocumentUncheckedCreateInput = {
    id?: string
    documentNumber: string
    notation?: string | null
    abstract: string
    content?: string | null
    typeId?: string | null
    fieldId?: string | null
    issuingAuthorityId?: string | null
    issuerName?: string | null
    signerId?: string | null
    signerName?: string | null
    signerPosition?: string | null
    issueDate?: Date | string | null
    arrivalDate?: Date | string | null
    arrivalNumber?: string | null
    processingDeadline?: Date | string | null
    recipients?: string | null
    urgency?: string
    securityLevel?: string
    status?: string
    isPublic?: boolean
    fileId?: string | null
    signatureValid?: boolean
    pageCount?: number
    attachmentCount?: number
    linkedDocumentId?: string | null
    fiscalYear?: number | null
    transparencyCategory?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DocumentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentNumber?: StringFieldUpdateOperationsInput | string
    notation?: NullableStringFieldUpdateOperationsInput | string | null
    abstract?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    issuingAuthorityId?: NullableStringFieldUpdateOperationsInput | string | null
    issuerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerId?: NullableStringFieldUpdateOperationsInput | string | null
    signerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerPosition?: NullableStringFieldUpdateOperationsInput | string | null
    issueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalNumber?: NullableStringFieldUpdateOperationsInput | string | null
    processingDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    recipients?: NullableStringFieldUpdateOperationsInput | string | null
    urgency?: StringFieldUpdateOperationsInput | string
    securityLevel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    pageCount?: IntFieldUpdateOperationsInput | number
    attachmentCount?: IntFieldUpdateOperationsInput | number
    linkedDocumentId?: NullableStringFieldUpdateOperationsInput | string | null
    fiscalYear?: NullableIntFieldUpdateOperationsInput | number | null
    transparencyCategory?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: CategoryUpdateOneWithoutDocumentsByTypeNestedInput
    field?: CategoryUpdateOneWithoutDocumentsByFieldNestedInput
  }

  export type DocumentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentNumber?: StringFieldUpdateOperationsInput | string
    notation?: NullableStringFieldUpdateOperationsInput | string | null
    abstract?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    typeId?: NullableStringFieldUpdateOperationsInput | string | null
    fieldId?: NullableStringFieldUpdateOperationsInput | string | null
    issuingAuthorityId?: NullableStringFieldUpdateOperationsInput | string | null
    issuerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerId?: NullableStringFieldUpdateOperationsInput | string | null
    signerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerPosition?: NullableStringFieldUpdateOperationsInput | string | null
    issueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalNumber?: NullableStringFieldUpdateOperationsInput | string | null
    processingDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    recipients?: NullableStringFieldUpdateOperationsInput | string | null
    urgency?: StringFieldUpdateOperationsInput | string
    securityLevel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    pageCount?: IntFieldUpdateOperationsInput | number
    attachmentCount?: IntFieldUpdateOperationsInput | number
    linkedDocumentId?: NullableStringFieldUpdateOperationsInput | string | null
    fiscalYear?: NullableIntFieldUpdateOperationsInput | number | null
    transparencyCategory?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentCreateManyInput = {
    id?: string
    documentNumber: string
    notation?: string | null
    abstract: string
    content?: string | null
    typeId?: string | null
    fieldId?: string | null
    issuingAuthorityId?: string | null
    issuerName?: string | null
    signerId?: string | null
    signerName?: string | null
    signerPosition?: string | null
    issueDate?: Date | string | null
    arrivalDate?: Date | string | null
    arrivalNumber?: string | null
    processingDeadline?: Date | string | null
    recipients?: string | null
    urgency?: string
    securityLevel?: string
    status?: string
    isPublic?: boolean
    fileId?: string | null
    signatureValid?: boolean
    pageCount?: number
    attachmentCount?: number
    linkedDocumentId?: string | null
    fiscalYear?: number | null
    transparencyCategory?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DocumentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentNumber?: StringFieldUpdateOperationsInput | string
    notation?: NullableStringFieldUpdateOperationsInput | string | null
    abstract?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    issuingAuthorityId?: NullableStringFieldUpdateOperationsInput | string | null
    issuerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerId?: NullableStringFieldUpdateOperationsInput | string | null
    signerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerPosition?: NullableStringFieldUpdateOperationsInput | string | null
    issueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalNumber?: NullableStringFieldUpdateOperationsInput | string | null
    processingDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    recipients?: NullableStringFieldUpdateOperationsInput | string | null
    urgency?: StringFieldUpdateOperationsInput | string
    securityLevel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    pageCount?: IntFieldUpdateOperationsInput | number
    attachmentCount?: IntFieldUpdateOperationsInput | number
    linkedDocumentId?: NullableStringFieldUpdateOperationsInput | string | null
    fiscalYear?: NullableIntFieldUpdateOperationsInput | number | null
    transparencyCategory?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentNumber?: StringFieldUpdateOperationsInput | string
    notation?: NullableStringFieldUpdateOperationsInput | string | null
    abstract?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    typeId?: NullableStringFieldUpdateOperationsInput | string | null
    fieldId?: NullableStringFieldUpdateOperationsInput | string | null
    issuingAuthorityId?: NullableStringFieldUpdateOperationsInput | string | null
    issuerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerId?: NullableStringFieldUpdateOperationsInput | string | null
    signerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerPosition?: NullableStringFieldUpdateOperationsInput | string | null
    issueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalNumber?: NullableStringFieldUpdateOperationsInput | string | null
    processingDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    recipients?: NullableStringFieldUpdateOperationsInput | string | null
    urgency?: StringFieldUpdateOperationsInput | string
    securityLevel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    pageCount?: IntFieldUpdateOperationsInput | number
    attachmentCount?: IntFieldUpdateOperationsInput | number
    linkedDocumentId?: NullableStringFieldUpdateOperationsInput | string | null
    fiscalYear?: NullableIntFieldUpdateOperationsInput | number | null
    transparencyCategory?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MinutesCreateInput = {
    id?: string
    title: string
    startTime: Date | string
    endTime?: Date | string | null
    location?: string | null
    chairman?: string | null
    secretary?: string | null
    attendees?: string | null
    content?: string | null
    conclusion?: string | null
    documentId?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MinutesUncheckedCreateInput = {
    id?: string
    title: string
    startTime: Date | string
    endTime?: Date | string | null
    location?: string | null
    chairman?: string | null
    secretary?: string | null
    attendees?: string | null
    content?: string | null
    conclusion?: string | null
    documentId?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MinutesUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    chairman?: NullableStringFieldUpdateOperationsInput | string | null
    secretary?: NullableStringFieldUpdateOperationsInput | string | null
    attendees?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    conclusion?: NullableStringFieldUpdateOperationsInput | string | null
    documentId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MinutesUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    chairman?: NullableStringFieldUpdateOperationsInput | string | null
    secretary?: NullableStringFieldUpdateOperationsInput | string | null
    attendees?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    conclusion?: NullableStringFieldUpdateOperationsInput | string | null
    documentId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MinutesCreateManyInput = {
    id?: string
    title: string
    startTime: Date | string
    endTime?: Date | string | null
    location?: string | null
    chairman?: string | null
    secretary?: string | null
    attendees?: string | null
    content?: string | null
    conclusion?: string | null
    documentId?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MinutesUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    chairman?: NullableStringFieldUpdateOperationsInput | string | null
    secretary?: NullableStringFieldUpdateOperationsInput | string | null
    attendees?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    conclusion?: NullableStringFieldUpdateOperationsInput | string | null
    documentId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MinutesUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    chairman?: NullableStringFieldUpdateOperationsInput | string | null
    secretary?: NullableStringFieldUpdateOperationsInput | string | null
    attendees?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    conclusion?: NullableStringFieldUpdateOperationsInput | string | null
    documentId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
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

  export type CategoryNullableScalarRelationFilter = {
    is?: CategoryWhereInput | null
    isNot?: CategoryWhereInput | null
  }

  export type CategoryListRelationFilter = {
    every?: CategoryWhereInput
    some?: CategoryWhereInput
    none?: CategoryWhereInput
  }

  export type DocumentListRelationFilter = {
    every?: DocumentWhereInput
    some?: DocumentWhereInput
    none?: DocumentWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CategoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DocumentOrderByRelationAggregateInput = {
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
    orderIndex?: SortOrder
    description?: SortOrder
    type?: SortOrder
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
    orderIndex?: SortOrder
    description?: SortOrder
    type?: SortOrder
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
    orderIndex?: SortOrder
    description?: SortOrder
    type?: SortOrder
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

  export type ConsultationResponseListRelationFilter = {
    every?: ConsultationResponseWhereInput
    some?: ConsultationResponseWhereInput
    none?: ConsultationResponseWhereInput
  }

  export type ConsultationResponseOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ConsultationOrderByRelevanceInput = {
    fields: ConsultationOrderByRelevanceFieldEnum | ConsultationOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ConsultationCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    documentId?: SortOrder
    deadline?: SortOrder
    status?: SortOrder
    issuerId?: SortOrder
    issuerName?: SortOrder
    isUrgent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConsultationMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    documentId?: SortOrder
    deadline?: SortOrder
    status?: SortOrder
    issuerId?: SortOrder
    issuerName?: SortOrder
    isUrgent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConsultationMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    documentId?: SortOrder
    deadline?: SortOrder
    status?: SortOrder
    issuerId?: SortOrder
    issuerName?: SortOrder
    isUrgent?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type ConsultationScalarRelationFilter = {
    is?: ConsultationWhereInput
    isNot?: ConsultationWhereInput
  }

  export type ConsultationResponseOrderByRelevanceInput = {
    fields: ConsultationResponseOrderByRelevanceFieldEnum | ConsultationResponseOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ConsultationResponseCountOrderByAggregateInput = {
    id?: SortOrder
    consultationId?: SortOrder
    unitId?: SortOrder
    unitName?: SortOrder
    userId?: SortOrder
    content?: SortOrder
    fileId?: SortOrder
    status?: SortOrder
    respondedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConsultationResponseMaxOrderByAggregateInput = {
    id?: SortOrder
    consultationId?: SortOrder
    unitId?: SortOrder
    unitName?: SortOrder
    userId?: SortOrder
    content?: SortOrder
    fileId?: SortOrder
    status?: SortOrder
    respondedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ConsultationResponseMinOrderByAggregateInput = {
    id?: SortOrder
    consultationId?: SortOrder
    unitId?: SortOrder
    unitName?: SortOrder
    userId?: SortOrder
    content?: SortOrder
    fileId?: SortOrder
    status?: SortOrder
    respondedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type DocumentOrderByRelevanceInput = {
    fields: DocumentOrderByRelevanceFieldEnum | DocumentOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type DocumentCountOrderByAggregateInput = {
    id?: SortOrder
    documentNumber?: SortOrder
    notation?: SortOrder
    abstract?: SortOrder
    content?: SortOrder
    typeId?: SortOrder
    fieldId?: SortOrder
    issuingAuthorityId?: SortOrder
    issuerName?: SortOrder
    signerId?: SortOrder
    signerName?: SortOrder
    signerPosition?: SortOrder
    issueDate?: SortOrder
    arrivalDate?: SortOrder
    arrivalNumber?: SortOrder
    processingDeadline?: SortOrder
    recipients?: SortOrder
    urgency?: SortOrder
    securityLevel?: SortOrder
    status?: SortOrder
    isPublic?: SortOrder
    fileId?: SortOrder
    signatureValid?: SortOrder
    pageCount?: SortOrder
    attachmentCount?: SortOrder
    linkedDocumentId?: SortOrder
    fiscalYear?: SortOrder
    transparencyCategory?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DocumentAvgOrderByAggregateInput = {
    pageCount?: SortOrder
    attachmentCount?: SortOrder
    fiscalYear?: SortOrder
  }

  export type DocumentMaxOrderByAggregateInput = {
    id?: SortOrder
    documentNumber?: SortOrder
    notation?: SortOrder
    abstract?: SortOrder
    content?: SortOrder
    typeId?: SortOrder
    fieldId?: SortOrder
    issuingAuthorityId?: SortOrder
    issuerName?: SortOrder
    signerId?: SortOrder
    signerName?: SortOrder
    signerPosition?: SortOrder
    issueDate?: SortOrder
    arrivalDate?: SortOrder
    arrivalNumber?: SortOrder
    processingDeadline?: SortOrder
    recipients?: SortOrder
    urgency?: SortOrder
    securityLevel?: SortOrder
    status?: SortOrder
    isPublic?: SortOrder
    fileId?: SortOrder
    signatureValid?: SortOrder
    pageCount?: SortOrder
    attachmentCount?: SortOrder
    linkedDocumentId?: SortOrder
    fiscalYear?: SortOrder
    transparencyCategory?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DocumentMinOrderByAggregateInput = {
    id?: SortOrder
    documentNumber?: SortOrder
    notation?: SortOrder
    abstract?: SortOrder
    content?: SortOrder
    typeId?: SortOrder
    fieldId?: SortOrder
    issuingAuthorityId?: SortOrder
    issuerName?: SortOrder
    signerId?: SortOrder
    signerName?: SortOrder
    signerPosition?: SortOrder
    issueDate?: SortOrder
    arrivalDate?: SortOrder
    arrivalNumber?: SortOrder
    processingDeadline?: SortOrder
    recipients?: SortOrder
    urgency?: SortOrder
    securityLevel?: SortOrder
    status?: SortOrder
    isPublic?: SortOrder
    fileId?: SortOrder
    signatureValid?: SortOrder
    pageCount?: SortOrder
    attachmentCount?: SortOrder
    linkedDocumentId?: SortOrder
    fiscalYear?: SortOrder
    transparencyCategory?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DocumentSumOrderByAggregateInput = {
    pageCount?: SortOrder
    attachmentCount?: SortOrder
    fiscalYear?: SortOrder
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

  export type MinutesOrderByRelevanceInput = {
    fields: MinutesOrderByRelevanceFieldEnum | MinutesOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type MinutesCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    location?: SortOrder
    chairman?: SortOrder
    secretary?: SortOrder
    attendees?: SortOrder
    content?: SortOrder
    conclusion?: SortOrder
    documentId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MinutesMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    location?: SortOrder
    chairman?: SortOrder
    secretary?: SortOrder
    attendees?: SortOrder
    content?: SortOrder
    conclusion?: SortOrder
    documentId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MinutesMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    location?: SortOrder
    chairman?: SortOrder
    secretary?: SortOrder
    attendees?: SortOrder
    content?: SortOrder
    conclusion?: SortOrder
    documentId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type DocumentCreateNestedManyWithoutTypeInput = {
    create?: XOR<DocumentCreateWithoutTypeInput, DocumentUncheckedCreateWithoutTypeInput> | DocumentCreateWithoutTypeInput[] | DocumentUncheckedCreateWithoutTypeInput[]
    connectOrCreate?: DocumentCreateOrConnectWithoutTypeInput | DocumentCreateOrConnectWithoutTypeInput[]
    createMany?: DocumentCreateManyTypeInputEnvelope
    connect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
  }

  export type DocumentCreateNestedManyWithoutFieldInput = {
    create?: XOR<DocumentCreateWithoutFieldInput, DocumentUncheckedCreateWithoutFieldInput> | DocumentCreateWithoutFieldInput[] | DocumentUncheckedCreateWithoutFieldInput[]
    connectOrCreate?: DocumentCreateOrConnectWithoutFieldInput | DocumentCreateOrConnectWithoutFieldInput[]
    createMany?: DocumentCreateManyFieldInputEnvelope
    connect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
  }

  export type CategoryUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput> | CategoryCreateWithoutParentInput[] | CategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutParentInput | CategoryCreateOrConnectWithoutParentInput[]
    createMany?: CategoryCreateManyParentInputEnvelope
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
  }

  export type DocumentUncheckedCreateNestedManyWithoutTypeInput = {
    create?: XOR<DocumentCreateWithoutTypeInput, DocumentUncheckedCreateWithoutTypeInput> | DocumentCreateWithoutTypeInput[] | DocumentUncheckedCreateWithoutTypeInput[]
    connectOrCreate?: DocumentCreateOrConnectWithoutTypeInput | DocumentCreateOrConnectWithoutTypeInput[]
    createMany?: DocumentCreateManyTypeInputEnvelope
    connect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
  }

  export type DocumentUncheckedCreateNestedManyWithoutFieldInput = {
    create?: XOR<DocumentCreateWithoutFieldInput, DocumentUncheckedCreateWithoutFieldInput> | DocumentCreateWithoutFieldInput[] | DocumentUncheckedCreateWithoutFieldInput[]
    connectOrCreate?: DocumentCreateOrConnectWithoutFieldInput | DocumentCreateOrConnectWithoutFieldInput[]
    createMany?: DocumentCreateManyFieldInputEnvelope
    connect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
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

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
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

  export type DocumentUpdateManyWithoutTypeNestedInput = {
    create?: XOR<DocumentCreateWithoutTypeInput, DocumentUncheckedCreateWithoutTypeInput> | DocumentCreateWithoutTypeInput[] | DocumentUncheckedCreateWithoutTypeInput[]
    connectOrCreate?: DocumentCreateOrConnectWithoutTypeInput | DocumentCreateOrConnectWithoutTypeInput[]
    upsert?: DocumentUpsertWithWhereUniqueWithoutTypeInput | DocumentUpsertWithWhereUniqueWithoutTypeInput[]
    createMany?: DocumentCreateManyTypeInputEnvelope
    set?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    disconnect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    delete?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    connect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    update?: DocumentUpdateWithWhereUniqueWithoutTypeInput | DocumentUpdateWithWhereUniqueWithoutTypeInput[]
    updateMany?: DocumentUpdateManyWithWhereWithoutTypeInput | DocumentUpdateManyWithWhereWithoutTypeInput[]
    deleteMany?: DocumentScalarWhereInput | DocumentScalarWhereInput[]
  }

  export type DocumentUpdateManyWithoutFieldNestedInput = {
    create?: XOR<DocumentCreateWithoutFieldInput, DocumentUncheckedCreateWithoutFieldInput> | DocumentCreateWithoutFieldInput[] | DocumentUncheckedCreateWithoutFieldInput[]
    connectOrCreate?: DocumentCreateOrConnectWithoutFieldInput | DocumentCreateOrConnectWithoutFieldInput[]
    upsert?: DocumentUpsertWithWhereUniqueWithoutFieldInput | DocumentUpsertWithWhereUniqueWithoutFieldInput[]
    createMany?: DocumentCreateManyFieldInputEnvelope
    set?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    disconnect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    delete?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    connect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    update?: DocumentUpdateWithWhereUniqueWithoutFieldInput | DocumentUpdateWithWhereUniqueWithoutFieldInput[]
    updateMany?: DocumentUpdateManyWithWhereWithoutFieldInput | DocumentUpdateManyWithWhereWithoutFieldInput[]
    deleteMany?: DocumentScalarWhereInput | DocumentScalarWhereInput[]
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

  export type DocumentUncheckedUpdateManyWithoutTypeNestedInput = {
    create?: XOR<DocumentCreateWithoutTypeInput, DocumentUncheckedCreateWithoutTypeInput> | DocumentCreateWithoutTypeInput[] | DocumentUncheckedCreateWithoutTypeInput[]
    connectOrCreate?: DocumentCreateOrConnectWithoutTypeInput | DocumentCreateOrConnectWithoutTypeInput[]
    upsert?: DocumentUpsertWithWhereUniqueWithoutTypeInput | DocumentUpsertWithWhereUniqueWithoutTypeInput[]
    createMany?: DocumentCreateManyTypeInputEnvelope
    set?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    disconnect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    delete?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    connect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    update?: DocumentUpdateWithWhereUniqueWithoutTypeInput | DocumentUpdateWithWhereUniqueWithoutTypeInput[]
    updateMany?: DocumentUpdateManyWithWhereWithoutTypeInput | DocumentUpdateManyWithWhereWithoutTypeInput[]
    deleteMany?: DocumentScalarWhereInput | DocumentScalarWhereInput[]
  }

  export type DocumentUncheckedUpdateManyWithoutFieldNestedInput = {
    create?: XOR<DocumentCreateWithoutFieldInput, DocumentUncheckedCreateWithoutFieldInput> | DocumentCreateWithoutFieldInput[] | DocumentUncheckedCreateWithoutFieldInput[]
    connectOrCreate?: DocumentCreateOrConnectWithoutFieldInput | DocumentCreateOrConnectWithoutFieldInput[]
    upsert?: DocumentUpsertWithWhereUniqueWithoutFieldInput | DocumentUpsertWithWhereUniqueWithoutFieldInput[]
    createMany?: DocumentCreateManyFieldInputEnvelope
    set?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    disconnect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    delete?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    connect?: DocumentWhereUniqueInput | DocumentWhereUniqueInput[]
    update?: DocumentUpdateWithWhereUniqueWithoutFieldInput | DocumentUpdateWithWhereUniqueWithoutFieldInput[]
    updateMany?: DocumentUpdateManyWithWhereWithoutFieldInput | DocumentUpdateManyWithWhereWithoutFieldInput[]
    deleteMany?: DocumentScalarWhereInput | DocumentScalarWhereInput[]
  }

  export type ConsultationResponseCreateNestedManyWithoutConsultationInput = {
    create?: XOR<ConsultationResponseCreateWithoutConsultationInput, ConsultationResponseUncheckedCreateWithoutConsultationInput> | ConsultationResponseCreateWithoutConsultationInput[] | ConsultationResponseUncheckedCreateWithoutConsultationInput[]
    connectOrCreate?: ConsultationResponseCreateOrConnectWithoutConsultationInput | ConsultationResponseCreateOrConnectWithoutConsultationInput[]
    createMany?: ConsultationResponseCreateManyConsultationInputEnvelope
    connect?: ConsultationResponseWhereUniqueInput | ConsultationResponseWhereUniqueInput[]
  }

  export type ConsultationResponseUncheckedCreateNestedManyWithoutConsultationInput = {
    create?: XOR<ConsultationResponseCreateWithoutConsultationInput, ConsultationResponseUncheckedCreateWithoutConsultationInput> | ConsultationResponseCreateWithoutConsultationInput[] | ConsultationResponseUncheckedCreateWithoutConsultationInput[]
    connectOrCreate?: ConsultationResponseCreateOrConnectWithoutConsultationInput | ConsultationResponseCreateOrConnectWithoutConsultationInput[]
    createMany?: ConsultationResponseCreateManyConsultationInputEnvelope
    connect?: ConsultationResponseWhereUniqueInput | ConsultationResponseWhereUniqueInput[]
  }

  export type ConsultationResponseUpdateManyWithoutConsultationNestedInput = {
    create?: XOR<ConsultationResponseCreateWithoutConsultationInput, ConsultationResponseUncheckedCreateWithoutConsultationInput> | ConsultationResponseCreateWithoutConsultationInput[] | ConsultationResponseUncheckedCreateWithoutConsultationInput[]
    connectOrCreate?: ConsultationResponseCreateOrConnectWithoutConsultationInput | ConsultationResponseCreateOrConnectWithoutConsultationInput[]
    upsert?: ConsultationResponseUpsertWithWhereUniqueWithoutConsultationInput | ConsultationResponseUpsertWithWhereUniqueWithoutConsultationInput[]
    createMany?: ConsultationResponseCreateManyConsultationInputEnvelope
    set?: ConsultationResponseWhereUniqueInput | ConsultationResponseWhereUniqueInput[]
    disconnect?: ConsultationResponseWhereUniqueInput | ConsultationResponseWhereUniqueInput[]
    delete?: ConsultationResponseWhereUniqueInput | ConsultationResponseWhereUniqueInput[]
    connect?: ConsultationResponseWhereUniqueInput | ConsultationResponseWhereUniqueInput[]
    update?: ConsultationResponseUpdateWithWhereUniqueWithoutConsultationInput | ConsultationResponseUpdateWithWhereUniqueWithoutConsultationInput[]
    updateMany?: ConsultationResponseUpdateManyWithWhereWithoutConsultationInput | ConsultationResponseUpdateManyWithWhereWithoutConsultationInput[]
    deleteMany?: ConsultationResponseScalarWhereInput | ConsultationResponseScalarWhereInput[]
  }

  export type ConsultationResponseUncheckedUpdateManyWithoutConsultationNestedInput = {
    create?: XOR<ConsultationResponseCreateWithoutConsultationInput, ConsultationResponseUncheckedCreateWithoutConsultationInput> | ConsultationResponseCreateWithoutConsultationInput[] | ConsultationResponseUncheckedCreateWithoutConsultationInput[]
    connectOrCreate?: ConsultationResponseCreateOrConnectWithoutConsultationInput | ConsultationResponseCreateOrConnectWithoutConsultationInput[]
    upsert?: ConsultationResponseUpsertWithWhereUniqueWithoutConsultationInput | ConsultationResponseUpsertWithWhereUniqueWithoutConsultationInput[]
    createMany?: ConsultationResponseCreateManyConsultationInputEnvelope
    set?: ConsultationResponseWhereUniqueInput | ConsultationResponseWhereUniqueInput[]
    disconnect?: ConsultationResponseWhereUniqueInput | ConsultationResponseWhereUniqueInput[]
    delete?: ConsultationResponseWhereUniqueInput | ConsultationResponseWhereUniqueInput[]
    connect?: ConsultationResponseWhereUniqueInput | ConsultationResponseWhereUniqueInput[]
    update?: ConsultationResponseUpdateWithWhereUniqueWithoutConsultationInput | ConsultationResponseUpdateWithWhereUniqueWithoutConsultationInput[]
    updateMany?: ConsultationResponseUpdateManyWithWhereWithoutConsultationInput | ConsultationResponseUpdateManyWithWhereWithoutConsultationInput[]
    deleteMany?: ConsultationResponseScalarWhereInput | ConsultationResponseScalarWhereInput[]
  }

  export type ConsultationCreateNestedOneWithoutResponsesInput = {
    create?: XOR<ConsultationCreateWithoutResponsesInput, ConsultationUncheckedCreateWithoutResponsesInput>
    connectOrCreate?: ConsultationCreateOrConnectWithoutResponsesInput
    connect?: ConsultationWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ConsultationUpdateOneRequiredWithoutResponsesNestedInput = {
    create?: XOR<ConsultationCreateWithoutResponsesInput, ConsultationUncheckedCreateWithoutResponsesInput>
    connectOrCreate?: ConsultationCreateOrConnectWithoutResponsesInput
    upsert?: ConsultationUpsertWithoutResponsesInput
    connect?: ConsultationWhereUniqueInput
    update?: XOR<XOR<ConsultationUpdateToOneWithWhereWithoutResponsesInput, ConsultationUpdateWithoutResponsesInput>, ConsultationUncheckedUpdateWithoutResponsesInput>
  }

  export type CategoryCreateNestedOneWithoutDocumentsByTypeInput = {
    create?: XOR<CategoryCreateWithoutDocumentsByTypeInput, CategoryUncheckedCreateWithoutDocumentsByTypeInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutDocumentsByTypeInput
    connect?: CategoryWhereUniqueInput
  }

  export type CategoryCreateNestedOneWithoutDocumentsByFieldInput = {
    create?: XOR<CategoryCreateWithoutDocumentsByFieldInput, CategoryUncheckedCreateWithoutDocumentsByFieldInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutDocumentsByFieldInput
    connect?: CategoryWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type CategoryUpdateOneWithoutDocumentsByTypeNestedInput = {
    create?: XOR<CategoryCreateWithoutDocumentsByTypeInput, CategoryUncheckedCreateWithoutDocumentsByTypeInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutDocumentsByTypeInput
    upsert?: CategoryUpsertWithoutDocumentsByTypeInput
    disconnect?: CategoryWhereInput | boolean
    delete?: CategoryWhereInput | boolean
    connect?: CategoryWhereUniqueInput
    update?: XOR<XOR<CategoryUpdateToOneWithWhereWithoutDocumentsByTypeInput, CategoryUpdateWithoutDocumentsByTypeInput>, CategoryUncheckedUpdateWithoutDocumentsByTypeInput>
  }

  export type CategoryUpdateOneWithoutDocumentsByFieldNestedInput = {
    create?: XOR<CategoryCreateWithoutDocumentsByFieldInput, CategoryUncheckedCreateWithoutDocumentsByFieldInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutDocumentsByFieldInput
    upsert?: CategoryUpsertWithoutDocumentsByFieldInput
    disconnect?: CategoryWhereInput | boolean
    delete?: CategoryWhereInput | boolean
    connect?: CategoryWhereUniqueInput
    update?: XOR<XOR<CategoryUpdateToOneWithWhereWithoutDocumentsByFieldInput, CategoryUpdateWithoutDocumentsByFieldInput>, CategoryUncheckedUpdateWithoutDocumentsByFieldInput>
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

  export type CategoryCreateWithoutChildrenInput = {
    id?: string
    name: string
    slug: string
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    orderIndex?: number
    description?: string | null
    type: string
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: CategoryCreateNestedOneWithoutChildrenInput
    documentsByType?: DocumentCreateNestedManyWithoutTypeInput
    documentsByField?: DocumentCreateNestedManyWithoutFieldInput
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
    orderIndex?: number
    description?: string | null
    type: string
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    documentsByType?: DocumentUncheckedCreateNestedManyWithoutTypeInput
    documentsByField?: DocumentUncheckedCreateNestedManyWithoutFieldInput
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
    orderIndex?: number
    description?: string | null
    type: string
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: CategoryCreateNestedManyWithoutParentInput
    documentsByType?: DocumentCreateNestedManyWithoutTypeInput
    documentsByField?: DocumentCreateNestedManyWithoutFieldInput
  }

  export type CategoryUncheckedCreateWithoutParentInput = {
    id?: string
    name: string
    slug: string
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    orderIndex?: number
    description?: string | null
    type: string
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput
    documentsByType?: DocumentUncheckedCreateNestedManyWithoutTypeInput
    documentsByField?: DocumentUncheckedCreateNestedManyWithoutFieldInput
  }

  export type CategoryCreateOrConnectWithoutParentInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput>
  }

  export type CategoryCreateManyParentInputEnvelope = {
    data: CategoryCreateManyParentInput | CategoryCreateManyParentInput[]
    skipDuplicates?: boolean
  }

  export type DocumentCreateWithoutTypeInput = {
    id?: string
    documentNumber: string
    notation?: string | null
    abstract: string
    content?: string | null
    issuingAuthorityId?: string | null
    issuerName?: string | null
    signerId?: string | null
    signerName?: string | null
    signerPosition?: string | null
    issueDate?: Date | string | null
    arrivalDate?: Date | string | null
    arrivalNumber?: string | null
    processingDeadline?: Date | string | null
    recipients?: string | null
    urgency?: string
    securityLevel?: string
    status?: string
    isPublic?: boolean
    fileId?: string | null
    signatureValid?: boolean
    pageCount?: number
    attachmentCount?: number
    linkedDocumentId?: string | null
    fiscalYear?: number | null
    transparencyCategory?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    field?: CategoryCreateNestedOneWithoutDocumentsByFieldInput
  }

  export type DocumentUncheckedCreateWithoutTypeInput = {
    id?: string
    documentNumber: string
    notation?: string | null
    abstract: string
    content?: string | null
    fieldId?: string | null
    issuingAuthorityId?: string | null
    issuerName?: string | null
    signerId?: string | null
    signerName?: string | null
    signerPosition?: string | null
    issueDate?: Date | string | null
    arrivalDate?: Date | string | null
    arrivalNumber?: string | null
    processingDeadline?: Date | string | null
    recipients?: string | null
    urgency?: string
    securityLevel?: string
    status?: string
    isPublic?: boolean
    fileId?: string | null
    signatureValid?: boolean
    pageCount?: number
    attachmentCount?: number
    linkedDocumentId?: string | null
    fiscalYear?: number | null
    transparencyCategory?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DocumentCreateOrConnectWithoutTypeInput = {
    where: DocumentWhereUniqueInput
    create: XOR<DocumentCreateWithoutTypeInput, DocumentUncheckedCreateWithoutTypeInput>
  }

  export type DocumentCreateManyTypeInputEnvelope = {
    data: DocumentCreateManyTypeInput | DocumentCreateManyTypeInput[]
    skipDuplicates?: boolean
  }

  export type DocumentCreateWithoutFieldInput = {
    id?: string
    documentNumber: string
    notation?: string | null
    abstract: string
    content?: string | null
    issuingAuthorityId?: string | null
    issuerName?: string | null
    signerId?: string | null
    signerName?: string | null
    signerPosition?: string | null
    issueDate?: Date | string | null
    arrivalDate?: Date | string | null
    arrivalNumber?: string | null
    processingDeadline?: Date | string | null
    recipients?: string | null
    urgency?: string
    securityLevel?: string
    status?: string
    isPublic?: boolean
    fileId?: string | null
    signatureValid?: boolean
    pageCount?: number
    attachmentCount?: number
    linkedDocumentId?: string | null
    fiscalYear?: number | null
    transparencyCategory?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    type?: CategoryCreateNestedOneWithoutDocumentsByTypeInput
  }

  export type DocumentUncheckedCreateWithoutFieldInput = {
    id?: string
    documentNumber: string
    notation?: string | null
    abstract: string
    content?: string | null
    typeId?: string | null
    issuingAuthorityId?: string | null
    issuerName?: string | null
    signerId?: string | null
    signerName?: string | null
    signerPosition?: string | null
    issueDate?: Date | string | null
    arrivalDate?: Date | string | null
    arrivalNumber?: string | null
    processingDeadline?: Date | string | null
    recipients?: string | null
    urgency?: string
    securityLevel?: string
    status?: string
    isPublic?: boolean
    fileId?: string | null
    signatureValid?: boolean
    pageCount?: number
    attachmentCount?: number
    linkedDocumentId?: string | null
    fiscalYear?: number | null
    transparencyCategory?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DocumentCreateOrConnectWithoutFieldInput = {
    where: DocumentWhereUniqueInput
    create: XOR<DocumentCreateWithoutFieldInput, DocumentUncheckedCreateWithoutFieldInput>
  }

  export type DocumentCreateManyFieldInputEnvelope = {
    data: DocumentCreateManyFieldInput | DocumentCreateManyFieldInput[]
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
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: CategoryUpdateOneWithoutChildrenNestedInput
    documentsByType?: DocumentUpdateManyWithoutTypeNestedInput
    documentsByField?: DocumentUpdateManyWithoutFieldNestedInput
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
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    documentsByType?: DocumentUncheckedUpdateManyWithoutTypeNestedInput
    documentsByField?: DocumentUncheckedUpdateManyWithoutFieldNestedInput
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
    orderIndex?: IntFilter<"Category"> | number
    description?: StringNullableFilter<"Category"> | string | null
    type?: StringFilter<"Category"> | string
    isGovStandard?: BoolFilter<"Category"> | boolean
    createdAt?: DateTimeFilter<"Category"> | Date | string
    updatedAt?: DateTimeFilter<"Category"> | Date | string
  }

  export type DocumentUpsertWithWhereUniqueWithoutTypeInput = {
    where: DocumentWhereUniqueInput
    update: XOR<DocumentUpdateWithoutTypeInput, DocumentUncheckedUpdateWithoutTypeInput>
    create: XOR<DocumentCreateWithoutTypeInput, DocumentUncheckedCreateWithoutTypeInput>
  }

  export type DocumentUpdateWithWhereUniqueWithoutTypeInput = {
    where: DocumentWhereUniqueInput
    data: XOR<DocumentUpdateWithoutTypeInput, DocumentUncheckedUpdateWithoutTypeInput>
  }

  export type DocumentUpdateManyWithWhereWithoutTypeInput = {
    where: DocumentScalarWhereInput
    data: XOR<DocumentUpdateManyMutationInput, DocumentUncheckedUpdateManyWithoutTypeInput>
  }

  export type DocumentScalarWhereInput = {
    AND?: DocumentScalarWhereInput | DocumentScalarWhereInput[]
    OR?: DocumentScalarWhereInput[]
    NOT?: DocumentScalarWhereInput | DocumentScalarWhereInput[]
    id?: StringFilter<"Document"> | string
    documentNumber?: StringFilter<"Document"> | string
    notation?: StringNullableFilter<"Document"> | string | null
    abstract?: StringFilter<"Document"> | string
    content?: StringNullableFilter<"Document"> | string | null
    typeId?: StringNullableFilter<"Document"> | string | null
    fieldId?: StringNullableFilter<"Document"> | string | null
    issuingAuthorityId?: StringNullableFilter<"Document"> | string | null
    issuerName?: StringNullableFilter<"Document"> | string | null
    signerId?: StringNullableFilter<"Document"> | string | null
    signerName?: StringNullableFilter<"Document"> | string | null
    signerPosition?: StringNullableFilter<"Document"> | string | null
    issueDate?: DateTimeNullableFilter<"Document"> | Date | string | null
    arrivalDate?: DateTimeNullableFilter<"Document"> | Date | string | null
    arrivalNumber?: StringNullableFilter<"Document"> | string | null
    processingDeadline?: DateTimeNullableFilter<"Document"> | Date | string | null
    recipients?: StringNullableFilter<"Document"> | string | null
    urgency?: StringFilter<"Document"> | string
    securityLevel?: StringFilter<"Document"> | string
    status?: StringFilter<"Document"> | string
    isPublic?: BoolFilter<"Document"> | boolean
    fileId?: StringNullableFilter<"Document"> | string | null
    signatureValid?: BoolFilter<"Document"> | boolean
    pageCount?: IntFilter<"Document"> | number
    attachmentCount?: IntFilter<"Document"> | number
    linkedDocumentId?: StringNullableFilter<"Document"> | string | null
    fiscalYear?: IntNullableFilter<"Document"> | number | null
    transparencyCategory?: StringNullableFilter<"Document"> | string | null
    createdAt?: DateTimeFilter<"Document"> | Date | string
    updatedAt?: DateTimeFilter<"Document"> | Date | string
  }

  export type DocumentUpsertWithWhereUniqueWithoutFieldInput = {
    where: DocumentWhereUniqueInput
    update: XOR<DocumentUpdateWithoutFieldInput, DocumentUncheckedUpdateWithoutFieldInput>
    create: XOR<DocumentCreateWithoutFieldInput, DocumentUncheckedCreateWithoutFieldInput>
  }

  export type DocumentUpdateWithWhereUniqueWithoutFieldInput = {
    where: DocumentWhereUniqueInput
    data: XOR<DocumentUpdateWithoutFieldInput, DocumentUncheckedUpdateWithoutFieldInput>
  }

  export type DocumentUpdateManyWithWhereWithoutFieldInput = {
    where: DocumentScalarWhereInput
    data: XOR<DocumentUpdateManyMutationInput, DocumentUncheckedUpdateManyWithoutFieldInput>
  }

  export type ConsultationResponseCreateWithoutConsultationInput = {
    id?: string
    unitId: string
    unitName?: string | null
    userId?: string | null
    content?: string | null
    fileId?: string | null
    status?: string
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConsultationResponseUncheckedCreateWithoutConsultationInput = {
    id?: string
    unitId: string
    unitName?: string | null
    userId?: string | null
    content?: string | null
    fileId?: string | null
    status?: string
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConsultationResponseCreateOrConnectWithoutConsultationInput = {
    where: ConsultationResponseWhereUniqueInput
    create: XOR<ConsultationResponseCreateWithoutConsultationInput, ConsultationResponseUncheckedCreateWithoutConsultationInput>
  }

  export type ConsultationResponseCreateManyConsultationInputEnvelope = {
    data: ConsultationResponseCreateManyConsultationInput | ConsultationResponseCreateManyConsultationInput[]
    skipDuplicates?: boolean
  }

  export type ConsultationResponseUpsertWithWhereUniqueWithoutConsultationInput = {
    where: ConsultationResponseWhereUniqueInput
    update: XOR<ConsultationResponseUpdateWithoutConsultationInput, ConsultationResponseUncheckedUpdateWithoutConsultationInput>
    create: XOR<ConsultationResponseCreateWithoutConsultationInput, ConsultationResponseUncheckedCreateWithoutConsultationInput>
  }

  export type ConsultationResponseUpdateWithWhereUniqueWithoutConsultationInput = {
    where: ConsultationResponseWhereUniqueInput
    data: XOR<ConsultationResponseUpdateWithoutConsultationInput, ConsultationResponseUncheckedUpdateWithoutConsultationInput>
  }

  export type ConsultationResponseUpdateManyWithWhereWithoutConsultationInput = {
    where: ConsultationResponseScalarWhereInput
    data: XOR<ConsultationResponseUpdateManyMutationInput, ConsultationResponseUncheckedUpdateManyWithoutConsultationInput>
  }

  export type ConsultationResponseScalarWhereInput = {
    AND?: ConsultationResponseScalarWhereInput | ConsultationResponseScalarWhereInput[]
    OR?: ConsultationResponseScalarWhereInput[]
    NOT?: ConsultationResponseScalarWhereInput | ConsultationResponseScalarWhereInput[]
    id?: StringFilter<"ConsultationResponse"> | string
    consultationId?: StringFilter<"ConsultationResponse"> | string
    unitId?: StringFilter<"ConsultationResponse"> | string
    unitName?: StringNullableFilter<"ConsultationResponse"> | string | null
    userId?: StringNullableFilter<"ConsultationResponse"> | string | null
    content?: StringNullableFilter<"ConsultationResponse"> | string | null
    fileId?: StringNullableFilter<"ConsultationResponse"> | string | null
    status?: StringFilter<"ConsultationResponse"> | string
    respondedAt?: DateTimeNullableFilter<"ConsultationResponse"> | Date | string | null
    createdAt?: DateTimeFilter<"ConsultationResponse"> | Date | string
    updatedAt?: DateTimeFilter<"ConsultationResponse"> | Date | string
  }

  export type ConsultationCreateWithoutResponsesInput = {
    id?: string
    title: string
    description?: string | null
    documentId?: string | null
    deadline: Date | string
    status?: string
    issuerId?: string | null
    issuerName?: string | null
    isUrgent?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConsultationUncheckedCreateWithoutResponsesInput = {
    id?: string
    title: string
    description?: string | null
    documentId?: string | null
    deadline: Date | string
    status?: string
    issuerId?: string | null
    issuerName?: string | null
    isUrgent?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConsultationCreateOrConnectWithoutResponsesInput = {
    where: ConsultationWhereUniqueInput
    create: XOR<ConsultationCreateWithoutResponsesInput, ConsultationUncheckedCreateWithoutResponsesInput>
  }

  export type ConsultationUpsertWithoutResponsesInput = {
    update: XOR<ConsultationUpdateWithoutResponsesInput, ConsultationUncheckedUpdateWithoutResponsesInput>
    create: XOR<ConsultationCreateWithoutResponsesInput, ConsultationUncheckedCreateWithoutResponsesInput>
    where?: ConsultationWhereInput
  }

  export type ConsultationUpdateToOneWithWhereWithoutResponsesInput = {
    where?: ConsultationWhereInput
    data: XOR<ConsultationUpdateWithoutResponsesInput, ConsultationUncheckedUpdateWithoutResponsesInput>
  }

  export type ConsultationUpdateWithoutResponsesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    documentId?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    issuerId?: NullableStringFieldUpdateOperationsInput | string | null
    issuerName?: NullableStringFieldUpdateOperationsInput | string | null
    isUrgent?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConsultationUncheckedUpdateWithoutResponsesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    documentId?: NullableStringFieldUpdateOperationsInput | string | null
    deadline?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    issuerId?: NullableStringFieldUpdateOperationsInput | string | null
    issuerName?: NullableStringFieldUpdateOperationsInput | string | null
    isUrgent?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryCreateWithoutDocumentsByTypeInput = {
    id?: string
    name: string
    slug: string
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    orderIndex?: number
    description?: string | null
    type: string
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: CategoryCreateNestedOneWithoutChildrenInput
    children?: CategoryCreateNestedManyWithoutParentInput
    documentsByField?: DocumentCreateNestedManyWithoutFieldInput
  }

  export type CategoryUncheckedCreateWithoutDocumentsByTypeInput = {
    id?: string
    name: string
    slug: string
    parentId?: string | null
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    orderIndex?: number
    description?: string | null
    type: string
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput
    documentsByField?: DocumentUncheckedCreateNestedManyWithoutFieldInput
  }

  export type CategoryCreateOrConnectWithoutDocumentsByTypeInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutDocumentsByTypeInput, CategoryUncheckedCreateWithoutDocumentsByTypeInput>
  }

  export type CategoryCreateWithoutDocumentsByFieldInput = {
    id?: string
    name: string
    slug: string
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    orderIndex?: number
    description?: string | null
    type: string
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: CategoryCreateNestedOneWithoutChildrenInput
    children?: CategoryCreateNestedManyWithoutParentInput
    documentsByType?: DocumentCreateNestedManyWithoutTypeInput
  }

  export type CategoryUncheckedCreateWithoutDocumentsByFieldInput = {
    id?: string
    name: string
    slug: string
    parentId?: string | null
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    orderIndex?: number
    description?: string | null
    type: string
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput
    documentsByType?: DocumentUncheckedCreateNestedManyWithoutTypeInput
  }

  export type CategoryCreateOrConnectWithoutDocumentsByFieldInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutDocumentsByFieldInput, CategoryUncheckedCreateWithoutDocumentsByFieldInput>
  }

  export type CategoryUpsertWithoutDocumentsByTypeInput = {
    update: XOR<CategoryUpdateWithoutDocumentsByTypeInput, CategoryUncheckedUpdateWithoutDocumentsByTypeInput>
    create: XOR<CategoryCreateWithoutDocumentsByTypeInput, CategoryUncheckedCreateWithoutDocumentsByTypeInput>
    where?: CategoryWhereInput
  }

  export type CategoryUpdateToOneWithWhereWithoutDocumentsByTypeInput = {
    where?: CategoryWhereInput
    data: XOR<CategoryUpdateWithoutDocumentsByTypeInput, CategoryUncheckedUpdateWithoutDocumentsByTypeInput>
  }

  export type CategoryUpdateWithoutDocumentsByTypeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: CategoryUpdateOneWithoutChildrenNestedInput
    children?: CategoryUpdateManyWithoutParentNestedInput
    documentsByField?: DocumentUpdateManyWithoutFieldNestedInput
  }

  export type CategoryUncheckedUpdateWithoutDocumentsByTypeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput
    documentsByField?: DocumentUncheckedUpdateManyWithoutFieldNestedInput
  }

  export type CategoryUpsertWithoutDocumentsByFieldInput = {
    update: XOR<CategoryUpdateWithoutDocumentsByFieldInput, CategoryUncheckedUpdateWithoutDocumentsByFieldInput>
    create: XOR<CategoryCreateWithoutDocumentsByFieldInput, CategoryUncheckedCreateWithoutDocumentsByFieldInput>
    where?: CategoryWhereInput
  }

  export type CategoryUpdateToOneWithWhereWithoutDocumentsByFieldInput = {
    where?: CategoryWhereInput
    data: XOR<CategoryUpdateWithoutDocumentsByFieldInput, CategoryUncheckedUpdateWithoutDocumentsByFieldInput>
  }

  export type CategoryUpdateWithoutDocumentsByFieldInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: CategoryUpdateOneWithoutChildrenNestedInput
    children?: CategoryUpdateManyWithoutParentNestedInput
    documentsByType?: DocumentUpdateManyWithoutTypeNestedInput
  }

  export type CategoryUncheckedUpdateWithoutDocumentsByFieldInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput
    documentsByType?: DocumentUncheckedUpdateManyWithoutTypeNestedInput
  }

  export type CategoryCreateManyParentInput = {
    id?: string
    name: string
    slug: string
    lft?: number
    rgt?: number
    depth?: number
    status?: boolean
    orderIndex?: number
    description?: string | null
    type: string
    isGovStandard?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DocumentCreateManyTypeInput = {
    id?: string
    documentNumber: string
    notation?: string | null
    abstract: string
    content?: string | null
    fieldId?: string | null
    issuingAuthorityId?: string | null
    issuerName?: string | null
    signerId?: string | null
    signerName?: string | null
    signerPosition?: string | null
    issueDate?: Date | string | null
    arrivalDate?: Date | string | null
    arrivalNumber?: string | null
    processingDeadline?: Date | string | null
    recipients?: string | null
    urgency?: string
    securityLevel?: string
    status?: string
    isPublic?: boolean
    fileId?: string | null
    signatureValid?: boolean
    pageCount?: number
    attachmentCount?: number
    linkedDocumentId?: string | null
    fiscalYear?: number | null
    transparencyCategory?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DocumentCreateManyFieldInput = {
    id?: string
    documentNumber: string
    notation?: string | null
    abstract: string
    content?: string | null
    typeId?: string | null
    issuingAuthorityId?: string | null
    issuerName?: string | null
    signerId?: string | null
    signerName?: string | null
    signerPosition?: string | null
    issueDate?: Date | string | null
    arrivalDate?: Date | string | null
    arrivalNumber?: string | null
    processingDeadline?: Date | string | null
    recipients?: string | null
    urgency?: string
    securityLevel?: string
    status?: string
    isPublic?: boolean
    fileId?: string | null
    signatureValid?: boolean
    pageCount?: number
    attachmentCount?: number
    linkedDocumentId?: string | null
    fiscalYear?: number | null
    transparencyCategory?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CategoryUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: CategoryUpdateManyWithoutParentNestedInput
    documentsByType?: DocumentUpdateManyWithoutTypeNestedInput
    documentsByField?: DocumentUpdateManyWithoutFieldNestedInput
  }

  export type CategoryUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput
    documentsByType?: DocumentUncheckedUpdateManyWithoutTypeNestedInput
    documentsByField?: DocumentUncheckedUpdateManyWithoutFieldNestedInput
  }

  export type CategoryUncheckedUpdateManyWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    lft?: IntFieldUpdateOperationsInput | number
    rgt?: IntFieldUpdateOperationsInput | number
    depth?: IntFieldUpdateOperationsInput | number
    status?: BoolFieldUpdateOperationsInput | boolean
    orderIndex?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    isGovStandard?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentUpdateWithoutTypeInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentNumber?: StringFieldUpdateOperationsInput | string
    notation?: NullableStringFieldUpdateOperationsInput | string | null
    abstract?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    issuingAuthorityId?: NullableStringFieldUpdateOperationsInput | string | null
    issuerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerId?: NullableStringFieldUpdateOperationsInput | string | null
    signerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerPosition?: NullableStringFieldUpdateOperationsInput | string | null
    issueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalNumber?: NullableStringFieldUpdateOperationsInput | string | null
    processingDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    recipients?: NullableStringFieldUpdateOperationsInput | string | null
    urgency?: StringFieldUpdateOperationsInput | string
    securityLevel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    pageCount?: IntFieldUpdateOperationsInput | number
    attachmentCount?: IntFieldUpdateOperationsInput | number
    linkedDocumentId?: NullableStringFieldUpdateOperationsInput | string | null
    fiscalYear?: NullableIntFieldUpdateOperationsInput | number | null
    transparencyCategory?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    field?: CategoryUpdateOneWithoutDocumentsByFieldNestedInput
  }

  export type DocumentUncheckedUpdateWithoutTypeInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentNumber?: StringFieldUpdateOperationsInput | string
    notation?: NullableStringFieldUpdateOperationsInput | string | null
    abstract?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fieldId?: NullableStringFieldUpdateOperationsInput | string | null
    issuingAuthorityId?: NullableStringFieldUpdateOperationsInput | string | null
    issuerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerId?: NullableStringFieldUpdateOperationsInput | string | null
    signerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerPosition?: NullableStringFieldUpdateOperationsInput | string | null
    issueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalNumber?: NullableStringFieldUpdateOperationsInput | string | null
    processingDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    recipients?: NullableStringFieldUpdateOperationsInput | string | null
    urgency?: StringFieldUpdateOperationsInput | string
    securityLevel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    pageCount?: IntFieldUpdateOperationsInput | number
    attachmentCount?: IntFieldUpdateOperationsInput | number
    linkedDocumentId?: NullableStringFieldUpdateOperationsInput | string | null
    fiscalYear?: NullableIntFieldUpdateOperationsInput | number | null
    transparencyCategory?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentUncheckedUpdateManyWithoutTypeInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentNumber?: StringFieldUpdateOperationsInput | string
    notation?: NullableStringFieldUpdateOperationsInput | string | null
    abstract?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fieldId?: NullableStringFieldUpdateOperationsInput | string | null
    issuingAuthorityId?: NullableStringFieldUpdateOperationsInput | string | null
    issuerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerId?: NullableStringFieldUpdateOperationsInput | string | null
    signerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerPosition?: NullableStringFieldUpdateOperationsInput | string | null
    issueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalNumber?: NullableStringFieldUpdateOperationsInput | string | null
    processingDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    recipients?: NullableStringFieldUpdateOperationsInput | string | null
    urgency?: StringFieldUpdateOperationsInput | string
    securityLevel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    pageCount?: IntFieldUpdateOperationsInput | number
    attachmentCount?: IntFieldUpdateOperationsInput | number
    linkedDocumentId?: NullableStringFieldUpdateOperationsInput | string | null
    fiscalYear?: NullableIntFieldUpdateOperationsInput | number | null
    transparencyCategory?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentUpdateWithoutFieldInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentNumber?: StringFieldUpdateOperationsInput | string
    notation?: NullableStringFieldUpdateOperationsInput | string | null
    abstract?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    issuingAuthorityId?: NullableStringFieldUpdateOperationsInput | string | null
    issuerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerId?: NullableStringFieldUpdateOperationsInput | string | null
    signerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerPosition?: NullableStringFieldUpdateOperationsInput | string | null
    issueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalNumber?: NullableStringFieldUpdateOperationsInput | string | null
    processingDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    recipients?: NullableStringFieldUpdateOperationsInput | string | null
    urgency?: StringFieldUpdateOperationsInput | string
    securityLevel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    pageCount?: IntFieldUpdateOperationsInput | number
    attachmentCount?: IntFieldUpdateOperationsInput | number
    linkedDocumentId?: NullableStringFieldUpdateOperationsInput | string | null
    fiscalYear?: NullableIntFieldUpdateOperationsInput | number | null
    transparencyCategory?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: CategoryUpdateOneWithoutDocumentsByTypeNestedInput
  }

  export type DocumentUncheckedUpdateWithoutFieldInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentNumber?: StringFieldUpdateOperationsInput | string
    notation?: NullableStringFieldUpdateOperationsInput | string | null
    abstract?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    typeId?: NullableStringFieldUpdateOperationsInput | string | null
    issuingAuthorityId?: NullableStringFieldUpdateOperationsInput | string | null
    issuerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerId?: NullableStringFieldUpdateOperationsInput | string | null
    signerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerPosition?: NullableStringFieldUpdateOperationsInput | string | null
    issueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalNumber?: NullableStringFieldUpdateOperationsInput | string | null
    processingDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    recipients?: NullableStringFieldUpdateOperationsInput | string | null
    urgency?: StringFieldUpdateOperationsInput | string
    securityLevel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    pageCount?: IntFieldUpdateOperationsInput | number
    attachmentCount?: IntFieldUpdateOperationsInput | number
    linkedDocumentId?: NullableStringFieldUpdateOperationsInput | string | null
    fiscalYear?: NullableIntFieldUpdateOperationsInput | number | null
    transparencyCategory?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentUncheckedUpdateManyWithoutFieldInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentNumber?: StringFieldUpdateOperationsInput | string
    notation?: NullableStringFieldUpdateOperationsInput | string | null
    abstract?: StringFieldUpdateOperationsInput | string
    content?: NullableStringFieldUpdateOperationsInput | string | null
    typeId?: NullableStringFieldUpdateOperationsInput | string | null
    issuingAuthorityId?: NullableStringFieldUpdateOperationsInput | string | null
    issuerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerId?: NullableStringFieldUpdateOperationsInput | string | null
    signerName?: NullableStringFieldUpdateOperationsInput | string | null
    signerPosition?: NullableStringFieldUpdateOperationsInput | string | null
    issueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    arrivalNumber?: NullableStringFieldUpdateOperationsInput | string | null
    processingDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    recipients?: NullableStringFieldUpdateOperationsInput | string | null
    urgency?: StringFieldUpdateOperationsInput | string
    securityLevel?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    signatureValid?: BoolFieldUpdateOperationsInput | boolean
    pageCount?: IntFieldUpdateOperationsInput | number
    attachmentCount?: IntFieldUpdateOperationsInput | number
    linkedDocumentId?: NullableStringFieldUpdateOperationsInput | string | null
    fiscalYear?: NullableIntFieldUpdateOperationsInput | number | null
    transparencyCategory?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConsultationResponseCreateManyConsultationInput = {
    id?: string
    unitId: string
    unitName?: string | null
    userId?: string | null
    content?: string | null
    fileId?: string | null
    status?: string
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ConsultationResponseUpdateWithoutConsultationInput = {
    id?: StringFieldUpdateOperationsInput | string
    unitId?: StringFieldUpdateOperationsInput | string
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConsultationResponseUncheckedUpdateWithoutConsultationInput = {
    id?: StringFieldUpdateOperationsInput | string
    unitId?: StringFieldUpdateOperationsInput | string
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConsultationResponseUncheckedUpdateManyWithoutConsultationInput = {
    id?: StringFieldUpdateOperationsInput | string
    unitId?: StringFieldUpdateOperationsInput | string
    unitName?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    content?: NullableStringFieldUpdateOperationsInput | string | null
    fileId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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