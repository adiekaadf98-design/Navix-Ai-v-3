import Decimal from 'decimal.js';

// Configure Decimal for minimum 50 significant digits (we set 65 internally for guard digits)
Decimal.set({
  precision: 65,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -50,
  toExpPos: 50
});

export interface MathExecutionResult {
  status: 'SUCCESS' | 'FAILED';
  expression: string;
  result?: string;
  exactResult?: string;
  formattedDisplay?: string;
  numericValue?: number | null;
  precision: number;
  isExact: boolean;
  classification: 'EXACT_INTEGER' | 'EXACT_RATIONAL' | 'HIGH_PRECISION_DECIMAL' | 'HIGH_PRECISION_TRANSCENDENTAL';
  operationType: string;
  steps: string[];
  notes?: string[];
  error?: string;
  executionTimeMs: number;
}

export interface PrimeFactorItem {
  prime: string;
  power: number;
}

export interface NumberAnalysisResult {
  status: 'SUCCESS' | 'FAILED';
  integer: string;
  isInteger: boolean;
  parity: 'GANJIL (ODD)' | 'GENAP (EVEN)';
  digitCount: number;
  digitSum: number;
  isPrime: boolean;
  primeFactors: PrimeFactorItem[];
  primeFactorizationString: string;
  divisors: string[];
  divisorCount: number;
  sumOfDivisors: string;
  isPerfectNumber: boolean;
  isSquare: boolean;
  squareRoot?: string;
  binary: string;
  hexadecimal: string;
  octal: string;
  mathematicalProperties: string[];
  error?: string;
  executionTimeMs: number;
}

export class MathEngine {
  public readonly name = 'MathEngine';
  public readonly category = 'math';
  public readonly description = 'Mesin Matematika Deterministik Presisi Tinggi (50 Digit Signifikan) Navix AI';
  public readonly capabilities = [
    'arithmetic',
    'single_integer_analysis',
    'high_precision_50_digits',
    'exact_integer',
    'exact_rational',
    'transcendental',
    'combinatorics',
    'financial_math'
  ];

  /**
   * Helper: BigInt Factorial (Exact Integer)
   */
  public static factorial(n: bigint | number): bigint {
    const num = BigInt(n);
    if (num < 0n) throw new Error('Faktorial bilangan negatif tidak terdefinisi.');
    if (num === 0n || num === 1n) return 1n;
    if (num > 5000n) throw new Error('Faktorial terlalu besar untuk komputasi instan (maksimal n = 5000).');
    let res = 1n;
    for (let i = 2n; i <= num; i++) {
      res *= i;
    }
    return res;
  }

  /**
   * Helper: Greatest Common Divisor (GCD) for exact BigInt
   */
  public static gcd(a: bigint, b: bigint): bigint {
    let x = a < 0n ? -a : a;
    let y = b < 0n ? -b : b;
    while (y !== 0n) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x;
  }

  /**
   * Helper: Least Common Multiple (LCM) for exact BigInt
   */
  public static lcm(a: bigint, b: bigint): bigint {
    if (a === 0n || b === 0n) return 0n;
    const g = MathEngine.gcd(a, b);
    return ((a < 0n ? -a : a) / g) * (b < 0n ? -b : b);
  }

  /**
   * Permutation: nPr = n! / (n - r)!
   */
  public static permutation(n: bigint, r: bigint): bigint {
    if (n < 0n || r < 0n) throw new Error('Permutasi n dan r harus non-negatif.');
    if (r > n) return 0n;
    let res = 1n;
    for (let i = n - r + 1n; i <= n; i++) {
      res *= i;
    }
    return res;
  }

  /**
   * Combination: nCr = n! / (r! * (n - r)!)
   */
  public static combination(n: bigint, r: bigint): bigint {
    if (n < 0n || r < 0n) throw new Error('Kombinasi n dan r harus non-negatif.');
    if (r > n) return 0n;
    const k = r > n - r ? n - r : r;
    let num = 1n;
    let den = 1n;
    for (let i = 1n; i <= k; i++) {
      num *= n - i + 1n;
      den *= i;
    }
    return num / den;
  }

