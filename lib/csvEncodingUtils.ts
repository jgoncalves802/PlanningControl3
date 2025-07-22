/**
 * Utilitários para tratamento de encoding CSV com caracteres especiais
 * Garante que dados em português brasileiro sejam importados corretamente
 */

// Interface para resultado de validação
export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

// Interface para dados de funcionário normalizados
export interface NormalizedEmployeeData {
  name: string;
  registration: string;
  company: string;
  cpf: string;
  motherName?: string;
  [key: string]: any;
}

// Interface para correção automática
export interface AutoCorrectionResult {
  originalText: string;
  correctedText: string;
  corrections: string[];
  wasCorrected: boolean;
}

/**
 * Mapeamento de caracteres comuns que precisam ser corrigidos
 */
const CHARACTER_CORRECTIONS = {
  // Nomes próprios comuns
  'joao': 'João',
  'jose': 'José',
  'maria': 'Maria',
  'ana': 'Ana',
  'antonio': 'Antônio',
  'francisco': 'Francisco',
  'carlos': 'Carlos',
  'paulo': 'Paulo',
  'pedro': 'Pedro',
  'luis': 'Luís',
  'antonia': 'Antônia',
  
  // Cidades e locais
  'sao paulo': 'São Paulo',
  'rio de janeiro': 'Rio de Janeiro',
  'belo horizonte': 'Belo Horizonte',
  'salvador': 'Salvador',
  'recife': 'Recife',
  'fortaleza': 'Fortaleza',
  'brasilia': 'Brasília',
  'curitiba': 'Curitiba',
  'porto alegre': 'Porto Alegre',
  
  // Palavras comuns
  'servicos': 'Serviços',
  'construcao': 'Construção',
  'administracao': 'Administração',
  'operacao': 'Operação',
  'manutencao': 'Manutenção',
  'supervisao': 'Supervisão',
  'coordenacao': 'Coordenação',
  
  // Funções e cargos
  'operador': 'Operador',
  'supervisor': 'Supervisor',
  'tecnico': 'Técnico',
  'engenheiro': 'Engenheiro',
  'arquiteto': 'Arquiteto',
  'auxiliar': 'Auxiliar',
  'assistente': 'Assistente',
  'coordenador': 'Coordenador',
  'gerente': 'Gerente',
  'diretor': 'Diretor',
  
  // Estados civis
  'solteiro': 'Solteiro',
  'casado': 'Casado',
  'divorciado': 'Divorciado',
  'viuvo': 'Viúvo',
  'solteira': 'Solteira',
  'casada': 'Casada',
  'divorciada': 'Divorciada',
  'viuva': 'Viúva',
  
  // Gêneros
  'masculino': 'Masculino',
  'feminino': 'Feminino',
  
  // Status
  'ativo': 'Ativo',
  'inativo': 'Inativo',
  'licenca': 'Licença',
  'transferido': 'Transferido',
  'suspenso': 'Suspenso',
  'demitido': 'Demitido',
  'aposentado': 'Aposentado'
};

/**
 * Corrige automaticamente caracteres especiais em texto
 */
