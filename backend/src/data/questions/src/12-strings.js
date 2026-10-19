const LINE = `char s[105]; if(!fgets(s,sizeof s,stdin))return 0; s[strcspn(s,"\\n")]=0;`;
const WORD = 'The input is a single word (no spaces).';
const LN = 'The input is one line that may contain spaces.';
const CW = ['1 <= length of the word <= 100'];
const CL = ['1 <= length of the line <= 100'];
const m = (s) => ({ input: s });
const h = (s) => ({ input: s, hidden: true });

export default [
  {
    slug: 'string-length-manual', title: 'Length of a String', difficulty: 'Easy',
    description: 'A C string ends with the special character `\'\\0\'`. Count characters with a loop until you reach it (do not use `strlen`).\n\nInput: ' + WORD + '\nOutput: One integer, the number of characters.',
    constraints: CW,
    solution: `#include <stdio.h>\nint main(){ char s[105]; scanf("%100s",s); int n=0; while(s[n]!='\\0')n++; printf("%d\\n",n); return 0; }`,
    tests: [m('hello'), m('VirVerse'), h('a'), h('abcdefghijklmnopqrstuvwxyz0123456789'), h('xxxxxxxxxx')],
  },
  {
    slug: 'reverse-a-string', title: 'Reverse a String', difficulty: 'Easy',
    description: 'Print the characters of the string in reverse order. Loop from the last index down to 0.\n\nInput: ' + WORD + '\nOutput: The reversed word.',
    constraints: CW,
    solution: `#include <stdio.h>\n#include <string.h>\nint main(){ char s[105]; scanf("%100s",s); for(int i=(int)strlen(s)-1;i>=0;i--)putchar(s[i]); putchar('\\n'); return 0; }`,
    tests: [m('hello'), m('abc123'), h('a'), h('aaaa'), h('level')],
  },
  {
    slug: 'palindrome-word-check', title: 'Palindrome Check', difficulty: 'Easy',
    description: 'A palindrome reads the same forwards and backwards. Compare the first character with the last, the second with the second last, and so on. Letters are compared exactly (case-sensitive).\n\nInput: ' + WORD + '\nOutput: Print `Palindrome` or `Not Palindrome`.',
    constraints: CW,
    solution: `#include <stdio.h>\n#include <string.h>\nint main(){ char s[105]; scanf("%100s",s); int n=strlen(s),ok=1; for(int i=0;i<n/2;i++)if(s[i]!=s[n-1-i])ok=0; puts(ok?"Palindrome":"Not Palindrome"); return 0; }`,
    tests: [m('madam'), m('hello'), h('a'), h('abba'), h('Madam')],
  },
  {
    slug: 'count-vowels-consonants', title: 'Count Vowels and Consonants', difficulty: 'Easy',
    description: 'Vowels are `a e i o u` (either case). Every other letter is a consonant. Ignore anything that is not a letter.\n\nInput: ' + LN + ' It contains letters, spaces and punctuation.\nOutput: One line: the vowel count and the consonant count separated by a space.',
    constraints: CL,
    solution: `#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\n#include <string.h>\nint main(){ ${LINE} int v=0,c=0; for(int i=0;s[i];i++){ if(isalpha((unsigned char)s[i])){ if(strchr("aeiouAEIOU",s[i]))v++; else c++; } } printf("%d %d\\n",v,c); return 0; }`,
    tests: [m('Hello World'), m('programming'), h('a'), h('xyz'), h('AEIOU aeiou'), h('1234 !!')],
  },
  {
    slug: 'convert-to-uppercase', title: 'Convert to Uppercase', difficulty: 'Easy',
    description: 'Turn every lowercase letter into uppercase and leave all other characters unchanged. In ASCII, a lowercase letter minus 32 gives the uppercase letter (or use `toupper`).\n\nInput: ' + LN + '\nOutput: The converted line.',
    constraints: CL,
    solution: `#include <stdio.h>\n#include <ctype.h>\n#include <string.h>\nint main(){ ${LINE} for(int i=0;s[i];i++)s[i]=toupper((unsigned char)s[i]); puts(s); return 0; }`,
    tests: [m('hello world'), m('C is Fun 123'), h('a'), h('ALREADY UPPER'), h('z!')],
  },
  {
    slug: 'toggle-letter-case', title: 'Toggle Case', difficulty: 'Easy',
    description: 'Change uppercase letters to lowercase and lowercase letters to uppercase. Other characters stay the same.\n\nInput: ' + LN + '\nOutput: The line with every letter\'s case flipped.',
    constraints: CL,
    solution: `#include <stdio.h>\n#include <ctype.h>\n#include <string.h>\nint main(){ ${LINE} for(int i=0;s[i];i++){ unsigned char ch=s[i]; if(isupper(ch))s[i]=tolower(ch); else if(islower(ch))s[i]=toupper(ch);} puts(s); return 0; }`,
    tests: [m('Hello World'), m('cOdInG 4 fUn'), h('a'), h('Z'), h('123 !?')],
  },
  {
    slug: 'count-letters-digits-others', title: 'Letters, Digits and Others', difficulty: 'Easy',
    description: 'Classify every character of the line as a letter, a digit, or something else (spaces and symbols).\n\nInput: ' + LN + '\nOutput: One line: `letters digits others`, three integers separated by single spaces.',
    constraints: CL,
    solution: `#include <stdio.h>\n#include <ctype.h>\n#include <string.h>\nint main(){ ${LINE} int l=0,d=0,o=0; for(int i=0;s[i];i++){unsigned char ch=s[i]; if(isalpha(ch))l++; else if(isdigit(ch))d++; else o++;} printf("%d %d %d\\n",l,d,o); return 0; }`,
    tests: [m('Hello 123!'), m('abc def'), h('7'), h('###'), h('a1 b2 c3')],
  },
  {
    slug: 'remove-spaces', title: 'Remove All Spaces', difficulty: 'Easy',
    description: 'Copy only the non-space characters to the output. Keep a separate write index.\n\nInput: ' + LN + ' It has at least one non-space character.\nOutput: The line with all spaces removed.',
    constraints: CL,
    solution: `#include <stdio.h>\n#include <string.h>\nint main(){ ${LINE} for(int i=0;s[i];i++)if(s[i]!=' ')putchar(s[i]); putchar('\\n'); return 0; }`,
    tests: [m('a b c'), m('Hello World From C'), h('x'), h('no_spaces'), h('a  b   c')],
  },
  {
    slug: 'count-character-occurrences', title: 'Count a Given Character', difficulty: 'Easy',
    description: 'Count how many times a given character appears in a line (case-sensitive).\n\nInput: The first line is the text (may contain spaces). The second line has one character `ch`.\nOutput: One integer, the number of occurrences of `ch`.',
    constraints: CL,
    solution: `#include <stdio.h>\n#include <string.h>\nint main(){ ${LINE} char t[8]; fgets(t,sizeof t,stdin); int c=0; for(int i=0;s[i];i++)if(s[i]==t[0])c++; printf("%d\\n",c); return 0; }`,
    tests: [m('banana\na'), m('Hello World\no'), h('a\na'), h('aaaa\na'), h('abc\nz'), h('a b c\n ')],
  },
  {
    slug: 'join-two-words', title: 'Join Two Words', difficulty: 'Easy',
    description: 'Combine two words into one by appending the second to the first (you may use `strcat`). Make sure the destination array is large enough.\n\nInput: Two words separated by whitespace.\nOutput: The first word immediately followed by the second, then a space-free newline.',
    constraints: ['1 <= length of each word <= 50'],
    solution: `#include <stdio.h>\n#include <string.h>\nint main(){ char a[110],b[55]; scanf("%50s %50s",a,b); strcat(a,b); printf("%s\\n",a); return 0; }`,
    tests: [m('Vir Verse'), m('hello world'), h('a b'), h('abc abc')],
  },
  {
    slug: 'count-words-in-sentence', title: 'Count Words', difficulty: 'Medium',
    description: 'Words are separated by single spaces. Count how many words the sentence has. Hint: count the positions where a non-space character starts a word.\n\nInput: ' + LN + ' No leading, trailing or repeated spaces.\nOutput: One integer, the number of words.',
    constraints: CL,
    solution: `#include <stdio.h>\n#include <string.h>\nint main(){ ${LINE} int w=0; for(int i=0;s[i];i++)if(s[i]!=' '&&(i==0||s[i-1]==' '))w++; printf("%d\\n",w); return 0; }`,
    tests: [m('the quick brown fox'), m('hello'), h('a b c d e f g'), h('one two')],
  },
  {
    slug: 'letter-frequency', title: 'Letter Frequency', difficulty: 'Medium',
    description: 'Count how often each lowercase letter `a`-`z` appears (ignore case: treat `A` as `a`). An array of 26 counters indexed by `ch - \'a\'` works well.\n\nInput: ' + LN + '\nOutput: For every letter that appears at least once, in alphabetical order, print a line `letter count`.',
    constraints: [...CL, 'At least one letter is present'],
    solution: `#include <stdio.h>\n#include <ctype.h>\n#include <string.h>\nint main(){ ${LINE} int f[26]={0}; for(int i=0;s[i];i++)if(isalpha((unsigned char)s[i]))f[tolower((unsigned char)s[i])-'a']++; for(int i=0;i<26;i++)if(f[i])printf("%c %d\\n",'a'+i,f[i]); return 0; }`,
    tests: [m('Hello World'), m('banana'), h('a'), h('AaAa'), h('z y x 1 2')],
  },
  {
    slug: 'anagram-check', title: 'Anagram Check', difficulty: 'Medium',
    description: 'Two words are anagrams if they use exactly the same letters the same number of times, in any order (case-sensitive here).\n\nInput: Two words separated by whitespace, each made of lowercase letters.\nOutput: Print `Anagrams` or `Not Anagrams`.',
    constraints: ['1 <= length of each word <= 100', 'Lowercase letters only'],
    solution: `#include <stdio.h>\nint main(){ char a[105],b[105]; scanf("%100s %100s",a,b); int f[26]={0}; for(int i=0;a[i];i++)f[a[i]-'a']++; for(int i=0;b[i];i++)f[b[i]-'a']--; int ok=1; for(int i=0;i<26;i++)if(f[i])ok=0; puts(ok?"Anagrams":"Not Anagrams"); return 0; }`,
    tests: [m('listen silent'), m('hello world'), h('a a'), h('a b'), h('abc ab'), h('aab abb')],
  },
  {
    slug: 'remove-duplicate-characters', title: 'Remove Duplicate Characters', difficulty: 'Medium',
    description: 'Keep only the first occurrence of each character and drop later repeats, preserving the original order.\n\nInput: ' + WORD + '\nOutput: The word without repeated characters.',
    constraints: CW,
    solution: `#include <stdio.h>\nint main(){ char s[105]; scanf("%100s",s); int seen[256]={0}; for(int i=0;s[i];i++){unsigned char c=s[i]; if(!seen[c]){seen[c]=1;putchar(c);}} putchar('\\n'); return 0; }`,
    tests: [m('programming'), m('aabbcc'), h('a'), h('aaaaaa'), h('abcabc')],
  },
  {
    slug: 'longest-word', title: 'Longest Word in a Sentence', difficulty: 'Medium',
    description: 'Find the longest word in a sentence. If several words tie, print the first one.\n\nInput: ' + LN + ' Words are separated by single spaces.\nOutput: The longest word.',
    constraints: CL,
    solution: `#include <stdio.h>\n#include <string.h>\nint main(){ ${LINE} char best[105]=""; char *w=strtok(s," "); while(w){ if(strlen(w)>strlen(best))strcpy(best,w); w=strtok(NULL," "); } puts(best); return 0; }`,
    tests: [m('I love programming in C'), m('cat dog bat'), h('a'), h('hi there everyone')],
  },
  {
    slug: 'capitalize-each-word', title: 'Capitalize Each Word', difficulty: 'Medium',
    description: 'Make the first letter of every word uppercase and all other letters lowercase.\n\nInput: ' + LN + ' Words are separated by single spaces and contain only letters.\nOutput: The converted sentence.',
    constraints: CL,
    solution: `#include <stdio.h>\n#include <ctype.h>\n#include <string.h>\nint main(){ ${LINE} for(int i=0;s[i];i++){ if(i==0||s[i-1]==' ')s[i]=toupper((unsigned char)s[i]); else s[i]=tolower((unsigned char)s[i]); } puts(s); return 0; }`,
    tests: [m('hello world'), m('hELLO wORLD fRoM c'), h('a'), h('ALL CAPS HERE')],
  },
  {
    slug: 'run-length-encoding', title: 'Run-Length Compression', difficulty: 'Medium',
    description: 'Replace each group of identical consecutive characters by the character followed by the group length. Example: `aaabcc` becomes `a3b1c2`.\n\nInput: ' + WORD + ' It contains only letters.\nOutput: The compressed string.',
    constraints: CW,
    solution: `#include <stdio.h>\nint main(){ char s[105]; scanf("%100s",s); for(int i=0;s[i];){int j=i; while(s[j]==s[i])j++; printf("%c%d",s[i],j-i); i=j;} putchar('\\n'); return 0; }`,
    tests: [m('aaabcc'), m('abc'), h('a'), h('zzzzzzzzzz'), h('aabbaa')],
  },
  {
    slug: 'longest-palindromic-substring', title: 'Longest Palindromic Substring', difficulty: 'Hard',
    description: 'Find the longest contiguous part of the word that is a palindrome. If several have the same length, choose the one that starts earliest. Hint: expand outwards from every possible centre (both single-character and between-character centres).\n\nInput: ' + WORD + '\nOutput: The longest palindromic substring.',
    constraints: ['1 <= length of the word <= 100'],
    solution: `#include <stdio.h>\n#include <string.h>\nint main(){ char s[105]; scanf("%100s",s); int n=strlen(s),bs=0,bl=1;\n for(int c=0;c<2*n-1;c++){ int l=c/2,r=l+c%2; while(l>=0&&r<n&&s[l]==s[r]){l--;r++;} int len=r-l-1,st=l+1; if(len>bl||(len==bl&&st<bs)){bl=len;bs=st;} }\n printf("%.*s\\n",bl,s+bs); return 0; }`,
    tests: [m('babad'), m('cbbd'), h('a'), h('abc'), h('forgeeksskeegfor'), h('aaaa')],
  },
  {
    slug: 'longest-substring-without-repeats', title: 'Longest Substring Without Repeating Characters', difficulty: 'Hard',
    description: 'Find the length of the longest contiguous part of the word in which no character appears twice. Hint: keep a window `[start, i]` and the last seen index of each character; when a repeat is found inside the window, move `start` past the earlier copy.\n\nInput: ' + WORD + '\nOutput: One integer, the length of that longest substring.',
    constraints: ['1 <= length of the word <= 100'],
    solution: `#include <stdio.h>\nint main(){ char s[105]; scanf("%100s",s); int last[256]; for(int i=0;i<256;i++)last[i]=-1; int st=0,best=0; for(int i=0;s[i];i++){unsigned char c=s[i]; if(last[c]>=st)st=last[c]+1; last[c]=i; if(i-st+1>best)best=i-st+1;} printf("%d\\n",best); return 0; }`,
    tests: [m('abcabcbb'), m('bbbbb'), h('a'), h('pwwkew'), h('abcdef'), h('abba')],
  },
  {
    slug: 'run-length-decoding', title: 'Run-Length Decompression', difficulty: 'Hard',
    description: 'The input is a compressed string made of letters each followed by a count (the count may have several digits). Expand it: `a3b12` becomes `aaabbbbbbbbbbbb`. Hint: after a letter, build the number digit by digit with `n = n * 10 + digit`.\n\nInput: ' + WORD + ' Every letter is followed by a count of at least 1.\nOutput: The expanded string.',
    constraints: ['1 <= length of the input <= 100', 'The expanded string has at most 200 characters', 'Each count is between 1 and 99'],
    solution: `#include <stdio.h>\n#include <ctype.h>\nint main(){ char s[105]; scanf("%100s",s); int i=0; while(s[i]){ char ch=s[i++]; int n=0; while(isdigit((unsigned char)s[i])){n=n*10+(s[i]-'0');i++;} for(int k=0;k<n;k++)putchar(ch);} putchar('\\n'); return 0; }`,
    tests: [m('a3b2c1'), m('x12y3'), h('z1'), h('a1b1c1d1'), h('q99')],
  },
];
