const prefix = `import sys
raw = sys.stdin.read()
data = raw.split()
def out(value):
    print(int(value) if isinstance(value, float) and value.is_integer() else value)
`

export const PYTHON_SOLUTION_PROGRAMS = {
  'python-basics': [
    `name = raw.strip()
print(f"Hello, {name}!")`,
    `print(raw.rstrip('\\n'))`,
    `print(int(data[0]) + int(data[1]))`,
    `print(int(data[0]) * int(data[1]))`,
    `out(float(data[0]) * 9 / 5 + 32)`,
    `print(sum(map(int, data[:3])))`,
    `print(2 * (int(data[0]) + int(data[1])))`,
    `out(float(data[0]) * 1000)`,
    `print(data[1], data[0])`,
    `print(int(data[0]) // int(data[1]))`,
    `print(int(data[0]) % int(data[1]))`,
    `out(float(data[0]) * float(data[1]) * float(data[2]) / 100)`,
    `out(float(data[0]) * (1 - float(data[1]) / 100))`,
    `print(data[0].upper())`,
    `print(data[0][0], data[0][-1])`,
    `print(' '.join([data[0]] * int(data[1])))`,
    `value = (float(data[0]) - 32) * 5 / 9
out(value)`,
    `print(abs(int(data[0])) % 10)`,
    `minutes = int(data[0])
print(f"{minutes // 60}:{minutes % 60}")`,
    `print(f"{(float(data[0]) + float(data[1])) / 2:.2f}")`,
  ],
  'python-numbers': [
    `print(abs(int(data[0]) - int(data[1])))`,
    `print(int(data[0]) * 60)`,
    `out(sum(map(float, data[:3])) / 3)`,
    `print(f"{2 * 3.14 * float(data[0]):.2f}")`,
    `print('Even' if int(data[0]) % 2 == 0 else 'Odd')`,
    `print(max(map(int, data[:2])))`,
    `print(int(data[0]) ** int(data[1]))`,
    `print(sum(map(int, data[0])))`,
    `print(int(data[0][::-1]))`,
    `n = int(data[0])
prime = n >= 2 and all(n % d for d in range(2, int(n ** 0.5) + 1))
print('Prime' if prime else 'Not prime')`,
    `a, b = map(int, data[:2])
while b:
    a, b = b, a % b
print(a)`,
    `import math
a, b = map(int, data[:2])
print(a // math.gcd(a, b) * b)`,
    `n = int(data[0])
print(sum(n % d == 0 for d in range(1, n + 1)))`,
    `print(f"{float(data[0]):.2f}")`,
    `out(float(data[0]) / float(data[1]) * 100)`,
    `out(float(data[0]) * float(data[1]) / 2)`,
    `print(abs(int(data[0]) - int(data[1])))`,
    `from math import prod
print(prod(map(int, data[0])))`,
    `import math
n = int(data[0])
root = math.isqrt(n)
print('Yes' if root * root == n else 'No')`,
    `print(len(data[0]) - len(data[0].rstrip('0')))`,
  ],
  'python-logic': [
    `print(max(map(int, data[:3])))`,
    `n = int(data[0])
print('Positive' if n > 0 else 'Negative' if n < 0 else 'Zero')`,
    `print('Pass' if int(data[0]) >= 50 else 'Retry')`,
    `y = int(data[0])
print('Leap' if y % 400 == 0 or (y % 4 == 0 and y % 100 != 0) else 'Common')`,
    `print('Vowel' if data[0].lower() in 'aeiou' else 'Consonant')`,
    `print('Yes' if int(data[0]) % 3 == 0 else 'No')`,
    `print('Yes' if int(data[0]) % 15 == 0 else 'No')`,
    `n = int(data[0])
print('A' if n >= 90 else 'B' if n >= 80 else 'C' if n >= 70 else 'D' if n >= 60 else 'F')`,
    `a, b, c = map(int, data[:3])
print('Valid' if a + b > c and a + c > b and b + c > a else 'Invalid')`,
    `a, b, c = map(int, data[:3])
print('Equilateral' if a == b == c else 'Isosceles' if a == b or a == c or b == c else 'Scalene')`,
    `a, op, b = data
a, b = float(a), float(b)
out(a + b if op == '+' else a - b if op == '-' else a * b if op == '*' else a / b)`,
    `x, a, b = map(int, data[:3])
print('Yes' if min(a, b) <= x <= max(a, b) else 'No')`,
    `age = int(data[0])
print('Child' if age < 13 else 'Teen' if age < 20 else 'Adult')`,
    `days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
print(days[int(data[0]) - 1])`,
    `a, b = map(int, data[:2])
print('Equal' if a == b else 'First' if a > b else 'Second')`,
    `print(max(map(int, data[:4])))`,
    `x, y = map(int, data[:2])
print(1 if x > 0 and y > 0 else 2 if x < 0 and y > 0 else 3 if x < 0 else 4)`,
    `c = data[0]
print('Digit' if c.isdigit() else 'Uppercase' if c.isupper() else 'Lowercase')`,
    `total = float(data[0])
out(total + (5 if total < 50 else 0))`,
    `n = int(data[0])
print(min(n, 100) + max(0, min(n - 100, 100)) * 2 + max(0, n - 200) * 3)`,
  ],
  'python-loops-lists': [
    `n = int(data[0])
print(sum(map(int, data[1:n + 1])))`,
    `n = int(data[0])
print(sum(int(x) % 2 == 0 for x in data[1:n + 1]))`,
    `print(data[0][::-1])`,
    `import math
n = int(data[0])
print(math.factorial(n))`,
    `n = int(data[0])
print('\\n'.join(f"{n} x {i} = {n * i}" for i in range(1, 6)))`,
    `n = int(data[0])
print(max(map(int, data[1:n + 1])))`,
    `n = int(data[0])
print(min(map(int, data[1:n + 1])))`,
    `n = int(data[0])
print(f"{sum(map(float, data[1:n + 1])) / n:.2f}")`,
    `n = int(data[0])
target = int(data[n + 1])
print(sum(int(x) == target for x in data[1:n + 1]))`,
    `n = int(data[0])
print(' '.join(dict.fromkeys(data[1:n + 1])))`,
    `n = int(data[0])
a = data[1:n + 1]
print(' '.join([a[-1]] + a[:-1]))`,
    `n = int(data[0])
a = sorted(set(map(int, data[1:n + 1])), reverse=True)
print(a[1])`,
    `n = int(data[0])
print(' '.join(data[1:n + 1][::-1]))`,
    `n = int(data[0])
total = 0
answer = []
for value in map(int, data[1:n + 1]):
    total += value
    answer.append(str(total))
print(' '.join(answer))`,
    `n = int(data[0])
print(sum(int(x) > 0 for x in data[1:n + 1]))`,
    `n = int(data[0])
a = list(map(int, data[1:n + 1]))
target = int(data[n + 1])
print(a.index(target) if target in a else -1)`,
    `n, m = map(int, data[:2])
a = sorted(map(int, data[2:2 + n + m]))
print(' '.join(map(str, a)))`,
    `n = int(data[0])
a = data[1:n + 1]
print('Yes' if a == a[::-1] else 'No')`,
    `from collections import Counter
n = int(data[0])
counts = Counter(map(int, data[1:n + 1]))
best = min(counts, key=lambda x: (-counts[x], x))
print(best)`,
    `n = int(data[0])
a = list(map(int, data[1:]))
print(sum(a[i * n + i] for i in range(n)))`,
  ],
  'python-strings-functions': [
    `print(len(raw.rstrip('\\n')))`,
    `print(raw.strip()[::-1])`,
    `word = raw.strip().lower()
print('Yes' if word == word[::-1] else 'No')`,
    `print(raw.rstrip('\\n').replace(' ', ''))`,
    `print(sum(c in 'aeiou' for c in raw.lower()))`,
    `lines = raw.rstrip('\\n').split('\\n')
print(lines[0].count(lines[1]))`,
    `seen = set()
answer = None
for character in raw.strip():
    if character in seen:
        answer = character
        break
    seen.add(character)
print(answer if answer is not None else 'None')`,
    `word = raw.strip()
print(word[:1].upper() + word[1:])`,
    `print(' '.join(word[:1].upper() + word[1:].lower() for word in raw.split()))`,
    `word, find, replacement = data
print(word.replace(find, replacement))`,
    `print(''.join(c for c in raw.rstrip('\\n') if c.lower() not in 'aeiou'))`,
    `print(len(raw.split()))`,
    `a, b = (word.lower() for word in data)
print('Yes' if sorted(a) == sorted(b) else 'No')`,
    `word, prefix, suffix = data
print('Yes' if word.startswith(prefix) and word.endswith(suffix) else 'No')`,
    `word = raw.strip()
encoded = []
i = 0
while i < len(word):
    j = i + 1
    while j < len(word) and word[j] == word[i]:
        j += 1
    encoded.append(f"{word[i]}{j - i}")
    i = j
print(''.join(encoded))`,
    `def greet(name):
    return f"Hello, {name}!"
print(greet(raw.strip()))`,
    `def factorial(n):
    result = 1
    for value in range(2, n + 1):
        result *= value
    return result
print(factorial(int(data[0])))`,
    `def is_prime(n):
    if n < 2:
        return False
    for divisor in range(2, int(n ** 0.5) + 1):
        if n % divisor == 0:
            return False
    return True
print('Prime' if is_prime(int(data[0])) else 'Not prime')`,
    `n = int(data[0])
a, b = 0, 1
for _ in range(n):
    a, b = b, a + b
print(a)`,
    `words = raw.split()
print(max(words, key=lambda word: len(word)))`,
  ],
}

export function pythonSolutionProgram(category, order) {
  const code = PYTHON_SOLUTION_PROGRAMS[category]?.[order - 1]
  return code ? `${prefix}${code}\n` : ''
}
