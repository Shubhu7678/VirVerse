const q = (slug, title, difficulty, description, constraints, solution, tests, starterCode) => ({
  slug, title, difficulty, description, constraints, solution, tests, ...(starterCode ? { starterCode } : {}),
});
const H = (input) => ({ input, hidden: true });
const T = (input) => ({ input });

export default [
  q('ptr-swap-two-numbers', 'Swap Two Numbers Using Pointers', 'Easy',
    'A pointer stores the address of a variable. `*p` reads or changes the variable it points to.\nWrite a function `void swap(int *a, int *b)` that swaps two integers, call it with `&x` and `&y`, then print the result.\n\nInput\nOne line with two integers `a` and `b`.\n\nOutput\nPrint the swapped values `b a` on one line separated by a single space.',
    ['-1000 <= a, b <= 1000'],
    String.raw`#include <stdio.h>
void swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }
int main(void) { int a, b; scanf("%d %d", &a, &b); swap(&a, &b); printf("%d %d\n", a, b); return 0; }`,
    [T('3 5'), T('-1 7'), T('10 10'), H('0 0'), H('1000 -1000')],
    '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    // swap the values the pointers point to\n}\n\nint main(void) {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    swap(&a, &b);\n    printf("%d %d\\n", a, b);\n    return 0;\n}\n'),

  q('ptr-double-value', 'Double a Value Through a Pointer', 'Easy',
    'Create an `int *p` that points to a variable `n`, then double `n` using only `*p`.\n\nInput\nOne integer `n`.\n\nOutput\nPrint the doubled value of `n`.',
    ['-100000 <= n <= 100000'],
    String.raw`#include <stdio.h>
int main(void) { int n; int *p = &n; scanf("%d", &n); *p = *p * 2; printf("%d\n", n); return 0; }`,
    [T('4'), T('-9'), T('0'), H('100000'), H('-100000')]),

  q('ptr-larger-of-two', 'Pointer to the Larger Number', 'Easy',
    'Write `int *larger(int *a, int *b)` that returns a pointer to the larger of two variables. Use the returned pointer to add 100 to that larger variable, then print both variables. If equal, return `a`.\n\nInput\nOne line with two integers `a` and `b`.\n\nOutput\nPrint `a` and `b` (after the change) separated by a space.',
    ['-1000 <= a, b <= 1000'],
    String.raw`#include <stdio.h>
int *larger(int *a, int *b) { return (*b > *a) ? b : a; }
int main(void) { int a, b; scanf("%d %d", &a, &b); int *p = larger(&a, &b); *p += 100; printf("%d %d\n", a, b); return 0; }`,
    [T('3 8'), T('9 2'), T('5 5'), H('-7 -3'), H('-1000 1000')]),

  q('ptr-array-sum', 'Sum of Array Using Pointer Arithmetic', 'Easy',
    'An array name acts like a pointer to its first element, and `p + i` points to element `i`. Compute the sum of an array by moving a pointer instead of using `a[i]`.\n\nInput\nFirst line: `n`. Second line: `n` integers.\n\nOutput\nPrint the sum.',
    ['1 <= n <= 50', '-1000 <= element <= 1000'],
    String.raw`#include <stdio.h>
int main(void) { int a[50], n, s = 0; scanf("%d", &n); for (int i = 0; i < n; i++) scanf("%d", &a[i]);
 for (int *p = a; p < a + n; p++) s += *p; printf("%d\n", s); return 0; }`,
    [T('5\n1 2 3 4 5'), T('3\n-4 10 -2'), T('1\n7'), H('4\n-1000 -1000 -1000 -1000'), H('2\n0 0')]),

  q('ptr-reverse-array', 'Reverse an Array with Two Pointers', 'Easy',
    'Use one pointer at the start and one at the end of the array. Swap the values they point to and move them toward each other until they meet.\n\nInput\nFirst line: `n`. Second line: `n` integers.\n\nOutput\nPrint the reversed array on one line, separated by single spaces.',
    ['1 <= n <= 50', '-1000 <= element <= 1000'],
    String.raw`#include <stdio.h>
int main(void) { int a[50], n; scanf("%d", &n); for (int i = 0; i < n; i++) scanf("%d", &a[i]);
 int *l = a, *r = a + n - 1; while (l < r) { int t = *l; *l = *r; *r = t; l++; r--; }
 for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]); printf("\n"); return 0; }`,
    [T('5\n1 2 3 4 5'), T('4\n10 20 30 40'), T('1\n9'), H('2\n-5 5'), H('6\n0 0 1 1 2 2')]),

  q('ptr-min-max-out-params', 'Find Min and Max Using Pointer Parameters', 'Easy',
    'A function can return several values by receiving pointers. Write `void minmax(int a[], int n, int *mn, int *mx)` and print both results.\n\nInput\nFirst line: `n`. Second line: `n` integers.\n\nOutput\nPrint `min max` separated by a space.',
    ['1 <= n <= 50', '-1000 <= element <= 1000'],
    String.raw`#include <stdio.h>
void minmax(int a[], int n, int *mn, int *mx) { *mn = *mx = a[0]; for (int i = 1; i < n; i++) { if (a[i] < *mn) *mn = a[i]; if (a[i] > *mx) *mx = a[i]; } }
int main(void) { int a[50], n, mn, mx; scanf("%d", &n); for (int i = 0; i < n; i++) scanf("%d", &a[i]); minmax(a, n, &mn, &mx); printf("%d %d\n", mn, mx); return 0; }`,
    [T('5\n3 9 -2 7 0'), T('3\n4 4 4'), T('1\n-8'), H('4\n-1000 1000 0 5'), H('2\n6 -6')]),

  q('ptr-string-length', 'String Length with a char Pointer', 'Easy',
    'Walk a `char *` along a string until you reach the `\'\\0\'` terminator and count the characters. Do not use `strlen`.\n\nInput\nOne word (no spaces).\n\nOutput\nPrint the length of the word.',
    ['1 <= length <= 100'],
    String.raw`#include <stdio.h>
int main(void) { char s[128]; scanf("%100s", s); char *p = s; int c = 0; while (*p) { c++; p++; } printf("%d\n", c); return 0; }`,
    [T('hello'), T('a'), T('VirVerse2024'), H('abcdefghijklmnopqrstuvwxyz'), H('x_y')]),

  q('ptr-count-vowels', 'Count Vowels Using a Pointer', 'Easy',
    'Traverse a string with a `char *` and count characters that are vowels (`a e i o u`, lowercase or uppercase).\n\nInput\nOne word (no spaces).\n\nOutput\nPrint the number of vowels.',
    ['1 <= length <= 100'],
    String.raw`#include <stdio.h>
int main(void) { char s[128]; scanf("%100s", s); int c = 0; for (char *p = s; *p; p++) { char ch = *p | 32; if (ch=='a'||ch=='e'||ch=='i'||ch=='o'||ch=='u') c++; } printf("%d\n", c); return 0; }`,
    [T('programming'), T('AEIOU'), T('rhythm'), H('Education'), H('b')]),

  q('ptr-quotient-remainder', 'Quotient and Remainder via Pointers', 'Easy',
    'Write `void divide(int a, int b, int *q, int *r)` that stores the quotient and remainder of `a / b` through the pointers.\n\nInput\nOne line with two positive integers `a` and `b`.\n\nOutput\nPrint `quotient remainder` separated by a space.',
    ['0 <= a <= 100000', '1 <= b <= 100000'],
    String.raw`#include <stdio.h>
void divide(int a, int b, int *q, int *r) { *q = a / b; *r = a % b; }
int main(void) { int a, b, q, r; scanf("%d %d", &a, &b); divide(a, b, &q, &r); printf("%d %d\n", q, r); return 0; }`,
    [T('17 5'), T('20 4'), T('3 10'), H('0 7'), H('100000 1')]),

  q('ptr-copy-string', 'Copy a String Pointer by Pointer', 'Easy',
    'Write `void copy(char *dest, const char *src)` that copies characters one by one using pointers (including the terminator). Do not use `strcpy`.\n\nInput\nOne word.\n\nOutput\nPrint the copied word.',
    ['1 <= length <= 100'],
    String.raw`#include <stdio.h>
void copy(char *d, const char *s) { while ((*d++ = *s++)) ; }
int main(void) { char a[128], b[128]; scanf("%100s", a); copy(b, a); printf("%s\n", b); return 0; }`,
    [T('hello'), T('C_language'), T('Z'), H('abc123'), H('MixedCASEword')]),

  q('ptr-swap-pointers', 'Swap Where Pointers Point', 'Medium',
    'Pointer-to-pointer: `int **` stores the address of an `int *`. Write `void swapPtr(int **x, int **y)` that swaps two pointers (not the values). Set `p = &a`, `q = &b`, swap them, and print.\n\nInput\nOne line with two integers `a` and `b`.\n\nOutput\nLine 1: `*p *q` after swapping the pointers. Line 2: `a b` (unchanged).',
    ['-1000 <= a, b <= 1000'],
    String.raw`#include <stdio.h>
void swapPtr(int **x, int **y) { int *t = *x; *x = *y; *y = t; }
int main(void) { int a, b; scanf("%d %d", &a, &b); int *p = &a, *q = &b; swapPtr(&p, &q); printf("%d %d\n%d %d\n", *p, *q, a, b); return 0; }`,
    [T('3 5'), T('-2 8'), H('0 0'), H('1000 -1000'), H('7 7')]),

  q('ptr-dynamic-array-stats', 'Dynamic Array Sum and Max', 'Medium',
    'Use `malloc` to allocate space for `n` integers, read them, print the sum and the maximum, then `free` the memory.\n\nInput\nFirst line: `n`. Second line: `n` integers.\n\nOutput\nPrint `sum max` separated by a space.',
    ['1 <= n <= 50', '-1000 <= element <= 1000'],
    String.raw`#include <stdio.h>
#include <stdlib.h>
int main(void) { int n; scanf("%d", &n); int *a = malloc(n * sizeof *a); if (!a) return 1; int s = 0;
 for (int i = 0; i < n; i++) scanf("%d", a + i); int m = *a; for (int i = 0; i < n; i++) { s += *(a + i); if (*(a + i) > m) m = *(a + i); }
 printf("%d %d\n", s, m); free(a); return 0; }`,
    [T('5\n4 8 1 9 3'), T('3\n-5 -2 -9'), T('1\n6'), H('4\n1000 1000 1000 1000'), H('2\n0 -1')]),

  q('ptr-reverse-string', 'Reverse a String In Place', 'Medium',
    'Reverse a string using two `char *` pointers (one at each end) swapping characters until they cross.\n\nInput\nOne word.\n\nOutput\nPrint the reversed word.',
    ['1 <= length <= 100'],
    String.raw`#include <stdio.h>
#include <string.h>
int main(void) { char s[128]; scanf("%100s", s); char *l = s, *r = s + strlen(s) - 1; while (l < r) { char t = *l; *l++ = *r; *r-- = t; } printf("%s\n", s); return 0; }`,
    [T('hello'), T('abcd'), T('x'), H('racecar'), H('AbC12')]),

  q('ptr-palindrome-check', 'Palindrome Check with Pointers', 'Medium',
    'Use a left pointer and a right pointer moving inward, comparing characters. If all pairs match, the word is a palindrome (case-sensitive).\n\nInput\nOne word.\n\nOutput\nPrint `Yes` if it is a palindrome, otherwise `No`.',
    ['1 <= length <= 100'],
    String.raw`#include <stdio.h>
#include <string.h>
int main(void) { char s[128]; scanf("%100s", s); char *l = s, *r = s + strlen(s) - 1; int ok = 1; while (l < r) { if (*l++ != *r--) { ok = 0; break; } } puts(ok ? "Yes" : "No"); return 0; }`,
    [T('madam'), T('hello'), T('a'), H('abba'), H('Aba')]),

  q('ptr-remove-vowels', 'Remove Vowels with Read/Write Pointers', 'Medium',
    'Use a read pointer and a write pointer on the same string: copy only non-vowel characters (vowels are `aeiouAEIOU`) to the write position, then terminate the string.\n\nInput\nOne word.\n\nOutput\nPrint the word without vowels.',
    ['1 <= length <= 100'],
    String.raw`#include <stdio.h>
#include <string.h>
int main(void) { char s[128]; scanf("%100s", s); char *w = s; for (char *r = s; *r; r++) if (!strchr("aeiouAEIOU", *r)) *w++ = *r; *w = '\0'; printf("%s\n", s); return 0; }`,
    [T('education'), T('Programming'), T('rhythm'), H('aeioub'), H('AbEcI')]),

  q('ptr-rotate-right', 'Rotate Array Right Using Pointers', 'Medium',
    'Rotate an array to the right by `k` positions. Allocate a second array with `malloc`, place element `i` at position `(i + k) % n` using pointers, then print and free.\n\nInput\nFirst line: `n` and `k`. Second line: `n` integers.\n\nOutput\nPrint the rotated array separated by single spaces.',
    ['1 <= n <= 50', '0 <= k <= 100', '-1000 <= element <= 1000'],
    String.raw`#include <stdio.h>
#include <stdlib.h>
int main(void) { int n, k; scanf("%d %d", &n, &k); int *a = malloc(n * sizeof *a), *b = malloc(n * sizeof *b); if (!a || !b) return 1;
 for (int i = 0; i < n; i++) scanf("%d", a + i); for (int i = 0; i < n; i++) *(b + (i + k) % n) = *(a + i);
 for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", *(b + i)); printf("\n"); free(a); free(b); return 0; }`,
    [T('5 2\n1 2 3 4 5'), T('4 1\n10 20 30 40'), T('3 0\n7 8 9'), H('3 3\n1 2 3'), H('1 100\n5'), H('4 6\n1 2 3 4')]),

  q('ptr-merge-sorted', 'Merge Two Sorted Arrays', 'Medium',
    'Given two ascending arrays, merge them into one ascending array stored in `malloc`ed memory. Walk three pointers: one through each input and one through the output.\n\nInput\nLine 1: `n m`. Line 2: `n` integers (ascending). Line 3: `m` integers (ascending).\n\nOutput\nPrint the merged array separated by single spaces.',
    ['1 <= n, m <= 25', '-1000 <= element <= 1000'],
    String.raw`#include <stdio.h>
#include <stdlib.h>
int main(void) { int n, m; scanf("%d %d", &n, &m); int *a = malloc(n * sizeof *a), *b = malloc(m * sizeof *b), *c = malloc((n + m) * sizeof *c); if (!a || !b || !c) return 1;
 for (int i = 0; i < n; i++) scanf("%d", a + i); for (int i = 0; i < m; i++) scanf("%d", b + i);
 int *p = a, *q = b, *o = c; while (p < a + n && q < b + m) *o++ = (*p <= *q) ? *p++ : *q++; while (p < a + n) *o++ = *p++; while (q < b + m) *o++ = *q++;
 for (int i = 0; i < n + m; i++) printf(i ? " %d" : "%d", c[i]); printf("\n"); free(a); free(b); free(c); return 0; }`,
    [T('3 3\n1 3 5\n2 4 6'), T('2 4\n1 1\n1 2 2 3'), T('1 1\n5\n-5'), H('3 2\n-10 0 10\n-10 10'), H('1 3\n0\n1 2 3')]),

  q('ptr-transpose-matrix', 'Transpose a Matrix with Pointer Arithmetic', 'Hard',
    'Store an `r x c` matrix in one `malloc`ed block. Element (i, j) is at `*(m + i*c + j)`. Build the transpose in a second block and print it.\n\nInput\nFirst line: `r c`. Then `r` lines of `c` integers.\n\nOutput\nPrint `c` lines with `r` integers each, separated by single spaces.',
    ['1 <= r, c <= 10', '-1000 <= element <= 1000'],
    String.raw`#include <stdio.h>
#include <stdlib.h>
int main(void) { int r, c; scanf("%d %d", &r, &c); int *m = malloc(r * c * sizeof *m), *t = malloc(r * c * sizeof *t); if (!m || !t) return 1;
 for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) scanf("%d", m + i * c + j);
 for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) *(t + j * r + i) = *(m + i * c + j);
 for (int j = 0; j < c; j++) { for (int i = 0; i < r; i++) printf(i ? " %d" : "%d", *(t + j * r + i)); printf("\n"); } free(m); free(t); return 0; }`,
    [T('2 3\n1 2 3\n4 5 6'), T('3 1\n7\n8\n9'), T('2 2\n1 0\n0 1'), H('1 4\n1 2 3 4'), H('3 3\n-1 2 -3\n4 -5 6\n-7 8 -9')]),

  q('ptr-sort-words-pointers', 'Sort Words by Swapping Pointers', 'Hard',
    'Keep an array of `char *` that point to `n` words. Sort the words alphabetically (as `strcmp` orders them) by swapping the pointers, not the text.\n\nInput\nFirst line: `n`. Then `n` words (whitespace separated).\n\nOutput\nPrint the sorted words, one per line.',
    ['1 <= n <= 30', 'Each word has 1 to 20 characters, no spaces'],
    String.raw`#include <stdio.h>
#include <string.h>
int main(void) { int n; char buf[30][24]; char *p[30]; scanf("%d", &n); for (int i = 0; i < n; i++) { scanf("%20s", buf[i]); p[i] = buf[i]; }
 for (int i = 0; i < n - 1; i++) for (int j = 0; j < n - 1 - i; j++) if (strcmp(p[j], p[j + 1]) > 0) { char *t = p[j]; p[j] = p[j + 1]; p[j + 1] = t; }
 for (int i = 0; i < n; i++) puts(p[i]); return 0; }`,
    [T('3\nbanana apple cherry'), T('4\ndog cat Cat bird'), T('1\nsolo'), H('5\nb a b a c'), H('3\nabc ab abcd')]),

  q('ptr-function-pointer-reduce', 'Reduce an Array with Function Pointers', 'Hard',
    'Keep three functions `sum`, `maxv`, `minv`, each taking `(int *a, int n)`, in an array of function pointers. Choose one by its index and call it.\n\nInput\nFirst line: `n` and `op`, where `op` is 0 (sum), 1 (maximum) or 2 (minimum). Second line: `n` integers.\n\nOutput\nPrint the result.',
    ['1 <= n <= 50', '0 <= op <= 2', '-1000 <= element <= 1000'],
    String.raw`#include <stdio.h>
int sum(int *a, int n) { int s = 0; for (int *p = a; p < a + n; p++) s += *p; return s; }
int maxv(int *a, int n) { int m = *a; for (int *p = a; p < a + n; p++) if (*p > m) m = *p; return m; }
int minv(int *a, int n) { int m = *a; for (int *p = a; p < a + n; p++) if (*p < m) m = *p; return m; }
int main(void) { int (*f[3])(int *, int) = { sum, maxv, minv }; int n, op, a[50]; scanf("%d %d", &n, &op); for (int i = 0; i < n; i++) scanf("%d", &a[i]); printf("%d\n", f[op](a, n)); return 0; }`,
    [T('4 0\n1 2 3 4'), T('4 1\n5 -2 9 3'), T('4 2\n5 -2 9 3'), H('1 0\n-7'), H('3 2\n0 0 0'), H('3 1\n-5 -6 -7')]),
];