export function autoCorrectSpecialCharacters(text: string): AutoCorrectionResult {
  if (!text || typeof text !== 'string') {
    return {
      originalText: text,
      correctedText: text,
      corrections: [],
      wasCorrected: false
    };
  }

  let correctedText = text;
  const corrections: string[] = [];

  // Converter para minúsculas para comparação
  const lowerText = text.toLowerCase();

  // Aplicar correções conhecidas
  Object.entries(CHARACTER_CORRECTIONS).forEach(([wrong, correct]) => {
    if (lowerText.includes(wrong)) {
      // Usar regex para substituir preservando maiúsculas/minúsculas
      const regex = new RegExp(wrong, 'gi');
      const matches = correctedText.match(regex);
      
      if (matches) {
        matches.forEach(match => {
          const beforeCorrection = correctedText;
          correctedText = correctedText.replace(match, correct);
          
          if (beforeCorrection !== correctedText) {
            corrections.push(`"${match}" → "${correct}"`);
          }
        });
      }
    }
  });

  // Corrigir acentos específicos que podem ter sido perdidos
  const accentCorrections = [
    { pattern: /Joao/g, replacement: 'João' },
    { pattern: /Jose/g, replacement: 'José' },
    { pattern: /Antonio/g, replacement: 'Antônio' },
    { pattern: /Antonia/g, replacement: 'Antônia' },
    { pattern: /Sao/g, replacement: 'São' },
    { pattern: /Paulo/g, replacement: 'Paulo' },
    { pattern: /Luis/g, replacement: 'Luís' },
    { pattern: /Servicos/g, replacement: 'Serviços' },
    { pattern: /Construcao/g, replacement: 'Construção' },
    { pattern: /Administracao/g, replacement: 'Administração' },
    { pattern: /Operacao/g, replacement: 'Operação' },
    { pattern: /Manutencao/g, replacement: 'Manutenção' },
    { pattern: /Supervisao/g, replacement: 'Supervisão' },
    { pattern: /Coordenacao/g, replacement: 'Coordenação' },
    { pattern: /Tecnico/g, replacement: 'Técnico' },
    { pattern: /Engenheiro/g, replacement: 'Engenheiro' },
    { pattern: /Arquiteto/g, replacement: 'Arquiteto' },
    { pattern: /Viuvo/g, replacement: 'Viúvo' },
    { pattern: /Viuva/g, replacement: 'Viúva' },
    { pattern: /Licenca/g, replacement: 'Licença' }
  ];

  accentCorrections.forEach(({ pattern, replacement }) => {
    if (pattern.test(correctedText)) {
      const beforeCorrection = correctedText;
      correctedText = correctedText.replace(pattern, replacement);
      
      if (beforeCorrection !== correctedText) {
        corrections.push(`Correção de acento aplicada`);
      }
    }
  });

  return {
    originalText: text,
    correctedText: correctedText,
    corrections,
    wasCorrected: corrections.length > 0
  };
}

/**
 * Corrige automaticamente dados de funcionário
 */
export function autoCorrectEmployeeData(data: any): { correctedData: any; corrections: string[] } {
  const corrections: string[] = [];
  const correctedData = { ...data };

  // Campos que devem ser corrigidos
  const fieldsToCorrect = [
    'name', 'motherName', 'company', 'gender', 'maritalStatus', 
    'role', 'workplace', 'nationality', 'naturalness', 'educationLevel',
    'centroCusto', 'obra', 'mo', 'localAlojado', 'pontoReferencia', 
    'statusBancodoc', 'status'
  ];

  fieldsToCorrect.forEach(field => {
    if (correctedData[field] && typeof correctedData[field] === 'string') {
      const correction = autoCorrectSpecialCharacters(correctedData[field]);
      
      if (correction.wasCorrected) {
        correctedData[field] = correction.correctedText;
        corrections.push(`${field}: ${correction.corrections.join(', ')}`);
      }
    }
  });

  return { correctedData, corrections };
}

/**
 * Corrige automaticamente dados de função
 */
export function autoCorrectFunctionData(data: any): { correctedData: any; corrections: string[] } {
  const corrections: string[] = [];
  const correctedData = { ...data };

  if (correctedData.name && typeof correctedData.name === 'string') {
    const correction = autoCorrectSpecialCharacters(correctedData.name);
    
    if (correction.wasCorrected) {
      correctedData.name = correction.correctedText;
      corrections.push(`name: ${correction.corrections.join(', ')}`);
    }
  }

  return { correctedData, corrections };
}

/**
 * Processa CSV com correção automática
 */
