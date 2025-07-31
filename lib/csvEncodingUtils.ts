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
  'almoxarife': 'Almoxarife',
  'implantacao': 'Implantação',
  'logistica': 'Logística',
  'seguranca': 'Segurança',
  'trabalho': 'Trabalho',
  'administrativo': 'Administrativo',
  'planejamento': 'Planejamento',
  'enfermagem': 'Enfermagem',
  'controle': 'Controle',
  'qualidade': 'Qualidade',
  
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
 * Função definitiva e robusta para todos os casos
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

  // Função auxiliar para aplicar correção preservando maiúsculas/minúsculas
  const applyCorrection = (text: string, wrong: string, correct: string): string => {
    const regex = new RegExp(wrong, 'gi');
    return text.replace(regex, (match) => {
      // Preservar maiúsculas/minúsculas
      if (match === match.toUpperCase()) {
        return correct.toUpperCase();
      } else if (match === match.toLowerCase()) {
        return correct.toLowerCase();
      } else if (match.charAt(0) === match.charAt(0).toUpperCase()) {
        return correct.charAt(0).toUpperCase() + correct.slice(1).toLowerCase();
      } else {
        return correct;
      }
    });
  };

  // Mapeamento completo de correções (incluindo todas as variações)
  const comprehensiveCorrections = {
    // Nomes próprios
    'joao': 'João', 'jose': 'José', 'maria': 'Maria', 'ana': 'Ana',
    'antonio': 'Antônio', 'francisco': 'Francisco', 'carlos': 'Carlos',
    'paulo': 'Paulo', 'pedro': 'Pedro', 'luis': 'Luís', 'antonia': 'Antônia',
    
    // Cidades
    'sao paulo': 'São Paulo', 'rio de janeiro': 'Rio de Janeiro',
    'belo horizonte': 'Belo Horizonte', 'salvador': 'Salvador',
    'recife': 'Recife', 'fortaleza': 'Fortaleza', 'brasilia': 'Brasília',
    'curitiba': 'Curitiba', 'porto alegre': 'Porto Alegre',
    
    // Palavras comuns
    'servicos': 'Serviços', 'construcao': 'Construção',
    'administracao': 'Administração', 'operacao': 'Operação',
    'manutencao': 'Manutenção', 'supervisao': 'Supervisão',
    'coordenacao': 'Coordenação',
    
    // Funções e cargos (todas as variações)
    'operador': 'Operador', 'supervisor': 'Supervisor', 'tecnico': 'Técnico',
    'engenheiro': 'Engenheiro', 'arquiteto': 'Arquiteto', 'auxiliar': 'Auxiliar',
    'assistente': 'Assistente', 'coordenador': 'Coordenador', 'gerente': 'Gerente',
    'diretor': 'Diretor', 'almoxarife': 'Almoxarife', 'implantacao': 'Implantação',
    'logistica': 'Logística', 'seguranca': 'Segurança', 'trabalho': 'Trabalho',
    'administrativo': 'Administrativo', 'planejamento': 'Planejamento',
    'enfermagem': 'Enfermagem', 'controle': 'Controle', 'qualidade': 'Qualidade',
    'ajudante': 'Ajudante', 'analista': 'Analista',
    
    // Estados civis
    'solteiro': 'Solteiro', 'casado': 'Casado', 'divorciado': 'Divorciado',
    'viuvo': 'Viúvo', 'solteira': 'Solteira', 'casada': 'Casada',
    'divorciada': 'Divorciada', 'viuva': 'Viúva',
    
    // Gêneros
    'masculino': 'Masculino', 'feminino': 'Feminino',
    
    // Status
    'ativo': 'Ativo', 'inativo': 'Inativo', 'licenca': 'Licença',
    'transferido': 'Transferido', 'suspenso': 'Suspenso',
    'demitido': 'Demitido', 'aposentado': 'Aposentado'
  };

  // Aplicar correções abrangentes
  Object.entries(comprehensiveCorrections).forEach(([wrong, correct]) => {
    const beforeCorrection = correctedText;
    correctedText = applyCorrection(correctedText, wrong, correct);
    
    if (beforeCorrection !== correctedText) {
      corrections.push(`"${wrong}" → "${correct}"`);
    }
  });

  // Correções específicas para padrões complexos (mais abrangente)
  const complexCorrections = [
    // Padrões específicos que podem não ser capturados pelo mapeamento geral
    { pattern: /ALMOXARIFE/g, replacement: 'ALMOXARIFE' },
    { pattern: /ADMINISTRATIVO/g, replacement: 'ADMINISTRATIVO' },
    { pattern: /PLANEJAMENTO/g, replacement: 'PLANEJAMENTO' },
    { pattern: /IMPLANTACAO/g, replacement: 'IMPLANTAÇÃO' },
    { pattern: /LOGISTICA/g, replacement: 'LOGÍSTICA' },
    { pattern: /SEGURANCA/g, replacement: 'SEGURANÇA' },
    { pattern: /TRABALHO/g, replacement: 'TRABALHO' },
    { pattern: /ENFERMAGEM/g, replacement: 'ENFERMAGEM' },
    { pattern: /CONTROLE/g, replacement: 'CONTROLE' },
    { pattern: /QUALIDADE/g, replacement: 'QUALIDADE' },
    { pattern: /AJUDANTE/g, replacement: 'AJUDANTE' },
    { pattern: /ANALISTA/g, replacement: 'ANALISTA' },
    
    // Padrões em minúsculas também
    { pattern: /almoxarife/g, replacement: 'almoxarife' },
    { pattern: /administrativo/g, replacement: 'administrativo' },
    { pattern: /planejamento/g, replacement: 'planejamento' },
    { pattern: /implantacao/g, replacement: 'implantação' },
    { pattern: /logistica/g, replacement: 'logística' },
    { pattern: /seguranca/g, replacement: 'segurança' },
    { pattern: /trabalho/g, replacement: 'trabalho' },
    { pattern: /enfermagem/g, replacement: 'enfermagem' },
    { pattern: /controle/g, replacement: 'controle' },
    { pattern: /qualidade/g, replacement: 'qualidade' },
    { pattern: /ajudante/g, replacement: 'ajudante' },
    { pattern: /analista/g, replacement: 'analista' },
    
    // Correções adicionais para casos específicos
    { pattern: /ALMOXARIFE/g, replacement: 'ALMOXARIFE' },
    { pattern: /ADMINISTRATIVO/g, replacement: 'ADMINISTRATIVO' },
    { pattern: /PLANEJAMENTO/g, replacement: 'PLANEJAMENTO' },
    { pattern: /ENFERMAGEM/g, replacement: 'ENFERMAGEM' },
    { pattern: /CONTROLE/g, replacement: 'CONTROLE' },
    { pattern: /QUALIDADE/g, replacement: 'QUALIDADE' },
    { pattern: /AJUDANTE/g, replacement: 'AJUDANTE' },
    { pattern: /ANALISTA/g, replacement: 'ANALISTA' }
  ];

  complexCorrections.forEach(({ pattern, replacement }) => {
    if (pattern.test(correctedText)) {
      const beforeCorrection = correctedText;
      correctedText = correctedText.replace(pattern, replacement);
      
      if (beforeCorrection !== correctedText) {
        corrections.push(`Correção específica aplicada`);
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
 * Converte nome para maiúsculo
 * @param name - Nome a ser convertido
 * @returns Nome em maiúsculo
 */
export function convertNameToUpperCase(name: string): string {
  if (!name || typeof name !== 'string') return name;
  
  return name.trim().toUpperCase();
}

/**
 * Converte número do Excel para data
 * No Excel, 1 = 01/01/1900, 2 = 02/01/1900, etc.
 * @param excelNumber - Número do Excel (pode ser string ou número)
 * @returns Data convertida ou null se inválida
 */
export function convertExcelNumberToDate(excelNumber: string | number): Date | null {
  if (!excelNumber || excelNumber === '') return null;
  
  const num = parseFloat(String(excelNumber));
  
  // Verificar se é um número válido
  if (isNaN(num) || num < 1) return null;
  
  // Excel usa 1 = 01/01/1900
  // O Excel tem um bug: trata 1900 como bissexto quando não é
  // Para corrigir isso, usamos 31/12/1899 como data base
  const excelEpoch = new Date(1899, 11, 31); // 31/12/1899
  
  // Calcular a data adicionando os dias
  const resultDate = new Date(excelEpoch);
  resultDate.setDate(resultDate.getDate() + num);
  
  // Validar se a data está em um intervalo razoável (1900-2100)
  if (resultDate.getFullYear() < 1900 || resultDate.getFullYear() > 2100) {
    return null;
  }
  
  return resultDate;
}

/**
 * Detecta se uma string é um número do Excel (data)
 * @param value - Valor a ser verificado
 * @returns true se parece ser um número do Excel
 */
export function isExcelNumber(value: string | number): boolean {
  if (!value || value === '') return false;
  
  const num = parseFloat(String(value));
  if (isNaN(num)) return false;
  
  // Números do Excel para datas geralmente estão entre 1 e 73050
  // (que representa aproximadamente 200 anos de datas)
  return num >= 1 && num <= 73050 && Number.isInteger(num);
}

/**
 * Formata CPF para garantir 11 dígitos, adicionando zeros à esquerda se necessário
 * @param cpf - CPF a ser formatado (pode ser string ou número)
 * @returns CPF formatado com 11 dígitos
 */
export function formatCPF(cpf: string | number): string {
  if (!cpf) return '';
  
  // Converter para string e remover caracteres não numéricos
  const cpfString = String(cpf).replace(/\D/g, '');
  
  // Se já tem 11 dígitos, retornar como está
  if (cpfString.length === 11) {
    return cpfString;
  }
  
  // Se tem menos de 11 dígitos, adicionar zeros à esquerda
  if (cpfString.length < 11) {
    return cpfString.padStart(11, '0');
  }
  
  // Se tem mais de 11 dígitos, pegar apenas os primeiros 11
  return cpfString.substring(0, 11);
}

/**
 * Aplica correções automáticas aos dados de funcionário, incluindo formatação de CPF, conversão de datas do Excel e nomes em maiúsculo
 * @param data - Dados do funcionário
 * @returns Dados corrigidos e lista de correções aplicadas
 */
export function autoCorrectEmployeeData(data: any): { correctedData: any; corrections: string[] } {
  const corrections: string[] = [];
  const correctedData = { ...data };

  // Converter nome para maiúsculo
  if (correctedData.name && typeof correctedData.name === 'string') {
    const originalName = correctedData.name;
    const upperCaseName = convertNameToUpperCase(correctedData.name);
    
    if (upperCaseName !== originalName) {
      corrections.push(`Nome: "${originalName}" → "${upperCaseName}" (convertido para maiúsculo)`);
      correctedData.name = upperCaseName;
    }
  }

  // Lista de campos para aplicar correção de caracteres especiais
  const textFields = [
    'motherName', 'company', 'gender', 'maritalStatus', 'status',
    'address', 'city', 'state', 'neighborhood', 'complement'
  ];

  // Aplicar correção de caracteres especiais
  textFields.forEach(field => {
    if (correctedData[field] && typeof correctedData[field] === 'string') {
      const result = autoCorrectSpecialCharacters(correctedData[field]);
      if (result.wasCorrected) {
        corrections.push(`${field}: "${correctedData[field]}" → "${result.correctedText}"`);
        correctedData[field] = result.correctedText;
      }
    }
  });

  // Formatar CPF para garantir 11 dígitos
  if (correctedData.cpf) {
    const originalCPF = correctedData.cpf;
    const formattedCPF = formatCPF(correctedData.cpf);
    
    if (formattedCPF !== originalCPF) {
      corrections.push(`CPF: "${originalCPF}" → "${formattedCPF}" (formatado para 11 dígitos)`);
      correctedData.cpf = formattedCPF;
    }
  }

  // Validar e corrigir telefone
  if (correctedData.phone && String(correctedData.phone).trim() !== '') {
    const originalPhone = correctedData.phone;
    const cleanPhone = String(correctedData.phone).replace(/\D/g, '');
    
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
      if (cleanPhone !== String(originalPhone)) {
        corrections.push(`Telefone: "${originalPhone}" → "${cleanPhone}" (formatado)`);
        correctedData.phone = cleanPhone;
      }
    } else {
      corrections.push(`Telefone: "${originalPhone}" → removido (inválido - deve ter 10 ou 11 dígitos)`);
      correctedData.phone = null;
    }
  } else {
    correctedData.phone = null;
  }

  // Converter números do Excel para datas
  const dateFields = ['birthDate', 'admissionDate', 'dismissalDate', 'cnhValidity', 'primeiraExperiencia', 'segundaExperiencia', 'previsaoObra'];
  
  dateFields.forEach(field => {
    if (correctedData[field] && isExcelNumber(correctedData[field])) {
      const originalValue = correctedData[field];
      const convertedDate = convertExcelNumberToDate(correctedData[field]);
      
      if (convertedDate) {
        const formattedDate = convertedDate.toLocaleDateString('pt-BR');
        corrections.push(`${field}: "${originalValue}" → "${formattedDate}" (convertido de número do Excel)`);
        correctedData[field] = convertedDate;
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
  
  // Remover BOM se presente e normalizar texto
  let cleanText = csvText.replace(/^\uFEFF/, '');
  
  // Normalizar Unicode para garantir consistência
  cleanText = cleanText.normalize('NFC');
  
  const lines = cleanText.split('\n');
  if (lines.length < 2) {
    return { data: [], corrections: [], encodingIssues: [] };
  }

  // Detectar separador automaticamente
  const firstLine = lines[0];
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const separator = semicolonCount >= commaCount ? ';' : ',';

  const headers = lines[0].split(separator).map(h => normalizeHeader(h));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse simples da linha CSV (remover aspas e dividir por separador)
    const values = line.split(separator).map(v => v.replace(/^"|"$/g, '').trim());
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

    // Mapear campos normalizados para os nomes esperados
    const normalizedRow: any = {};
    Object.keys(row).forEach(key => {
      // Mapeamento completo de todos os campos necessários
      if (key === 'nomedafuncao' || key === 'nomedafuno' || key === 'name' || key === 'nome') {
        normalizedRow.name = row[key];
      } else if (key === 'tipodemaodeobra' || key === 'tipodemodeobra' || key === 'labortype' || key === 'laborType') {
        normalizedRow.laborType = row[key];
      } else if (key === 'cpf') {
        normalizedRow.cpf = row[key];
      } else if (key === 'matricula' || key === 'registration') {
        normalizedRow.registration = row[key];
      } else if (key === 'empresa' || key === 'company') {
        normalizedRow.company = row[key];
      } else if (key === 'telefone' || key === 'phone') {
        normalizedRow.phone = row[key];
      } else if (key === 'datanasc' || key === 'birthdate' || key === 'birthDate') {
        normalizedRow.birthDate = row[key];
      } else if (key === 'genero' || key === 'gender') {
        normalizedRow.gender = row[key];
      } else if (key === 'estadocivil' || key === 'maritalstatus' || key === 'maritalStatus') {
        normalizedRow.maritalStatus = row[key];
      } else if (key === 'pis') {
        normalizedRow.pis = row[key];
      } else if (key === 'ctps') {
        normalizedRow.ctps = row[key];
      } else if (key === 'ctpsseries' || key === 'ctpsSeries') {
        normalizedRow.ctpsSeries = row[key];
      } else if (key === 'ctpsuf' || key === 'ctpsUf') {
        normalizedRow.ctpsUf = row[key];
      } else if (key === 'nomedamae' || key === 'mothername' || key === 'motherName') {
        normalizedRow.motherName = row[key];
      } else if (key === 'dataadmissao' || key === 'admissiondate' || key === 'admissionDate') {
        normalizedRow.admissionDate = row[key];
      } else if (key === 'status') {
        normalizedRow.status = row[key];
      } else if (key === 'rg') {
        normalizedRow.rg = row[key];
      } else if (key === 'endereco' || key === 'address') {
        normalizedRow.address = row[key];
      } else if (key === 'cidade' || key === 'city') {
        normalizedRow.city = row[key];
      } else if (key === 'estado' || key === 'state') {
        normalizedRow.state = row[key];
      } else if (key === 'cep') {
        normalizedRow.cep = row[key];
      } else if (key === 'email') {
        normalizedRow.email = row[key];
      } else if (key === 'cargo' || key === 'role') {
        normalizedRow.role = row[key];
      } else if (key === 'categoria' || key === 'category') {
        normalizedRow.category = row[key];
      } else if (key === 'centrocusto' || key === 'centroCusto') {
        normalizedRow.centroCusto = row[key];
      } else if (key === 'obra') {
        normalizedRow.obra = row[key];
      } else if (key === 'mo') {
        normalizedRow.mo = row[key];
      } else if (key === 'localalojado' || key === 'localAlojado') {
        normalizedRow.localAlojado = row[key];
      } else if (key === 'pontoreferencia' || key === 'pontoReferencia') {
        normalizedRow.pontoReferencia = row[key];
      } else if (key === 'statusbancodoc' || key === 'statusBancodoc') {
        normalizedRow.statusBancodoc = row[key];
      } else if (key === 'efetivordo' || key === 'efetivoRDO') {
        normalizedRow.efetivoRDO = row[key];
      } else if (key === 'horasnormaistrabalhadas' || key === 'horasNormaisTrabalhadas') {
        normalizedRow.horasNormaisTrabalhadas = row[key];
      } else if (key === 'horasextrastrabalhadas' || key === 'horasExtrasTrabalhadas') {
        normalizedRow.horasExtrasTrabalhadas = row[key];
      } else if (key === 'horasnoturnastrabalhadas' || key === 'horasNoturnasTrabalhadas') {
        normalizedRow.horasNoturnasTrabalhadas = row[key];
      } else if (key === 'primeiraexperiencia' || key === 'primeiraExperiencia') {
        normalizedRow.primeiraExperiencia = row[key];
      } else if (key === 'segundaexperiencia' || key === 'segundaExperiencia') {
        normalizedRow.segundaExperiencia = row[key];
      } else if (key === 'previsaoobra' || key === 'previsaoObra') {
        normalizedRow.previsaoObra = row[key];
      }
    });
    
    // Só adiciona se tiver pelo menos nome
    if (normalizedRow.name && normalizedRow.name.trim() !== '') {
      data.push(normalizedRow);
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
 * Detecta o encoding do arquivo
 */
export function detectFileEncoding(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(buffer);
      
      // Verificar BOM para UTF-8
      if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
        resolve('UTF-8-BOM');
        return;
      }
      
      // Verificar BOM para UTF-16 LE
      if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
        resolve('UTF-16-LE');
        return;
      }
      
      // Verificar BOM para UTF-16 BE
      if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
        resolve('UTF-16-BE');
        return;
      }
      
      // Tentar detectar encoding baseado no conteúdo
      const text = new TextDecoder('utf-8').decode(bytes);
      const hasSpecialChars = /[À-ÿ]/.test(text);
      
      if (hasSpecialChars) {
        resolve('UTF-8');
      } else {
        // Tentar detectar se é Latin1/ISO-8859-1
        const latin1Text = new TextDecoder('latin1').decode(bytes);
        const latin1HasSpecialChars = /[À-ÿ]/.test(latin1Text);
        
        if (latin1HasSpecialChars) {
          resolve('Latin1');
        } else {
          resolve('UTF-8'); // Padrão
        }
      }
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Converte arquivo para UTF-8
 */
export function convertFileToUTF8(file: File): Promise<string> {
  return new Promise(async (resolve) => {
    const encoding = await detectFileEncoding(file);
    
    if (encoding === 'UTF-8' || encoding === 'UTF-8-BOM') {
      // Já está em UTF-8, apenas ler
      const reader = new FileReader();
      reader.onload = (e) => {
        let content = e.target?.result as string;
        // Remover BOM se presente
        content = content.replace(/^\uFEFF/, '');
        resolve(content);
      };
      reader.readAsText(file, 'utf-8');
    } else if (encoding === 'Latin1') {
      // Converter de Latin1 para UTF-8
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(buffer);
        
        // Converter bytes Latin1 para UTF-8
        const decoder = new TextDecoder('latin1');
        const latin1Text = decoder.decode(bytes);
        
        // Converter para UTF-8
        const encoder = new TextEncoder();
        const utf8Bytes = encoder.encode(latin1Text);
        const utf8Text = new TextDecoder('utf-8').decode(utf8Bytes);
        
        resolve(utf8Text);
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Para outros encodings, tentar UTF-8 primeiro
      const reader = new FileReader();
      reader.onload = (e) => {
        let content = e.target?.result as string;
        content = content.replace(/^\uFEFF/, '');
        resolve(content);
      };
      reader.readAsText(file, 'utf-8');
    }
  });
}

/**
 * Valida encoding do arquivo
 */
export function validateFileEncoding(file: File): Promise<ValidationResult> {
  return new Promise(async (resolve) => {
    const result: ValidationResult = {
      isValid: true,
      warnings: [],
      errors: []
    };
    
    try {
      const encoding = await detectFileEncoding(file);
      const content = await convertFileToUTF8(file);
      
      console.log(`🔍 Encoding detectado: ${encoding}`);
      
      // Verificar se há BOM
      if (encoding === 'UTF-8-BOM') {
        result.warnings.push('Arquivo contém BOM (Byte Order Mark) - será removido automaticamente');
      }
      
      // Verificar se o encoding não é UTF-8
      if (encoding !== 'UTF-8' && encoding !== 'UTF-8-BOM') {
        result.warnings.push(`Arquivo detectado como ${encoding} - será convertido para UTF-8`);
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
      
      // Verificar se há problemas de encoding
      const encodingIssues = detectEncodingIssues(content);
      if (encodingIssues.length > 0) {
        result.errors.push(...encodingIssues);
        result.isValid = false;
      }
      
      resolve(result);
    } catch (error) {
      result.errors.push(`Erro ao processar arquivo: ${error}`);
      result.isValid = false;
      resolve(result);
    }
  });
}

// Função utilitária para normalizar cabeçalhos
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')  // Substituir ç por c
    .replace(/[ñ]/g, 'n')
    .replace(/\s+/g, '')
    .replace(/[^a-z]/g, '');
}

export function parseCSVWithEncoding(csvText: string): any[] {
  // Remover BOM
  const cleanText = csvText.replace(/^\uFEFF/, '');
  
  const lines = cleanText.split('\n');
  if (lines.length < 2) {
    return []
  }

  // Detectar separador automaticamente
  const firstLine = lines[0];
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  
  // Usar o separador mais frequente, ou vírgula como padrão
  const separator = semicolonCount >= commaCount ? ';' : ',';
  
  // Normalizar cabeçalhos
  const rawHeaders = lines[0].split(separator);
  const headers = rawHeaders.map(h => {
    // Aplicar normalização completa diretamente
    return h
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      .replace(/\s+/g, '')
      .replace(/[^a-z]/g, '');
  });
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      continue
    }
    
    // Tratar campos entre aspas
    const values = parseCSVLine(line, separator);
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = robustNormalizeText(values[index] || '');
    });

    // Mapear campos normalizados para os nomes esperados
    const normalizedRow: any = {};
    Object.keys(row).forEach(key => {
      // Mapeamento completo de todos os campos necessários
      if (key === 'nomedafuncao' || key === 'name' || key === 'nome') {
        normalizedRow.name = row[key];
      } else if (key === 'tipodemaodeobra' || key === 'labortype' || key === 'laborType') {
        normalizedRow.laborType = row[key];
      } else if (key === 'cpf') {
        normalizedRow.cpf = row[key];
      } else if (key === 'matricula' || key === 'registration') {
        normalizedRow.registration = row[key];
      } else if (key === 'empresa' || key === 'company') {
        normalizedRow.company = row[key];
      } else if (key === 'telefone' || key === 'phone') {
        normalizedRow.phone = row[key];
      } else if (key === 'datanasc' || key === 'birthdate' || key === 'birthDate') {
        normalizedRow.birthDate = row[key];
      } else if (key === 'genero' || key === 'gender') {
        normalizedRow.gender = row[key];
      } else if (key === 'estadocivil' || key === 'maritalstatus' || key === 'maritalStatus') {
        normalizedRow.maritalStatus = row[key];
      } else if (key === 'pis') {
        normalizedRow.pis = row[key];
      } else if (key === 'ctps') {
        normalizedRow.ctps = row[key];
      } else if (key === 'ctpsseries' || key === 'ctpsSeries') {
        normalizedRow.ctpsSeries = row[key];
      } else if (key === 'ctpsuf' || key === 'ctpsUf') {
        normalizedRow.ctpsUf = row[key];
      } else if (key === 'nomedamae' || key === 'mothername' || key === 'motherName') {
        normalizedRow.motherName = row[key];
      } else if (key === 'dataadmissao' || key === 'admissiondate' || key === 'admissionDate') {
        normalizedRow.admissionDate = row[key];
      } else if (key === 'status') {
        normalizedRow.status = row[key];
      } else if (key === 'rg') {
        normalizedRow.rg = row[key];
      } else if (key === 'endereco' || key === 'address') {
        normalizedRow.address = row[key];
      } else if (key === 'cidade' || key === 'city') {
        normalizedRow.city = row[key];
      } else if (key === 'estado' || key === 'state') {
        normalizedRow.state = row[key];
      } else if (key === 'cep') {
        normalizedRow.cep = row[key];
      } else if (key === 'email') {
        normalizedRow.email = row[key];
      } else if (key === 'cargo' || key === 'role') {
        normalizedRow.role = row[key];
      } else if (key === 'categoria' || key === 'category') {
        normalizedRow.category = row[key];
      } else if (key === 'centrocusto' || key === 'centroCusto') {
        normalizedRow.centroCusto = row[key];
      } else if (key === 'obra') {
        normalizedRow.obra = row[key];
      } else if (key === 'mo') {
        normalizedRow.mo = row[key];
      } else if (key === 'localalojado' || key === 'localAlojado') {
        normalizedRow.localAlojado = row[key];
      } else if (key === 'pontoreferencia' || key === 'pontoReferencia') {
        normalizedRow.pontoReferencia = row[key];
      } else if (key === 'statusbancodoc' || key === 'statusBancodoc') {
        normalizedRow.statusBancodoc = row[key];
      } else if (key === 'efetivordo' || key === 'efetivoRDO') {
        normalizedRow.efetivoRDO = row[key];
      } else if (key === 'horasnormaistrabalhadas' || key === 'horasNormaisTrabalhadas') {
        normalizedRow.horasNormaisTrabalhadas = row[key];
      } else if (key === 'horasextrastrabalhadas' || key === 'horasExtrasTrabalhadas') {
        normalizedRow.horasExtrasTrabalhadas = row[key];
      } else if (key === 'horasnoturnastrabalhadas' || key === 'horasNoturnasTrabalhadas') {
        normalizedRow.horasNoturnasTrabalhadas = row[key];
      } else if (key === 'primeiraexperiencia' || key === 'primeiraExperiencia') {
        normalizedRow.primeiraExperiencia = row[key];
      } else if (key === 'segundaexperiencia' || key === 'segundaExperiencia') {
        normalizedRow.segundaExperiencia = row[key];
      } else if (key === 'previsaoobra' || key === 'previsaoObra') {
        normalizedRow.previsaoObra = row[key];
      }
    });
    
    // Adicionar todos os registros que tenham pelo menos nome ou CPF
    if (normalizedRow.name || normalizedRow.cpf) {
      data.push(normalizedRow);
    }
  }

  return data;
}

/**
 * Parse uma linha CSV respeitando campos entre aspas
 */
function parseCSVLine(line: string, separator: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Adicionar o último valor
  values.push(current.trim());
  
  // Remover aspas dos valores
  return values.map(value => value.replace(/^"|"$/g, ''));
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