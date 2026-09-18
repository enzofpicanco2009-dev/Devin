import React from "react";
import { z } from "zod";
import { TituloImpacto } from "./TituloImpacto";
import {
  schema as tituloImpactoSchema,
  defaultProps as tituloImpactoDefaults,
} from "./TituloImpacto/schema";
import * as NumeroDestaque from "./NumeroDestaque";
import * as ListaAnimada from "./ListaAnimada";
import * as Citacao from "./Citacao";
import * as ComparacaoDoisLados from "./ComparacaoDoisLados";
import * as GraficoBarras from "./GraficoBarras";
import * as SetaTendencia from "./SetaTendencia";
import * as ImagemDestaque from "./ImagemDestaque";
import * as Pergunta from "./Pergunta";
import * as TextoCorrido from "./TextoCorrido";

export type TemplateEntry = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.FC<any>;
  schema: z.ZodTypeAny;
  defaultProps: Record<string, unknown>;
};

export const registry = {
  TextoCorrido: {
    Component: TextoCorrido.TextoCorrido,
    schema: TextoCorrido.schema,
    defaultProps: TextoCorrido.defaultProps,
  },
  TituloImpacto: {
    Component: TituloImpacto,
    schema: tituloImpactoSchema,
    defaultProps: tituloImpactoDefaults,
  },
  NumeroDestaque: {
    Component: NumeroDestaque.NumeroDestaque,
    schema: NumeroDestaque.schema,
    defaultProps: NumeroDestaque.defaultProps,
  },
  ListaAnimada: {
    Component: ListaAnimada.ListaAnimada,
    schema: ListaAnimada.schema,
    defaultProps: ListaAnimada.defaultProps,
  },
  Citacao: {
    Component: Citacao.Citacao,
    schema: Citacao.schema,
    defaultProps: Citacao.defaultProps,
  },
  ComparacaoDoisLados: {
    Component: ComparacaoDoisLados.ComparacaoDoisLados,
    schema: ComparacaoDoisLados.schema,
    defaultProps: ComparacaoDoisLados.defaultProps,
  },
  GraficoBarras: {
    Component: GraficoBarras.GraficoBarras,
    schema: GraficoBarras.schema,
    defaultProps: GraficoBarras.defaultProps,
  },
  SetaTendencia: {
    Component: SetaTendencia.SetaTendencia,
    schema: SetaTendencia.schema,
    defaultProps: SetaTendencia.defaultProps,
  },
  ImagemDestaque: {
    Component: ImagemDestaque.ImagemDestaque,
    schema: ImagemDestaque.schema,
    defaultProps: ImagemDestaque.defaultProps,
  },
  Pergunta: {
    Component: Pergunta.Pergunta,
    schema: Pergunta.schema,
    defaultProps: Pergunta.defaultProps,
  },
} satisfies Record<string, TemplateEntry>;

export type TemplateId = keyof typeof registry;

export const templateIds = Object.keys(registry) as TemplateId[];

export function isTemplateId(id: string): id is TemplateId {
  return id in registry;
}
