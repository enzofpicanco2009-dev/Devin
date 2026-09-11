import React from "react";
import { z } from "zod";
import { TituloImpacto } from "./TituloImpacto";
import {
  schema as tituloImpactoSchema,
  defaultProps as tituloImpactoDefaults,
} from "./TituloImpacto/schema";

export type TemplateEntry = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.FC<any>;
  schema: z.ZodTypeAny;
  defaultProps: Record<string, unknown>;
};

export const registry = {
  TituloImpacto: {
    Component: TituloImpacto,
    schema: tituloImpactoSchema,
    defaultProps: tituloImpactoDefaults,
  },
} satisfies Record<string, TemplateEntry>;

export type TemplateId = keyof typeof registry;

export const templateIds = Object.keys(registry) as TemplateId[];

export function isTemplateId(id: string): id is TemplateId {
  return id in registry;
}