export function processCSVWithAutoCorrection(csvText: string): { 
  data: any[]; 
  corrections: string[]; 
  encodingIssues: string[] 
} {
  const corrections: string[] = [];
  const encodingIssues: string[] = [];
  
  // Remover BOM
  const cleanText = csvText.replace(/^\uFEFF/, '');
  
  const lines = cleanText.split('\n');
  if (lines.length < 2) return { data: [], corrections: [], encodingIssues: [] };

  const headers = lines[0].split(';').map(h => robustNormalizeText(h));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(';');
    const row: any = {};

    headers.forEach((header, index) => {
      const value = values[index] || '';
      const normalizedValue = robustNormalizeText(value);
      
      // Aplicar correção automática
      const correction = autoCorrectSpecialCharacters(normalizedValue);
      
      if (correction.wasCorrected) {
        corrections.push(`Linha ${i + 1}, ${header}: ${correction.corrections.join(', ')}`);
      }
      
      row[header] = correction.correctedText;
      
      // Detectar problemas de encoding
      const issues = detectEncodingIssues(normalizedValue);
      if (issues.length > 0) {
        encodingIssues.push(`Linha ${i + 1}, ${header}: ${issues.join(', ')}`);
      }
    });

    // Só adiciona se tiver pelo menos nome
    if (row.name) {
      data.push(row);
    }
  }

  return { data, corrections, encodingIssues };
}

/**
 * Normaliza texto removendo BOM e aplicando normalização Unicode
 */
export function robustNormalizeText(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  // Remover BOM se presente
  let normalized = text.replace(/^\uFEFF/, '');
  
  // Normalizar Unicode (NFC - Canonical Composition)
  normalized = normalized.normalize('NFC');
  
  // Remover espaços extras
  normalized = normalized.trim();
  
  return normalized;
}

/**
 * Valida se texto contém caracteres especiais válidos
 */
export function validateSpecialCharacters(text: string): boolean {
  if (!text) return true;
  
  // Regex para caracteres especiais em português
  const specialCharsRegex = /[À-ÿ]/;
  return specialCharsRegex.test(text);
}

/**
 * Detecta problemas de encoding em texto
 */
export function detectEncodingIssues(text: string): string[] {
  const issues: string[] = [];
  
  if (!text) return issues;
  
  // Verificar se há caracteres que deveriam ter acentos mas não têm
  const commonMistakes = [
    { wrong: 'Joao', correct: 'João' },
    { wrong: 'Maria', correct: 'Maria' },
    { wrong: 'Antonia', correct: 'Antônia' },
    { wrong: 'Sao', correct: 'São' },
    { wrong: 'Paulo', correct: 'Paulo' },
    { wrong: 'Jose', correct: 'José' },
    { wrong: 'Ana', correct: 'Ana' },
    { wrong: 'Costa', correct: 'Costa' },
    { wrong: 'Silva', correct: 'Silva' },
    { wrong: 'Santos', correct: 'Santos' }
  ];
  
  commonMistakes.forEach(({ wrong, correct }) => {
    if (text.includes(wrong) && !text.includes(correct)) {
      issues.push(`Possível erro de encoding: "${wrong}" deveria ser "${correct}"`);
    }
  });
  
  return issues;
}

/**
 * Valida encoding do arquivo
 */
export function validateFileEncoding(file: File): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const result: ValidationResult = {
      isValid: true,
      warnings: [],
      errors: []
    };
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      // Verificar se há BOM
      if (content.startsWith('\uFEFF')) {
        result.warnings.push('Arquivo contém BOM (Byte Order Mark) - será removido automaticamente');
      }
      
      // Verificar caracteres especiais
      const hasSpecialChars = /[À-ÿ]/.test(content);
      
      if (!hasSpecialChars) {
        // Verificar se há palavras que deveriam ter acentos
        const encodingIssues = detectEncodingIssues(content);
        if (encodingIssues.length > 0) {
          result.errors.push(...encodingIssues);
          result.isValid = false;
        }
      }
      
      // Verificar se o conteúdo parece estar em UTF-8
      try {
        const testString = 'João Maria Antônia São Paulo';
        if (content.includes('Joao') && !content.includes('João')) {
          result.warnings.push('Possível problema de encoding: caracteres especiais não detectados');
        }
      } catch (error) {
        result.errors.push('Erro ao verificar encoding do arquivo');
        result.isValid = false;
      }
      
      resolve(result);
    };
    
    reader.onerror = () => {
      result.errors.push('Erro ao ler arquivo');
      result.isValid = false;
      resolve(result);
    };
    
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Parser CSV robusto com suporte a caracteres especiais
 */
