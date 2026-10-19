const IN = `int r, c, a[10][10];
  scanf("%d %d", &r, &c);
  for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) scanf("%d", &a[i][j]);`;
const INN = `int n, a[10][10];
  scanf("%d", &n);
  for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) scanf("%d", &a[i][j]);`;
const PRINT = `static void show(int m[10][10], int rows, int cols) {
  for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) { if (j) printf(" "); printf("%d", m[i][j]); }
    printf("\\n");
  }
}`;
const FMT = 'The first line has `r` and `c`, followed by `r` lines with `c` integers each.';
const SQ = 'The first line has `n`, followed by `n` lines with `n` integers each.';
const C1 = ['1 <= r, c <= 10', '-100 <= matrix elements <= 100'];
const CN = ['1 <= n <= 10', '-100 <= matrix elements <= 100'];
const m = (s) => ({ input: s });
const h = (s) => ({ input: s, hidden: true });

export default [
  {
    slug: 'matrix-sum', title: 'Sum of All Matrix Elements', difficulty: 'Easy',
    description: 'A 2D array stores values in rows and columns. Visit every element with two nested loops and add them up.\n\nInput: ' + FMT + '\nOutput: One integer, the sum of all elements.',
    constraints: C1,
    solution: `#include <stdio.h>\nint main(){ ${IN}\n int s=0; for(int i=0;i<r;i++)for(int j=0;j<c;j++)s+=a[i][j]; printf("%d\\n",s); return 0; }`,
    tests: [m('2 2\n1 2\n3 4'), m('2 3\n-1 -2 -3\n4 5 6'), h('1 1\n5'), h('3 3\n1 2 3\n4 5 6\n7 8 9'), h('1 4\n-5 -5 -5 -5')],
  },
  {
    slug: 'matrix-largest-element', title: 'Largest Element in a Matrix', difficulty: 'Easy',
    description: 'Start with the first element as the largest so far, then compare it with every other element.\n\nInput: ' + FMT + '\nOutput: One integer, the largest element.',
    constraints: C1,
    solution: `#include <stdio.h>\nint main(){ ${IN}\n int mx=a[0][0]; for(int i=0;i<r;i++)for(int j=0;j<c;j++)if(a[i][j]>mx)mx=a[i][j]; printf("%d\\n",mx); return 0; }`,
    tests: [m('2 2\n1 9\n3 4'), m('2 3\n-1 -2 -3\n-4 -5 -6'), h('1 1\n-7'), h('3 1\n4\n4\n4'), h('3 3\n1 2 3\n4 5 6\n7 8 9')],
  },
  {
    slug: 'matrix-row-sums', title: 'Row Sums', difficulty: 'Easy',
    description: 'Add the elements of each row separately. Reset the running sum at the start of every row.\n\nInput: ' + FMT + '\nOutput: `r` lines, line `i` holds the sum of row `i`.',
    constraints: C1,
    solution: `#include <stdio.h>\nint main(){ ${IN}\n for(int i=0;i<r;i++){int s=0;for(int j=0;j<c;j++)s+=a[i][j];printf("%d\\n",s);} return 0; }`,
    tests: [m('2 2\n1 2\n3 4'), m('3 3\n1 2 3\n4 5 6\n7 8 9'), h('1 1\n8'), h('2 4\n-1 -1 -1 -1\n0 0 0 5')],
  },
  {
    slug: 'matrix-column-sums', title: 'Column Sums', difficulty: 'Easy',
    description: 'Add the elements of each column separately. The outer loop should go over columns.\n\nInput: ' + FMT + '\nOutput: One line with `c` integers separated by single spaces; the j-th value is the sum of column `j`.',
    constraints: C1,
    solution: `#include <stdio.h>\nint main(){ ${IN}\n for(int j=0;j<c;j++){int s=0;for(int i=0;i<r;i++)s+=a[i][j];if(j)printf(" ");printf("%d",s);} printf("\\n"); return 0; }`,
    tests: [m('2 2\n1 2\n3 4'), m('3 3\n1 2 3\n4 5 6\n7 8 9'), h('1 1\n8'), h('4 1\n1\n2\n3\n4'), h('1 3\n5 6 7')],
  },
  {
    slug: 'main-diagonal-sum', title: 'Main Diagonal Sum', difficulty: 'Easy',
    description: 'In a square matrix the main diagonal holds the elements `a[0][0]`, `a[1][1]`, ... where row index equals column index.\n\nInput: ' + SQ + '\nOutput: One integer, the sum of the main diagonal.',
    constraints: CN,
    solution: `#include <stdio.h>\nint main(){ ${INN}\n int s=0; for(int i=0;i<n;i++)s+=a[i][i]; printf("%d\\n",s); return 0; }`,
    tests: [m('2\n1 2\n3 4'), m('3\n1 2 3\n4 5 6\n7 8 9'), h('1\n-9'), h('3\n-1 0 0\n0 -1 0\n0 0 -1')],
  },
  {
    slug: 'anti-diagonal-sum', title: 'Anti-Diagonal Sum', difficulty: 'Easy',
    description: 'The anti-diagonal runs from the top-right to the bottom-left corner. Element `a[i][j]` is on it when `i + j == n - 1`.\n\nInput: ' + SQ + '\nOutput: One integer, the sum of the anti-diagonal.',
    constraints: CN,
    solution: `#include <stdio.h>\nint main(){ ${INN}\n int s=0; for(int i=0;i<n;i++)s+=a[i][n-1-i]; printf("%d\\n",s); return 0; }`,
    tests: [m('2\n1 2\n3 4'), m('3\n1 2 3\n4 5 6\n7 8 9'), h('1\n4'), h('4\n1 0 0 2\n0 3 4 0\n0 5 6 0\n7 0 0 8')],
  },
  {
    slug: 'matrix-addition', title: 'Add Two Matrices', difficulty: 'Easy',
    description: 'Add two matrices of the same size by adding the elements in the same position.\n\nInput: The first line has `r` and `c`. Then come `r` lines for matrix A, then `r` lines for matrix B, each with `c` integers.\nOutput: The resulting matrix, one row per line, values separated by single spaces.',
    constraints: ['1 <= r, c <= 10', '-100 <= elements <= 100'],
    solution: `#include <stdio.h>\nint main(){ int r,c,a[10][10],b[10][10]; scanf("%d %d",&r,&c);\n for(int i=0;i<r;i++)for(int j=0;j<c;j++)scanf("%d",&a[i][j]);\n for(int i=0;i<r;i++)for(int j=0;j<c;j++){scanf("%d",&b[i][j]);a[i][j]+=b[i][j];}\n for(int i=0;i<r;i++){for(int j=0;j<c;j++){if(j)printf(" ");printf("%d",a[i][j]);}printf("\\n");} return 0; }`,
    tests: [m('2 2\n1 2\n3 4\n5 6\n7 8'), m('1 3\n1 2 3\n-1 -2 -3'), h('1 1\n4\n5'), h('3 2\n1 1\n2 2\n3 3\n0 0\n0 0\n0 0')],
  },
  {
    slug: 'matrix-transpose', title: 'Transpose of a Matrix', difficulty: 'Easy',
    description: 'The transpose swaps rows and columns: element `a[i][j]` becomes element `[j][i]` of a matrix with `c` rows and `r` columns.\n\nInput: ' + FMT + '\nOutput: The transposed matrix with `c` lines, each holding `r` integers separated by single spaces.',
    constraints: C1,
    solution: `#include <stdio.h>\nint main(){ ${IN}\n for(int j=0;j<c;j++){for(int i=0;i<r;i++){if(i)printf(" ");printf("%d",a[i][j]);}printf("\\n");} return 0; }`,
    tests: [m('2 3\n1 2 3\n4 5 6'), m('2 2\n1 2\n3 4'), h('1 1\n9'), h('1 4\n1 2 3 4'), h('3 1\n1\n2\n3')],
  },
  {
    slug: 'search-in-matrix', title: 'Search an Element in a Matrix', difficulty: 'Easy',
    description: 'Check every element and see whether it equals the target value.\n\nInput: ' + FMT + ' The last line has the target integer `x`.\nOutput: Print `Found` if `x` appears in the matrix, otherwise `Not Found`.',
    constraints: [...C1, '-100 <= x <= 100'],
    solution: `#include <stdio.h>\nint main(){ ${IN}\n int x,f=0; scanf("%d",&x); for(int i=0;i<r;i++)for(int j=0;j<c;j++)if(a[i][j]==x)f=1; puts(f?"Found":"Not Found"); return 0; }`,
    tests: [m('2 2\n1 2\n3 4\n3'), m('2 2\n1 2\n3 4\n9'), h('1 1\n5\n5'), h('1 1\n5\n-5'), h('2 3\n1 1 1\n1 1 1\n1')],
  },
  {
    slug: 'upper-triangle-sum', title: 'Sum Above the Main Diagonal', difficulty: 'Easy',
    description: 'In a square matrix, the elements above the main diagonal are those where the column index is greater than the row index (`j > i`).\n\nInput: ' + SQ + '\nOutput: One integer, the sum of all elements strictly above the main diagonal.',
    constraints: CN,
    solution: `#include <stdio.h>\nint main(){ ${INN}\n int s=0; for(int i=0;i<n;i++)for(int j=i+1;j<n;j++)s+=a[i][j]; printf("%d\\n",s); return 0; }`,
    tests: [m('3\n1 2 3\n4 5 6\n7 8 9'), m('2\n1 2\n3 4'), h('1\n7'), h('4\n1 1 1 1\n1 1 1 1\n1 1 1 1\n1 1 1 1')],
  },
  {
    slug: 'symmetric-matrix-check', title: 'Symmetric Matrix', difficulty: 'Medium',
    description: 'A square matrix is symmetric if it equals its own transpose, i.e. `a[i][j] == a[j][i]` for all `i` and `j`.\n\nInput: ' + SQ + '\nOutput: Print `Symmetric` or `Not Symmetric`.',
    constraints: CN,
    solution: `#include <stdio.h>\nint main(){ ${INN}\n int ok=1; for(int i=0;i<n;i++)for(int j=0;j<n;j++)if(a[i][j]!=a[j][i])ok=0; puts(ok?"Symmetric":"Not Symmetric"); return 0; }`,
    tests: [m('3\n1 2 3\n2 4 5\n3 5 6'), m('2\n1 2\n3 4'), h('1\n5'), h('3\n1 0 0\n0 1 0\n0 0 1'), h('3\n1 2 3\n2 4 5\n3 6 6')],
  },
  {
    slug: 'identity-matrix-check', title: 'Identity Matrix', difficulty: 'Medium',
    description: 'An identity matrix is square, has 1 on the main diagonal and 0 everywhere else.\n\nInput: ' + SQ + '\nOutput: Print `Identity` or `Not Identity`.',
    constraints: CN,
    solution: `#include <stdio.h>\nint main(){ ${INN}\n int ok=1; for(int i=0;i<n;i++)for(int j=0;j<n;j++)if(a[i][j]!=(i==j))ok=0; puts(ok?"Identity":"Not Identity"); return 0; }`,
    tests: [m('3\n1 0 0\n0 1 0\n0 0 1'), m('2\n1 0\n1 1'), h('1\n1'), h('1\n0'), h('2\n1 0\n0 2')],
  },
  {
    slug: 'matrix-multiplication', title: 'Multiply Two Matrices', difficulty: 'Medium',
    description: 'To multiply A (`r1 x c1`) by B (`c1 x c2`), each result element `[i][j]` is the sum of `A[i][k] * B[k][j]` over all `k`.\n\nInput: The first line has `r1 c1 c2`. Then come `r1` lines for A (each with `c1` integers) and `c1` lines for B (each with `c2` integers).\nOutput: The `r1 x c2` product matrix, one row per line, values separated by single spaces.',
    constraints: ['1 <= r1, c1, c2 <= 10', '-20 <= elements <= 20'],
    solution: `#include <stdio.h>\nint main(){ int r,k,c,a[10][10],b[10][10]; scanf("%d %d %d",&r,&k,&c);\n for(int i=0;i<r;i++)for(int j=0;j<k;j++)scanf("%d",&a[i][j]);\n for(int i=0;i<k;i++)for(int j=0;j<c;j++)scanf("%d",&b[i][j]);\n for(int i=0;i<r;i++){for(int j=0;j<c;j++){int s=0;for(int t=0;t<k;t++)s+=a[i][t]*b[t][j];if(j)printf(" ");printf("%d",s);}printf("\\n");} return 0; }`,
    tests: [m('2 2 2\n1 2\n3 4\n5 6\n7 8'), m('2 3 1\n1 2 3\n4 5 6\n1\n0\n-1'), h('1 1 1\n3\n4'), h('1 3 3\n1 1 1\n1 0 0\n0 1 0\n0 0 1'), h('3 1 3\n1\n2\n3\n1 2 3')],
  },
  {
    slug: 'rotate-matrix-clockwise', title: 'Rotate Matrix 90 Degrees Clockwise', difficulty: 'Medium',
    description: 'Rotating clockwise turns the first column (read bottom to top) into the first row. The result has `c` rows and `r` columns. Hint: new[j][r-1-i] = old[i][j].\n\nInput: ' + FMT + '\nOutput: The rotated matrix, one row per line, values separated by single spaces.',
    constraints: C1,
    solution: `#include <stdio.h>\n${PRINT}\nint main(){ ${IN}\n int b[10][10]; for(int i=0;i<r;i++)for(int j=0;j<c;j++)b[j][r-1-i]=a[i][j]; show(b,c,r); return 0; }`,
    tests: [m('2 2\n1 2\n3 4'), m('2 3\n1 2 3\n4 5 6'), h('1 1\n7'), h('1 4\n1 2 3 4'), h('3 3\n1 2 3\n4 5 6\n7 8 9')],
  },
  {
    slug: 'matrix-boundary-sum', title: 'Sum of Boundary Elements', difficulty: 'Medium',
    description: 'Boundary elements lie in the first row, last row, first column or last column. Make sure no element is counted twice (corners belong to two edges, and a 1-row or 1-column matrix is entirely boundary).\n\nInput: ' + FMT + '\nOutput: One integer, the sum of boundary elements.',
    constraints: C1,
    solution: `#include <stdio.h>\nint main(){ ${IN}\n int s=0; for(int i=0;i<r;i++)for(int j=0;j<c;j++)if(i==0||j==0||i==r-1||j==c-1)s+=a[i][j]; printf("%d\\n",s); return 0; }`,
    tests: [m('3 3\n1 2 3\n4 5 6\n7 8 9'), m('2 2\n1 2\n3 4'), h('1 1\n5'), h('1 4\n1 2 3 4'), h('4 3\n1 1 1\n1 9 1\n1 9 1\n1 1 1')],
  },
  {
    slug: 'row-with-maximum-sum', title: 'Row with the Maximum Sum', difficulty: 'Medium',
    description: 'Compute the sum of every row and find which row has the largest sum. If several rows tie, choose the smallest index. Rows are numbered from 0.\n\nInput: ' + FMT + '\nOutput: Two integers on one line: the row index and its sum, separated by a space.',
    constraints: C1,
    solution: `#include <stdio.h>\nint main(){ ${IN}\n int best=-1,bi=0; for(int i=0;i<r;i++){int s=0;for(int j=0;j<c;j++)s+=a[i][j]; if(best==-1||s>best){best=s;bi=i;}} printf("%d %d\\n",bi,best); return 0; }`,
    tests: [m('2 2\n1 2\n3 4'), m('3 2\n5 5\n1 1\n10 0'), h('1 1\n-3'), h('3 3\n-1 -2 -3\n-1 -1 -1\n-5 0 0')],
  },
  {
    slug: 'matrix-saddle-point', title: 'Saddle Point', difficulty: 'Medium',
    description: 'A saddle point is an element that is the smallest in its row and also the largest in its column. Scan rows from top to bottom, left to right, and report the first saddle point.\n\nInput: ' + FMT + '\nOutput: The value of the first saddle point, or `None` if there is no saddle point.',
    constraints: C1,
    solution: `#include <stdio.h>\nint main(){ ${IN}\n for(int i=0;i<r;i++)for(int j=0;j<c;j++){int ok=1;for(int k=0;k<c;k++)if(a[i][k]<a[i][j])ok=0;for(int k=0;k<r;k++)if(a[k][j]>a[i][j])ok=0;if(ok){printf("%d\\n",a[i][j]);return 0;}} puts("None"); return 0; }`,
    tests: [m('3 3\n1 2 3\n4 5 6\n7 8 9'), m('2 2\n1 2\n2 1'), h('1 1\n4'), h('3 3\n9 8 7\n6 5 4\n3 2 1'), h('2 3\n3 1 2\n1 4 3')],
  },
  {
    slug: 'spiral-order-traversal', title: 'Spiral Order Traversal', difficulty: 'Hard',
    description: 'Print the elements in spiral order: left to right along the top row, down the right column, right to left along the bottom row, up the left column, then repeat inside the remaining layer. Hint: keep four boundaries (top, bottom, left, right) and shrink them after each side.\n\nInput: ' + FMT + '\nOutput: One line with all `r*c` elements in spiral order, separated by single spaces.',
    constraints: C1,
    solution: `#include <stdio.h>\nint main(){ ${IN}\n int t=0,b=r-1,l=0,rt=c-1,first=1;\n while(t<=b&&l<=rt){\n  for(int j=l;j<=rt;j++){if(!first)printf(" ");first=0;printf("%d",a[t][j]);} t++;\n  for(int i=t;i<=b;i++){printf(" %d",a[i][rt]);} rt--;\n  if(t<=b){for(int j=rt;j>=l;j--)printf(" %d",a[b][j]);b--;}\n  if(l<=rt){for(int i=b;i>=t;i--)printf(" %d",a[i][l]);l++;}\n }\n printf("\\n"); return 0; }`,
    tests: [m('3 3\n1 2 3\n4 5 6\n7 8 9'), m('2 3\n1 2 3\n4 5 6'), h('1 1\n5'), h('1 4\n1 2 3 4'), h('4 1\n1\n2\n3\n4'), h('3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12')],
  },
  {
    slug: 'generate-spiral-matrix', title: 'Generate a Spiral Matrix', difficulty: 'Hard',
    description: 'Fill an `n x n` matrix with the numbers 1 to `n*n` in spiral order: start at the top-left corner, go right, then down, then left, then up, turning whenever you hit the edge or a filled cell, and keep spiralling inward.\n\nInput: One integer `n`.\nOutput: The matrix, one row per line, values separated by single spaces.',
    constraints: ['1 <= n <= 10'],
    solution: `#include <stdio.h>\n${PRINT}\nint main(){ int n,a[10][10]={{0}}; scanf("%d",&n); int dr[4]={0,1,0,-1},dc[4]={1,0,-1,0},d=0,i=0,j=0;\n for(int v=1;v<=n*n;v++){a[i][j]=v;int ni=i+dr[d],nj=j+dc[d]; if(ni<0||nj<0||ni>=n||nj>=n||a[ni][nj]){d=(d+1)%4;ni=i+dr[d];nj=j+dc[d];} i=ni;j=nj;}\n show(a,n,n); return 0; }`,
    tests: [m('3'), m('4'), h('1'), h('2'), h('5')],
  },
  {
    slug: 'matrix-determinant', title: 'Determinant of a Square Matrix', difficulty: 'Hard',
    description: 'The determinant of a 1x1 matrix is its only element. For a larger matrix, expand along the first row: the sum over columns `j` of `(-1)^j * a[0][j] * det(minor)`, where the minor is the matrix without row 0 and column `j`. A recursive function works well.\n\nInput: ' + SQ + '\nOutput: One integer, the determinant.',
    constraints: ['1 <= n <= 5', '-5 <= matrix elements <= 5'],
    solution: `#include <stdio.h>\nlong long det(int m[5][5], int n){ if(n==1)return m[0][0]; long long s=0;\n for(int col=0;col<n;col++){int sub[5][5];for(int i=1;i<n;i++){int k=0;for(int j=0;j<n;j++){if(j==col)continue;sub[i-1][k++]=m[i][j];}} long long d=det(sub,n-1); s+=(col%2?-1:1)*(long long)m[0][col]*d;} return s; }\nint main(){ int n,a[5][5]; scanf("%d",&n); for(int i=0;i<n;i++)for(int j=0;j<n;j++)scanf("%d",&a[i][j]); printf("%lld\\n",det(a,n)); return 0; }`,
    tests: [m('2\n1 2\n3 4'), m('3\n2 0 1\n1 3 2\n1 1 1'), h('1\n-4'), h('3\n1 2 3\n4 5 6\n7 8 9'), h('4\n1 0 0 0\n0 2 0 0\n0 0 3 0\n0 0 0 4'), h('5\n1 2 3 4 5\n0 1 2 3 4\n0 0 1 2 3\n0 0 0 1 2\n0 0 0 0 1')],
  },
];
