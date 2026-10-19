export default [
  {
    slug: 'even-or-odd',
    title: 'Even or Odd',
    difficulty: 'Easy',
    description:
      'Read an integer and print `Even` if it is even, or `Odd` if it is odd.\n\nHint: a number is even when `n % 2 == 0`.\n\nInput: one integer `n`.\nOutput: the word `Even` or `Odd`.',
    constraints: ['-100000 <= n <= 100000'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int n;
    scanf("%d", &n);
    if (n % 2 == 0) printf("Even\n");
    else printf("Odd\n");
    return 0;
}`,
    tests: [{ input: '7' }, { input: '10' }, { input: '0', hidden: true }, { input: '-3', hidden: true }, { input: '-100000', hidden: true }],
  },
  {
    slug: 'positive-negative-zero',
    title: 'Positive, Negative or Zero',
    difficulty: 'Easy',
    description:
      'Read an integer and tell whether it is greater than, less than, or equal to zero.\n\nInput: one integer `n`.\nOutput: `Positive`, `Negative` or `Zero`.',
    constraints: ['-1000000 <= n <= 1000000'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int n;
    scanf("%d", &n);
    if (n > 0) printf("Positive\n");
    else if (n < 0) printf("Negative\n");
    else printf("Zero\n");
    return 0;
}`,
    tests: [{ input: '5' }, { input: '-8' }, { input: '0', hidden: true }, { input: '1', hidden: true }, { input: '-1', hidden: true }],
  },
  {
    slug: 'larger-of-two',
    title: 'Larger of Two Numbers',
    difficulty: 'Easy',
    description:
      'Read two integers and print the larger one. If they are equal, print either (they are the same).\n\nInput: two integers `a` and `b` separated by a space.\nOutput: the larger number.',
    constraints: ['-1000000 <= a, b <= 1000000'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    if (a >= b) printf("%d\n", a);
    else printf("%d\n", b);
    return 0;
}`,
    tests: [{ input: '3 9' }, { input: '12 4' }, { input: '5 5', hidden: true }, { input: '-3 -7', hidden: true }, { input: '-1000000 1000000', hidden: true }],
  },
  {
    slug: 'voting-eligibility',
    title: 'Voting Eligibility',
    difficulty: 'Easy',
    description:
      'A person can vote if their age is 18 or more.\n\nInput: one integer `age`.\nOutput: `Eligible` if the person can vote, otherwise `Not Eligible`.',
    constraints: ['0 <= age <= 120'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int age;
    scanf("%d", &age);
    if (age >= 18) printf("Eligible\n");
    else printf("Not Eligible\n");
    return 0;
}`,
    tests: [{ input: '25' }, { input: '10' }, { input: '18', hidden: true }, { input: '17', hidden: true }, { input: '0', hidden: true }],
  },
  {
    slug: 'pass-or-fail',
    title: 'Pass or Fail',
    difficulty: 'Easy',
    description:
      'A student passes if they score 40 marks or more out of 100.\n\nInput: one integer `marks`.\nOutput: `Pass` or `Fail`.',
    constraints: ['0 <= marks <= 100'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int m;
    scanf("%d", &m);
    if (m >= 40) printf("Pass\n");
    else printf("Fail\n");
    return 0;
}`,
    tests: [{ input: '75' }, { input: '12' }, { input: '40', hidden: true }, { input: '39', hidden: true }, { input: '100', hidden: true }, { input: '0', hidden: true }],
  },
  {
    slug: 'divisible-by-3-and-5',
    title: 'Divisible by 3 and 5',
    difficulty: 'Easy',
    description:
      'Check whether a number is divisible by both 3 and 5.\n\nHint: use `%` and the `&&` operator.\n\nInput: one integer `n`.\nOutput: `Yes` if `n` is divisible by both 3 and 5, otherwise `No`.',
    constraints: ['-100000 <= n <= 100000'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int n;
    scanf("%d", &n);
    if (n % 3 == 0 && n % 5 == 0) printf("Yes\n");
    else printf("No\n");
    return 0;
}`,
    tests: [{ input: '15' }, { input: '9' }, { input: '0', hidden: true }, { input: '-30', hidden: true }, { input: '10', hidden: true }],
  },
  {
    slug: 'absolute-value',
    title: 'Absolute Value',
    difficulty: 'Easy',
    description:
      'Print the absolute value of an integer (its distance from zero) using an `if` statement, without library functions.\n\nInput: one integer `n`.\nOutput: the absolute value of `n`.',
    constraints: ['-1000000 <= n <= 1000000'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int n;
    scanf("%d", &n);
    if (n < 0) n = -n;
    printf("%d\n", n);
    return 0;
}`,
    tests: [{ input: '-15' }, { input: '8' }, { input: '0', hidden: true }, { input: '-1000000', hidden: true }, { input: '-1', hidden: true }],
  },
  {
    slug: 'character-type',
    title: 'Character Type',
    difficulty: 'Easy',
    description:
      'Read a single character and classify it.\n\nInput: one character `ch` (read it with `scanf(" %c", &ch)`).\nOutput: `Uppercase` if it is a letter A-Z, `Lowercase` if it is a letter a-z, `Digit` if it is 0-9, otherwise `Other`.',
    constraints: ['The character is a printable, non-space ASCII character'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    char c;
    scanf(" %c", &c);
    if (c >= 'A' && c <= 'Z') printf("Uppercase\n");
    else if (c >= 'a' && c <= 'z') printf("Lowercase\n");
    else if (c >= '0' && c <= '9') printf("Digit\n");
    else printf("Other\n");
    return 0;
}`,
    tests: [{ input: 'G' }, { input: 'm' }, { input: '7' }, { input: '#', hidden: true }, { input: 'A', hidden: true }, { input: 'z', hidden: true }],
  },
  {
    slug: 'temperature-state',
    title: 'Water State by Temperature',
    difficulty: 'Easy',
    description:
      'Given the temperature of water in whole degrees Celsius, say what state it is in.\n\n- 0 or below: `Ice`\n- 1 to 99: `Water`\n- 100 or above: `Steam`\n\nInput: one integer `t`.\nOutput: `Ice`, `Water` or `Steam`.',
    constraints: ['-100 <= t <= 500'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int t;
    scanf("%d", &t);
    if (t <= 0) printf("Ice\n");
    else if (t < 100) printf("Water\n");
    else printf("Steam\n");
    return 0;
}`,
    tests: [{ input: '-5' }, { input: '50' }, { input: '0', hidden: true }, { input: '1', hidden: true }, { input: '99', hidden: true }, { input: '100', hidden: true }],
  },
  {
    slug: 'largest-of-three',
    title: 'Largest of Three Numbers',
    difficulty: 'Easy',
    description:
      'Read three integers and print the largest.\n\nInput: three integers `a b c` separated by spaces.\nOutput: the largest of them.',
    constraints: ['-1000000 <= a, b, c <= 1000000'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int a, b, c, m;
    scanf("%d %d %d", &a, &b, &c);
    m = a;
    if (b > m) m = b;
    if (c > m) m = c;
    printf("%d\n", m);
    return 0;
}`,
    tests: [{ input: '1 5 3' }, { input: '9 2 4' }, { input: '-5 -2 -9', hidden: true }, { input: '7 7 7', hidden: true }, { input: '2 3 8', hidden: true }],
  },
  {
    slug: 'leap-year',
    title: 'Leap Year',
    difficulty: 'Medium',
    description:
      'A year is a leap year if it is divisible by 4, except century years (divisible by 100), which must also be divisible by 400.\n\nInput: one integer `year`.\nOutput: `Leap Year` or `Not a Leap Year`.',
    constraints: ['1 <= year <= 9999'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int y;
    scanf("%d", &y);
    if ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0) printf("Leap Year\n");
    else printf("Not a Leap Year\n");
    return 0;
}`,
    tests: [{ input: '2024' }, { input: '2023' }, { input: '1900', hidden: true }, { input: '2000', hidden: true }, { input: '2100', hidden: true }, { input: '4', hidden: true }],
  },
  {
    slug: 'grade-from-marks',
    title: 'Grade from Marks',
    difficulty: 'Medium',
    description:
      'Convert marks out of 100 to a grade:\n- 90 to 100: `A`\n- 80 to 89: `B`\n- 70 to 79: `C`\n- 60 to 69: `D`\n- 40 to 59: `E`\n- below 40: `F`\n\nInput: one integer `marks`.\nOutput: the grade letter.',
    constraints: ['0 <= marks <= 100'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int m;
    scanf("%d", &m);
    if (m >= 90) printf("A\n");
    else if (m >= 80) printf("B\n");
    else if (m >= 70) printf("C\n");
    else if (m >= 60) printf("D\n");
    else if (m >= 40) printf("E\n");
    else printf("F\n");
    return 0;
}`,
    tests: [{ input: '95' }, { input: '72' }, { input: '40' }, { input: '90', hidden: true }, { input: '89', hidden: true }, { input: '39', hidden: true }],
  },
  {
    slug: 'movie-ticket-price',
    title: 'Movie Ticket Price',
    difficulty: 'Medium',
    description:
      'Ticket price depends on age: age 12 or below pays 50, age 60 or above pays 80, everyone else pays 120. On weekends (flag = 1) add a surcharge of 20 to the price.\n\nInput: two integers `age` and `weekend` (0 for weekday, 1 for weekend).\nOutput: the final price as an integer.',
    constraints: ['0 <= age <= 120', 'weekend is 0 or 1'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int age, w, p;
    scanf("%d %d", &age, &w);
    if (age <= 12) p = 50;
    else if (age >= 60) p = 80;
    else p = 120;
    if (w == 1) p += 20;
    printf("%d\n", p);
    return 0;
}`,
    tests: [{ input: '10 0' }, { input: '30 1' }, { input: '65 0' }, { input: '12 1', hidden: true }, { input: '13 0', hidden: true }, { input: '60 1', hidden: true }, { input: '59 0', hidden: true }],
  },
  {
    slug: 'quadratic-roots-nature',
    title: 'Nature of Quadratic Roots',
    difficulty: 'Medium',
    description:
      'For `a*x^2 + b*x + c = 0` compute the discriminant `d = b*b - 4*a*c`.\nIf `d > 0` the roots are real and different, if `d == 0` they are real and equal, otherwise they are complex.\n\nInput: three integers `a b c` (a is not 0).\nOutput: `Real and Different`, `Real and Equal` or `Complex`.',
    constraints: ['-1000 <= a, b, c <= 1000', 'a != 0'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    long long a, b, c, d;
    scanf("%lld %lld %lld", &a, &b, &c);
    d = b * b - 4 * a * c;
    if (d > 0) printf("Real and Different\n");
    else if (d == 0) printf("Real and Equal\n");
    else printf("Complex\n");
    return 0;
}`,
    tests: [{ input: '1 -3 2' }, { input: '1 2 1' }, { input: '1 1 1' }, { input: '-1 0 4', hidden: true }, { input: '2 4 2', hidden: true }, { input: '1 0 1', hidden: true }],
  },
  {
    slug: 'electricity-bill',
    title: 'Electricity Bill',
    difficulty: 'Medium',
    description:
      'An electricity bill is charged by slabs: the first 100 units cost 2 each, units 101 to 200 cost 3 each, and every unit above 200 costs 5 each.\n\nInput: one integer `units`.\nOutput: the total bill as an integer.',
    constraints: ['0 <= units <= 10000'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int u, bill;
    scanf("%d", &u);
    if (u <= 100) bill = u * 2;
    else if (u <= 200) bill = 200 + (u - 100) * 3;
    else bill = 200 + 300 + (u - 200) * 5;
    printf("%d\n", bill);
    return 0;
}`,
    tests: [{ input: '50' }, { input: '150' }, { input: '250' }, { input: '0', hidden: true }, { input: '100', hidden: true }, { input: '200', hidden: true }, { input: '10000', hidden: true }],
  },
  {
    slug: 'middle-of-three',
    title: 'Middle of Three Numbers',
    difficulty: 'Medium',
    description:
      'Print the middle value (the median) of three integers: the one that is neither the largest nor the smallest. If values repeat, print the value that sits in the middle when sorted.\n\nInput: three integers `a b c`.\nOutput: the middle value.',
    constraints: ['-1000000 <= a, b, c <= 1000000'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int a, b, c, m;
    scanf("%d %d %d", &a, &b, &c);
    if ((a >= b && a <= c) || (a <= b && a >= c)) m = a;
    else if ((b >= a && b <= c) || (b <= a && b >= c)) m = b;
    else m = c;
    printf("%d\n", m);
    return 0;
}`,
    tests: [{ input: '3 1 2' }, { input: '10 20 30' }, { input: '5 5 1', hidden: true }, { input: '-4 -9 7', hidden: true }, { input: '8 8 8', hidden: true }, { input: '9 1 5', hidden: true }],
  },
  {
    slug: 'quadrant-of-point',
    title: 'Quadrant of a Point',
    difficulty: 'Medium',
    description:
      'Given a point (x, y), print where it lies: `Origin` if both are 0, `X-axis` if only y is 0, `Y-axis` if only x is 0, otherwise `Quadrant 1`, `Quadrant 2`, `Quadrant 3` or `Quadrant 4` (Q1: x>0,y>0; Q2: x<0,y>0; Q3: x<0,y<0; Q4: x>0,y<0).\n\nInput: two integers `x y`.\nOutput: the location exactly as written above.',
    constraints: ['-1000 <= x, y <= 1000'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int x, y;
    scanf("%d %d", &x, &y);
    if (x == 0 && y == 0) printf("Origin\n");
    else if (y == 0) printf("X-axis\n");
    else if (x == 0) printf("Y-axis\n");
    else if (x > 0 && y > 0) printf("Quadrant 1\n");
    else if (x < 0 && y > 0) printf("Quadrant 2\n");
    else if (x < 0 && y < 0) printf("Quadrant 3\n");
    else printf("Quadrant 4\n");
    return 0;
}`,
    tests: [{ input: '3 4' }, { input: '-2 5' }, { input: '0 0' }, { input: '-1 -1', hidden: true }, { input: '6 -7', hidden: true }, { input: '5 0', hidden: true }, { input: '0 -3', hidden: true }],
  },
  {
    slug: 'valid-date',
    title: 'Valid Date Check',
    difficulty: 'Hard',
    description:
      'Check whether a date is valid in the Gregorian calendar. Months have 31, 30 days as usual; February has 29 days in a leap year (divisible by 4, except centuries not divisible by 400) and 28 otherwise.\n\nInput: three integers `day month year`.\nOutput: `Valid` or `Invalid`.',
    constraints: ['1 <= year <= 9999', '0 <= day <= 40', '0 <= month <= 15'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int d, m, y, max;
    scanf("%d %d %d", &d, &m, &y);
    if (m < 1 || m > 12) { printf("Invalid\n"); return 0; }
    if (m == 4 || m == 6 || m == 9 || m == 11) max = 30;
    else if (m == 2) {
        if ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0) max = 29;
        else max = 28;
    } else max = 31;
    if (d >= 1 && d <= max) printf("Valid\n");
    else printf("Invalid\n");
    return 0;
}`,
    tests: [{ input: '15 8 2024' }, { input: '31 4 2023' }, { input: '29 2 2024' }, { input: '29 2 1900', hidden: true }, { input: '29 2 2000', hidden: true }, { input: '31 12 2023', hidden: true }, { input: '10 13 2020', hidden: true }, { input: '0 5 2020', hidden: true }],
  },
  {
    slug: 'day-number-in-year',
    title: 'Day Number in the Year',
    difficulty: 'Hard',
    description:
      'Given a valid date, print which day of the year it is (1 January is day 1). Remember that February has 29 days in a leap year (divisible by 4, except centuries not divisible by 400).\n\nInput: three integers `day month year` (always a valid date).\nOutput: the day number.',
    constraints: ['1 <= year <= 9999', 'The date is valid'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int d, m, y, leap, n;
    scanf("%d %d %d", &d, &m, &y);
    leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
    int days[12] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    if (leap) days[1] = 29;
    n = d;
    for (int i = 0; i < m - 1; i++) n += days[i];
    printf("%d\n", n);
    return 0;
}`,
    tests: [{ input: '1 1 2023' }, { input: '1 3 2024' }, { input: '1 3 2023' }, { input: '31 12 2023', hidden: true }, { input: '31 12 2024', hidden: true }, { input: '29 2 2000', hidden: true }, { input: '1 3 1900', hidden: true }],
  },
  {
    slug: 'triangle-full-classification',
    title: 'Triangle Classification',
    difficulty: 'Hard',
    description:
      'Given three side lengths, first check if they form a triangle (each side must be smaller than the sum of the other two). If not, print `Not a triangle`.\nOtherwise print two words: the type by sides (`Equilateral`, `Isosceles` or `Scalene`), then the type by angle (`Right`, `Acute` or `Obtuse`). Let `c` be the longest side: Right if `a*a+b*b == c*c`, Acute if smaller, Obtuse if greater.\n\nInput: three positive integers `a b c`.\nOutput: `Not a triangle`, or the two words separated by a single space, e.g. `Scalene Right`.',
    constraints: ['1 <= a, b, c <= 10000'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    long long a, b, c, t;
    scanf("%lld %lld %lld", &a, &b, &c);
    if (a >= b + c || b >= a + c || c >= a + b) { printf("Not a triangle\n"); return 0; }
    long long s1 = a, s2 = b, s3 = c;
    if (s1 > s3) { t = s1; s1 = s3; s3 = t; }
    if (s2 > s3) { t = s2; s2 = s3; s3 = t; }
    if (a == b && b == c) printf("Equilateral ");
    else if (a == b || b == c || a == c) printf("Isosceles ");
    else printf("Scalene ");
    long long l = s1 * s1 + s2 * s2, r = s3 * s3;
    if (l == r) printf("Right\n");
    else if (l > r) printf("Acute\n");
    else printf("Obtuse\n");
    return 0;
}`,
    tests: [{ input: '3 4 5' }, { input: '5 5 5' }, { input: '1 2 3' }, { input: '5 5 8', hidden: true }, { input: '2 3 4', hidden: true }, { input: '6 6 7', hidden: true }, { input: '5 12 13', hidden: true }, { input: '10 1 1', hidden: true }],
  },
];
