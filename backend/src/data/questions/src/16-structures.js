const q = (slug, title, difficulty, description, constraints, solution, tests, starterCode) => ({
  slug, title, difficulty, description, constraints, solution, tests, ...(starterCode ? { starterCode } : {}),
});
const H = (input) => ({ input, hidden: true });
const T = (input) => ({ input });

export default [
  q('struct-student-record', 'Print a Student Record', 'Easy',
    'A `struct` groups related variables. Define `struct Student { char name[21]; int roll; int marks; }`, read one student, and print it.\n\nInput\nOne line: `name roll marks` (name is a single word).\n\nOutput\nPrint `Name: <name>, Roll: <roll>, Marks: <marks>`.',
    ['name has 1 to 20 characters', '1 <= roll <= 1000', '0 <= marks <= 100'],
    String.raw`#include <stdio.h>
struct Student { char name[21]; int roll; int marks; };
int main(void) { struct Student s; scanf("%20s %d %d", s.name, &s.roll, &s.marks); printf("Name: %s, Roll: %d, Marks: %d\n", s.name, s.roll, s.marks); return 0; }`,
    [T('Asha 12 88'), T('Bob 1 0'), H('Zed 1000 100'), H('Q 7 55')]),

  q('struct-point-distance', 'Squared Distance Between Points', 'Easy',
    'Define `struct Point { int x, y; }`. Read two points and print the squared distance `(x1-x2)^2 + (y1-y2)^2`.\n\nInput\nOne line: `x1 y1 x2 y2`.\n\nOutput\nPrint the squared distance.',
    ['-100 <= coordinates <= 100'],
    String.raw`#include <stdio.h>
struct Point { int x, y; };
int main(void) { struct Point a, b; scanf("%d %d %d %d", &a.x, &a.y, &b.x, &b.y); int dx = a.x - b.x, dy = a.y - b.y; printf("%d\n", dx * dx + dy * dy); return 0; }`,
    [T('0 0 3 4'), T('1 1 1 1'), T('-2 5 4 -3'), H('-100 -100 100 100'), H('5 5 5 9')]),

  q('struct-rectangle-compare', 'Compare Two Rectangles', 'Easy',
    'Define `struct Rect { int w, h; }`. Compute the area of two rectangles and report which is larger.\n\nInput\nOne line: `w1 h1 w2 h2`.\n\nOutput\nPrint `First` if the first area is larger, `Second` if the second is larger, or `Equal`.',
    ['1 <= w, h <= 1000'],
    String.raw`#include <stdio.h>
struct Rect { int w, h; };
int main(void) { struct Rect a, b; scanf("%d %d %d %d", &a.w, &a.h, &b.w, &b.h); int x = a.w * a.h, y = b.w * b.h; puts(x > y ? "First" : y > x ? "Second" : "Equal"); return 0; }`,
    [T('3 4 2 5'), T('1 1 2 2'), T('2 6 3 4'), H('1000 1000 999 1000'), H('1 7 7 1')]),

  q('struct-total-marks', 'Total Marks of All Students', 'Easy',
    'Read `n` students into an array of structs and print the total of all their marks.\n\nInput\nFirst line: `n`. Then `n` lines: `name roll marks`.\n\nOutput\nPrint the total marks.',
    ['1 <= n <= 50', '0 <= marks <= 100', 'name is one word of at most 20 characters'],
    String.raw`#include <stdio.h>
struct Student { char name[21]; int roll; int marks; };
int main(void) { struct Student s[50]; int n, t = 0; scanf("%d", &n); for (int i = 0; i < n; i++) { scanf("%20s %d %d", s[i].name, &s[i].roll, &s[i].marks); t += s[i].marks; } printf("%d\n", t); return 0; }`,
    [T('3\nAsha 1 80\nBob 2 70\nCy 3 90'), T('1\nSolo 5 100'), H('2\nA 1 0\nB 2 0'), H('4\nW 1 100\nX 2 100\nY 3 100\nZ 4 100')]),

  q('struct-find-topper', 'Find the Topper', 'Easy',
    'Find the student with the highest marks. Marks are all different.\n\nInput\nFirst line: `n`. Then `n` lines: `name roll marks`.\n\nOutput\nPrint `name roll marks` of the topper separated by single spaces.',
    ['1 <= n <= 50', '0 <= marks <= 100'],
    String.raw`#include <stdio.h>
struct Student { char name[21]; int roll; int marks; };
int main(void) { struct Student s[50]; int n, b = 0; scanf("%d", &n); for (int i = 0; i < n; i++) { scanf("%20s %d %d", s[i].name, &s[i].roll, &s[i].marks); if (s[i].marks > s[b].marks) b = i; } printf("%s %d %d\n", s[b].name, s[b].roll, s[b].marks); return 0; }`,
    [T('3\nAsha 1 80\nBob 2 95\nCy 3 90'), T('2\nA 10 5\nB 20 6'), T('1\nOnly 9 50'), H('3\nA 1 100\nB 2 0\nC 3 1'), H('4\nP 4 10\nQ 3 20\nR 2 30\nS 1 40')]),

  q('struct-box-volume', 'Pass a Struct to a Function', 'Easy',
    'Structs can be passed by value. Write `int volume(struct Box b)` that returns `l*w*h`.\n\nInput\nOne line: `l w h`.\n\nOutput\nPrint the volume.',
    ['1 <= l, w, h <= 100'],
    String.raw`#include <stdio.h>
struct Box { int l, w, h; };
int volume(struct Box b) { return b.l * b.w * b.h; }
int main(void) { struct Box b; scanf("%d %d %d", &b.l, &b.w, &b.h); printf("%d\n", volume(b)); return 0; }`,
    [T('2 3 4'), T('1 1 1'), T('10 10 10'), H('100 100 100'), H('1 50 2')],
    '#include <stdio.h>\n\nstruct Box { int l, w, h; };\n\nint volume(struct Box b) {\n    // return the volume\n    return 0;\n}\n\nint main(void) {\n    struct Box b;\n    scanf("%d %d %d", &b.l, &b.w, &b.h);\n    printf("%d\\n", volume(b));\n    return 0;\n}\n'),

  q('struct-bonus-pointer', 'Modify a Struct Through a Pointer', 'Easy',
    'Write `void addBonus(struct Student *s, int bonus)` that adds bonus marks, never going above 100. Use the arrow operator `s->marks`.\n\nInput\nOne line: `name roll marks bonus`.\n\nOutput\nPrint `name roll marks` after the bonus.',
    ['0 <= marks, bonus <= 100'],
    String.raw`#include <stdio.h>
struct Student { char name[21]; int roll; int marks; };
void addBonus(struct Student *s, int b) { s->marks += b; if (s->marks > 100) s->marks = 100; }
int main(void) { struct Student s; int b; scanf("%20s %d %d %d", s.name, &s.roll, &s.marks, &b); addBonus(&s, b); printf("%s %d %d\n", s.name, s.roll, s.marks); return 0; }`,
    [T('Asha 1 80 5'), T('Bob 2 98 10'), T('Cy 3 0 0'), H('D 4 100 100'), H('E 5 50 50')]),

  q('struct-complex-add', 'Add Complex Numbers with typedef', 'Easy',
    'Use `typedef struct { int re, im; } Complex;` and a function `Complex add(Complex a, Complex b)` that returns a struct.\n\nInput\nOne line: `re1 im1 re2 im2`.\n\nOutput\nPrint `re im` of the sum.',
    ['-1000 <= each value <= 1000'],
    String.raw`#include <stdio.h>
typedef struct { int re, im; } Complex;
Complex add(Complex a, Complex b) { Complex c = { a.re + b.re, a.im + b.im }; return c; }
int main(void) { Complex a, b; scanf("%d %d %d %d", &a.re, &a.im, &b.re, &b.im); Complex c = add(a, b); printf("%d %d\n", c.re, c.im); return 0; }`,
    [T('1 2 3 4'), T('-5 0 5 0'), T('0 0 0 0'), H('1000 1000 1000 1000'), H('-1000 -1000 1 1')]),

  q('struct-enum-weekday', 'Day Names with enum', 'Easy',
    'Define `enum Day { MON = 1, TUE, WED, THU, FRI, SAT, SUN };`. Read a number 1-7 into an enum and print its name in uppercase 3 letters (`MON`...`SUN`), then `Weekend` for SAT/SUN or `Weekday` otherwise, on the same line separated by a space.\n\nInput\nOne integer `d`.\n\nOutput\nPrint `<NAME> <Weekend|Weekday>`.',
    ['1 <= d <= 7'],
    String.raw`#include <stdio.h>
enum Day { MON = 1, TUE, WED, THU, FRI, SAT, SUN };
int main(void) { const char *names[] = { "", "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN" }; int x; scanf("%d", &x); enum Day d = (enum Day)x; printf("%s %s\n", names[d], d >= SAT ? "Weekend" : "Weekday"); return 0; }`,
    [T('1'), T('6'), T('4'), H('7'), H('5')]),

  q('struct-time-add', 'Add Time Durations', 'Easy',
    'Define `struct Time { int h, m, s; }`. Add two durations and normalise so that `0 <= m < 60` and `0 <= s < 60` (hours can grow).\n\nInput\nOne line: `h1 m1 s1 h2 m2 s2`.\n\nOutput\nPrint `h m s` separated by single spaces.',
    ['0 <= h <= 100', '0 <= m, s <= 59'],
    String.raw`#include <stdio.h>
struct Time { int h, m, s; };
int main(void) { struct Time a, b; scanf("%d %d %d %d %d %d", &a.h, &a.m, &a.s, &b.h, &b.m, &b.s); int t = (a.h + b.h) * 3600 + (a.m + b.m) * 60 + a.s + b.s; struct Time r = { t / 3600, t % 3600 / 60, t % 60 }; printf("%d %d %d\n", r.h, r.m, r.s); return 0; }`,
    [T('1 30 45 2 40 30'), T('0 0 0 0 0 0'), T('0 59 59 0 0 1'), H('100 59 59 100 59 59'), H('5 10 20 0 0 0')]),

  q('struct-sort-by-marks', 'Sort Students by Marks', 'Medium',
    'Sort an array of student structs by marks from highest to lowest. Students with equal marks must keep their original input order (use a stable sort such as insertion sort).\n\nInput\nFirst line: `n`. Then `n` lines: `name roll marks`.\n\nOutput\nPrint one student per line as `name roll marks`.',
    ['1 <= n <= 50', '0 <= marks <= 100'],
    String.raw`#include <stdio.h>
struct Student { char name[21]; int roll; int marks; };
int main(void) { struct Student s[50]; int n; scanf("%d", &n); for (int i = 0; i < n; i++) scanf("%20s %d %d", s[i].name, &s[i].roll, &s[i].marks);
 for (int i = 1; i < n; i++) { struct Student k = s[i]; int j = i - 1; while (j >= 0 && s[j].marks < k.marks) { s[j + 1] = s[j]; j--; } s[j + 1] = k; }
 for (int i = 0; i < n; i++) printf("%s %d %d\n", s[i].name, s[i].roll, s[i].marks); return 0; }`,
    [T('3\nAsha 1 80\nBob 2 95\nCy 3 90'), T('4\nA 1 50\nB 2 70\nC 3 50\nD 4 70'), T('1\nSolo 1 1'), H('3\nX 1 10\nY 2 10\nZ 3 10'), H('5\nA 1 1\nB 2 2\nC 3 3\nD 4 4\nE 5 5')]),

  q('struct-nested-join-date', 'Employees Joined Before a Year', 'Medium',
    'Define `struct Date { int d, m, y; }` and `struct Employee { char name[21]; struct Date join; }` (a nested struct). Count and list the employees who joined strictly before year `Y`.\n\nInput\nFirst line: `n Y`. Then `n` lines: `name day month year`.\n\nOutput\nFirst line: the count. Then the names (in input order), one per line.',
    ['1 <= n <= 50', '1990 <= year, Y <= 2030'],
    String.raw`#include <stdio.h>
struct Date { int d, m, y; };
struct Employee { char name[21]; struct Date join; };
int main(void) { struct Employee e[50]; int n, Y, c = 0; scanf("%d %d", &n, &Y); for (int i = 0; i < n; i++) { scanf("%20s %d %d %d", e[i].name, &e[i].join.d, &e[i].join.m, &e[i].join.y); if (e[i].join.y < Y) c++; }
 printf("%d\n", c); for (int i = 0; i < n; i++) if (e[i].join.y < Y) puts(e[i].name); return 0; }`,
    [T('3 2020\nAsha 1 1 2018\nBob 5 6 2020\nCy 9 9 2015'), T('2 2000\nA 1 1 2001\nB 2 2 2002'), H('2 2030\nA 1 1 1990\nB 2 2 2029'), H('1 1990\nZ 1 1 1990')]),

  q('struct-tagged-union', 'Tagged Union Printer', 'Medium',
    'A `union` stores one of several types in the same memory. Use `struct Value { int type; union { int i; double d; char c; } u; }`. Type 0 = int, 1 = double, 2 = char. Read `n` values and print each according to its type: ints as `%d`, doubles with `%.2f`, chars as `%c`.\n\nInput\nFirst line: `n`. Then `n` lines: `type value` (for char the value is a single non-space character).\n\nOutput\nPrint each value on its own line.',
    ['1 <= n <= 30', 'Doubles have at most 2 decimal places and absolute value <= 1000'],
    String.raw`#include <stdio.h>
struct Value { int type; union { int i; double d; char c; } u; };
int main(void) { int n; scanf("%d", &n); for (int k = 0; k < n; k++) { struct Value v; scanf("%d", &v.type);
 if (v.type == 0) { scanf("%d", &v.u.i); printf("%d\n", v.u.i); } else if (v.type == 1) { scanf("%lf", &v.u.d); printf("%.2f\n", v.u.d); } else { scanf(" %c", &v.u.c); printf("%c\n", v.u.c); } } return 0; }`,
    [T('3\n0 42\n1 3.5\n2 x'), T('2\n1 -2.25\n0 -7'), H('1\n2 Z'), H('3\n1 0.00\n1 999.99\n0 0')]),

  q('struct-search-roll', 'Search a Student by Roll Number', 'Medium',
    'Search an array of students for a given roll number.\n\nInput\nFirst line: `n`. Then `n` lines: `name roll marks`. Last line: the roll `r` to find.\n\nOutput\nPrint `name marks` of the matching student, or `Not found`.',
    ['1 <= n <= 50', 'Roll numbers are unique', '1 <= roll <= 1000'],
    String.raw`#include <stdio.h>
struct Student { char name[21]; int roll; int marks; };
int main(void) { struct Student s[50]; int n, r; scanf("%d", &n); for (int i = 0; i < n; i++) scanf("%20s %d %d", s[i].name, &s[i].roll, &s[i].marks); scanf("%d", &r);
 for (int i = 0; i < n; i++) if (s[i].roll == r) { printf("%s %d\n", s[i].name, s[i].marks); return 0; } puts("Not found"); return 0; }`,
    [T('3\nAsha 1 80\nBob 2 95\nCy 3 90\n2'), T('2\nA 10 5\nB 20 6\n30'), H('1\nOnly 1000 100\n1000'), H('2\nA 5 0\nB 6 1\n5')]),

  q('struct-fraction-add', 'Add Fractions in Lowest Terms', 'Medium',
    'Define `struct Fraction { int num, den; }`. Add two fractions and reduce the result using the GCD.\n\nInput\nOne line: `n1 d1 n2 d2`.\n\nOutput\nPrint `num/den` in lowest terms. If the result is a whole number, still print `num/1`.',
    ['1 <= n1, d1, n2, d2 <= 100'],
    String.raw`#include <stdio.h>
struct Fraction { int num, den; };
int gcd(int a, int b) { return b ? gcd(b, a % b) : a; }
struct Fraction add(struct Fraction a, struct Fraction b) { struct Fraction r = { a.num * b.den + b.num * a.den, a.den * b.den }; int g = gcd(r.num, r.den); r.num /= g; r.den /= g; return r; }
int main(void) { struct Fraction a, b; scanf("%d %d %d %d", &a.num, &a.den, &b.num, &b.den); struct Fraction r = add(a, b); printf("%d/%d\n", r.num, r.den); return 0; }`,
    [T('1 2 1 3'), T('1 2 1 2'), T('2 4 3 6'), H('100 1 100 1'), H('1 100 1 100'), H('5 7 2 7')]),

  q('struct-bank-transactions', 'Bank Account Transactions', 'Medium',
    'Define `struct Account { int id; int balance; }`. Process transactions: `D` deposits, `W` withdraws. A withdrawal larger than the balance is rejected and the balance stays unchanged. Count rejected withdrawals.\n\nInput\nFirst line: `n m` (accounts, transactions). Then `n` lines: `id balance`. Then `m` lines: `id type amount` (`type` is `D` or `W`). All ids exist.\n\nOutput\nPrint `id balance` for each account in input order, then a final line `Rejected: k`.',
    ['1 <= n <= 20', '1 <= m <= 50', '0 <= balance, amount <= 100000'],
    String.raw`#include <stdio.h>
struct Account { int id; int balance; };
int main(void) { struct Account a[20]; int n, m, rej = 0; scanf("%d %d", &n, &m); for (int i = 0; i < n; i++) scanf("%d %d", &a[i].id, &a[i].balance);
 for (int k = 0; k < m; k++) { int id, amt; char t; scanf("%d %c %d", &id, &t, &amt); for (int i = 0; i < n; i++) if (a[i].id == id) { if (t == 'D') a[i].balance += amt; else if (amt <= a[i].balance) a[i].balance -= amt; else rej++; } }
 for (int i = 0; i < n; i++) printf("%d %d\n", a[i].id, a[i].balance); printf("Rejected: %d\n", rej); return 0; }`,
    [T('2 3\n1 100\n2 50\n1 W 30\n2 W 80\n2 D 10'), T('1 2\n7 0\n7 D 5\n7 W 5'), H('1 1\n1 10\n1 W 11'), H('2 4\n10 0\n20 0\n10 D 100000\n20 W 1\n10 W 100000\n20 D 0')]),

  q('struct-sort-by-name', 'Sort Students by Name', 'Medium',
    'Sort students alphabetically by name using `strcmp` (uppercase letters come before lowercase). Names are unique. Swap whole structs.\n\nInput\nFirst line: `n`. Then `n` lines: `name roll marks`.\n\nOutput\nPrint each student as `name roll marks`, one per line.',
    ['1 <= n <= 50', 'Names are unique'],
    String.raw`#include <stdio.h>
#include <string.h>
struct Student { char name[21]; int roll; int marks; };
int main(void) { struct Student s[50]; int n; scanf("%d", &n); for (int i = 0; i < n; i++) scanf("%20s %d %d", s[i].name, &s[i].roll, &s[i].marks);
 for (int i = 0; i < n - 1; i++) for (int j = 0; j < n - 1 - i; j++) if (strcmp(s[j].name, s[j + 1].name) > 0) { struct Student t = s[j]; s[j] = s[j + 1]; s[j + 1] = t; }
 for (int i = 0; i < n; i++) printf("%s %d %d\n", s[i].name, s[i].roll, s[i].marks); return 0; }`,
    [T('3\nCy 3 90\nAsha 1 80\nBob 2 95'), T('2\nbob 1 1\nBob 2 2'), T('1\nZ 1 1'), H('4\nd 1 1\nc 2 2\nb 3 3\na 4 4'), H('3\nab 1 1\na 2 2\nabc 3 3')]),

  q('struct-league-table', 'Football League Table', 'Hard',
    'Teams play matches. A win gives 3 points, a draw 1 each, a loss 0. Keep a struct per team with points, goals scored and goals conceded. Rank teams by points (high first), then goal difference (high first), then name (alphabetical via `strcmp`).\n\nInput\nFirst line: `m`. Then `m` lines: `teamA goalsA teamB goalsB`. Team names are single words; there are at most 20 distinct teams.\n\nOutput\nOne line per team in rank order: `name points goalDifference`.',
    ['1 <= m <= 50', '0 <= goals <= 20', 'name has at most 20 characters'],
    String.raw`#include <stdio.h>
#include <string.h>
struct Team { char name[21]; int pts, gf, ga; };
struct Team t[40]; int nt = 0;
int find(const char *s) { for (int i = 0; i < nt; i++) if (!strcmp(t[i].name, s)) return i; strcpy(t[nt].name, s); return nt++; }
int main(void) { int m; scanf("%d", &m); for (int k = 0; k < m; k++) { char a[21], b[21]; int ga, gb; scanf("%20s %d %20s %d", a, &ga, b, &gb); int x = find(a), y = find(b);
 t[x].gf += ga; t[x].ga += gb; t[y].gf += gb; t[y].ga += ga; if (ga > gb) t[x].pts += 3; else if (gb > ga) t[y].pts += 3; else { t[x].pts++; t[y].pts++; } }
 for (int i = 0; i < nt - 1; i++) for (int j = 0; j < nt - 1 - i; j++) { int dj = t[j].gf - t[j].ga, dk = t[j + 1].gf - t[j + 1].ga; int sw = 0;
  if (t[j].pts != t[j + 1].pts) sw = t[j].pts < t[j + 1].pts; else if (dj != dk) sw = dj < dk; else sw = strcmp(t[j].name, t[j + 1].name) > 0;
  if (sw) { struct Team tmp = t[j]; t[j] = t[j + 1]; t[j + 1] = tmp; } }
 for (int i = 0; i < nt; i++) printf("%s %d %d\n", t[i].name, t[i].pts, t[i].gf - t[i].ga); return 0; }`,
    [T('3\nLions 2 Bears 1\nTigers 0 Lions 0\nBears 3 Tigers 1'), T('1\nA 1 B 1'), T('2\nX 5 Y 0\nY 0 X 0'), H('3\nB 1 A 1\nC 2 A 2\nC 1 B 1'), H('2\nZ 3 Y 0\nX 3 W 0')]),

  q('struct-date-difference', 'Days Between Two Dates', 'Hard',
    'Define `struct Date { int d, m, y; }`. Compute the number of days from the first date to the second (the second is never earlier). Remember leap years: divisible by 4, except centuries unless divisible by 400.\n\nInput\nOne line: `d1 m1 y1 d2 m2 y2`.\n\nOutput\nPrint the number of days between them.',
    ['Dates are valid, between 1900 and 2100', 'The second date is on or after the first'],
    String.raw`#include <stdio.h>
struct Date { int d, m, y; };
int leap(int y) { return (y % 4 == 0 && y % 100 != 0) || y % 400 == 0; }
long days(struct Date x) { static const int md[] = { 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 }; long n = 0; for (int y = 1900; y < x.y; y++) n += leap(y) ? 366 : 365;
 for (int m = 1; m < x.m; m++) n += md[m - 1] + (m == 2 && leap(x.y)); return n + x.d; }
int main(void) { struct Date a, b; scanf("%d %d %d %d %d %d", &a.d, &a.m, &a.y, &b.d, &b.m, &b.y); printf("%ld\n", days(b) - days(a)); return 0; }`,
    [T('1 1 2020 1 1 2021'), T('28 2 2019 1 3 2019'), T('15 5 2000 15 5 2000'), H('28 2 2000 1 3 2000'), H('31 12 1999 1 1 2100'), H('1 1 1900 31 12 2100')]),

  q('struct-linked-list', 'Linked List of Structs', 'Hard',
    'Build a singly linked list with `struct Node { int val; struct Node *next; }`. Insert `n` values at the END of the list, then delete the FIRST node holding each of `k` given values (ignore a value that is not present). Free all nodes.\n\nInput\nLine 1: `n`. Line 2: `n` integers. Line 3: `k`. Line 4: `k` integers to delete.\n\nOutput\nPrint the remaining values separated by single spaces, or `Empty` if none are left.',
    ['1 <= n <= 50', '1 <= k <= 50', '-1000 <= value <= 1000'],
    String.raw`#include <stdio.h>
#include <stdlib.h>
struct Node { int val; struct Node *next; };
int main(void) { int n, k; struct Node *head = NULL, **tail = &head; scanf("%d", &n);
 for (int i = 0; i < n; i++) { struct Node *x = malloc(sizeof *x); if (!x) return 1; scanf("%d", &x->val); x->next = NULL; *tail = x; tail = &x->next; }
 scanf("%d", &k); for (int i = 0; i < k; i++) { int v; scanf("%d", &v); struct Node **p = &head; while (*p && (*p)->val != v) p = &(*p)->next; if (*p) { struct Node *d = *p; *p = d->next; free(d); } }
 if (!head) puts("Empty"); for (struct Node *c = head; c; c = c->next) printf(c->next ? "%d " : "%d\n", c->val);
 while (head) { struct Node *d = head; head = head->next; free(d); } return 0; }`,
    [T('5\n1 2 3 4 5\n2\n3 1'), T('4\n5 5 5 5\n2\n5 5'), T('2\n1 2\n1\n9'), H('1\n7\n1\n7'), H('3\n-1 0 1\n3\n1 0 -1')]),
];
