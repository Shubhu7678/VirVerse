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
const R = 'Your function must call itself (no loops for the main work).';

export default [
  mk({
    slug: 'rec-factorial', title: 'Recursive Factorial', d: 'Easy',
    desc: 'A recursive function solves a problem by calling itself on a smaller one, with a base case to stop.\nDefine `long long fact(int n)`: fact(0) = 1, otherwise n * fact(n-1). ' + R + '\n\nInput: one integer `n`.\nOutput: n! on one line.',
    c: ['0 <= n <= 20'],
    fn: 'long long fact(int n) {\n    if (n <= 1) return 1;\n    return n * fact(n - 1);\n}\n',
    stub: 'long long fact(int n) {\n    // TODO: base case, then recursive case\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    printf("%lld\n", fact(n));
    return 0;
}
`,
    t: ['5', '10', '0', '1', '20'],
  }),
  mk({
    slug: 'rec-sum-to-n', title: 'Recursive Sum to N', d: 'Easy',
    desc: 'Define `int sumTo(int n)` returning 1 + 2 + ... + n recursively: sumTo(0) = 0, sumTo(n) = n + sumTo(n-1). ' + R + '\n\nInput: one integer `n`.\nOutput: the sum.',
    c: ['0 <= n <= 5000'],
    fn: 'int sumTo(int n) {\n    if (n == 0) return 0;\n    return n + sumTo(n - 1);\n}\n',
    stub: 'int sumTo(int n) {\n    // TODO\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", sumTo(n));
    return 0;
}
`,
    t: ['5', '100', '0', '1', '5000'],
  }),
  mk({
    slug: 'rec-fibonacci', title: 'Fibonacci Number', d: 'Easy',
    desc: 'The Fibonacci sequence starts 0, 1, 1, 2, 3, 5, ... where fib(0)=0, fib(1)=1, fib(n)=fib(n-1)+fib(n-2).\nDefine `int fib(int n)` recursively.\n\nInput: one integer `n`.\nOutput: fib(n).',
    c: ['0 <= n <= 25'],
    fn: 'int fib(int n) {\n    if (n < 2) return n;\n    return fib(n - 1) + fib(n - 2);\n}\n',
    stub: 'int fib(int n) {\n    // TODO: two base cases, two recursive calls\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", fib(n));
    return 0;
}
`,
    t: ['6', '10', '0', '1', '25'],
  }),
  mk({
    slug: 'rec-power', title: 'Recursive Power', d: 'Easy',
    desc: 'Define `long long power(int base, int exp)` where power(b, 0) = 1 and power(b, e) = b * power(b, e-1). ' + R + '\n\nInput: `base` and `exp` separated by a space.\nOutput: base raised to exp.',
    c: ['0 <= base <= 10', '0 <= exp <= 18'],
    fn: 'long long power(int base, int exp) {\n    if (exp == 0) return 1;\n    return base * power(base, exp - 1);\n}\n',
    stub: 'long long power(int base, int exp) {\n    // TODO\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int b, e;
    scanf("%d %d", &b, &e);
    printf("%lld\n", power(b, e));
    return 0;
}
`,
    t: ['2 10', '3 5', '7 0', '0 0', '10 18'],
  }),
  mk({
    slug: 'rec-sum-of-digits', title: 'Sum of Digits (Recursive)', d: 'Easy',
    desc: 'The last digit of n is `n % 10` and the rest is `n / 10`.\nDefine `int digitSum(int n)`: if n is 0 return 0, else last digit + digitSum(n / 10).\n\nInput: one non-negative integer `n`.\nOutput: the sum of its digits.',
    c: ['0 <= n <= 2000000000'],
    fn: 'int digitSum(int n) {\n    if (n == 0) return 0;\n    return n % 10 + digitSum(n / 10);\n}\n',
    stub: 'int digitSum(int n) {\n    // TODO\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", digitSum(n));
    return 0;
}
`,
    t: ['1234', '999', '0', '1000000000', '2000000000'],
  }),
  mk({
    slug: 'rec-count-digits', title: 'Count Digits (Recursive)', d: 'Easy',
    desc: 'Define `int countDigits(int n)` that counts the digits of a non-negative number recursively. Numbers below 10 have exactly 1 digit (including 0); otherwise it is 1 + countDigits(n / 10).\n\nInput: one integer `n`.\nOutput: its number of digits.',
    c: ['0 <= n <= 2000000000'],
    fn: 'int countDigits(int n) {\n    if (n < 10) return 1;\n    return 1 + countDigits(n / 10);\n}\n',
    stub: 'int countDigits(int n) {\n    // TODO\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", countDigits(n));
    return 0;
}
`,
    t: ['12345', '9', '0', '10', '2000000000'],
  }),
  mk({
    slug: 'rec-countdown', title: 'Countdown and Count Up', d: 'Easy',
    desc: 'Where you put a print relative to the recursive call changes the order!\nDefine `void countdown(int n)` which, for n >= 1, prints n on its own line, calls itself with n-1, and then prints n again on its own line after the call returns. For n = 0 it does nothing.\nHint: printing before the call gives the descending part, after the call the ascending part.\n\nInput: one integer `n`.\nOutput: for n=3 the lines 3 2 1 1 2 3 (one number per line).',
    c: ['1 <= n <= 100'],
    fn: 'void countdown(int n) {\n    if (n == 0) return;\n    printf("%d\\n", n);\n    countdown(n - 1);\n    printf("%d\\n", n);\n}\n',
    stub: 'void countdown(int n) {\n    // TODO: print n and a newline before and after the recursive call\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    countdown(n);
    return 0;
}
`,
    t: ['3', '1', '2', '5', '10'],
  }),
  mk({
    slug: 'rec-array-sum', title: 'Recursive Array Sum', d: 'Easy',
    desc: 'Define `int arraySum(int arr[], int n)` that returns the sum of the first `n` elements recursively: the sum of 0 elements is 0, otherwise arr[n-1] + arraySum(arr, n-1).\n\nInput: `n`, then `n` integers.\nOutput: their sum.',
    c: ['0 <= n <= 100', '-1000 <= each element <= 1000'],
    fn: 'int arraySum(int arr[], int n) {\n    if (n == 0) return 0;\n    return arr[n - 1] + arraySum(arr, n - 1);\n}\n',
    stub: 'int arraySum(int arr[], int n) {\n    // TODO\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    printf("%d\n", arraySum(a, n));
    return 0;
}
`,
    t: ['5\n1 2 3 4 5', '3\n-4 4 10', '0', '1\n-7', '4\n1000 1000 -1000 5'],
  }),
  mk({
    slug: 'rec-gcd', title: 'Recursive GCD', d: 'Easy',
    desc: 'Euclid\'s algorithm: gcd(a, 0) = a, otherwise gcd(a, b) = gcd(b, a % b).\nDefine `int gcd(int a, int b)` recursively.\n\nInput: two non-negative integers `a` and `b`, not both zero.\nOutput: their greatest common divisor.',
    c: ['0 <= a, b <= 1000000000', 'a and b are not both 0'],
    fn: 'int gcd(int a, int b) {\n    if (b == 0) return a;\n    return gcd(b, a % b);\n}\n',
    stub: 'int gcd(int a, int b) {\n    // TODO\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\n", gcd(a, b));
    return 0;
}
`,
    t: ['12 18', '17 5', '0 9', '1000000000 250000000', '7 7'],
  }),
  mk({
    slug: 'rec-string-length', title: 'Recursive String Length', d: 'Easy',
    desc: 'Without `strlen`, define `int length(const char *s)`: if `*s` is the terminator `\'\\0\'` return 0, otherwise 1 + length(s + 1).\n\nInput: one word without spaces.\nOutput: its length.',
    c: ['1 <= length <= 100'],
    fn: 'int length(const char *s) {\n    if (*s == \'\\0\') return 0;\n    return 1 + length(s + 1);\n}\n',
    stub: 'int length(const char *s) {\n    // TODO\n    return 0;\n}\n',
    main: String.raw`
int main() {
    char s[101];
    scanf("%100s", s);
    printf("%d\n", length(s));
    return 0;
}
`,
    t: ['hello', 'VirVerse', 'a', 'programming', 'abcdefghijklmnopqrstuvwxyz'],
  }),
  mk({
    slug: 'rec-reverse-number', title: 'Reverse a Number', d: 'Medium',
    desc: 'Define `long long reverseNum(long long n, long long acc)` that builds the reversed number: if n is 0 return acc, else reverseNum(n / 10, acc * 10 + n % 10). Call it with acc = 0. Trailing zeros of n become leading zeros and vanish (120 -> 21).\n\nInput: one non-negative integer `n`.\nOutput: the reversed number.',
    c: ['0 <= n <= 999999999999'],
    fn: 'long long reverseNum(long long n, long long acc) {\n    if (n == 0) return acc;\n    return reverseNum(n / 10, acc * 10 + n % 10);\n}\n',
    stub: 'long long reverseNum(long long n, long long acc) {\n    // TODO\n    return 0;\n}\n',
    main: String.raw`
int main() {
    long long n;
    scanf("%lld", &n);
    printf("%lld\n", reverseNum(n, 0));
    return 0;
}
`,
    t: ['12345', '120', '0', '7', '999999999999', '100000000000'],
  }),
  mk({
    slug: 'rec-palindrome-string', title: 'Palindrome Check', d: 'Medium',
    desc: 'A palindrome reads the same forwards and backwards. Define `int isPal(const char *s, int left, int right)`: if left >= right return 1; if s[left] != s[right] return 0; otherwise check the inside isPal(s, left+1, right-1).\n\nInput: one word without spaces (case-sensitive).\nOutput: `Yes` if it is a palindrome, otherwise `No`.',
    c: ['1 <= length <= 100'],
    fn: 'int isPal(const char *s, int left, int right) {\n    if (left >= right) return 1;\n    if (s[left] != s[right]) return 0;\n    return isPal(s, left + 1, right - 1);\n}\n',
    stub: 'int isPal(const char *s, int left, int right) {\n    // TODO\n    return 0;\n}\n',
    main: String.raw`
int main() {
    char s[101];
    int n = 0;
    scanf("%100s", s);
    while (s[n] != '\0') n++;
    printf(isPal(s, 0, n - 1) ? "Yes\n" : "No\n");
    return 0;
}
`,
    t: ['level', 'hello', 'a', 'abba', 'Aba', 'racecar'],
  }),
  mk({
    slug: 'rec-binary-conversion', title: 'Decimal to Binary', d: 'Medium',
    desc: 'Define `void toBinary(int n)` that prints the binary form of n with no newline: if n > 1, first call toBinary(n / 2); then print `n % 2`. The number 0 prints `0`.\n\nInput: one non-negative integer `n`.\nOutput: its binary representation (main prints the newline).',
    c: ['0 <= n <= 1000000000'],
    fn: 'void toBinary(int n) {\n    if (n > 1) toBinary(n / 2);\n    printf("%d", n % 2);\n}\n',
    stub: 'void toBinary(int n) {\n    // TODO: recurse on n / 2 first, then print the bit\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    toBinary(n);
    printf("\n");
    return 0;
}
`,
    t: ['10', '5', '0', '1', '1000000000', '255'],
  }),
  mk({
    slug: 'rec-hanoi-count', title: 'Tower of Hanoi Move Count', d: 'Medium',
    desc: 'To move n disks you move n-1 disks aside, move the biggest one, then move n-1 disks back: moves(n) = 2 * moves(n-1) + 1, moves(0) = 0.\nDefine `long long hanoiMoves(int n)` recursively.\n\nInput: one integer `n` (number of disks).\nOutput: the minimum number of moves.',
    c: ['0 <= n <= 40'],
    fn: 'long long hanoiMoves(int n) {\n    if (n == 0) return 0;\n    return 2 * hanoiMoves(n - 1) + 1;\n}\n',
    stub: 'long long hanoiMoves(int n) {\n    // TODO\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    printf("%lld\n", hanoiMoves(n));
    return 0;
}
`,
    t: ['3', '1', '0', '10', '40'],
  }),
  mk({
    slug: 'rec-array-max', title: 'Maximum of an Array (Recursive)', d: 'Medium',
    desc: 'Define `int maxOf(int arr[], int n)`: with 1 element it is that element; otherwise it is the larger of arr[n-1] and maxOf(arr, n-1).\n\nInput: `n`, then `n` integers.\nOutput: the maximum value.',
    c: ['1 <= n <= 100', '-100000 <= each element <= 100000'],
    fn: 'int maxOf(int arr[], int n) {\n    if (n == 1) return arr[0];\n    int rest = maxOf(arr, n - 1);\n    return arr[n - 1] > rest ? arr[n - 1] : rest;\n}\n',
    stub: 'int maxOf(int arr[], int n) {\n    // TODO\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    printf("%d\n", maxOf(a, n));
    return 0;
}
`,
    t: ['5\n3 9 2 7 1', '3\n-5 -2 -9', '1\n42', '4\n8 8 8 8', '6\n100000 -100000 0 5 99999 1'],
  }),
  mk({
    slug: 'rec-binary-search', title: 'Recursive Binary Search', d: 'Medium',
    desc: 'Define `int search(int arr[], int lo, int hi, int target)` over a sorted ascending array: if lo > hi return -1; look at mid = (lo + hi) / 2; return mid if equal, otherwise search the left or right half recursively. Return the index of the target (all values are distinct).\n\nInput: `n`, then `n` sorted distinct integers, then the `target`.\nOutput: the 0-based index of the target, or -1 if absent.',
    c: ['1 <= n <= 100', 'Elements are distinct and sorted ascending'],
    fn: 'int search(int arr[], int lo, int hi, int target) {\n    if (lo > hi) return -1;\n    int mid = (lo + hi) / 2;\n    if (arr[mid] == target) return mid;\n    if (arr[mid] < target) return search(arr, mid + 1, hi, target);\n    return search(arr, lo, mid - 1, target);\n}\n',
    stub: 'int search(int arr[], int lo, int hi, int target) {\n    // TODO\n    return -1;\n}\n',
    main: String.raw`
int main() {
    int n, t, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    scanf("%d", &t);
    printf("%d\n", search(a, 0, n - 1, t));
    return 0;
}
`,
    t: ['5\n1 3 5 7 9\n7', '5\n1 3 5 7 9\n4', '1\n5\n5', '4\n-10 -3 0 8\n-10', '4\n-10 -3 0 8\n8', '3\n2 4 6\n100'],
  }),
  mk({
    slug: 'rec-reverse-string', title: 'Reverse a String', d: 'Medium',
    desc: 'Define `void rev(const char *s)` that prints the characters of s in reverse with no newline: if `*s` is the terminator do nothing; otherwise call rev(s + 1) first, then print `*s`.\n\nInput: one word without spaces.\nOutput: the word reversed.',
    c: ['1 <= length <= 100'],
    fn: 'void rev(const char *s) {\n    if (*s == \'\\0\') return;\n    rev(s + 1);\n    printf("%c", *s);\n}\n',
    stub: 'void rev(const char *s) {\n    // TODO: recurse first, then print\n}\n',
    main: String.raw`
int main() {
    char s[101];
    scanf("%100s", s);
    rev(s);
    printf("\n");
    return 0;
}
`,
    t: ['hello', 'VirVerse', 'a', 'abc123', 'Level'],
  }),
  mk({
    slug: 'rec-hanoi-moves', title: 'Tower of Hanoi Moves', d: 'Hard',
    desc: 'Print every move needed to solve Tower of Hanoi. Define `void hanoi(int n, char from, char to, char via)`: if n == 0 return; hanoi(n-1, from, via, to); print the move of disk n; hanoi(n-1, via, to, from).\nEach move line has the form `Move disk D from X to Y`.\n\nInput: one integer `n`; the disks start on peg `A`, must end on peg `C`, and `B` is the spare.\nOutput: one move per line in order.',
    c: ['1 <= n <= 6'],
    fn: 'void hanoi(int n, char from, char to, char via) {\n    if (n == 0) return;\n    hanoi(n - 1, from, via, to);\n    printf("Move disk %d from %c to %c\\n", n, from, to);\n    hanoi(n - 1, via, to, from);\n}\n',
    stub: 'void hanoi(int n, char from, char to, char via) {\n    // TODO\n}\n',
    main: String.raw`
int main() {
    int n;
    scanf("%d", &n);
    hanoi(n, 'A', 'C', 'B');
    return 0;
}
`,
    t: ['1', '2', '3', '4', '6'],
  }),
  mk({
    slug: 'rec-permutations', title: 'Permutations of a String', d: 'Hard',
    desc: 'Print all arrangements of the letters of a word. The letters are distinct and given in increasing alphabetical order. Build each permutation position by position: for every letter not yet used, mark it used, place it, recurse to the next position, then unmark it (backtracking). Trying letters in order produces permutations in alphabetical order.\nSuggested: `void permute(const char *s, int n, int pos, char *cur, int *used)`.\n\nInput: one word of distinct lowercase letters in sorted order.\nOutput: every permutation, one per line, in alphabetical order.',
    c: ['1 <= length <= 5', 'Letters are distinct, lowercase, sorted'],
    fn: 'void permute(const char *s, int n, int pos, char *cur, int *used) {\n    if (pos == n) { cur[n] = \'\\0\'; printf("%s\\n", cur); return; }\n    for (int i = 0; i < n; i++) {\n        if (used[i]) continue;\n        used[i] = 1;\n        cur[pos] = s[i];\n        permute(s, n, pos + 1, cur, used);\n        used[i] = 0;\n    }\n}\n',
    stub: 'void permute(const char *s, int n, int pos, char *cur, int *used) {\n    // TODO: backtracking\n}\n',
    main: String.raw`
int main() {
    char s[10], cur[10];
    int used[10] = {0}, n = 0;
    scanf("%9s", s);
    while (s[n] != '\0') n++;
    permute(s, n, 0, cur, used);
    return 0;
}
`,
    t: ['abc', 'ab', 'a', 'abcd', 'acemz'],
  }),
  mk({
    slug: 'rec-subset-sum-count', title: 'Count Subsets with Given Sum', d: 'Hard',
    desc: 'Given `n` numbers, count the subsets (including the empty one, which has sum 0) whose elements add up to `target`. For each element you either include it or skip it. Define `int count(int arr[], int n, int idx, int remaining)`: at idx == n return 1 if remaining is 0 else 0; otherwise add count(include) and count(skip). Subsets are chosen by position, so equal values at different positions count separately.\n\nInput: `n`, then `n` integers, then the `target`.\nOutput: the number of subsets.',
    c: ['0 <= n <= 15', '-100 <= each element <= 100', '-1000 <= target <= 1000'],
    fn: 'int count(int arr[], int n, int idx, int remaining) {\n    if (idx == n) return remaining == 0;\n    return count(arr, n, idx + 1, remaining - arr[idx]) + count(arr, n, idx + 1, remaining);\n}\n',
    stub: 'int count(int arr[], int n, int idx, int remaining) {\n    // TODO: include or skip arr[idx]\n    return 0;\n}\n',
    main: String.raw`
int main() {
    int n, t, a[15];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    scanf("%d", &t);
    printf("%d\n", count(a, n, 0, t));
    return 0;
}
`,
    t: ['4\n1 2 3 4\n5', '3\n2 2 2\n4', '0\n0', '3\n1 -1 0\n0', '15\n1 2 3 4 5 6 7 8 9 10 11 12 13 14 15\n30'],
  }),
];
