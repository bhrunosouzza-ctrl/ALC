import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface LarvalSample {
  Identificacao: string;
  DataCadastro: string;
  DataColeta: string;
  Ciclo: string;
  Bairro: string;
  Deposito: string;
  LarvaAegypti: number;
  PupaAegypti: number;
  LarvaAlbopictus: number;
  PupaAlbopictus: number;
  LarvaOutros: number;
  PupaOutros: number;
  Classif_LarvaAegypti: string;
  Classif_PupaAegypti: string;
  Classif_LarvaAlbopictus: string;
  Classif_PupaAlbopictus: string;
  Classif_LarvaOutros: string;
  Classif_PupaOutros: string;
}

export interface VisitRecord {
  Identificacao: string;
  Data: string;
  Ciclo: string;
  Bairro: string;
  Total_T: number; // Total Trabalhado (Inspected)
  Fechado: number;
  Recusa: number;
  Resgate: number;
  Im_Trat: number;
  Dep_Trat: number;
  A1: number;
  A2: number;
  B: number;
  C: number;
  D1: number;
  D2: number;
  E: number;
  Total_Dep: number;
}

export interface NeighborhoodStats {
  bairro: string;
  totalVisitas: number;
  imoveisPositivos: number;
  depositosPositivos: number;
  iip: number; // Building Infestation Index
  ib: number;  // Breteau Index
  aegyptiCount: number;
  albopictusCount: number;
  outrosCount: number;
}
