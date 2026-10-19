export default [
  {
    slug: 'day-of-the-week',
    title: 'Day of the Week',
    difficulty: 'Easy',
    description:
      'Read a number from 1 to 7 and print the matching day name using a `switch` statement (1 = Monday ... 7 = Sunday).\n\nFor any other number, print `Invalid`.\n\nInput: one integer `n`.\nOutput: the day name (e.g. `Wednesday`) or `Invalid`.',
    constraints: ['-100 <= n <= 100'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int n;
    scanf("%d", &n);
    switch (n) {
        case 1: printf("Monday\n"); break;
        case 2: printf("Tuesday\n"); break;
        case 3: printf("Wednesday\n"); break;
        case 4: printf("Thursday\n"); break;
        case 5: printf("Friday\n"); break;
        case 6: printf("Saturday\n"); break;
        case 7: printf("Sunday\n"); break;
        default: printf("Invalid\n");
    }
    return 0;
}`,
    tests: [{ input: '3' }, { input: '1' }, { input: '7', hidden: true }, { input: '9', hidden: true }, { input: '0', hidden: true }, { input: '-5', hidden: true }],
  },
  {
    slug: 'vowel-or-consonant',
    title: 'Vowel or Consonant',
    difficulty: 'Easy',
    description:
      'Read a letter and say whether it is a vowel (a, e, i, o, u in either case) or a consonant. Use `switch` with grouped cases.\n\nInput: one alphabetic character (read with `scanf(" %c", &ch)`).\nOutput: `Vowel` or `Consonant`.',
    constraints: ['The input is an English letter'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    char c;
    scanf(" %c", &c);
    switch (c) {
        case 'a': case 'e': case 'i': case 'o': case 'u':
        case 'A': case 'E': case 'I': case 'O': case 'U':
            printf("Vowel\n"); break;
        default:
            printf("Consonant\n");
    }
    return 0;
}`,
    tests: [{ input: 'e' }, { input: 'k' }, { input: 'U', hidden: true }, { input: 'Z', hidden: true }, { input: 'a', hidden: true }, { input: 'y', hidden: true }],
  },
  {
    slug: 'month-name',
    title: 'Month Name',
    difficulty: 'Easy',
    description:
      'Read a month number (1 to 12) and print its name (`January`, `February`, ... `December`). Print `Invalid` for any other number.\n\nInput: one integer `m`.\nOutput: the month name or `Invalid`.',
    constraints: ['-100 <= m <= 100'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int m;
    scanf("%d", &m);
    switch (m) {
        case 1: printf("January\n"); break;
        case 2: printf("February\n"); break;
        case 3: printf("March\n"); break;
        case 4: printf("April\n"); break;
        case 5: printf("May\n"); break;
        case 6: printf("June\n"); break;
        case 7: printf("July\n"); break;
        case 8: printf("August\n"); break;
        case 9: printf("September\n"); break;
        case 10: printf("October\n"); break;
        case 11: printf("November\n"); break;
        case 12: printf("December\n"); break;
        default: printf("Invalid\n");
    }
    return 0;
}`,
    tests: [{ input: '5' }, { input: '12' }, { input: '1', hidden: true }, { input: '13', hidden: true }, { input: '0', hidden: true }, { input: '10', hidden: true }],
  },
  {
    slug: 'simple-calculator',
    title: 'Simple Calculator',
    difficulty: 'Easy',
    description:
      'Read two integers and an operator (`+`, `-`, `*`, `/`) and print the result. `/` is integer division. If the operator is `/` and the second number is 0, print `Error`. For any other operator, print `Invalid`.\n\nInput: `a op b` separated by spaces (read the operator with `scanf(" %c", &op)`).\nOutput: the integer result, `Error` or `Invalid`.',
    constraints: ['-10000 <= a, b <= 10000'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int a, b;
    char op;
    scanf("%d %c %d", &a, &op, &b);
    switch (op) {
        case '+': printf("%d\n", a + b); break;
        case '-': printf("%d\n", a - b); break;
        case '*': printf("%d\n", a * b); break;
        case '/':
            if (b == 0) printf("Error\n");
            else printf("%d\n", a / b);
            break;
        default: printf("Invalid\n");
    }
    return 0;
}`,
    tests: [{ input: '8 + 5' }, { input: '9 / 2' }, { input: '4 / 0', hidden: true }, { input: '6 % 4', hidden: true }, { input: '-3 * 7', hidden: true }, { input: '2 - 10', hidden: true }],
  },
  {
    slug: 'traffic-light',
    title: 'Traffic Light',
    difficulty: 'Easy',
    description:
      'Read a traffic light colour letter: `R` prints `Stop`, `Y` prints `Wait`, `G` prints `Go`. Any other letter prints `Invalid`.\n\nInput: one character (read with `scanf(" %c", &ch)`).\nOutput: `Stop`, `Wait`, `Go` or `Invalid`.',
    constraints: ['The input is a single uppercase or lowercase letter'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    char c;
    scanf(" %c", &c);
    switch (c) {
        case 'R': printf("Stop\n"); break;
        case 'Y': printf("Wait\n"); break;
        case 'G': printf("Go\n"); break;
        default: printf("Invalid\n");
    }
    return 0;
}`,
    tests: [{ input: 'R' }, { input: 'G' }, { input: 'Y', hidden: true }, { input: 'B', hidden: true }, { input: 'r', hidden: true }],
  },
  {
    slug: 'grade-remark',
    title: 'Grade Remark',
    difficulty: 'Easy',
    description:
      'Print a remark for a grade letter: `A` -> `Excellent`, `B` -> `Good`, `C` -> `Average`, `D` -> `Poor`, `F` -> `Fail`. Any other character prints `Invalid`.\n\nInput: one character (read with `scanf(" %c", &g)`).\nOutput: the remark.',
    constraints: ['The input is a single letter'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    char g;
    scanf(" %c", &g);
    switch (g) {
        case 'A': printf("Excellent\n"); break;
        case 'B': printf("Good\n"); break;
        case 'C': printf("Average\n"); break;
        case 'D': printf("Poor\n"); break;
        case 'F': printf("Fail\n"); break;
        default: printf("Invalid\n");
    }
    return 0;
}`,
    tests: [{ input: 'A' }, { input: 'C' }, { input: 'F', hidden: true }, { input: 'E', hidden: true }, { input: 'b', hidden: true }, { input: 'D', hidden: true }],
  },
  {
    slug: 'days-in-month',
    title: 'Days in a Month',
    difficulty: 'Easy',
    description:
      'Given a month number (1-12) print how many days it has, treating February as having 28 days. Use grouped `case` labels. Print `Invalid` for other numbers.\n\nInput: one integer `m`.\nOutput: the number of days, or `Invalid`.',
    constraints: ['-100 <= m <= 100'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int m;
    scanf("%d", &m);
    switch (m) {
        case 1: case 3: case 5: case 7: case 8: case 10: case 12:
            printf("31\n"); break;
        case 4: case 6: case 9: case 11:
            printf("30\n"); break;
        case 2:
            printf("28\n"); break;
        default:
            printf("Invalid\n");
    }
    return 0;
}`,
    tests: [{ input: '1' }, { input: '4' }, { input: '2', hidden: true }, { input: '12', hidden: true }, { input: '0', hidden: true }, { input: '13', hidden: true }],
  },
  {
    slug: 'digit-to-word',
    title: 'Digit to Word',
    difficulty: 'Easy',
    description:
      'Read a single digit (0-9) and print it in words in lowercase: `zero`, `one`, ... `nine`. If the number is outside 0-9, print `invalid`.\n\nInput: one integer `d`.\nOutput: the word.',
    constraints: ['-100 <= d <= 100'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int d;
    scanf("%d", &d);
    switch (d) {
        case 0: printf("zero\n"); break;
        case 1: printf("one\n"); break;
        case 2: printf("two\n"); break;
        case 3: printf("three\n"); break;
        case 4: printf("four\n"); break;
        case 5: printf("five\n"); break;
        case 6: printf("six\n"); break;
        case 7: printf("seven\n"); break;
        case 8: printf("eight\n"); break;
        case 9: printf("nine\n"); break;
        default: printf("invalid\n");
    }
    return 0;
}`,
    tests: [{ input: '4' }, { input: '0' }, { input: '9', hidden: true }, { input: '10', hidden: true }, { input: '-1', hidden: true }],
  },
  {
    slug: 'weekday-or-weekend',
    title: 'Weekday or Weekend',
    difficulty: 'Easy',
    description:
      'Read a day number (1 = Monday ... 7 = Sunday). Print `Weekend` for 6 and 7, `Weekday` for 1 to 5, and `Invalid` otherwise. Use fall-through case labels.\n\nInput: one integer `n`.\nOutput: `Weekday`, `Weekend` or `Invalid`.',
    constraints: ['-100 <= n <= 100'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int n;
    scanf("%d", &n);
    switch (n) {
        case 1: case 2: case 3: case 4: case 5:
            printf("Weekday\n"); break;
        case 6: case 7:
            printf("Weekend\n"); break;
        default:
            printf("Invalid\n");
    }
    return 0;
}`,
    tests: [{ input: '2' }, { input: '6' }, { input: '5', hidden: true }, { input: '7', hidden: true }, { input: '8', hidden: true }, { input: '0', hidden: true }],
  },
  {
    slug: 'compass-direction',
    title: 'Compass Direction',
    difficulty: 'Easy',
    description:
      'Read a direction letter and print its name: `N` -> `North`, `S` -> `South`, `E` -> `East`, `W` -> `West`. Accept both uppercase and lowercase. Otherwise print `Unknown`.\n\nInput: one character (read with `scanf(" %c", &ch)`).\nOutput: the direction name or `Unknown`.',
    constraints: ['The input is a single letter'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    char c;
    scanf(" %c", &c);
    switch (c) {
        case 'N': case 'n': printf("North\n"); break;
        case 'S': case 's': printf("South\n"); break;
        case 'E': case 'e': printf("East\n"); break;
        case 'W': case 'w': printf("West\n"); break;
        default: printf("Unknown\n");
    }
    return 0;
}`,
    tests: [{ input: 'N' }, { input: 'w' }, { input: 'S', hidden: true }, { input: 'e', hidden: true }, { input: 'X', hidden: true }],
  },
  {
    slug: 'quarter-of-year',
    title: 'Quarter of the Year',
    difficulty: 'Medium',
    description:
      'Months 1-3 are quarter 1, 4-6 quarter 2, 7-9 quarter 3, and 10-12 quarter 4. Given a month number, print `Q1`, `Q2`, `Q3` or `Q4`. Print `Invalid` for other numbers.\n\nHint: you can use `switch (m)` with grouped cases, or `switch ((m - 1) / 3)` for numbers 1-12.\n\nInput: one integer `m`.\nOutput: the quarter or `Invalid`.',
    constraints: ['-100 <= m <= 100'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int m;
    scanf("%d", &m);
    if (m < 1 || m > 12) { printf("Invalid\n"); return 0; }
    switch ((m - 1) / 3) {
        case 0: printf("Q1\n"); break;
        case 1: printf("Q2\n"); break;
        case 2: printf("Q3\n"); break;
        default: printf("Q4\n");
    }
    return 0;
}`,
    tests: [{ input: '2' }, { input: '8' }, { input: '3', hidden: true }, { input: '4', hidden: true }, { input: '12', hidden: true }, { input: '0', hidden: true }, { input: '13', hidden: true }],
  },
  {
    slug: 'restaurant-bill',
    title: 'Restaurant Bill',
    difficulty: 'Medium',
    description:
      'A menu has: 1 = Burger (80), 2 = Pizza (150), 3 = Pasta (120), 4 = Coffee (40). Given an item number and a quantity, print the total cost. For an item number not on the menu, print `Invalid item`.\n\nInput: two integers `item quantity`.\nOutput: the total cost as an integer, or `Invalid item`.',
    constraints: ['-10 <= item <= 10', '1 <= quantity <= 100'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int item, q, price;
    scanf("%d %d", &item, &q);
    switch (item) {
        case 1: price = 80; break;
        case 2: price = 150; break;
        case 3: price = 120; break;
        case 4: price = 40; break;
        default: printf("Invalid item\n"); return 0;
    }
    printf("%d\n", price * q);
    return 0;
}`,
    tests: [{ input: '1 3' }, { input: '4 2' }, { input: '2 1' }, { input: '3 100', hidden: true }, { input: '5 2', hidden: true }, { input: '0 1', hidden: true }],
  },
  {
    slug: 'days-in-month-with-leap-year',
    title: 'Days in Month (Leap Year Aware)',
    difficulty: 'Medium',
    description:
      'Given a month and a year, print the number of days in that month. February has 29 days in a leap year (divisible by 4, except centuries not divisible by 400), otherwise 28. If the month is not 1-12 print `Invalid`.\n\nInput: two integers `month year`.\nOutput: the number of days or `Invalid`.',
    constraints: ['-5 <= month <= 20', '1 <= year <= 9999'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int m, y;
    scanf("%d %d", &m, &y);
    switch (m) {
        case 1: case 3: case 5: case 7: case 8: case 10: case 12:
            printf("31\n"); break;
        case 4: case 6: case 9: case 11:
            printf("30\n"); break;
        case 2:
            if ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0) printf("29\n");
            else printf("28\n");
            break;
        default:
            printf("Invalid\n");
    }
    return 0;
}`,
    tests: [{ input: '2 2024' }, { input: '2 2023' }, { input: '7 2020' }, { input: '2 1900', hidden: true }, { input: '2 2000', hidden: true }, { input: '11 2021', hidden: true }, { input: '14 2021', hidden: true }],
  },
  {
    slug: 'unit-converter',
    title: 'Unit Converter',
    difficulty: 'Medium',
    description:
      'Convert a whole number value using a menu choice: 1 = kilometres to metres (x 1000), 2 = hours to minutes (x 60), 3 = kilograms to grams (x 1000), 4 = days to hours (x 24). For any other choice print `Invalid`.\n\nInput: two integers `choice value`.\nOutput: the converted integer or `Invalid`.',
    constraints: ['-10 <= choice <= 10', '0 <= value <= 100000'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int c;
    long long v;
    scanf("%d %lld", &c, &v);
    switch (c) {
        case 1: case 3: printf("%lld\n", v * 1000); break;
        case 2: printf("%lld\n", v * 60); break;
        case 4: printf("%lld\n", v * 24); break;
        default: printf("Invalid\n");
    }
    return 0;
}`,
    tests: [{ input: '1 5' }, { input: '2 3' }, { input: '4 10' }, { input: '3 100000', hidden: true }, { input: '5 7', hidden: true }, { input: '2 0', hidden: true }],
  },
  {
    slug: 'shape-area',
    title: 'Area of a Shape',
    difficulty: 'Medium',
    description:
      'Choose a shape by code and print its area with exactly 2 digits after the decimal point.\n- 1 = circle, input one integer radius `r`, area = 3.14159 * r * r\n- 2 = rectangle, input `length width`, area = length * width\n- 3 = triangle, input `base height`, area = 0.5 * base * height\nFor any other code print `Invalid`.\n\nInput: the code on the first line, then the needed integers on the next line.\nOutput: the area formatted like `78.54`, or `Invalid`.',
    constraints: ['1 <= each dimension <= 1000', 'code is between -10 and 10'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int code, a, b;
    scanf("%d", &code);
    switch (code) {
        case 1:
            scanf("%d", &a);
            printf("%.2f\n", 3.14159 * a * a);
            break;
        case 2:
            scanf("%d %d", &a, &b);
            printf("%.2f\n", (double)a * b);
            break;
        case 3:
            scanf("%d %d", &a, &b);
            printf("%.2f\n", 0.5 * a * b);
            break;
        default:
            printf("Invalid\n");
    }
    return 0;
}`,
    tests: [{ input: '1\n5' }, { input: '2\n4 6' }, { input: '3\n5 3' }, { input: '3\n7 7', hidden: true }, { input: '1\n1000', hidden: true }, { input: '9', hidden: true }],
  },
  {
    slug: 'shipping-cost',
    title: 'Shipping Cost',
    difficulty: 'Medium',
    description:
      'Shipping has a base cost by zone: zone 1 = 50, zone 2 = 80, zone 3 = 120. Every kilogram above 5 kg costs an extra 10 (zone 1), 15 (zone 2) or 20 (zone 3). Print the total cost. For any other zone print `Invalid zone`.\n\nInput: two integers `zone weight` (weight in whole kg).\nOutput: the total cost as an integer, or `Invalid zone`.',
    constraints: ['-5 <= zone <= 10', '1 <= weight <= 1000'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int z, w, base, extra;
    scanf("%d %d", &z, &w);
    switch (z) {
        case 1: base = 50; extra = 10; break;
        case 2: base = 80; extra = 15; break;
        case 3: base = 120; extra = 20; break;
        default: printf("Invalid zone\n"); return 0;
    }
    int cost = base;
    if (w > 5) cost += (w - 5) * extra;
    printf("%d\n", cost);
    return 0;
}`,
    tests: [{ input: '1 3' }, { input: '2 10' }, { input: '3 5' }, { input: '3 6', hidden: true }, { input: '4 2', hidden: true }, { input: '1 1000', hidden: true }],
  },
  {
    slug: 'operation-chain',
    title: 'Operation Chain',
    difficulty: 'Medium',
    description:
      'Start with the value 0. Read `n` operations; each is an operator character and an integer: `+ x` adds x, `- x` subtracts x, `* x` multiplies by x, `/ x` divides by x using integer division (skip the operation if x is 0), and any other operator is ignored. Print the final value.\n\nInput: first `n`, then `n` lines each with `op x` (read op with `scanf(" %c", &op)`).\nOutput: the final integer value.',
    constraints: ['1 <= n <= 20', '-100 <= x <= 100', 'Intermediate values fit in a 64-bit integer'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int n;
    long long v = 0, x;
    char op;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf(" %c %lld", &op, &x);
        switch (op) {
            case '+': v += x; break;
            case '-': v -= x; break;
            case '*': v *= x; break;
            case '/': if (x != 0) v /= x; break;
            default: break;
        }
    }
    printf("%lld\n", v);
    return 0;
}`,
    tests: [{ input: '3\n+ 10\n* 3\n- 5' }, { input: '4\n+ 7\n/ 2\n* 5\n+ 1' }, { input: '3\n+ 9\n/ 0\n% 4', hidden: true }, { input: '2\n- 7\n/ 2', hidden: true }, { input: '1\n* 5', hidden: true }],
  },
  {
    slug: 'atm-menu-simulation',
    title: 'ATM Menu Simulation',
    difficulty: 'Hard',
    description:
      'Simulate a simple ATM. Start with a balance read from input. Then read commands until the command `Q`:\n- `D x`: deposit `x` (balance += x)\n- `W x`: withdraw `x`; if `x` is more than the balance print `Insufficient` and leave the balance unchanged\n- `B`: print the current balance\n- `Q`: quit\n- any other letter: print `Invalid`\nPrint every message on its own line.\n\nInput: the starting balance, then commands (each read with `scanf(" %c", &cmd)`, followed by an integer for `D` and `W`). The last command is always `Q`.\nOutput: one line for each `B`, failed `W`, or invalid command.',
    constraints: ['0 <= balance <= 1000000', '0 <= x <= 1000000', 'At most 50 commands'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    long long bal, x;
    char c;
    scanf("%lld", &bal);
    while (scanf(" %c", &c) == 1 && c != 'Q') {
        switch (c) {
            case 'D':
                scanf("%lld", &x);
                bal += x;
                break;
            case 'W':
                scanf("%lld", &x);
                if (x > bal) printf("Insufficient\n");
                else bal -= x;
                break;
            case 'B':
                printf("%lld\n", bal);
                break;
            default:
                printf("Invalid\n");
        }
    }
    return 0;
}`,
    tests: [{ input: '1000\nB\nQ' }, { input: '500\nD 200\nW 100\nB\nQ' }, { input: '100\nW 150\nB\nQ' }, { input: '0\nX\nD 50\nW 50\nB\nQ', hidden: true }, { input: '100\nW 100\nB\nW 1\nQ', hidden: true }, { input: '5\nB\nZ\nQ', hidden: true }],
  },
  {
    slug: 'next-date',
    title: 'Next Date',
    difficulty: 'Hard',
    description:
      'Given a valid date, print the date of the next day. Handle month ends, year ends and leap-year February (29 days when the year is divisible by 4, except centuries not divisible by 400). Use a `switch` on the month to find its length.\n\nInput: three integers `day month year`.\nOutput: the next date as `day month year` separated by single spaces.',
    constraints: ['The input date is valid', '1 <= year <= 9998'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int d, m, y, max;
    scanf("%d %d %d", &d, &m, &y);
    switch (m) {
        case 4: case 6: case 9: case 11: max = 30; break;
        case 2:
            max = ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0) ? 29 : 28;
            break;
        default: max = 31;
    }
    d++;
    if (d > max) {
        d = 1;
        m++;
        if (m > 12) { m = 1; y++; }
    }
    printf("%d %d %d\n", d, m, y);
    return 0;
}`,
    tests: [{ input: '15 8 2024' }, { input: '31 12 2023' }, { input: '28 2 2023' }, { input: '28 2 2024', hidden: true }, { input: '29 2 2024', hidden: true }, { input: '28 2 1900', hidden: true }, { input: '30 4 2022', hidden: true }, { input: '29 2 2000', hidden: true }],
  },
  {
    slug: 'robot-commands',
    title: 'Robot Commands',
    difficulty: 'Hard',
    description:
      'A robot starts at (0, 0) facing North (North is +y, East is +x). Read command letters until `X`:\n- `F`: move one step forward in the facing direction\n- `B`: move one step backward\n- `L`: turn 90 degrees left\n- `R`: turn 90 degrees right\n- any other letter is ignored\nPrint the final position and facing direction.\n\nInput: a single string of uppercase letters, ending with `X` (read letters one by one with `scanf(" %c", &c)`).\nOutput: `x y Direction`, where Direction is `North`, `East`, `South` or `West`.',
    constraints: ['At most 100 commands before X'],
    solution: String.raw`#include <stdio.h>
int main(void) {
    int x = 0, y = 0, dir = 0;
    char c;
    while (scanf(" %c", &c) == 1 && c != 'X') {
        int s = 0;
        switch (c) {
            case 'F': s = 1; break;
            case 'B': s = -1; break;
            case 'L': dir = (dir + 3) % 4; break;
            case 'R': dir = (dir + 1) % 4; break;
            default: break;
        }
        if (s != 0) {
            switch (dir) {
                case 0: y += s; break;
                case 1: x += s; break;
                case 2: y -= s; break;
                default: x -= s;
            }
        }
    }
    const char *names[4] = {"North", "East", "South", "West"};
    printf("%d %d %s\n", x, y, names[dir]);
    return 0;
}`,
    tests: [{ input: 'FFRFFX' }, { input: 'X' }, { input: 'LFFBX' }, { input: 'RRFFFX', hidden: true }, { input: 'LLLLFZFRBBX', hidden: true }, { input: 'RFRFRFRFX', hidden: true }],
  },
];
