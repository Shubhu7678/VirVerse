const INC = '#include <stdio.h>\n';
const mk = (o) => ({
  slug: o.slug,
  title: o.title,
  difficulty: o.d,
  description: o.desc,
  constraints: o.c,
  solution: INC + o.fn + o.main,
  starterCode: INC + o.stub + o.main,
  tests: o.t.map((input, i) => (i < 2 ? { input } : { input, hidden: true })),
});

export default [
  mk({
    slug: 'fn-square', title: 'Square of a Number', d: 'Easy',
    desc: 'A function packs a small job under a name so you can reuse it.\nDefine `int square(int n)` that returns `n * n`, and call it from `main`.\n\nInput: one integer `n`.\nOutput: the square of `n` on one line.',
    c: ['-1000 <= n <= 1000'],
    fn: 'int square(int n) { return n * n; }\n',
    stub: 'int square(int n) {\n    // TODO: return the square of n\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", square(n));
    return 0;
}
`,
    t: ['5', '-3', '0', '1000', '-1000'],
  }),
  mk({
    slug: 'fn-max-of-two', title: 'Larger of Two Numbers', d: 'Easy',
    desc: 'Define `int maxOf(int a, int b)` that returns the larger of its two parameters.\n\nInput: two integers `a` and `b` separated by a space.\nOutput: the larger value on one line.',
    c: ['-100000 <= a, b <= 100000'],
    fn: 'int maxOf(int a, int b) { return a > b ? a : b; }\n',
    stub: 'int maxOf(int a, int b) {\n    // TODO: return the larger value\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\n", maxOf(a, b));
    return 0;
}
`,
    t: ['3 9', '10 -2', '7 7', '-5 -8', '-100000 100000'],
  }),
  mk({
    slug: 'fn-print-stars', title: 'Print a Row of Stars', d: 'Easy',
    desc: 'A `void` function does work but returns nothing.\nDefine `void printStars(int n)` that prints `n` asterisks followed by a newline.\n\nInput: one integer `n`.\nOutput: a single line with `n` stars.',
    c: ['1 <= n <= 50'],
    fn: 'void printStars(int n) {\n    for (int i = 0; i < n; i++) printf("*");\n    printf("\\n");\n}\n',
    stub: 'void printStars(int n) {\n    // TODO: print n stars and a newline\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    printStars(n);
    return 0;
}
`,
    t: ['5', '1', '2', '50', '12'],
  }),
  mk({
    slug: 'fn-is-even', title: 'Even or Odd Function', d: 'Easy',
    desc: 'Define `int isEven(int n)` that returns 1 if `n` is even and 0 otherwise. Remember negative numbers: use `n % 2 == 0`.\n\nInput: one integer `n`.\nOutput: `Even` if isEven returns 1, otherwise `Odd`.',
    c: ['-1000000 <= n <= 1000000'],
    fn: 'int isEven(int n) { return n % 2 == 0; }\n',
    stub: 'int isEven(int n) {\n    // TODO: return 1 for even, 0 for odd\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    if (isEven(n)) printf("Even\n");
    else printf("Odd\n");
    return 0;
}
`,
    t: ['4', '7', '0', '-3', '-1000000'],
  }),
  mk({
    slug: 'fn-sum-to-n', title: 'Sum from 1 to N', d: 'Easy',
    desc: 'Define `long long sumTo(int n)` that returns 1 + 2 + ... + n using a loop. For `n = 0` the sum is 0.\n\nInput: one integer `n`.\nOutput: the sum on one line.',
    c: ['0 <= n <= 100000'],
    fn: 'long long sumTo(int n) {\n    long long s = 0;\n    for (int i = 1; i <= n; i++) s += i;\n    return s;\n}\n',
    stub: 'long long sumTo(int n) {\n    // TODO: add up 1..n\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    printf("%lld\n", sumTo(n));
    return 0;
}
`,
    t: ['10', '1', '0', '100000', '57'],
  }),
  mk({
    slug: 'fn-factorial', title: 'Factorial Function', d: 'Easy',
    desc: 'The factorial of n is 1 * 2 * ... * n, and 0! = 1.\nDefine `long long factorial(int n)` using a loop.\n\nInput: one integer `n`.\nOutput: n! on one line.',
    c: ['0 <= n <= 20'],
    fn: 'long long factorial(int n) {\n    long long r = 1;\n    for (int i = 2; i <= n; i++) r *= i;\n    return r;\n}\n',
    stub: 'long long factorial(int n) {\n    // TODO: multiply 1..n\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    printf("%lld\n", factorial(n));
    return 0;
}
`,
    t: ['5', '10', '0', '1', '20'],
  }),
  mk({
    slug: 'fn-array-sum', title: 'Sum of an Array', d: 'Easy',
    desc: 'Arrays are passed to functions together with their size.\nDefine `int arraySum(int arr[], int n)` returning the sum of the first `n` elements.\n\nInput: first `n`, then `n` integers.\nOutput: their sum on one line.',
    c: ['1 <= n <= 100', '-1000 <= each element <= 1000'],
    fn: 'int arraySum(int arr[], int n) {\n    int s = 0;\n    for (int i = 0; i < n; i++) s += arr[i];\n    return s;\n}\n',
    stub: 'int arraySum(int arr[], int n) {\n    // TODO: add up the elements\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    printf("%d\n", arraySum(a, n));
    return 0;
}
`,
    t: ['5\n1 2 3 4 5', '3\n-1 -2 -3', '1\n0', '2\n1000 -1000', '4\n10 20 30 40'],
  }),
  mk({
    slug: 'fn-absolute-value', title: 'Absolute Value', d: 'Easy',
    desc: 'Define `int absolute(int n)` that returns `n` if it is non-negative, otherwise `-n`. Do not use the library `abs`.\n\nInput: one integer `n`.\nOutput: the absolute value.',
    c: ['-1000000 <= n <= 1000000'],
    fn: 'int absolute(int n) { return n < 0 ? -n : n; }\n',
    stub: 'int absolute(int n) {\n    // TODO\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", absolute(n));
    return 0;
}
`,
    t: ['-7', '12', '0', '-1000000', '1000000'],
  }),
  mk({
    slug: 'fn-count-digits', title: 'Count the Digits', d: 'Easy',
    desc: 'Define `int countDigits(int n)` that returns how many digits the non-negative number `n` has. The number 0 has 1 digit.\nHint: keep dividing by 10.\n\nInput: one integer `n`.\nOutput: the digit count.',
    c: ['0 <= n <= 2000000000'],
    fn: 'int countDigits(int n) {\n    int c = 1;\n    while (n >= 10) { n /= 10; c++; }\n    return c;\n}\n',
    stub: 'int countDigits(int n) {\n    // TODO: count digits (0 has one digit)\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", countDigits(n));
    return 0;
}
`,
    t: ['12345', '7', '0', '10', '2000000000'],
  }),
  mk({
    slug: 'fn-is-prime', title: 'Prime Checker', d: 'Easy',
    desc: 'A prime is a number greater than 1 with no divisors other than 1 and itself.\nDefine `int isPrime(int n)` returning 1 for prime, else 0.\n\nInput: one integer `n`.\nOutput: `Prime` or `Not Prime`.',
    c: ['-100 <= n <= 1000000'],
    fn: 'int isPrime(int n) {\n    if (n < 2) return 0;\n    for (int i = 2; (long long)i * i <= n; i++)\n        if (n % i == 0) return 0;\n    return 1;\n}\n',
    stub: 'int isPrime(int n) {\n    // TODO: return 1 if n is prime, else 0\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    printf(isPrime(n) ? "Prime\n" : "Not Prime\n");
    return 0;
}
`,
    t: ['7', '12', '1', '2', '-5', '999983', '1000000'],
  }),
  mk({
    slug: 'fn-gcd-lcm', title: 'GCD and LCM', d: 'Medium',
    desc: 'Define `int gcd(int a, int b)` (Euclid: repeat `a, b = b, a % b` until b is 0) and `long long lcm(int a, int b)` which uses gcd (lcm = a / gcd * b).\n\nInput: two positive integers `a` and `b`.\nOutput: gcd and lcm separated by a single space.',
    c: ['1 <= a, b <= 1000000'],
    fn: 'int gcd(int a, int b) {\n    while (b != 0) { int t = a % b; a = b; b = t; }\n    return a;\n}\nlong long lcm(int a, int b) { return (long long)a / gcd(a, b) * b; }\n',
    stub: 'int gcd(int a, int b) {\n    // TODO\n    return 0;\n}\nlong long lcm(int a, int b) {\n    // TODO: use gcd\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d %lld\n", gcd(a, b), lcm(a, b));
    return 0;
}
`,
    t: ['12 18', '7 13', '1 1', '1000000 999999', '100 100'],
  }),
  mk({
    slug: 'fn-power-loop', title: 'Power Function', d: 'Medium',
    desc: 'Define `long long power(int base, int exp)` that returns base raised to exp using a loop (no `pow`). Anything to the power 0 is 1.\n\nInput: `base` and `exp` separated by a space.\nOutput: the result.',
    c: ['0 <= base <= 10', '0 <= exp <= 18', 'The result fits in long long'],
    fn: 'long long power(int base, int exp) {\n    long long r = 1;\n    for (int i = 0; i < exp; i++) r *= base;\n    return r;\n}\n',
    stub: 'long long power(int base, int exp) {\n    // TODO\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int b, e;
    scanf("%d %d", &b, &e);
    printf("%lld\n", power(b, e));
    return 0;
}
`,
    t: ['2 10', '3 4', '5 0', '0 0', '0 5', '10 18'],
  }),
  mk({
    slug: 'fn-static-counter', title: 'Static Call Counter', d: 'Medium',
    desc: 'A `static` local variable keeps its value between calls.\nDefine `int nextId(void)` that holds `static int id = 0;`, increments it, and returns it. Call it `n` times.\n\nInput: one integer `n`.\nOutput: the returned values, one per line (1 to n).',
    c: ['1 <= n <= 50'],
    fn: 'int nextId(void) {\n    static int id = 0;\n    id++;\n    return id;\n}\n',
    stub: 'int nextId(void) {\n    // TODO: use a static variable\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) printf("%d\n", nextId());
    return 0;
}
`,
    t: ['3', '1', '2', '10', '50'],
  }),
  mk({
    slug: 'fn-reverse-array', title: 'Reverse an Array in Place', d: 'Medium',
    desc: 'Arrays passed to functions are shared with the caller, so changes persist.\nDefine `void reverseArray(int arr[], int n)` that reverses the array in place by swapping ends.\n\nInput: `n`, then `n` integers.\nOutput: the reversed array on one line, separated by single spaces.',
    c: ['1 <= n <= 100', '-1000 <= each element <= 1000'],
    fn: 'void reverseArray(int arr[], int n) {\n    for (int i = 0, j = n - 1; i < j; i++, j--) {\n        int t = arr[i]; arr[i] = arr[j]; arr[j] = t;\n    }\n}\n',
    stub: 'void reverseArray(int arr[], int n) {\n    // TODO: swap elements from both ends\n}\n',
    main: String.raw`
int main() {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    reverseArray(a, n);
    for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
    printf("\n");
    return 0;
}
`,
    t: ['5\n1 2 3 4 5', '4\n10 20 30 40', '1\n9', '2\n-1 1', '6\n0 0 1 1 2 2'],
  }),
  mk({
    slug: 'fn-compose', title: 'Function Composition', d: 'Medium',
    desc: 'Define `long long f(long long x)` returning `2*x + 1`, and `long long g(long long x)` returning `x*x`. Then compute the compositions g(f(x)) and f(g(x)) by calling one function with the result of the other.\n\nInput: one integer `x`.\nOutput: g(f(x)) and f(g(x)) separated by a single space.',
    c: ['-10000 <= x <= 10000'],
    fn: 'long long f(long long x) { return 2 * x + 1; }\nlong long g(long long x) { return x * x; }\n',
    stub: 'long long f(long long x) {\n    // TODO: 2*x + 1\n    return 0;\n}\nlong long g(long long x) {\n    // TODO: x*x\n    return 0;\n}\n',
    main: String.raw`
int main() {
    long long x;
    scanf("%lld", &x);
    printf("%lld %lld\n", g(f(x)), f(g(x)));
    return 0;
}
`,
    t: ['3', '-2', '0', '10000', '-10000'],
  }),
  mk({
    slug: 'fn-primes-in-range', title: 'Primes in a Range', d: 'Medium',
    desc: 'Write a helper `int isPrime(int n)` and a function `int countPrimes(int a, int b)` that uses it to count primes in the inclusive range [a, b].\n\nInput: two integers `a` and `b` with a <= b.\nOutput: the number of primes, then a space, then the sum of those primes.',
    c: ['0 <= a <= b <= 100000'],
    fn: 'int isPrime(int n) {\n    if (n < 2) return 0;\n    for (int i = 2; i * i <= n; i++) if (n % i == 0) return 0;\n    return 1;\n}\nint countPrimes(int a, int b) {\n    int c = 0;\n    for (int i = a; i <= b; i++) c += isPrime(i);\n    return c;\n}\n',
    stub: 'int isPrime(int n) {\n    // TODO\n    return 0;\n}\nint countPrimes(int a, int b) {\n    // TODO: use isPrime\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    long long sum = 0;
    for (int i = a; i <= b; i++) if (isPrime(i)) sum += i;
    printf("%d %lld\n", countPrimes(a, b), sum);
    return 0;
}
`,
    t: ['1 10', '10 20', '0 1', '14 16', '1 100000'],
  }),
  mk({
    slug: 'fn-perfect-numbers', title: 'Perfect Numbers up to N', d: 'Medium',
    desc: 'A perfect number equals the sum of its proper divisors (6 = 1+2+3). Define `int isPerfect(int n)` returning 1 or 0, and use it to find all perfect numbers from 1 to `n`.\n\nInput: one integer `n`.\nOutput: each perfect number on its own line in increasing order, or `None` if there is none.',
    c: ['1 <= n <= 10000'],
    fn: 'int isPerfect(int n) {\n    int s = 0;\n    for (int i = 1; i < n; i++) if (n % i == 0) s += i;\n    return n > 1 && s == n;\n}\n',
    stub: 'int isPerfect(int n) {\n    // TODO: sum proper divisors and compare\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n, found = 0;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++)
        if (isPerfect(i)) { printf("%d\n", i); found = 1; }
    if (!found) printf("None\n");
    return 0;
}
`,
    t: ['30', '10000', '5', '1', '6', '500'],
  }),
  mk({
    slug: 'fn-merge-sorted', title: 'Merge Two Sorted Arrays', d: 'Hard',
    desc: 'Define `void mergeSorted(int a[], int n, int b[], int m, int out[])` that merges two ascending arrays into `out` (length n+m), still ascending. Walk both arrays with two indices, always copying the smaller current element; then copy leftovers. Duplicates are kept.\n\nInput: `n` then `n` integers, then `m` then `m` integers (each array already sorted ascending).\nOutput: the merged array on one line separated by single spaces.',
    c: ['1 <= n, m <= 50', '-1000 <= each element <= 1000'],
    fn: 'void mergeSorted(int a[], int n, int b[], int m, int out[]) {\n    int i = 0, j = 0, k = 0;\n    while (i < n && j < m) out[k++] = a[i] <= b[j] ? a[i++] : b[j++];\n    while (i < n) out[k++] = a[i++];\n    while (j < m) out[k++] = b[j++];\n}\n',
    stub: 'void mergeSorted(int a[], int n, int b[], int m, int out[]) {\n    // TODO: merge using two indices\n}\n',
    main: String.raw`
int main() {
    int n, m, a[50], b[50], out[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    scanf("%d", &m);
    for (int i = 0; i < m; i++) scanf("%d", &b[i]);
    mergeSorted(a, n, b, m, out);
    for (int i = 0; i < n + m; i++) printf(i ? " %d" : "%d", out[i]);
    printf("\n");
    return 0;
}
`,
    t: ['3\n1 3 5\n3\n2 4 6', '2\n1 2\n3\n3 4 5', '1\n5\n1\n5', '3\n-5 0 5\n2\n-10 10', '4\n1 1 1 1\n2\n1 2'],
  }),
  mk({
    slug: 'fn-mod-power', title: 'Fast Modular Power', d: 'Hard',
    desc: 'Computing base^exp directly overflows, and a plain loop is too slow for huge exponents. Define `long long powMod(long long base, long long exp, long long mod)` using repeated squaring: while exp > 0, if exp is odd multiply result by base (mod), then square base (mod) and halve exp. Always reduce with `% mod`.\n\nInput: `base`, `exp`, `mod` separated by spaces.\nOutput: (base^exp) % mod.',
    c: ['0 <= base <= 1000000000', '0 <= exp <= 1000000000000', '1 <= mod <= 1000000000'],
    fn: 'long long powMod(long long base, long long exp, long long mod) {\n    long long r = 1 % mod;\n    base %= mod;\n    while (exp > 0) {\n        if (exp & 1) r = r * base % mod;\n        base = base * base % mod;\n        exp >>= 1;\n    }\n    return r;\n}\n',
    stub: 'long long powMod(long long base, long long exp, long long mod) {\n    // TODO: repeated squaring\n    return 0;\n}\n',
    main: String.raw`
int main() {
    long long b, e, m;
    scanf("%lld %lld %lld", &b, &e, &m);
    printf("%lld\n", powMod(b, e, m));
    return 0;
}
`,
    t: ['2 10 1000', '3 200 13', '5 0 7', '7 5 1', '123456789 1000000000000 999999937', '0 0 1000000000'],
  }),
  mk({
    slug: 'fn-matrix-multiply', title: 'Matrix Multiplication Function', d: 'Hard',
    desc: 'Define `void multiply(int n, int a[][5], int b[][5], int c[][5])` that stores the product of two n x n matrices in `c`: c[i][j] = sum over k of a[i][k] * b[k][j]. A 2D array parameter must state its column count.\n\nInput: `n`, then matrix A (n rows of n integers), then matrix B.\nOutput: matrix C, one row per line, values separated by single spaces.',
    c: ['1 <= n <= 5', '-100 <= each element <= 100'],
    fn: 'void multiply(int n, int a[][5], int b[][5], int c[][5]) {\n    for (int i = 0; i < n; i++)\n        for (int j = 0; j < n; j++) {\n            c[i][j] = 0;\n            for (int k = 0; k < n; k++) c[i][j] += a[i][k] * b[k][j];\n        }\n}\n',
    stub: 'void multiply(int n, int a[][5], int b[][5], int c[][5]) {\n    // TODO: triple loop\n}\n',
    main: String.raw`
int main() {
    int n, a[5][5], b[5][5], c[5][5];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) scanf("%d", &a[i][j]);
    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) scanf("%d", &b[i][j]);
    multiply(n, a, b, c);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) printf(j ? " %d" : "%d", c[i][j]);
        printf("\n");
    }
    return 0;
}
`,
    t: ['2\n1 2\n3 4\n5 6\n7 8', '2\n1 0\n0 1\n9 8\n7 6', '1\n7\n-3', '3\n1 2 3\n4 5 6\n7 8 9\n0 0 1\n0 1 0\n1 0 0', '2\n-1 -2\n3 4\n0 0\n0 0'],
  }),
];