export function parseCSVWithEncoding(csvText: string): any[] {
  // Remover BOM
  const cleanText = csvText.replace(/^\uFEFF/, '');
  
  const lines = cleanText.split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(';').map(h => robustNormalizeText(h));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(';');
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = robustNormalizeText(values[index] || '');
    });

    // Só adiciona se tiver pelo menos nome
    if (row.name) {
      data.push(row);
    }
  }

  return data;
}

/**
 * Valida dados de funcionário em tempo real
 */
export function validateEmployeeDataInRealTime(data: any[]): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    warnings: [],
    errors: []
  };

  data.forEach((row, index) => {
    const fields = ['name', 'motherName', 'company'];
    
    fields.forEach(field => {
      if (row[field]) {
        const original = row[field];
        const normalized = robustNormalizeText(original);
        
        // Verificar se houve normalização
        if (original !== normalized) {
          result.warnings.push(`Linha ${index + 1}: Campo "${field}" foi normalizado`);
        }
        
        // Verificar problemas de encoding
        const encodingIssues = detectEncodingIssues(normalized);
        if (encodingIssues.length > 0) {
          result.errors.push(`Linha ${index + 1}: ${encodingIssues.join(', ')}`);
          result.isValid = false;
        }
      }
    });
  });

  return result;
}

/**
 * Normaliza dados de funcionário para formato do banco
 */
export function normalizeEmployeeData(csvData: any): NormalizedEmployeeData {
  return {
    name: robustNormalizeText(csvData.name),
    registration: csvData.registration?.toString(),
    company: robustNormalizeText(csvData.company),
    cpf: csvData.cpf?.replace(/\D/g, ''),
    motherName: csvData.motherName ? robustNormalizeText(csvData.motherName) : undefined,
    phone: csvData.phone && csvData.phone.trim() ? csvData.phone.replace(/\D/g, '') : null,
    gender: csvData.gender && csvData.gender.trim() ? robustNormalizeText(csvData.gender) : null,
    maritalStatus: csvData.maritalStatus && csvData.maritalStatus.trim() ? robustNormalizeText(csvData.maritalStatus) : null,
    pis: csvData.pis && csvData.pis.trim() ? csvData.pis.replace(/\D/g, '') : null,
    ctps: csvData.ctps && csvData.ctps.trim() ? csvData.ctps.replace(/\D/g, '') : null,
    ctpsSeries: csvData.ctpsSeries && csvData.ctpsSeries.trim() ? csvData.ctpsSeries : null,
    ctpsUf: csvData.ctpsUf && csvData.ctpsUf.trim() ? csvData.ctpsUf.toUpperCase() : null,
    // Sempre definir status como ACTIVE para funcionários importados
    status: 'ACTIVE',
    isActive: true,
    birthDate: parseDate(csvData.birthDate),
    admissionDate: parseDate(csvData.admissionDate),
    rg: csvData.rg || null, workplace: csvData.workplace || null, shift: csvData.shift || null,
    nationality: csvData.nationality || 'Brasileira', naturalness: csvData.naturalness || null,
    educationLevel: csvData.educationLevel || null,
    centroCusto: csvData.centroCusto && csvData.centroCusto.trim() ? robustNormalizeText(csvData.centroCusto) : null,
    obra: csvData.obra && csvData.obra.trim() ? robustNormalizeText(csvData.obra) : null,
    mo: csvData.mo && csvData.mo.trim() ? robustNormalizeText(csvData.mo) : null,
    localAlojado: csvData.localAlojado && csvData.localAlojado.trim() ? robustNormalizeText(csvData.localAlojado) : null,
    pontoReferencia: csvData.pontoReferencia && csvData.pontoReferencia.trim() ? robustNormalizeText(csvData.pontoReferencia) : null,
    statusBancodoc: csvData.statusBancodoc && csvData.statusBancodoc.trim() ? robustNormalizeText(csvData.statusBancodoc) : null,
    efetivoRDO: csvData.efetivoRDO === 'true' || csvData.efetivoRDO === true,
    horasNormaisTrabalhadas: csvData.horasNormaisTrabalhadas ? parseFloat(csvData.horasNormaisTrabalhadas) : null,
    horasExtrasTrabalhadas: csvData.horasExtrasTrabalhadas ? parseFloat(csvData.horasExtrasTrabalhadas) : null,
    horasNoturnasTrabalhadas: csvData.horasNoturnasTrabalhadas ? parseFloat(csvData.horasNoturnasTrabalhadas) : null,
    primeiraExperiencia: parseDate(csvData.primeiraExperiencia),
    segundaExperiencia: parseDate(csvData.segundaExperiencia),
    previsaoObra: parseDate(csvData.previsaoObra),
  };
}