  /**
   * Evaluator Utama: hitung_ekspresi
   * Menghitung ekspresi dengan presisi 50 significant digits.
   */
  public hitungEkspresi(rawExpr: string): MathExecutionResult {
    const startTime = Date.now();
    const steps: string[] = [];
    const notes: string[] = [];

    if (!rawExpr || typeof rawExpr !== 'string' || !rawExpr.trim()) {
      return {
        status: 'FAILED',
        expression: rawExpr || '',
        precision: 50,
        isExact: false,
        classification: 'HIGH_PRECISION_DECIMAL',
        operationType: 'UNKNOWN',
        steps: [],
        error: 'Ekspresi matematika kosong. Mohon berikan rumus atau operasi yang ingin dihitung.',
        executionTimeMs: Date.now() - startTime
      };
    }

    try {
      // 1. Normalisasi natural language & simbol matematika umum
      let cleaned = rawExpr.trim();
      steps.push(`Input awal: "${cleaned}"`);

      // Deteksi persentase finansial: "modal 150 naik 12.5%" atau "150 naik 12.5%"
      const naikMatch = cleaned.match(/^(?:modal\s+)?(\d+(?:\.\d+)?)\s+(?:naik|tumbuh|meningkat|\+)\s+(\d+(?:\.\d+)?)\s*%/i);
      if (naikMatch) {
        const base = new Decimal(naikMatch[1]);
        const pct = new Decimal(naikMatch[2]).div(100);
        const addition = base.mul(pct);
        const finalVal = base.add(addition);
        steps.push(`Kalkulasi persentase kenaikan: ${base.toString()} × (1 + ${pct.toString()})`);
        return {
          status: 'SUCCESS',
          expression: cleaned,
          result: finalVal.toString(),
          exactResult: finalVal.toString(),
          formattedDisplay: `${finalVal.toString()} (Kenaikan ${naikMatch[2]}% dari ${naikMatch[1]} adalah +${addition.toString()})`,
          numericValue: finalVal.toNumber(),
          precision: 50,
          isExact: true,
          classification: 'EXACT_RATIONAL',
          operationType: 'FINANCIAL_PERCENTAGE_INCREASE',
          steps,
          notes: ['Kalkulasi kenaikan persentase dihitung secara eksak presisi tinggi.'],
          executionTimeMs: Date.now() - startTime
        };
      }

      // Deteksi persentase diskon / penurunan: "150 turun 20%" atau "150 - 20%"
      const turunMatch = cleaned.match(/^(?:modal\s+)?(\d+(?:\.\d+)?)\s+(?:turun|diskon|berkurang|-)\s+(\d+(?:\.\d+)?)\s*%/i);
      if (turunMatch) {
        const base = new Decimal(turunMatch[1]);
        const pct = new Decimal(turunMatch[2]).div(100);
        const reduction = base.mul(pct);
        const finalVal = base.sub(reduction);
        steps.push(`Kalkulasi persentase penurunan: ${base.toString()} × (1 - ${pct.toString()})`);
        return {
          status: 'SUCCESS',
          expression: cleaned,
          result: finalVal.toString(),
          exactResult: finalVal.toString(),
          formattedDisplay: `${finalVal.toString()} (Penurunan ${turunMatch[2]}% dari ${turunMatch[1]} adalah -${reduction.toString()})`,
          numericValue: finalVal.toNumber(),
          precision: 50,
          isExact: true,
          classification: 'EXACT_RATIONAL',
          operationType: 'FINANCIAL_PERCENTAGE_DECREASE',
          steps,
          notes: ['Kalkulasi penurunan persentase dihitung secara eksak presisi tinggi.'],
          executionTimeMs: Date.now() - startTime
        };
      }

      // Deteksi persentase dari nilai: "12.5% dari 150" atau "12.5% of 150"
      const dariMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*%\s*(?:dari|of|x|\*)\s*(\d+(?:\.\d+)?)/i);
      if (dariMatch) {
        const pct = new Decimal(dariMatch[1]).div(100);
        const base = new Decimal(dariMatch[2]);
        const res = pct.mul(base);
        steps.push(`Kalkulasi bagian persentase: ${pct.toString()} × ${base.toString()}`);
        return {
          status: 'SUCCESS',
          expression: cleaned,
          result: res.toString(),
          exactResult: res.toString(),
          formattedDisplay: `${res.toString()} (${dariMatch[1]}% dari ${dariMatch[2]})`,
          numericValue: res.toNumber(),
          precision: 50,
          isExact: true,
          classification: 'EXACT_RATIONAL',
          operationType: 'PERCENTAGE_OF_VALUE',
          steps,
          notes: ['Kalkulasi proporsi persentase dihitung secara eksak presisi tinggi.'],
          executionTimeMs: Date.now() - startTime
        };
      }

      // Deteksi faktorial tunggal besar: e.g. "100!" atau "factorial(100)"
      const factMatch = cleaned.match(/^(\d+)\s*!$/) || cleaned.match(/^factorial\((\d+)\)$/i) || cleaned.match(/^fact\((\d+)\)$/i);
      if (factMatch) {
        const n = BigInt(factMatch[1]);
        const factVal = MathEngine.factorial(n);
        const strVal = factVal.toString();
        steps.push(`Menghitung faktorial eksak untuk n = ${n.toString()}`);
        return {
          status: 'SUCCESS',
          expression: cleaned,
          result: strVal,
          exactResult: strVal,
          formattedDisplay: strVal.length > 60 ? `${strVal.slice(0, 30)}...${strVal.slice(-20)} (${strVal.length} digit)` : strVal,
          numericValue: n <= 170n ? Number(strVal) : null,
          precision: 50,
          isExact: true,
          classification: 'EXACT_INTEGER',
          operationType: 'FACTORIAL',
          steps,
          notes: [`Nilai faktorial dihitung 100% eksak (${strVal.length} digit bilangan bulat).`],
          executionTimeMs: Date.now() - startTime
        };
      }

      // 2. Evaluasi ekspresi menggunakan tokenizer & recursive descent parser presisi tinggi
      const parser = new HighPrecisionMathParser(cleaned);
      const evalResult = parser.parse();

      steps.push(...parser.getSteps());
      const isInteger = evalResult.decimal.isInteger();
      const isExact = evalResult.isExact;
      const strResult = isInteger ? evalResult.decimal.toFixed() : evalResult.decimal.toPrecision(50).replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');

      let classification: 'EXACT_INTEGER' | 'EXACT_RATIONAL' | 'HIGH_PRECISION_DECIMAL' | 'HIGH_PRECISION_TRANSCENDENTAL' = 'HIGH_PRECISION_DECIMAL';
      if (isInteger && isExact) {
        classification = 'EXACT_INTEGER';
      } else if (isExact) {
        classification = 'EXACT_RATIONAL';
      } else if (evalResult.hasTranscendental) {
        classification = 'HIGH_PRECISION_TRANSCENDENTAL';
      }

      if (!isExact) {
        notes.push('Hasil transendental/irasional disajikan dengan 50 digit signifikan deterministik presisi tinggi.');
      } else {
        notes.push('Hasil perhitungan ini adalah nilai eksak (Exact Value).');
      }

      return {
        status: 'SUCCESS',
        expression: cleaned,
        result: strResult,
        exactResult: isExact ? (isInteger ? evalResult.decimal.toFixed() : evalResult.exactFraction || strResult) : undefined,
        formattedDisplay: evalResult.exactFraction && !isInteger ? `${strResult} (Fraksi eksak: ${evalResult.exactFraction})` : strResult,
        numericValue: evalResult.decimal.toNumber(),
        precision: 50,
        isExact,
        classification,
        operationType: evalResult.operationType,
        steps,
        notes,
        executionTimeMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        status: 'FAILED',
        expression: rawExpr,
        precision: 50,
        isExact: false,
        classification: 'HIGH_PRECISION_DECIMAL',
        operationType: 'ERROR',
        steps,
        error: err?.message || 'Terjadi kesalahan saat menghitung ekspresi matematika.',
        executionTimeMs: Date.now() - startTime
      };
    }
  }

  /**
   * Analisis Bilangan Bulat Tunggal: analisis_angka
   * Dipanggil saat user memasukkan bilangan bulat (misal 7023).
   */
  public analisisAngka(input: number | string): NumberAnalysisResult {
    const startTime = Date.now();
    const str = String(input).trim().replace(/,/g, '');

    // Validasi bilangan bulat
    if (!/^-?\d+$/.test(str)) {
      return {
        status: 'FAILED',
        integer: str,
        isInteger: false,
        parity: 'GANJIL (ODD)',
        digitCount: 0,
        digitSum: 0,
        isPrime: false,
        primeFactors: [],
        primeFactorizationString: '',
        divisors: [],
        divisorCount: 0,
        sumOfDivisors: '0',
        isPerfectNumber: false,
        isSquare: false,
        binary: '',
        hexadecimal: '',
        octal: '',
        mathematicalProperties: [],
        error: `Input "${str}" bukan bilangan bulat yang valid.`,
        executionTimeMs: Date.now() - startTime
      };
    }

    try {
      const nBig = BigInt(str);
      const isNegative = nBig < 0n;
      const absN = isNegative ? -nBig : nBig;
      const absStr = absN.toString();

      // Parity
      const isEven = absN % 2n === 0n;
      const parity: 'GANJIL (ODD)' | 'GENAP (EVEN)' = isEven ? 'GENAP (EVEN)' : 'GANJIL (ODD)';

      // Digit properties
      const digitCount = absStr.length;
      let digitSum = 0;
      for (let i = 0; i < absStr.length; i++) {
        digitSum += Number(absStr[i]);
      }

      // Bases
      const binary = (isNegative ? '-' : '') + absN.toString(2);
      const hexadecimal = (isNegative ? '-0x' : '0x') + absN.toString(16).toUpperCase();
      const octal = (isNegative ? '-0o' : '0o') + absN.toString(8);

      // Square test
      const sqrtApprox = BigInt(Math.floor(Math.sqrt(Number(absStr))));
      const isSquare = sqrtApprox * sqrtApprox === absN;
      const squareRoot = isSquare ? sqrtApprox.toString() : undefined;

      // Prime factorization & Divisors (khusus bilangan absolut <= 10^12 untuk respon instan tanpa freeze)
      let isPrime = false;
      const primeFactors: PrimeFactorItem[] = [];
      let primeFactorizationString = '';
      const divisors: string[] = [];
      let divisorCount = 0;
      let sumOfDivisors = 0n;
      let isPerfectNumber = false;

      if (absN <= 1n) {
        isPrime = false;
        divisors.push('1');
        divisorCount = 1;
        sumOfDivisors = 1n;
        primeFactorizationString = absN.toString();
      } else if (absN <= 10_000_000_000_000n) {
        // Factorization via trial division
        let temp = absN;
        let d = 2n;
        while (d * d <= temp) {
          if (temp % d === 0n) {
            let count = 0;
            while (temp % d === 0n) {
              count++;
              temp /= d;
            }
            primeFactors.push({ prime: d.toString(), power: count });
          }
          d = d === 2n ? 3n : d + 2n;
        }
        if (temp > 1n) {
          primeFactors.push({ prime: temp.toString(), power: 1 });
        }

        // Prime check
        isPrime = primeFactors.length === 1 && primeFactors[0].power === 1;

        // String representation
        primeFactorizationString = primeFactors
          .map(f => (f.power > 1 ? `${f.prime}^${f.power}` : f.prime))
          .join(' × ');

        // Find all divisors for numbers up to 10^8
        if (absN <= 100_000_000n) {
          const smallDivs: bigint[] = [];
          for (let i = 1n; i * i <= absN; i++) {
            if (absN % i === 0n) {
              smallDivs.push(i);
              if (i * i !== absN) {
                smallDivs.push(absN / i);
              }
            }
          }
          smallDivs.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
          divisors.push(...smallDivs.map(d => d.toString()));
          divisorCount = divisors.length;
          sumOfDivisors = smallDivs.reduce((acc, val) => acc + val, 0n);
          // Perfect number check: sum of proper divisors equals number
          isPerfectNumber = sumOfDivisors - absN === absN;
        } else {
          // Divisor count formula: (p1 + 1)(p2 + 1)...
          divisorCount = primeFactors.reduce((acc, f) => acc * (f.power + 1), 1);
          divisors.push('1', ...primeFactors.map(f => f.prime), absN.toString());
          sumOfDivisors = 0n; // Not computed for giant numbers
        }
      } else {
        // Bilangan raksasa > 10^12: cek prima cepat Miller-Rabin deterministik
        isPrime = MathEngine.millerRabinDeterministic(absN);
        primeFactorizationString = isPrime ? `${absN} (Bilangan Prima)` : 'Faktorisasi bilangan besar tersedia via sub-tugas';
        divisorCount = isPrime ? 2 : 0;
      }

      // Mathematical properties array
      const properties: string[] = [
        `Paritas: Bilangan ${isEven ? 'Genap' : 'Ganjil'}.`,
        `Jumlah Digit: Terdiri dari ${digitCount} digit dengan jumlah total digit = ${digitSum}.`,
        isPrime
          ? `Status Bilangan: Merupakan Bilangan Prima (hanya habis dibagi 1 dan ${absN.toString()}).`
          : `Status Bilangan: Merupakan Bilangan Komposit (bukan prima). Faktorisasi prima: ${primeFactorizationString}.`,
        isSquare ? `Kuadrat Sempurna: Ya (${squareRoot}^2 = ${absN.toString()}).` : 'Bukan kuadrat sempurna.',
        isPerfectNumber ? `Bilangan Sempurna (Perfect Number): Ya, jumlah faktor pembagi sejati sama dengan nilai bilangan.` : 'Bukan bilangan sempurna.'
      ];

      if (divisorCount > 0) {
        properties.push(`Jumlah Pembagi (Divisors): Memiliki ${divisorCount} pembagi positif.`);
      }

      return {
        status: 'SUCCESS',
        integer: str,
        isInteger: true,
        parity,
        digitCount,
        digitSum,
        isPrime,
        primeFactors,
        primeFactorizationString,
        divisors: divisors.slice(0, 100), // Max 100 first divisors in view
        divisorCount,
        sumOfDivisors: sumOfDivisors > 0n ? sumOfDivisors.toString() : 'N/A',
        isPerfectNumber,
        isSquare,
        squareRoot,
        binary,
        hexadecimal,
        octal,
        mathematicalProperties: properties,
        executionTimeMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        status: 'FAILED',
        integer: str,
        isInteger: true,
        parity: 'GANJIL (ODD)',
        digitCount: 0,
        digitSum: 0,
        isPrime: false,
        primeFactors: [],
        primeFactorizationString: '',
        divisors: [],
        divisorCount: 0,
        sumOfDivisors: '0',
        isPerfectNumber: false,
        isSquare: false,
        binary: '',
        hexadecimal: '',
        octal: '',
        mathematicalProperties: [],
        error: err?.message || 'Gagal menganalisis karakteristik angka.',
        executionTimeMs: Date.now() - startTime
      };
    }
  }

  /**
   * Deterministic Miller-Rabin test for BigInt
   */
  private static millerRabinDeterministic(n: bigint): boolean {
    if (n < 2n) return false;
    if (n === 2n || n === 3n || n === 5n || n === 7n) return true;
    if (n % 2n === 0n || n % 3n === 0n) return false;

    // Write n - 1 as 2^s * d
    let d = n - 1n;
    let s = 0n;
    while (d % 2n === 0n) {
      d /= 2n;
      s++;
    }

    // Deterministic bases for 64-bit integers
    const bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
    for (const a of bases) {
      if (n <= a) break;
      let x = MathEngine.modPow(a, d, n);
      if (x === 1n || x === n - 1n) continue;

      let composite = true;
      for (let r = 1n; r < s; r++) {
        x = (x * x) % n;
        if (x === n - 1n) {
          composite = false;
          break;
        }
      }
      if (composite) return false;
    }
    return true;
  }

  private static modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    let res = 1n;
    let b = base % mod;
    let e = exp;
    while (e > 0n) {
      if (e % 2n === 1n) res = (res * b) % mod;
      b = (b * b) % mod;
      e /= 2n;
    }
    return res;
  }

  /**
   * Standard IEngine contract execution
   */
  public async execute(payload: any): Promise<any> {
    const rawInput = payload?.expression || payload?.query || payload?.input || payload?.data || payload?.integer || '';
    const action = (payload?.action || payload?.mode || '').toLowerCase();

    // Check if input is a single integer
    const trimmed = String(rawInput).trim();
    const isSingleInteger = /^-?\d+$/.test(trimmed) && (action === 'analisis_angka' || !payload?.expression || payload?.integer);

    if (action === 'analisis_angka' || isSingleInteger) {
      const analysis = this.analisisAngka(payload?.integer || trimmed);
      return {
        status: analysis.status,
        source: this.name,
        engineName: this.name,
        category: this.category,
        message: analysis.status === 'SUCCESS'
          ? `Analisis angka [${analysis.integer}] selesai: Bilangan ${analysis.parity}, ${analysis.isPrime ? 'Prima' : 'Komposit (Faktor: ' + analysis.primeFactorizationString + ')'}.`
          : `Gagal menganalisis angka: ${analysis.error}`,
        output: analysis,
        data: analysis,
        realOutput: analysis.primeFactorizationString || analysis.integer
      };
    }

    // Default: hitung_ekspresi
    const calc = this.hitungEkspresi(trimmed);
    return {
      status: calc.status,
      source: this.name,
      engineName: this.name,
      category: this.category,
      message: calc.status === 'SUCCESS'
        ? `Perhitungan matematika selesai [Presisi: ${calc.precision} digit]: ${calc.expression} = ${calc.formattedDisplay || calc.result}`
        : `Perhitungan matematika gagal: ${calc.error}`,
      output: calc,
      data: calc,
      realOutput: calc.result
    };
  }
}

