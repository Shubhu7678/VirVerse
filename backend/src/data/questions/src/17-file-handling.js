const T = (...a) => a.map((input, i) => ({ input, ...(i >= a.length - 2 ? { hidden: true } : {}) }));
const NOTE = 'The judge starts with an empty folder, so your program must first CREATE the file itself and then read it back. ';

export default [
  {
    slug: 'file-write-and-read-word', title: 'Write a Word to a File and Read it Back', difficulty: 'Easy',
    description: NOTE + 'Read one word with `scanf`. Write it to a file named `data.txt` using `fprintf`, close the file, open it again for reading and read the word with `fscanf`.\n\nInput: one word.\nOutput: `Read: ` followed by the word read from the file.',
    constraints: ['The word has at most 50 characters and no spaces'],
    solution: `#include <stdio.h>
int main(){ char w[64], r[64]; scanf("%63s", w);
FILE *f = fopen("data.txt","w"); if(!f) return 1; fprintf(f,"%s",w); fclose(f);
f = fopen("data.txt","r"); if(!f) return 1; fscanf(f,"%63s",r); fclose(f);
printf("Read: %s\\n", r); return 0; }`,
    tests: T('hello', 'world', 'a', 'VirVerse'),
  },
  {
    slug: 'file-write-and-read-integer', title: 'Save an Integer and Read it Back', difficulty: 'Easy',
    description: NOTE + 'Read an integer, write it to `number.txt` with `fprintf`, then read it back from the file with `fscanf` and print its double.\n\nInput: one integer.\nOutput: a single integer, twice the value read from the file.',
    constraints: ['-1000000 <= n <= 1000000'],
    solution: `#include <stdio.h>
int main(){ int n, m; scanf("%d",&n);
FILE *f = fopen("number.txt","w"); if(!f) return 1; fprintf(f,"%d\\n",n); fclose(f);
f = fopen("number.txt","r"); if(!f) return 1; fscanf(f,"%d",&m); fclose(f);
printf("%d\\n", m*2); return 0; }`,
    tests: T('5', '21', '0', '-7'),
  },
  {
    slug: 'file-fputc-fgetc-word', title: 'Copy a Word Character by Character', difficulty: 'Easy',
    description: NOTE + 'Read a word. Write it to `chars.txt` one character at a time with `fputc`. Then read the file back one character at a time with `fgetc` (until `EOF`) and print each character on its own line.\n\nInput: one word.\nOutput: each character of the word on its own line.',
    constraints: ['The word has 1 to 20 characters and no spaces'],
    solution: `#include <stdio.h>
#include <string.h>
int main(){ char w[32]; scanf("%31s", w);
FILE *f = fopen("chars.txt","w"); if(!f) return 1;
for(size_t i=0;i<strlen(w);i++) fputc(w[i], f); fclose(f);
f = fopen("chars.txt","r"); if(!f) return 1; int c;
while((c=fgetc(f))!=EOF) printf("%c\\n", c); fclose(f); return 0; }`,
    tests: T('cat', 'File', 'x', 'C11'),
  },
  {
    slug: 'file-fputs-fgets-line', title: 'Store a Sentence in a File', difficulty: 'Easy',
    description: NOTE + 'Read one whole line with `fgets`. Write it to `line.txt` with `fputs`, then read the file back with `fgets` and print the line.\n\nInput: one line of text (may contain spaces).\nOutput: the same line, read back from the file.',
    constraints: ['The line has at most 100 characters'],
    solution: `#include <stdio.h>
#include <string.h>
int main(){ char s[128], r[128] = "";
if(!fgets(s,sizeof s,stdin)) return 0; s[strcspn(s,"\\n")] = 0;
FILE *f = fopen("line.txt","w"); if(!f) return 1; fputs(s,f); fclose(f);
f = fopen("line.txt","r"); if(!f) return 1; fgets(r,sizeof r,f); fclose(f);
printf("%s\\n", r); return 0; }`,
    tests: T('Hello File Handling\n', 'C is fun\n', 'one\n', 'a b  c d\n'),
  },
  {
    slug: 'file-check-existence', title: 'Does the File Exist?', difficulty: 'Easy',
    description: NOTE + 'Read an integer `flag`. If `flag` is 1, create a file `exists.txt` containing the text `ok`. Then try to open `exists.txt` for reading with `fopen`. If `fopen` returns `NULL`, print `Not found`, otherwise print `Found` (and close the file).\n\nInput: one integer, 0 or 1.\nOutput: `Found` or `Not found`.',
    constraints: ['flag is 0 or 1'],
    solution: `#include <stdio.h>
int main(){ int flag; scanf("%d",&flag);
if(flag==1){ FILE *w = fopen("exists.txt","w"); if(w){ fputs("ok",w); fclose(w);} }
FILE *f = fopen("exists.txt","r");
if(f==NULL) printf("Not found\\n"); else { printf("Found\\n"); fclose(f);} return 0; }`,
    tests: T('1', '0', '1', '0'),
  },
  {
    slug: 'file-sum-numbers-from-file', title: 'Sum Numbers Stored in a File', difficulty: 'Easy',
    description: NOTE + 'Read `n`, then `n` integers. Write them to `numbers.txt`, one per line. Reopen the file, read the numbers back with `fscanf` in a loop (until it no longer returns 1) and print their sum.\n\nInput: `n` then `n` integers.\nOutput: the sum.',
    constraints: ['1 <= n <= 100', 'Each number is between -1000 and 1000'],
    solution: `#include <stdio.h>
int main(){ int n,x; scanf("%d",&n);
FILE *f = fopen("numbers.txt","w"); if(!f) return 1;
for(int i=0;i<n;i++){ scanf("%d",&x); fprintf(f,"%d\\n",x);} fclose(f);
f = fopen("numbers.txt","r"); if(!f) return 1; long s=0;
while(fscanf(f,"%d",&x)==1) s+=x; fclose(f); printf("%ld\\n", s); return 0; }`,
    tests: T('3\n1 2 3', '4\n10 20 30 40', '1\n-5', '5\n-1000 1000 7 -7 3'),
  },
  {
    slug: 'file-append-mode', title: 'Append a Second Word', difficulty: 'Easy',
    description: NOTE + 'Read two words. Write the first to `log.txt` (mode `"w"`) followed by a newline. Then reopen `log.txt` in append mode (`"a"`) and add the second word and a newline. Finally read the file back and print its lines.\n\nInput: two words separated by whitespace.\nOutput: the first word on line 1, the second on line 2.',
    constraints: ['Each word has at most 30 characters'],
    solution: `#include <stdio.h>
int main(){ char a[32], b[32], r[32]; scanf("%31s %31s", a, b);
FILE *f = fopen("log.txt","w"); if(!f) return 1; fprintf(f,"%s\\n",a); fclose(f);
f = fopen("log.txt","a"); if(!f) return 1; fprintf(f,"%s\\n",b); fclose(f);
f = fopen("log.txt","r"); if(!f) return 1;
while(fscanf(f,"%31s",r)==1) printf("%s\\n", r); fclose(f); return 0; }`,
    tests: T('first second', 'A B', 'x yz', 'Vir Verse'),
  },
  {
    slug: 'file-count-characters', title: 'Count Characters in a File', difficulty: 'Easy',
    description: NOTE + 'Read one word and write it to `count.txt`. Reopen the file and count the characters using `fgetc` until `EOF`. Print the count.\n\nInput: one word.\nOutput: the number of characters in the file.',
    constraints: ['The word has 1 to 50 characters and no spaces'],
    solution: `#include <stdio.h>
int main(){ char w[64]; scanf("%63s", w);
FILE *f = fopen("count.txt","w"); if(!f) return 1; fputs(w,f); fclose(f);
f = fopen("count.txt","r"); if(!f) return 1; int c, n=0;
while((c=fgetc(f))!=EOF) n++; fclose(f); printf("%d\\n", n); return 0; }`,
    tests: T('hello', 'a', 'programming', 'VirVerseLearning'),
  },
  {
    slug: 'file-binary-int-array', title: 'Binary File of Integers', difficulty: 'Easy',
    description: NOTE + 'Read `n` and then `n` integers. Write the whole array to a binary file `nums.bin` with one `fwrite` call. Read it back into a second array with `fread` and print the values separated by single spaces.\n\nInput: `n` then `n` integers.\nOutput: the integers on one line, separated by single spaces.',
    constraints: ['1 <= n <= 50', 'Values fit in an int'],
    solution: `#include <stdio.h>
int main(){ int n, a[50], b[50]; scanf("%d",&n);
for(int i=0;i<n;i++) scanf("%d",&a[i]);
FILE *f = fopen("nums.bin","wb"); if(!f) return 1; fwrite(a,sizeof(int),n,f); fclose(f);
f = fopen("nums.bin","rb"); if(!f) return 1; fread(b,sizeof(int),n,f); fclose(f);
for(int i=0;i<n;i++) printf(i?" %d":"%d", b[i]); printf("\\n"); return 0; }`,
    tests: T('3\n1 2 3', '5\n9 8 7 6 5', '1\n42', '4\n-1 0 100000 -100000'),
  },
  {
    slug: 'file-find-maximum', title: 'Largest Number in a File', difficulty: 'Easy',
    description: NOTE + 'Read `n` and `n` integers. Write them to `values.txt` separated by spaces. Read the file back and print the largest number.\n\nInput: `n` then `n` integers.\nOutput: the maximum value.',
    constraints: ['1 <= n <= 100', 'Values are between -10000 and 10000'],
    solution: `#include <stdio.h>
int main(){ int n,x; scanf("%d",&n);
FILE *f = fopen("values.txt","w"); if(!f) return 1;
for(int i=0;i<n;i++){ scanf("%d",&x); fprintf(f,"%d ",x);} fclose(f);
f = fopen("values.txt","r"); if(!f) return 1; int m, first=1;
while(fscanf(f,"%d",&x)==1){ if(first||x>m){m=x;first=0;} } fclose(f);
printf("%d\\n", m); return 0; }`,
    tests: T('3\n4 9 2', '5\n-3 -8 -1 -9 -2', '1\n7', '4\n5 5 5 5'),
  },
  {
    slug: 'file-count-lines-words-chars', title: 'Lines, Words and Characters of a File', difficulty: 'Medium',
    description: NOTE + 'Read `n`, then `n` lines of text (use `fgets`). Write the lines to `text.txt`, then read it back with `fgetc` and count lines (newline characters), words (groups of non-space characters) and characters (including newlines).\n\nInput: `n`, then `n` lines.\nOutput: `lines words chars` separated by single spaces.',
    constraints: ['1 <= n <= 10', 'Each line has at most 80 characters and at least one word'],
    solution: `#include <stdio.h>
#include <ctype.h>
#include <string.h>
int main(){ int n; char s[128]; scanf("%d",&n); fgets(s,sizeof s,stdin);
FILE *f = fopen("text.txt","w"); if(!f) return 1;
for(int i=0;i<n;i++){ fgets(s,sizeof s,stdin); s[strcspn(s,"\\n")]=0; fprintf(f,"%s\\n",s);} fclose(f);
f = fopen("text.txt","r"); if(!f) return 1; int c, l=0,w=0,ch=0,in=0;
while((c=fgetc(f))!=EOF){ ch++; if(c=='\\n') l++;
 if(isspace(c)) in=0; else if(!in){in=1;w++;} } fclose(f);
printf("%d %d %d\\n", l,w,ch); return 0; }`,
    tests: T('2\nhello world\nfoo\n', '1\nOne two three four\n', '3\na\nb c\nd e f\n', '2\n  spaced   out  \nend\n'),
  },
  {
    slug: 'file-copy-uppercase', title: 'Copy a File in Uppercase', difficulty: 'Medium',
    description: NOTE + 'Read a single line with `fgets` and write it to `source.txt`. Then copy `source.txt` to `copy.txt` character by character, converting letters to uppercase with `toupper`. Print the contents of `copy.txt`.\n\nInput: one line of text.\nOutput: the line in uppercase.',
    constraints: ['The line has at most 100 characters'],
    solution: `#include <stdio.h>
#include <ctype.h>
#include <string.h>
int main(){ char s[128]; if(!fgets(s,sizeof s,stdin)) return 0; s[strcspn(s,"\\n")]=0;
FILE *a = fopen("source.txt","w"); if(!a) return 1; fprintf(a,"%s\\n",s); fclose(a);
a = fopen("source.txt","r"); FILE *b = fopen("copy.txt","w"); if(!a||!b) return 1; int c;
while((c=fgetc(a))!=EOF) fputc(toupper(c),b); fclose(a); fclose(b);
b = fopen("copy.txt","r"); if(!b) return 1;
while((c=fgetc(b))!=EOF) putchar(c); fclose(b); return 0; }`,
    tests: T('hello world\n', 'Mixed Case 123\n', 'ABC\n', 'c is great!\n'),
  },
  {
    slug: 'file-merge-sorted-files', title: 'Merge Two Sorted Files', difficulty: 'Medium',
    description: NOTE + 'Read `n` then `n` sorted integers and write them to `a.txt`. Read `m` then `m` sorted integers and write them to `b.txt`. Merge the two files into `merged.txt` so the result stays sorted (compare the current numbers of both files). Print the contents of `merged.txt` on one line, separated by single spaces.\n\nInput: `n`, `n` integers, `m`, `m` integers (both ascending).\nOutput: all numbers in ascending order.',
    constraints: ['1 <= n, m <= 30', 'Each list is in non-decreasing order'],
    solution: `#include <stdio.h>
int main(){ int n,m,x;
FILE *a = fopen("a.txt","w"), *b = fopen("b.txt","w"); if(!a||!b) return 1;
scanf("%d",&n); for(int i=0;i<n;i++){scanf("%d",&x);fprintf(a,"%d\\n",x);}
scanf("%d",&m); for(int i=0;i<m;i++){scanf("%d",&x);fprintf(b,"%d\\n",x);}
fclose(a); fclose(b);
a = fopen("a.txt","r"); b = fopen("b.txt","r"); FILE *c = fopen("merged.txt","w"); if(!a||!b||!c) return 1;
int p, q; int hp = fscanf(a,"%d",&p)==1, hq = fscanf(b,"%d",&q)==1;
while(hp||hq){
 if(hp && (!hq || p<=q)){ fprintf(c,"%d\\n",p); hp = fscanf(a,"%d",&p)==1; }
 else { fprintf(c,"%d\\n",q); hq = fscanf(b,"%d",&q)==1; } }
fclose(a); fclose(b); fclose(c);
c = fopen("merged.txt","r"); int first=1;
while(fscanf(c,"%d",&x)==1){ printf(first?"%d":" %d",x); first=0; } printf("\\n"); fclose(c); return 0; }`,
    tests: T('3\n1 3 5\n3\n2 4 6\n', '2\n1 2\n3\n3 4 5\n', '1\n5\n1\n5\n', '4\n-5 -1 0 9\n2\n-3 10\n'),
  },
  {
    slug: 'file-count-vowels', title: 'Count Vowels in a File', difficulty: 'Medium',
    description: NOTE + 'Read one line of text with `fgets` and save it to `vowels.txt`. Read the file back with `fgetc` and count vowels (`a e i o u`, upper or lower case) and consonants (other letters). Ignore everything else.\n\nInput: one line.\nOutput: `vowels consonants` separated by a single space.',
    constraints: ['The line has at most 100 characters'],
    solution: `#include <stdio.h>
#include <ctype.h>
#include <string.h>
int main(){ char s[128]; if(!fgets(s,sizeof s,stdin)) return 0; s[strcspn(s,"\\n")]=0;
FILE *f = fopen("vowels.txt","w"); if(!f) return 1; fputs(s,f); fclose(f);
f = fopen("vowels.txt","r"); if(!f) return 1; int c,v=0,k=0;
while((c=fgetc(f))!=EOF){ if(isalpha(c)){ if(strchr("aeiouAEIOU",c)) v++; else k++; } }
fclose(f); printf("%d %d\\n",v,k); return 0; }`,
    tests: T('Hello World\n', 'aeiou\n', 'rhythm\n', '123 !!\n'),
  },
  {
    slug: 'file-struct-records-top-student', title: 'Top Student from a Record File', difficulty: 'Medium',
    description: NOTE + 'Read `n`, then `n` students, each as a name (one word) and an integer mark. Store each as a `struct` and write all of them to the binary file `students.bin` using `fwrite`. Read the records back with `fread` and print the name and mark of the student with the highest mark (marks are all different).\n\nInput: `n`, then `n` pairs `name mark`.\nOutput: `name mark`.',
    constraints: ['1 <= n <= 20', 'Names have at most 20 characters', 'Marks are distinct integers 0 to 100'],
    solution: `#include <stdio.h>
struct S { char name[24]; int mark; };
int main(){ int n; struct S s[20], r; scanf("%d",&n);
FILE *f = fopen("students.bin","wb"); if(!f) return 1;
for(int i=0;i<n;i++){ scanf("%23s %d", s[i].name, &s[i].mark); fwrite(&s[i],sizeof(struct S),1,f);} fclose(f);
f = fopen("students.bin","rb"); if(!f) return 1; struct S best; int have=0;
while(fread(&r,sizeof r,1,f)==1){ if(!have||r.mark>best.mark){best=r;have=1;} } fclose(f);
printf("%s %d\\n", best.name, best.mark); return 0; }`,
    tests: T('3\nAmit 80\nRiya 95\nSam 70\n', '1\nSolo 50\n', '4\nA 10\nB 20\nC 30\nD 40\n', '3\nZed 99\nYan 5\nXia 60\n'),
  },
  {
    slug: 'file-fseek-kth-number', title: 'Jump to the k-th Number with fseek', difficulty: 'Medium',
    description: NOTE + 'Read `n` and `n` integers and write them to the binary file `data.bin` with `fwrite`. Then read `k` (1-based). Use `fseek` with `(k - 1) * sizeof(int)` from `SEEK_SET` to jump straight to the k-th integer and read it with `fread`. Print it.\n\nInput: `n`, `n` integers, then `k`.\nOutput: the k-th integer.',
    constraints: ['1 <= n <= 50', '1 <= k <= n'],
    solution: `#include <stdio.h>
int main(){ int n,a[50],k,v; scanf("%d",&n); for(int i=0;i<n;i++) scanf("%d",&a[i]); scanf("%d",&k);
FILE *f = fopen("data.bin","wb"); if(!f) return 1; fwrite(a,sizeof(int),n,f); fclose(f);
f = fopen("data.bin","rb"); if(!f) return 1;
fseek(f,(long)(k-1)*(long)sizeof(int),SEEK_SET); fread(&v,sizeof(int),1,f); fclose(f);
printf("%d\\n",v); return 0; }`,
    tests: T('5\n10 20 30 40 50\n3\n', '3\n7 8 9\n1\n', '4\n1 2 3 4\n4\n', '1\n-6\n1\n'),
  },
  {
    slug: 'file-split-even-odd', title: 'Split Numbers into Even and Odd Files', difficulty: 'Medium',
    description: NOTE + 'Read `n` and `n` integers and write them to `all.txt`. Read `all.txt` back and write even numbers to `even.txt` and odd numbers to `odd.txt` (one per line). Finally print the contents of `even.txt` on one line, then `odd.txt` on the next line, numbers separated by single spaces. If a file is empty print an empty line.\n\nInput: `n` then `n` non-negative integers.\nOutput: two lines (evens, then odds).',
    constraints: ['1 <= n <= 50', '0 <= value <= 10000'],
    solution: `#include <stdio.h>
void show(const char *name){ FILE *f = fopen(name,"r"); int x, first=1; if(!f) return;
 while(fscanf(f,"%d",&x)==1){ printf(first?"%d":" %d",x); first=0; } printf("\\n"); fclose(f); }
int main(){ int n,x; scanf("%d",&n);
FILE *f = fopen("all.txt","w"); if(!f) return 1; for(int i=0;i<n;i++){scanf("%d",&x);fprintf(f,"%d\\n",x);} fclose(f);
f = fopen("all.txt","r"); FILE *e = fopen("even.txt","w"), *o = fopen("odd.txt","w"); if(!f||!e||!o) return 1;
while(fscanf(f,"%d",&x)==1) fprintf(x%2==0?e:o,"%d\\n",x);
fclose(f); fclose(e); fclose(o); show("even.txt"); show("odd.txt"); return 0; }`,
    tests: T('5\n1 2 3 4 5\n', '3\n2 4 6\n', '3\n1 3 5\n', '1\n0\n'),
  },
  {
    slug: 'file-reverse-lines', title: 'Print the Lines of a File in Reverse Order', difficulty: 'Hard',
    description: NOTE + 'Read `n`, then `n` lines of text (use `fgets`). Write the lines to `lines.txt`. Read the file back line by line into an array, then print the lines from last to first.\n\nInput: `n`, then `n` lines.\nOutput: the lines in reverse order, one per line.',
    constraints: ['1 <= n <= 20', 'Each line has 1 to 80 characters'],
    solution: `#include <stdio.h>
#include <string.h>
int main(){ int n; char s[100], L[20][100]; scanf("%d",&n); fgets(s,sizeof s,stdin);
FILE *f = fopen("lines.txt","w"); if(!f) return 1;
for(int i=0;i<n;i++){ fgets(s,sizeof s,stdin); s[strcspn(s,"\\n")]=0; fprintf(f,"%s\\n",s);} fclose(f);
f = fopen("lines.txt","r"); if(!f) return 1; int c=0;
while(c<20 && fgets(L[c],100,f)){ L[c][strcspn(L[c],"\\n")]=0; c++; } fclose(f);
for(int i=c-1;i>=0;i--) printf("%s\\n",L[i]); return 0; }`,
    tests: T('3\nfirst\nsecond\nthird\n', '1\nonly line\n', '4\na b\nc d\ne f\ng h\n', '2\nHello, World!\nBye\n'),
  },
  {
    slug: 'file-word-frequency', title: 'Word Frequency from a File', difficulty: 'Hard',
    description: NOTE + 'Read `n` and then `n` words. Write them to `words.txt`, separated by spaces. Read the file back and count how many times each distinct word occurs (case-sensitive). Print each distinct word with its count, in order of first appearance, one `word count` pair per line.\n\nInput: `n` then `n` words.\nOutput: lines of the form `word count`.',
    constraints: ['1 <= n <= 50', 'Each word has at most 20 characters'],
    solution: `#include <stdio.h>
#include <string.h>
int main(){ int n; char w[24], u[50][24]; int cnt[50]; int k=0; scanf("%d",&n);
FILE *f = fopen("words.txt","w"); if(!f) return 1;
for(int i=0;i<n;i++){ scanf("%23s",w); fprintf(f,"%s ",w);} fclose(f);
f = fopen("words.txt","r"); if(!f) return 1;
while(fscanf(f,"%23s",w)==1){ int j; for(j=0;j<k;j++) if(strcmp(u[j],w)==0) break;
 if(j==k){ strcpy(u[k],w); cnt[k]=0; k++; } cnt[j]++; }
fclose(f); for(int i=0;i<k;i++) printf("%s %d\\n",u[i],cnt[i]); return 0; }`,
    tests: T('5\nto be or not to\n', '3\nsame same same\n', '1\nsolo\n', '6\nApple apple Apple b b c\n'),
  },
  {
    slug: 'file-update-account-records', title: 'Update Records in a Binary File', difficulty: 'Hard',
    description: NOTE + 'A bank keeps accounts numbered 1 to `n` in the binary file `accounts.bin`; record `i` is one `int` balance. Read `n` and the `n` starting balances and write them with `fwrite`. Then read `q` operations, each `id amount` (amount may be negative). For each operation open the file in `"r+b"` mode, `fseek` to record `id`, `fread` the balance, add the amount, `fseek` back and `fwrite` the new balance. At the end read the whole file and print all balances separated by single spaces.\n\nInput: `n`, `n` balances, `q`, then `q` pairs `id amount`.\nOutput: the final balances on one line.',
    constraints: ['1 <= n <= 20', '1 <= q <= 20', '1 <= id <= n', 'Balances always stay within -100000 to 100000'],
    solution: `#include <stdio.h>
int main(){ int n,q,a[20],b; scanf("%d",&n); for(int i=0;i<n;i++) scanf("%d",&a[i]);
FILE *f = fopen("accounts.bin","wb"); if(!f) return 1; fwrite(a,sizeof(int),n,f); fclose(f);
scanf("%d",&q);
f = fopen("accounts.bin","r+b"); if(!f) return 1;
while(q--){ int id,amt; scanf("%d %d",&id,&amt); long pos=(long)(id-1)*(long)sizeof(int);
 fseek(f,pos,SEEK_SET); fread(&b,sizeof(int),1,f); b+=amt;
 fseek(f,pos,SEEK_SET); fwrite(&b,sizeof(int),1,f); fflush(f); }
rewind(f); fread(a,sizeof(int),n,f); fclose(f);
for(int i=0;i<n;i++) printf(i?" %d":"%d",a[i]); printf("\\n"); return 0; }`,
    tests: T('3\n100 200 300\n2\n1 50\n3 -100\n', '2\n10 20\n3\n1 5\n1 5\n2 -30\n', '1\n0\n1\n1 999\n', '4\n1 2 3 4\n2\n4 -4\n2 10\n'),
  },
];
