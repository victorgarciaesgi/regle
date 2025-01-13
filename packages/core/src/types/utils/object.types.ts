import type { UnionToIntersection, UnionToTuple } from 'type-fest';
import type { isRecordLiteral, Prettify } from './misc.types';

type RemoveCommonKey<T extends readonly any[], K extends PropertyKey> = T extends [infer F, ...infer R]
  ? [Prettify<Omit<F, K>>, ...RemoveCommonKey<R, K>]
  : [];

export type JoinDiscriminatedUnions<TUnion extends unknown> =
  isRecordLiteral<TUnion> extends true
    ? Prettify<
        Partial<UnionToIntersection<RemoveCommonKey<UnionToTuple<TUnion>, keyof NonNullable<TUnion>>[number]>> &
          Pick<NonNullable<TUnion>, keyof NonNullable<TUnion>>
      >
    : TUnion;

export type EnumLike = {
  [k: string]: string | number;
  [nu: number]: string;
};