/**
 * High-Precision Mathematical Expression Parser
 * Tokenizer & Recursive-Descent Evaluator menggunakan Decimal.js
 */
interface ParsedResult {
  decimal: Decimal;
  isExact: boolean;
  hasTranscendental: boolean;
  exactFraction?: string;
  operationType: string;
}

class HighPrecisionMathParser {
  private expr: string;
  private tokens: string[] = [];
  private pos = 0;
  private steps: string[] = [];
  private hasTranscendental = false;
  private hasDivision = false;
  private divisionNumerator?: Decimal;
  private divisionDenominator?: Decimal;

  constructor(expr: string) {
    this.expr = expr;
    this.tokenize();
  }

  public getSteps(): string[] {
    return this.steps;
  }

  private tokenize() {
    let clean = this.expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\*\*/g, '^')
      .replace(/pi\b|π/gi, 'PI')
      .replace(/\be\b/g, 'E')
      .replace(/phi\b|φ/gi, 'PHI');

    // Token regex: numbers, function names, operators, parentheses
    const regex = /\s*([0-9]+(?:\.[0-9]+)?(?:e[+-]?[0-9]+)?|[A-Za-z_][A-Za-z0-9_]*|\+|-|\*|\/|\^|%|!|\(|\)|,)\s*/g;
    let match;
    this.tokens = [];
    while ((match = regex.exec(clean)) !== null) {
      if (match[1]) {
        this.tokens.push(match[1]);
      }
    }
  }

  public parse(): ParsedResult {
    this.pos = 0;
    this.steps.push(`Memulai evaluasi parsing deterministik untuk ${this.tokens.length} token.`);
    if (this.tokens.length === 0) {
      throw new Error('Ekspresi kosong.');
    }

    const val = this.parseExpression();
    if (this.pos < this.tokens.length) {
      throw new Error(`Sintaks ekspresi tidak valid pada token: "${this.tokens[this.pos]}"`);
    }

    let exactFraction: string | undefined;
    if (this.hasDivision && this.divisionNumerator && this.divisionDenominator) {
      if (this.divisionNumerator.isInteger() && this.divisionDenominator.isInteger() && !this.divisionDenominator.isZero()) {
        const numBig = BigInt(this.divisionNumerator.toFixed());
        const denBig = BigInt(this.divisionDenominator.toFixed());
        const g = MathEngine.gcd(numBig, denBig);
        const redNum = numBig / g;
        const redDen = denBig / g;
        if (redDen !== 1n) {
          exactFraction = `${redNum.toString()}/${redDen.toString()}`;
        }
      }
    }

    return {
      decimal: val,
      isExact: !this.hasTranscendental && (!this.hasDivision || Boolean(exactFraction) || val.isInteger()),
      hasTranscendental: this.hasTranscendental,
      exactFraction,
      operationType: this.hasTranscendental
        ? 'TRANSCENDENTAL_SCIENTIFIC'
        : this.hasDivision
        ? 'ARITHMETIC_RATIONAL'
        : 'ARITHMETIC_POLYNOMIAL'
    };
  }

  private parseExpression(): Decimal {
    let result = this.parseTerm();

    while (this.pos < this.tokens.length) {
      const op = this.tokens[this.pos];
      if (op === '+' || op === '-') {
        this.pos++;
        const nextTerm = this.parseTerm();
        if (op === '+') {
          result = result.add(nextTerm);
        } else {
          result = result.sub(nextTerm);
        }
      } else {
        break;
      }
    }

    return result;
  }

  private parseTerm(): Decimal {
    let result = this.parsePower();

    while (this.pos < this.tokens.length) {
      const op = this.tokens[this.pos];
      if (op === '*' || op === '/' || op === '%') {
        this.pos++;
        const nextVal = this.parsePower();
        if (op === '*') {
          result = result.mul(nextVal);
        } else if (op === '/') {
          if (nextVal.isZero()) {
            throw new Error('Pembagian dengan nol tidak terdefinisi (Division by zero).');
          }
          this.hasDivision = true;
          this.divisionNumerator = result;
          this.divisionDenominator = nextVal;
          result = result.div(nextVal);
        } else if (op === '%') {
          if (nextVal.isZero()) {
            throw new Error('Operasi modulus dengan nol tidak terdefinisi.');
          }
          result = result.mod(nextVal);
        }
      } else {
        break;
      }
    }

    return result;
  }

  private parsePower(): Decimal {
    let base = this.parseFactor();

    while (this.pos < this.tokens.length) {
      const op = this.tokens[this.pos];
      if (op === '^') {
        this.pos++;
        const exp = this.parseFactor();
        if (base.isNegative() && !exp.isInteger()) {
          throw new Error('Pangkat pecahan dari bilangan negatif menghasilkan bilangan kompleks.');
        }
        if (base.isInteger() && exp.isInteger() && exp.isPositive() && exp.lte(5000)) {
          // Exact BigInt power
          const bBig = BigInt(base.toFixed());
          const eBig = BigInt(exp.toFixed());
          let pRes = 1n;
          let curB = bBig;
          let curE = eBig;
          while (curE > 0n) {
            if (curE % 2n === 1n) pRes *= curB;
            curB *= curB;
            curE /= 2n;
          }
          base = new Decimal(pRes.toString());
        } else {
          this.hasTranscendental = true;
          base = base.pow(exp);
        }
      } else if (op === '!') {
        // Postfix Factorial
        this.pos++;
        if (!base.isInteger() || base.isNegative()) {
          throw new Error('Faktorial (!) hanya terdefinisi untuk bilangan bulat non-negatif.');
        }
        const bBig = BigInt(base.toFixed());
        const fBig = MathEngine.factorial(bBig);
        base = new Decimal(fBig.toString());
      } else {
        break;
      }
    }

    return base;
  }

  private parseFactor(): Decimal {
    if (this.pos >= this.tokens.length) {
      throw new Error('Ekspresi terpotong sebelum selesai.');
    }

    const token = this.tokens[this.pos];

    // Unary plus/minus
    if (token === '+') {
      this.pos++;
      return this.parseFactor();
    }
    if (token === '-') {
      this.pos++;
      return this.parseFactor().neg();
    }

    // Parentheses
    if (token === '(') {
      this.pos++;
      const val = this.parseExpression();
      if (this.pos >= this.tokens.length || this.tokens[this.pos] !== ')') {
        throw new Error('Kurung buka "(" tidak memiliki pasangan kurung tutup ")".');
      }
      this.pos++; // consume ')'
      return val;
    }

    // Constants
    if (token === 'PI') {
      this.pos++;
      this.hasTranscendental = true;
      return new Decimal('3.141592653589793238462643383279502884197169399375105820974944592307816406286');
    }
    if (token === 'E') {
      this.pos++;
      this.hasTranscendental = true;
      return new Decimal('2.718281828459045235360287471352662497757247093699959574966967627724076630353');
    }
    if (token === 'PHI') {
      this.pos++;
      this.hasTranscendental = true;
      return new Decimal(1).add(new Decimal(5).sqrt()).div(2);
    }

    // Number literal
    if (/^[0-9]/.test(token)) {
      this.pos++;
      return new Decimal(token);
    }

    // Function calls: e.g. sqrt(x), sin(x), log(x), etc.
    if (/^[A-Za-z_]/.test(token)) {
      const fnName = token.toLowerCase();
      this.pos++;
      if (this.pos >= this.tokens.length || this.tokens[this.pos] !== '(') {
        throw new Error(`Fungsi "${fnName}" harus diikuti oleh tanda kurung buka "(".`);
      }
      this.pos++; // consume '('

      // Parse argument(s)
      const args: Decimal[] = [];
      if (this.tokens[this.pos] !== ')') {
        args.push(this.parseExpression());
        while (this.pos < this.tokens.length && this.tokens[this.pos] === ',') {
          this.pos++;
          args.push(this.parseExpression());
        }
      }

      if (this.pos >= this.tokens.length || this.tokens[this.pos] !== ')') {
        throw new Error(`Kurung tutup ")" hilang setelah argumen fungsi "${fnName}".`);
      }
      this.pos++; // consume ')'

      return this.evaluateFunction(fnName, args);
    }

    throw new Error(`Token tidak terduga: "${token}".`);
  }

  private evaluateFunction(fn: string, args: Decimal[]): Decimal {
    if (fn === 'sqrt') {
      if (args.length !== 1) throw new Error('Fungsi sqrt() membutuhkan tepat 1 argumen.');
      if (args[0].isNegative()) throw new Error('Akar kuadrat dari bilangan negatif menghasilkan nilai imajiner (√(-x) = i√x).');
      this.hasTranscendental = true;
      return args[0].sqrt();
    }

    if (fn === 'cbrt') {
      if (args.length !== 1) throw new Error('Fungsi cbrt() membutuhkan tepat 1 argumen.');
      this.hasTranscendental = true;
      return args[0].cbrt();
    }

    if (fn === 'abs') {
      if (args.length !== 1) throw new Error('Fungsi abs() membutuhkan tepat 1 argumen.');
      return args[0].abs();
    }

    if (fn === 'pow') {
      if (args.length !== 2) throw new Error('Fungsi pow() membutuhkan 2 argumen: pow(base, exponent).');
      this.hasTranscendental = true;
      return args[0].pow(args[1]);
    }

    if (fn === 'fact' || fn === 'factorial') {
      if (args.length !== 1) throw new Error('Fungsi factorial() membutuhkan 1 argumen.');
      if (!args[0].isInteger() || args[0].isNegative()) throw new Error('Faktorial hanya terdefinisi untuk integer non-negatif.');
      const b = BigInt(args[0].toFixed());
      return new Decimal(MathEngine.factorial(b).toString());
    }

    if (fn === 'ncr' || fn === 'comb') {
      if (args.length !== 2) throw new Error('Fungsi nCr() membutuhkan 2 argumen: nCr(n, r).');
      return new Decimal(MathEngine.combination(BigInt(args[0].toFixed()), BigInt(args[1].toFixed())).toString());
    }

    if (fn === 'npr' || fn === 'perm') {
      if (args.length !== 2) throw new Error('Fungsi nPr() membutuhkan 2 argumen: nPr(n, r).');
      return new Decimal(MathEngine.permutation(BigInt(args[0].toFixed()), BigInt(args[1].toFixed())).toString());
    }

    if (fn === 'sin') {
      if (args.length !== 1) throw new Error('Fungsi sin() membutuhkan 1 argumen.');
      this.hasTranscendental = true;
      return args[0].sin();
    }

    if (fn === 'cos') {
      if (args.length !== 1) throw new Error('Fungsi cos() membutuhkan 1 argumen.');
      this.hasTranscendental = true;
      return args[0].cos();
    }

    if (fn === 'tan') {
      if (args.length !== 1) throw new Error('Fungsi tan() membutuhkan 1 argumen.');
      this.hasTranscendental = true;
      return args[0].tan();
    }

    if (fn === 'asin') {
      if (args.length !== 1) throw new Error('Fungsi asin() membutuhkan 1 argumen.');
      this.hasTranscendental = true;
      return args[0].asin();
    }

    if (fn === 'acos') {
      if (args.length !== 1) throw new Error('Fungsi acos() membutuhkan 1 argumen.');
      this.hasTranscendental = true;
      return args[0].acos();
    }

    if (fn === 'atan') {
      if (args.length !== 1) throw new Error('Fungsi atan() membutuhkan 1 argumen.');
      this.hasTranscendental = true;
      return args[0].atan();
    }

    if (fn === 'sinh') {
      if (args.length !== 1) throw new Error('Fungsi sinh() membutuhkan 1 argumen.');
      this.hasTranscendental = true;
      return args[0].sinh();
    }

    if (fn === 'cosh') {
      if (args.length !== 1) throw new Error('Fungsi cosh() membutuhkan 1 argumen.');
      this.hasTranscendental = true;
      return args[0].cosh();
    }

    if (fn === 'tanh') {
      if (args.length !== 1) throw new Error('Fungsi tanh() membutuhkan 1 argumen.');
      this.hasTranscendental = true;
      return args[0].tanh();
    }

    if (fn === 'log' || fn === 'ln') {
      if (args.length !== 1) throw new Error('Fungsi log() membutuhkan 1 argumen.');
      if (args[0].lte(0)) throw new Error('Logaritma dari bilangan non-positif tidak terdefinisi.');
      this.hasTranscendental = true;
      return args[0].ln();
    }

    if (fn === 'log10') {
      if (args.length !== 1) throw new Error('Fungsi log10() membutuhkan 1 argumen.');
      if (args[0].lte(0)) throw new Error('Log10 dari bilangan non-positif tidak terdefinisi.');
      this.hasTranscendental = true;
      return args[0].log(10);
    }

    if (fn === 'log2') {
      if (args.length !== 1) throw new Error('Fungsi log2() membutuhkan 1 argumen.');
      if (args[0].lte(0)) throw new Error('Log2 dari bilangan non-positif tidak terdefinisi.');
      this.hasTranscendental = true;
      return args[0].log(2);
    }

    if (fn === 'exp') {
      if (args.length !== 1) throw new Error('Fungsi exp() membutuhkan 1 argumen.');
      this.hasTranscendental = true;
      return args[0].exp();
    }

    if (fn === 'floor') {
      if (args.length !== 1) throw new Error('Fungsi floor() membutuhkan 1 argumen.');
      return args[0].floor();
    }

    if (fn === 'ceil') {
      if (args.length !== 1) throw new Error('Fungsi ceil() membutuhkan 1 argumen.');
      return args[0].ceil();
    }

    if (fn === 'round') {
      if (args.length !== 1) throw new Error('Fungsi round() membutuhkan 1 argumen.');
      return args[0].round();
    }

    if (fn === 'gcd') {
      if (args.length !== 2) throw new Error('Fungsi gcd() membutuhkan 2 argumen: gcd(a, b).');
      return new Decimal(MathEngine.gcd(BigInt(args[0].toFixed()), BigInt(args[1].toFixed())).toString());
    }

    if (fn === 'lcm') {
      if (args.length !== 2) throw new Error('Fungsi lcm() membutuhkan 2 argumen: lcm(a, b).');
      return new Decimal(MathEngine.lcm(BigInt(args[0].toFixed()), BigInt(args[1].toFixed())).toString());
    }

    throw new Error(`Fungsi matematika "${fn}" tidak dikenal.`);
  }
}

// Global Singleton Instance
export const globalMathEngine = new MathEngine();

// Export Function Contracts required by user instructions
export function hitung_ekspresi(expression: string): MathExecutionResult {
  return globalMathEngine.hitungEkspresi(expression);
}

export function analisis_angka(integer: number | string): NumberAnalysisResult {
  return globalMathEngine.analisisAngka(integer);
}
