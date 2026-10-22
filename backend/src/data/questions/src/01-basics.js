const q = (slug, title, difficulty, description, constraints, solution, inputs) => ({
  slug,
  title,
  difficulty,
  description: description.replace(/\n\nHint: [\s\S]*?(?=\n\n(?:Input|Output)\n)/, ''),
  hint: hints[slug],
  solutionNotes: solutionNotes[slug],
  constraints,
  solution: workedSolutions[slug] || solution,
  tests: inputs.map((input, i) => (i >= 2 && i >= inputs.length - 3 ? { input, hidden: true } : { input })),
});
const H = '#include <stdio.h>\n';
const workedSolutions = {
  'hello-world': `#include <stdio.h>

int main(void) {
    printf("Hello, World!\\n");
    return 0;
}`,
  'print-two-lines': `#include <stdio.h>

int main(void) {
    printf("Learning C\\nis fun!\\n");
    return 0;
}`,
  'sum-of-two-integers': `#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\\n", a + b);
    return 0;
}`,
  'echo-an-integer': `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    printf("You entered: %d\\n", n);
    return 0;
}`,
  'difference-of-two-numbers': `#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\\n", a - b);
    return 0;
}`,
  'print-a-star-box': `#include <stdio.h>

int main(void) {
    for (int row = 0; row < 3; row++) {
        printf("*****\\n");
    }
    return 0;
}`,
  'greet-by-name': `#include <stdio.h>

int main(void) {
    char name[50];
    scanf("%49s", name);
    printf("Hello, %s!\\n", name);
    return 0;
}`,
  'print-character-twice': `#include <stdio.h>

int main(void) {
    char character;
    scanf(" %c", &character);
    printf("%c%c\\n", character, character);
    return 0;
}`,
  'product-of-three-numbers': `#include <stdio.h>

int main(void) {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    printf("%d\\n", a * b * c);
    return 0;
}`,
  'reverse-two-numbers': `#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d %d\\n", b, a);
    return 0;
}`,
  'average-of-three-numbers': `#include <stdio.h>

int main(void) {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    printf("%.2f\\n", (a + b + c) / 3.0);
    return 0;
}`,
  'right-triangle-of-stars': `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);

    for (int row = 1; row <= n; row++) {
        for (int column = 0; column < row; column++) {
            putchar('*');
        }
        putchar('\\n');
    }

    return 0;
}`,
  'seconds-to-hours-minutes-seconds': `#include <stdio.h>

int main(void) {
    int seconds;
    scanf("%d", &seconds);

    int hours = seconds / 3600;
    int minutes = seconds % 3600 / 60;
    int remainingSeconds = seconds % 60;

    printf("%d hours %d minutes %d seconds\\n",
           hours, minutes, remainingSeconds);
    return 0;
}`,
  'sum-of-digits-of-three-digit-number': `#include <stdio.h>

int main(void) {
    int number;
    scanf("%d", &number);

    int hundreds = number / 100;
    int tens = number / 10 % 10;
    int ones = number % 10;

    printf("%d\\n", hundreds + tens + ones);
    return 0;
}`,
  'ascii-code-of-character': `#include <stdio.h>

int main(void) {
    char character;
    scanf(" %c", &character);

    printf("%d\\n", character);
    printf("%c\\n", character + 1);
    return 0;
}`,
  'print-simple-receipt': `#include <stdio.h>

int main(void) {
    int price, quantity;
    scanf("%d %d", &price, &quantity);

    int total = price * quantity;
    printf("Price: %d\\n", price);
    printf("Quantity: %d\\n", quantity);
    printf("Total: %d\\n", total);
    return 0;
}`,
  'echo-a-full-line': `#include <stdio.h>
#include <string.h>

int main(void) {
    char line[200];
    if (!fgets(line, sizeof line, stdin)) {
        return 0;
    }

    line[strcspn(line, "\\r\\n")] = '\\0';
    printf("<%s>\\n", line);
    return 0;
}`,
  'add-minutes-to-time': `#include <stdio.h>

int main(void) {
    int hour, minute, addedMinutes;
    scanf("%d %d %d", &hour, &minute, &addedMinutes);

    int totalMinutes = (hour * 60 + minute + addedMinutes) % 1440;
    int newHour = totalMinutes / 60;
    int newMinute = totalMinutes % 60;

    printf("%02d:%02d\\n", newHour, newMinute);
    return 0;
}`,
  'number-pyramid': `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);

    for (int row = 1; row <= n; row++) {
        for (int space = 0; space < n - row; space++) {
            putchar(' ');
        }
        for (int number = 1; number <= row; number++) {
            printf("%d", number);
        }
        for (int number = row - 1; number >= 1; number--) {
            printf("%d", number);
        }
        putchar('\\n');
    }

    return 0;
}`,
  'coin-change-count': `#include <stdio.h>

int main(void) {
    int amount;
    scanf("%d", &amount);

    int coins[] = {25, 10, 5, 1};
    int totalCoins = 0;

    for (int i = 0; i < 4; i++) {
        int count = amount / coins[i];
        amount %= coins[i];
        totalCoins += count;
        printf("%d: %d\\n", coins[i], count);
    }

    printf("Total: %d\\n", totalCoins);
    return 0;
}`,
};
const hints = {
  'hello-world': 'Use `printf` with a string literal. Include the newline in the printed text.',
  'print-two-lines': 'You can print both pieces in one `printf` using `\\n`, or use two print calls.',
  'sum-of-two-integers': 'Read both values with `scanf`, then add the two variables.',
  'echo-an-integer': 'Read one integer into a variable, then print the label and value with `%d`.',
  'difference-of-two-numbers': 'Keep the input order: subtract the second value from the first.',
  'print-a-star-box': 'Print the same five-star row three times; a short loop can repeat it.',
  'greet-by-name': 'Store the word in a character array, then use `%s` in your greeting.',
  'print-character-twice': 'Read one character with `%c` and pass it to two `%c` placeholders.',
  'product-of-three-numbers': 'Read three integers and multiply all three values together.',
  'reverse-two-numbers': 'Read both values, then print the second variable before the first.',
  'average-of-three-numbers': 'Add the values, divide by `3.0` to keep a fractional result, and format to two decimals.',
  'right-triangle-of-stars': 'Use an outer loop for rows and an inner loop that prints as many stars as the row number.',
  'seconds-to-hours-minutes-seconds': 'Extract hours with division by 3600; use remainders to get the remaining minutes and seconds.',
  'sum-of-digits-of-three-digit-number': 'Use division and remainder: hundreds are `n / 100`, tens are `n / 10 % 10`, and ones are `n % 10`.',
  'ascii-code-of-character': 'A `char` can be printed as a number with `%d`; adding one gives the next ASCII character.',
  'print-simple-receipt': 'Read price and quantity, calculate their product, then print each labeled line in the requested order.',
  'echo-a-full-line': '`fgets` reads spaces too. Remove its trailing newline before wrapping the text in angle brackets.',
  'add-minutes-to-time': 'Convert the time to total minutes, add the offset, wrap with `% 1440`, then split into hours and minutes.',
  'number-pyramid': 'For each row, print leading spaces, count upward from 1, then count back down to 1.',
  'coin-change-count': 'Process coin values from largest to smallest. For each value, use division for its count and remainder for what is left.',
};
const solutionNotes = {
  'hello-world': 'Include `stdio.h` for `printf`. Print the exact requested text and a newline with `\\n`.',
  'print-two-lines': 'A newline escape separates the two lines. Keep spelling, punctuation, and capitalization exact.',
  'sum-of-two-integers': 'Read both integers with `scanf`, add them, and print the sum followed by a newline.',
  'echo-an-integer': 'Read one integer into `n`, then use `%d` to insert it after the required label.',
  'difference-of-two-numbers': 'Read `a` and `b` in order. The requested result is `a - b`, not the reverse.',
  'print-a-star-box': 'The loop repeats the same five-star row three times, printing a newline after each row.',
  'greet-by-name': 'The character array stores the input word. `%s` prints it between the fixed greeting text.',
  'print-character-twice': 'The leading space in the `%c` scan format skips whitespace. Two `%c` placeholders print the character twice.',
  'product-of-three-numbers': 'Read all three integers and multiply them. The stated bounds keep the product within an `int`.',
  'reverse-two-numbers': 'Both inputs are read normally; the output format prints `b` first and `a` second.',
  'average-of-three-numbers': 'Adding the integers gives the numerator. Dividing by `3.0` performs floating-point division, and `%.2f` prints two decimal places.',
  'right-triangle-of-stars': 'The outer loop selects each row. The inner loop prints one star per row number, then a newline ends that row.',
  'seconds-to-hours-minutes-seconds': 'Integer division by 3600 gives hours. Remainders remove full hours and minutes to get each remaining part.',
  'sum-of-digits-of-three-digit-number': 'Integer division extracts the hundreds digit; `%` isolates the tens and ones digits. Add the three values.',
  'ascii-code-of-character': 'A character is promoted to an integer for `%d`. Adding one produces the next character for `%c`.',
  'print-simple-receipt': 'Multiply price by quantity for the total. Print all three lines with their exact labels and order.',
  'echo-a-full-line': '`fgets` reads spaces and the newline. `strcspn` finds the line ending so it can be removed before printing.',
  'add-minutes-to-time': 'Represent the time as minutes since midnight, add `k`, and wrap within a day using `% 1440`. Divide and take the remainder to format hours and minutes.',
  'number-pyramid': 'Each row starts with its padding, then prints an ascending sequence and a descending sequence without repeating the peak.',
  'coin-change-count': 'For each denomination, division gives how many coins fit. Keep the remainder for the next denomination and accumulate the total.',
};

