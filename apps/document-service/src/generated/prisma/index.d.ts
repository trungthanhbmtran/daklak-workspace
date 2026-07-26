
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
 * Model Consultation
 * 
 */
export type Consultation = $Result.DefaultSelection<Prisma.$ConsultationPayload>
/**
 * Model PublicComment
 * 
 */
export type PublicComment = $Result.DefaultSelection<Prisma.$PublicCommentPayload>
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
 * Model DocumentLog
 * 
 */
export type DocumentLog = $Result.DefaultSelection<Prisma.$DocumentLogPayload>
/**
 * Model Minutes
 * 
 */
export type Minutes = $Result.DefaultSelection<Prisma.$MinutesPayload>
/**
 * Model AdministrativeProcedure
 * 
 */
export type AdministrativeProcedure = $Result.DefaultSelection<Prisma.$AdministrativeProcedurePayload>
/**
 * Model OneStopDossier
 * 
 */
export type OneStopDossier = $Result.DefaultSelection<Prisma.$OneStopDossierPayload>
/**
 * Model DossierComponent
 * 
 */
export type DossierComponent = $Result.DefaultSelection<Prisma.$DossierComponentPayload>
/**
 * Model DocumentCabinet
 * 
 */
export type DocumentCabinet = $Result.DefaultSelection<Prisma.$DocumentCabinetPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Consultations
 * const consultations = await prisma.consultation.findMany()
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
   * // Fetch zero or more Consultations
   * const consultations = await prisma.consultation.findMany()
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
   * `prisma.consultation`: Exposes CRUD operations for the **Consultation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Consultations
    * const consultations = await prisma.consultation.findMany()
    * ```
    */
  get consultation(): Prisma.ConsultationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.publicComment`: Exposes CRUD operations for the **PublicComment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PublicComments
    * const publicComments = await prisma.publicComment.findMany()
    * ```
    */
  get publicComment(): Prisma.PublicCommentDelegate<ExtArgs, ClientOptions>;

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
   * `prisma.documentLog`: Exposes CRUD operations for the **DocumentLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DocumentLogs
    * const documentLogs = await prisma.documentLog.findMany()
    * ```
    */
  get documentLog(): Prisma.DocumentLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.minutes`: Exposes CRUD operations for the **Minutes** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Minutes
    * const minutes = await prisma.minutes.findMany()
    * ```
    */
  get minutes(): Prisma.MinutesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.administrativeProcedure`: Exposes CRUD operations for the **AdministrativeProcedure** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AdministrativeProcedures
    * const administrativeProcedures = await prisma.administrativeProcedure.findMany()
    * ```
    */
  get administrativeProcedure(): Prisma.AdministrativeProcedureDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.oneStopDossier`: Exposes CRUD operations for the **OneStopDossier** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OneStopDossiers
    * const oneStopDossiers = await prisma.oneStopDossier.findMany()
    * ```
    */
  get oneStopDossier(): Prisma.OneStopDossierDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dossierComponent`: Exposes CRUD operations for the **DossierComponent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DossierComponents
    * const dossierComponents = await prisma.dossierComponent.findMany()
    * ```
    */
  get dossierComponent(): Prisma.DossierComponentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.documentCabinet`: Exposes CRUD operations for the **DocumentCabinet** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DocumentCabinets
    * const documentCabinets = await prisma.documentCabinet.findMany()
    * ```
    */
  get documentCabinet(): Prisma.DocumentCabinetDelegate<ExtArgs, ClientOptions>;
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
    Consultation: 'Consultation',
    PublicComment: 'PublicComment',
    ConsultationResponse: 'ConsultationResponse',
    Document: 'Document',
    DocumentLog: 'DocumentLog',
    Minutes: 'Minutes',
    AdministrativeProcedure: 'AdministrativeProcedure',
    OneStopDossier: 'OneStopDossier',
    DossierComponent: 'DossierComponent',
    DocumentCabinet: 'DocumentCabinet'
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
      modelProps: "consultation" | "publicComment" | "consultationResponse" | "document" | "documentLog" | "minutes" | "administrativeProcedure" | "oneStopDossier" | "dossierComponent" | "documentCabinet"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
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
      PublicComment: {
        payload: Prisma.$PublicCommentPayload<ExtArgs>
        fields: Prisma.PublicCommentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PublicCommentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PublicCommentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PublicCommentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PublicCommentPayload>
          }
          findFirst: {
            args: Prisma.PublicCommentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PublicCommentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PublicCommentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PublicCommentPayload>
          }
          findMany: {
            args: Prisma.PublicCommentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PublicCommentPayload>[]
          }
          create: {
            args: Prisma.PublicCommentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PublicCommentPayload>
          }
          createMany: {
            args: Prisma.PublicCommentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.PublicCommentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PublicCommentPayload>
          }
          update: {
            args: Prisma.PublicCommentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PublicCommentPayload>
          }
          deleteMany: {
            args: Prisma.PublicCommentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PublicCommentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PublicCommentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PublicCommentPayload>
          }
          aggregate: {
            args: Prisma.PublicCommentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePublicComment>
          }
          groupBy: {
            args: Prisma.PublicCommentGroupByArgs<ExtArgs>
            result: $Utils.Optional<PublicCommentGroupByOutputType>[]
          }
          count: {
            args: Prisma.PublicCommentCountArgs<ExtArgs>
            result: $Utils.Optional<PublicCommentCountAggregateOutputType> | number
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
      DocumentLog: {
        payload: Prisma.$DocumentLogPayload<ExtArgs>
        fields: Prisma.DocumentLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DocumentLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DocumentLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentLogPayload>
          }
          findFirst: {
            args: Prisma.DocumentLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DocumentLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentLogPayload>
          }
          findMany: {
            args: Prisma.DocumentLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentLogPayload>[]
          }
          create: {
            args: Prisma.DocumentLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentLogPayload>
          }
          createMany: {
            args: Prisma.DocumentLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.DocumentLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentLogPayload>
          }
          update: {
            args: Prisma.DocumentLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentLogPayload>
          }
          deleteMany: {
            args: Prisma.DocumentLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DocumentLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DocumentLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentLogPayload>
          }
          aggregate: {
            args: Prisma.DocumentLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDocumentLog>
          }
          groupBy: {
            args: Prisma.DocumentLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<DocumentLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.DocumentLogCountArgs<ExtArgs>
            result: $Utils.Optional<DocumentLogCountAggregateOutputType> | number
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
      AdministrativeProcedure: {
        payload: Prisma.$AdministrativeProcedurePayload<ExtArgs>
        fields: Prisma.AdministrativeProcedureFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AdministrativeProcedureFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdministrativeProcedurePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AdministrativeProcedureFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdministrativeProcedurePayload>
          }
          findFirst: {
            args: Prisma.AdministrativeProcedureFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdministrativeProcedurePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AdministrativeProcedureFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdministrativeProcedurePayload>
          }
          findMany: {
            args: Prisma.AdministrativeProcedureFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdministrativeProcedurePayload>[]
          }
          create: {
            args: Prisma.AdministrativeProcedureCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdministrativeProcedurePayload>
          }
          createMany: {
            args: Prisma.AdministrativeProcedureCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.AdministrativeProcedureDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdministrativeProcedurePayload>
          }
          update: {
            args: Prisma.AdministrativeProcedureUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdministrativeProcedurePayload>
          }
          deleteMany: {
            args: Prisma.AdministrativeProcedureDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AdministrativeProcedureUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AdministrativeProcedureUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdministrativeProcedurePayload>
          }
          aggregate: {
            args: Prisma.AdministrativeProcedureAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAdministrativeProcedure>
          }
          groupBy: {
            args: Prisma.AdministrativeProcedureGroupByArgs<ExtArgs>
            result: $Utils.Optional<AdministrativeProcedureGroupByOutputType>[]
          }
          count: {
            args: Prisma.AdministrativeProcedureCountArgs<ExtArgs>
            result: $Utils.Optional<AdministrativeProcedureCountAggregateOutputType> | number
          }
        }
      }
      OneStopDossier: {
        payload: Prisma.$OneStopDossierPayload<ExtArgs>
        fields: Prisma.OneStopDossierFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OneStopDossierFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneStopDossierPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OneStopDossierFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneStopDossierPayload>
          }
          findFirst: {
            args: Prisma.OneStopDossierFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneStopDossierPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OneStopDossierFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneStopDossierPayload>
          }
          findMany: {
            args: Prisma.OneStopDossierFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneStopDossierPayload>[]
          }
          create: {
            args: Prisma.OneStopDossierCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneStopDossierPayload>
          }
          createMany: {
            args: Prisma.OneStopDossierCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.OneStopDossierDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneStopDossierPayload>
          }
          update: {
            args: Prisma.OneStopDossierUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneStopDossierPayload>
          }
          deleteMany: {
            args: Prisma.OneStopDossierDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OneStopDossierUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OneStopDossierUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneStopDossierPayload>
          }
          aggregate: {
            args: Prisma.OneStopDossierAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOneStopDossier>
          }
          groupBy: {
            args: Prisma.OneStopDossierGroupByArgs<ExtArgs>
            result: $Utils.Optional<OneStopDossierGroupByOutputType>[]
          }
          count: {
            args: Prisma.OneStopDossierCountArgs<ExtArgs>
            result: $Utils.Optional<OneStopDossierCountAggregateOutputType> | number
          }
        }
      }
      DossierComponent: {
        payload: Prisma.$DossierComponentPayload<ExtArgs>
        fields: Prisma.DossierComponentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DossierComponentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DossierComponentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DossierComponentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DossierComponentPayload>
          }
          findFirst: {
            args: Prisma.DossierComponentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DossierComponentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DossierComponentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DossierComponentPayload>
          }
          findMany: {
            args: Prisma.DossierComponentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DossierComponentPayload>[]
          }
          create: {
            args: Prisma.DossierComponentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DossierComponentPayload>
          }
          createMany: {
            args: Prisma.DossierComponentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.DossierComponentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DossierComponentPayload>
          }
          update: {
            args: Prisma.DossierComponentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DossierComponentPayload>
          }
          deleteMany: {
            args: Prisma.DossierComponentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DossierComponentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DossierComponentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DossierComponentPayload>
          }
          aggregate: {
            args: Prisma.DossierComponentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDossierComponent>
          }
          groupBy: {
            args: Prisma.DossierComponentGroupByArgs<ExtArgs>
            result: $Utils.Optional<DossierComponentGroupByOutputType>[]
          }
          count: {
            args: Prisma.DossierComponentCountArgs<ExtArgs>
            result: $Utils.Optional<DossierComponentCountAggregateOutputType> | number
          }
        }
      }
      DocumentCabinet: {
        payload: Prisma.$DocumentCabinetPayload<ExtArgs>
        fields: Prisma.DocumentCabinetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DocumentCabinetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentCabinetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DocumentCabinetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentCabinetPayload>
          }
          findFirst: {
            args: Prisma.DocumentCabinetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentCabinetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DocumentCabinetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentCabinetPayload>
          }
          findMany: {
            args: Prisma.DocumentCabinetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentCabinetPayload>[]
          }
          create: {
            args: Prisma.DocumentCabinetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentCabinetPayload>
          }
          createMany: {
            args: Prisma.DocumentCabinetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.DocumentCabinetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentCabinetPayload>
          }
          update: {
            args: Prisma.DocumentCabinetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentCabinetPayload>
          }
          deleteMany: {
            args: Prisma.DocumentCabinetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DocumentCabinetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DocumentCabinetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentCabinetPayload>
          }
          aggregate: {
            args: Prisma.DocumentCabinetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDocumentCabinet>
          }
          groupBy: {
            args: Prisma.DocumentCabinetGroupByArgs<ExtArgs>
            result: $Utils.Optional<DocumentCabinetGroupByOutputType>[]
          }
          count: {
            args: Prisma.DocumentCabinetCountArgs<ExtArgs>
            result: $Utils.Optional<DocumentCabinetCountAggregateOutputType> | number
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
    consultation?: ConsultationOmit
    publicComment?: PublicCommentOmit
    consultationResponse?: ConsultationResponseOmit
    document?: DocumentOmit
    documentLog?: DocumentLogOmit
    minutes?: MinutesOmit
    administrativeProcedure?: AdministrativeProcedureOmit
    oneStopDossier?: OneStopDossierOmit
    dossierComponent?: DossierComponentOmit
    documentCabinet?: DocumentCabinetOmit
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
   * Count Type ConsultationCountOutputType
   */

  export type ConsultationCountOutputType = {
    responses: number
    publicComments: number
  }

  export type ConsultationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    responses?: boolean | ConsultationCountOutputTypeCountResponsesArgs
    publicComments?: boolean | ConsultationCountOutputTypeCountPublicCommentsArgs
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
   * ConsultationCountOutputType without action
   */
  export type ConsultationCountOutputTypeCountPublicCommentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PublicCommentWhereInput
  }


  /**
   * Models
   */

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
    publicComments?: boolean | Consultation$publicCommentsArgs<ExtArgs>
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
    publicComments?: boolean | Consultation$publicCommentsArgs<ExtArgs>
    _count?: boolean | ConsultationCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $ConsultationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Consultation"
    objects: {
      responses: Prisma.$ConsultationResponsePayload<ExtArgs>[]
      publicComments: Prisma.$PublicCommentPayload<ExtArgs>[]
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
    publicComments<T extends Consultation$publicCommentsArgs<ExtArgs> = {}>(args?: Subset<T, Consultation$publicCommentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PublicCommentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Consultation.publicComments
   */
  export type Consultation$publicCommentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PublicComment
     */
    select?: PublicCommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PublicComment
     */
    omit?: PublicCommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PublicCommentInclude<ExtArgs> | null
    where?: PublicCommentWhereInput
    orderBy?: PublicCommentOrderByWithRelationInput | PublicCommentOrderByWithRelationInput[]
    cursor?: PublicCommentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PublicCommentScalarFieldEnum | PublicCommentScalarFieldEnum[]
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
   * Model PublicComment
   */

  export type AggregatePublicComment = {
    _count: PublicCommentCountAggregateOutputType | null
    _min: PublicCommentMinAggregateOutputType | null
    _max: PublicCommentMaxAggregateOutputType | null
  }

  export type PublicCommentMinAggregateOutputType = {
    id: string | null
    consultationId: string | null
    fullName: string | null
    email: string | null
    phoneNumber: string | null
    content: string | null
    status: string | null
    moderatedBy: string | null
    moderatedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PublicCommentMaxAggregateOutputType = {
    id: string | null
    consultationId: string | null
    fullName: string | null
    email: string | null
    phoneNumber: string | null
    content: string | null
    status: string | null
    moderatedBy: string | null
    moderatedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PublicCommentCountAggregateOutputType = {
    id: number
    consultationId: number
    fullName: number
    email: number
    phoneNumber: number
    content: number
    status: number
    moderatedBy: number
    moderatedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PublicCommentMinAggregateInputType = {
    id?: true
    consultationId?: true
    fullName?: true
    email?: true
    phoneNumber?: true
    content?: true
    status?: true
    moderatedBy?: true
    moderatedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PublicCommentMaxAggregateInputType = {
    id?: true
    consultationId?: true
    fullName?: true
    email?: true
    phoneNumber?: true
    content?: true
    status?: true
    moderatedBy?: true
    moderatedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PublicCommentCountAggregateInputType = {
    id?: true
    consultationId?: true
    fullName?: true
    email?: true
    phoneNumber?: true
    content?: true
    status?: true
    moderatedBy?: true
    moderatedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PublicCommentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PublicComment to aggregate.
     */
    where?: PublicCommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PublicComments to fetch.
     */
    orderBy?: PublicCommentOrderByWithRelationInput | PublicCommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PublicCommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PublicComments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PublicComments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PublicComments
    **/
    _count?: true | PublicCommentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PublicCommentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PublicCommentMaxAggregateInputType
  }

  export type GetPublicCommentAggregateType<T extends PublicCommentAggregateArgs> = {
        [P in keyof T & keyof AggregatePublicComment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePublicComment[P]>
      : GetScalarType<T[P], AggregatePublicComment[P]>
  }




  export type PublicCommentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PublicCommentWhereInput
    orderBy?: PublicCommentOrderByWithAggregationInput | PublicCommentOrderByWithAggregationInput[]
    by: PublicCommentScalarFieldEnum[] | PublicCommentScalarFieldEnum
    having?: PublicCommentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PublicCommentCountAggregateInputType | true
    _min?: PublicCommentMinAggregateInputType
    _max?: PublicCommentMaxAggregateInputType
  }

  export type PublicCommentGroupByOutputType = {
    id: string
    consultationId: string
    fullName: string
    email: string | null
    phoneNumber: string | null
    content: string
    status: string
    moderatedBy: string | null
    moderatedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: PublicCommentCountAggregateOutputType | null
    _min: PublicCommentMinAggregateOutputType | null
    _max: PublicCommentMaxAggregateOutputType | null
  }

  type GetPublicCommentGroupByPayload<T extends PublicCommentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PublicCommentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PublicCommentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PublicCommentGroupByOutputType[P]>
            : GetScalarType<T[P], PublicCommentGroupByOutputType[P]>
        }
      >
    >


  export type PublicCommentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    consultationId?: boolean
    fullName?: boolean
    email?: boolean
    phoneNumber?: boolean
    content?: boolean
    status?: boolean
    moderatedBy?: boolean
    moderatedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    consultation?: boolean | ConsultationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["publicComment"]>



  export type PublicCommentSelectScalar = {
    id?: boolean
    consultationId?: boolean
    fullName?: boolean
    email?: boolean
    phoneNumber?: boolean
    content?: boolean
    status?: boolean
    moderatedBy?: boolean
    moderatedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PublicCommentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "consultationId" | "fullName" | "email" | "phoneNumber" | "content" | "status" | "moderatedBy" | "moderatedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["publicComment"]>
  export type PublicCommentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    consultation?: boolean | ConsultationDefaultArgs<ExtArgs>
  }

  export type $PublicCommentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PublicComment"
    objects: {
      consultation: Prisma.$ConsultationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      consultationId: string
      fullName: string
      email: string | null
      phoneNumber: string | null
      content: string
      status: string
      moderatedBy: string | null
      moderatedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["publicComment"]>
    composites: {}
  }

  type PublicCommentGetPayload<S extends boolean | null | undefined | PublicCommentDefaultArgs> = $Result.GetResult<Prisma.$PublicCommentPayload, S>

  type PublicCommentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PublicCommentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PublicCommentCountAggregateInputType | true
    }

  export interface PublicCommentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PublicComment'], meta: { name: 'PublicComment' } }
    /**
     * Find zero or one PublicComment that matches the filter.
     * @param {PublicCommentFindUniqueArgs} args - Arguments to find a PublicComment
     * @example
     * // Get one PublicComment
     * const publicComment = await prisma.publicComment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PublicCommentFindUniqueArgs>(args: SelectSubset<T, PublicCommentFindUniqueArgs<ExtArgs>>): Prisma__PublicCommentClient<$Result.GetResult<Prisma.$PublicCommentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PublicComment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PublicCommentFindUniqueOrThrowArgs} args - Arguments to find a PublicComment
     * @example
     * // Get one PublicComment
     * const publicComment = await prisma.publicComment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PublicCommentFindUniqueOrThrowArgs>(args: SelectSubset<T, PublicCommentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PublicCommentClient<$Result.GetResult<Prisma.$PublicCommentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PublicComment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PublicCommentFindFirstArgs} args - Arguments to find a PublicComment
     * @example
     * // Get one PublicComment
     * const publicComment = await prisma.publicComment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PublicCommentFindFirstArgs>(args?: SelectSubset<T, PublicCommentFindFirstArgs<ExtArgs>>): Prisma__PublicCommentClient<$Result.GetResult<Prisma.$PublicCommentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PublicComment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PublicCommentFindFirstOrThrowArgs} args - Arguments to find a PublicComment
     * @example
     * // Get one PublicComment
     * const publicComment = await prisma.publicComment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PublicCommentFindFirstOrThrowArgs>(args?: SelectSubset<T, PublicCommentFindFirstOrThrowArgs<ExtArgs>>): Prisma__PublicCommentClient<$Result.GetResult<Prisma.$PublicCommentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PublicComments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PublicCommentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PublicComments
     * const publicComments = await prisma.publicComment.findMany()
     * 
     * // Get first 10 PublicComments
     * const publicComments = await prisma.publicComment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const publicCommentWithIdOnly = await prisma.publicComment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PublicCommentFindManyArgs>(args?: SelectSubset<T, PublicCommentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PublicCommentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PublicComment.
     * @param {PublicCommentCreateArgs} args - Arguments to create a PublicComment.
     * @example
     * // Create one PublicComment
     * const PublicComment = await prisma.publicComment.create({
     *   data: {
     *     // ... data to create a PublicComment
     *   }
     * })
     * 
     */
    create<T extends PublicCommentCreateArgs>(args: SelectSubset<T, PublicCommentCreateArgs<ExtArgs>>): Prisma__PublicCommentClient<$Result.GetResult<Prisma.$PublicCommentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PublicComments.
     * @param {PublicCommentCreateManyArgs} args - Arguments to create many PublicComments.
     * @example
     * // Create many PublicComments
     * const publicComment = await prisma.publicComment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PublicCommentCreateManyArgs>(args?: SelectSubset<T, PublicCommentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a PublicComment.
     * @param {PublicCommentDeleteArgs} args - Arguments to delete one PublicComment.
     * @example
     * // Delete one PublicComment
     * const PublicComment = await prisma.publicComment.delete({
     *   where: {
     *     // ... filter to delete one PublicComment
     *   }
     * })
     * 
     */
    delete<T extends PublicCommentDeleteArgs>(args: SelectSubset<T, PublicCommentDeleteArgs<ExtArgs>>): Prisma__PublicCommentClient<$Result.GetResult<Prisma.$PublicCommentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PublicComment.
     * @param {PublicCommentUpdateArgs} args - Arguments to update one PublicComment.
     * @example
     * // Update one PublicComment
     * const publicComment = await prisma.publicComment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PublicCommentUpdateArgs>(args: SelectSubset<T, PublicCommentUpdateArgs<ExtArgs>>): Prisma__PublicCommentClient<$Result.GetResult<Prisma.$PublicCommentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PublicComments.
     * @param {PublicCommentDeleteManyArgs} args - Arguments to filter PublicComments to delete.
     * @example
     * // Delete a few PublicComments
     * const { count } = await prisma.publicComment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PublicCommentDeleteManyArgs>(args?: SelectSubset<T, PublicCommentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PublicComments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PublicCommentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PublicComments
     * const publicComment = await prisma.publicComment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PublicCommentUpdateManyArgs>(args: SelectSubset<T, PublicCommentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PublicComment.
     * @param {PublicCommentUpsertArgs} args - Arguments to update or create a PublicComment.
     * @example
     * // Update or create a PublicComment
     * const publicComment = await prisma.publicComment.upsert({
     *   create: {
     *     // ... data to create a PublicComment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PublicComment we want to update
     *   }
     * })
     */
    upsert<T extends PublicCommentUpsertArgs>(args: SelectSubset<T, PublicCommentUpsertArgs<ExtArgs>>): Prisma__PublicCommentClient<$Result.GetResult<Prisma.$PublicCommentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PublicComments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PublicCommentCountArgs} args - Arguments to filter PublicComments to count.
     * @example
     * // Count the number of PublicComments
     * const count = await prisma.publicComment.count({
     *   where: {
     *     // ... the filter for the PublicComments we want to count
     *   }
     * })
    **/
    count<T extends PublicCommentCountArgs>(
      args?: Subset<T, PublicCommentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PublicCommentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PublicComment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PublicCommentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PublicCommentAggregateArgs>(args: Subset<T, PublicCommentAggregateArgs>): Prisma.PrismaPromise<GetPublicCommentAggregateType<T>>

    /**
     * Group by PublicComment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PublicCommentGroupByArgs} args - Group by arguments.
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
      T extends PublicCommentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PublicCommentGroupByArgs['orderBy'] }
        : { orderBy?: PublicCommentGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PublicCommentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPublicCommentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PublicComment model
   */
  readonly fields: PublicCommentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PublicComment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PublicCommentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the PublicComment model
   */
  interface PublicCommentFieldRefs {
    readonly id: FieldRef<"PublicComment", 'String'>
    readonly consultationId: FieldRef<"PublicComment", 'String'>
    readonly fullName: FieldRef<"PublicComment", 'String'>
    readonly email: FieldRef<"PublicComment", 'String'>
    readonly phoneNumber: FieldRef<"PublicComment", 'String'>
    readonly content: FieldRef<"PublicComment", 'String'>
    readonly status: FieldRef<"PublicComment", 'String'>
    readonly moderatedBy: FieldRef<"PublicComment", 'String'>
    readonly moderatedAt: FieldRef<"PublicComment", 'DateTime'>
    readonly createdAt: FieldRef<"PublicComment", 'DateTime'>
    readonly updatedAt: FieldRef<"PublicComment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PublicComment findUnique
   */
  export type PublicCommentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PublicComment
     */
    select?: PublicCommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PublicComment
     */
    omit?: PublicCommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PublicCommentInclude<ExtArgs> | null
    /**
     * Filter, which PublicComment to fetch.
     */
    where: PublicCommentWhereUniqueInput
  }

  /**
   * PublicComment findUniqueOrThrow
   */
  export type PublicCommentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PublicComment
     */
    select?: PublicCommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PublicComment
     */
    omit?: PublicCommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PublicCommentInclude<ExtArgs> | null
    /**
     * Filter, which PublicComment to fetch.
     */
    where: PublicCommentWhereUniqueInput
  }

  /**
   * PublicComment findFirst
   */
  export type PublicCommentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PublicComment
     */
    select?: PublicCommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PublicComment
     */
    omit?: PublicCommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PublicCommentInclude<ExtArgs> | null
    /**
     * Filter, which PublicComment to fetch.
     */
    where?: PublicCommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PublicComments to fetch.
     */
    orderBy?: PublicCommentOrderByWithRelationInput | PublicCommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PublicComments.
     */
    cursor?: PublicCommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PublicComments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PublicComments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PublicComments.
     */
    distinct?: PublicCommentScalarFieldEnum | PublicCommentScalarFieldEnum[]
  }

  /**
   * PublicComment findFirstOrThrow
   */
  export type PublicCommentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PublicComment
     */
    select?: PublicCommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PublicComment
     */
    omit?: PublicCommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PublicCommentInclude<ExtArgs> | null
    /**
     * Filter, which PublicComment to fetch.
     */
    where?: PublicCommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PublicComments to fetch.
     */
    orderBy?: PublicCommentOrderByWithRelationInput | PublicCommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PublicComments.
     */
    cursor?: PublicCommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PublicComments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PublicComments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PublicComments.
     */
    distinct?: PublicCommentScalarFieldEnum | PublicCommentScalarFieldEnum[]
  }

  /**
   * PublicComment findMany
   */
  export type PublicCommentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PublicComment
     */
    select?: PublicCommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PublicComment
     */
    omit?: PublicCommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PublicCommentInclude<ExtArgs> | null
    /**
     * Filter, which PublicComments to fetch.
     */
    where?: PublicCommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PublicComments to fetch.
     */
    orderBy?: PublicCommentOrderByWithRelationInput | PublicCommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PublicComments.
     */
    cursor?: PublicCommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PublicComments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PublicComments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PublicComments.
     */
    distinct?: PublicCommentScalarFieldEnum | PublicCommentScalarFieldEnum[]
  }

  /**
   * PublicComment create
   */
  export type PublicCommentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PublicComment
     */
    select?: PublicCommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PublicComment
     */
    omit?: PublicCommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PublicCommentInclude<ExtArgs> | null
    /**
     * The data needed to create a PublicComment.
     */
    data: XOR<PublicCommentCreateInput, PublicCommentUncheckedCreateInput>
  }

  /**
   * PublicComment createMany
   */
  export type PublicCommentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PublicComments.
     */
    data: PublicCommentCreateManyInput | PublicCommentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PublicComment update
   */
  export type PublicCommentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PublicComment
     */
    select?: PublicCommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PublicComment
     */
    omit?: PublicCommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PublicCommentInclude<ExtArgs> | null
    /**
     * The data needed to update a PublicComment.
     */
    data: XOR<PublicCommentUpdateInput, PublicCommentUncheckedUpdateInput>
    /**
     * Choose, which PublicComment to update.
     */
    where: PublicCommentWhereUniqueInput
  }

  /**
   * PublicComment updateMany
   */
  export type PublicCommentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PublicComments.
     */
    data: XOR<PublicCommentUpdateManyMutationInput, PublicCommentUncheckedUpdateManyInput>
    /**
     * Filter which PublicComments to update
     */
    where?: PublicCommentWhereInput
    /**
     * Limit how many PublicComments to update.
     */
    limit?: number
  }

  /**
   * PublicComment upsert
   */
  export type PublicCommentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PublicComment
     */
    select?: PublicCommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PublicComment
     */
    omit?: PublicCommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PublicCommentInclude<ExtArgs> | null
    /**
     * The filter to search for the PublicComment to update in case it exists.
     */
    where: PublicCommentWhereUniqueInput
    /**
     * In case the PublicComment found by the `where` argument doesn't exist, create a new PublicComment with this data.
     */
    create: XOR<PublicCommentCreateInput, PublicCommentUncheckedCreateInput>
    /**
     * In case the PublicComment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PublicCommentUpdateInput, PublicCommentUncheckedUpdateInput>
  }

  /**
   * PublicComment delete
   */
  export type PublicCommentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PublicComment
     */
    select?: PublicCommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PublicComment
     */
    omit?: PublicCommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PublicCommentInclude<ExtArgs> | null
    /**
     * Filter which PublicComment to delete.
     */
    where: PublicCommentWhereUniqueInput
  }

  /**
   * PublicComment deleteMany
   */
  export type PublicCommentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PublicComments to delete
     */
    where?: PublicCommentWhereInput
    /**
     * Limit how many PublicComments to delete.
     */
    limit?: number
  }

  /**
   * PublicComment without action
   */
  export type PublicCommentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PublicComment
     */
    select?: PublicCommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PublicComment
     */
    omit?: PublicCommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PublicCommentInclude<ExtArgs> | null
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
    isIncoming: boolean | null
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
    isIncoming: boolean | null
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
    isIncoming: number
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
    isIncoming?: true
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
    isIncoming?: true
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
    isIncoming?: true
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
    isIncoming: boolean
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
    isIncoming?: boolean
    fileId?: boolean
    signatureValid?: boolean
    pageCount?: boolean
    attachmentCount?: boolean
    linkedDocumentId?: boolean
    fiscalYear?: boolean
    transparencyCategory?: boolean
    createdAt?: boolean
    updatedAt?: boolean
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
    isIncoming?: boolean
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

  export type DocumentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "documentNumber" | "notation" | "abstract" | "content" | "typeId" | "fieldId" | "issuingAuthorityId" | "issuerName" | "signerId" | "signerName" | "signerPosition" | "issueDate" | "arrivalDate" | "arrivalNumber" | "processingDeadline" | "recipients" | "urgency" | "securityLevel" | "status" | "isPublic" | "isIncoming" | "fileId" | "signatureValid" | "pageCount" | "attachmentCount" | "linkedDocumentId" | "fiscalYear" | "transparencyCategory" | "createdAt" | "updatedAt", ExtArgs["result"]["document"]>

  export type $DocumentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Document"
    objects: {}
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
      isIncoming: boolean
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
    readonly isIncoming: FieldRef<"Document", 'Boolean'>
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
  }


  /**
   * Model DocumentLog
   */

  export type AggregateDocumentLog = {
    _count: DocumentLogCountAggregateOutputType | null
    _min: DocumentLogMinAggregateOutputType | null
    _max: DocumentLogMaxAggregateOutputType | null
  }

  export type DocumentLogMinAggregateOutputType = {
    id: string | null
    documentId: string | null
    userId: string | null
    userName: string | null
    action: string | null
    note: string | null
    createdAt: Date | null
  }

  export type DocumentLogMaxAggregateOutputType = {
    id: string | null
    documentId: string | null
    userId: string | null
    userName: string | null
    action: string | null
    note: string | null
    createdAt: Date | null
  }

  export type DocumentLogCountAggregateOutputType = {
    id: number
    documentId: number
    userId: number
    userName: number
    action: number
    note: number
    createdAt: number
    _all: number
  }


  export type DocumentLogMinAggregateInputType = {
    id?: true
    documentId?: true
    userId?: true
    userName?: true
    action?: true
    note?: true
    createdAt?: true
  }

  export type DocumentLogMaxAggregateInputType = {
    id?: true
    documentId?: true
    userId?: true
    userName?: true
    action?: true
    note?: true
    createdAt?: true
  }

  export type DocumentLogCountAggregateInputType = {
    id?: true
    documentId?: true
    userId?: true
    userName?: true
    action?: true
    note?: true
    createdAt?: true
    _all?: true
  }

  export type DocumentLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DocumentLog to aggregate.
     */
    where?: DocumentLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentLogs to fetch.
     */
    orderBy?: DocumentLogOrderByWithRelationInput | DocumentLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DocumentLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DocumentLogs
    **/
    _count?: true | DocumentLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DocumentLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DocumentLogMaxAggregateInputType
  }

  export type GetDocumentLogAggregateType<T extends DocumentLogAggregateArgs> = {
        [P in keyof T & keyof AggregateDocumentLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDocumentLog[P]>
      : GetScalarType<T[P], AggregateDocumentLog[P]>
  }




  export type DocumentLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentLogWhereInput
    orderBy?: DocumentLogOrderByWithAggregationInput | DocumentLogOrderByWithAggregationInput[]
    by: DocumentLogScalarFieldEnum[] | DocumentLogScalarFieldEnum
    having?: DocumentLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DocumentLogCountAggregateInputType | true
    _min?: DocumentLogMinAggregateInputType
    _max?: DocumentLogMaxAggregateInputType
  }

  export type DocumentLogGroupByOutputType = {
    id: string
    documentId: string
    userId: string | null
    userName: string | null
    action: string
    note: string | null
    createdAt: Date
    _count: DocumentLogCountAggregateOutputType | null
    _min: DocumentLogMinAggregateOutputType | null
    _max: DocumentLogMaxAggregateOutputType | null
  }

  type GetDocumentLogGroupByPayload<T extends DocumentLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DocumentLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DocumentLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DocumentLogGroupByOutputType[P]>
            : GetScalarType<T[P], DocumentLogGroupByOutputType[P]>
        }
      >
    >


  export type DocumentLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    documentId?: boolean
    userId?: boolean
    userName?: boolean
    action?: boolean
    note?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["documentLog"]>



  export type DocumentLogSelectScalar = {
    id?: boolean
    documentId?: boolean
    userId?: boolean
    userName?: boolean
    action?: boolean
    note?: boolean
    createdAt?: boolean
  }

  export type DocumentLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "documentId" | "userId" | "userName" | "action" | "note" | "createdAt", ExtArgs["result"]["documentLog"]>

  export type $DocumentLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DocumentLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      documentId: string
      userId: string | null
      userName: string | null
      action: string
      note: string | null
      createdAt: Date
    }, ExtArgs["result"]["documentLog"]>
    composites: {}
  }

  type DocumentLogGetPayload<S extends boolean | null | undefined | DocumentLogDefaultArgs> = $Result.GetResult<Prisma.$DocumentLogPayload, S>

  type DocumentLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DocumentLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DocumentLogCountAggregateInputType | true
    }

  export interface DocumentLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DocumentLog'], meta: { name: 'DocumentLog' } }
    /**
     * Find zero or one DocumentLog that matches the filter.
     * @param {DocumentLogFindUniqueArgs} args - Arguments to find a DocumentLog
     * @example
     * // Get one DocumentLog
     * const documentLog = await prisma.documentLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DocumentLogFindUniqueArgs>(args: SelectSubset<T, DocumentLogFindUniqueArgs<ExtArgs>>): Prisma__DocumentLogClient<$Result.GetResult<Prisma.$DocumentLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DocumentLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DocumentLogFindUniqueOrThrowArgs} args - Arguments to find a DocumentLog
     * @example
     * // Get one DocumentLog
     * const documentLog = await prisma.documentLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DocumentLogFindUniqueOrThrowArgs>(args: SelectSubset<T, DocumentLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DocumentLogClient<$Result.GetResult<Prisma.$DocumentLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DocumentLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentLogFindFirstArgs} args - Arguments to find a DocumentLog
     * @example
     * // Get one DocumentLog
     * const documentLog = await prisma.documentLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DocumentLogFindFirstArgs>(args?: SelectSubset<T, DocumentLogFindFirstArgs<ExtArgs>>): Prisma__DocumentLogClient<$Result.GetResult<Prisma.$DocumentLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DocumentLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentLogFindFirstOrThrowArgs} args - Arguments to find a DocumentLog
     * @example
     * // Get one DocumentLog
     * const documentLog = await prisma.documentLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DocumentLogFindFirstOrThrowArgs>(args?: SelectSubset<T, DocumentLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__DocumentLogClient<$Result.GetResult<Prisma.$DocumentLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DocumentLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DocumentLogs
     * const documentLogs = await prisma.documentLog.findMany()
     * 
     * // Get first 10 DocumentLogs
     * const documentLogs = await prisma.documentLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const documentLogWithIdOnly = await prisma.documentLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DocumentLogFindManyArgs>(args?: SelectSubset<T, DocumentLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DocumentLog.
     * @param {DocumentLogCreateArgs} args - Arguments to create a DocumentLog.
     * @example
     * // Create one DocumentLog
     * const DocumentLog = await prisma.documentLog.create({
     *   data: {
     *     // ... data to create a DocumentLog
     *   }
     * })
     * 
     */
    create<T extends DocumentLogCreateArgs>(args: SelectSubset<T, DocumentLogCreateArgs<ExtArgs>>): Prisma__DocumentLogClient<$Result.GetResult<Prisma.$DocumentLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DocumentLogs.
     * @param {DocumentLogCreateManyArgs} args - Arguments to create many DocumentLogs.
     * @example
     * // Create many DocumentLogs
     * const documentLog = await prisma.documentLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DocumentLogCreateManyArgs>(args?: SelectSubset<T, DocumentLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a DocumentLog.
     * @param {DocumentLogDeleteArgs} args - Arguments to delete one DocumentLog.
     * @example
     * // Delete one DocumentLog
     * const DocumentLog = await prisma.documentLog.delete({
     *   where: {
     *     // ... filter to delete one DocumentLog
     *   }
     * })
     * 
     */
    delete<T extends DocumentLogDeleteArgs>(args: SelectSubset<T, DocumentLogDeleteArgs<ExtArgs>>): Prisma__DocumentLogClient<$Result.GetResult<Prisma.$DocumentLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DocumentLog.
     * @param {DocumentLogUpdateArgs} args - Arguments to update one DocumentLog.
     * @example
     * // Update one DocumentLog
     * const documentLog = await prisma.documentLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DocumentLogUpdateArgs>(args: SelectSubset<T, DocumentLogUpdateArgs<ExtArgs>>): Prisma__DocumentLogClient<$Result.GetResult<Prisma.$DocumentLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DocumentLogs.
     * @param {DocumentLogDeleteManyArgs} args - Arguments to filter DocumentLogs to delete.
     * @example
     * // Delete a few DocumentLogs
     * const { count } = await prisma.documentLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DocumentLogDeleteManyArgs>(args?: SelectSubset<T, DocumentLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DocumentLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DocumentLogs
     * const documentLog = await prisma.documentLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DocumentLogUpdateManyArgs>(args: SelectSubset<T, DocumentLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DocumentLog.
     * @param {DocumentLogUpsertArgs} args - Arguments to update or create a DocumentLog.
     * @example
     * // Update or create a DocumentLog
     * const documentLog = await prisma.documentLog.upsert({
     *   create: {
     *     // ... data to create a DocumentLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DocumentLog we want to update
     *   }
     * })
     */
    upsert<T extends DocumentLogUpsertArgs>(args: SelectSubset<T, DocumentLogUpsertArgs<ExtArgs>>): Prisma__DocumentLogClient<$Result.GetResult<Prisma.$DocumentLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DocumentLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentLogCountArgs} args - Arguments to filter DocumentLogs to count.
     * @example
     * // Count the number of DocumentLogs
     * const count = await prisma.documentLog.count({
     *   where: {
     *     // ... the filter for the DocumentLogs we want to count
     *   }
     * })
    **/
    count<T extends DocumentLogCountArgs>(
      args?: Subset<T, DocumentLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DocumentLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DocumentLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DocumentLogAggregateArgs>(args: Subset<T, DocumentLogAggregateArgs>): Prisma.PrismaPromise<GetDocumentLogAggregateType<T>>

    /**
     * Group by DocumentLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentLogGroupByArgs} args - Group by arguments.
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
      T extends DocumentLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DocumentLogGroupByArgs['orderBy'] }
        : { orderBy?: DocumentLogGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DocumentLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDocumentLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DocumentLog model
   */
  readonly fields: DocumentLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DocumentLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DocumentLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the DocumentLog model
   */
  interface DocumentLogFieldRefs {
    readonly id: FieldRef<"DocumentLog", 'String'>
    readonly documentId: FieldRef<"DocumentLog", 'String'>
    readonly userId: FieldRef<"DocumentLog", 'String'>
    readonly userName: FieldRef<"DocumentLog", 'String'>
    readonly action: FieldRef<"DocumentLog", 'String'>
    readonly note: FieldRef<"DocumentLog", 'String'>
    readonly createdAt: FieldRef<"DocumentLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DocumentLog findUnique
   */
  export type DocumentLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentLog
     */
    select?: DocumentLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentLog
     */
    omit?: DocumentLogOmit<ExtArgs> | null
    /**
     * Filter, which DocumentLog to fetch.
     */
    where: DocumentLogWhereUniqueInput
  }

  /**
   * DocumentLog findUniqueOrThrow
   */
  export type DocumentLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentLog
     */
    select?: DocumentLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentLog
     */
    omit?: DocumentLogOmit<ExtArgs> | null
    /**
     * Filter, which DocumentLog to fetch.
     */
    where: DocumentLogWhereUniqueInput
  }

  /**
   * DocumentLog findFirst
   */
  export type DocumentLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentLog
     */
    select?: DocumentLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentLog
     */
    omit?: DocumentLogOmit<ExtArgs> | null
    /**
     * Filter, which DocumentLog to fetch.
     */
    where?: DocumentLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentLogs to fetch.
     */
    orderBy?: DocumentLogOrderByWithRelationInput | DocumentLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DocumentLogs.
     */
    cursor?: DocumentLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DocumentLogs.
     */
    distinct?: DocumentLogScalarFieldEnum | DocumentLogScalarFieldEnum[]
  }

  /**
   * DocumentLog findFirstOrThrow
   */
  export type DocumentLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentLog
     */
    select?: DocumentLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentLog
     */
    omit?: DocumentLogOmit<ExtArgs> | null
    /**
     * Filter, which DocumentLog to fetch.
     */
    where?: DocumentLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentLogs to fetch.
     */
    orderBy?: DocumentLogOrderByWithRelationInput | DocumentLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DocumentLogs.
     */
    cursor?: DocumentLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DocumentLogs.
     */
    distinct?: DocumentLogScalarFieldEnum | DocumentLogScalarFieldEnum[]
  }

  /**
   * DocumentLog findMany
   */
  export type DocumentLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentLog
     */
    select?: DocumentLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentLog
     */
    omit?: DocumentLogOmit<ExtArgs> | null
    /**
     * Filter, which DocumentLogs to fetch.
     */
    where?: DocumentLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentLogs to fetch.
     */
    orderBy?: DocumentLogOrderByWithRelationInput | DocumentLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DocumentLogs.
     */
    cursor?: DocumentLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DocumentLogs.
     */
    distinct?: DocumentLogScalarFieldEnum | DocumentLogScalarFieldEnum[]
  }

  /**
   * DocumentLog create
   */
  export type DocumentLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentLog
     */
    select?: DocumentLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentLog
     */
    omit?: DocumentLogOmit<ExtArgs> | null
    /**
     * The data needed to create a DocumentLog.
     */
    data: XOR<DocumentLogCreateInput, DocumentLogUncheckedCreateInput>
  }

  /**
   * DocumentLog createMany
   */
  export type DocumentLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DocumentLogs.
     */
    data: DocumentLogCreateManyInput | DocumentLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DocumentLog update
   */
  export type DocumentLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentLog
     */
    select?: DocumentLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentLog
     */
    omit?: DocumentLogOmit<ExtArgs> | null
    /**
     * The data needed to update a DocumentLog.
     */
    data: XOR<DocumentLogUpdateInput, DocumentLogUncheckedUpdateInput>
    /**
     * Choose, which DocumentLog to update.
     */
    where: DocumentLogWhereUniqueInput
  }

  /**
   * DocumentLog updateMany
   */
  export type DocumentLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DocumentLogs.
     */
    data: XOR<DocumentLogUpdateManyMutationInput, DocumentLogUncheckedUpdateManyInput>
    /**
     * Filter which DocumentLogs to update
     */
    where?: DocumentLogWhereInput
    /**
     * Limit how many DocumentLogs to update.
     */
    limit?: number
  }

  /**
   * DocumentLog upsert
   */
  export type DocumentLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentLog
     */
    select?: DocumentLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentLog
     */
    omit?: DocumentLogOmit<ExtArgs> | null
    /**
     * The filter to search for the DocumentLog to update in case it exists.
     */
    where: DocumentLogWhereUniqueInput
    /**
     * In case the DocumentLog found by the `where` argument doesn't exist, create a new DocumentLog with this data.
     */
    create: XOR<DocumentLogCreateInput, DocumentLogUncheckedCreateInput>
    /**
     * In case the DocumentLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DocumentLogUpdateInput, DocumentLogUncheckedUpdateInput>
  }

  /**
   * DocumentLog delete
   */
  export type DocumentLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentLog
     */
    select?: DocumentLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentLog
     */
    omit?: DocumentLogOmit<ExtArgs> | null
    /**
     * Filter which DocumentLog to delete.
     */
    where: DocumentLogWhereUniqueInput
  }

  /**
   * DocumentLog deleteMany
   */
  export type DocumentLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DocumentLogs to delete
     */
    where?: DocumentLogWhereInput
    /**
     * Limit how many DocumentLogs to delete.
     */
    limit?: number
  }

  /**
   * DocumentLog without action
   */
  export type DocumentLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentLog
     */
    select?: DocumentLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentLog
     */
    omit?: DocumentLogOmit<ExtArgs> | null
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
   * Model AdministrativeProcedure
   */

  export type AggregateAdministrativeProcedure = {
    _count: AdministrativeProcedureCountAggregateOutputType | null
    _min: AdministrativeProcedureMinAggregateOutputType | null
    _max: AdministrativeProcedureMaxAggregateOutputType | null
  }

  export type AdministrativeProcedureMinAggregateOutputType = {
    id: string | null
    code: string | null
    name: string | null
    category: string | null
    description: string | null
    duration: string | null
    fee: string | null
    requiredDocs: string | null
    steps: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AdministrativeProcedureMaxAggregateOutputType = {
    id: string | null
    code: string | null
    name: string | null
    category: string | null
    description: string | null
    duration: string | null
    fee: string | null
    requiredDocs: string | null
    steps: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AdministrativeProcedureCountAggregateOutputType = {
    id: number
    code: number
    name: number
    category: number
    description: number
    duration: number
    fee: number
    requiredDocs: number
    steps: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AdministrativeProcedureMinAggregateInputType = {
    id?: true
    code?: true
    name?: true
    category?: true
    description?: true
    duration?: true
    fee?: true
    requiredDocs?: true
    steps?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AdministrativeProcedureMaxAggregateInputType = {
    id?: true
    code?: true
    name?: true
    category?: true
    description?: true
    duration?: true
    fee?: true
    requiredDocs?: true
    steps?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AdministrativeProcedureCountAggregateInputType = {
    id?: true
    code?: true
    name?: true
    category?: true
    description?: true
    duration?: true
    fee?: true
    requiredDocs?: true
    steps?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AdministrativeProcedureAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AdministrativeProcedure to aggregate.
     */
    where?: AdministrativeProcedureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdministrativeProcedures to fetch.
     */
    orderBy?: AdministrativeProcedureOrderByWithRelationInput | AdministrativeProcedureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AdministrativeProcedureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdministrativeProcedures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdministrativeProcedures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AdministrativeProcedures
    **/
    _count?: true | AdministrativeProcedureCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AdministrativeProcedureMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AdministrativeProcedureMaxAggregateInputType
  }

  export type GetAdministrativeProcedureAggregateType<T extends AdministrativeProcedureAggregateArgs> = {
        [P in keyof T & keyof AggregateAdministrativeProcedure]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAdministrativeProcedure[P]>
      : GetScalarType<T[P], AggregateAdministrativeProcedure[P]>
  }




  export type AdministrativeProcedureGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AdministrativeProcedureWhereInput
    orderBy?: AdministrativeProcedureOrderByWithAggregationInput | AdministrativeProcedureOrderByWithAggregationInput[]
    by: AdministrativeProcedureScalarFieldEnum[] | AdministrativeProcedureScalarFieldEnum
    having?: AdministrativeProcedureScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AdministrativeProcedureCountAggregateInputType | true
    _min?: AdministrativeProcedureMinAggregateInputType
    _max?: AdministrativeProcedureMaxAggregateInputType
  }

  export type AdministrativeProcedureGroupByOutputType = {
    id: string
    code: string
    name: string
    category: string
    description: string | null
    duration: string
    fee: string
    requiredDocs: string
    steps: string
    createdAt: Date
    updatedAt: Date
    _count: AdministrativeProcedureCountAggregateOutputType | null
    _min: AdministrativeProcedureMinAggregateOutputType | null
    _max: AdministrativeProcedureMaxAggregateOutputType | null
  }

  type GetAdministrativeProcedureGroupByPayload<T extends AdministrativeProcedureGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AdministrativeProcedureGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AdministrativeProcedureGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AdministrativeProcedureGroupByOutputType[P]>
            : GetScalarType<T[P], AdministrativeProcedureGroupByOutputType[P]>
        }
      >
    >


  export type AdministrativeProcedureSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    name?: boolean
    category?: boolean
    description?: boolean
    duration?: boolean
    fee?: boolean
    requiredDocs?: boolean
    steps?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["administrativeProcedure"]>



  export type AdministrativeProcedureSelectScalar = {
    id?: boolean
    code?: boolean
    name?: boolean
    category?: boolean
    description?: boolean
    duration?: boolean
    fee?: boolean
    requiredDocs?: boolean
    steps?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AdministrativeProcedureOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "code" | "name" | "category" | "description" | "duration" | "fee" | "requiredDocs" | "steps" | "createdAt" | "updatedAt", ExtArgs["result"]["administrativeProcedure"]>

  export type $AdministrativeProcedurePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AdministrativeProcedure"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      code: string
      name: string
      category: string
      description: string | null
      duration: string
      fee: string
      requiredDocs: string
      steps: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["administrativeProcedure"]>
    composites: {}
  }

  type AdministrativeProcedureGetPayload<S extends boolean | null | undefined | AdministrativeProcedureDefaultArgs> = $Result.GetResult<Prisma.$AdministrativeProcedurePayload, S>

  type AdministrativeProcedureCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AdministrativeProcedureFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AdministrativeProcedureCountAggregateInputType | true
    }

  export interface AdministrativeProcedureDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AdministrativeProcedure'], meta: { name: 'AdministrativeProcedure' } }
    /**
     * Find zero or one AdministrativeProcedure that matches the filter.
     * @param {AdministrativeProcedureFindUniqueArgs} args - Arguments to find a AdministrativeProcedure
     * @example
     * // Get one AdministrativeProcedure
     * const administrativeProcedure = await prisma.administrativeProcedure.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AdministrativeProcedureFindUniqueArgs>(args: SelectSubset<T, AdministrativeProcedureFindUniqueArgs<ExtArgs>>): Prisma__AdministrativeProcedureClient<$Result.GetResult<Prisma.$AdministrativeProcedurePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AdministrativeProcedure that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AdministrativeProcedureFindUniqueOrThrowArgs} args - Arguments to find a AdministrativeProcedure
     * @example
     * // Get one AdministrativeProcedure
     * const administrativeProcedure = await prisma.administrativeProcedure.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AdministrativeProcedureFindUniqueOrThrowArgs>(args: SelectSubset<T, AdministrativeProcedureFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AdministrativeProcedureClient<$Result.GetResult<Prisma.$AdministrativeProcedurePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AdministrativeProcedure that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdministrativeProcedureFindFirstArgs} args - Arguments to find a AdministrativeProcedure
     * @example
     * // Get one AdministrativeProcedure
     * const administrativeProcedure = await prisma.administrativeProcedure.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AdministrativeProcedureFindFirstArgs>(args?: SelectSubset<T, AdministrativeProcedureFindFirstArgs<ExtArgs>>): Prisma__AdministrativeProcedureClient<$Result.GetResult<Prisma.$AdministrativeProcedurePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AdministrativeProcedure that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdministrativeProcedureFindFirstOrThrowArgs} args - Arguments to find a AdministrativeProcedure
     * @example
     * // Get one AdministrativeProcedure
     * const administrativeProcedure = await prisma.administrativeProcedure.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AdministrativeProcedureFindFirstOrThrowArgs>(args?: SelectSubset<T, AdministrativeProcedureFindFirstOrThrowArgs<ExtArgs>>): Prisma__AdministrativeProcedureClient<$Result.GetResult<Prisma.$AdministrativeProcedurePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AdministrativeProcedures that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdministrativeProcedureFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AdministrativeProcedures
     * const administrativeProcedures = await prisma.administrativeProcedure.findMany()
     * 
     * // Get first 10 AdministrativeProcedures
     * const administrativeProcedures = await prisma.administrativeProcedure.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const administrativeProcedureWithIdOnly = await prisma.administrativeProcedure.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AdministrativeProcedureFindManyArgs>(args?: SelectSubset<T, AdministrativeProcedureFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdministrativeProcedurePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AdministrativeProcedure.
     * @param {AdministrativeProcedureCreateArgs} args - Arguments to create a AdministrativeProcedure.
     * @example
     * // Create one AdministrativeProcedure
     * const AdministrativeProcedure = await prisma.administrativeProcedure.create({
     *   data: {
     *     // ... data to create a AdministrativeProcedure
     *   }
     * })
     * 
     */
    create<T extends AdministrativeProcedureCreateArgs>(args: SelectSubset<T, AdministrativeProcedureCreateArgs<ExtArgs>>): Prisma__AdministrativeProcedureClient<$Result.GetResult<Prisma.$AdministrativeProcedurePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AdministrativeProcedures.
     * @param {AdministrativeProcedureCreateManyArgs} args - Arguments to create many AdministrativeProcedures.
     * @example
     * // Create many AdministrativeProcedures
     * const administrativeProcedure = await prisma.administrativeProcedure.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AdministrativeProcedureCreateManyArgs>(args?: SelectSubset<T, AdministrativeProcedureCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a AdministrativeProcedure.
     * @param {AdministrativeProcedureDeleteArgs} args - Arguments to delete one AdministrativeProcedure.
     * @example
     * // Delete one AdministrativeProcedure
     * const AdministrativeProcedure = await prisma.administrativeProcedure.delete({
     *   where: {
     *     // ... filter to delete one AdministrativeProcedure
     *   }
     * })
     * 
     */
    delete<T extends AdministrativeProcedureDeleteArgs>(args: SelectSubset<T, AdministrativeProcedureDeleteArgs<ExtArgs>>): Prisma__AdministrativeProcedureClient<$Result.GetResult<Prisma.$AdministrativeProcedurePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AdministrativeProcedure.
     * @param {AdministrativeProcedureUpdateArgs} args - Arguments to update one AdministrativeProcedure.
     * @example
     * // Update one AdministrativeProcedure
     * const administrativeProcedure = await prisma.administrativeProcedure.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AdministrativeProcedureUpdateArgs>(args: SelectSubset<T, AdministrativeProcedureUpdateArgs<ExtArgs>>): Prisma__AdministrativeProcedureClient<$Result.GetResult<Prisma.$AdministrativeProcedurePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AdministrativeProcedures.
     * @param {AdministrativeProcedureDeleteManyArgs} args - Arguments to filter AdministrativeProcedures to delete.
     * @example
     * // Delete a few AdministrativeProcedures
     * const { count } = await prisma.administrativeProcedure.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AdministrativeProcedureDeleteManyArgs>(args?: SelectSubset<T, AdministrativeProcedureDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AdministrativeProcedures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdministrativeProcedureUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AdministrativeProcedures
     * const administrativeProcedure = await prisma.administrativeProcedure.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AdministrativeProcedureUpdateManyArgs>(args: SelectSubset<T, AdministrativeProcedureUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AdministrativeProcedure.
     * @param {AdministrativeProcedureUpsertArgs} args - Arguments to update or create a AdministrativeProcedure.
     * @example
     * // Update or create a AdministrativeProcedure
     * const administrativeProcedure = await prisma.administrativeProcedure.upsert({
     *   create: {
     *     // ... data to create a AdministrativeProcedure
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AdministrativeProcedure we want to update
     *   }
     * })
     */
    upsert<T extends AdministrativeProcedureUpsertArgs>(args: SelectSubset<T, AdministrativeProcedureUpsertArgs<ExtArgs>>): Prisma__AdministrativeProcedureClient<$Result.GetResult<Prisma.$AdministrativeProcedurePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AdministrativeProcedures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdministrativeProcedureCountArgs} args - Arguments to filter AdministrativeProcedures to count.
     * @example
     * // Count the number of AdministrativeProcedures
     * const count = await prisma.administrativeProcedure.count({
     *   where: {
     *     // ... the filter for the AdministrativeProcedures we want to count
     *   }
     * })
    **/
    count<T extends AdministrativeProcedureCountArgs>(
      args?: Subset<T, AdministrativeProcedureCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AdministrativeProcedureCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AdministrativeProcedure.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdministrativeProcedureAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AdministrativeProcedureAggregateArgs>(args: Subset<T, AdministrativeProcedureAggregateArgs>): Prisma.PrismaPromise<GetAdministrativeProcedureAggregateType<T>>

    /**
     * Group by AdministrativeProcedure.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdministrativeProcedureGroupByArgs} args - Group by arguments.
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
      T extends AdministrativeProcedureGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AdministrativeProcedureGroupByArgs['orderBy'] }
        : { orderBy?: AdministrativeProcedureGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AdministrativeProcedureGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAdministrativeProcedureGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AdministrativeProcedure model
   */
  readonly fields: AdministrativeProcedureFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AdministrativeProcedure.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AdministrativeProcedureClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the AdministrativeProcedure model
   */
  interface AdministrativeProcedureFieldRefs {
    readonly id: FieldRef<"AdministrativeProcedure", 'String'>
    readonly code: FieldRef<"AdministrativeProcedure", 'String'>
    readonly name: FieldRef<"AdministrativeProcedure", 'String'>
    readonly category: FieldRef<"AdministrativeProcedure", 'String'>
    readonly description: FieldRef<"AdministrativeProcedure", 'String'>
    readonly duration: FieldRef<"AdministrativeProcedure", 'String'>
    readonly fee: FieldRef<"AdministrativeProcedure", 'String'>
    readonly requiredDocs: FieldRef<"AdministrativeProcedure", 'String'>
    readonly steps: FieldRef<"AdministrativeProcedure", 'String'>
    readonly createdAt: FieldRef<"AdministrativeProcedure", 'DateTime'>
    readonly updatedAt: FieldRef<"AdministrativeProcedure", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AdministrativeProcedure findUnique
   */
  export type AdministrativeProcedureFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdministrativeProcedure
     */
    select?: AdministrativeProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdministrativeProcedure
     */
    omit?: AdministrativeProcedureOmit<ExtArgs> | null
    /**
     * Filter, which AdministrativeProcedure to fetch.
     */
    where: AdministrativeProcedureWhereUniqueInput
  }

  /**
   * AdministrativeProcedure findUniqueOrThrow
   */
  export type AdministrativeProcedureFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdministrativeProcedure
     */
    select?: AdministrativeProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdministrativeProcedure
     */
    omit?: AdministrativeProcedureOmit<ExtArgs> | null
    /**
     * Filter, which AdministrativeProcedure to fetch.
     */
    where: AdministrativeProcedureWhereUniqueInput
  }

  /**
   * AdministrativeProcedure findFirst
   */
  export type AdministrativeProcedureFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdministrativeProcedure
     */
    select?: AdministrativeProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdministrativeProcedure
     */
    omit?: AdministrativeProcedureOmit<ExtArgs> | null
    /**
     * Filter, which AdministrativeProcedure to fetch.
     */
    where?: AdministrativeProcedureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdministrativeProcedures to fetch.
     */
    orderBy?: AdministrativeProcedureOrderByWithRelationInput | AdministrativeProcedureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AdministrativeProcedures.
     */
    cursor?: AdministrativeProcedureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdministrativeProcedures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdministrativeProcedures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdministrativeProcedures.
     */
    distinct?: AdministrativeProcedureScalarFieldEnum | AdministrativeProcedureScalarFieldEnum[]
  }

  /**
   * AdministrativeProcedure findFirstOrThrow
   */
  export type AdministrativeProcedureFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdministrativeProcedure
     */
    select?: AdministrativeProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdministrativeProcedure
     */
    omit?: AdministrativeProcedureOmit<ExtArgs> | null
    /**
     * Filter, which AdministrativeProcedure to fetch.
     */
    where?: AdministrativeProcedureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdministrativeProcedures to fetch.
     */
    orderBy?: AdministrativeProcedureOrderByWithRelationInput | AdministrativeProcedureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AdministrativeProcedures.
     */
    cursor?: AdministrativeProcedureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdministrativeProcedures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdministrativeProcedures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdministrativeProcedures.
     */
    distinct?: AdministrativeProcedureScalarFieldEnum | AdministrativeProcedureScalarFieldEnum[]
  }

  /**
   * AdministrativeProcedure findMany
   */
  export type AdministrativeProcedureFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdministrativeProcedure
     */
    select?: AdministrativeProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdministrativeProcedure
     */
    omit?: AdministrativeProcedureOmit<ExtArgs> | null
    /**
     * Filter, which AdministrativeProcedures to fetch.
     */
    where?: AdministrativeProcedureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdministrativeProcedures to fetch.
     */
    orderBy?: AdministrativeProcedureOrderByWithRelationInput | AdministrativeProcedureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AdministrativeProcedures.
     */
    cursor?: AdministrativeProcedureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdministrativeProcedures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdministrativeProcedures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdministrativeProcedures.
     */
    distinct?: AdministrativeProcedureScalarFieldEnum | AdministrativeProcedureScalarFieldEnum[]
  }

  /**
   * AdministrativeProcedure create
   */
  export type AdministrativeProcedureCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdministrativeProcedure
     */
    select?: AdministrativeProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdministrativeProcedure
     */
    omit?: AdministrativeProcedureOmit<ExtArgs> | null
    /**
     * The data needed to create a AdministrativeProcedure.
     */
    data: XOR<AdministrativeProcedureCreateInput, AdministrativeProcedureUncheckedCreateInput>
  }

  /**
   * AdministrativeProcedure createMany
   */
  export type AdministrativeProcedureCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AdministrativeProcedures.
     */
    data: AdministrativeProcedureCreateManyInput | AdministrativeProcedureCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AdministrativeProcedure update
   */
  export type AdministrativeProcedureUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdministrativeProcedure
     */
    select?: AdministrativeProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdministrativeProcedure
     */
    omit?: AdministrativeProcedureOmit<ExtArgs> | null
    /**
     * The data needed to update a AdministrativeProcedure.
     */
    data: XOR<AdministrativeProcedureUpdateInput, AdministrativeProcedureUncheckedUpdateInput>
    /**
     * Choose, which AdministrativeProcedure to update.
     */
    where: AdministrativeProcedureWhereUniqueInput
  }

  /**
   * AdministrativeProcedure updateMany
   */
  export type AdministrativeProcedureUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AdministrativeProcedures.
     */
    data: XOR<AdministrativeProcedureUpdateManyMutationInput, AdministrativeProcedureUncheckedUpdateManyInput>
    /**
     * Filter which AdministrativeProcedures to update
     */
    where?: AdministrativeProcedureWhereInput
    /**
     * Limit how many AdministrativeProcedures to update.
     */
    limit?: number
  }

  /**
   * AdministrativeProcedure upsert
   */
  export type AdministrativeProcedureUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdministrativeProcedure
     */
    select?: AdministrativeProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdministrativeProcedure
     */
    omit?: AdministrativeProcedureOmit<ExtArgs> | null
    /**
     * The filter to search for the AdministrativeProcedure to update in case it exists.
     */
    where: AdministrativeProcedureWhereUniqueInput
    /**
     * In case the AdministrativeProcedure found by the `where` argument doesn't exist, create a new AdministrativeProcedure with this data.
     */
    create: XOR<AdministrativeProcedureCreateInput, AdministrativeProcedureUncheckedCreateInput>
    /**
     * In case the AdministrativeProcedure was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AdministrativeProcedureUpdateInput, AdministrativeProcedureUncheckedUpdateInput>
  }

  /**
   * AdministrativeProcedure delete
   */
  export type AdministrativeProcedureDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdministrativeProcedure
     */
    select?: AdministrativeProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdministrativeProcedure
     */
    omit?: AdministrativeProcedureOmit<ExtArgs> | null
    /**
     * Filter which AdministrativeProcedure to delete.
     */
    where: AdministrativeProcedureWhereUniqueInput
  }

  /**
   * AdministrativeProcedure deleteMany
   */
  export type AdministrativeProcedureDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AdministrativeProcedures to delete
     */
    where?: AdministrativeProcedureWhereInput
    /**
     * Limit how many AdministrativeProcedures to delete.
     */
    limit?: number
  }

  /**
   * AdministrativeProcedure without action
   */
  export type AdministrativeProcedureDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdministrativeProcedure
     */
    select?: AdministrativeProcedureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdministrativeProcedure
     */
    omit?: AdministrativeProcedureOmit<ExtArgs> | null
  }


  /**
   * Model OneStopDossier
   */

  export type AggregateOneStopDossier = {
    _count: OneStopDossierCountAggregateOutputType | null
    _avg: OneStopDossierAvgAggregateOutputType | null
    _sum: OneStopDossierSumAggregateOutputType | null
    _min: OneStopDossierMinAggregateOutputType | null
    _max: OneStopDossierMaxAggregateOutputType | null
  }

  export type OneStopDossierAvgAggregateOutputType = {
    currentStep: number | null
  }

  export type OneStopDossierSumAggregateOutputType = {
    currentStep: number | null
  }

  export type OneStopDossierMinAggregateOutputType = {
    id: string | null
    code: string | null
    procedureName: string | null
    senderName: string | null
    receiveDate: Date | null
    dueDate: Date | null
    status: string | null
    currentStep: number | null
    stepDetails: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OneStopDossierMaxAggregateOutputType = {
    id: string | null
    code: string | null
    procedureName: string | null
    senderName: string | null
    receiveDate: Date | null
    dueDate: Date | null
    status: string | null
    currentStep: number | null
    stepDetails: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OneStopDossierCountAggregateOutputType = {
    id: number
    code: number
    procedureName: number
    senderName: number
    receiveDate: number
    dueDate: number
    status: number
    currentStep: number
    stepDetails: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OneStopDossierAvgAggregateInputType = {
    currentStep?: true
  }

  export type OneStopDossierSumAggregateInputType = {
    currentStep?: true
  }

  export type OneStopDossierMinAggregateInputType = {
    id?: true
    code?: true
    procedureName?: true
    senderName?: true
    receiveDate?: true
    dueDate?: true
    status?: true
    currentStep?: true
    stepDetails?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OneStopDossierMaxAggregateInputType = {
    id?: true
    code?: true
    procedureName?: true
    senderName?: true
    receiveDate?: true
    dueDate?: true
    status?: true
    currentStep?: true
    stepDetails?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OneStopDossierCountAggregateInputType = {
    id?: true
    code?: true
    procedureName?: true
    senderName?: true
    receiveDate?: true
    dueDate?: true
    status?: true
    currentStep?: true
    stepDetails?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OneStopDossierAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OneStopDossier to aggregate.
     */
    where?: OneStopDossierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OneStopDossiers to fetch.
     */
    orderBy?: OneStopDossierOrderByWithRelationInput | OneStopDossierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OneStopDossierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OneStopDossiers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OneStopDossiers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OneStopDossiers
    **/
    _count?: true | OneStopDossierCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OneStopDossierAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OneStopDossierSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OneStopDossierMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OneStopDossierMaxAggregateInputType
  }

  export type GetOneStopDossierAggregateType<T extends OneStopDossierAggregateArgs> = {
        [P in keyof T & keyof AggregateOneStopDossier]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOneStopDossier[P]>
      : GetScalarType<T[P], AggregateOneStopDossier[P]>
  }




  export type OneStopDossierGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OneStopDossierWhereInput
    orderBy?: OneStopDossierOrderByWithAggregationInput | OneStopDossierOrderByWithAggregationInput[]
    by: OneStopDossierScalarFieldEnum[] | OneStopDossierScalarFieldEnum
    having?: OneStopDossierScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OneStopDossierCountAggregateInputType | true
    _avg?: OneStopDossierAvgAggregateInputType
    _sum?: OneStopDossierSumAggregateInputType
    _min?: OneStopDossierMinAggregateInputType
    _max?: OneStopDossierMaxAggregateInputType
  }

  export type OneStopDossierGroupByOutputType = {
    id: string
    code: string
    procedureName: string | null
    senderName: string
    receiveDate: Date
    dueDate: Date
    status: string
    currentStep: number
    stepDetails: string | null
    createdAt: Date
    updatedAt: Date
    _count: OneStopDossierCountAggregateOutputType | null
    _avg: OneStopDossierAvgAggregateOutputType | null
    _sum: OneStopDossierSumAggregateOutputType | null
    _min: OneStopDossierMinAggregateOutputType | null
    _max: OneStopDossierMaxAggregateOutputType | null
  }

  type GetOneStopDossierGroupByPayload<T extends OneStopDossierGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OneStopDossierGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OneStopDossierGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OneStopDossierGroupByOutputType[P]>
            : GetScalarType<T[P], OneStopDossierGroupByOutputType[P]>
        }
      >
    >


  export type OneStopDossierSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    procedureName?: boolean
    senderName?: boolean
    receiveDate?: boolean
    dueDate?: boolean
    status?: boolean
    currentStep?: boolean
    stepDetails?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["oneStopDossier"]>



  export type OneStopDossierSelectScalar = {
    id?: boolean
    code?: boolean
    procedureName?: boolean
    senderName?: boolean
    receiveDate?: boolean
    dueDate?: boolean
    status?: boolean
    currentStep?: boolean
    stepDetails?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OneStopDossierOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "code" | "procedureName" | "senderName" | "receiveDate" | "dueDate" | "status" | "currentStep" | "stepDetails" | "createdAt" | "updatedAt", ExtArgs["result"]["oneStopDossier"]>

  export type $OneStopDossierPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OneStopDossier"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      code: string
      procedureName: string | null
      senderName: string
      receiveDate: Date
      dueDate: Date
      status: string
      currentStep: number
      stepDetails: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["oneStopDossier"]>
    composites: {}
  }

  type OneStopDossierGetPayload<S extends boolean | null | undefined | OneStopDossierDefaultArgs> = $Result.GetResult<Prisma.$OneStopDossierPayload, S>

  type OneStopDossierCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OneStopDossierFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OneStopDossierCountAggregateInputType | true
    }

  export interface OneStopDossierDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OneStopDossier'], meta: { name: 'OneStopDossier' } }
    /**
     * Find zero or one OneStopDossier that matches the filter.
     * @param {OneStopDossierFindUniqueArgs} args - Arguments to find a OneStopDossier
     * @example
     * // Get one OneStopDossier
     * const oneStopDossier = await prisma.oneStopDossier.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OneStopDossierFindUniqueArgs>(args: SelectSubset<T, OneStopDossierFindUniqueArgs<ExtArgs>>): Prisma__OneStopDossierClient<$Result.GetResult<Prisma.$OneStopDossierPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OneStopDossier that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OneStopDossierFindUniqueOrThrowArgs} args - Arguments to find a OneStopDossier
     * @example
     * // Get one OneStopDossier
     * const oneStopDossier = await prisma.oneStopDossier.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OneStopDossierFindUniqueOrThrowArgs>(args: SelectSubset<T, OneStopDossierFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OneStopDossierClient<$Result.GetResult<Prisma.$OneStopDossierPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OneStopDossier that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OneStopDossierFindFirstArgs} args - Arguments to find a OneStopDossier
     * @example
     * // Get one OneStopDossier
     * const oneStopDossier = await prisma.oneStopDossier.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OneStopDossierFindFirstArgs>(args?: SelectSubset<T, OneStopDossierFindFirstArgs<ExtArgs>>): Prisma__OneStopDossierClient<$Result.GetResult<Prisma.$OneStopDossierPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OneStopDossier that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OneStopDossierFindFirstOrThrowArgs} args - Arguments to find a OneStopDossier
     * @example
     * // Get one OneStopDossier
     * const oneStopDossier = await prisma.oneStopDossier.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OneStopDossierFindFirstOrThrowArgs>(args?: SelectSubset<T, OneStopDossierFindFirstOrThrowArgs<ExtArgs>>): Prisma__OneStopDossierClient<$Result.GetResult<Prisma.$OneStopDossierPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OneStopDossiers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OneStopDossierFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OneStopDossiers
     * const oneStopDossiers = await prisma.oneStopDossier.findMany()
     * 
     * // Get first 10 OneStopDossiers
     * const oneStopDossiers = await prisma.oneStopDossier.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const oneStopDossierWithIdOnly = await prisma.oneStopDossier.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OneStopDossierFindManyArgs>(args?: SelectSubset<T, OneStopDossierFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OneStopDossierPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OneStopDossier.
     * @param {OneStopDossierCreateArgs} args - Arguments to create a OneStopDossier.
     * @example
     * // Create one OneStopDossier
     * const OneStopDossier = await prisma.oneStopDossier.create({
     *   data: {
     *     // ... data to create a OneStopDossier
     *   }
     * })
     * 
     */
    create<T extends OneStopDossierCreateArgs>(args: SelectSubset<T, OneStopDossierCreateArgs<ExtArgs>>): Prisma__OneStopDossierClient<$Result.GetResult<Prisma.$OneStopDossierPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OneStopDossiers.
     * @param {OneStopDossierCreateManyArgs} args - Arguments to create many OneStopDossiers.
     * @example
     * // Create many OneStopDossiers
     * const oneStopDossier = await prisma.oneStopDossier.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OneStopDossierCreateManyArgs>(args?: SelectSubset<T, OneStopDossierCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a OneStopDossier.
     * @param {OneStopDossierDeleteArgs} args - Arguments to delete one OneStopDossier.
     * @example
     * // Delete one OneStopDossier
     * const OneStopDossier = await prisma.oneStopDossier.delete({
     *   where: {
     *     // ... filter to delete one OneStopDossier
     *   }
     * })
     * 
     */
    delete<T extends OneStopDossierDeleteArgs>(args: SelectSubset<T, OneStopDossierDeleteArgs<ExtArgs>>): Prisma__OneStopDossierClient<$Result.GetResult<Prisma.$OneStopDossierPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OneStopDossier.
     * @param {OneStopDossierUpdateArgs} args - Arguments to update one OneStopDossier.
     * @example
     * // Update one OneStopDossier
     * const oneStopDossier = await prisma.oneStopDossier.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OneStopDossierUpdateArgs>(args: SelectSubset<T, OneStopDossierUpdateArgs<ExtArgs>>): Prisma__OneStopDossierClient<$Result.GetResult<Prisma.$OneStopDossierPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OneStopDossiers.
     * @param {OneStopDossierDeleteManyArgs} args - Arguments to filter OneStopDossiers to delete.
     * @example
     * // Delete a few OneStopDossiers
     * const { count } = await prisma.oneStopDossier.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OneStopDossierDeleteManyArgs>(args?: SelectSubset<T, OneStopDossierDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OneStopDossiers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OneStopDossierUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OneStopDossiers
     * const oneStopDossier = await prisma.oneStopDossier.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OneStopDossierUpdateManyArgs>(args: SelectSubset<T, OneStopDossierUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OneStopDossier.
     * @param {OneStopDossierUpsertArgs} args - Arguments to update or create a OneStopDossier.
     * @example
     * // Update or create a OneStopDossier
     * const oneStopDossier = await prisma.oneStopDossier.upsert({
     *   create: {
     *     // ... data to create a OneStopDossier
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OneStopDossier we want to update
     *   }
     * })
     */
    upsert<T extends OneStopDossierUpsertArgs>(args: SelectSubset<T, OneStopDossierUpsertArgs<ExtArgs>>): Prisma__OneStopDossierClient<$Result.GetResult<Prisma.$OneStopDossierPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OneStopDossiers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OneStopDossierCountArgs} args - Arguments to filter OneStopDossiers to count.
     * @example
     * // Count the number of OneStopDossiers
     * const count = await prisma.oneStopDossier.count({
     *   where: {
     *     // ... the filter for the OneStopDossiers we want to count
     *   }
     * })
    **/
    count<T extends OneStopDossierCountArgs>(
      args?: Subset<T, OneStopDossierCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OneStopDossierCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OneStopDossier.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OneStopDossierAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OneStopDossierAggregateArgs>(args: Subset<T, OneStopDossierAggregateArgs>): Prisma.PrismaPromise<GetOneStopDossierAggregateType<T>>

    /**
     * Group by OneStopDossier.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OneStopDossierGroupByArgs} args - Group by arguments.
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
      T extends OneStopDossierGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OneStopDossierGroupByArgs['orderBy'] }
        : { orderBy?: OneStopDossierGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OneStopDossierGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOneStopDossierGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OneStopDossier model
   */
  readonly fields: OneStopDossierFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OneStopDossier.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OneStopDossierClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the OneStopDossier model
   */
  interface OneStopDossierFieldRefs {
    readonly id: FieldRef<"OneStopDossier", 'String'>
    readonly code: FieldRef<"OneStopDossier", 'String'>
    readonly procedureName: FieldRef<"OneStopDossier", 'String'>
    readonly senderName: FieldRef<"OneStopDossier", 'String'>
    readonly receiveDate: FieldRef<"OneStopDossier", 'DateTime'>
    readonly dueDate: FieldRef<"OneStopDossier", 'DateTime'>
    readonly status: FieldRef<"OneStopDossier", 'String'>
    readonly currentStep: FieldRef<"OneStopDossier", 'Int'>
    readonly stepDetails: FieldRef<"OneStopDossier", 'String'>
    readonly createdAt: FieldRef<"OneStopDossier", 'DateTime'>
    readonly updatedAt: FieldRef<"OneStopDossier", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OneStopDossier findUnique
   */
  export type OneStopDossierFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneStopDossier
     */
    select?: OneStopDossierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OneStopDossier
     */
    omit?: OneStopDossierOmit<ExtArgs> | null
    /**
     * Filter, which OneStopDossier to fetch.
     */
    where: OneStopDossierWhereUniqueInput
  }

  /**
   * OneStopDossier findUniqueOrThrow
   */
  export type OneStopDossierFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneStopDossier
     */
    select?: OneStopDossierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OneStopDossier
     */
    omit?: OneStopDossierOmit<ExtArgs> | null
    /**
     * Filter, which OneStopDossier to fetch.
     */
    where: OneStopDossierWhereUniqueInput
  }

  /**
   * OneStopDossier findFirst
   */
  export type OneStopDossierFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneStopDossier
     */
    select?: OneStopDossierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OneStopDossier
     */
    omit?: OneStopDossierOmit<ExtArgs> | null
    /**
     * Filter, which OneStopDossier to fetch.
     */
    where?: OneStopDossierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OneStopDossiers to fetch.
     */
    orderBy?: OneStopDossierOrderByWithRelationInput | OneStopDossierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OneStopDossiers.
     */
    cursor?: OneStopDossierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OneStopDossiers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OneStopDossiers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OneStopDossiers.
     */
    distinct?: OneStopDossierScalarFieldEnum | OneStopDossierScalarFieldEnum[]
  }

  /**
   * OneStopDossier findFirstOrThrow
   */
  export type OneStopDossierFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneStopDossier
     */
    select?: OneStopDossierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OneStopDossier
     */
    omit?: OneStopDossierOmit<ExtArgs> | null
    /**
     * Filter, which OneStopDossier to fetch.
     */
    where?: OneStopDossierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OneStopDossiers to fetch.
     */
    orderBy?: OneStopDossierOrderByWithRelationInput | OneStopDossierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OneStopDossiers.
     */
    cursor?: OneStopDossierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OneStopDossiers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OneStopDossiers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OneStopDossiers.
     */
    distinct?: OneStopDossierScalarFieldEnum | OneStopDossierScalarFieldEnum[]
  }

  /**
   * OneStopDossier findMany
   */
  export type OneStopDossierFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneStopDossier
     */
    select?: OneStopDossierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OneStopDossier
     */
    omit?: OneStopDossierOmit<ExtArgs> | null
    /**
     * Filter, which OneStopDossiers to fetch.
     */
    where?: OneStopDossierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OneStopDossiers to fetch.
     */
    orderBy?: OneStopDossierOrderByWithRelationInput | OneStopDossierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OneStopDossiers.
     */
    cursor?: OneStopDossierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OneStopDossiers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OneStopDossiers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OneStopDossiers.
     */
    distinct?: OneStopDossierScalarFieldEnum | OneStopDossierScalarFieldEnum[]
  }

  /**
   * OneStopDossier create
   */
  export type OneStopDossierCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneStopDossier
     */
    select?: OneStopDossierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OneStopDossier
     */
    omit?: OneStopDossierOmit<ExtArgs> | null
    /**
     * The data needed to create a OneStopDossier.
     */
    data: XOR<OneStopDossierCreateInput, OneStopDossierUncheckedCreateInput>
  }

  /**
   * OneStopDossier createMany
   */
  export type OneStopDossierCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OneStopDossiers.
     */
    data: OneStopDossierCreateManyInput | OneStopDossierCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OneStopDossier update
   */
  export type OneStopDossierUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneStopDossier
     */
    select?: OneStopDossierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OneStopDossier
     */
    omit?: OneStopDossierOmit<ExtArgs> | null
    /**
     * The data needed to update a OneStopDossier.
     */
    data: XOR<OneStopDossierUpdateInput, OneStopDossierUncheckedUpdateInput>
    /**
     * Choose, which OneStopDossier to update.
     */
    where: OneStopDossierWhereUniqueInput
  }

  /**
   * OneStopDossier updateMany
   */
  export type OneStopDossierUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OneStopDossiers.
     */
    data: XOR<OneStopDossierUpdateManyMutationInput, OneStopDossierUncheckedUpdateManyInput>
    /**
     * Filter which OneStopDossiers to update
     */
    where?: OneStopDossierWhereInput
    /**
     * Limit how many OneStopDossiers to update.
     */
    limit?: number
  }

  /**
   * OneStopDossier upsert
   */
  export type OneStopDossierUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneStopDossier
     */
    select?: OneStopDossierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OneStopDossier
     */
    omit?: OneStopDossierOmit<ExtArgs> | null
    /**
     * The filter to search for the OneStopDossier to update in case it exists.
     */
    where: OneStopDossierWhereUniqueInput
    /**
     * In case the OneStopDossier found by the `where` argument doesn't exist, create a new OneStopDossier with this data.
     */
    create: XOR<OneStopDossierCreateInput, OneStopDossierUncheckedCreateInput>
    /**
     * In case the OneStopDossier was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OneStopDossierUpdateInput, OneStopDossierUncheckedUpdateInput>
  }

  /**
   * OneStopDossier delete
   */
  export type OneStopDossierDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneStopDossier
     */
    select?: OneStopDossierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OneStopDossier
     */
    omit?: OneStopDossierOmit<ExtArgs> | null
    /**
     * Filter which OneStopDossier to delete.
     */
    where: OneStopDossierWhereUniqueInput
  }

  /**
   * OneStopDossier deleteMany
   */
  export type OneStopDossierDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OneStopDossiers to delete
     */
    where?: OneStopDossierWhereInput
    /**
     * Limit how many OneStopDossiers to delete.
     */
    limit?: number
  }

  /**
   * OneStopDossier without action
   */
  export type OneStopDossierDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneStopDossier
     */
    select?: OneStopDossierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OneStopDossier
     */
    omit?: OneStopDossierOmit<ExtArgs> | null
  }


  /**
   * Model DossierComponent
   */

  export type AggregateDossierComponent = {
    _count: DossierComponentCountAggregateOutputType | null
    _min: DossierComponentMinAggregateOutputType | null
    _max: DossierComponentMaxAggregateOutputType | null
  }

  export type DossierComponentMinAggregateOutputType = {
    id: string | null
    dossierId: string | null
    name: string | null
    isRequired: boolean | null
    status: string | null
    fileUrl: string | null
    sampleFileUrl: string | null
    source: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DossierComponentMaxAggregateOutputType = {
    id: string | null
    dossierId: string | null
    name: string | null
    isRequired: boolean | null
    status: string | null
    fileUrl: string | null
    sampleFileUrl: string | null
    source: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DossierComponentCountAggregateOutputType = {
    id: number
    dossierId: number
    name: number
    isRequired: number
    status: number
    fileUrl: number
    sampleFileUrl: number
    source: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DossierComponentMinAggregateInputType = {
    id?: true
    dossierId?: true
    name?: true
    isRequired?: true
    status?: true
    fileUrl?: true
    sampleFileUrl?: true
    source?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DossierComponentMaxAggregateInputType = {
    id?: true
    dossierId?: true
    name?: true
    isRequired?: true
    status?: true
    fileUrl?: true
    sampleFileUrl?: true
    source?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DossierComponentCountAggregateInputType = {
    id?: true
    dossierId?: true
    name?: true
    isRequired?: true
    status?: true
    fileUrl?: true
    sampleFileUrl?: true
    source?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DossierComponentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DossierComponent to aggregate.
     */
    where?: DossierComponentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DossierComponents to fetch.
     */
    orderBy?: DossierComponentOrderByWithRelationInput | DossierComponentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DossierComponentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DossierComponents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DossierComponents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DossierComponents
    **/
    _count?: true | DossierComponentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DossierComponentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DossierComponentMaxAggregateInputType
  }

  export type GetDossierComponentAggregateType<T extends DossierComponentAggregateArgs> = {
        [P in keyof T & keyof AggregateDossierComponent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDossierComponent[P]>
      : GetScalarType<T[P], AggregateDossierComponent[P]>
  }




  export type DossierComponentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DossierComponentWhereInput
    orderBy?: DossierComponentOrderByWithAggregationInput | DossierComponentOrderByWithAggregationInput[]
    by: DossierComponentScalarFieldEnum[] | DossierComponentScalarFieldEnum
    having?: DossierComponentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DossierComponentCountAggregateInputType | true
    _min?: DossierComponentMinAggregateInputType
    _max?: DossierComponentMaxAggregateInputType
  }

  export type DossierComponentGroupByOutputType = {
    id: string
    dossierId: string
    name: string
    isRequired: boolean
    status: string
    fileUrl: string | null
    sampleFileUrl: string | null
    source: string | null
    createdAt: Date
    updatedAt: Date
    _count: DossierComponentCountAggregateOutputType | null
    _min: DossierComponentMinAggregateOutputType | null
    _max: DossierComponentMaxAggregateOutputType | null
  }

  type GetDossierComponentGroupByPayload<T extends DossierComponentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DossierComponentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DossierComponentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DossierComponentGroupByOutputType[P]>
            : GetScalarType<T[P], DossierComponentGroupByOutputType[P]>
        }
      >
    >


  export type DossierComponentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dossierId?: boolean
    name?: boolean
    isRequired?: boolean
    status?: boolean
    fileUrl?: boolean
    sampleFileUrl?: boolean
    source?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dossierComponent"]>



  export type DossierComponentSelectScalar = {
    id?: boolean
    dossierId?: boolean
    name?: boolean
    isRequired?: boolean
    status?: boolean
    fileUrl?: boolean
    sampleFileUrl?: boolean
    source?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DossierComponentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "dossierId" | "name" | "isRequired" | "status" | "fileUrl" | "sampleFileUrl" | "source" | "createdAt" | "updatedAt", ExtArgs["result"]["dossierComponent"]>

  export type $DossierComponentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DossierComponent"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      dossierId: string
      name: string
      isRequired: boolean
      status: string
      fileUrl: string | null
      sampleFileUrl: string | null
      source: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["dossierComponent"]>
    composites: {}
  }

  type DossierComponentGetPayload<S extends boolean | null | undefined | DossierComponentDefaultArgs> = $Result.GetResult<Prisma.$DossierComponentPayload, S>

  type DossierComponentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DossierComponentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DossierComponentCountAggregateInputType | true
    }

  export interface DossierComponentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DossierComponent'], meta: { name: 'DossierComponent' } }
    /**
     * Find zero or one DossierComponent that matches the filter.
     * @param {DossierComponentFindUniqueArgs} args - Arguments to find a DossierComponent
     * @example
     * // Get one DossierComponent
     * const dossierComponent = await prisma.dossierComponent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DossierComponentFindUniqueArgs>(args: SelectSubset<T, DossierComponentFindUniqueArgs<ExtArgs>>): Prisma__DossierComponentClient<$Result.GetResult<Prisma.$DossierComponentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DossierComponent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DossierComponentFindUniqueOrThrowArgs} args - Arguments to find a DossierComponent
     * @example
     * // Get one DossierComponent
     * const dossierComponent = await prisma.dossierComponent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DossierComponentFindUniqueOrThrowArgs>(args: SelectSubset<T, DossierComponentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DossierComponentClient<$Result.GetResult<Prisma.$DossierComponentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DossierComponent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DossierComponentFindFirstArgs} args - Arguments to find a DossierComponent
     * @example
     * // Get one DossierComponent
     * const dossierComponent = await prisma.dossierComponent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DossierComponentFindFirstArgs>(args?: SelectSubset<T, DossierComponentFindFirstArgs<ExtArgs>>): Prisma__DossierComponentClient<$Result.GetResult<Prisma.$DossierComponentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DossierComponent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DossierComponentFindFirstOrThrowArgs} args - Arguments to find a DossierComponent
     * @example
     * // Get one DossierComponent
     * const dossierComponent = await prisma.dossierComponent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DossierComponentFindFirstOrThrowArgs>(args?: SelectSubset<T, DossierComponentFindFirstOrThrowArgs<ExtArgs>>): Prisma__DossierComponentClient<$Result.GetResult<Prisma.$DossierComponentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DossierComponents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DossierComponentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DossierComponents
     * const dossierComponents = await prisma.dossierComponent.findMany()
     * 
     * // Get first 10 DossierComponents
     * const dossierComponents = await prisma.dossierComponent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dossierComponentWithIdOnly = await prisma.dossierComponent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DossierComponentFindManyArgs>(args?: SelectSubset<T, DossierComponentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DossierComponentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DossierComponent.
     * @param {DossierComponentCreateArgs} args - Arguments to create a DossierComponent.
     * @example
     * // Create one DossierComponent
     * const DossierComponent = await prisma.dossierComponent.create({
     *   data: {
     *     // ... data to create a DossierComponent
     *   }
     * })
     * 
     */
    create<T extends DossierComponentCreateArgs>(args: SelectSubset<T, DossierComponentCreateArgs<ExtArgs>>): Prisma__DossierComponentClient<$Result.GetResult<Prisma.$DossierComponentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DossierComponents.
     * @param {DossierComponentCreateManyArgs} args - Arguments to create many DossierComponents.
     * @example
     * // Create many DossierComponents
     * const dossierComponent = await prisma.dossierComponent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DossierComponentCreateManyArgs>(args?: SelectSubset<T, DossierComponentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a DossierComponent.
     * @param {DossierComponentDeleteArgs} args - Arguments to delete one DossierComponent.
     * @example
     * // Delete one DossierComponent
     * const DossierComponent = await prisma.dossierComponent.delete({
     *   where: {
     *     // ... filter to delete one DossierComponent
     *   }
     * })
     * 
     */
    delete<T extends DossierComponentDeleteArgs>(args: SelectSubset<T, DossierComponentDeleteArgs<ExtArgs>>): Prisma__DossierComponentClient<$Result.GetResult<Prisma.$DossierComponentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DossierComponent.
     * @param {DossierComponentUpdateArgs} args - Arguments to update one DossierComponent.
     * @example
     * // Update one DossierComponent
     * const dossierComponent = await prisma.dossierComponent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DossierComponentUpdateArgs>(args: SelectSubset<T, DossierComponentUpdateArgs<ExtArgs>>): Prisma__DossierComponentClient<$Result.GetResult<Prisma.$DossierComponentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DossierComponents.
     * @param {DossierComponentDeleteManyArgs} args - Arguments to filter DossierComponents to delete.
     * @example
     * // Delete a few DossierComponents
     * const { count } = await prisma.dossierComponent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DossierComponentDeleteManyArgs>(args?: SelectSubset<T, DossierComponentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DossierComponents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DossierComponentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DossierComponents
     * const dossierComponent = await prisma.dossierComponent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DossierComponentUpdateManyArgs>(args: SelectSubset<T, DossierComponentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DossierComponent.
     * @param {DossierComponentUpsertArgs} args - Arguments to update or create a DossierComponent.
     * @example
     * // Update or create a DossierComponent
     * const dossierComponent = await prisma.dossierComponent.upsert({
     *   create: {
     *     // ... data to create a DossierComponent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DossierComponent we want to update
     *   }
     * })
     */
    upsert<T extends DossierComponentUpsertArgs>(args: SelectSubset<T, DossierComponentUpsertArgs<ExtArgs>>): Prisma__DossierComponentClient<$Result.GetResult<Prisma.$DossierComponentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DossierComponents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DossierComponentCountArgs} args - Arguments to filter DossierComponents to count.
     * @example
     * // Count the number of DossierComponents
     * const count = await prisma.dossierComponent.count({
     *   where: {
     *     // ... the filter for the DossierComponents we want to count
     *   }
     * })
    **/
    count<T extends DossierComponentCountArgs>(
      args?: Subset<T, DossierComponentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DossierComponentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DossierComponent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DossierComponentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DossierComponentAggregateArgs>(args: Subset<T, DossierComponentAggregateArgs>): Prisma.PrismaPromise<GetDossierComponentAggregateType<T>>

    /**
     * Group by DossierComponent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DossierComponentGroupByArgs} args - Group by arguments.
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
      T extends DossierComponentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DossierComponentGroupByArgs['orderBy'] }
        : { orderBy?: DossierComponentGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DossierComponentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDossierComponentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DossierComponent model
   */
  readonly fields: DossierComponentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DossierComponent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DossierComponentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the DossierComponent model
   */
  interface DossierComponentFieldRefs {
    readonly id: FieldRef<"DossierComponent", 'String'>
    readonly dossierId: FieldRef<"DossierComponent", 'String'>
    readonly name: FieldRef<"DossierComponent", 'String'>
    readonly isRequired: FieldRef<"DossierComponent", 'Boolean'>
    readonly status: FieldRef<"DossierComponent", 'String'>
    readonly fileUrl: FieldRef<"DossierComponent", 'String'>
    readonly sampleFileUrl: FieldRef<"DossierComponent", 'String'>
    readonly source: FieldRef<"DossierComponent", 'String'>
    readonly createdAt: FieldRef<"DossierComponent", 'DateTime'>
    readonly updatedAt: FieldRef<"DossierComponent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DossierComponent findUnique
   */
  export type DossierComponentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DossierComponent
     */
    select?: DossierComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DossierComponent
     */
    omit?: DossierComponentOmit<ExtArgs> | null
    /**
     * Filter, which DossierComponent to fetch.
     */
    where: DossierComponentWhereUniqueInput
  }

  /**
   * DossierComponent findUniqueOrThrow
   */
  export type DossierComponentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DossierComponent
     */
    select?: DossierComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DossierComponent
     */
    omit?: DossierComponentOmit<ExtArgs> | null
    /**
     * Filter, which DossierComponent to fetch.
     */
    where: DossierComponentWhereUniqueInput
  }

  /**
   * DossierComponent findFirst
   */
  export type DossierComponentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DossierComponent
     */
    select?: DossierComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DossierComponent
     */
    omit?: DossierComponentOmit<ExtArgs> | null
    /**
     * Filter, which DossierComponent to fetch.
     */
    where?: DossierComponentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DossierComponents to fetch.
     */
    orderBy?: DossierComponentOrderByWithRelationInput | DossierComponentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DossierComponents.
     */
    cursor?: DossierComponentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DossierComponents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DossierComponents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DossierComponents.
     */
    distinct?: DossierComponentScalarFieldEnum | DossierComponentScalarFieldEnum[]
  }

  /**
   * DossierComponent findFirstOrThrow
   */
  export type DossierComponentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DossierComponent
     */
    select?: DossierComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DossierComponent
     */
    omit?: DossierComponentOmit<ExtArgs> | null
    /**
     * Filter, which DossierComponent to fetch.
     */
    where?: DossierComponentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DossierComponents to fetch.
     */
    orderBy?: DossierComponentOrderByWithRelationInput | DossierComponentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DossierComponents.
     */
    cursor?: DossierComponentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DossierComponents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DossierComponents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DossierComponents.
     */
    distinct?: DossierComponentScalarFieldEnum | DossierComponentScalarFieldEnum[]
  }

  /**
   * DossierComponent findMany
   */
  export type DossierComponentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DossierComponent
     */
    select?: DossierComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DossierComponent
     */
    omit?: DossierComponentOmit<ExtArgs> | null
    /**
     * Filter, which DossierComponents to fetch.
     */
    where?: DossierComponentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DossierComponents to fetch.
     */
    orderBy?: DossierComponentOrderByWithRelationInput | DossierComponentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DossierComponents.
     */
    cursor?: DossierComponentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DossierComponents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DossierComponents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DossierComponents.
     */
    distinct?: DossierComponentScalarFieldEnum | DossierComponentScalarFieldEnum[]
  }

  /**
   * DossierComponent create
   */
  export type DossierComponentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DossierComponent
     */
    select?: DossierComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DossierComponent
     */
    omit?: DossierComponentOmit<ExtArgs> | null
    /**
     * The data needed to create a DossierComponent.
     */
    data: XOR<DossierComponentCreateInput, DossierComponentUncheckedCreateInput>
  }

  /**
   * DossierComponent createMany
   */
  export type DossierComponentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DossierComponents.
     */
    data: DossierComponentCreateManyInput | DossierComponentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DossierComponent update
   */
  export type DossierComponentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DossierComponent
     */
    select?: DossierComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DossierComponent
     */
    omit?: DossierComponentOmit<ExtArgs> | null
    /**
     * The data needed to update a DossierComponent.
     */
    data: XOR<DossierComponentUpdateInput, DossierComponentUncheckedUpdateInput>
    /**
     * Choose, which DossierComponent to update.
     */
    where: DossierComponentWhereUniqueInput
  }

  /**
   * DossierComponent updateMany
   */
  export type DossierComponentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DossierComponents.
     */
    data: XOR<DossierComponentUpdateManyMutationInput, DossierComponentUncheckedUpdateManyInput>
    /**
     * Filter which DossierComponents to update
     */
    where?: DossierComponentWhereInput
    /**
     * Limit how many DossierComponents to update.
     */
    limit?: number
  }

  /**
   * DossierComponent upsert
   */
  export type DossierComponentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DossierComponent
     */
    select?: DossierComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DossierComponent
     */
    omit?: DossierComponentOmit<ExtArgs> | null
    /**
     * The filter to search for the DossierComponent to update in case it exists.
     */
    where: DossierComponentWhereUniqueInput
    /**
     * In case the DossierComponent found by the `where` argument doesn't exist, create a new DossierComponent with this data.
     */
    create: XOR<DossierComponentCreateInput, DossierComponentUncheckedCreateInput>
    /**
     * In case the DossierComponent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DossierComponentUpdateInput, DossierComponentUncheckedUpdateInput>
  }

  /**
   * DossierComponent delete
   */
  export type DossierComponentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DossierComponent
     */
    select?: DossierComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DossierComponent
     */
    omit?: DossierComponentOmit<ExtArgs> | null
    /**
     * Filter which DossierComponent to delete.
     */
    where: DossierComponentWhereUniqueInput
  }

  /**
   * DossierComponent deleteMany
   */
  export type DossierComponentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DossierComponents to delete
     */
    where?: DossierComponentWhereInput
    /**
     * Limit how many DossierComponents to delete.
     */
    limit?: number
  }

  /**
   * DossierComponent without action
   */
  export type DossierComponentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DossierComponent
     */
    select?: DossierComponentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DossierComponent
     */
    omit?: DossierComponentOmit<ExtArgs> | null
  }


  /**
   * Model DocumentCabinet
   */

  export type AggregateDocumentCabinet = {
    _count: DocumentCabinetCountAggregateOutputType | null
    _avg: DocumentCabinetAvgAggregateOutputType | null
    _sum: DocumentCabinetSumAggregateOutputType | null
    _min: DocumentCabinetMinAggregateOutputType | null
    _max: DocumentCabinetMaxAggregateOutputType | null
  }

  export type DocumentCabinetAvgAggregateOutputType = {
    fileSize: number | null
  }

  export type DocumentCabinetSumAggregateOutputType = {
    fileSize: number | null
  }

  export type DocumentCabinetMinAggregateOutputType = {
    id: string | null
    userId: string | null
    orgId: string | null
    fileName: string | null
    fileUrl: string | null
    fileType: string | null
    fileSize: number | null
    tags: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DocumentCabinetMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    orgId: string | null
    fileName: string | null
    fileUrl: string | null
    fileType: string | null
    fileSize: number | null
    tags: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DocumentCabinetCountAggregateOutputType = {
    id: number
    userId: number
    orgId: number
    fileName: number
    fileUrl: number
    fileType: number
    fileSize: number
    tags: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DocumentCabinetAvgAggregateInputType = {
    fileSize?: true
  }

  export type DocumentCabinetSumAggregateInputType = {
    fileSize?: true
  }

  export type DocumentCabinetMinAggregateInputType = {
    id?: true
    userId?: true
    orgId?: true
    fileName?: true
    fileUrl?: true
    fileType?: true
    fileSize?: true
    tags?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DocumentCabinetMaxAggregateInputType = {
    id?: true
    userId?: true
    orgId?: true
    fileName?: true
    fileUrl?: true
    fileType?: true
    fileSize?: true
    tags?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DocumentCabinetCountAggregateInputType = {
    id?: true
    userId?: true
    orgId?: true
    fileName?: true
    fileUrl?: true
    fileType?: true
    fileSize?: true
    tags?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DocumentCabinetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DocumentCabinet to aggregate.
     */
    where?: DocumentCabinetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentCabinets to fetch.
     */
    orderBy?: DocumentCabinetOrderByWithRelationInput | DocumentCabinetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DocumentCabinetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentCabinets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentCabinets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DocumentCabinets
    **/
    _count?: true | DocumentCabinetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DocumentCabinetAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DocumentCabinetSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DocumentCabinetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DocumentCabinetMaxAggregateInputType
  }

  export type GetDocumentCabinetAggregateType<T extends DocumentCabinetAggregateArgs> = {
        [P in keyof T & keyof AggregateDocumentCabinet]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDocumentCabinet[P]>
      : GetScalarType<T[P], AggregateDocumentCabinet[P]>
  }




  export type DocumentCabinetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentCabinetWhereInput
    orderBy?: DocumentCabinetOrderByWithAggregationInput | DocumentCabinetOrderByWithAggregationInput[]
    by: DocumentCabinetScalarFieldEnum[] | DocumentCabinetScalarFieldEnum
    having?: DocumentCabinetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DocumentCabinetCountAggregateInputType | true
    _avg?: DocumentCabinetAvgAggregateInputType
    _sum?: DocumentCabinetSumAggregateInputType
    _min?: DocumentCabinetMinAggregateInputType
    _max?: DocumentCabinetMaxAggregateInputType
  }

  export type DocumentCabinetGroupByOutputType = {
    id: string
    userId: string | null
    orgId: string | null
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
    tags: string
    createdAt: Date
    updatedAt: Date
    _count: DocumentCabinetCountAggregateOutputType | null
    _avg: DocumentCabinetAvgAggregateOutputType | null
    _sum: DocumentCabinetSumAggregateOutputType | null
    _min: DocumentCabinetMinAggregateOutputType | null
    _max: DocumentCabinetMaxAggregateOutputType | null
  }

  type GetDocumentCabinetGroupByPayload<T extends DocumentCabinetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DocumentCabinetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DocumentCabinetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DocumentCabinetGroupByOutputType[P]>
            : GetScalarType<T[P], DocumentCabinetGroupByOutputType[P]>
        }
      >
    >


  export type DocumentCabinetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    orgId?: boolean
    fileName?: boolean
    fileUrl?: boolean
    fileType?: boolean
    fileSize?: boolean
    tags?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["documentCabinet"]>



  export type DocumentCabinetSelectScalar = {
    id?: boolean
    userId?: boolean
    orgId?: boolean
    fileName?: boolean
    fileUrl?: boolean
    fileType?: boolean
    fileSize?: boolean
    tags?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DocumentCabinetOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "orgId" | "fileName" | "fileUrl" | "fileType" | "fileSize" | "tags" | "createdAt" | "updatedAt", ExtArgs["result"]["documentCabinet"]>

  export type $DocumentCabinetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DocumentCabinet"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string | null
      orgId: string | null
      fileName: string
      fileUrl: string
      fileType: string
      fileSize: number
      tags: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["documentCabinet"]>
    composites: {}
  }

  type DocumentCabinetGetPayload<S extends boolean | null | undefined | DocumentCabinetDefaultArgs> = $Result.GetResult<Prisma.$DocumentCabinetPayload, S>

  type DocumentCabinetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DocumentCabinetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DocumentCabinetCountAggregateInputType | true
    }

  export interface DocumentCabinetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DocumentCabinet'], meta: { name: 'DocumentCabinet' } }
    /**
     * Find zero or one DocumentCabinet that matches the filter.
     * @param {DocumentCabinetFindUniqueArgs} args - Arguments to find a DocumentCabinet
     * @example
     * // Get one DocumentCabinet
     * const documentCabinet = await prisma.documentCabinet.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DocumentCabinetFindUniqueArgs>(args: SelectSubset<T, DocumentCabinetFindUniqueArgs<ExtArgs>>): Prisma__DocumentCabinetClient<$Result.GetResult<Prisma.$DocumentCabinetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DocumentCabinet that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DocumentCabinetFindUniqueOrThrowArgs} args - Arguments to find a DocumentCabinet
     * @example
     * // Get one DocumentCabinet
     * const documentCabinet = await prisma.documentCabinet.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DocumentCabinetFindUniqueOrThrowArgs>(args: SelectSubset<T, DocumentCabinetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DocumentCabinetClient<$Result.GetResult<Prisma.$DocumentCabinetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DocumentCabinet that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentCabinetFindFirstArgs} args - Arguments to find a DocumentCabinet
     * @example
     * // Get one DocumentCabinet
     * const documentCabinet = await prisma.documentCabinet.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DocumentCabinetFindFirstArgs>(args?: SelectSubset<T, DocumentCabinetFindFirstArgs<ExtArgs>>): Prisma__DocumentCabinetClient<$Result.GetResult<Prisma.$DocumentCabinetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DocumentCabinet that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentCabinetFindFirstOrThrowArgs} args - Arguments to find a DocumentCabinet
     * @example
     * // Get one DocumentCabinet
     * const documentCabinet = await prisma.documentCabinet.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DocumentCabinetFindFirstOrThrowArgs>(args?: SelectSubset<T, DocumentCabinetFindFirstOrThrowArgs<ExtArgs>>): Prisma__DocumentCabinetClient<$Result.GetResult<Prisma.$DocumentCabinetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DocumentCabinets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentCabinetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DocumentCabinets
     * const documentCabinets = await prisma.documentCabinet.findMany()
     * 
     * // Get first 10 DocumentCabinets
     * const documentCabinets = await prisma.documentCabinet.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const documentCabinetWithIdOnly = await prisma.documentCabinet.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DocumentCabinetFindManyArgs>(args?: SelectSubset<T, DocumentCabinetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentCabinetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DocumentCabinet.
     * @param {DocumentCabinetCreateArgs} args - Arguments to create a DocumentCabinet.
     * @example
     * // Create one DocumentCabinet
     * const DocumentCabinet = await prisma.documentCabinet.create({
     *   data: {
     *     // ... data to create a DocumentCabinet
     *   }
     * })
     * 
     */
    create<T extends DocumentCabinetCreateArgs>(args: SelectSubset<T, DocumentCabinetCreateArgs<ExtArgs>>): Prisma__DocumentCabinetClient<$Result.GetResult<Prisma.$DocumentCabinetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DocumentCabinets.
     * @param {DocumentCabinetCreateManyArgs} args - Arguments to create many DocumentCabinets.
     * @example
     * // Create many DocumentCabinets
     * const documentCabinet = await prisma.documentCabinet.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DocumentCabinetCreateManyArgs>(args?: SelectSubset<T, DocumentCabinetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a DocumentCabinet.
     * @param {DocumentCabinetDeleteArgs} args - Arguments to delete one DocumentCabinet.
     * @example
     * // Delete one DocumentCabinet
     * const DocumentCabinet = await prisma.documentCabinet.delete({
     *   where: {
     *     // ... filter to delete one DocumentCabinet
     *   }
     * })
     * 
     */
    delete<T extends DocumentCabinetDeleteArgs>(args: SelectSubset<T, DocumentCabinetDeleteArgs<ExtArgs>>): Prisma__DocumentCabinetClient<$Result.GetResult<Prisma.$DocumentCabinetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DocumentCabinet.
     * @param {DocumentCabinetUpdateArgs} args - Arguments to update one DocumentCabinet.
     * @example
     * // Update one DocumentCabinet
     * const documentCabinet = await prisma.documentCabinet.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DocumentCabinetUpdateArgs>(args: SelectSubset<T, DocumentCabinetUpdateArgs<ExtArgs>>): Prisma__DocumentCabinetClient<$Result.GetResult<Prisma.$DocumentCabinetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DocumentCabinets.
     * @param {DocumentCabinetDeleteManyArgs} args - Arguments to filter DocumentCabinets to delete.
     * @example
     * // Delete a few DocumentCabinets
     * const { count } = await prisma.documentCabinet.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DocumentCabinetDeleteManyArgs>(args?: SelectSubset<T, DocumentCabinetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DocumentCabinets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentCabinetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DocumentCabinets
     * const documentCabinet = await prisma.documentCabinet.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DocumentCabinetUpdateManyArgs>(args: SelectSubset<T, DocumentCabinetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DocumentCabinet.
     * @param {DocumentCabinetUpsertArgs} args - Arguments to update or create a DocumentCabinet.
     * @example
     * // Update or create a DocumentCabinet
     * const documentCabinet = await prisma.documentCabinet.upsert({
     *   create: {
     *     // ... data to create a DocumentCabinet
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DocumentCabinet we want to update
     *   }
     * })
     */
    upsert<T extends DocumentCabinetUpsertArgs>(args: SelectSubset<T, DocumentCabinetUpsertArgs<ExtArgs>>): Prisma__DocumentCabinetClient<$Result.GetResult<Prisma.$DocumentCabinetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DocumentCabinets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentCabinetCountArgs} args - Arguments to filter DocumentCabinets to count.
     * @example
     * // Count the number of DocumentCabinets
     * const count = await prisma.documentCabinet.count({
     *   where: {
     *     // ... the filter for the DocumentCabinets we want to count
     *   }
     * })
    **/
    count<T extends DocumentCabinetCountArgs>(
      args?: Subset<T, DocumentCabinetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DocumentCabinetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DocumentCabinet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentCabinetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DocumentCabinetAggregateArgs>(args: Subset<T, DocumentCabinetAggregateArgs>): Prisma.PrismaPromise<GetDocumentCabinetAggregateType<T>>

    /**
     * Group by DocumentCabinet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentCabinetGroupByArgs} args - Group by arguments.
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
      T extends DocumentCabinetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DocumentCabinetGroupByArgs['orderBy'] }
        : { orderBy?: DocumentCabinetGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DocumentCabinetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDocumentCabinetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DocumentCabinet model
   */
  readonly fields: DocumentCabinetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DocumentCabinet.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DocumentCabinetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the DocumentCabinet model
   */
  interface DocumentCabinetFieldRefs {
    readonly id: FieldRef<"DocumentCabinet", 'String'>
    readonly userId: FieldRef<"DocumentCabinet", 'String'>
    readonly orgId: FieldRef<"DocumentCabinet", 'String'>
    readonly fileName: FieldRef<"DocumentCabinet", 'String'>
    readonly fileUrl: FieldRef<"DocumentCabinet", 'String'>
    readonly fileType: FieldRef<"DocumentCabinet", 'String'>
    readonly fileSize: FieldRef<"DocumentCabinet", 'Int'>
    readonly tags: FieldRef<"DocumentCabinet", 'String'>
    readonly createdAt: FieldRef<"DocumentCabinet", 'DateTime'>
    readonly updatedAt: FieldRef<"DocumentCabinet", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DocumentCabinet findUnique
   */
  export type DocumentCabinetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentCabinet
     */
    select?: DocumentCabinetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentCabinet
     */
    omit?: DocumentCabinetOmit<ExtArgs> | null
    /**
     * Filter, which DocumentCabinet to fetch.
     */
    where: DocumentCabinetWhereUniqueInput
  }

  /**
   * DocumentCabinet findUniqueOrThrow
   */
  export type DocumentCabinetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentCabinet
     */
    select?: DocumentCabinetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentCabinet
     */
    omit?: DocumentCabinetOmit<ExtArgs> | null
    /**
     * Filter, which DocumentCabinet to fetch.
     */
    where: DocumentCabinetWhereUniqueInput
  }

  /**
   * DocumentCabinet findFirst
   */
  export type DocumentCabinetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentCabinet
     */
    select?: DocumentCabinetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentCabinet
     */
    omit?: DocumentCabinetOmit<ExtArgs> | null
    /**
     * Filter, which DocumentCabinet to fetch.
     */
    where?: DocumentCabinetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentCabinets to fetch.
     */
    orderBy?: DocumentCabinetOrderByWithRelationInput | DocumentCabinetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DocumentCabinets.
     */
    cursor?: DocumentCabinetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentCabinets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentCabinets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DocumentCabinets.
     */
    distinct?: DocumentCabinetScalarFieldEnum | DocumentCabinetScalarFieldEnum[]
  }

  /**
   * DocumentCabinet findFirstOrThrow
   */
  export type DocumentCabinetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentCabinet
     */
    select?: DocumentCabinetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentCabinet
     */
    omit?: DocumentCabinetOmit<ExtArgs> | null
    /**
     * Filter, which DocumentCabinet to fetch.
     */
    where?: DocumentCabinetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentCabinets to fetch.
     */
    orderBy?: DocumentCabinetOrderByWithRelationInput | DocumentCabinetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DocumentCabinets.
     */
    cursor?: DocumentCabinetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentCabinets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentCabinets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DocumentCabinets.
     */
    distinct?: DocumentCabinetScalarFieldEnum | DocumentCabinetScalarFieldEnum[]
  }

  /**
   * DocumentCabinet findMany
   */
  export type DocumentCabinetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentCabinet
     */
    select?: DocumentCabinetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentCabinet
     */
    omit?: DocumentCabinetOmit<ExtArgs> | null
    /**
     * Filter, which DocumentCabinets to fetch.
     */
    where?: DocumentCabinetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentCabinets to fetch.
     */
    orderBy?: DocumentCabinetOrderByWithRelationInput | DocumentCabinetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DocumentCabinets.
     */
    cursor?: DocumentCabinetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentCabinets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentCabinets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DocumentCabinets.
     */
    distinct?: DocumentCabinetScalarFieldEnum | DocumentCabinetScalarFieldEnum[]
  }

  /**
   * DocumentCabinet create
   */
  export type DocumentCabinetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentCabinet
     */
    select?: DocumentCabinetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentCabinet
     */
    omit?: DocumentCabinetOmit<ExtArgs> | null
    /**
     * The data needed to create a DocumentCabinet.
     */
    data: XOR<DocumentCabinetCreateInput, DocumentCabinetUncheckedCreateInput>
  }

  /**
   * DocumentCabinet createMany
   */
  export type DocumentCabinetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DocumentCabinets.
     */
    data: DocumentCabinetCreateManyInput | DocumentCabinetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DocumentCabinet update
   */
  export type DocumentCabinetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentCabinet
     */
    select?: DocumentCabinetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentCabinet
     */
    omit?: DocumentCabinetOmit<ExtArgs> | null
    /**
     * The data needed to update a DocumentCabinet.
     */
    data: XOR<DocumentCabinetUpdateInput, DocumentCabinetUncheckedUpdateInput>
    /**
     * Choose, which DocumentCabinet to update.
     */
    where: DocumentCabinetWhereUniqueInput
  }

  /**
   * DocumentCabinet updateMany
   */
  export type DocumentCabinetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DocumentCabinets.
     */
    data: XOR<DocumentCabinetUpdateManyMutationInput, DocumentCabinetUncheckedUpdateManyInput>
    /**
     * Filter which DocumentCabinets to update
     */
    where?: DocumentCabinetWhereInput
    /**
     * Limit how many DocumentCabinets to update.
     */
    limit?: number
  }

  /**
   * DocumentCabinet upsert
   */
  export type DocumentCabinetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentCabinet
     */
    select?: DocumentCabinetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentCabinet
     */
    omit?: DocumentCabinetOmit<ExtArgs> | null
    /**
     * The filter to search for the DocumentCabinet to update in case it exists.
     */
    where: DocumentCabinetWhereUniqueInput
    /**
     * In case the DocumentCabinet found by the `where` argument doesn't exist, create a new DocumentCabinet with this data.
     */
    create: XOR<DocumentCabinetCreateInput, DocumentCabinetUncheckedCreateInput>
    /**
     * In case the DocumentCabinet was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DocumentCabinetUpdateInput, DocumentCabinetUncheckedUpdateInput>
  }

  /**
   * DocumentCabinet delete
   */
  export type DocumentCabinetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentCabinet
     */
    select?: DocumentCabinetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentCabinet
     */
    omit?: DocumentCabinetOmit<ExtArgs> | null
    /**
     * Filter which DocumentCabinet to delete.
     */
    where: DocumentCabinetWhereUniqueInput
  }

  /**
   * DocumentCabinet deleteMany
   */
  export type DocumentCabinetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DocumentCabinets to delete
     */
    where?: DocumentCabinetWhereInput
    /**
     * Limit how many DocumentCabinets to delete.
     */
    limit?: number
  }

  /**
   * DocumentCabinet without action
   */
  export type DocumentCabinetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentCabinet
     */
    select?: DocumentCabinetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DocumentCabinet
     */
    omit?: DocumentCabinetOmit<ExtArgs> | null
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


  export const PublicCommentScalarFieldEnum: {
    id: 'id',
    consultationId: 'consultationId',
    fullName: 'fullName',
    email: 'email',
    phoneNumber: 'phoneNumber',
    content: 'content',
    status: 'status',
    moderatedBy: 'moderatedBy',
    moderatedAt: 'moderatedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PublicCommentScalarFieldEnum = (typeof PublicCommentScalarFieldEnum)[keyof typeof PublicCommentScalarFieldEnum]


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
    isIncoming: 'isIncoming',
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


  export const DocumentLogScalarFieldEnum: {
    id: 'id',
    documentId: 'documentId',
    userId: 'userId',
    userName: 'userName',
    action: 'action',
    note: 'note',
    createdAt: 'createdAt'
  };

  export type DocumentLogScalarFieldEnum = (typeof DocumentLogScalarFieldEnum)[keyof typeof DocumentLogScalarFieldEnum]


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


  export const AdministrativeProcedureScalarFieldEnum: {
    id: 'id',
    code: 'code',
    name: 'name',
    category: 'category',
    description: 'description',
    duration: 'duration',
    fee: 'fee',
    requiredDocs: 'requiredDocs',
    steps: 'steps',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AdministrativeProcedureScalarFieldEnum = (typeof AdministrativeProcedureScalarFieldEnum)[keyof typeof AdministrativeProcedureScalarFieldEnum]


  export const OneStopDossierScalarFieldEnum: {
    id: 'id',
    code: 'code',
    procedureName: 'procedureName',
    senderName: 'senderName',
    receiveDate: 'receiveDate',
    dueDate: 'dueDate',
    status: 'status',
    currentStep: 'currentStep',
    stepDetails: 'stepDetails',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OneStopDossierScalarFieldEnum = (typeof OneStopDossierScalarFieldEnum)[keyof typeof OneStopDossierScalarFieldEnum]


  export const DossierComponentScalarFieldEnum: {
    id: 'id',
    dossierId: 'dossierId',
    name: 'name',
    isRequired: 'isRequired',
    status: 'status',
    fileUrl: 'fileUrl',
    sampleFileUrl: 'sampleFileUrl',
    source: 'source',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DossierComponentScalarFieldEnum = (typeof DossierComponentScalarFieldEnum)[keyof typeof DossierComponentScalarFieldEnum]


  export const DocumentCabinetScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    orgId: 'orgId',
    fileName: 'fileName',
    fileUrl: 'fileUrl',
    fileType: 'fileType',
    fileSize: 'fileSize',
    tags: 'tags',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DocumentCabinetScalarFieldEnum = (typeof DocumentCabinetScalarFieldEnum)[keyof typeof DocumentCabinetScalarFieldEnum]


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


  export const PublicCommentOrderByRelevanceFieldEnum: {
    id: 'id',
    consultationId: 'consultationId',
    fullName: 'fullName',
    email: 'email',
    phoneNumber: 'phoneNumber',
    content: 'content',
    status: 'status',
    moderatedBy: 'moderatedBy'
  };

  export type PublicCommentOrderByRelevanceFieldEnum = (typeof PublicCommentOrderByRelevanceFieldEnum)[keyof typeof PublicCommentOrderByRelevanceFieldEnum]


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


  export const DocumentLogOrderByRelevanceFieldEnum: {
    id: 'id',
    documentId: 'documentId',
    userId: 'userId',
    userName: 'userName',
    action: 'action',
    note: 'note'
  };

  export type DocumentLogOrderByRelevanceFieldEnum = (typeof DocumentLogOrderByRelevanceFieldEnum)[keyof typeof DocumentLogOrderByRelevanceFieldEnum]


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


  export const AdministrativeProcedureOrderByRelevanceFieldEnum: {
    id: 'id',
    code: 'code',
    name: 'name',
    category: 'category',
    description: 'description',
    duration: 'duration',
    fee: 'fee',
    requiredDocs: 'requiredDocs',
    steps: 'steps'
  };

  export type AdministrativeProcedureOrderByRelevanceFieldEnum = (typeof AdministrativeProcedureOrderByRelevanceFieldEnum)[keyof typeof AdministrativeProcedureOrderByRelevanceFieldEnum]


  export const OneStopDossierOrderByRelevanceFieldEnum: {
    id: 'id',
    code: 'code',
    procedureName: 'procedureName',
    senderName: 'senderName',
    status: 'status',
    stepDetails: 'stepDetails'
  };

  export type OneStopDossierOrderByRelevanceFieldEnum = (typeof OneStopDossierOrderByRelevanceFieldEnum)[keyof typeof OneStopDossierOrderByRelevanceFieldEnum]


  export const DossierComponentOrderByRelevanceFieldEnum: {
    id: 'id',
    dossierId: 'dossierId',
    name: 'name',
    status: 'status',
    fileUrl: 'fileUrl',
    sampleFileUrl: 'sampleFileUrl',
    source: 'source'
  };

  export type DossierComponentOrderByRelevanceFieldEnum = (typeof DossierComponentOrderByRelevanceFieldEnum)[keyof typeof DossierComponentOrderByRelevanceFieldEnum]


  export const DocumentCabinetOrderByRelevanceFieldEnum: {
    id: 'id',
    userId: 'userId',
    orgId: 'orgId',
    fileName: 'fileName',
    fileUrl: 'fileUrl',
    fileType: 'fileType',
    tags: 'tags'
  };

  export type DocumentCabinetOrderByRelevanceFieldEnum = (typeof DocumentCabinetOrderByRelevanceFieldEnum)[keyof typeof DocumentCabinetOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


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
    publicComments?: PublicCommentListRelationFilter
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
    publicComments?: PublicCommentOrderByRelationAggregateInput
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
    publicComments?: PublicCommentListRelationFilter
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

  export type PublicCommentWhereInput = {
    AND?: PublicCommentWhereInput | PublicCommentWhereInput[]
    OR?: PublicCommentWhereInput[]
    NOT?: PublicCommentWhereInput | PublicCommentWhereInput[]
    id?: StringFilter<"PublicComment"> | string
    consultationId?: StringFilter<"PublicComment"> | string
    fullName?: StringFilter<"PublicComment"> | string
    email?: StringNullableFilter<"PublicComment"> | string | null
    phoneNumber?: StringNullableFilter<"PublicComment"> | string | null
    content?: StringFilter<"PublicComment"> | string
    status?: StringFilter<"PublicComment"> | string
    moderatedBy?: StringNullableFilter<"PublicComment"> | string | null
    moderatedAt?: DateTimeNullableFilter<"PublicComment"> | Date | string | null
    createdAt?: DateTimeFilter<"PublicComment"> | Date | string
    updatedAt?: DateTimeFilter<"PublicComment"> | Date | string
    consultation?: XOR<ConsultationScalarRelationFilter, ConsultationWhereInput>
  }

  export type PublicCommentOrderByWithRelationInput = {
    id?: SortOrder
    consultationId?: SortOrder
    fullName?: SortOrder
    email?: SortOrderInput | SortOrder
    phoneNumber?: SortOrderInput | SortOrder
    content?: SortOrder
    status?: SortOrder
    moderatedBy?: SortOrderInput | SortOrder
    moderatedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    consultation?: ConsultationOrderByWithRelationInput
    _relevance?: PublicCommentOrderByRelevanceInput
  }

  export type PublicCommentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PublicCommentWhereInput | PublicCommentWhereInput[]
    OR?: PublicCommentWhereInput[]
    NOT?: PublicCommentWhereInput | PublicCommentWhereInput[]
    consultationId?: StringFilter<"PublicComment"> | string
    fullName?: StringFilter<"PublicComment"> | string
    email?: StringNullableFilter<"PublicComment"> | string | null
    phoneNumber?: StringNullableFilter<"PublicComment"> | string | null
    content?: StringFilter<"PublicComment"> | string
    status?: StringFilter<"PublicComment"> | string
    moderatedBy?: StringNullableFilter<"PublicComment"> | string | null
    moderatedAt?: DateTimeNullableFilter<"PublicComment"> | Date | string | null
    createdAt?: DateTimeFilter<"PublicComment"> | Date | string
    updatedAt?: DateTimeFilter<"PublicComment"> | Date | string
    consultation?: XOR<ConsultationScalarRelationFilter, ConsultationWhereInput>
  }, "id">

  export type PublicCommentOrderByWithAggregationInput = {
    id?: SortOrder
    consultationId?: SortOrder
    fullName?: SortOrder
    email?: SortOrderInput | SortOrder
    phoneNumber?: SortOrderInput | SortOrder
    content?: SortOrder
    status?: SortOrder
    moderatedBy?: SortOrderInput | SortOrder
    moderatedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PublicCommentCountOrderByAggregateInput
    _max?: PublicCommentMaxOrderByAggregateInput
    _min?: PublicCommentMinOrderByAggregateInput
  }

  export type PublicCommentScalarWhereWithAggregatesInput = {
    AND?: PublicCommentScalarWhereWithAggregatesInput | PublicCommentScalarWhereWithAggregatesInput[]
    OR?: PublicCommentScalarWhereWithAggregatesInput[]
    NOT?: PublicCommentScalarWhereWithAggregatesInput | PublicCommentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PublicComment"> | string
    consultationId?: StringWithAggregatesFilter<"PublicComment"> | string
    fullName?: StringWithAggregatesFilter<"PublicComment"> | string
    email?: StringNullableWithAggregatesFilter<"PublicComment"> | string | null
    phoneNumber?: StringNullableWithAggregatesFilter<"PublicComment"> | string | null
    content?: StringWithAggregatesFilter<"PublicComment"> | string
    status?: StringWithAggregatesFilter<"PublicComment"> | string
    moderatedBy?: StringNullableWithAggregatesFilter<"PublicComment"> | string | null
    moderatedAt?: DateTimeNullableWithAggregatesFilter<"PublicComment"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PublicComment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PublicComment"> | Date | string
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
    isIncoming?: BoolFilter<"Document"> | boolean
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
    isIncoming?: SortOrder
    fileId?: SortOrderInput | SortOrder
    signatureValid?: SortOrder
    pageCount?: SortOrder
    attachmentCount?: SortOrder
    linkedDocumentId?: SortOrderInput | SortOrder
    fiscalYear?: SortOrderInput | SortOrder
    transparencyCategory?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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
    isIncoming?: BoolFilter<"Document"> | boolean
    fileId?: StringNullableFilter<"Document"> | string | null
    signatureValid?: BoolFilter<"Document"> | boolean
    pageCount?: IntFilter<"Document"> | number
    attachmentCount?: IntFilter<"Document"> | number
    linkedDocumentId?: StringNullableFilter<"Document"> | string | null
    fiscalYear?: IntNullableFilter<"Document"> | number | null
    transparencyCategory?: StringNullableFilter<"Document"> | string | null
    createdAt?: DateTimeFilter<"Document"> | Date | string
    updatedAt?: DateTimeFilter<"Document"> | Date | string
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
    isIncoming?: SortOrder
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
    isIncoming?: BoolWithAggregatesFilter<"Document"> | boolean
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

  export type DocumentLogWhereInput = {
    AND?: DocumentLogWhereInput | DocumentLogWhereInput[]
    OR?: DocumentLogWhereInput[]
    NOT?: DocumentLogWhereInput | DocumentLogWhereInput[]
    id?: StringFilter<"DocumentLog"> | string
    documentId?: StringFilter<"DocumentLog"> | string
    userId?: StringNullableFilter<"DocumentLog"> | string | null
    userName?: StringNullableFilter<"DocumentLog"> | string | null
    action?: StringFilter<"DocumentLog"> | string
    note?: StringNullableFilter<"DocumentLog"> | string | null
    createdAt?: DateTimeFilter<"DocumentLog"> | Date | string
  }

  export type DocumentLogOrderByWithRelationInput = {
    id?: SortOrder
    documentId?: SortOrder
    userId?: SortOrderInput | SortOrder
    userName?: SortOrderInput | SortOrder
    action?: SortOrder
    note?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _relevance?: DocumentLogOrderByRelevanceInput
  }

  export type DocumentLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DocumentLogWhereInput | DocumentLogWhereInput[]
    OR?: DocumentLogWhereInput[]
    NOT?: DocumentLogWhereInput | DocumentLogWhereInput[]
    documentId?: StringFilter<"DocumentLog"> | string
    userId?: StringNullableFilter<"DocumentLog"> | string | null
    userName?: StringNullableFilter<"DocumentLog"> | string | null
    action?: StringFilter<"DocumentLog"> | string
    note?: StringNullableFilter<"DocumentLog"> | string | null
    createdAt?: DateTimeFilter<"DocumentLog"> | Date | string
  }, "id">

  export type DocumentLogOrderByWithAggregationInput = {
    id?: SortOrder
    documentId?: SortOrder
    userId?: SortOrderInput | SortOrder
    userName?: SortOrderInput | SortOrder
    action?: SortOrder
    note?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: DocumentLogCountOrderByAggregateInput
    _max?: DocumentLogMaxOrderByAggregateInput
    _min?: DocumentLogMinOrderByAggregateInput
  }

  export type DocumentLogScalarWhereWithAggregatesInput = {
    AND?: DocumentLogScalarWhereWithAggregatesInput | DocumentLogScalarWhereWithAggregatesInput[]
    OR?: DocumentLogScalarWhereWithAggregatesInput[]
    NOT?: DocumentLogScalarWhereWithAggregatesInput | DocumentLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DocumentLog"> | string
    documentId?: StringWithAggregatesFilter<"DocumentLog"> | string
    userId?: StringNullableWithAggregatesFilter<"DocumentLog"> | string | null
    userName?: StringNullableWithAggregatesFilter<"DocumentLog"> | string | null
    action?: StringWithAggregatesFilter<"DocumentLog"> | string
    note?: StringNullableWithAggregatesFilter<"DocumentLog"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"DocumentLog"> | Date | string
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

  export type AdministrativeProcedureWhereInput = {
    AND?: AdministrativeProcedureWhereInput | AdministrativeProcedureWhereInput[]
    OR?: AdministrativeProcedureWhereInput[]
    NOT?: AdministrativeProcedureWhereInput | AdministrativeProcedureWhereInput[]
    id?: StringFilter<"AdministrativeProcedure"> | string
    code?: StringFilter<"AdministrativeProcedure"> | string
    name?: StringFilter<"AdministrativeProcedure"> | string
    category?: StringFilter<"AdministrativeProcedure"> | string
    description?: StringNullableFilter<"AdministrativeProcedure"> | string | null
    duration?: StringFilter<"AdministrativeProcedure"> | string
    fee?: StringFilter<"AdministrativeProcedure"> | string
    requiredDocs?: StringFilter<"AdministrativeProcedure"> | string
    steps?: StringFilter<"AdministrativeProcedure"> | string
    createdAt?: DateTimeFilter<"AdministrativeProcedure"> | Date | string
    updatedAt?: DateTimeFilter<"AdministrativeProcedure"> | Date | string
  }

  export type AdministrativeProcedureOrderByWithRelationInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    category?: SortOrder
    description?: SortOrderInput | SortOrder
    duration?: SortOrder
    fee?: SortOrder
    requiredDocs?: SortOrder
    steps?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: AdministrativeProcedureOrderByRelevanceInput
  }

  export type AdministrativeProcedureWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: AdministrativeProcedureWhereInput | AdministrativeProcedureWhereInput[]
    OR?: AdministrativeProcedureWhereInput[]
    NOT?: AdministrativeProcedureWhereInput | AdministrativeProcedureWhereInput[]
    name?: StringFilter<"AdministrativeProcedure"> | string
    category?: StringFilter<"AdministrativeProcedure"> | string
    description?: StringNullableFilter<"AdministrativeProcedure"> | string | null
    duration?: StringFilter<"AdministrativeProcedure"> | string
    fee?: StringFilter<"AdministrativeProcedure"> | string
    requiredDocs?: StringFilter<"AdministrativeProcedure"> | string
    steps?: StringFilter<"AdministrativeProcedure"> | string
    createdAt?: DateTimeFilter<"AdministrativeProcedure"> | Date | string
    updatedAt?: DateTimeFilter<"AdministrativeProcedure"> | Date | string
  }, "id" | "code">

  export type AdministrativeProcedureOrderByWithAggregationInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    category?: SortOrder
    description?: SortOrderInput | SortOrder
    duration?: SortOrder
    fee?: SortOrder
    requiredDocs?: SortOrder
    steps?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AdministrativeProcedureCountOrderByAggregateInput
    _max?: AdministrativeProcedureMaxOrderByAggregateInput
    _min?: AdministrativeProcedureMinOrderByAggregateInput
  }

  export type AdministrativeProcedureScalarWhereWithAggregatesInput = {
    AND?: AdministrativeProcedureScalarWhereWithAggregatesInput | AdministrativeProcedureScalarWhereWithAggregatesInput[]
    OR?: AdministrativeProcedureScalarWhereWithAggregatesInput[]
    NOT?: AdministrativeProcedureScalarWhereWithAggregatesInput | AdministrativeProcedureScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AdministrativeProcedure"> | string
    code?: StringWithAggregatesFilter<"AdministrativeProcedure"> | string
    name?: StringWithAggregatesFilter<"AdministrativeProcedure"> | string
    category?: StringWithAggregatesFilter<"AdministrativeProcedure"> | string
    description?: StringNullableWithAggregatesFilter<"AdministrativeProcedure"> | string | null
    duration?: StringWithAggregatesFilter<"AdministrativeProcedure"> | string
    fee?: StringWithAggregatesFilter<"AdministrativeProcedure"> | string
    requiredDocs?: StringWithAggregatesFilter<"AdministrativeProcedure"> | string
    steps?: StringWithAggregatesFilter<"AdministrativeProcedure"> | string
    createdAt?: DateTimeWithAggregatesFilter<"AdministrativeProcedure"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AdministrativeProcedure"> | Date | string
  }

  export type OneStopDossierWhereInput = {
    AND?: OneStopDossierWhereInput | OneStopDossierWhereInput[]
    OR?: OneStopDossierWhereInput[]
    NOT?: OneStopDossierWhereInput | OneStopDossierWhereInput[]
    id?: StringFilter<"OneStopDossier"> | string
    code?: StringFilter<"OneStopDossier"> | string
    procedureName?: StringNullableFilter<"OneStopDossier"> | string | null
    senderName?: StringFilter<"OneStopDossier"> | string
    receiveDate?: DateTimeFilter<"OneStopDossier"> | Date | string
    dueDate?: DateTimeFilter<"OneStopDossier"> | Date | string
    status?: StringFilter<"OneStopDossier"> | string
    currentStep?: IntFilter<"OneStopDossier"> | number
    stepDetails?: StringNullableFilter<"OneStopDossier"> | string | null
    createdAt?: DateTimeFilter<"OneStopDossier"> | Date | string
    updatedAt?: DateTimeFilter<"OneStopDossier"> | Date | string
  }

  export type OneStopDossierOrderByWithRelationInput = {
    id?: SortOrder
    code?: SortOrder
    procedureName?: SortOrderInput | SortOrder
    senderName?: SortOrder
    receiveDate?: SortOrder
    dueDate?: SortOrder
    status?: SortOrder
    currentStep?: SortOrder
    stepDetails?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: OneStopDossierOrderByRelevanceInput
  }

  export type OneStopDossierWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: OneStopDossierWhereInput | OneStopDossierWhereInput[]
    OR?: OneStopDossierWhereInput[]
    NOT?: OneStopDossierWhereInput | OneStopDossierWhereInput[]
    procedureName?: StringNullableFilter<"OneStopDossier"> | string | null
    senderName?: StringFilter<"OneStopDossier"> | string
    receiveDate?: DateTimeFilter<"OneStopDossier"> | Date | string
    dueDate?: DateTimeFilter<"OneStopDossier"> | Date | string
    status?: StringFilter<"OneStopDossier"> | string
    currentStep?: IntFilter<"OneStopDossier"> | number
    stepDetails?: StringNullableFilter<"OneStopDossier"> | string | null
    createdAt?: DateTimeFilter<"OneStopDossier"> | Date | string
    updatedAt?: DateTimeFilter<"OneStopDossier"> | Date | string
  }, "id" | "code">

  export type OneStopDossierOrderByWithAggregationInput = {
    id?: SortOrder
    code?: SortOrder
    procedureName?: SortOrderInput | SortOrder
    senderName?: SortOrder
    receiveDate?: SortOrder
    dueDate?: SortOrder
    status?: SortOrder
    currentStep?: SortOrder
    stepDetails?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OneStopDossierCountOrderByAggregateInput
    _avg?: OneStopDossierAvgOrderByAggregateInput
    _max?: OneStopDossierMaxOrderByAggregateInput
    _min?: OneStopDossierMinOrderByAggregateInput
    _sum?: OneStopDossierSumOrderByAggregateInput
  }

  export type OneStopDossierScalarWhereWithAggregatesInput = {
    AND?: OneStopDossierScalarWhereWithAggregatesInput | OneStopDossierScalarWhereWithAggregatesInput[]
    OR?: OneStopDossierScalarWhereWithAggregatesInput[]
    NOT?: OneStopDossierScalarWhereWithAggregatesInput | OneStopDossierScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OneStopDossier"> | string
    code?: StringWithAggregatesFilter<"OneStopDossier"> | string
    procedureName?: StringNullableWithAggregatesFilter<"OneStopDossier"> | string | null
    senderName?: StringWithAggregatesFilter<"OneStopDossier"> | string
    receiveDate?: DateTimeWithAggregatesFilter<"OneStopDossier"> | Date | string
    dueDate?: DateTimeWithAggregatesFilter<"OneStopDossier"> | Date | string
    status?: StringWithAggregatesFilter<"OneStopDossier"> | string
    currentStep?: IntWithAggregatesFilter<"OneStopDossier"> | number
    stepDetails?: StringNullableWithAggregatesFilter<"OneStopDossier"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"OneStopDossier"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"OneStopDossier"> | Date | string
  }

  export type DossierComponentWhereInput = {
    AND?: DossierComponentWhereInput | DossierComponentWhereInput[]
    OR?: DossierComponentWhereInput[]
    NOT?: DossierComponentWhereInput | DossierComponentWhereInput[]
    id?: StringFilter<"DossierComponent"> | string
    dossierId?: StringFilter<"DossierComponent"> | string
    name?: StringFilter<"DossierComponent"> | string
    isRequired?: BoolFilter<"DossierComponent"> | boolean
    status?: StringFilter<"DossierComponent"> | string
    fileUrl?: StringNullableFilter<"DossierComponent"> | string | null
    sampleFileUrl?: StringNullableFilter<"DossierComponent"> | string | null
    source?: StringNullableFilter<"DossierComponent"> | string | null
    createdAt?: DateTimeFilter<"DossierComponent"> | Date | string
    updatedAt?: DateTimeFilter<"DossierComponent"> | Date | string
  }

  export type DossierComponentOrderByWithRelationInput = {
    id?: SortOrder
    dossierId?: SortOrder
    name?: SortOrder
    isRequired?: SortOrder
    status?: SortOrder
    fileUrl?: SortOrderInput | SortOrder
    sampleFileUrl?: SortOrderInput | SortOrder
    source?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: DossierComponentOrderByRelevanceInput
  }

  export type DossierComponentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DossierComponentWhereInput | DossierComponentWhereInput[]
    OR?: DossierComponentWhereInput[]
    NOT?: DossierComponentWhereInput | DossierComponentWhereInput[]
    dossierId?: StringFilter<"DossierComponent"> | string
    name?: StringFilter<"DossierComponent"> | string
    isRequired?: BoolFilter<"DossierComponent"> | boolean
    status?: StringFilter<"DossierComponent"> | string
    fileUrl?: StringNullableFilter<"DossierComponent"> | string | null
    sampleFileUrl?: StringNullableFilter<"DossierComponent"> | string | null
    source?: StringNullableFilter<"DossierComponent"> | string | null
    createdAt?: DateTimeFilter<"DossierComponent"> | Date | string
    updatedAt?: DateTimeFilter<"DossierComponent"> | Date | string
  }, "id">

  export type DossierComponentOrderByWithAggregationInput = {
    id?: SortOrder
    dossierId?: SortOrder
    name?: SortOrder
    isRequired?: SortOrder
    status?: SortOrder
    fileUrl?: SortOrderInput | SortOrder
    sampleFileUrl?: SortOrderInput | SortOrder
    source?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DossierComponentCountOrderByAggregateInput
    _max?: DossierComponentMaxOrderByAggregateInput
    _min?: DossierComponentMinOrderByAggregateInput
  }

  export type DossierComponentScalarWhereWithAggregatesInput = {
    AND?: DossierComponentScalarWhereWithAggregatesInput | DossierComponentScalarWhereWithAggregatesInput[]
    OR?: DossierComponentScalarWhereWithAggregatesInput[]
    NOT?: DossierComponentScalarWhereWithAggregatesInput | DossierComponentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DossierComponent"> | string
    dossierId?: StringWithAggregatesFilter<"DossierComponent"> | string
    name?: StringWithAggregatesFilter<"DossierComponent"> | string
    isRequired?: BoolWithAggregatesFilter<"DossierComponent"> | boolean
    status?: StringWithAggregatesFilter<"DossierComponent"> | string
    fileUrl?: StringNullableWithAggregatesFilter<"DossierComponent"> | string | null
    sampleFileUrl?: StringNullableWithAggregatesFilter<"DossierComponent"> | string | null
    source?: StringNullableWithAggregatesFilter<"DossierComponent"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"DossierComponent"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DossierComponent"> | Date | string
  }

  export type DocumentCabinetWhereInput = {
    AND?: DocumentCabinetWhereInput | DocumentCabinetWhereInput[]
    OR?: DocumentCabinetWhereInput[]
    NOT?: DocumentCabinetWhereInput | DocumentCabinetWhereInput[]
    id?: StringFilter<"DocumentCabinet"> | string
    userId?: StringNullableFilter<"DocumentCabinet"> | string | null
    orgId?: StringNullableFilter<"DocumentCabinet"> | string | null
    fileName?: StringFilter<"DocumentCabinet"> | string
    fileUrl?: StringFilter<"DocumentCabinet"> | string
    fileType?: StringFilter<"DocumentCabinet"> | string
    fileSize?: IntFilter<"DocumentCabinet"> | number
    tags?: StringFilter<"DocumentCabinet"> | string
    createdAt?: DateTimeFilter<"DocumentCabinet"> | Date | string
    updatedAt?: DateTimeFilter<"DocumentCabinet"> | Date | string
  }

  export type DocumentCabinetOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    orgId?: SortOrderInput | SortOrder
    fileName?: SortOrder
    fileUrl?: SortOrder
    fileType?: SortOrder
    fileSize?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: DocumentCabinetOrderByRelevanceInput
  }

  export type DocumentCabinetWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DocumentCabinetWhereInput | DocumentCabinetWhereInput[]
    OR?: DocumentCabinetWhereInput[]
    NOT?: DocumentCabinetWhereInput | DocumentCabinetWhereInput[]
    userId?: StringNullableFilter<"DocumentCabinet"> | string | null
    orgId?: StringNullableFilter<"DocumentCabinet"> | string | null
    fileName?: StringFilter<"DocumentCabinet"> | string
    fileUrl?: StringFilter<"DocumentCabinet"> | string
    fileType?: StringFilter<"DocumentCabinet"> | string
    fileSize?: IntFilter<"DocumentCabinet"> | number
    tags?: StringFilter<"DocumentCabinet"> | string
    createdAt?: DateTimeFilter<"DocumentCabinet"> | Date | string
    updatedAt?: DateTimeFilter<"DocumentCabinet"> | Date | string
  }, "id">

  export type DocumentCabinetOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    orgId?: SortOrderInput | SortOrder
    fileName?: SortOrder
    fileUrl?: SortOrder
    fileType?: SortOrder
    fileSize?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DocumentCabinetCountOrderByAggregateInput
    _avg?: DocumentCabinetAvgOrderByAggregateInput
    _max?: DocumentCabinetMaxOrderByAggregateInput
    _min?: DocumentCabinetMinOrderByAggregateInput
    _sum?: DocumentCabinetSumOrderByAggregateInput
  }

  export type DocumentCabinetScalarWhereWithAggregatesInput = {
    AND?: DocumentCabinetScalarWhereWithAggregatesInput | DocumentCabinetScalarWhereWithAggregatesInput[]
    OR?: DocumentCabinetScalarWhereWithAggregatesInput[]
    NOT?: DocumentCabinetScalarWhereWithAggregatesInput | DocumentCabinetScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DocumentCabinet"> | string
    userId?: StringNullableWithAggregatesFilter<"DocumentCabinet"> | string | null
    orgId?: StringNullableWithAggregatesFilter<"DocumentCabinet"> | string | null
    fileName?: StringWithAggregatesFilter<"DocumentCabinet"> | string
    fileUrl?: StringWithAggregatesFilter<"DocumentCabinet"> | string
    fileType?: StringWithAggregatesFilter<"DocumentCabinet"> | string
    fileSize?: IntWithAggregatesFilter<"DocumentCabinet"> | number
    tags?: StringWithAggregatesFilter<"DocumentCabinet"> | string
    createdAt?: DateTimeWithAggregatesFilter<"DocumentCabinet"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DocumentCabinet"> | Date | string
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
    publicComments?: PublicCommentCreateNestedManyWithoutConsultationInput
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
    publicComments?: PublicCommentUncheckedCreateNestedManyWithoutConsultationInput
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
    publicComments?: PublicCommentUpdateManyWithoutConsultationNestedInput
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
    publicComments?: PublicCommentUncheckedUpdateManyWithoutConsultationNestedInput
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

  export type PublicCommentCreateInput = {
    id?: string
    fullName: string
    email?: string | null
    phoneNumber?: string | null
    content: string
    status?: string
    moderatedBy?: string | null
    moderatedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    consultation: ConsultationCreateNestedOneWithoutPublicCommentsInput
  }

  export type PublicCommentUncheckedCreateInput = {
    id?: string
    consultationId: string
    fullName: string
    email?: string | null
    phoneNumber?: string | null
    content: string
    status?: string
    moderatedBy?: string | null
    moderatedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PublicCommentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consultation?: ConsultationUpdateOneRequiredWithoutPublicCommentsNestedInput
  }

  export type PublicCommentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    consultationId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PublicCommentCreateManyInput = {
    id?: string
    consultationId: string
    fullName: string
    email?: string | null
    phoneNumber?: string | null
    content: string
    status?: string
    moderatedBy?: string | null
    moderatedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PublicCommentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PublicCommentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    consultationId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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
    isIncoming?: boolean
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
    isIncoming?: boolean
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
    isIncoming?: BoolFieldUpdateOperationsInput | boolean
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
    isIncoming?: BoolFieldUpdateOperationsInput | boolean
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
    isIncoming?: boolean
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
    isIncoming?: BoolFieldUpdateOperationsInput | boolean
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
    isIncoming?: BoolFieldUpdateOperationsInput | boolean
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

  export type DocumentLogCreateInput = {
    id?: string
    documentId: string
    userId?: string | null
    userName?: string | null
    action: string
    note?: string | null
    createdAt?: Date | string
  }

  export type DocumentLogUncheckedCreateInput = {
    id?: string
    documentId: string
    userId?: string | null
    userName?: string | null
    action: string
    note?: string | null
    createdAt?: Date | string
  }

  export type DocumentLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentLogCreateManyInput = {
    id?: string
    documentId: string
    userId?: string | null
    userName?: string | null
    action: string
    note?: string | null
    createdAt?: Date | string
  }

  export type DocumentLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type AdministrativeProcedureCreateInput = {
    id?: string
    code: string
    name: string
    category: string
    description?: string | null
    duration: string
    fee?: string
    requiredDocs: string
    steps: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdministrativeProcedureUncheckedCreateInput = {
    id?: string
    code: string
    name: string
    category: string
    description?: string | null
    duration: string
    fee?: string
    requiredDocs: string
    steps: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdministrativeProcedureUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    duration?: StringFieldUpdateOperationsInput | string
    fee?: StringFieldUpdateOperationsInput | string
    requiredDocs?: StringFieldUpdateOperationsInput | string
    steps?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdministrativeProcedureUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    duration?: StringFieldUpdateOperationsInput | string
    fee?: StringFieldUpdateOperationsInput | string
    requiredDocs?: StringFieldUpdateOperationsInput | string
    steps?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdministrativeProcedureCreateManyInput = {
    id?: string
    code: string
    name: string
    category: string
    description?: string | null
    duration: string
    fee?: string
    requiredDocs: string
    steps: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdministrativeProcedureUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    duration?: StringFieldUpdateOperationsInput | string
    fee?: StringFieldUpdateOperationsInput | string
    requiredDocs?: StringFieldUpdateOperationsInput | string
    steps?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdministrativeProcedureUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    duration?: StringFieldUpdateOperationsInput | string
    fee?: StringFieldUpdateOperationsInput | string
    requiredDocs?: StringFieldUpdateOperationsInput | string
    steps?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OneStopDossierCreateInput = {
    id?: string
    code: string
    procedureName?: string | null
    senderName: string
    receiveDate: Date | string
    dueDate: Date | string
    status?: string
    currentStep?: number
    stepDetails?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OneStopDossierUncheckedCreateInput = {
    id?: string
    code: string
    procedureName?: string | null
    senderName: string
    receiveDate: Date | string
    dueDate: Date | string
    status?: string
    currentStep?: number
    stepDetails?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OneStopDossierUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    procedureName?: NullableStringFieldUpdateOperationsInput | string | null
    senderName?: StringFieldUpdateOperationsInput | string
    receiveDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: IntFieldUpdateOperationsInput | number
    stepDetails?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OneStopDossierUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    procedureName?: NullableStringFieldUpdateOperationsInput | string | null
    senderName?: StringFieldUpdateOperationsInput | string
    receiveDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: IntFieldUpdateOperationsInput | number
    stepDetails?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OneStopDossierCreateManyInput = {
    id?: string
    code: string
    procedureName?: string | null
    senderName: string
    receiveDate: Date | string
    dueDate: Date | string
    status?: string
    currentStep?: number
    stepDetails?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OneStopDossierUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    procedureName?: NullableStringFieldUpdateOperationsInput | string | null
    senderName?: StringFieldUpdateOperationsInput | string
    receiveDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: IntFieldUpdateOperationsInput | number
    stepDetails?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OneStopDossierUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    procedureName?: NullableStringFieldUpdateOperationsInput | string | null
    senderName?: StringFieldUpdateOperationsInput | string
    receiveDate?: DateTimeFieldUpdateOperationsInput | Date | string
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: IntFieldUpdateOperationsInput | number
    stepDetails?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DossierComponentCreateInput = {
    id?: string
    dossierId: string
    name: string
    isRequired?: boolean
    status?: string
    fileUrl?: string | null
    sampleFileUrl?: string | null
    source?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DossierComponentUncheckedCreateInput = {
    id?: string
    dossierId: string
    name: string
    isRequired?: boolean
    status?: string
    fileUrl?: string | null
    sampleFileUrl?: string | null
    source?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DossierComponentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    dossierId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    status?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    sampleFileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DossierComponentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    dossierId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    status?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    sampleFileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DossierComponentCreateManyInput = {
    id?: string
    dossierId: string
    name: string
    isRequired?: boolean
    status?: string
    fileUrl?: string | null
    sampleFileUrl?: string | null
    source?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DossierComponentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    dossierId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    status?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    sampleFileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DossierComponentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    dossierId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    status?: StringFieldUpdateOperationsInput | string
    fileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    sampleFileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentCabinetCreateInput = {
    id?: string
    userId?: string | null
    orgId?: string | null
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
    tags?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DocumentCabinetUncheckedCreateInput = {
    id?: string
    userId?: string | null
    orgId?: string | null
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
    tags?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DocumentCabinetUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: StringFieldUpdateOperationsInput | string
    fileUrl?: StringFieldUpdateOperationsInput | string
    fileType?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    tags?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentCabinetUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: StringFieldUpdateOperationsInput | string
    fileUrl?: StringFieldUpdateOperationsInput | string
    fileType?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    tags?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentCabinetCreateManyInput = {
    id?: string
    userId?: string | null
    orgId?: string | null
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
    tags?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DocumentCabinetUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: StringFieldUpdateOperationsInput | string
    fileUrl?: StringFieldUpdateOperationsInput | string
    fileType?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    tags?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentCabinetUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    orgId?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: StringFieldUpdateOperationsInput | string
    fileUrl?: StringFieldUpdateOperationsInput | string
    fileType?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    tags?: StringFieldUpdateOperationsInput | string
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ConsultationResponseListRelationFilter = {
    every?: ConsultationResponseWhereInput
    some?: ConsultationResponseWhereInput
    none?: ConsultationResponseWhereInput
  }

  export type PublicCommentListRelationFilter = {
    every?: PublicCommentWhereInput
    some?: PublicCommentWhereInput
    none?: PublicCommentWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ConsultationResponseOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PublicCommentOrderByRelationAggregateInput = {
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

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type PublicCommentOrderByRelevanceInput = {
    fields: PublicCommentOrderByRelevanceFieldEnum | PublicCommentOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type PublicCommentCountOrderByAggregateInput = {
    id?: SortOrder
    consultationId?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    phoneNumber?: SortOrder
    content?: SortOrder
    status?: SortOrder
    moderatedBy?: SortOrder
    moderatedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PublicCommentMaxOrderByAggregateInput = {
    id?: SortOrder
    consultationId?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    phoneNumber?: SortOrder
    content?: SortOrder
    status?: SortOrder
    moderatedBy?: SortOrder
    moderatedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PublicCommentMinOrderByAggregateInput = {
    id?: SortOrder
    consultationId?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    phoneNumber?: SortOrder
    content?: SortOrder
    status?: SortOrder
    moderatedBy?: SortOrder
    moderatedAt?: SortOrder
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
    isIncoming?: SortOrder
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
    isIncoming?: SortOrder
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
    isIncoming?: SortOrder
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

  export type DocumentLogOrderByRelevanceInput = {
    fields: DocumentLogOrderByRelevanceFieldEnum | DocumentLogOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type DocumentLogCountOrderByAggregateInput = {
    id?: SortOrder
    documentId?: SortOrder
    userId?: SortOrder
    userName?: SortOrder
    action?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
  }

  export type DocumentLogMaxOrderByAggregateInput = {
    id?: SortOrder
    documentId?: SortOrder
    userId?: SortOrder
    userName?: SortOrder
    action?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
  }

  export type DocumentLogMinOrderByAggregateInput = {
    id?: SortOrder
    documentId?: SortOrder
    userId?: SortOrder
    userName?: SortOrder
    action?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
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

  export type AdministrativeProcedureOrderByRelevanceInput = {
    fields: AdministrativeProcedureOrderByRelevanceFieldEnum | AdministrativeProcedureOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type AdministrativeProcedureCountOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    category?: SortOrder
    description?: SortOrder
    duration?: SortOrder
    fee?: SortOrder
    requiredDocs?: SortOrder
    steps?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AdministrativeProcedureMaxOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    category?: SortOrder
    description?: SortOrder
    duration?: SortOrder
    fee?: SortOrder
    requiredDocs?: SortOrder
    steps?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AdministrativeProcedureMinOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    category?: SortOrder
    description?: SortOrder
    duration?: SortOrder
    fee?: SortOrder
    requiredDocs?: SortOrder
    steps?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OneStopDossierOrderByRelevanceInput = {
    fields: OneStopDossierOrderByRelevanceFieldEnum | OneStopDossierOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type OneStopDossierCountOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    procedureName?: SortOrder
    senderName?: SortOrder
    receiveDate?: SortOrder
    dueDate?: SortOrder
    status?: SortOrder
    currentStep?: SortOrder
    stepDetails?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OneStopDossierAvgOrderByAggregateInput = {
    currentStep?: SortOrder
  }

  export type OneStopDossierMaxOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    procedureName?: SortOrder
    senderName?: SortOrder
    receiveDate?: SortOrder
    dueDate?: SortOrder
    status?: SortOrder
    currentStep?: SortOrder
    stepDetails?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OneStopDossierMinOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    procedureName?: SortOrder
    senderName?: SortOrder
    receiveDate?: SortOrder
    dueDate?: SortOrder
    status?: SortOrder
    currentStep?: SortOrder
    stepDetails?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OneStopDossierSumOrderByAggregateInput = {
    currentStep?: SortOrder
  }

  export type DossierComponentOrderByRelevanceInput = {
    fields: DossierComponentOrderByRelevanceFieldEnum | DossierComponentOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type DossierComponentCountOrderByAggregateInput = {
    id?: SortOrder
    dossierId?: SortOrder
    name?: SortOrder
    isRequired?: SortOrder
    status?: SortOrder
    fileUrl?: SortOrder
    sampleFileUrl?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DossierComponentMaxOrderByAggregateInput = {
    id?: SortOrder
    dossierId?: SortOrder
    name?: SortOrder
    isRequired?: SortOrder
    status?: SortOrder
    fileUrl?: SortOrder
    sampleFileUrl?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DossierComponentMinOrderByAggregateInput = {
    id?: SortOrder
    dossierId?: SortOrder
    name?: SortOrder
    isRequired?: SortOrder
    status?: SortOrder
    fileUrl?: SortOrder
    sampleFileUrl?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DocumentCabinetOrderByRelevanceInput = {
    fields: DocumentCabinetOrderByRelevanceFieldEnum | DocumentCabinetOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type DocumentCabinetCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    orgId?: SortOrder
    fileName?: SortOrder
    fileUrl?: SortOrder
    fileType?: SortOrder
    fileSize?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DocumentCabinetAvgOrderByAggregateInput = {
    fileSize?: SortOrder
  }

  export type DocumentCabinetMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    orgId?: SortOrder
    fileName?: SortOrder
    fileUrl?: SortOrder
    fileType?: SortOrder
    fileSize?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DocumentCabinetMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    orgId?: SortOrder
    fileName?: SortOrder
    fileUrl?: SortOrder
    fileType?: SortOrder
    fileSize?: SortOrder
    tags?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DocumentCabinetSumOrderByAggregateInput = {
    fileSize?: SortOrder
  }

  export type ConsultationResponseCreateNestedManyWithoutConsultationInput = {
    create?: XOR<ConsultationResponseCreateWithoutConsultationInput, ConsultationResponseUncheckedCreateWithoutConsultationInput> | ConsultationResponseCreateWithoutConsultationInput[] | ConsultationResponseUncheckedCreateWithoutConsultationInput[]
    connectOrCreate?: ConsultationResponseCreateOrConnectWithoutConsultationInput | ConsultationResponseCreateOrConnectWithoutConsultationInput[]
    createMany?: ConsultationResponseCreateManyConsultationInputEnvelope
    connect?: ConsultationResponseWhereUniqueInput | ConsultationResponseWhereUniqueInput[]
  }

  export type PublicCommentCreateNestedManyWithoutConsultationInput = {
    create?: XOR<PublicCommentCreateWithoutConsultationInput, PublicCommentUncheckedCreateWithoutConsultationInput> | PublicCommentCreateWithoutConsultationInput[] | PublicCommentUncheckedCreateWithoutConsultationInput[]
    connectOrCreate?: PublicCommentCreateOrConnectWithoutConsultationInput | PublicCommentCreateOrConnectWithoutConsultationInput[]
    createMany?: PublicCommentCreateManyConsultationInputEnvelope
    connect?: PublicCommentWhereUniqueInput | PublicCommentWhereUniqueInput[]
  }

  export type ConsultationResponseUncheckedCreateNestedManyWithoutConsultationInput = {
    create?: XOR<ConsultationResponseCreateWithoutConsultationInput, ConsultationResponseUncheckedCreateWithoutConsultationInput> | ConsultationResponseCreateWithoutConsultationInput[] | ConsultationResponseUncheckedCreateWithoutConsultationInput[]
    connectOrCreate?: ConsultationResponseCreateOrConnectWithoutConsultationInput | ConsultationResponseCreateOrConnectWithoutConsultationInput[]
    createMany?: ConsultationResponseCreateManyConsultationInputEnvelope
    connect?: ConsultationResponseWhereUniqueInput | ConsultationResponseWhereUniqueInput[]
  }

  export type PublicCommentUncheckedCreateNestedManyWithoutConsultationInput = {
    create?: XOR<PublicCommentCreateWithoutConsultationInput, PublicCommentUncheckedCreateWithoutConsultationInput> | PublicCommentCreateWithoutConsultationInput[] | PublicCommentUncheckedCreateWithoutConsultationInput[]
    connectOrCreate?: PublicCommentCreateOrConnectWithoutConsultationInput | PublicCommentCreateOrConnectWithoutConsultationInput[]
    createMany?: PublicCommentCreateManyConsultationInputEnvelope
    connect?: PublicCommentWhereUniqueInput | PublicCommentWhereUniqueInput[]
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

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
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

  export type PublicCommentUpdateManyWithoutConsultationNestedInput = {
    create?: XOR<PublicCommentCreateWithoutConsultationInput, PublicCommentUncheckedCreateWithoutConsultationInput> | PublicCommentCreateWithoutConsultationInput[] | PublicCommentUncheckedCreateWithoutConsultationInput[]
    connectOrCreate?: PublicCommentCreateOrConnectWithoutConsultationInput | PublicCommentCreateOrConnectWithoutConsultationInput[]
    upsert?: PublicCommentUpsertWithWhereUniqueWithoutConsultationInput | PublicCommentUpsertWithWhereUniqueWithoutConsultationInput[]
    createMany?: PublicCommentCreateManyConsultationInputEnvelope
    set?: PublicCommentWhereUniqueInput | PublicCommentWhereUniqueInput[]
    disconnect?: PublicCommentWhereUniqueInput | PublicCommentWhereUniqueInput[]
    delete?: PublicCommentWhereUniqueInput | PublicCommentWhereUniqueInput[]
    connect?: PublicCommentWhereUniqueInput | PublicCommentWhereUniqueInput[]
    update?: PublicCommentUpdateWithWhereUniqueWithoutConsultationInput | PublicCommentUpdateWithWhereUniqueWithoutConsultationInput[]
    updateMany?: PublicCommentUpdateManyWithWhereWithoutConsultationInput | PublicCommentUpdateManyWithWhereWithoutConsultationInput[]
    deleteMany?: PublicCommentScalarWhereInput | PublicCommentScalarWhereInput[]
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

  export type PublicCommentUncheckedUpdateManyWithoutConsultationNestedInput = {
    create?: XOR<PublicCommentCreateWithoutConsultationInput, PublicCommentUncheckedCreateWithoutConsultationInput> | PublicCommentCreateWithoutConsultationInput[] | PublicCommentUncheckedCreateWithoutConsultationInput[]
    connectOrCreate?: PublicCommentCreateOrConnectWithoutConsultationInput | PublicCommentCreateOrConnectWithoutConsultationInput[]
    upsert?: PublicCommentUpsertWithWhereUniqueWithoutConsultationInput | PublicCommentUpsertWithWhereUniqueWithoutConsultationInput[]
    createMany?: PublicCommentCreateManyConsultationInputEnvelope
    set?: PublicCommentWhereUniqueInput | PublicCommentWhereUniqueInput[]
    disconnect?: PublicCommentWhereUniqueInput | PublicCommentWhereUniqueInput[]
    delete?: PublicCommentWhereUniqueInput | PublicCommentWhereUniqueInput[]
    connect?: PublicCommentWhereUniqueInput | PublicCommentWhereUniqueInput[]
    update?: PublicCommentUpdateWithWhereUniqueWithoutConsultationInput | PublicCommentUpdateWithWhereUniqueWithoutConsultationInput[]
    updateMany?: PublicCommentUpdateManyWithWhereWithoutConsultationInput | PublicCommentUpdateManyWithWhereWithoutConsultationInput[]
    deleteMany?: PublicCommentScalarWhereInput | PublicCommentScalarWhereInput[]
  }

  export type ConsultationCreateNestedOneWithoutPublicCommentsInput = {
    create?: XOR<ConsultationCreateWithoutPublicCommentsInput, ConsultationUncheckedCreateWithoutPublicCommentsInput>
    connectOrCreate?: ConsultationCreateOrConnectWithoutPublicCommentsInput
    connect?: ConsultationWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ConsultationUpdateOneRequiredWithoutPublicCommentsNestedInput = {
    create?: XOR<ConsultationCreateWithoutPublicCommentsInput, ConsultationUncheckedCreateWithoutPublicCommentsInput>
    connectOrCreate?: ConsultationCreateOrConnectWithoutPublicCommentsInput
    upsert?: ConsultationUpsertWithoutPublicCommentsInput
    connect?: ConsultationWhereUniqueInput
    update?: XOR<XOR<ConsultationUpdateToOneWithWhereWithoutPublicCommentsInput, ConsultationUpdateWithoutPublicCommentsInput>, ConsultationUncheckedUpdateWithoutPublicCommentsInput>
  }

  export type ConsultationCreateNestedOneWithoutResponsesInput = {
    create?: XOR<ConsultationCreateWithoutResponsesInput, ConsultationUncheckedCreateWithoutResponsesInput>
    connectOrCreate?: ConsultationCreateOrConnectWithoutResponsesInput
    connect?: ConsultationWhereUniqueInput
  }

  export type ConsultationUpdateOneRequiredWithoutResponsesNestedInput = {
    create?: XOR<ConsultationCreateWithoutResponsesInput, ConsultationUncheckedCreateWithoutResponsesInput>
    connectOrCreate?: ConsultationCreateOrConnectWithoutResponsesInput
    upsert?: ConsultationUpsertWithoutResponsesInput
    connect?: ConsultationWhereUniqueInput
    update?: XOR<XOR<ConsultationUpdateToOneWithWhereWithoutResponsesInput, ConsultationUpdateWithoutResponsesInput>, ConsultationUncheckedUpdateWithoutResponsesInput>
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type PublicCommentCreateWithoutConsultationInput = {
    id?: string
    fullName: string
    email?: string | null
    phoneNumber?: string | null
    content: string
    status?: string
    moderatedBy?: string | null
    moderatedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PublicCommentUncheckedCreateWithoutConsultationInput = {
    id?: string
    fullName: string
    email?: string | null
    phoneNumber?: string | null
    content: string
    status?: string
    moderatedBy?: string | null
    moderatedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PublicCommentCreateOrConnectWithoutConsultationInput = {
    where: PublicCommentWhereUniqueInput
    create: XOR<PublicCommentCreateWithoutConsultationInput, PublicCommentUncheckedCreateWithoutConsultationInput>
  }

  export type PublicCommentCreateManyConsultationInputEnvelope = {
    data: PublicCommentCreateManyConsultationInput | PublicCommentCreateManyConsultationInput[]
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

  export type PublicCommentUpsertWithWhereUniqueWithoutConsultationInput = {
    where: PublicCommentWhereUniqueInput
    update: XOR<PublicCommentUpdateWithoutConsultationInput, PublicCommentUncheckedUpdateWithoutConsultationInput>
    create: XOR<PublicCommentCreateWithoutConsultationInput, PublicCommentUncheckedCreateWithoutConsultationInput>
  }

  export type PublicCommentUpdateWithWhereUniqueWithoutConsultationInput = {
    where: PublicCommentWhereUniqueInput
    data: XOR<PublicCommentUpdateWithoutConsultationInput, PublicCommentUncheckedUpdateWithoutConsultationInput>
  }

  export type PublicCommentUpdateManyWithWhereWithoutConsultationInput = {
    where: PublicCommentScalarWhereInput
    data: XOR<PublicCommentUpdateManyMutationInput, PublicCommentUncheckedUpdateManyWithoutConsultationInput>
  }

  export type PublicCommentScalarWhereInput = {
    AND?: PublicCommentScalarWhereInput | PublicCommentScalarWhereInput[]
    OR?: PublicCommentScalarWhereInput[]
    NOT?: PublicCommentScalarWhereInput | PublicCommentScalarWhereInput[]
    id?: StringFilter<"PublicComment"> | string
    consultationId?: StringFilter<"PublicComment"> | string
    fullName?: StringFilter<"PublicComment"> | string
    email?: StringNullableFilter<"PublicComment"> | string | null
    phoneNumber?: StringNullableFilter<"PublicComment"> | string | null
    content?: StringFilter<"PublicComment"> | string
    status?: StringFilter<"PublicComment"> | string
    moderatedBy?: StringNullableFilter<"PublicComment"> | string | null
    moderatedAt?: DateTimeNullableFilter<"PublicComment"> | Date | string | null
    createdAt?: DateTimeFilter<"PublicComment"> | Date | string
    updatedAt?: DateTimeFilter<"PublicComment"> | Date | string
  }

  export type ConsultationCreateWithoutPublicCommentsInput = {
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

  export type ConsultationUncheckedCreateWithoutPublicCommentsInput = {
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

  export type ConsultationCreateOrConnectWithoutPublicCommentsInput = {
    where: ConsultationWhereUniqueInput
    create: XOR<ConsultationCreateWithoutPublicCommentsInput, ConsultationUncheckedCreateWithoutPublicCommentsInput>
  }

  export type ConsultationUpsertWithoutPublicCommentsInput = {
    update: XOR<ConsultationUpdateWithoutPublicCommentsInput, ConsultationUncheckedUpdateWithoutPublicCommentsInput>
    create: XOR<ConsultationCreateWithoutPublicCommentsInput, ConsultationUncheckedCreateWithoutPublicCommentsInput>
    where?: ConsultationWhereInput
  }

  export type ConsultationUpdateToOneWithWhereWithoutPublicCommentsInput = {
    where?: ConsultationWhereInput
    data: XOR<ConsultationUpdateWithoutPublicCommentsInput, ConsultationUncheckedUpdateWithoutPublicCommentsInput>
  }

  export type ConsultationUpdateWithoutPublicCommentsInput = {
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

  export type ConsultationUncheckedUpdateWithoutPublicCommentsInput = {
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
    publicComments?: PublicCommentCreateNestedManyWithoutConsultationInput
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
    publicComments?: PublicCommentUncheckedCreateNestedManyWithoutConsultationInput
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
    publicComments?: PublicCommentUpdateManyWithoutConsultationNestedInput
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
    publicComments?: PublicCommentUncheckedUpdateManyWithoutConsultationNestedInput
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

  export type PublicCommentCreateManyConsultationInput = {
    id?: string
    fullName: string
    email?: string | null
    phoneNumber?: string | null
    content: string
    status?: string
    moderatedBy?: string | null
    moderatedAt?: Date | string | null
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

  export type PublicCommentUpdateWithoutConsultationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PublicCommentUncheckedUpdateWithoutConsultationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PublicCommentUncheckedUpdateManyWithoutConsultationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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