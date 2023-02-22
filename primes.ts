const MILLER_RABIN_K = 4;

// Polynomial time complexity, large constant, non-probabilistic
// used very rarely
// O(log(n)^12)
// https://en.wikipedia.org/wiki/AKS_primality_test
function isPrimeAKS(n: number): boolean {
  if (n <= 1) {
    return false;
  }
  // Find the smallest r such that ord_r(n) > log2(n)^2
  const log2n = Math.ceil(Math.log2(n));
  let r = 2;
  while (r < n) {
    const gcd = greatestCommonDivisor(r, n);
    if (gcd !== 1) {
      // If r and n are not coprime, n is composite
      return false;
    }
    // Compute the order of r modulo n
    const ord = multiplicativeOrder(r, n);
    if (ord > log2n ** 2) {
      break;
    }
    r++;
  }
  // Check if n is a perfect power
  for (let a = 2; a <= log2n; a++) {
    const b = Math.floor(Math.exp(Math.log(n) / a));
    if (b ** a === n) {
      return false;
    }
  }
  // Check if n is prime using the algorithm's final condition
  const f = (x: number) => powMod(x, n - 1, n) - 1;
  for (let a = 1; a <= Math.sqrt(r) * log2n; a++) {
    const b = f(a);
    if (b !== 0 && b % n === 0) {
      return false;
    }
  }
  return true;
}

function greatestCommonDivisor(a: number, b: number): number {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

function powMod(base: number, exp: number, mod: number): number {
  let result = 1;
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod;
    }
    base = (base * base) % mod;
    exp = Math.floor(exp / 2);
  }
  return result;
}

function multiplicativeOrder(a: number, n: number): number {
  let ord = 1;
  let result = a % n;
  while (result !== 1) {
    result = (result * a) % n;
    ord++;
  }
  return ord;
}

// Probabilistic primality test, good solution for big numbers, fast
// O(k log(n)^3)
// https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test
function isPrimeMR(n: bigint, k: number): boolean {
  if (n === 2n || n === 3n) {
    return true;
  }

  if (n < 2n || n % 2n === 0n) {
    return false;
  }

  let d: bigint = n - 1n;
  while (d % 2n == 0n) {
    d /= 2n;
  }

  for (let i = 0; i < k; i++) {
    if (!millerRabinTest(n, d)) {
      return false;
    }
  }

  return true;
}

function power(x: bigint, y: bigint, p: bigint): bigint {
  let res: bigint = 1n;
  x = x % p;

  while (y > 0n) {
    if (y & 1n) {
      res = (res * x) % p;
    }

    y = y >> 1n;
    x = (x * x) % p;
  }

  return res;
}

function millerRabinTest(n: bigint, d: bigint): boolean {
  const a: bigint = 2n + BigInt(Math.floor(Math.random() * Number(n - 4n)));
  let x: bigint = power(a, d, n);

  if (x === 1n || x === n - 1n) {
    return true;
  }

  while (d != n - 1n) {
    x = (x * x) % n;
    d *= 2n;

    if (x === 1n) {
      return false;
    }

    if (x === n - 1n) {
      return true;
    }
  }

  return false;
}

function isPrime(n: number): boolean {
  const isPropablyPrime = isPrimeMR(BigInt(n), MILLER_RABIN_K);

  if (isPropablyPrime) {
    return isPrimeAKS(n);
  }

  return false;
}

const task = (A: number[], B: number[]): number[] => {
  const count = new Map<number, number>();
  const primes = new Map<number, boolean>();

  for (const x of B) {
    count.set(x, (count.get(x) || 0) + 1);
  }

  const C: number[] = [];

  for (const x of A) {
    if (!count.has(x)) {
      C.push(x);
    } else {
      const counter: number = count.get(x)!;

      if (primes.has(counter)) {
        if (!primes.get(counter)) {
          C.push(x);
        }
      } else {
        const check = isPrime(counter);

        primes.set(counter, check);

        if (!check) {
          C.push(x);
        }
      }
    }
  }

  return C;
};

const A = [2, 3, 9, 2, 5, 1, 3, 7, 10];

const B = [2, 1, 3, 4, 3, 10, 6, 6, 1, 7, 10, 10, 10];

const C = [2, 9, 2, 5, 7, 10];

console.log(task(A, B));