export default [
  q('hello-world', 'Hello World', 'Easy',
    'Every C journey starts with a first program. Write a program that prints exactly `Hello, World!` followed by a new line.\n\nHint: use `printf()` from `<stdio.h>`.\n\nInput\nThe program takes no input.\n\nOutput\nPrint `Hello, World!` on one line.',
    ['The program takes no input.', 'Output must match exactly, including capitalization and punctuation.'],
    H + 'int main(void) { printf("Hello, World!\\n"); return 0; }', ['', '', '', '']),
  q('print-two-lines', 'Print Two Lines', 'Easy',
    'Print the text `Learning C` on the first line and `is fun!` on the second line.\n\nHint: `\\n` inside a string moves to a new line.\n\nInput\nNo input.\n\nOutput\nTwo lines exactly as described.',
    ['No input is given.'],
    H + 'int main(void) { printf("Learning C\\nis fun!\\n"); return 0; }', ['', '', '', '']),
  q('sum-of-two-integers', 'Sum of Two Integers', 'Easy',
    'Read two integers and print their sum.\n\nHint: use `scanf("%d", &a);` to read an integer.\n\nInput\nTwo integers separated by a space.\n\nOutput\nA single integer: their sum.',
    ['-10000 <= a, b <= 10000'],
    H + 'int main(void) { int a, b; scanf("%d %d", &a, &b); printf("%d\\n", a + b); return 0; }',
    ['3 5', '-4 10', '0 0', '-10000 -10000', '10000 10000']),
  q('echo-an-integer', 'Echo an Integer', 'Easy',
    'Read one integer and print it back as `You entered: N`, where N is the number.\n\nInput\nA single integer.\n\nOutput\nOne line: `You entered: ` followed by the integer.',
    ['-1000000 <= N <= 1000000'],
    H + 'int main(void) { int n; scanf("%d", &n); printf("You entered: %d\\n", n); return 0; }',
    ['42', '-7', '0', '1000000', '-1000000']),
  q('difference-of-two-numbers', 'Difference of Two Numbers', 'Easy',
    'Read two integers `a` and `b` and print `a - b`.\n\nInput\nTwo integers separated by a space.\n\nOutput\nOne integer: a minus b.',
    ['-100000 <= a, b <= 100000'],
    H + 'int main(void) { int a, b; scanf("%d %d", &a, &b); printf("%d\\n", a - b); return 0; }',
    ['10 3', '3 10', '0 0', '-100000 100000', '5 5']),
  q('print-a-star-box', 'Print a Star Box', 'Easy',
    'Print a box of stars with 3 rows and 5 columns.\n\nInput\nNo input.\n\nOutput\nThree lines, each containing `*****`.',
    ['No input is given.'],
    H + 'int main(void) { for (int i = 0; i < 3; i++) printf("*****\\n"); return 0; }', ['', '', '', '']),
  q('greet-by-name', 'Greet by Name', 'Easy',
    'Read a single word (a name without spaces) and print `Hello, NAME!`.\n\nHint: use `char name[50];` and `scanf("%s", name);`.\n\nInput\nOne word.\n\nOutput\nOne line: `Hello, ` followed by the name and `!`.',
    ['The name has 1 to 40 letters and no spaces.'],
    H + 'int main(void) { char name[50]; scanf("%49s", name); printf("Hello, %s!\\n", name); return 0; }',
    ['Alice', 'Bob', 'X', 'Bartholomew', 'Zed']),
  q('print-character-twice', 'Print a Character Twice', 'Easy',
    'Read one character and print it two times in a row on one line.\n\nHint: use `scanf(" %c", &ch);` (the space skips whitespace).\n\nInput\nOne character.\n\nOutput\nThe character repeated twice, e.g. `aa`.',
    ['The character is a letter or digit.'],
    H + 'int main(void) { char c; scanf(" %c", &c); printf("%c%c\\n", c, c); return 0; }',
    ['a', 'Z', '7', 'q', 'M']),
  q('product-of-three-numbers', 'Product of Three Numbers', 'Easy',
    'Read three integers and print their product.\n\nInput\nThree integers separated by spaces.\n\nOutput\nOne integer: the product.',
    ['-100 <= a, b, c <= 100'],
    H + 'int main(void) { int a, b, c; scanf("%d %d %d", &a, &b, &c); printf("%d\\n", a * b * c); return 0; }',
    ['2 3 4', '-1 5 2', '0 9 9', '100 100 100', '-100 100 -100']),
  q('reverse-two-numbers', 'Reverse Two Numbers', 'Easy',
    'Read two integers `a` and `b` and print them in the opposite order, separated by a single space.\n\nInput\nTwo integers separated by a space.\n\nOutput\nOne line: `b a`.',
    ['-1000 <= a, b <= 1000'],
    H + 'int main(void) { int a, b; scanf("%d %d", &a, &b); printf("%d %d\\n", b, a); return 0; }',
    ['1 2', '-5 8', '0 0', '1000 -1000', '7 7']),
  q('average-of-three-numbers', 'Average of Three Numbers', 'Medium',
    'Read three integers and print their average with exactly 2 digits after the decimal point.\n\nHint: divide by `3.0` so the division is not done on integers.\n\nInput\nThree integers separated by spaces.\n\nOutput\nThe average with exactly 2 decimals.',
    ['-1000 <= a, b, c <= 1000'],
    H + 'int main(void) { int a, b, c; scanf("%d %d %d", &a, &b, &c); printf("%.2f\\n", (a + b + c) / 3.0); return 0; }',
    ['1 2 3', '1 1 2', '10 20 25', '0 0 0', '-1000 -1000 -999', '1000 1000 1000']),
  q('right-triangle-of-stars', 'Right Triangle of Stars', 'Medium',
    'Read `n` and print a right triangle of stars with `n` rows. Row `i` has `i` stars.\n\nInput\nOne integer n.\n\nOutput\nn lines; line i contains i stars and nothing else.',
    ['1 <= n <= 20'],
    H + 'int main(void) { int n; scanf("%d", &n); for (int i = 1; i <= n; i++) { for (int j = 0; j < i; j++) putchar(\'*\'); putchar(\'\\n\'); } return 0; }',
    ['3', '5', '1', '20', '2']),
  q('seconds-to-hours-minutes-seconds', 'Seconds to Hours Minutes Seconds', 'Medium',
    'Convert a number of seconds into hours, minutes and seconds.\n\nHint: use `/` and `%`.\n\nInput\nOne integer s.\n\nOutput\nOne line: `H hours M minutes S seconds` using the numbers.',
    ['0 <= s <= 1000000'],
    H + 'int main(void) { int s; scanf("%d", &s); printf("%d hours %d minutes %d seconds\\n", s / 3600, s % 3600 / 60, s % 60); return 0; }',
    ['3661', '59', '0', '1000000', '3600', '86399']),
  q('sum-of-digits-of-three-digit-number', 'Sum of Digits of a Three-Digit Number', 'Medium',
    'Read a three-digit positive integer and print the sum of its digits.\n\nInput\nOne integer n.\n\nOutput\nThe sum of the digits.',
    ['100 <= n <= 999'],
    H + 'int main(void) { int n; scanf("%d", &n); printf("%d\\n", n / 100 + n / 10 % 10 + n % 10); return 0; }',
    ['123', '999', '100', '909', '450']),
  q('ascii-code-of-character', 'ASCII Code of a Character', 'Medium',
    'Read a single character and print its ASCII code as an integer, then the next character in the ASCII table, on a second line.\n\nInput\nOne character (a letter or digit, not `z`, `Z` or `9`).\n\nOutput\nLine 1: the ASCII code. Line 2: the character that follows it.',
    ['The character is a letter or digit other than z, Z, 9.'],
    H + 'int main(void) { char c; scanf(" %c", &c); printf("%d\\n%c\\n", c, c + 1); return 0; }',
    ['A', 'a', '0', 'y', 'B', '5']),
  q('print-simple-receipt', 'Print a Simple Receipt', 'Medium',
    'Read the unit price and quantity of an item (both integers) and print a receipt of three lines:\n`Price: P`\n`Quantity: Q`\n`Total: T`\nwhere T is price times quantity.\n\nInput\nTwo integers: price and quantity.\n\nOutput\nThree lines as shown.',
    ['1 <= price <= 10000', '1 <= quantity <= 1000'],
    H + 'int main(void) { int p, q; scanf("%d %d", &p, &q); printf("Price: %d\\nQuantity: %d\\nTotal: %d\\n", p, q, p * q); return 0; }',
    ['25 4', '1 1', '10000 1000', '99 7', '5 200']),
  q('echo-a-full-line', 'Echo a Full Line', 'Medium',
    'Read one whole line of text (it may contain spaces) and print it back inside angle brackets, like `<text>`.\n\nHint: `fgets(buf, size, stdin)` reads a line but keeps the newline; remove it before printing.\n\nInput\nOne line of text.\n\nOutput\nThe line wrapped in `<` and `>`.',
    ['The line has 1 to 80 characters and ends with a newline.'],
    H + '#include <string.h>\nint main(void) { char s[200]; if (!fgets(s, sizeof s, stdin)) return 0; s[strcspn(s, "\\r\\n")] = 0; printf("<%s>\\n", s); return 0; }',
    ['hello world\n', 'C is great\n', 'a\n', 'one two  three\n', 'The quick brown fox jumps\n']),
  q('add-minutes-to-time', 'Add Minutes to a Time', 'Hard',
    'Given a time on a 24-hour clock and a number of minutes to add, print the new time. The time wraps around past midnight.\n\nHint: convert to total minutes, add, then use `%` with 1440 and print with `%02d`.\n\nInput\nThree integers: hour h, minute m, and minutes to add k.\n\nOutput\nThe new time as `HH:MM` with two digits each.',
    ['0 <= h <= 23', '0 <= m <= 59', '0 <= k <= 100000'],
    H + 'int main(void) { int h, m, k; scanf("%d %d %d", &h, &m, &k); int t = (h * 60 + m + k) % 1440; printf("%02d:%02d\\n", t / 60, t % 60); return 0; }',
    ['10 30 45', '23 59 1', '0 0 0', '12 0 1440', '5 7 100000', '9 5 55']),
  q('number-pyramid', 'Number Pyramid', 'Hard',
    'Read `n` and print a centered pyramid of numbers. Row `i` (starting at 1) has `n - i` leading spaces followed by the digits `1` to `i` and then back down to `1`, with no separators. For n = 3:\n`  1`\n` 121`\n`12321`\n\nInput\nOne integer n.\n\nOutput\nn lines forming the pyramid.',
    ['1 <= n <= 9'],
    H + 'int main(void) { int n; scanf("%d", &n); for (int i = 1; i <= n; i++) { for (int s = 0; s < n - i; s++) putchar(\' \'); for (int j = 1; j <= i; j++) printf("%d", j); for (int j = i - 1; j >= 1; j--) printf("%d", j); putchar(\'\\n\'); } return 0; }',
    ['3', '4', '1', '9', '2']),
  q('coin-change-count', 'Minimum Coins for Change', 'Hard',
    'You have unlimited coins of value 25, 10, 5 and 1. Given an amount, print how many coins of each kind the greedy method uses (largest coin first), and the total number of coins.\n\nInput\nOne integer amount.\n\nOutput\nFour lines: `25: a`, `10: b`, `5: c`, `1: d`, then a fifth line `Total: t`.',
    ['0 <= amount <= 100000'],
    H + 'int main(void) { int a; scanf("%d", &a); int c[4] = {25, 10, 5, 1}, t = 0; for (int i = 0; i < 4; i++) { int k = a / c[i]; a %= c[i]; t += k; printf("%d: %d\\n", c[i], k); } printf("Total: %d\\n", t); return 0; }',
    ['68', '99', '0', '1', '100000', '30']),
];