/**
 * Função auxiliar para parsear datas
 */
function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString || dateString.trim() === '') return null;
  
  try {
    // Formato DD/MM/YYYY
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Mês começa em 0
      const year = parseInt(parts[2]);
      
      const date = new Date(year, month, day);
      
      // Verificar se a data é válida
      if (date.getFullYear() === year && 
          date.getMonth() === month && 
          date.getDate() === day) {
        return date;
      }
    }
  } catch (error) {
    console.warn('Erro ao parsear data:', dateString, error);
  }
  
  return null;
}

/**
 * Cria template CSV com caracteres especiais de teste
 */
export function createTestCSVTemplate(): string {
  const headers = [
    'name', 'registration', 'company', 'cpf', 'phone', 'birthDate',
    'gender', 'maritalStatus', 'pis', 'ctps', 'ctpsSeries', 'ctpsUf',
    'motherName', 'currentContractId', 'admissionDate'
  ];

  const testData = [
    'João Silva Santos;12345;SARTORI SERVIÇOS;12345678901;31987654321;15/05/1985;Masculino;Solteiro;;;;;;;01/03/2024',
    'Maria Santos Costa;12346;SARTORI SERVIÇOS;98765432100;31987654322;20/08/1990;Feminino;Casada;;;;;;;15/03/2024',
    'José Antônio Oliveira;12347;SARTORI SERVIÇOS;11122233344;31987654323;10/12/1975;Masculino;Solteiro;;;;;;;19/01/2023',
    'Ana Paula Costa;12348;SARTORI SERVIÇOS;55566677788;31987654324;25/03/1988;Feminino;Casada;;;;;;;05/06/2022'
  ];

  return headers.join(';') + '\n' + testData.join('\n');
}

/**
 * Gera relatório de validação de encoding
 */
export function generateEncodingReport(data: any[]): string {
  const report = {
    totalRecords: data.length,
    recordsWithSpecialChars: 0,
    encodingIssues: [] as string[],
    warnings: [] as string[]
  };

  data.forEach((row, index) => {
    const fields = ['name', 'motherName', 'company'];
    let hasSpecialChars = false;
    
    fields.forEach(field => {
      if (row[field]) {
        if (validateSpecialCharacters(row[field])) {
          hasSpecialChars = true;
        }
        
        const issues = detectEncodingIssues(row[field]);
        if (issues.length > 0) {
          report.encodingIssues.push(`Linha ${index + 1}: ${issues.join(', ')}`);
        }
      }
    });
    
    if (hasSpecialChars) {
      report.recordsWithSpecialChars++;
    }
  });

  return `
RELATÓRIO DE VALIDAÇÃO DE ENCODING
==================================
Total de registros: ${report.totalRecords}
Registros com caracteres especiais: ${report.recordsWithSpecialChars}
Problemas de encoding detectados: ${report.encodingIssues.length}

${report.encodingIssues.length > 0 ? 'PROBLEMAS ENCONTRADOS:\n' + report.encodingIssues.join('\n') : 'Nenhum problema detectado.'}
  `.trim();
} 